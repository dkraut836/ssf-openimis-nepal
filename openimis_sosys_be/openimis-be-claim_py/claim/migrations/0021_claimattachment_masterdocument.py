# Generated by Django 2.1.14 on 2021-02-11 12:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0015_claimdocumentsmaster'),
        ('claim', '0020_auto_20210206_1119'),
    ]

    operations = [
        migrations.AddField(
            model_name='claimattachment',
            name='masterDocument',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='sosys.ClaimDocumentsMaster'),
        ),
    ]
