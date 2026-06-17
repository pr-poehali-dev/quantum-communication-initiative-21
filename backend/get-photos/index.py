"""
Получение фотографий объектов портфолио из БД.
Возвращает словарь: project_id -> список URL фотографий.
"""
import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("SELECT project_id, id, url FROM project_photos ORDER BY project_id, sort_order, id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    photos: dict = {}
    for project_id, photo_id, url in rows:
        key = str(project_id)
        if key not in photos:
            photos[key] = []
        photos[key].append({"id": photo_id, "url": url})

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"photos": photos}),
    }
