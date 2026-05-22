from flask import Blueprint, jsonify, request
from models.db import get_db_connection
from routes.application_routes import application_bp

# Blueprint for all job, application, publisher, and admin-related routes
job_bp = Blueprint("job_bp", __name__)


# =========================================================
# STUDENT / PUBLIC: VIEW ACTIVE JOBS ONLY
# =========================================================
@job_bp.route("/jobs", methods=["GET"])
def get_jobs():
    """
    Students should only see jobs that are active and not expired.
    This is used by Browse Jobs and recommendation display.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                job_id, title, company, description,
                expires_at, status, publisher_id,
                job_type, hourly_wage
            FROM jobs
            WHERE status = 'active'
            AND (expires_at IS NULL OR expires_at >= CURDATE())
            ORDER BY job_id DESC
        """)
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADMIN: VIEW ALL JOBS
# =========================================================
@job_bp.route("/jobs/admin", methods=["GET"])
def get_all_jobs_admin():
    """
    Admin can view all jobs, including inactive and expired jobs.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                job_id, title, company, description,
                expires_at, status, publisher_id,
                job_type, hourly_wage
            FROM jobs
            ORDER BY job_id DESC
        """)
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# PUBLISHER: VIEW OWN JOBS ONLY
# =========================================================
@job_bp.route("/jobs/publisher/<int:publisher_id>", methods=["GET"])
def get_publisher_jobs(publisher_id):
    """
    Publisher can only view jobs that they published.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                job_id, title, company, description,
                expires_at, status, publisher_id,
                job_type, hourly_wage
            FROM jobs
            WHERE publisher_id = %s
            ORDER BY job_id DESC
        """, (publisher_id,))
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADD JOB
# =========================================================
@job_bp.route("/jobs", methods=["POST"])
def add_job():
    """
    Publisher/Admin can add a new job.
    The job includes title, company, description, skills, expiry date,
    job type, and hourly wage.
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    title = data.get("title")
    company = data.get("company")
    description = data.get("description", "")
    skills = data.get("skills", [])
    publisher_id = data.get("publisher_id")
    expires_at = data.get("expires_at") or None
    job_type = data.get("job_type", "Full-time")
    hourly_wage = data.get("hourly_wage") or None

    if not title or not company:
        return jsonify({"error": "Title and company are required"}), 400

    if not isinstance(skills, list):
        return jsonify({"error": "Skills must be a list"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert job record
        cursor.execute("""
            INSERT INTO jobs 
            (title, company, description, publisher_id, expires_at, status, job_type, hourly_wage)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            title,
            company,
            description,
            publisher_id,
            expires_at,
            "active",
            job_type,
            hourly_wage
        ))

        job_id = cursor.lastrowid

        # Insert or reuse skills, then link them to the job
        for skill in skills:
            clean_skill = str(skill).strip().lower()

            if not clean_skill:
                continue

            cursor.execute(
                "SELECT skill_id FROM skills WHERE LOWER(skill_name) = %s",
                (clean_skill,)
            )
            result = cursor.fetchone()

            if result:
                skill_id = result[0]
            else:
                cursor.execute(
                    "INSERT INTO skills (skill_name) VALUES (%s)",
                    (clean_skill,)
                )
                skill_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO job_skills (job_id, skill_id)
                VALUES (%s, %s)
            """, (job_id, skill_id))

        conn.commit()

        return jsonify({
            "message": "Job added successfully",
            "job_id": job_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# UPDATE JOB STATUS
# =========================================================
@job_bp.route("/jobs/<int:job_id>/status", methods=["PUT"])
def update_job_status(job_id):
    """
    Admin or publisher can change job status.
    """
    data = request.get_json(silent=True)
    status = data.get("status")

    allowed_statuses = ["active", "inactive", "expired"]

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid job status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE jobs
            SET status = %s
            WHERE job_id = %s
        """, (status, job_id))

        conn.commit()
        return jsonify({"message": "Job status updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# DELETE JOB
# =========================================================
@job_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    """
    Admin can delete a job and related records.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM job_skills WHERE job_id = %s", (job_id,))
        cursor.execute("DELETE FROM recommendations WHERE job_id = %s", (job_id,))
        cursor.execute("DELETE FROM applications WHERE job_id = %s", (job_id,))
        cursor.execute("DELETE FROM jobs WHERE job_id = %s", (job_id,))

        conn.commit()
        return jsonify({"message": "Job deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# STUDENT: APPLY FOR JOB
# =========================================================
@job_bp.route("/apply", methods=["POST"])
def apply_job():
    """
    Student applies for an active and non-expired job.
    """
    data = request.get_json(silent=True)

    student_id = data.get("student_id")
    job_id = data.get("job_id")

    if not student_id or not job_id:
        return jsonify({"error": "student_id and job_id are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check that job exists and is still active
        cursor.execute("""
            SELECT job_id, title, company
            FROM jobs
            WHERE job_id = %s
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at >= CURDATE())
        """, (job_id,))
        job = cursor.fetchone()

        if not job:
            return jsonify({"error": "Job not found or expired"}), 404

        # Prevent duplicate applications
        cursor.execute("""
            SELECT application_id
            FROM applications
            WHERE student_id = %s AND job_id = %s
        """, (student_id, job_id))

        if cursor.fetchone():
            return jsonify({"error": "Application already submitted for this job"}), 400

        cursor.execute("""
            INSERT INTO applications (student_id, job_id, status)
            VALUES (%s, %s, %s)
        """, (student_id, job_id, "Submitted"))

        conn.commit()

        return jsonify({
            "message": "Application submitted successfully",
            "job_title": job["title"],
            "company": job["company"]
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# STUDENT: VIEW OWN APPLICATIONS
# =========================================================
@job_bp.route("/applications/<int:student_id>", methods=["GET"])
def get_student_applications(student_id):
    """
    Student can view only their own submitted applications.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                a.application_id, a.student_id, a.job_id,
                a.application_date, a.status,
                j.title, j.company, j.job_type, j.hourly_wage
            FROM applications a
            JOIN jobs j ON a.job_id = j.job_id
            WHERE a.student_id = %s
            ORDER BY a.application_date DESC
        """, (student_id,))
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADMIN: VIEW ALL APPLICATIONS
# =========================================================
@job_bp.route("/applications/all", methods=["GET"])
def get_all_applications():
    """
    Admin can view applications for all jobs.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                a.application_id, a.student_id, a.job_id,
                a.application_date, a.status,
                s.full_name, s.email,
                j.title, j.company, j.publisher_id,
                j.job_type, j.hourly_wage
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN jobs j ON a.job_id = j.job_id
            ORDER BY a.application_date DESC
        """)
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# PUBLISHER: VIEW APPLICATIONS FOR OWN JOBS ONLY
# =========================================================
@job_bp.route("/applications/publisher/<int:publisher_id>", methods=["GET"])
def get_publisher_applications(publisher_id):
    """
    Publisher only sees applications for jobs they published.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                a.application_id, a.student_id, a.job_id,
                a.application_date, a.status,
                s.full_name, s.email,
                j.title, j.company, j.publisher_id,
                j.job_type, j.hourly_wage
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN jobs j ON a.job_id = j.job_id
            WHERE j.publisher_id = %s
            ORDER BY a.application_date DESC
        """, (publisher_id,))
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# UPDATE APPLICATION STATUS
# =========================================================
@job_bp.route("/applications/<int:application_id>/status", methods=["PUT"])
def update_application_status(application_id):
    """
    Admin or publisher can update application status.
    """
    data = request.get_json(silent=True)
    status = data.get("status")

    allowed_statuses = [
        "Submitted",
        "In Review",
        "Interview",
        "Rejected",
        "Accepted",
        "Withdrawn"
    ]

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid application status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE applications
            SET status = %s
            WHERE application_id = %s
        """, (status, application_id))

        conn.commit()
        return jsonify({"message": "Application status updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# STUDENT: WITHDRAW APPLICATION
# =========================================================
@job_bp.route("/applications/<int:application_id>/withdraw", methods=["PUT"])
def withdraw_application(application_id):
    """
    Student can withdraw an application.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE applications
            SET status = %s
            WHERE application_id = %s
        """, ("Withdrawn", application_id))

        conn.commit()
        return jsonify({"message": "Application withdrawn successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADMIN DASHBOARD
# =========================================================
@job_bp.route("/admin/dashboard", methods=["GET"])
def get_admin_dashboard():
    """
    Admin dashboard summary.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT COUNT(*) AS students FROM students WHERE role = 'student'")
        students = cursor.fetchone()["students"]

        cursor.execute("SELECT COUNT(*) AS publishers FROM students WHERE role = 'publisher'")
        publishers = cursor.fetchone()["publishers"]

        cursor.execute("SELECT COUNT(*) AS jobs FROM jobs")
        jobs = cursor.fetchone()["jobs"]

        cursor.execute("SELECT COUNT(*) AS active_jobs FROM jobs WHERE status = 'active'")
        active_jobs = cursor.fetchone()["active_jobs"]

        cursor.execute("SELECT COUNT(*) AS applications FROM applications")
        applications = cursor.fetchone()["applications"]

        cursor.execute("""
            SELECT j.title, j.company, COUNT(a.application_id) AS application_count
            FROM jobs j
            LEFT JOIN applications a ON j.job_id = a.job_id
            GROUP BY j.job_id, j.title, j.company
            ORDER BY application_count DESC
            LIMIT 5
        """)
        most_applied_jobs = cursor.fetchall()

        return jsonify({
            "students": students,
            "publishers": publishers,
            "jobs": jobs,
            "active_jobs": active_jobs,
            "applications": applications,
            "most_applied_jobs": most_applied_jobs
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# PUBLISHER DASHBOARD
# =========================================================
@job_bp.route("/publisher/<int:publisher_id>/dashboard", methods=["GET"])
def get_publisher_dashboard(publisher_id):
    """
    Publisher dashboard summary.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT COUNT(*) AS total_jobs
            FROM jobs
            WHERE publisher_id = %s
        """, (publisher_id,))
        total_jobs = cursor.fetchone()["total_jobs"]

        cursor.execute("""
            SELECT COUNT(*) AS active_jobs
            FROM jobs
            WHERE publisher_id = %s
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at >= CURDATE())
        """, (publisher_id,))
        active_jobs = cursor.fetchone()["active_jobs"]

        cursor.execute("""
            SELECT COUNT(*) AS expired_jobs
            FROM jobs
            WHERE publisher_id = %s
            AND (status = 'expired' OR expires_at < CURDATE())
        """, (publisher_id,))
        expired_jobs = cursor.fetchone()["expired_jobs"]

        cursor.execute("""
            SELECT COUNT(*) AS total_applications
            FROM applications a
            JOIN jobs j ON a.job_id = j.job_id
            WHERE j.publisher_id = %s
        """, (publisher_id,))
        total_applications = cursor.fetchone()["total_applications"]

        cursor.execute("""
            SELECT a.status, COUNT(*) AS count
            FROM applications a
            JOIN jobs j ON a.job_id = j.job_id
            WHERE j.publisher_id = %s
            GROUP BY a.status
        """, (publisher_id,))
        status_counts = cursor.fetchall()

        return jsonify({
            "publisher_id": publisher_id,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "expired_jobs": expired_jobs,
            "total_applications": total_applications,
            "status_counts": status_counts
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
        # =========================================================
# ADMIN: VIEW ALL USERS
# =========================================================
@job_bp.route("/admin/users", methods=["GET"])
def get_all_users():
    """
    Admin can view all users in the system.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT student_id, full_name, email, role
            FROM students
            ORDER BY student_id DESC
        """)
        return jsonify(cursor.fetchall()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADMIN: UPDATE USER ROLE
# =========================================================
@job_bp.route("/admin/users/<int:user_id>/role", methods=["PUT"])
def update_user_role(user_id):
    """
    Admin can change a user's role.
    """
    data = request.get_json(silent=True)
    role = data.get("role")

    allowed_roles = ["student", "publisher", "admin"]

    if role not in allowed_roles:
        return jsonify({"error": "Invalid role"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE students
            SET role = %s
            WHERE student_id = %s
        """, (role, user_id))

        conn.commit()
        return jsonify({"message": "User role updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# ADMIN: DELETE USER
# =========================================================
@job_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    Admin can delete a user and their related records.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM student_skills WHERE student_id = %s", (user_id,))
        cursor.execute("DELETE FROM recommendations WHERE student_id = %s", (user_id,))
        cursor.execute("DELETE FROM applications WHERE student_id = %s", (user_id,))
        cursor.execute("DELETE FROM job_skills WHERE job_id IN (SELECT job_id FROM jobs WHERE publisher_id = %s)", (user_id,))
        cursor.execute("DELETE FROM jobs WHERE publisher_id = %s", (user_id,))
        cursor.execute("DELETE FROM students WHERE student_id = %s", (user_id,))

        conn.commit()
        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()