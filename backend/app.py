from flask import Flask, jsonify
from flask_cors import CORS

# Import all route blueprints
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.job_routes import job_bp
from routes.recommendation_routes import recommendation_bp
from routes.application_routes import application_bp

# Create Flask app
app = Flask(__name__)

# Load configuration
app.config.from_object("config.Config")

# Enable CORS for React frontend
CORS(app)

# =========================================================
# REGISTER BLUEPRINTS
# =========================================================
app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(job_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(application_bp)

# =========================================================
# HOME ROUTE
# =========================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Job Recommendation System Backend is running successfully"
    }), 200


# =========================================================
# RUN FLASK SERVER
# =========================================================
if __name__ == "__main__":
    print("====================================")
    print(" Flask Backend Server Started")
    print(" Job Recommendation System Running")
    print(" http://127.0.0.1:5000")
    print("====================================")

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )