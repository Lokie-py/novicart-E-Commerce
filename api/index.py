import sys
import os

# Allow the Vercel function to import our existing backend files
backend_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "backend"
)

sys.path.insert(0, backend_path)

from main import app