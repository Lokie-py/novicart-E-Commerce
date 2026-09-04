import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt

from security import verify_password

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {"sub": str(user_id), "exp": expire}

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
