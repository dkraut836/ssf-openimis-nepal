# Generated by Django 2.1.14 on 2021-05-14 18:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0034_merge_20210331_1220'),
    ]

    operations = [
        migrations.AddField(
            model_name='claim',
            name='pay_to',
            field=models.IntegerField(blank=True, db_column='payTo', null=True),
        ),
        migrations.AddField(
            model_name='claim',
            name='scheme_type',
            field=models.IntegerField(blank=True, db_column='SchemeType', null=True),
        ),
    ]
