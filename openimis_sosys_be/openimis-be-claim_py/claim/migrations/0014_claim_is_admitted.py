# Generated by Django 2.1.14 on 2021-02-02 09:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0013_auto_20210201_0846'),
    ]

    operations = [
        migrations.AddField(
            model_name='claim',
            name='is_admitted',
            field=models.BooleanField(blank=True, db_column='IsAdmitted', null=True),
        ),
    ]