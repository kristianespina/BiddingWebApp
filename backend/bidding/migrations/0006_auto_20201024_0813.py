# Generated by Django 3.0.5 on 2020-10-24 08:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bidding', '0005_product_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='photo',
            field=models.ImageField(upload_to='images/'),
        ),
    ]
