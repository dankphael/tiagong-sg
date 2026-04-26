# Tiagong Dialect Dictionary Backend

## Overview

The Tiagong backend implements a **file-based, scalable linguistic data system** for managing a comprehensive dialect dictionary. This system stores all data as structured JSON files, making it perfect for version control (Git), easy backups, and straightforward migration to SQL later.

### Key Characteristics

- **No SQL dependency** — All data in JSON files (version-controllable, portable)
- **Production-ready validation** — Pydantic models enforce schema integrity
- **Fast search** — In-memory indexing eliminates disk I/O for queries
- **Thread-safe writes** — File locking prevents concurrent modification issues
- **REST API** — FastAPI endpoints for all dictionary operations
- **Migration-ready** — Designed so repository can be swapped for SQL with no API changes

---

## System Architecture

### File Structure

```
backend/
├── __init__.py                 # Package marker
├── main.py                     # FastAPI app entry point
├── schemas.py                  # Pydantic data models
├── data_repository.py          # Data access layer (file I/O + indexing)
├── api_words.py                # FastAPI router (REST endpoints)
├── init_data.py                # Data initialization script
├── data/                        # JSON data files (created by init_data.py)
│   ├── dialects.json          # Master list of dialect groups
│   └── dictionary.json        # All word entries across dialects
└── README.md                    # This file
```

### Data Files

#### `dialects.json`
Master list of supported dialects.

**Structure:**
```json
{
  "dialects": [
    {
      "id": "hokkien",
      "name": "Hokkien",
      "chinese": "福建话",
      "region": "Fujian Province",
      "speakers_sg": "~40%",
      "romanization_systems": ["poj", "ipa"],
      "color": "#C0392B",
      "iso_639_3": "nan"
    }
  ],
  "version": "1.0",
  "last_updated": "2024-01-01T00:00:00"
}
```

#### `dictionary.json`
All word entries across all dialects.

**Structure:**
```json
{
  "words": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "headword": {
        "traditional": "你好",
        "simplified": "你好",
        "romanized": "li ho",
        "english_pinyin": null
      },
      "dialect": "hokkien",
      "part_of_speech": "interjection",
      "definitions": [
        {
          "order": 1,
          "english": "Hello, how are you?",
          "mandarin": "你好",
          "examples": [
            {
              "text_source_lang": "Lí hó! Chiah pa buay?",
              "text_target_lang": "Hello! Have you eaten?",
              "source_dialect": "hokkien",
              "context": "Greeting",
              "formality": "informal"
            }
          ],
          "notes": null
        }
      ],
      "pronunciations": [
        {
          "type": "colloquial",
          "romanization_system": "poj",
          "romanization": "li ho",
          "ipa": "[li˧ ho˧]",
          "audio_file": "audio/hokkien/li-ho.mp3",
          "tone_marks": "high"
        }
      ],
      "etymology": {
        "origin": "Middle Chinese",
        "notes": "Cognate with Mandarin 你好",
        "related_words": [],
        "cognates": "Mandarin 你好 (nǐ hǎo)"
      },
      "tags": ["greetings", "politeness"],
      "frequency": "very_common",
      "register": "informal",
      "related_words": [],
      "antonyms": [],
      "synonyms": [],
      "source": "community_verified",
      "verified_by": "user_123",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "notes": null
    }
  ],
  "metadata": {
    "version": "1.0",
    "total_words": 0,
    "last_updated": "2024-01-01T00:00:00",
    "languages_included": ["hokkien"],
    "created_date": "2024-01-01T00:00:00"
  }
}
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
pip install fastapi uvicorn pydantic python-multipart
```

### 2. Initialize Data Files

```bash
cd backend
python init_data.py --with-sample
```

This creates:
- Empty `data/dialects.json` with 5 sample Singapore dialects
- Empty `data/dictionary.json` with correct structure

### 3. Start the API Server

```bash
python main.py
```

Server runs on `http://localhost:8000`

API documentation available at `http://localhost:8000/docs` (Swagger UI)

---

## Data Access Layer (Repository)

### Overview

The `DataRepository` class manages all file I/O, caching, and search operations. It's abstracted so the REST API doesn't know whether data comes from JSON files or a SQL database.

### Key Features

**In-Memory Indexing**
- On load, builds 4 indexes for O(1) or O(n) lookups:
  - `_index_by_id`: Word ID → Word
  - `_index_by_dialect`: Dialect → List[Word]
  - `_index_by_tags`: Tag → Set[Word IDs]
  - `_index_by_headword`: Headword → Set[Word IDs]

**Search Operations**
- `search_words()`: Advanced filters (dialect, tags, POS, frequency, romanization system)
- `search_headword()`: Fast index-based headword lookup
- Query matching: Case-insensitive substring match on meaning, romanization, headword, Chinese characters

**Write Operations**
- `add_word()`: Add single word
- `add_words_bulk()`: Add up to 10k words in one transaction
- `update_word()`: Update existing word
- `delete_word()`: Remove word

**Thread Safety**
- File writes protected by `threading.RLock()`
- Prevents simultaneous modifications to JSON files

### Usage Example

```python
from data_repository import DataRepository
from schemas import WordCreateRequest, SearchFilters

# Initialize repository
repo = DataRepository("backend/data")

# Add a word
word_data = WordCreateRequest(
    headword={"traditional": "謝謝", "simplified": "谢谢", "romanized": "tsia tsia"},
    dialect="hokkien",
    part_of_speech="interjection",
    definitions=[{
        "order": 1,
        "english": "Thank you",
        "examples": []
    }],
    tags=["politeness"]
)
new_word = repo.add_word(word_data)

# Search
filters = SearchFilters(query="thank", dialects=["hokkien"], limit=10)
results = repo.search_words(filters)

# Get statistics
stats = repo.get_statistics()
print(f"Total words: {stats['total_words']}")
```

---

## REST API Endpoints

### Base URL
`http://localhost:8000/api/v1`

### Dialect Endpoints

#### GET `/dialects`
List all available dialects.

**Response:**
```json
[
  {
    "id": "hokkien",
    "name": "Hokkien",
    "chinese": "福建话",
    ...
  }
]
```

### Word Retrieval

#### GET `/words/{word_id}`
Get single word by ID.

**Example:** `GET /words/550e8400-e29b-41d4-a716-446655440000`

**Response:** Full Word object

---

#### GET `/words`
Advanced search with multiple filters.

**Query Parameters:**
- `q` (string): Search term (matches meaning, romanization, headword)
- `dialects` (string): Comma-separated dialect IDs (e.g., `hokkien,cantonese`)
- `tags` (string): Comma-separated tags (e.g., `food,greetings`)
- `pos` (string): Comma-separated parts of speech
- `frequency` (string): Comma-separated frequency levels
- `romanization` (string): Romanization system filter
- `limit` (int): Results per page (default 50, max 1000)
- `offset` (int): Pagination offset (default 0)

**Example:**
```
GET /words?q=hello&dialects=hokkien,cantonese&tags=greetings&limit=20
```

**Response:**
```json
[
  {
    "id": "...",
    "headword": {...},
    "definitions": [...],
    ...
  }
]
```

---

#### GET `/words/by-dialect/{dialect_id}`
Get all words in a dialect.

**Example:** `GET /words/by-dialect/hokkien?limit=50&offset=0`

---

#### GET `/words/by-tag/{tag}`
Get all words with a tag.

**Example:** `GET /words/by-tag/food?limit=100`

---

#### GET `/words/search/{term}`
Fast headword search (index-based, ideal for autocomplete).

**Query Parameters:**
- `dialect` (string, optional): Filter by single dialect
- `limit` (int, default 20, max 100)
- `offset` (int, default 0)

**Example:** `GET /words/search/li?dialect=hokkien&limit=10`

---

### Word Creation & Modification

#### POST `/words`
Create a single word.

**Request Body:**
```json
{
  "headword": {
    "traditional": "謝謝",
    "simplified": "谢谢",
    "romanized": "tsia tsia"
  },
  "dialect": "hokkien",
  "part_of_speech": "interjection",
  "definitions": [
    {
      "order": 1,
      "english": "Thank you",
      "examples": []
    }
  ],
  "tags": ["politeness"],
  "frequency": "very_common",
  "source": "community_verified"
}
```

**Response:** Created Word object (HTTP 201)

---

#### POST `/words/bulk`
Create multiple words (up to 10k per request).

**Request Body:**
```json
{
  "words": [
    {
      "headword": {...},
      "dialect": "hokkien",
      ...
    },
    ...
  ],
  "source": "academic",
  "verified_by": "linguist_123"
}
```

**Response:** Array of created Words (HTTP 201)

---

#### PUT `/words/{word_id}`
Update existing word (partial updates).

**Request Body:**
```json
{
  "definitions": [{...}],
  "tags": ["food", "cooking"],
  "frequency": "common",
  "verified_by": "user_456"
}
```

**Response:** Updated Word object

---

#### DELETE `/words/{word_id}`
Delete a word.

**Response:** HTTP 204 No Content

---

### Metadata

#### GET `/statistics`
Repository statistics.

**Response:**
```json
{
  "total_words": 1234,
  "total_dialects": 5,
  "words_per_dialect": {
    "hokkien": 400,
    "cantonese": 300,
    "teochew": 250,
    "hakka": 150,
    "hainanese": 134
  },
  "total_tags": 45,
  "last_updated": "2024-01-15T12:30:00"
}
```

---

#### POST `/reload`
Reload data from disk (after external file modifications).

**Response:** HTTP 204 No Content

---

#### GET `/health`
Health check.

**Response:**
```json
{
  "status": "healthy",
  "service": "tiagong-dialect-dictionary",
  "version": "1.0.0",
  "repository": {...statistics...}
}
```

---

## Data Validation & Pydantic Models

All incoming and outgoing data is validated against Pydantic models defined in `schemas.py`.

**Key Models:**
- `Dialect`: Single dialect definition
- `Headword`: Orthography variations (traditional, simplified, romanized)
- `Pronunciation`: Single pronunciation variant with IPA, romanization, audio file
- `Definition`: Single meaning with examples
- `Example`: Usage sentence with translation
- `Etymology`: Word origin and cognates
- `Word`: Complete word entry
- `Dictionary`: Container for all words
- `WordCreateRequest`: Schema for POST /words
- `WordUpdateRequest`: Schema for PUT /words/{id}
- `BulkWordCreateRequest`: Schema for POST /words/bulk
- `SearchFilters`: Schema for GET /words query parameters

**Validation Features:**
- Type enforcement (strings, enums, arrays, nested objects)
- Required field validation
- String length constraints
- Enum value validation (part of speech, frequency, romanization systems)
- Timestamp format validation (ISO 8601)
- UUID auto-generation for word IDs

---

## Indexing & Performance

### Index Strategy

1. **ID Index** (`_index_by_id`)
   - Type: Dict[str, Word]
   - Lookup: O(1)
   - Usage: GET /words/{id}

2. **Dialect Index** (`_index_by_dialect`)
   - Type: Dict[str, List[Word]]
   - Lookup: O(1) for dialect list, O(n) for filtered results
   - Usage: GET /words/by-dialect/{dialect_id}

3. **Tag Index** (`_index_by_tags`)
   - Type: Dict[str, Set[str]] (tag → word IDs)
   - Lookup: O(1)
   - Usage: GET /words/by-tag/{tag}

4. **Headword Index** (`_index_by_headword`)
   - Type: Dict[str, Set[str]] (lowercase headword → word IDs)
   - Lookup: O(1)
   - Usage: GET /words/search/{term} (fast autocomplete)

### Search Performance

- **Simple searches** (by ID, dialect, tag): O(1) or O(k) where k = words in category
- **Text search** (full dictionary scan): O(n * m) where n = words, m = fields per word
  - Mitigated by query preprocessing and early termination on match

### In-Memory Cache

- All words loaded into memory on startup (~2-5 MB for 10k words)
- Indexes rebuilt after writes (adds ~10-50ms for bulk operations)
- No disk access except on write

---

## Migration Path to SQL

To migrate from JSON to SQL later:

1. Create a new class `SQLRepository(BaseRepository)` implementing the same interface
2. SQLRepository reads/writes from PostgreSQL instead of JSON
3. Swap in main.py: `_repository = SQLRepository()` instead of `DataRepository()`
4. All API endpoints work unchanged

**Same interface means:**
- `get_word_by_id(id)` → Same signature, same return type
- `search_words(filters)` → Same parameters, same results
- `add_word(request)` → Same request format
- API layer needs zero changes

---

## Bulk Data Ingestion Guide

For the next AI agent ingesting thousands of words, use the bulk endpoint:

### Bulk Ingestion Format

```python
import requests
from backend.schemas import WordCreateRequest, BulkWordCreateRequest

# Prepare words
words_to_insert = [
    WordCreateRequest(
        headword={
            "traditional": "你好",
            "simplified": "你好",
            "romanized": "li ho"
        },
        dialect="hokkien",
        part_of_speech="interjection",
        definitions=[{
            "order": 1,
            "english": "Hello",
            "examples": []
        }],
        tags=["greetings"],
        source="academic"
    ),
    # ... more words ...
]

# Send bulk request
bulk_request = BulkWordCreateRequest(
    words=words_to_insert,
    source="academic",
    verified_by="ai_agent_v1"
)

response = requests.post(
    "http://localhost:8000/api/v1/words/bulk",
    json=bulk_request.model_dump(mode='json'),
    params={"source": "academic"}
)

# Returns list of created Words with assigned IDs
created = response.json()
print(f"Ingested {len(created)} words")
```

### Best Practices

1. **Batch size**: Send 100-1000 words per request (avoid timeout)
2. **Source tracking**: Always set `source` field (for data provenance)
3. **Validation**: Pydantic validates every field; invalid data is rejected with clear error messages
4. **Atomicity**: Bulk operation either fully succeeds or fully fails (no partial inserts)
5. **Deduplication**: Check `GET /words/search/{term}` before inserting to avoid duplicates

### Example Validation Error

```json
{
  "detail": [
    {
      "type": "enum",
      "loc": ["words", 0, "part_of_speech"],
      "msg": "Input should be 'noun', 'verb', 'adjective', etc.",
      "input": "invalid_pos"
    }
  ]
}
```

---

## Configuration & Environment

### Environment Variables

Create a `.env` file (optional):
```
DATA_DIR=backend/data
LOG_LEVEL=INFO
CORS_ORIGINS=*
```

### Logging

Configure in `main.py`:
```python
logging.basicConfig(level=logging.INFO)
```

Logs appear in stdout:
```
2024-01-15 12:30:45,123 - root - INFO - Repository loaded: 1234 words indexed
```

---

## Testing

### Manual API Testing

Using `curl`:
```bash
# Get all dialects
curl http://localhost:8000/api/v1/dialects

# Search
curl "http://localhost:8000/api/v1/words?q=hello&dialects=hokkien"

# Create word
curl -X POST http://localhost:8000/api/v1/words \
  -H "Content-Type: application/json" \
  -d '{"headword": {...}, ...}'
```

### Using Swagger UI

Open `http://localhost:8000/docs` in browser to:
- Explore all endpoints
- Test requests with built-in UI
- See response schemas

---

## Troubleshooting

### "Repository not initialized"
- Ensure `init_data.py` ran successfully
- Check `backend/data/` directory exists with JSON files

### "Word not found" (404)
- Verify word ID is correct (UUIDs are case-sensitive)
- Check word hasn't been deleted
- Use search endpoints to find words

### "Invalid request body"
- Pydantic error message shows exact field and constraint that failed
- Common: enum values, required fields, type mismatches
- Refer to `schemas.py` for valid options

### Slow searches
- Ensure repository initialized (indexes built)
- Use `/words/search/{term}` for headword lookup (faster than full search)
- Limit results to necessary amount

---

## License & Attribution

Part of the Tiagong dialect learning platform.
