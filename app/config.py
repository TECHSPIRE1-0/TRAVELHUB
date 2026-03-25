from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    RAZORPAY_KEY_ID : str
    RAZORPAY_SECRET : str
    
    EMAIL_USER : str
    EMAIL_PASSWORD : str
    
    EMAIL_HOST : str
    EMAIL_PORT : int
    
    RAZORPAY_WEBHOOK_SECRET : str
    
    GEMINI_API_KEY : str
    COHERE_API_KEY : str
    GROQ_API_KEY : str
    

    class Config:
        env_file = "./.env"


settings = Settings()
