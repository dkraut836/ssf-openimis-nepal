# Generated by Django 2.1.14 on 2021-03-03 12:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('claim', '0030_auto_20210303_1021'),
    ]

    operations = [
        migrations.AddField(
            model_name='claim',
            name='head_claim',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='child_claim', to='claim.Claim'),
        ),
        migrations.AddField(
            model_name='claim',
            name='is_reclaim',
            field=models.CharField(blank=True, db_column='isReclaim', max_length=6, null=True),
        ),
    ]
