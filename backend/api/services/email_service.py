import html
import logging
import os
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr

from api.utils.email_verification import EMAIL_VERIFICATION_CODE_TTL_MINUTES

logger = logging.getLogger(__name__)


class EmailConfigurationError(RuntimeError):
    """SMTP no está configurado o falta información obligatoria."""


class EmailDeliveryError(RuntimeError):
    """El servidor SMTP rechazó el envío o no se pudo conectar."""


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def _build_verification_plain(username: str, code: str) -> str:
    ttl = EMAIL_VERIFICATION_CODE_TTL_MINUTES
    return "\n".join(
        [
            f"Hola {username},",
            "",
            "Tu código de verificación para Deck of Cards es:",
            "",
            code,
            "",
            f"Este código caduca en {ttl} minutos.",
            "Si no has creado esta cuenta, puedes ignorar este correo.",
            "",
            "— Deck of Cards",
            "Plataforma web para la elicitación de escalas de valor (DoC-MF).",
        ]
    )


def _build_verification_html(username: str, code: str) -> str:
    safe_username = html.escape(username)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    logo_url = f"{frontend_url}/favicon.svg"
    ttl = EMAIL_VERIFICATION_CODE_TTL_MINUTES
    year = datetime.utcnow().year

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación — Deck of Cards</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <tr>
            <td style="padding:20px 28px;background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:middle;">
                          <img src="{logo_url}" alt="Deck of Cards" width="40" height="40" style="display:block;border-radius:12px;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:22px;font-weight:900;color:#2563eb;letter-spacing:-0.02em;">
                            Deck of Cards
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;">
                Verificación de cuenta
              </p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#1e293b;line-height:1.3;">
                Hola, {safe_username}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748b;">
                Gracias por registrarte. Introduce el siguiente código en la pantalla de registro para confirmar tu correo electrónico.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background-color:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.2em;">
                      Tu código
                    </p>
                    <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:0.35em;color:#2563eb;font-family:ui-monospace,'Cascadia Code','Segoe UI Mono',monospace;">
                      {code}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
                El código caduca en <strong style="color:#334155;">{ttl} minutos</strong>.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
                Si no has creado esta cuenta, ignora este mensaje. Nadie más podrá usar tu correo sin el código.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;">
                      <span style="font-size:16px;font-weight:900;color:#1e293b;">Deck of Cards</span>
                      <span style="display:inline-block;margin-left:8px;padding:4px 8px;background-color:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;border-radius:6px;">
                        Software Científico
                      </span>
                    </p>
                    <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#64748b;max-width:480px;">
                      Plataforma web para la elicitación de escalas de valor y construcción de conjuntos difusos interpretables (DoC-MF).
                    </p>
                    <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;">
                      © {year} Deck of Cards App.
                    </p>
                    <p style="margin:0;font-size:10px;line-height:1.5;color:#94a3b8;">
                      Basado en la metodología DoC-MF (D. García-Zamora, B. Dutta, J.R. Figueira y L. Martínez, EJOR, 2024).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _log_verification_code_for_dev(recipient_email: str, code: str) -> None:
    logger.warning(
        "[email-verification] Modo desarrollo: código para %s → %s",
        recipient_email,
        code,
    )


def _build_verification_message(
    recipient_email: str,
    username: str,
    code: str,
    smtp_from_email: str,
    smtp_from_name: str,
) -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = "Codigo de verificacion - Deck of Cards"
    message["From"] = formataddr((smtp_from_name, smtp_from_email))
    message["To"] = recipient_email
    message["Date"] = datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")
    message.set_content(_build_verification_plain(username, code))
    message.add_alternative(_build_verification_html(username, code), subtype="html")
    return message


def _send_via_smtp(
    message: EmailMessage,
    recipient_email: str,
    smtp_from_email: str,
    smtp_host: str,
    smtp_port: int,
    smtp_username: str | None,
    smtp_password: str | None,
    use_tls: bool,
    use_ssl: bool,
) -> None:
    context = ssl.create_default_context()
    timeout = int(os.getenv("SMTP_TIMEOUT_SECONDS", "30"))
    debug_level = 1 if _env_bool("SMTP_DEBUG") else 0

    try:
        if use_ssl:
            server = smtplib.SMTP_SSL(
                smtp_host,
                smtp_port,
                timeout=timeout,
                context=context,
            )
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=timeout)

        with server:
            server.set_debuglevel(debug_level)
            server.ehlo()
            if use_tls and not use_ssl:
                server.starttls(context=context)
                server.ehlo()
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.sendmail(
                smtp_from_email,
                [recipient_email],
                message.as_string(),
            )
    except smtplib.SMTPException as exc:
        logger.exception(
            "Error SMTP al enviar verificación a %s via %s:%s",
            recipient_email,
            smtp_host,
            smtp_port,
        )
        raise EmailDeliveryError(str(exc)) from exc
    except OSError as exc:
        logger.exception(
            "No se pudo conectar al servidor SMTP %s:%s",
            smtp_host,
            smtp_port,
        )
        raise EmailDeliveryError(str(exc)) from exc


def send_verification_email(recipient_email: str, username: str, code: str) -> bool:
    recipient_email = recipient_email.strip().lower()
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    dev_log_code = _env_bool("EMAIL_VERIFICATION_DEV_LOG_CODE")

    if not smtp_host:
        if dev_log_code:
            _log_verification_code_for_dev(recipient_email, code)
            return True
        logger.error(
            "[email-verification] SMTP_HOST no configurado; no se envió correo a %s",
            recipient_email,
        )
        raise EmailConfigurationError(
            "SMTP_HOST no está configurado en el servidor"
        )

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = (os.getenv("SMTP_USERNAME") or "").strip()
    smtp_password = (os.getenv("SMTP_PASSWORD") or "").replace(" ", "")
    smtp_from_email = (os.getenv("SMTP_FROM_EMAIL") or smtp_username or "").strip()
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Deck of Cards")
    use_tls = _env_bool("SMTP_USE_TLS", "true")
    use_ssl = _env_bool("SMTP_USE_SSL", "false")

    if not smtp_from_email:
        raise EmailConfigurationError(
            "SMTP_FROM_EMAIL o SMTP_USERNAME debe estar configurado"
        )

    message = _build_verification_message(
        recipient_email,
        username,
        code,
        smtp_from_email,
        smtp_from_name,
    )

    try:
        _send_via_smtp(
            message,
            recipient_email,
            smtp_from_email,
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            use_tls,
            use_ssl,
        )
    except EmailDeliveryError:
        if dev_log_code:
            _log_verification_code_for_dev(recipient_email, code)
            return True
        raise

    logger.info("Correo de verificación enviado a %s", recipient_email)
    return True
