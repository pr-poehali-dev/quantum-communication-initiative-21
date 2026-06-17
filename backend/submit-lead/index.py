"""
Обработчик форм сайта МКМ-НН.
type=lead (по умолчанию): сохраняет заявку в БД и отправляет письмо.
type=letter: отправляет письмо с возможным вложением (без сохранения в БД).
"""
import json
import os
import base64
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

import psycopg2

SMTP_FROM = "MKM-NN52@ya.ru"
NOTIFY_TO = "MKM-NN52@ya.ru"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
}


def smtp_send(msg):
    with smtplib.SMTP_SSL("smtp.yandex.ru", 465) as smtp:
        smtp.login(SMTP_FROM, os.environ["SMTP_PASSWORD"])
        smtp.sendmail(SMTP_FROM, [NOTIFY_TO], msg.as_string())


def handle_lead(body: dict) -> dict:
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()

    if not name or not phone:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Имя и телефон обязательны"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO leads (name, phone, message) VALUES (%s, %s, %s) RETURNING id",
        (name, phone, message or None),
    )
    lead_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    msg = MIMEText(
        f"Новая заявка #{lead_id} с сайта МКМ-НН\n\nИмя: {name}\nТелефон: {phone}\nСообщение: {message or '—'}",
        "plain", "utf-8"
    )
    msg["Subject"] = f"Новая заявка с сайта — {name}"
    msg["From"] = SMTP_FROM
    msg["To"] = NOTIFY_TO
    smtp_send(msg)

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True, "id": lead_id})}


def handle_letter(body: dict) -> dict:
    name = body.get("name", "").strip()
    sender_email = body.get("email", "").strip()
    message = body.get("message", "").strip()
    attachment_data = body.get("attachment")
    attachment_name = body.get("attachmentName", "document")

    if not name or not sender_email or not message:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}

    msg = MIMEMultipart()
    msg["Subject"] = f"Письмо с сайта от {name}"
    msg["From"] = SMTP_FROM
    msg["To"] = NOTIFY_TO
    msg["Reply-To"] = sender_email

    msg.attach(MIMEText(
        f"Письмо с сайта МКМ-НН\n\nОт: {name}\nEmail: {sender_email}\n\nСообщение:\n{message}",
        "plain", "utf-8"
    ))

    if attachment_data:
        raw = attachment_data.split(",", 1)[1] if "," in attachment_data else attachment_data
        part = MIMEBase("application", "octet-stream")
        part.set_payload(base64.b64decode(raw))
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{attachment_name}"')
        msg.attach(part)

    smtp_send(msg)

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")

    if body.get("type") == "letter":
        return handle_letter(body)
    return handle_lead(body)
