from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Item, Transaction, SpoiledMaterialReport, Notification
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils import timezone
from .serializers import ItemSerializer, TransactionSerializer, SpoiledMaterialReportSerializer, NotificationSerializer
from datetime import datetime
from openpyxl import Workbook


# Create your views here.
def index(request):
    return HttpResponse('Test works...')


# LOGIN ENDPOINTS
@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username)

            if user is not None:
                if user.check_password(password):
                    return Response({'response': 'Login successful', 'user_data': user.username })
                else:
                    return Response({'response': 'Invalid credentials'}, status=401)
            else:
                return Response({'response': 'Invalid credentials'}, status=401)
        except:
            return Response({'response': 'Invalid credentials'}, status=401)
        

# ITEMS ENDPOINTS
@api_view(['GET'])
def retrieve_all_items(request):
    if request.method == 'GET':
        all_items = Item.objects.all()
        serialize_items = ItemSerializer(all_items, many=True)

        return Response({'items': serialize_items.data}, 200)


@api_view(['GET'])
def retrieve_item(request, item_id):
    if request.method == 'GET':
        item = Item.objects.filter(id=item_id)
        serialize_item = ItemSerializer(item, many=False)

        return Response({'item': serialize_item.data}, 200)


@api_view(['POST'])
def search_items(request):
    if request.method == 'POST':
        search = request.data.get('search')

        items = Item.objects.filter(item_name__icontains=f'{search}')
        serialize_items = ItemSerializer(items, many=True)

        return Response({'items': serialize_items.data}, 200)


@api_view(['POST'])
def create_item(request):
    item_name = request.data.get('item_name')
    commissary_stock = request.data.get('commissary_stock')
    category = request.data.get('category')
    um = request.data.get('um')

    # try:
    item = Item.objects.filter(item_name=item_name).first()

    if item is None:
        new_item = Item(
            item_name=item_name,
            commissary_stock=commissary_stock,
            cafe_stock=0,
            category=category,
            um=um
        )

        new_item.save()
        return Response({'response': 'Item Created'}, 200)
    
    else:
        return Response({'response': 'Item Already Exists'}, 200)
        
    # except Exception as e:
    #     return Response({'response': 'Failed to Create Item'}, 400)

    
#Commissary Update Item
@api_view(['POST'])
def update_item(request, item_id):
    stock_update = float(request.data.get('stock_update'))

    try:
        item = Item.objects.get(id=item_id)
        item.commissary_stock = stock_update
        item.save()

        if item.commissary_stock <= item.par_stock:
            commissary = User.objects.get(username='Commissary')
            notification = Notification.objects.create(
                notif_owner=commissary,
                text=f'The stock of {item.item_name} has reached CRITICAL status.'
            )
            notification.save()

        return Response({'response': 'Item Updated'}, 200)
    except:
        return Response({'response': 'Failed to Update Item'}, 200)

#Cafe Update Item
@api_view(['POST'])
def update_cafe_item(request, item_id):
    stock_update = float(request.data.get('stock_update'))

    try:
        item = Item.objects.get(id=item_id)
        
        if stock_update <= item.cafe_stock:
            item.cafe_stock = stock_update
            item.save()
        else:
            return Response({'response': 'Transaction Invalid'}, 403)
        
        if item.cafe_stock <= item.par_stock:
            cafe = User.objects.get(username='Cafe')
            intern = User.objects.get(username='Intern')
            
            cafe_notif = Notification(
                notif_owner=cafe,
                text=f'The stock of {item.item_name} has reached CRITICAL status.'
            )
            
            intern_notif = Notification(
                notif_owner=intern,
                text=f'The stock of {item.item_name} has reached CRITICAL status.'
            )

            cafe_notif.save()
            intern_notif.save()

        return Response({'response': 'Item Updated'}, 200)
    except:
        return Response({'response': 'Failed to Update Item'}, 200)
    

@api_view(['POST'])
def update_item_um(request, item_id):
    new_um = request.data.get('data')

    try:
        item = Item.objects.get(id=item_id)
        item.um = new_um

        item.save()
        return Response({'response': 'UM updated.', 'status_code': 200})
    except:
        return Response({'response': 'Item does not exist.', 'status_code': 400})
    

@api_view(['POST'])
def update_item_um_amount(request, item_id):
    new_um_amount = float(request.data.get('data'))
    print(new_um_amount)

    # try:
    item = Item.objects.get(id=item_id)
    item.um_amount = new_um_amount

    item.save()
    return Response({'response': 'UM amount updated.', 'status_code': 200})
    # except:
    #     return Response({'response': 'Item does not exist.', 'status_code': 400})
    

@api_view(['POST'])
def update_item_category(request, item_id):
    category = request.data.get('data')

    try:
        item = Item.objects.get(id=item_id)
        print(item)
        item.category = category

        item.save()
        return Response({'response': 'Item category updated.', 'status_code': 200})
    except:
        return Response({'response': 'Item does not exist.', 'status_code': 400})
    


@api_view(['POST'])
def request_item(request, item_id):
    request_quantity = float(request.data.get('request_quantity'))
    transactor = request.data.get('transactor')

    try:
        requested_id = Item.objects.get(id=item_id)

        if transactor == 'Cafe':
            new_transaction = Transaction(
                transacted_item= requested_id,
                transacted_amount= request_quantity,
                transactor= transactor,
                admin_approval=True
            )
        else:
            new_transaction = Transaction(
                transacted_item= requested_id,
                transacted_amount= request_quantity,
                transactor= transactor
            )

        new_transaction.save()
        
        commissary = User.objects.get(username='Commissary')
        new_notification = Notification(
            notif_owner=commissary,
            text=f'{transactor} has requested the transfer of {request_quantity}{requested_id.um} worth of {requested_id.item_name}'
        )
        
        new_notification.save()
        
        if transactor == 'Intern':
            cafe = User.objects.get(username='Cafe')
            cafe_notification = Notification(
                notif_owner=cafe,
                text=f'{transactor} has requested the transfer of {request_quantity}{requested_id.um} worth of {requested_id.item_name}'
            )
        
            cafe_notification.save()
        
        return Response({'response': 'Request Made.'}, 200)
    except:
        return Response({'response': 'Failed to Create Item Request'}, 200)


@api_view(['POST'])
def delete_item(request, item_id):
    try:
        item = Item.objects.get(id=item_id)
        item.delete()

        return Response({'response': 'Item Deleted'}, 200)
    except:
        return Response({'response': 'Failed to Delete Item'}, 200)
    

# TRANSACTIONS ENDPOINTS
@api_view(['GET'])
def retrieve_all_transactions(request):
    if request.method == 'GET':
        all_transactions = Transaction.objects.all()
        serialize_transactions = TransactionSerializer(all_transactions, many=True)

        return Response({'transactions': serialize_transactions.data}, 200)
    

@api_view(['POST'])
def search_transfer_requests(request):
    if request.method == 'POST':
        search = request.data.get('search')

        transactions = Transaction.objects.filter(approval__icontains=f'{search}')
        serialize_transactions = TransactionSerializer(transactions, many=True)

        return Response({'transactions': serialize_transactions.data}, 200)
    

@api_view(['GET'])
def retrieve_transaction(request, transaction_id):
    if request.method == 'GET':
        transaction = Transaction.objects.filter(id=transaction_id)
        serialize_transaction = TransactionSerializer(transaction, many=False)

        return Response({'transaction': serialize_transaction.data}, 200)


@api_view(['POST'])
def create_transaction(request):
    transacted_item = request.POST.get('transacted_item')
    transacted_amount = request.POST.get('transacted_amount')
    transactor = request.POST.get('transactor')
    date_created = request.POST.get('date_created')
    date_changed = request.POST.get('date_changed')

    try:
        new_transaction = Transaction(
            transacted_item = transacted_item,
            transacted_amount = transacted_amount,
            transactor = transactor,
            date_created = date_created,
            date_changed = date_changed
        )
        new_transaction.save()

        return Response({'response': 'Transaction Created'}, 200)
    except:
        return Response({'response': 'Failed to Create Item'}, 200)
    

@api_view(['POST'])
def update_transaction(request, transaction_id):
    transacted_amount = request.data.get('transacted_amount')

    # try:
    transaction = Transaction.objects.get(id=transaction_id)
    transaction.transacted_amount = transacted_amount
    transaction.save()

    return Response({'response': 'Transaction Updated'}, 200)
    # except:
    #     return Response({'response': 'Failed to Update Transaction'}, 200)
    

@api_view(['DELETE'])
def delete_transaction(request, transaction_id):
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        transaction.delete()

        return Response({'response': 'Transaction Deleted'}, 200)
    except:
        return Response({'response': 'Failed to Delete Transaction'}, 200)
    

@api_view(['POST'])
def substitute_approval(request, transaction_id):
    action = request.data.get('action')
    retrieved_transaction = Transaction.objects.get(id=transaction_id)

    if action == 'Approved':
        retrieved_transaction.admin_approval = True
        message = f'Request to transfer {retrieved_transaction.transacted_item.item_name} * {retrieved_transaction.transacted_amount} Approved by Cafe'
    else:
        retrieved_transaction.approval = 'Denied'
        retrieved_transaction.admin_approval = False
        message = f'Request to transfer {retrieved_transaction.transacted_item.item_name} * {retrieved_transaction.transacted_amount} Denied by Cafe'
    
    retrieved_transaction.save()

    intern = User.objects.get(username='Intern')
    new_notification = Notification(
        notif_owner=intern,
        text=message
    )
    new_notification.save()

    return Response({ 'response': 'Intern Request Processed.', 'status_code': 200 })


@api_view(['POST'])
def process_transaction(request, transaction_id):
    try:
        action = request.data.get('action')

        retrieved_transaction = Transaction.objects.get(id=transaction_id)
        item = Item.objects.get(id=retrieved_transaction.transacted_item.id)
        
        # HANDLE INTERN REQUEST
        if retrieved_transaction.transactor == 'Intern':
            if retrieved_transaction.admin_approval:

                if action == 'Approved':
                    if item.commissary_stock >= retrieved_transaction.transacted_amount:
                        item.commissary_stock -= retrieved_transaction.transacted_amount
                        item.cafe_stock += retrieved_transaction.transacted_amount
                    
                        retrieved_transaction.approval = 'Approved'
                        message = f"""
                            Approved {retrieved_transaction.transactor}'s request to transfer item: 
                            {item.item_name} * {retrieved_transaction.transacted_amount}
                        """

                        if item.commissary_stock <= item.par_stock:
                            commissary = User.objects.get(username='Commissary')
                            
                            critical_stock_notif = Notification(
                                notif_owner=commissary,
                                text=f'Stock for {item.item_name} has reached CRITICAL status.'
                            )
                            critical_stock_notif.save()
                    else:
                        return Response({'response': 'Request Failed. Stock Insufficient'}, 400)
                    
                elif action == 'Denied':
                        retrieved_transaction.approval = 'Denied'
                        message = f"""
                            Denied {retrieved_transaction.transactor}'s request to transfer item: 
                            {item.item_name} * {retrieved_transaction.transacted_amount}
                        """

                retrieved_transaction.save()
                item.save()

                # NOTIFY INTERN
                intern_account = User.objects.get(username='Intern')
                new_notification = Notification(
                    notif_owner=intern_account,
                    text=message
                )
                new_notification.save()

                return Response({'response': message, 'date_changed': retrieved_transaction.date_changed }, 200)
            else:
                return Response({'response': 'Transaction was not approved by the Administrator.'}, 400)
            
        else:
            if action == 'Approved':
                if item.commissary_stock >= retrieved_transaction.transacted_amount:
                    item.commissary_stock -= retrieved_transaction.transacted_amount
                    item.cafe_stock += retrieved_transaction.transacted_amount
                    
                    
                    retrieved_transaction.approval = 'Approved'
                    message = f"""
                        Approved {retrieved_transaction.transactor}'s request to transfer item: 
                        {item.item_name} * {retrieved_transaction.transacted_amount}
                    """

                    if item.commissary_stock <= item.par_stock:
                        commissary = User.objects.get(username='Commissary')
                        
                        critical_stock_notif = Notification(
                            notif_owner=commissary,
                            text=f'Stock for {item.item_name} has reached CRITICAL status.'
                        )
                        critical_stock_notif.save()
                else:
                    return Response({'response': 'Request Failed. Stock Insufficient'}, 400)
            
            elif action == 'Denied':
                retrieved_transaction.approval = 'Denied'
                message = f"""
                    Denied {retrieved_transaction.transactor}'s request to transfer item: 
                    {item.item_name} * {retrieved_transaction.transacted_amount}
                """

            retrieved_transaction.save()
            item.save()

            # NOTIFY CAFE
            cafe_account = User.objects.get(username='Cafe')
            new_notification = Notification(
                notif_owner=cafe_account,
                text=message
            )
            new_notification.save()
            return Response({'response': message, 'date_changed': retrieved_transaction.date_changed }, 200)
    except:
        return Response({'response': 'Failed to Process Item Request'}, 200)
    

@api_view(['POST'])
def retrieve_transaction_summary(request):
    if request.method == 'POST':
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        except ValueError:
            return Response({'response': 'Invalid date format. Please use YYYY-MM-DD.'}, status=400)

        transactions = Transaction.objects.filter(date_created__range=[start_date, end_date])

        wb = Workbook()
        ws = wb.active
        ws.append(['Item', 'Amount', 'Transaction Status', 'Transactor', 'Date Transacted'])

        for transaction in transactions:
            print(transaction)
            print(transaction.transacted_amount)
            print(transaction.approval)
            print(transaction.transactor)
            print(transaction.date_created)

            date_created = transaction.date_created.strftime('%Y-%m-%d %H:%M:%S')
            ws.append([transaction.transacted_item.item_name, transaction.transacted_amount, transaction.approval, transaction.transactor, date_created])

        excel_filename = f'transactions.xlsx'
        wb.save(excel_filename)

        with open(excel_filename, 'rb') as excel_file:
            response = HttpResponse(excel_file.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename={excel_filename}'
            return response


# SPOILAGE REPORTS ENDPOINTS
@api_view(['GET'])
def retrieve_spoilage_reports(request):
    if request.method == 'GET':
        spoilage_reports = SpoiledMaterialReport.objects.all()
        serialize_spoilage_reports = SpoiledMaterialReportSerializer(spoilage_reports, many=True)

        return Response({'spoilage_reports': serialize_spoilage_reports.data}, 200)
    
    
@api_view(['GET'])
def retrieve_spoilage_report_summary(request):
    spoiled_material_reports = SpoiledMaterialReport.objects.all()

    wb = Workbook()
    ws = wb.active
    ws.append(['Item', 'Item UM', 'Amount', 'Spoil Report Creator', 'Date Reported'])

    for spoiled_material_report in spoiled_material_reports:
        print(spoiled_material_report.item.item_name)
        print(spoiled_material_report.spoil_amount)
        print(spoiled_material_report.report_creator)
        print(spoiled_material_report.date_created)

        date_created = spoiled_material_report.date_created.strftime('%Y-%m-%d %H:%M:%S')
        ws.append([
            spoiled_material_report.item.item_name, 
            spoiled_material_report.item.um, 
            spoiled_material_report.spoil_amount, 
            spoiled_material_report.report_creator, 
            date_created
        ])

    excel_filename = f'spoil_reports.xlsx'
    wb.save(excel_filename)

    with open(excel_filename, 'rb') as excel_file:
        response = HttpResponse(excel_file.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={excel_filename}'
        return response


@api_view(['POST'])
def report_spoiled(request, item_id):
    spoil_amount = float(request.data.get('spoil_amount'))
    report_creator = request.data.get('report_creator')

    try:
        spoiled_item = Item.objects.get(id=item_id)

        if spoil_amount <= spoiled_item.cafe_stock:
            new_spoil_report = SpoiledMaterialReport(
                item=spoiled_item,
                spoil_amount=spoil_amount,
                report_creator=report_creator
            )
            new_spoil_report.save()

            spoiled_item.cafe_stock -= spoil_amount
            spoiled_item.save()

            if spoiled_item.cafe_stock <= spoiled_item.par_stock:
                # Create critical notifications for Cafe and Intern entities
                cafe = User.objects.get(username='Cafe')
                intern = User.objects.get(username='Intern')

                cafe_notification = Notification.objects.create(
                    notif_owner=cafe,
                    text=f'The stock of {spoiled_item.item_name} has reached CRITICAL status after a spoilage report by {report_creator}.'
                )
                intern_notification = Notification.objects.create(
                    notif_owner=intern,
                    text=f'The stock of {spoiled_item.item_name} has reached CRITICAL status after a spoilage report by {report_creator}.'
                )

                cafe_notification.save()
                intern_notification.save()


            return Response({'response': 'Spoil Report Created'}, 200)
        else:
            return Response({'response': 'Invalid Spoil Report'}, 200)
    except:
        return Response({'response': 'Failed to Create Spoil Report'}, 200)
    

@api_view(['POST'])
def search_spoilage_reports(request):
    if request.method == 'POST':
        search = request.data.get('search')

        reports = SpoiledMaterialReport.objects.filter(item__item_name__icontains=f'{search}')
        serialize_reports = SpoiledMaterialReportSerializer(reports, many=True)

        return Response({'reports': serialize_reports.data}, 200)
    

#PAR STOCK UPDATE
@api_view(['PUT'])
def update_item_par_stock(request, item_id):
    try:
        item = Item.objects.get(pk=item_id)
        new_par_stock = request.data.get('par_stock')
        item.par_stock = new_par_stock
        item.save()
        return Response({'response': 'Par Stock Updated'})
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# STOCK TRANSFER ANALYSIS ENDPOINTS
@api_view(['GET'])
def retrieve_cafe_critical(request):
    items = Item.objects.all()

    critical_items = []

    for item in items:
        if item.cafe_stock < item.par_stock:
            critical_items.append(item)

    serializer = ItemSerializer(critical_items, many=True)

    return Response({'items': serializer.data, 'response': 'Critical Cafe Stock Retrieved'})

@api_view(['GET'])
def retrieve_commissary_critical(request):
    items = Item.objects.all()

    critical_items = []

    for item in items:
        if item.commissary_stock < item.par_stock:
            critical_items.append(item)

    serializer = ItemSerializer(critical_items, many=True)

    return Response({'items': serializer.data, 'response': 'Critical Commissary Stock Retrieved'})


# NOTIFICATION ENDPOINTS 
@api_view(['GET'])
def retrieve_notifications(request, username):
    try:
        owner = User.objects.get(username=username)
        notifications = Notification.objects.filter(notif_owner=owner).order_by('-date')[:30]
        
        new_notifs_count = 0
        for notif in notifications:
            if notif.is_read == False:
                new_notifs_count += 1

        serializer = NotificationSerializer(notifications, many=True)
        return Response({'notifications': serializer.data, 'response': 'Notifications Retrieved', 'new_notifs': new_notifs_count})
    except:
        return Response({'response': 'User not found.'})
    
    
@api_view(['GET'])
def set_notifs_as_seen(request, username):
    try:
        owner = User.objects.get(username=username)
        notifications = Notification.objects.filter(notif_owner=owner).order_by('-date')[:30]
        
        for notif in notifications:
            notif.is_read = True
            notif.save()

        return Response({'response': 'Notifications Marked Seen'})
    except:
        return Response({'response': 'User not found.'})