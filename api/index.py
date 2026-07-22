import sys
import os

# Add the root directory to the python path so 'app.main' and 'backend.app' imports work
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)
sys.path.append(os.path.join(root_dir, "backend"))

from app.main import app

# Inform FastAPI that Vercel is forwarding requests via the /api prefix
app.root_path = "/api"
