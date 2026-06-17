"""
CRUD управление объектами портфолио + чтение/управление заявками.
GET /?resource=leads&password=... — список заявок, автоматически помечает все как прочитанные.
GET /?resource=leads_count&password=... — количество непрочитанных заявок.
PATCH + {resource:lead, id} — пометить заявку прочитанной вручную.
GET — список всех объектов (публично).
POST/PUT/DELETE — управление объектами.
"""
import os
import json
import psycopg2

ADMIN_PASSWORD = "mkm2024admin"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if method == "GET":
        params = event.get("queryStringParameters") or {}
        resource = params.get("resource", "")

        # GET количества непрочитанных — только с паролем
        if resource == "leads_count":
            if params.get("password") != ADMIN_PASSWORD:
                return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Неверный пароль"})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM leads WHERE read_at IS NULL")
            count = cur.fetchone()[0]
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"unread": count})}

        # GET заявок — только с паролем, автоматически помечает все прочитанными
        if resource == "leads":
            if params.get("password") != ADMIN_PASSWORD:
                return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Неверный пароль"})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT id, name, phone, message, created_at, read_at FROM leads ORDER BY created_at DESC")
            rows = cur.fetchall()
            cur.execute("UPDATE leads SET read_at = NOW() WHERE read_at IS NULL")
            conn.commit()
            cur.close()
            conn.close()
            leads = [{"id": r[0], "name": r[1], "phone": r[2], "message": r[3], "created_at": r[4].isoformat(), "read": r[5] is not None} for r in rows]
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"leads": leads})}

        # GET объектов — публичный
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, title, category, location, year FROM projects ORDER BY sort_order, id")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        projects = [{"id": r[0], "title": r[1], "category": r[2], "location": r[3], "year": r[4]} for r in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"projects": projects})}

    body = json.loads(event.get("body") or "{}")

    if body.get("password") != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Неверный пароль"})}

    if method == "POST":
        title = body.get("title", "").strip()
        if not title:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет названия"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO projects (title, category, location, year, sort_order) VALUES (%s, %s, %s, %s, (SELECT COALESCE(MAX(sort_order)+1,0) FROM projects)) RETURNING id",
            (title, body.get("category", ""), body.get("location", ""), body.get("year", ""))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"id": new_id})}

    if method == "PUT":
        project_id = body.get("id")
        if not project_id:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет id"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE projects SET title=%s, category=%s, location=%s, year=%s WHERE id=%s",
            (body.get("title", ""), body.get("category", ""), body.get("location", ""), body.get("year", ""), project_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    if method == "DELETE":
        project_id = body.get("id")
        if not project_id:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет id"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM project_photos WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM projects WHERE id=%s", (project_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}