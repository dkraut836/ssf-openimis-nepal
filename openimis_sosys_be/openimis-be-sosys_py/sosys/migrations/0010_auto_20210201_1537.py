# Generated by Django 2.1.14 on 2021-02-01 15:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sosys', '0009_auto_20210131_1059'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='claimhead',
            name='EmployerId',
        ),
        migrations.RemoveField(
            model_name='claimhead',
            name='PSSID',
        ),
        migrations.RemoveField(
            model_name='claimhead',
            name='schid',
        ),
        migrations.RemoveField(
            model_name='stb_anusuchi2_component',
            name='Claim',
        ),
        migrations.RemoveField(
            model_name='stb_claim_anusuchi2',
            name='ClaimNumber',
        ),
        migrations.RemoveField(
            model_name='stb_claim_anusuchi4',
            name='ClaimNumber',
        ),
        migrations.RemoveField(
            model_name='stb_claim_anusuchi5',
            name='ClaimNumber',
        ),
        migrations.RemoveField(
            model_name='stb_claim_document',
            name='ClaimNumber',
        ),
        migrations.DeleteModel(
            name='ClaimHead',
        ),
        migrations.DeleteModel(
            name='Product',
        ),
        migrations.DeleteModel(
            name='STB_ANUSUCHI2_COMPONENT',
        ),
        migrations.DeleteModel(
            name='STB_CLAIM_ANUSUCHI2',
        ),
        migrations.DeleteModel(
            name='STB_CLAIM_ANUSUCHI4',
        ),
        migrations.DeleteModel(
            name='STB_CLAIM_ANUSUCHI5',
        ),
        migrations.DeleteModel(
            name='STB_CLAIM_DOCUMENT',
        ),
    ]
