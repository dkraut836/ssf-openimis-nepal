# Generated by Django 2.1.14 on 2021-01-20 10:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0004_insureeemployer_p_ss'),
    ]

    operations = [
        migrations.RenameField(
            model_name='insureeemployer',
            old_name='E_SS',
            new_name='employer',
        ),
        migrations.RenameField(
            model_name='insureeemployer',
            old_name='p_ss',
            new_name='insuree',
        ),
    ]
