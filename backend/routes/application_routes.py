from flask import Blueprint, request, jsonify

application_bp = Blueprint("application_bp", __name__)

@application_bp.route("/applications/apply", methods=["POST"])
def apply_job():
    data = request.get_json()

    student_id = data.get("student_id")
    job_id = data.get("job_id")

    if not student_id or not job_id:
        return jsonify({"error": "student_id and job_id are required"}), 400

    return jsonify({
        "message": "Application submitted successfully",
        "student_id": student_id,
        "job_id": job_id
    }), 201


@application_bp.route("/applications/<int:student_id>", methods=["GET"])
def get_applications(student_id):
    return jsonify({
        "student_id": student_id,
        "applications": []
    }), 200


@application_bp.route("/applications/withdraw", methods=["PUT"])
def withdraw_application():
    data = request.get_json()

    student_id = data.get("student_id")
    job_id = data.get("job_id")

    if not student_id or not job_id:
        return jsonify({"error": "student_id and job_id are required"}), 400

    return jsonify({
        "message": "Application withdrawn successfully",
        "student_id": student_id,
        "job_id": job_id
    }), 200