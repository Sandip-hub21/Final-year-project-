import csv
import mysql.connector

# DB connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="job_recommendation_db"
)

cursor = conn.cursor()

with open("../cleaned/jobs_cleaned.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)

    for row in reader:
        title = row["title"].strip()
        company = row["company"].strip()
        skills = row["skills"].split("|")

        # Insert job
        cursor.execute("""
            INSERT INTO jobs (title, company)
            VALUES (%s, %s)
        """, (title, company))

        job_id = cursor.lastrowid

        for skill in skills:
            skill = skill.strip().lower()

            # Check if skill exists
            cursor.execute("""
                SELECT skill_id FROM skills WHERE skill_name = %s
            """, (skill,))
            result = cursor.fetchone()

            if result:
                skill_id = result[0]
            else:
                cursor.execute("""
                    INSERT INTO skills (skill_name)
                    VALUES (%s)
                """, (skill,))
                skill_id = cursor.lastrowid

            # Insert relation
            cursor.execute("""
                INSERT INTO job_skills (job_id, skill_id)
                VALUES (%s, %s)
            """, (job_id, skill_id))

conn.commit()
cursor.close()
conn.close()

print("Jobs imported successfully!")