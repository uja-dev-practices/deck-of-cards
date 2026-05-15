import os
import smtplib
import ssl
from email.message import EmailMessage


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def send_verification_email(recipient_email: str, username: str, code: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    if not smtp_host:
        print(
            "[email-verification] SMTP_HOST no configurado. "
            f"Código para {recipient_email}: {code}"
        )
        return False

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL") or smtp_username
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Deck of Cards")
    use_tls = _env_bool("SMTP_USE_TLS", "true")
    use_ssl = _env_bool("SMTP_USE_SSL", "false")

    if not smtp_from_email:
        raise RuntimeError("SMTP_FROM_EMAIL o SMTP_USERNAME debe estar configurado")

    message = EmailMessage()
    message["Subject"] = "Código de verificación de Deck of Cards"
    message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
    message["To"] = recipient_email
    message.set_content(
        "\n".join(
            [
                f"Hola {username},",
                "",
                "Tu código de verificación para Deck of Cards es:",
                "",
                code,
                "",
                "Este código caduca en unos minutos. Si no has creado esta cuenta,",
                "puedes ignorar este correo.",
            ]
        )
    )

    context = ssl.create_default_context()

    if use_ssl:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.send_message(message)
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            if use_tls:
                server.starttls(context=context)
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.send_message(message)

    return True
