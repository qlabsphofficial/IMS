from rest_framework import serializers
from .models import Item, Transaction, SpoiledMaterialReport, Notification

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            'id',
            'item_name',
            'commissary_stock',
            'cafe_stock',
            'um',
            'category',
            'par_stock'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    transacted_item = ItemSerializer()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'transacted_item',
            'transacted_amount',
            'transactor',
            'date_created',
            'date_changed',
            'admin_approval',
            'approval'
        ]


class SpoiledMaterialReportSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = SpoiledMaterialReport
        fields = [
            'id',
            'item',
            'spoil_amount',
            'report_creator',
            'date_created'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'notif_owner',
            'text',
            'date',
            'is_read'
        ]