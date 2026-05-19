def clean_text(text):
    if not text:
        return ""
    return text.strip().lower()