import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


async def send_password_reset_email(to_email: str, reset_link: str) -> None:
    if not settings.smtp_host:
        print(f"[DEV] Password reset link for {to_email}: {reset_link}", flush=True)
        return

    msg = EmailMessage()
    msg["Subject"] = "Reset your ReviewLens password"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.set_content(
        f"Click the link below to reset your password (expires in 1 hour):\n\n"
        f"{reset_link}\n\n"
        f"If you did not request this, you can safely ignore this email."
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            if settings.smtp_tls:
                smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
