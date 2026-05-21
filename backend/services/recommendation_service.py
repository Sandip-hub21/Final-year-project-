def generate_recommendations(student_skills, jobs):
    """
    Generate job recommendations using direct skill matching.

    The recommendation score is calculated as:
    matched skills / total job skills

    This makes the recommendation engine explainable because
    the system can clearly show matched and missing skills.
    """

    if not student_skills or not jobs:
        return []

    # Clean student skills and remove duplicates
    student_skill_set = set(
        skill.strip().lower()
        for skill in student_skills
        if skill and skill.strip()
    )

    ranked_jobs = []

    for job in jobs:
        # Clean job skills and remove duplicates
        job_skill_set = set(
            skill.strip().lower()
            for skill in job.get("skills", [])
            if skill and skill.strip()
        )

        if not job_skill_set:
            continue

        matched_skills = student_skill_set.intersection(job_skill_set)

        # Main explainable score
        score = len(matched_skills) / len(job_skill_set)

        # Ignore jobs with no matched skills
        if score == 0:
            continue

        ranked_jobs.append({
            "job_id": job["job_id"],
            "title": job["title"],
            "company": job.get("company"),
            "description": job.get("description"),
            "job_type": job.get("job_type"),
            "salary": job.get("salary"),
            "location": job.get("location"),
            "skills": list(job_skill_set),
            "score": round(float(score), 4)
        })

    # Sort by highest match score first
    ranked_jobs.sort(key=lambda x: x["score"], reverse=True)

    # Return top 20 recommendations
    return ranked_jobs[:20]