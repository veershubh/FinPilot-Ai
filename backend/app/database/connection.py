"""
FinPilot AI - Database Connection Setup
==========================================
Async PostgreSQL connection using SQLAlchemy 2.0.

HOW THIS WORKS:
────────────────
SQLAlchemy's async engine lets us perform non-blocking database
operations, which is essential for a FastAPI app that handles
many concurrent requests.

SETUP STEPS (when you're ready to connect a database):
───────────────────────────────────────────────────────
1. Install PostgreSQL locally or use a cloud provider (e.g., Supabase, Neon).
2. Set DATABASE_URL in your .env file:
       DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/finpilot_db
3. Uncomment the engine, session, and dependency code below.
4. Uncomment the ORM models in app/database/models.py.
5. Run `alembic init alembic` to set up migrations.
"""

import os
from typing import AsyncGenerator

# ── SQLAlchemy Imports ────────────────────────────────────────────────────────
# These imports are needed once the database is connected.
# Uncomment them when you have PostgreSQL ready.

# from sqlalchemy.ext.asyncio import (
#     AsyncSession,
#     async_sessionmaker,
#     create_async_engine,
# )
# from sqlalchemy.orm import DeclarativeBase


# ── Database URL ──────────────────────────────────────────────────────────────
# The connection string is loaded from environment variables for security.
# NEVER hardcode database credentials in source code!

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost:5432/finpilot_db",
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ASYNC ENGINE & SESSION FACTORY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# TODO: Uncomment below when PostgreSQL is ready.
#
# The engine manages a connection pool to the database.
# `echo=True` prints SQL queries to the console — useful for debugging,
# but disable it in production for performance.
#
# engine = create_async_engine(
#     DATABASE_URL,
#     echo=True,  # Set to False in production
#     pool_size=5,       # Number of connections to keep open
#     max_overflow=10,   # Extra connections allowed during traffic spikes
# )
#
# The session factory creates new database sessions for each request.
# `expire_on_commit=False` prevents lazy-loading issues in async code.
#
# async_session_factory = async_sessionmaker(
#     engine,
#     class_=AsyncSession,
#     expire_on_commit=False,
# )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BASE MODEL CLASS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# TODO: Uncomment when database is connected.
#
# class Base(DeclarativeBase):
#     """
#     Base class for all SQLAlchemy ORM models.
#
#     All database models in app/database/models.py should inherit from this.
#     SQLAlchemy uses this to track all your models and generate SQL tables.
#     """
#     pass


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEPENDENCY: get_db()
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def get_db() -> AsyncGenerator:
    """
    FastAPI dependency that provides a database session.

    Usage in a route:
        @router.get("/users")
        async def list_users(db: AsyncSession = Depends(get_db)):
            ...

    The session is automatically closed after the request completes,
    even if an exception occurs (thanks to the `finally` block).

    TODO: Uncomment the session logic when PostgreSQL is connected.
    """
    # ── Placeholder implementation ───────────────────────────────────
    # Returns None until the database is actually connected.
    # This lets the app start without a database for development.
    yield None

    # ── Production implementation (uncomment when DB is ready) ───────
    # async with async_session_factory() as session:
    #     try:
    #         yield session
    #         await session.commit()
    #     except Exception:
    #         await session.rollback()
    #         raise
    #     finally:
    #         await session.close()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STARTUP: create_tables()
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def create_tables() -> None:
    """
    Create all database tables on application startup.

    Call this from your FastAPI `lifespan` or `on_startup` event:
        @app.on_event("startup")
        async def startup():
            await create_tables()

    NOTE: In production, you should use Alembic migrations instead
    of auto-creating tables. This function is handy for development.

    TODO: Uncomment when PostgreSQL is connected.
    """
    # ── Placeholder ──────────────────────────────────────────────────
    print("📦 Database: Skipping table creation (no database configured).")
    print("   → Set DATABASE_URL in .env and uncomment connection.py code.")

    # ── Production implementation (uncomment when DB is ready) ───────
    # async with engine.begin() as conn:
    #     # Import all models so SQLAlchemy knows about them
    #     from app.database import models  # noqa: F401
    #
    #     # Create tables that don't exist yet (won't drop existing ones)
    #     await conn.run_sync(Base.metadata.create_all)
    #     print("✅ Database tables created successfully.")
