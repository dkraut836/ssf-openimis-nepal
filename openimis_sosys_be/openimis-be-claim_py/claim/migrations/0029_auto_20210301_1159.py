# Generated by Django 2.1.14 on 2021-03-01 11:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0027_subproduct'),
        ('claim', '0028_auto_20210226_1556'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='claim',
            name='scheme_id',
        ),
        migrations.AddField(
            model_name='claim',
            name='subProduct',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='claim_subProduct', to='sosys.SubProduct'),
        ),
    ]
