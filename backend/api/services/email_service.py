import html
import os
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage

from api.utils.email_verification import EMAIL_VERIFICATION_CODE_TTL_MINUTES


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
    message["Subject"] = "Código de verificación — Deck of Cards"
    message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
    message["To"] = recipient_email
    message.set_content(_build_verification_plain(username, code))
    message.add_alternative(_build_verification_html(username, code), subtype="html")

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
