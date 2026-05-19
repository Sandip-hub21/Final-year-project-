from flask import Blueprint, request, jsonify
from models.db import get_db_connection

auth_bp = Blueprint("auth_bp", __name__)


# ================================
# REGISTER ROUTE
# ================================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # React may send "name", but database column is "full_name"
    full_name = data.get("full_name") or data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    # Basic validation
    if not full_name or not email or not password:
        return jsonify({
            "error": "Full name, email and password are required"
        }), 400

    # Only allow valid roles
    if role not in ["student", "publisher"]:
        role = "student"

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if email already exists
        cursor.execute(
            "SELECT student_id FROM students WHERE email = %s",
            (email,)
        )
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "error": "Email already exists"
            }), 409

        # Insert user into students table
        cursor.execute("""
            INSERT INTO students (full_name, email, password, role)
            VALUES (%s, %s, %s, %s)
        """, (full_name, email, password, role))

        conn.commit()

        new_user_id = cursor.lastrowid

        return jsonify({
            "message": "Registered successfully",
            "student_id": new_user_id,
            "name": full_name,
            "full_name": full_name,
            "email": email,
            "role": role
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# ================================
# LOGIN ROUTE
# ================================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT student_id, full_name, email, password, role
            FROM students
            WHERE email = %s AND password = %s
        """, (email, password))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        return jsonify({
            "message": "Login successful",
            "student_id": user["student_id"],
            "name": user["full_name"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# ================================
# FORGOT PASSWORD ROUTE
# ================================
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    email = data.get("email")
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({
            "error": "Email and new password are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if email exists
        cursor.execute(
            "SELECT student_id FROM students WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "error": "Email not found"
            }), 404

        # Update password
        cursor.execute("""
            UPDATE students
            SET password = %s
            WHERE email = %s
        """, (new_password, email))

        conn.commit()

        return jsonify({
            "message": "Password updated successfully"
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()