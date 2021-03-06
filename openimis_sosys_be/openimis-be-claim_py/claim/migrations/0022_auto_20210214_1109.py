# Generated by Django 2.1.14 on 2021-02-14 11:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0005_healthfacilitycatchment_healthfacilitylegalform_healthfacilitymutation_healthfacilitysublevel'),
        ('claim', '0021_claimattachment_masterdocument'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='claim',
            name='refer_to_hospital',
        ),
        migrations.AddField(
            model_name='claim',
            name='refer_to_health_facility',
            field=models.ForeignKey(blank=True, db_column='ReferToHealthFacility', null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='refer_to_claim', to='location.HealthFacility'),
        ),
        migrations.AlterField(
            model_name='claim',
            name='refer_from_health_facility',
            field=models.ForeignKey(blank=True, db_column='ReferFromHealthFacility', null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='refer_from_claim', to='location.HealthFacility'),
        ),
    ]
