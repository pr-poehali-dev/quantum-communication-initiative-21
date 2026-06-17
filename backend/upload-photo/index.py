"""
Загрузка фотографий объектов портфолио в S3 и сохранение URL в БД.
Принимает base64-encoded изображение, project_id и пароль.
"""
import os
import json
import base64
import uuid
import boto3
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

    if event.get("httpMethod") == "DELETE":
        body = json.loads(event.get("body") or "{}")
        if body.get("password") != ADMIN_PASSWORD:
            return {"statusCode": 403, "headers": cors_headers, "body": json.dumps({"error": "Неверный пароль"})}
        photo_id = body.get("id")
        if not photo_id:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Нет id"})}
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute("DELETE FROM project_photos WHERE id = %s", (photo_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"ok": True})}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")

    if body.get("password") != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors_headers, "body": json.dumps({"error": "Неверный пароль"})}

    image_data = body.get("image")
    content_type = body.get("contentType", "image/jpeg")
    project_id = body.get("projectId")

    if not image_data or not project_id:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Нет изображения или projectId"})}

    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    file_bytes = base64.b64decode(image_data)
    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    file_key = f"portfolio/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=file_key, Body=file_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO project_photos (project_id, url, sort_order) VALUES (%s, %s, (SELECT COALESCE(MAX(sort_order)+1, 0) FROM project_photos WHERE project_id = %s)) RETURNING id",
        (project_id, cdn_url, project_id),
    )
    photo_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"url": cdn_url, "id": photo_id}),
    }
