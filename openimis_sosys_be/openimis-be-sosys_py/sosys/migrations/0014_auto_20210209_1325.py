# Generated by Django 2.1.14 on 2021-02-09 13:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0013_auto_20210209_1307'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employer',
            name='AddressId',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='sosys.Address'),
        ),
    ]
