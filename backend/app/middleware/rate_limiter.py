"""
FinPilot AI - Rate Limiter Middleware
========================================
Simple in-memory rate limiter to prevent API abuse.

IMPORTANT: This is a development/demo rate limiter using an
in-memory dictionary. It will NOT work correctly behind a
load balancer with multiple server instances.

For production, use one of these alternatives:
  - Redis-based rate limiting (e.g., `slowapi` library)
  - API Gateway rate limiting (AWS API Gateway, Kong, etc.)
  - Cloudflare / Nginx rate limiting at the proxy level
"""

import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


# Default: 60 requests per minute per IP address
DEFAULT_RATE_LIMIT = 60
DEFAULT_WINDOW_SECONDS = 60


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory rate limiter that tracks requests per client IP.

    How it works:
    1. For each incoming request, get the client's IP address.
    2. Store the timestamp of each request in a list.
    3. Remove timestamps older than the time window.
    4. If the number of remaining timestamps exceeds the limit → 429.

    Usage in main.py:
        from app.middleware.rate_limiter import RateLimiterMiddleware
        app.add_middleware(
            RateLimiterMiddleware,
            max_requests=60,
            window_seconds=60
        )
    """

    def __init__(
        self,
        app,
        max_requests: int = DEFAULT_RATE_LIMIT,
        window_seconds: int = DEFAULT_WINDOW_SECONDS,
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # Dict mapping client IP → list of request timestamps
        self._request_log: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Get client IP (supports proxied requests)
        client_ip = request.client.host if request.client else "unknown"

        # Skip rate limiting for health checks
        if request.url.path in ("/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        # Current timestamp
        now = time.time()

        # Clean up old timestamps outside the current window
        self._request_log[client_ip] = [
            ts
            for ts in self._request_log[client_ip]
            if now - ts < self.window_seconds
        ]

        # Check if the client has exceeded the rate limit
        if len(self._request_log[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": (
                        f"Too many requests. Limit is {self.max_requests} "
                        f"per {self.window_seconds} seconds."
                    ),
                    "retry_after": self.window_seconds,
                },
                headers={
                    "Retry-After": str(self.window_seconds),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # Record this request
        self._request_log[client_ip].append(now)
        remaining = self.max_requests - len(self._request_log[client_ip])

        # Process the request
        response = await call_next(request)

        # Add rate limit headers to the response
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
