# Generated by Django 4.1.3 on 2024-02-18 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ims', '0008_alter_transaction_approval'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='cafe_stock',
            field=models.IntegerField(default=0),
        ),
    ]
