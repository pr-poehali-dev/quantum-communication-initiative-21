"""
Загрузка фотографий объектов портфолио в S3 хранилище.
Принимает base64-encoded изображение и возвращает публичный URL.
"""
import os
import json
import base64
import uuid
import boto3

ADMIN_PASSWORD = "mkm2024admin"

def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")

    if body.get("password") != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors_headers, "body": json.dumps({"error": "Неверный пароль"})}

    image_data = body.get("image")
    content_type = body.get("contentType", "image/jpeg")

    if not image_data:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Нет изображения"})}

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

    s3.put_object(
        Bucket="files",
        Key=file_key,
        Body=file_bytes,
        ContentType=content_type,
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"url": cdn_url}),
    }
