"""
Email service for sending password reset emails using Brevo API.
"""
import logging
import requests
from datetime import datetime
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(user, reset_token, language='es'):
    """
    Send password reset email to user.

    Args:
        user: User instance
        reset_token: PasswordResetToken instance
        language (str): Language code ('es' or 'en')

    Returns:
        bool: True if email sent successfully
    """
    try:
        # Determine frontend URL
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
        reset_url = f"{frontend_url}/reset-password?token={reset_token.token}"

        # Email subject
        if language == 'es':
            subject = "🔑 Restablecer Contraseña - Equus Pub"
        else:
            subject = "🔑 Reset Password - Equus Pub"

        # Render HTML template
        html_content = render_to_string(
            'emails/password_reset.html',
            {
                'language': language,
                'user_name': user.name or user.username,
                'reset_url': reset_url,
                'current_year': datetime.now().year,
            }
        )

        # Send via Brevo API
        email_sent = _send_via_brevo_api(
            to_email=user.email,
            to_name=user.name or user.username,
            subject=subject,
            html_content=html_content
        )

        if email_sent:
            logger.info(f"Password reset email sent successfully to {user.email}")
        return email_sent

    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {type(e).__name__} - {e}")
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
