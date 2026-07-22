import sys
import os

# Add the root directory to the python path so 'app.main' and 'backend.app' imports work
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)
sys.path.append(os.path.join(root_dir, "backend"))

try:
    from app.main import app
    app.root_path = "/api"
except Exception as e:
    import traceback
    
    # Create a dummy FastAPI app to return the error
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        error_details = f"Vercel Serverless Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}\n\nPython Path: {sys.path}\n\nCWD: {os.getcwd()}\n\nDir contents: {os.listdir(os.getcwd())}"
        return PlainTextResponse(error_details, status_code=500)

