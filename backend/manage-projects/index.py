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

        # GET контента сайта — публичный
        if resource == "content":
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT key, value, label, section FROM site_content ORDER BY section, key")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            content = {r[0]: {"value": r[1], "label": r[2], "section": r[3]} for r in rows}
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"content": content})}

        # GET вакансий — публичный (только активные), с паролем — все
        if resource == "vacancies":
            conn = get_conn()
            cur = conn.cursor()
            pwd = params.get("password")
            if pwd == ADMIN_PASSWORD:
                cur.execute("SELECT id, title, description, salary, location, active FROM vacancies ORDER BY sort_order, id")
            else:
                cur.execute("SELECT id, title, description, salary, location, active FROM vacancies WHERE active=TRUE ORDER BY sort_order, id")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            vacancies = [{"id": r[0], "title": r[1], "description": r[2], "salary": r[3], "location": r[4], "active": r[5]} for r in rows]
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"vacancies": vacancies})}

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

    resource = body.get("resource", "")

    # --- Обновление контента ---
    if resource == "content":
        updates = body.get("updates", {})
        if not updates:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет данных"})}
        conn = get_conn()
        cur = conn.cursor()
        for key, value in updates.items():
            cur.execute("UPDATE site_content SET value=%s WHERE key=%s", (value, key))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    # --- CRUD вакансий ---
    if resource == "vacancy":
        if method == "POST":
            title = body.get("title", "").strip()
            if not title:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет названия"})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO vacancies (title, description, salary, location, active, sort_order) VALUES (%s, %s, %s, %s, %s, (SELECT COALESCE(MAX(sort_order)+1,0) FROM vacancies)) RETURNING id",
                (title, body.get("description", ""), body.get("salary", ""), body.get("location", ""), body.get("active", True))
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"id": new_id})}

        if method == "PUT":
            vid = body.get("id")
            if not vid:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет id"})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                "UPDATE vacancies SET title=%s, description=%s, salary=%s, location=%s, active=%s WHERE id=%s",
                (body.get("title", ""), body.get("description", ""), body.get("salary", ""), body.get("location", ""), body.get("active", True), vid)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

        if method == "DELETE":
            vid = body.get("id")
            if not vid:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет id"})}
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("DELETE FROM vacancies WHERE id=%s", (vid,))
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    # --- CRUD проектов ---
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