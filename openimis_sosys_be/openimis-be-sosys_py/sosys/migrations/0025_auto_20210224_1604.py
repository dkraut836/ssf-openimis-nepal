# Generated by Django 2.1.14 on 2021-02-24 16:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0024_auto_20210215_1639'),
    ]

    operations = [
        migrations.AlterField(
            model_name='insureeemployer',
            name='employer',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, related_name='Emp', to='sosys.Employer'),
        ),
    ]
