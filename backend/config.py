import os

class Config:
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = ""
    MYSQL_DATABASE = "job_recommendation_db"
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")