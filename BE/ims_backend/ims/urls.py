from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login'),

    # ITEM ENDPOINTS
    path('all_items', views.retrieve_all_items, name='retrieve_items'),
    path('retrieve_item/<int:item_id>', views.retrieve_item, name='retrieve_item'),
    path('create_item', views.create_item, name='create_item'),
    path('search_items', views.search_items, name='search_items'),
    path('update_item/<int:item_id>', views.update_item, name='update_item'),
    path('update_cafe_item/<int:item_id>', views.update_cafe_item, name='update_cafe_item'),
    

    path('update_item_um/<int:item_id>', views.update_item_um, name='update_item_um'),
    path('update_item_um_amount/<int:item_id>', views.update_item_um_amount, name='update_item_um_amount'),
    path('update_item_category/<int:item_id>', views.update_item_category, name='update_item_category'),
    path('update_item_par_stock/<int:item_id>/', views.update_item_par_stock, name='update_item_par_stock'),

    path('delete_item/<int:item_id>', views.delete_item, name='delete_item'),
    path('request_item/<int:item_id>', views.request_item, name='request_item'),
    path('retrieve_cafe_critical', views.retrieve_cafe_critical, name='retrieve_cafe_critical'),
    path('retrieve_commissary_critical', views.retrieve_commissary_critical, name='retrieve_commissary_critical'),

    # TRANSACTION ENDPOINTS
    path('all_transactions', views.retrieve_all_transactions, name='retrieve_transactions'),
    path('retrieve_transaction/<int:transaction_id>', views.retrieve_transaction, name='retrieve_transaction'),
    path('update_transaction/<int:transaction_id>', views.update_transaction, name='update_transaction'),
    path('delete_transaction/<int:transaction_id>', views.delete_transaction, name='delete_transaction'),
    path('substitute_approval/<int:transaction_id>', views.substitute_approval, name='substitute_approval'),
    path('process_transaction/<int:transaction_id>', views.process_transaction, name='process_transaction'),
    path('retrieve_transaction_summary', views.retrieve_transaction_summary, name='retrieve_transaction_summary'),
    path('search_transfer_requests', views.search_transfer_requests, name='search_transfer_requests'),

    # SPOILAGE ENDPOINTS
    path('retrieve_spoilage_reports', views.retrieve_spoilage_reports, name='retrieve_spoilage_reports'),
    path('retrieve_spoilage_report_summary', views.retrieve_spoilage_report_summary, name='retrieve_spoilage_report_summary'),
    path('report_spoiled/<int:item_id>', views.report_spoiled, name='report_spoiled'),
    path('search_spoilage_reports', views.search_spoilage_reports, name='search_spoilage_reports'),

    # NOTIFICATION ENDPOINTS
    path('retrieve_notifications/<str:username>', views.retrieve_notifications, name='retrieve_notifications'),
    path('set_notifs_as_seen/<str:username>', views.set_notifs_as_seen, name='set_notifs_as_seen')
]