from flask import Blueprint, jsonify
from models.db import get_db_connection
from services.recommendation_service import generate_recommendations

recommendation_bp = Blueprint("recommendation_bp", __name__)


# =========================================================
# GENERATE RECOMMENDATIONS FOR A STUDENT
# =========================================================
@recommendation_bp.route("/recommend/<int:student_id>", methods=["POST"])
def recommend_jobs(student_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Get student skills
        cursor.execute("""
            SELECT s.skill_name
            FROM skills s
            JOIN student_skills ss ON s.skill_id = ss.skill_id
            WHERE ss.student_id = %s
        """, (student_id,))

        student_skill_rows = cursor.fetchall()

        student_skills = list(dict.fromkeys(
            row["skill_name"].strip().lower()
            for row in student_skill_rows
        ))

        if not student_skills:
            return jsonify({
                "error": f"No skills found for student_id {student_id}"
            }), 404

        # 2. Get jobs with their linked skills
        cursor.execute("""
            SELECT 
                j.job_id,
                j.title,
                j.company,
                j.description,
                j.job_type,
                j.salary,
                j.location,
                s.skill_name
            FROM jobs j
            JOIN job_skills js ON j.job_id = js.job_id
            JOIN skills s ON js.skill_id = s.skill_id
        """)

        rows = cursor.fetchall()

        jobs_dict = {}

        for row in rows:
            job_id = row["job_id"]

            if job_id not in jobs_dict:
                jobs_dict[job_id] = {
                    "job_id": job_id,
                    "title": row["title"],
                    "company": row["company"],
                    "description": row["description"],
                    "job_type": row.get("job_type"),
                    "salary": row.get("salary"),
                    "location": row.get("location"),
                    "skills": []
                }

            jobs_dict[job_id]["skills"].append(
                row["skill_name"].strip().lower()
            )

        jobs = list(jobs_dict.values())

        if not jobs:
            return jsonify({
                "error": "No jobs with skills found"
            }), 404

        # 3. Generate recommendations using your service
        recommendations = generate_recommendations(student_skills, jobs)

        enriched_recommendations = []

        for rec in recommendations:
            job_skills = [
                skill.strip().lower()
                for skill in rec.get("skills", [])
            ]

            matched_skills = [
                skill for skill in student_skills
                if skill in job_skills
            ]

            missing_skills = [
                skill for skill in job_skills
                if skill not in student_skills
            ]

            enriched_recommendations.append({
                "job_id": rec["job_id"],
                "title": rec["title"],
                "company": rec.get("company"),
                "description": rec.get("description"),
                "job_type": rec.get("job_type"),
                "salary": rec.get("salary"),
                "location": rec.get("location"),
                "score": rec["score"],
                "skills": job_skills,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "student_skill_count": len(student_skills),
                "job_skill_count": len(job_skills),
                "matched_skill_count": len(matched_skills)
            })

        # 4. Clear old recommendations
        cursor.execute("""
            DELETE FROM recommendations
            WHERE student_id = %s
        """, (student_id,))

        # 5. Save new recommendations
        for rec in enriched_recommendations:
            cursor.execute("""
                INSERT INTO recommendations
                (
                    student_id,
                    job_id,
                    score,
                    match_score,
                    matched_skills,
                    missing_skills
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                student_id,
                rec["job_id"],
                rec["score"],
                rec["score"],
                ", ".join(rec["matched_skills"]),
                ", ".join(rec["missing_skills"])
            ))

        conn.commit()

        return jsonify({
            "student_id": student_id,
            "student_skills": student_skills,
            "recommendations": enriched_recommendations
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# GET SAVED RECOMMENDATIONS FOR STUDENT
# =========================================================
@recommendation_bp.route("/recommendations/<int:student_id>", methods=["GET"])
def get_saved_recommendations(student_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get student skills
        cursor.execute("""
            SELECT s.skill_name
            FROM skills s
            JOIN student_skills ss ON s.skill_id = ss.skill_id
            WHERE ss.student_id = %s
        """, (student_id,))

        student_skill_rows = cursor.fetchall()

        student_skills = [
            row["skill_name"].strip().lower()
            for row in student_skill_rows
        ]

        # Get saved/generated recommendations
        cursor.execute("""
            SELECT 
                r.recommendation_id,
                r.student_id,
                r.job_id,
                r.score,
                r.match_score,
                r.matched_skills,
                r.missing_skills,
                r.generated_at,
                r.created_at,
                j.title,
                j.company,
                j.description,
                j.job_type,
                j.salary,
                j.location
            FROM recommendations r
            JOIN jobs j ON r.job_id = j.job_id
            WHERE r.student_id = %s
            ORDER BY r.score DESC
        """, (student_id,))

        saved_recommendations = cursor.fetchall()

        enriched_results = []

        for rec in saved_recommendations:
            # Get skills required by this job
            cursor.execute("""
                SELECT s.skill_name
                FROM skills s
                JOIN job_skills js ON s.skill_id = js.skill_id
                WHERE js.job_id = %s
            """, (rec["job_id"],))

            job_skill_rows = cursor.fetchall()

            job_skills = [
                row["skill_name"].strip().lower()
                for row in job_skill_rows
            ]

            matched_skills = [
                skill for skill in student_skills
                if skill in job_skills
            ]

            missing_skills = [
                skill for skill in job_skills
                if skill not in student_skills
            ]

            enriched_results.append({
                "recommendation_id": rec["recommendation_id"],
                "student_id": rec["student_id"],
                "job_id": rec["job_id"],
                "title": rec["title"],
                "company": rec["company"],
                "description": rec["description"],
                "job_type": rec.get("job_type"),
                "salary": rec.get("salary"),
                "location": rec.get("location"),
                "score": float(rec["score"] or 0),
                "match_score": float(rec["match_score"] or rec["score"] or 0),
                "skills": job_skills,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "student_skill_count": len(student_skills),
                "job_skill_count": len(job_skills),
                "matched_skill_count": len(matched_skills),
                "created_at": rec.get("created_at") or rec.get("generated_at"),
                "generated_at": rec.get("generated_at")
            })

        return jsonify(enriched_results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# =========================================================
# STUDENT DASHBOARD SUMMARY
# =========================================================
@recommendation_bp.route("/dashboard/<int:student_id>", methods=["GET"])
def get_dashboard_summary(student_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT COUNT(*) AS total_recommendations
            FROM recommendations
            WHERE student_id = %s
        """, (student_id,))

        total_result = cursor.fetchone()

        cursor.execute("""
            SELECT 
                r.recommendation_id,
                r.student_id,
                r.job_id,
                r.score,
                r.created_at,
                r.generated_at,
                j.title,
                j.company,
                j.description,
                j.job_type,
                j.salary,
                j.location
            FROM recommendations r
            JOIN jobs j ON r.job_id = j.job_id
            WHERE r.student_id = %s
            ORDER BY r.score DESC
            LIMIT 1
        """, (student_id,))

        top_match = cursor.fetchone()

        return jsonify({
            "student_id": student_id,
            "total_recommendations": total_result["total_recommendations"] if total_result else 0,
            "top_match": top_match
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()