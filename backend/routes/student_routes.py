from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from routes.application_routes import application_bp

student_bp = Blueprint("student_bp", __name__)


@student_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student(student_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT student_id, full_name, email
            FROM students
            WHERE student_id = %s
        """, (student_id,))
        student = cursor.fetchone()

        if not student:
            return jsonify({"error": "Student not found"}), 404

        return jsonify(student), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@student_bp.route("/skills", methods=["GET"])
def get_all_skills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT skill_id, skill_name
            FROM skills
            ORDER BY skill_name ASC
        """)
        skills = cursor.fetchall()

        return jsonify(skills), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@student_bp.route("/student/<int:student_id>/skills", methods=["POST"])
def add_student_skills(student_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    skills = data.get("skills")

    if not isinstance(skills, list) or len(skills) == 0:
        return jsonify({"error": "Skills must be a non-empty list"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    added_skills = []
    skipped_skills = []

    try:
        cursor.execute(
            "SELECT student_id FROM students WHERE student_id = %s",
            (student_id,)
        )
        student_exists = cursor.fetchone()

        if not student_exists:
            return jsonify({"error": "Student not found"}), 404

        for skill_name in skills:
            clean_skill = str(skill_name).strip().lower()

            if not clean_skill:
                continue

            cursor.execute(
                "SELECT skill_id FROM skills WHERE LOWER(skill_name) = %s",
                (clean_skill,)
            )
            result = cursor.fetchone()

            if not result:
                cursor.execute(
                    "INSERT INTO skills (skill_name) VALUES (%s)",
                    (clean_skill,)
                )
                skill_id = cursor.lastrowid
            else:
                skill_id = result[0]

            cursor.execute("""
                SELECT 1
                FROM student_skills
                WHERE student_id = %s AND skill_id = %s
            """, (student_id, skill_id))

            already_exists = cursor.fetchone()

            if already_exists:
                skipped_skills.append(clean_skill)
                continue

            cursor.execute("""
                INSERT INTO student_skills (student_id, skill_id)
                VALUES (%s, %s)
            """, (student_id, skill_id))

            added_skills.append(clean_skill)

        conn.commit()

        return jsonify({
            "message": "Skills processed successfully",
            "added_skills": added_skills,
            "skipped_skills": skipped_skills
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()