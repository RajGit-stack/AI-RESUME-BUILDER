from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
import app.models as models
from app.schemas import TokenData

# OAuth2 scheme for FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# ===================== Password Utils =====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as e:
        print(f"[AUTH][ERROR] Password verification failed: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


# ===================== JWT Token Utils =====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    try:
        print(f"[AUTH] Creating access token for data: {data}")

        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})

        # ✅ Always ensure 'sub' is a string (required by JWT spec)
        if "user_id" in to_encode:
            to_encode["sub"] = str(to_encode.pop("user_id"))
        elif "sub" in to_encode:
            to_encode["sub"] = str(to_encode["sub"])

        print(f"[AUTH] Payload before encoding: {to_encode}")

        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        print(f"[AUTH] Encoded JWT: {encoded_jwt}")

        return encoded_jwt

    except Exception as e:
        print(f"[AUTH][ERROR] Failed to create access token: {e}")
        raise


# ===================== User Retrieval =====================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Retrieve the currently authenticated user from the token"""
    print("\n========== AUTH DEBUG START ==========")
    print(f"[AUTH] Incoming token: {token}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"[AUTH] Decoded Payload: {payload}")

        user_id_str = payload.get("sub")
        if user_id_str is None:
            print("[AUTH][ERROR] Missing 'sub' in payload")
            raise credentials_exception

        # ✅ Convert string safely back to int
        try:
            user_id = int(user_id_str)
        except ValueError as e:
            print(f"[AUTH][ERROR] 'sub' conversion error: {e}")
            raise credentials_exception

        token_data = TokenData(user_id=user_id)

    except JWTError as e:
        print(f"[AUTH][ERROR] JWTError while decoding: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"[AUTH][ERROR] Unexpected decoding error: {e}")
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if not user:
        print(f"[AUTH][ERROR] No user found for ID {token_data.user_id}")
        raise credentials_exception

    print(f"[AUTH] Authenticated user: {user.email if hasattr(user, 'email') else user.id}")
    print("========== AUTH DEBUG END ==========\n")

    return user
