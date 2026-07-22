"""
FastAPI router for dialect dictionary word endpoints.
Provides REST API access to the word repository.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging

from schemas import (
    Word, WordResponse, WordCreateRequest, WordUpdateRequest,
    BulkWordCreateRequest, SearchFilters, Dialect,
    PartOfSpeechEnum, FrequencyEnum, RomanizationSystemEnum
)
from data_repository import DataRepository

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v1", tags=["words"])

# Repository instance (initialized once at app startup)
_repository: Optional[DataRepository] = None


def init_router(repository: DataRepository):
    """Initialize the router with a repository instance."""
    global _repository
    _repository = repository


def get_repository() -> DataRepository:
    """Get the repository instance."""
    if _repository is None:
        raise RuntimeError("Repository not initialized. Call init_router() at app startup.")
    return _repository


# === DIALECT ENDPOINTS ===

@router.get("/dialects", response_model=List[Dialect])
async def get_dialects():
    """
    Retrieve all available dialects.

    Returns:
        List of Dialect objects
    """
    repo = get_repository()
    return repo.get_all_dialects()


# === WORD RETRIEVAL ENDPOINTS ===

@router.get("/words/{word_id}", response_model=WordResponse)
async def get_word(word_id: str):
    """
    Retrieve a single word by ID.

    Args:
        word_id: Unique word ID (UUID)

    Returns:
        Word object with full details

    Raises:
        404: Word not found
    """
    repo = get_repository()
    word = repo.get_word_by_id(word_id)

    if not word:
        raise HTTPException(status_code=404, detail=f"Word {word_id} not found")

    return word


@router.get("/words/by-dialect/{dialect_id}", response_model=List[WordResponse])
async def get_words_by_dialect(
    dialect_id: str,
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Retrieve all words in a specific dialect.

    Args:
        dialect_id: Dialect ID (e.g., 'hokkien')
        limit: Number of results (default 50)
        offset: Result offset for pagination (default 0)

    Returns:
        List of Word objects
    """
    repo = get_repository()
    words = repo.get_words_by_dialect(dialect_id)
    return words[offset : offset + limit]


@router.get("/words/by-tag/{tag}", response_model=List[WordResponse])
async def get_words_by_tag(
    tag: str,
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Retrieve all words with a specific tag.

    Args:
        tag: Tag name (e.g., 'food', 'greetings')
        limit: Number of results
        offset: Result offset

    Returns:
        List of Word objects
    """
    repo = get_repository()
    words = repo.get_words_by_tag(tag)
    return words[offset : offset + limit]


# === SEARCH ENDPOINT ===

@router.get("/words", response_model=List[WordResponse])
async def search_words(
    q: Optional[str] = Query(None, description="Search query"),
    dialects: Optional[str] = Query(None, description="Comma-separated dialect IDs"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    pos: Optional[str] = Query(None, description="Comma-separated parts of speech"),
    frequency: Optional[str] = Query(None, description="Comma-separated frequency levels"),
    romanization: Optional[str] = Query(None, description="Romanization system"),
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Advanced search across the dictionary.

    Query Parameters:
        q: Search term (matches meaning, romanization, headword)
        dialects: Filter by dialect(s) (e.g., 'hokkien,cantonese')
        tags: Filter by tag(s) (e.g., 'food,greetings')
        pos: Filter by part of speech
        frequency: Filter by frequency level
        romanization: Filter by romanization system
        limit: Results per page
        offset: Pagination offset

    Example:
        GET /words?q=hello&dialects=hokkien,cantonese&tags=greetings

    Returns:
        List of matching Word objects
    """
    repo = get_repository()

    # Parse comma-separated parameters
    dialect_list = [d.strip() for d in dialects.split(",")] if dialects else None
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    pos_list = None
    if pos:
        pos_list = [PartOfSpeechEnum(p.strip()) for p in pos.split(",")]
    freq_list = None
    if frequency:
        freq_list = [FrequencyEnum(f.strip()) for f in frequency.split(",")]
    rom_system = RomanizationSystemEnum(romanization) if romanization else None

    # Build filters
    filters = SearchFilters(
        query=q,
        dialects=dialect_list,
        tags=tag_list,
        part_of_speech=pos_list,
        frequency=freq_list,
        romanization_system=rom_system,
        limit=limit,
        offset=offset
    )

    words = repo.search_words(filters)
    return words


@router.get("/words/search/{term}", response_model=List[WordResponse])
async def search_headword(
    term: str,
    dialect: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Fast headword search (index-based).

    Args:
        term: Headword term
        dialect: Optional dialect filter
        limit: Results limit
        offset: Pagination offset

    Returns:
        List of matching words
    """
    repo = get_repository()
    words = repo.search_headword(term, dialect)
    return words[offset : offset + limit]


# === WORD CREATION/MODIFICATION ENDPOINTS ===

@router.post("/words", response_model=WordResponse, status_code=201)
async def create_word(word_data: WordCreateRequest):
    """
    Create a new word entry.

    Request Body:
        WordCreateRequest with word details

    Returns:
        Created Word object with assigned ID
    """
    repo = get_repository()
    try:
        word = repo.add_word(word_data)
        return word
    except Exception as e:
        logger.error(f"Error creating word: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/words/bulk", response_model=List[WordResponse], status_code=201)
async def create_words_bulk(bulk_request: BulkWordCreateRequest):
    """
    Create multiple words in a single operation (bulk ingestion).

    Request Body:
        BulkWordCreateRequest with array of word data

    Max: 10,000 words per request

    Returns:
        List of created Word objects
    """
    repo = get_repository()
    try:
        words = repo.add_words_bulk(bulk_request.words)
        logger.info(f"Bulk created {len(words)} words")
        return words
    except Exception as e:
        logger.error(f"Error in bulk word creation: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/words/{word_id}", response_model=WordResponse)
async def update_word(word_id: str, updates: WordUpdateRequest):
    """
    Update an existing word.

    Args:
        word_id: Word ID to update
        updates: WordUpdateRequest with fields to update

    Returns:
        Updated Word object

    Raises:
        404: Word not found
    """
    repo = get_repository()

    # Convert Pydantic model to dict, excluding None values
    update_dict = updates.model_dump(exclude_none=True)

    word = repo.update_word(word_id, update_dict)
    if not word:
        raise HTTPException(status_code=404, detail=f"Word {word_id} not found")

    return word


@router.delete("/words/{word_id}", status_code=204)
async def delete_word(word_id: str):
    """
    Delete a word from the dictionary.

    Args:
        word_id: Word ID to delete

    Raises:
        404: Word not found
    """
    repo = get_repository()
    deleted = repo.delete_word(word_id)

    if not deleted:
        raise HTTPException(status_code=404, detail=f"Word {word_id} not found")

    return None


# === STATISTICS & METADATA ENDPOINTS ===

@router.get("/statistics")
async def get_statistics():
    """
    Get repository statistics.

    Returns:
        Dictionary with total words, dialects, words per dialect, etc.
    """
    repo = get_repository()
    return repo.get_statistics()


@router.post("/reload", status_code=204)
async def reload_data():
    """
    Reload data from disk.
    Useful after external file modifications.
    """
    repo = get_repository()
    repo.reload_from_disk()
    return None
