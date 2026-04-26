"""
Pydantic schemas for the Tiagong Dialect Dictionary system.
These models define the exact structure of all JSON data stored in the repository.
Serves as the Single Source of Truth for data validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid


class PartOfSpeechEnum(str, Enum):
    """Part of speech classifications."""
    NOUN = "noun"
    VERB = "verb"
    ADJECTIVE = "adjective"
    ADVERB = "adverb"
    INTERJECTION = "interjection"
    PARTICLE = "particle"
    PREPOSITION = "preposition"
    CONJUNCTION = "conjunction"
    CLASSIFIER = "classifier"
    MEASURE_WORD = "measure_word"
    PHRASE = "phrase"
    EXPRESSION = "expression"
    OTHER = "other"


class FrequencyEnum(str, Enum):
    """Word frequency categories."""
    VERY_COMMON = "very_common"
    COMMON = "common"
    MODERATE = "moderate"
    RARE = "rare"
    ARCHAIC = "archaic"


class SourceEnum(str, Enum):
    """Data source indicators."""
    COMMUNITY_VERIFIED = "community_verified"
    ACADEMIC = "academic"
    HISTORICAL_TEXT = "historical_text"
    NATIVE_SPEAKER = "native_speaker"
    CORPUS_DERIVED = "corpus_derived"
    MACHINE_GENERATED = "machine_generated"
    UNVERIFIED = "unverified"


class RomanizationSystemEnum(str, Enum):
    """Romanization system types."""
    POJ = "poj"  # Peh-ōe-jī (Taiwanese Hokkien)
    JYUTPING = "jyutping"  # Cantonese
    IPA = "ipa"  # International Phonetic Alphabet
    PINYIN = "pinyin"  # Mandarin
    YALE = "yale"  # Yale romanization
    WADE_GILES = "wade_giles"
    CUSTOM = "custom"


class Dialect(BaseModel):
    """Master record for a dialect group."""
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1)
    chinese: str = Field(..., min_length=1)
    region: str = Field(..., description="Geographic origin")
    speakers_sg: Optional[str] = Field(None, description="Percentage of speakers in Singapore")
    romanization_systems: List[RomanizationSystemEnum] = Field(default_factory=list)
    color: Optional[str] = Field(None, description="Hex color for UI")
    iso_639_3: Optional[str] = Field(None, description="ISO 639-3 language code")
    notes: Optional[str] = None


class DialectCollection(BaseModel):
    """Container for all dialects."""
    dialects: List[Dialect] = Field(default_factory=list)
    version: str = Field(default="1.0")
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class Headword(BaseModel):
    """Orthography variations of a word."""
    traditional: str = Field(..., description="Traditional Chinese characters")
    simplified: Optional[str] = Field(None, description="Simplified Chinese characters")
    romanized: str = Field(..., description="Primary romanization (usually POJ or other system)")
    english_pinyin: Optional[str] = Field(None, description="Romanized representation in Latin characters")


class Example(BaseModel):
    """Example usage of a word."""
    text_source_lang: str = Field(..., description="Example text in the dialect")
    text_target_lang: str = Field(..., description="English translation")
    source_dialect: str = Field(..., description="Dialect ID")
    context: Optional[str] = Field(None, description="Usage context or situation")
    formality: Optional[str] = Field(None, description="Formal, informal, colloquial, etc.")


class Definition(BaseModel):
    """Single definition/meaning of a word."""
    order: int = Field(..., ge=1, description="Definition order/priority")
    english: str = Field(..., description="English definition")
    mandarin: Optional[str] = Field(None, description="Mandarin Chinese definition for reference")
    examples: List[Example] = Field(default_factory=list)
    notes: Optional[str] = Field(None, description="Additional notes on this definition")


class Pronunciation(BaseModel):
    """Pronunciation variant (literary vs. colloquial, etc.)."""
    type: str = Field(..., description="e.g., 'colloquial', 'literary', 'formal'")
    romanization_system: RomanizationSystemEnum
    romanization: str = Field(..., description="The romanized form")
    ipa: Optional[str] = Field(None, description="International Phonetic Alphabet")
    audio_file: Optional[str] = Field(None, description="Relative path to audio file (e.g., audio/hokkien/word.mp3)")
    tone_marks: Optional[str] = Field(None, description="Tone mark system used in romanization")


class Etymology(BaseModel):
    """Word origin and historical notes."""
    origin: Optional[str] = Field(None, description="e.g., 'Middle Chinese', 'Austroasiatic substrate'")
    notes: Optional[str] = Field(None, description="Etymology details")
    related_words: List[str] = Field(default_factory=list, description="Related word IDs or terms")
    cognates: Optional[str] = Field(None, description="Cognates in other languages/dialects")


class Word(BaseModel):
    """Complete word entry in the dialect dictionary."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier")
    headword: Headword
    dialect: str = Field(..., description="Dialect ID (e.g., 'hokkien')")
    part_of_speech: PartOfSpeechEnum
    definitions: List[Definition] = Field(default_factory=list)
    pronunciations: List[Pronunciation] = Field(default_factory=list)
    etymology: Optional[Etymology] = Field(None)
    tags: List[str] = Field(default_factory=list, description="Categories: food, family, greetings, slang, etc.")
    frequency: FrequencyEnum = FrequencyEnum.MODERATE
    register: Optional[str] = Field(None, description="Register: formal, informal, colloquial, slang")
    related_words: List[str] = Field(default_factory=list, description="IDs of semantically related words")
    antonyms: List[str] = Field(default_factory=list, description="IDs of opposite meaning words")
    synonyms: List[str] = Field(default_factory=list, description="IDs of similar meaning words")
    source: SourceEnum = SourceEnum.UNVERIFIED
    verified_by: Optional[str] = Field(None, description="Username or ID of verifier")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(None, description="Internal notes (not shown to users)")

    model_config = ConfigDict(use_enum_values=False)


class DictionaryMetadata(BaseModel):
    """Metadata about the dictionary as a whole."""
    version: str = Field(default="1.0")
    total_words: int = Field(default=0)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    languages_included: List[str] = Field(default_factory=list)
    created_date: datetime = Field(default_factory=datetime.utcnow)


class Dictionary(BaseModel):
    """Container for all words in the dictionary."""
    words: List[Word] = Field(default_factory=list)
    metadata: DictionaryMetadata = Field(default_factory=DictionaryMetadata)

    model_config = ConfigDict(use_enum_values=False)


# Request/Response models for API


class WordCreateRequest(BaseModel):
    """Schema for creating a new word entry."""
    headword: Headword
    dialect: str
    part_of_speech: PartOfSpeechEnum
    definitions: List[Definition] = Field(default_factory=list)
    pronunciations: List[Pronunciation] = Field(default_factory=list)
    etymology: Optional[Etymology] = None
    tags: List[str] = Field(default_factory=list)
    frequency: FrequencyEnum = FrequencyEnum.MODERATE
    register: Optional[str] = None
    source: SourceEnum = SourceEnum.UNVERIFIED
    notes: Optional[str] = None


class WordUpdateRequest(BaseModel):
    """Schema for updating an existing word."""
    headword: Optional[Headword] = None
    definitions: Optional[List[Definition]] = None
    pronunciations: Optional[List[Pronunciation]] = None
    etymology: Optional[Etymology] = None
    tags: Optional[List[str]] = None
    frequency: Optional[FrequencyEnum] = None
    register: Optional[str] = None
    verified_by: Optional[str] = None
    notes: Optional[str] = None


class WordResponse(Word):
    """Response model for word queries."""
    pass


class BulkWordCreateRequest(BaseModel):
    """Schema for bulk word ingestion."""
    words: List[WordCreateRequest] = Field(..., min_items=1, max_items=10000)
    source: SourceEnum = SourceEnum.UNVERIFIED
    verified_by: Optional[str] = None


class SearchFilters(BaseModel):
    """Search filter parameters."""
    query: Optional[str] = Field(None, description="Search term (meaning, romanization, etc.)")
    dialects: Optional[List[str]] = Field(None, description="Filter by dialect IDs")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    part_of_speech: Optional[List[PartOfSpeechEnum]] = Field(None)
    frequency: Optional[List[FrequencyEnum]] = Field(None)
    romanization_system: Optional[RomanizationSystemEnum] = None
    limit: int = Field(default=50, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)
