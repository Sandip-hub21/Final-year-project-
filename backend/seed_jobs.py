import random
from models.db import get_db_connection

# 100+ realistic job records for your FYP
jobs_data = [
    ("Junior Python Developer", "TechWorks", "Develop backend features using Python and SQL.", ["Python", "SQL", "Git", "Problem Solving"]),
    ("Frontend Developer", "WebWorks", "Build responsive frontend interfaces.", ["React", "JavaScript", "HTML", "CSS"]),
    ("Machine Learning Intern", "AI Labs", "Support ML model development and data preparation.", ["Python", "Machine Learning", "Pandas", "NumPy"]),
    ("Data Analyst", "Insight Ltd", "Analyse datasets and create dashboards.", ["SQL", "Excel", "Tableau", "Data Analysis"]),
    ("Backend Developer", "TechNova", "Create APIs and backend services.", ["Python", "Flask", "REST API", "MySQL"]),
    ("Full Stack Developer", "DigitalCore", "Work across frontend and backend systems.", ["React", "Node.js", "SQL", "Git"]),
    ("Cloud Support Engineer", "CloudNet", "Support cloud infrastructure and deployment.", ["AWS", "Linux", "Docker", "Troubleshooting"]),
    ("Cybersecurity Assistant", "SecureHub", "Assist with monitoring and security checks.", ["Cybersecurity", "Networking", "Linux", "Problem Solving"]),
    ("UI Designer", "CreativeApps", "Design clean user interfaces for web apps.", ["Figma", "UI Design", "UX Design", "Communication"]),
    ("Junior Java Developer", "CodeBase", "Develop Java applications.", ["Java", "Object Oriented Programming", "SQL", "Git"]),
    ("Business Analyst Intern", "BrightData", "Gather requirements and analyse business processes.", ["Business Analysis", "Excel", "Communication", "Critical Thinking"]),
    ("Software Tester", "QualitySoft", "Test web applications and report bugs.", ["Testing", "Selenium", "Problem Solving", "Technical Writing"]),
    ("IT Support Technician", "HelpDesk Pro", "Provide first-line technical support.", ["Helpdesk Support", "Troubleshooting", "Windows Server", "Customer Service"]),
    ("DevOps Assistant", "DeployHub", "Support CI/CD and deployment pipelines.", ["Docker", "CI/CD", "Linux", "GitHub"]),
    ("Database Assistant", "DataBridge", "Support database management and reporting.", ["MySQL", "SQL", "Database Design", "Excel"]),
    ("Mobile App Developer", "Appify", "Build mobile applications.", ["Android", "Kotlin", "Firebase", "API Integration"]),
    ("Digital Marketing Assistant", "MarketFlow", "Support online marketing campaigns.", ["Digital Marketing", "SEO", "Content Writing", "Social Media Marketing"]),
    ("Finance Intern", "FinCore", "Support financial analysis and reporting.", ["Finance", "Excel", "Accounting", "Investment Analysis"]),
    ("Project Coordinator", "AgileWorks", "Assist with project planning and communication.", ["Project Management", "Agile", "Scrum", "Communication"]),
    ("Data Visualisation Analyst", "Vizion Analytics", "Create visual dashboards and reports.", ["Power BI", "Tableau", "Data Visualization", "Statistics"]),
]

# Generate variations to reach 120 jobs
locations = ["London", "Leicester", "Birmingham", "Manchester", "Remote", "Nottingham", "Bristol", "Leeds", "Coventry"]
job_types = ["Full-Time", "Part-Time", "Internship", "Placement", "Remote"]
salary_range = ["£24,000", "£28,000", "£32,000", "£36,000", "£40,000", "£45,000", "£50,000"]

conn = get_db_connection()
cursor = conn.cursor(dictionary=True)

try:
    inserted_jobs = 0
    inserted_links = 0

    # Create 120 jobs by repeating realistic templates with variations
    for i in range(120):
        base_job = jobs_data[i % len(jobs_data)]

        title = base_job[0]
        company = f"{base_job[1]} {i + 1}"
        description = base_job[2]
        selected_skills = base_job[3]

        required_skills = ", ".join(selected_skills)
        salary = random.choice(salary_range)
        location = random.choice(locations)
        job_type = random.choice(job_types)

        # Insert job
        cursor.execute("""
            INSERT INTO jobs
            (
                title,
                company,
                description,
                required_skills,
                salary,
                location,
                job_type,
                posted_by,
                publisher_id,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            title,
            company,
            description,
            required_skills,
            salary,
            location,
            job_type,
            1,
            1,
            "active"
        ))

        job_id = cursor.lastrowid
        inserted_jobs += 1

        # Link skills to job_skills
        for skill_name in selected_skills:
            cursor.execute("""
                SELECT skill_id
                FROM skills
                WHERE LOWER(skill_name) = LOWER(%s)
            """, (skill_name,))

            skill = cursor.fetchone()

            if skill:
                cursor.execute("""
                    INSERT INTO job_skills (job_id, skill_id)
                    VALUES (%s, %s)
                """, (job_id, skill["skill_id"]))

                inserted_links += 1

    conn.commit()

    print("Seed completed successfully.")
    print(f"Jobs inserted: {inserted_jobs}")
    print(f"Job-skill links inserted: {inserted_links}")

except Exception as e:
    conn.rollback()
    print("Seed failed:", e)

finally:
    cursor.close()
    conn.close()