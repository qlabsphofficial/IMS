from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.
class Item(models.Model):
    item_name = models.CharField(max_length=64)
    commissary_stock = models.FloatField()
    cafe_stock = models.FloatField(default=0)
    um = models.CharField(max_length=16)
    category = models.CharField(max_length=64)
    par_stock = models.FloatField(default=0)

    def __str__(self):
        return f'{self.item_name}'
    


class Transaction(models.Model):
    transacted_item = models.ForeignKey(Item, on_delete=models.CASCADE)
    transacted_amount = models.FloatField()
    transactor = models.CharField(max_length=64)
    date_created = models.DateTimeField(default=timezone.now, editable=False)
    date_changed = models.DateTimeField(default=timezone.now)
    admin_approval = models.BooleanField(default=False)
    approval = models.CharField(default='Pending', max_length=12)

    def save(self, *args, **kwargs):
        self.date_changed = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.date_created} - ({self.transactor}) {self.transacted_item} x {self.transacted_amount}'
    

class SpoiledMaterialReport(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    spoil_amount = models.FloatField()
    report_creator = models.CharField(max_length=64)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.date_created} - {self.item.item_name} x {self.spoil_amount}'
    

class Notification(models.Model):
    notif_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification')
    text = models.CharField(max_length=128)
    date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.notif_owner} - {self.date} - {self.text}'