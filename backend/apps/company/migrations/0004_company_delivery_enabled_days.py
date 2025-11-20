# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0003_company_delivery_locations'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='delivery_enabled_days',
            field=models.JSONField(blank=True, default=dict, help_text='Days when delivery/orders are enabled. Format: {"Lun": true, "Mar": true, ...}', verbose_name='Delivery Enabled Days'),
        ),
    ]
