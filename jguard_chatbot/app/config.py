import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
PORT = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
