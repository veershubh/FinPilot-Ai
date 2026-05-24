"""
FinPilot AI - SQLAlchemy ORM Models
======================================
Database models representing the core entities in FinPilot AI.

CURRENT STATUS: Commented-Out Placeholder
──────────────────────────────────────────
All models below are fully written but commented out. They are
ready to be activated once a PostgreSQL database is connected.

HOW TO ACTIVATE:
────────────────
1. Set up PostgreSQL and configure DATABASE_URL in .env.
2. Uncomment the code in app/database/connection.py.
3. Uncomment ALL model classes below.
4. Run `alembic revision --autogenerate -m "initial models"`
   to create the first migration.
5. Run `alembic upgrade head` to apply it.

MODEL OVERVIEW:
───────────────
┌─────────────────────┬──────────────────────────────────────────┐
│ Model               │ Purpose                                  │
├─────────────────────┼──────────────────────────────────────────┤
│ User                │ Stores registered user accounts           │
│ PurchaseAnalysis    │ Logs each EMI analysis request & result   │
│ FinancialProfile    │ Stores user financial snapshot             │
└─────────────────────┴──────────────────────────────────────────┘
"""

# ── Imports (uncomment when activating models) ───────────────────────────────
#
# import uuid
# from datetime import datetime
# from typing import Optional
#
# from sqlalchemy import (
#     Column,
#     DateTime,
#     Float,
#     ForeignKey,
#     String,
#     Text,
#     func,
# )
# from sqlalchemy.dialects.postgresql import UUID, JSONB
# from sqlalchemy.orm import Mapped, mapped_column, relationship
#
# from app.database.connection import Base


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# USER MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# class User(Base):
#     """
#     Represents a registered user of FinPilot AI.
#
#     Each user can have multiple purchase analyses and one
#     financial profile. The `id` uses UUID for better security
#     (harder to guess than sequential integers).
#     """
#
#     __tablename__ = "users"
#
#     # ── Primary Key ──────────────────────────────────────────────
#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True),
#         primary_key=True,
#         default=uuid.uuid4,
#         comment="Unique user identifier (UUID v4).",
#     )
#
#     # ── User Fields ──────────────────────────────────────────────
#     email: Mapped[str] = mapped_column(
#         String(255),
#         unique=True,
#         nullable=False,
#         index=True,
#         comment="User email address (must be unique).",
#     )
#     name: Mapped[str] = mapped_column(
#         String(100),
#         nullable=False,
#         comment="User display name.",
#     )
#
#     # ── Timestamps ───────────────────────────────────────────────
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         comment="When the user account was created.",
#     )
#
#     # ── Relationships ────────────────────────────────────────────
#     # These let you access related records easily, e.g.:
#     #   user.purchase_analyses  → list of all analyses
#     #   user.financial_profile  → the user's financial snapshot
#     purchase_analyses = relationship(
#         "PurchaseAnalysis",
#         back_populates="user",
#         cascade="all, delete-orphan",
#     )
#     financial_profile = relationship(
#         "FinancialProfile",
#         back_populates="user",
#         uselist=False,  # One-to-one relationship
#         cascade="all, delete-orphan",
#     )
#
#     def __repr__(self) -> str:
#         return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PURCHASE ANALYSIS MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# class PurchaseAnalysis(Base):
#     """
#     Stores the history of EMI vs Full Payment analyses.
#
#     Every time a user submits a purchase for analysis, the input
#     and output are saved here for:
#       - User history & dashboard display
#       - Analytics on common purchase patterns
#       - Audit trail and debugging
#
#     Uses JSONB columns to store flexible request/response data
#     without needing a rigid column-per-field structure.
#     """
#
#     __tablename__ = "purchase_analyses"
#
#     # ── Primary Key ──────────────────────────────────────────────
#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True),
#         primary_key=True,
#         default=uuid.uuid4,
#         comment="Unique analysis identifier.",
#     )
#
#     # ── Foreign Key ──────────────────────────────────────────────
#     user_id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("users.id", ondelete="CASCADE"),
#         nullable=False,
#         index=True,
#         comment="References the user who requested this analysis.",
#     )
#
#     # ── Analysis Data ────────────────────────────────────────────
#     request_data: Mapped[dict] = mapped_column(
#         JSONB,
#         nullable=False,
#         comment="The original request payload (product price, income, etc.).",
#     )
#     result_data: Mapped[dict] = mapped_column(
#         JSONB,
#         nullable=False,
#         comment="The analysis result (recommendation, breakdown, etc.).",
#     )
#
#     # ── Timestamps ───────────────────────────────────────────────
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         comment="When this analysis was performed.",
#     )
#
#     # ── Relationships ────────────────────────────────────────────
#     user = relationship("User", back_populates="purchase_analyses")
#
#     def __repr__(self) -> str:
#         return f"<PurchaseAnalysis(id={self.id}, user_id={self.user_id})>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINANCIAL PROFILE MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# class FinancialProfile(Base):
#     """
#     Stores a user's financial snapshot.
#
#     This is a one-to-one relationship with User. It captures the
#     user's current financial situation so agents can provide
#     personalized recommendations without asking every time.
#
#     TODO: Add fields for investment portfolio, credit score, etc.
#     """
#
#     __tablename__ = "financial_profiles"
#
#     # ── Primary Key ──────────────────────────────────────────────
#     id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True),
#         primary_key=True,
#         default=uuid.uuid4,
#         comment="Unique profile identifier.",
#     )
#
#     # ── Foreign Key ──────────────────────────────────────────────
#     user_id: Mapped[uuid.UUID] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("users.id", ondelete="CASCADE"),
#         unique=True,         # Enforces one profile per user
#         nullable=False,
#         comment="References the user this profile belongs to.",
#     )
#
#     # ── Financial Fields ─────────────────────────────────────────
#     monthly_income: Mapped[float] = mapped_column(
#         Float,
#         nullable=False,
#         default=0.0,
#         comment="User's total monthly income (in ₹).",
#     )
#     monthly_expenses: Mapped[float] = mapped_column(
#         Float,
#         nullable=False,
#         default=0.0,
#         comment="User's total monthly expenses (in ₹).",
#     )
#     savings: Mapped[float] = mapped_column(
#         Float,
#         nullable=False,
#         default=0.0,
#         comment="User's current total savings (in ₹).",
#     )
#     emergency_fund: Mapped[float] = mapped_column(
#         Float,
#         nullable=False,
#         default=0.0,
#         comment="Amount set aside as emergency fund (in ₹).",
#     )
#
#     # ── Timestamps ───────────────────────────────────────────────
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         comment="When this profile was created.",
#     )
#     updated_at: Mapped[Optional[datetime]] = mapped_column(
#         DateTime(timezone=True),
#         onupdate=func.now(),
#         nullable=True,
#         comment="When this profile was last updated.",
#     )
#
#     # ── Relationships ────────────────────────────────────────────
#     user = relationship("User", back_populates="financial_profile")
#
#     def __repr__(self) -> str:
#         return (
#             f"<FinancialProfile(id={self.id}, user_id={self.user_id}, "
#             f"income={self.monthly_income}, expenses={self.monthly_expenses})>"
#         )
