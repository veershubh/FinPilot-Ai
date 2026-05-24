"""
FinPilot AI - Server Entry Point
====================================
Run this file directly to start the development server:

    python run.py

Or use uvicorn directly:

    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import uvicorn
from app.config import settings


if __name__ == "__main__":
    print(f"\n>> Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"   Environment: {settings.APP_ENV}")
    print(f"   Server: http://{settings.HOST}:{settings.PORT}")
    print(f"   API Docs: http://localhost:{settings.PORT}/docs")
    print(f"   Health: http://localhost:{settings.PORT}/health\n")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
