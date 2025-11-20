"""
Email service for sending order confirmations using Brevo API.
"""
import os
import logging
import requests
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def send_order_confirmation_emails(order_data, user_email, company_email):
    """
    Send order confirmation emails to both customer and company.

    Args:
        order_data (dict): Order information including items, delivery info, totals
        user_email (str): Customer email address
        company_email (str): Company email address

    Returns:
        dict: Status of email sending {customer: bool, company: bool}
    """
    results = {'customer': False, 'company': False}

    # Prepare data for templates
    language = order_data.get('language', 'es')

    # Send customer email
    try:
        customer_email_sent = _send_customer_email(order_data, user_email, language)
        results['customer'] = customer_email_sent
        logger.info(f"Customer email sent successfully to {user_email}")
    except Exception as e:
        logger.error(f"Error sending customer email to {user_email}: {type(e).__name__} - {e}")
        results['customer'] = False

    # Send company email
    try:
        company_email_sent = _send_company_email(order_data, company_email)
        results['company'] = company_email_sent
        logger.info(f"Company email sent successfully to {company_email}")
    except Exception as e:
        logger.error(f"Error sending company email to {company_email}: {type(e).__name__} - {e}")
        results['company'] = False

    return results


def _send_customer_email(order_data, recipient_email, language='es'):
    """Send order confirmation email to customer using Brevo API."""

    # Email subject
    if language == 'es':
        subject = f"✓ Pedido Confirmado #{order_data['order_id']} - Equus Pub"
    else:
        subject = f"✓ Order Confirmed #{order_data['order_id']} - Equus Pub"

    # Render HTML template
    html_content = render_to_string(
        'emails/customer_order_confirmation.html',
        {
            'language': language,
            'order_id': order_data['order_id'],
            'user_name': order_data['user_name'],
            'delivery_street': order_data['delivery_info']['street'],
            'delivery_house_number': order_data['delivery_info']['house_number'],
            'delivery_location': order_data['delivery_info']['location'],
            'phone': order_data['delivery_info']['phone'],
            'notes': order_data['delivery_info'].get('notes', ''),
            'items': order_data['items'],
            'total_price': order_data['total_price'],
        }
    )

    # Send via Brevo API
    return _send_via_brevo_api(
        to_email=recipient_email,
        to_name=order_data['user_name'],
        subject=subject,
        html_content=html_content
    )


def _send_company_email(order_data, recipient_email):
    """Send order notification email to company using Brevo API."""

    subject = f"🔔 Nuevo Pedido #{order_data['order_id']} - {order_data['user_name']}"

    # Render HTML template
    html_content = render_to_string(
        'emails/company_order_notification.html',
        {
            'order_id': order_data['order_id'],
            'user_name': order_data['user_name'],
            'user_email': order_data.get('user_email', ''),
            'delivery_street': order_data['delivery_info']['street'],
            'delivery_house_number': order_data['delivery_info']['house_number'],
            'delivery_location': order_data['delivery_info']['location'],
            'phone': order_data['delivery_info']['phone'],
            'notes': order_data['delivery_info'].get('notes', ''),
            'items': order_data['items'],
            'total_price': order_data['total_price'],
        }
    )

    # Send via Brevo API
    return _send_via_brevo_api(
        to_email=recipient_email,
        to_name="Equus Pub",
        subject=subject,
        html_content=html_content
    )


def send_order_cancellation_email(order, company_email):
    """
    Send order cancellation notification email to company.

    Args:
        order: Order instance that was cancelled
        company_email (str): Company email address

    Returns:
        bool: True if email sent successfully
    """
    try:
        subject = f"❌ Pedido Cancelado #{order.id} - {order.user.get_full_name() or order.user.username}"

        # Prepare order items data
        items_data = []
        for item in order.items.all():
            items_data.append({
                'name': item.product_name,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'subtotal': float(item.subtotal),
            })

        # Render HTML template
        html_content = render_to_string(
            'emails/company_order_cancellation.html',
            {
                'order_id': order.id,
                'user_name': order.user.get_full_name() or order.user.username,
                'user_email': order.user.email,
                'delivery_street': order.delivery_street,
                'delivery_house_number': order.delivery_house_number,
                'delivery_location': order.delivery_location,
                'phone': order.phone,
                'notes': order.notes or '',
                'items': items_data,
                'total_price': float(order.total_price),
                'created_at': order.created_at,
            }
        )

        # Send via Brevo API
        email_sent = _send_via_brevo_api(
            to_email=company_email,
            to_name="Equus Pub",
            subject=subject,
            html_content=html_content
        )

        if email_sent:
            logger.info(f"Cancellation email sent successfully to {company_email} for order #{order.id}")
        return email_sent

    except Exception as e:
        logger.error(f"Error sending cancellation email: {type(e).__name__} - {e}")
        return False


def _send_via_brevo_api(to_email, to_name, subject, html_content):
    """Send email via Brevo HTTP API."""

    brevo_api_key = getattr(settings, 'BREVO_API_KEY', None)
    if not brevo_api_key:
        logger.error("BREVO_API_KEY not configured in settings")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": brevo_api_key,
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "Equus Pub",
            "email": settings.DEFAULT_FROM_EMAIL
        },
        "to": [
            {
                "email": to_email,
                "name": to_name
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        logger.info(f"Email sent successfully via Brevo API to {to_email}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Brevo API error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response: {e.response.text}")
        return False
