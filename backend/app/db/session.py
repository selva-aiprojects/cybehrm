# app/db/session.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create asynchronous engine
# pool_pre_ping=True verifies connections before using them
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
    connect_args={"server_settings": {"statement_timeout": "30000"}}
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

from sqlalchemy import MetaData
metadata = MetaData()
Base = declarative_base(metadata=metadata)

# FastAPI DB Dependency Injection Generator
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
