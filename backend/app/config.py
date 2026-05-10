from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://reviewlens:reviewlens@localhost:5432/reviewlens"
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 300  # seconds
    admin_api_key: str = "reviewlens-admin"
    jwt_secret: str = "change-me-in-production-use-a-long-random-string"
    jwt_expiry_days: int = 30
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    cors_origins: list[str] = []  # extra allowed origins, set via CORS_ORIGINS env var
    sentry_dsn: str = ""  # set via SENTRY_DSN env var; empty = disabled
    environment: str = "development"  # set via ENVIRONMENT env var

    class Config:
        env_file = ".env"


settings = Settings()
