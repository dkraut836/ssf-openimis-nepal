# Generated by Django 2.1.14 on 2021-02-15 16:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0023_auto_20210215_1619'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hfbankdetails',
            name='health_facility',
            field=models.ForeignKey(db_column='HF', on_delete=django.db.models.deletion.DO_NOTHING, related_name='bank_details', to='location.HealthFacility'),
        ),
        migrations.AlterField(
            model_name='hfbankdetails',
            name='purpose',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]