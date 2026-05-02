from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://reviewlens:reviewlens@localhost:5432/reviewlens"
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 300  # seconds
    admin_api_key: str = "reviewlens-admin"

    class Config:
        env_file = ".env"


settings = Settings()
