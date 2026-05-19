from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def generate_recommendations(student_skills, jobs):
    if not student_skills or not jobs:
        return []

    student_text = " ".join(student_skills)
    job_texts = [" ".join(job.get("skills", [])) for job in jobs]

    corpus = [student_text] + job_texts

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    student_vector = tfidf_matrix[0:1]
    job_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(student_vector, job_vectors).flatten()

    ranked_jobs = []
    for index, score in enumerate(similarities):
        ranked_jobs.append({
            "job_id": jobs[index]["job_id"],
            "title": jobs[index]["title"],
            "skills": jobs[index]["skills"],
            "score": round(float(score), 4)
        })

    ranked_jobs.sort(key=lambda x: x["score"], reverse=True)
    return ranked_jobs[:5]