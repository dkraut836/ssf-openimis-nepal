# Generated by Django 2.1.14 on 2021-01-22 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0007_claim_employer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='claim',
            name='regular_checkup',
            field=models.CharField(blank=True, db_column='regularCheckup', max_length=10, null=True),
        ),
    ]
