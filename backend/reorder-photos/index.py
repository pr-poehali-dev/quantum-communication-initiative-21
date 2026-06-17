"""
Сохранение нового порядка фотографий объекта портфолио.
Принимает массив id фотографий в нужном порядке.
"""
import os
import json
import psycopg2

ADMIN_PASSWORD = "mkm2024admin"


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")

    if body.get("password") != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors_headers, "body": json.dumps({"error": "Неверный пароль"})}

    ordered_ids = body.get("ids", [])
    if not ordered_ids:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Нет ids"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    for i, photo_id in enumerate(ordered_ids):
        cur.execute("UPDATE project_photos SET sort_order = %s WHERE id = %s", (i, photo_id))
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"ok": True})}
