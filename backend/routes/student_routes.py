from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from routes.application_routes import application_bp

# Create blueprint for student-related routes
student_bp = Blueprint("student_bp", __name__)


# =========================
# GET STUDENT DETAILS
# =========================
@student_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student(student_id):
    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Retrieve student details using student ID
        cursor.execute("""
            SELECT student_id, full_name, email
            FROM students
            WHERE student_id = %s
        """, (student_id,))
        student = cursor.fetchone()

        # Return error if student does not exist
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Return student details
        return jsonify(student), 200

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": str(e)}), 500

    finally:
        # Close database connection
        cursor.close()
        conn.close()


# =========================
# GET ALL AVAILABLE SKILLS
# =========================
@student_bp.route("/skills", methods=["GET"])
def get_all_skills():
    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Retrieve all skills sorted alphabetically
        cursor.execute("""
            SELECT skill_id, skill_name
            FROM skills
            ORDER BY skill_name ASC
        """)
        skills = cursor.fetchall()

        # Return skills list
        return jsonify(skills), 200

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": str(e)}), 500

    finally:
        # Close database connection
        cursor.close()
        conn.close()


# =========================
# ADD SKILLS TO A STUDENT
# =========================
@student_bp.route("/student/<int:student_id>/skills", methods=["POST"])
def add_student_skills(student_id):

    # Read JSON request body
    data = request.get_json(silent=True)

    # Check if JSON exists
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    # Extract skills list
    skills = data.get("skills")

    # Validate skills input
    if not isinstance(skills, list) or len(skills) == 0:
        return jsonify({"error": "Skills must be a non-empty list"}), 400

    # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Lists to track results
    added_skills = []
    skipped_skills = []

    try:
        # Check if student exists
        cursor.execute(
            "SELECT student_id FROM students WHERE student_id = %s",
            (student_id,)
        )
        student_exists = cursor.fetchone()

        if not student_exists:
            return jsonify({"error": "Student not found"}), 404

        # Process each skill submitted
        for skill_name in skills:

            # Clean skill text (remove spaces and convert to lowercase)
            clean_skill = str(skill_name).strip().lower()

            # Skip empty skills
            if not clean_skill:
                continue

            # Check if skill already exists in skills table
            cursor.execute(
                "SELECT skill_id FROM skills WHERE LOWER(skill_name) = %s",
                (clean_skill,)
            )
            result = cursor.fetchone()

            # Insert new skill if not found
            if not result:
                cursor.execute(
                    "INSERT INTO skills (skill_name) VALUES (%s)",
                    (clean_skill,)
                )
                skill_id = cursor.lastrowid
            else:
                skill_id = result[0]

            # Check if student already has this skill
            cursor.execute("""
                SELECT 1
                FROM student_skills
                WHERE student_id = %s AND skill_id = %s
            """, (student_id, skill_id))

            already_exists = cursor.fetchone()

            # Skip duplicate skill assignment
            if already_exists:
                skipped_skills.append(clean_skill)
                continue

            # Add skill to student_skills table
            cursor.execute("""
                INSERT INTO student_skills (student_id, skill_id)
                VALUES (%s, %s)
            """, (student_id, skill_id))

            # Store successfully added skill
            added_skills.append(clean_skill)

        # Save all changes to database
        conn.commit()

        # Return success response
        return jsonify({
            "message": "Skills processed successfully",
            "added_skills": added_skills,
            "skipped_skills": skipped_skills
        }), 200

    except Exception as e:
        # Rollback changes if error occurs
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        # Close database connection
        cursor.close()
        conn.close()