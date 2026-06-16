import json
import os
import smtplib
from email.mime.text import MIMEText

import psycopg2

SMTP_FROM = "MKM-NN52@ya.ru"
NOTIFY_TO = "MKM-NN52@ya.ru"


def send_email(name: str, phone: str, message: str, lead_id: int):
    body = f"""Новая заявка #{lead_id} с сайта МКМ-НН

Имя: {name}
Телефон: {phone}
Сообщение: {message or '—'}
"""
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = f"Новая заявка с сайта — {name}"
    msg["From"] = SMTP_FROM
    msg["To"] = NOTIFY_TO

    with smtplib.SMTP_SSL("smtp.yandex.ru", 465) as smtp:
        smtp.login(SMTP_FROM, os.environ["SMTP_PASSWORD"])
        smtp.sendmail(SMTP_FROM, [NOTIFY_TO], msg.as_string())


def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта МКМ-НН, сохраняет в БД и отправляет письмо."""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()

    if not name or not phone:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Имя и телефон обязательны"}),
        }

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

    send_email(name, phone, message, lead_id)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"success": True, "id": lead_id}),
    }
