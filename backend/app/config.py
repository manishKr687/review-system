from pydantic import model_validator
from pydantic_settings import BaseSettings

_INSECURE_JWT = "change-me-in-production-use-a-long-random-string"
_INSECURE_ADMIN = "reviewlens-admin"


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://reviewlens:reviewlens@localhost:5432/reviewlens"
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 300
    admin_api_key: str = _INSECURE_ADMIN
    jwt_secret: str = _INSECURE_JWT
    jwt_expiry_days: int = 30
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    cors_origins: list[str] = []
    sentry_dsn: str = ""
    environment: str = "development"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_tls: bool = True
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@reviewlens.app"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def secure_cookies(self) -> bool:
        return self.is_production

    @model_validator(mode="after")
    def reject_insecure_defaults_in_production(self) -> "Settings":
        if self.environment == "production":
            if self.jwt_secret == _INSECURE_JWT:
                raise ValueError("JWT_SECRET must be set to a secure value in production")
            if self.admin_api_key == _INSECURE_ADMIN:
                raise ValueError("ADMIN_API_KEY must be set to a secure value in production")
        return self

    class Config:
        env_file = ".env"


settings = Settings()
