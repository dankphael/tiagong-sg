"""
Tiagong Dialect Dictionary FastAPI Application.
Main entry point for the REST API.
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_repository import DataRepository
import api_words


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global repository instance
_repository: DataRepository = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Initializing Tiagong Dialect Dictionary API...")
    global _repository

    data_dir = Path(__file__).parent / "data"
    _repository = DataRepository(str(data_dir))

    # Initialize API router with repository
    api_words.init_router(_repository)

    logger.info("API ready to accept requests")
    logger.info(f"Repository loaded: {_repository.get_statistics()}")

    yield

    # Shutdown
    logger.info("Shutting down Tiagong API...")


# Create FastAPI app
app = FastAPI(
    title="Tiagong Dialect Dictionary API",
    description="Comprehensive REST API for the Singapore dialect dictionary system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_words.router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Status information
    """
    if _repository is None:
        raise HTTPException(status_code=503, detail="Repository not initialized")

    stats = _repository.get_statistics()
    return {
        "status": "healthy",
        "service": "tiagong-dialect-dictionary",
        "version": "1.0.0",
        "repository": stats
    }


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "service": "Tiagong Dialect Dictionary API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi_schema": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
