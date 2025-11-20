import secrets
import string


def generate_share_token(length: int = 18) -> str:
    # Match Node behavior: base64url-like token of ~length bytes.
    return secrets.token_urlsafe(length)
