"""
FinPilot AI - Request Logger Middleware
==========================================
Logs every incoming HTTP request with method, path, status code,
and response duration. Also generates a unique request ID.

This is essential for:
  - Debugging issues in production
  - Monitoring API performance
  - Tracing requests across services
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Set up a named logger for this module
logger = logging.getLogger("finpilot.requests")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs details for every HTTP request.

    For each request, it logs:
      - A unique request ID (UUID4)
      - HTTP method (GET, POST, etc.)
      - Request path
      - Response status code
      - Response time in milliseconds

    Usage in main.py:
        from app.middleware.request_logger import RequestLoggerMiddleware
        app.add_middleware(RequestLoggerMiddleware)
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate a unique ID for this request
        request_id = str(uuid.uuid4())[:8]

        # Record the start time
        start_time = time.perf_counter()

        # Log the incoming request
        logger.info(
            f"[{request_id}] --> {request.method} {request.url.path}"
        )

        # Process the request through the route handler
        response = await call_next(request)

        # Calculate how long the request took
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Log the response
        logger.info(
            f"[{request_id}] <-- {response.status_code} | {duration_ms}ms"
        )

        # Add request ID to response headers for client-side debugging
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        return response
