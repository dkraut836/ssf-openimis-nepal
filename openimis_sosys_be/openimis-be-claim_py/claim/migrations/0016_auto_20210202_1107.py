# Generated by Django 2.1.14 on 2021-02-02 11:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0015_auto_20210202_1038'),
    ]

    operations = [
        migrations.AlterField(
            model_name='claim',
            name='is_admitted',
            field=models.CharField(blank=True, db_column='IsAdmitted', max_length=6, null=True),
        ),
    ]