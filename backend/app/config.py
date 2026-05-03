from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://reviewlens:reviewlens@localhost:5432/reviewlens"
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 300  # seconds
    admin_api_key: str = "reviewlens-admin"
    cors_origins: list[str] = []  # extra allowed origins, set via CORS_ORIGINS env var
    sentry_dsn: str = ""  # set via SENTRY_DSN env var; empty = disabled
    environment: str = "development"  # set via ENVIRONMENT env var

    class Config:
        env_file = ".env"


settings = Settings()
