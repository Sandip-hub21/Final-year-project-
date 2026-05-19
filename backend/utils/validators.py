def is_valid_email(email):
    return isinstance(email, str) and "@" in email and "." in email