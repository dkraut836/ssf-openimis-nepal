# Generated by Django 2.1.14 on 2021-01-15 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0002_auto_20210115_1107'),
    ]

    operations = [
        migrations.AddField(
            model_name='claim',
            name='employerId',
            field=models.CharField(blank=True, db_column='employerSSFID', max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='claim',
            name='type_of_sickness',
            field=models.TextField(blank=True, db_column='typeOfSickness', null=True),
        ),
    ]