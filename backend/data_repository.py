"""
Data Repository Layer for the Tiagong Dialect Dictionary.
Manages file I/O, in-memory indexing, search, and validation.
Abstracts away JSON storage details; designed to be replaceable with SQL later.
"""

import json
import os
import threading
from pathlib import Path
from typing import List, Optional, Dict, Set, Any
from datetime import datetime
from functools import lru_cache
import logging

from schemas import (
    Word, Dictionary, Dialect, DialectCollection, DictionaryMetadata,
    WordCreateRequest, SearchFilters, PartOfSpeechEnum, FrequencyEnum
)

logger = logging.getLogger(__name__)


class DataRepository:
    """
    File-based data repository for the dialect dictionary.
    Maintains in-memory indexes for fast search without disk I/O.
    Implements thread-safe writes with file locking.
    """

    def __init__(self, data_dir: str = "backend/data"):
        """
        Initialize the repository.

        Args:
            data_dir: Directory path for JSON files
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.dictionary_file = self.data_dir / "dictionary.json"
        self.dialects_file = self.data_dir / "dialects.json"

        # Lock for thread-safe writes
        self._write_lock = threading.RLock()

        # In-memory caches
        self._dictionary: Optional[Dictionary] = None
        self._dialects: Optional[DialectCollection] = None

        # Indexes (built on load)
        self._index_by_id: Dict[str, Word] = {}
        self._index_by_dialect: Dict[str, List[Word]] = {}
        self._index_by_tags: Dict[str, Set[str]] = {}  # tag -> set of word IDs
        self._index_by_headword: Dict[str, Set[str]] = {}  # lowercase headword -> set of word IDs

        # Load data on initialization
        self._load_all_data()

    def _load_all_data(self) -> None:
        """Load dictionary and dialects from JSON files into memory."""
        self._load_dialects()
        self._load_dictionary()
        self._build_indexes()
        logger.info(f"Repository loaded: {len(self._index_by_id)} words indexed")

    def _load_dialects(self) -> None:
        """Load dialects master file."""
        try:
            if self.dialects_file.exists():
                with open(self.dialects_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._dialects = DialectCollection(**data)
            else:
                logger.warning(f"Dialects file not found: {self.dialects_file}")
                self._dialects = DialectCollection()
        except Exception as e:
            logger.error(f"Error loading dialects: {e}")
            self._dialects = DialectCollection()

    def _load_dictionary(self) -> None:
        """Load main dictionary file."""
        try:
            if self.dictionary_file.exists():
                with open(self.dictionary_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._dictionary = Dictionary(**data)
            else:
                logger.warning(f"Dictionary file not found: {self.dictionary_file}")
                self._dictionary = Dictionary()
        except Exception as e:
            logger.error(f"Error loading dictionary: {e}")
            self._dictionary = Dictionary()

    def _build_indexes(self) -> None:
        """Build in-memory indexes for fast lookup."""
        self._index_by_id.clear()
        self._index_by_dialect.clear()
        self._index_by_tags.clear()
        self._index_by_headword.clear()

        if not self._dictionary:
            return

        for word in self._dictionary.words:
            # Index by ID
            self._index_by_id[word.id] = word

            # Index by dialect
            if word.dialect not in self._index_by_dialect:
                self._index_by_dialect[word.dialect] = []
            self._index_by_dialect[word.dialect].append(word)

            # Index by tags
            for tag in word.tags:
                if tag not in self._index_by_tags:
                    self._index_by_tags[tag] = set()
                self._index_by_tags[tag].add(word.id)

            # Index by headword (case-insensitive)
            headword_lower = word.headword.romanized.lower()
            if headword_lower not in self._index_by_headword:
                self._index_by_headword[headword_lower] = set()
            self._index_by_headword[headword_lower].add(word.id)

            # Also index by simplified romanization
            if word.headword.simplified:
                simplified_lower = word.headword.simplified.lower()
                if simplified_lower not in self._index_by_headword:
                    self._index_by_headword[simplified_lower] = set()
                self._index_by_headword[simplified_lower].add(word.id)

    # === RETRIEVAL METHODS ===

    def get_word_by_id(self, word_id: str) -> Optional[Word]:
        """Retrieve a word by its ID."""
        return self._index_by_id.get(word_id)

    def get_words_by_dialect(self, dialect_id: str) -> List[Word]:
        """Get all words in a specific dialect."""
        return self._index_by_dialect.get(dialect_id, [])

    def get_words_by_tag(self, tag: str) -> List[Word]:
        """Get all words with a specific tag."""
        word_ids = self._index_by_tags.get(tag.lower(), set())
        return [self._index_by_id[wid] for wid in word_ids if wid in self._index_by_id]

    def get_all_dialects(self) -> List[Dialect]:
        """Get all available dialects."""
        return self._dialects.dialects if self._dialects else []

    # === SEARCH METHODS ===

    def search_words(self, filters: SearchFilters) -> List[Word]:
        """
        Search words with multiple filters.

        Args:
            filters: SearchFilters object with query, dialects, tags, etc.

        Returns:
            List of matching words (up to limit)
        """
        if not self._dictionary:
            return []

        results = list(self._dictionary.words)

        # Filter by query (fuzzy match on meaning, romanization, headword)
        if filters.query:
            query_lower = filters.query.lower()
            filtered = []
            for word in results:
                # Match in headword
                if query_lower in word.headword.romanized.lower():
                    filtered.append(word)
                    continue

                # Match in simplified
                if word.headword.simplified and query_lower in word.headword.simplified.lower():
                    filtered.append(word)
                    continue

                # Match in traditional
                if query_lower in word.headword.traditional.lower():
                    filtered.append(word)
                    continue

                # Match in any definition
                for definition in word.definitions:
                    if query_lower in definition.english.lower() or (definition.mandarin and query_lower in definition.mandarin.lower()):
                        filtered.append(word)
                        break
                else:
                    # Match in any pronunciation romanization
                    for pronunciation in word.pronunciations:
                        if query_lower in pronunciation.romanization.lower():
                            filtered.append(word)
                            break

            results = filtered

        # Filter by dialects
        if filters.dialects:
            results = [w for w in results if w.dialect in filters.dialects]

        # Filter by tags
        if filters.tags:
            results = [w for w in results if any(tag in w.tags for tag in filters.tags)]

        # Filter by part of speech
        if filters.part_of_speech:
            pos_values = [pos.value if hasattr(pos, 'value') else pos for pos in filters.part_of_speech]
            results = [w for w in results if w.part_of_speech.value in pos_values or w.part_of_speech in pos_values]

        # Filter by frequency
        if filters.frequency:
            freq_values = [f.value if hasattr(f, 'value') else f for f in filters.frequency]
            results = [w for w in results if w.frequency.value in freq_values or w.frequency in freq_values]

        # Filter by romanization system
        if filters.romanization_system:
            rom_system = filters.romanization_system.value if hasattr(filters.romanization_system, 'value') else filters.romanization_system
            results = [w for w in results if any(p.romanization_system.value == rom_system for p in w.pronunciations)]

        # Apply pagination
        start = filters.offset
        end = start + filters.limit
        return results[start:end]

    def search_headword(self, term: str, dialect: Optional[str] = None) -> List[Word]:
        """
        Search for words by headword (fast, index-based).

        Args:
            term: Headword term to search
            dialect: Optional dialect filter

        Returns:
            Matching words
        """
        term_lower = term.lower()
        matching_ids = self._index_by_headword.get(term_lower, set())
        matching_words = [self._index_by_id[wid] for wid in matching_ids if wid in self._index_by_id]

        if dialect:
            matching_words = [w for w in matching_words if w.dialect == dialect]

        return matching_words

    # === WRITE METHODS ===

    def add_word(self, word_create: WordCreateRequest) -> Word:
        """
        Add a single new word to the dictionary.

        Args:
            word_create: WordCreateRequest with word data

        Returns:
            Created Word object
        """
        # Create Word instance
        word = Word(
            headword=word_create.headword,
            dialect=word_create.dialect,
            part_of_speech=word_create.part_of_speech,
            definitions=word_create.definitions,
            pronunciations=word_create.pronunciations,
            etymology=word_create.etymology,
            tags=word_create.tags,
            frequency=word_create.frequency,
            register=word_create.register,
            source=word_create.source,
            notes=word_create.notes
        )

        with self._write_lock:
            # Add to in-memory dictionary
            if not self._dictionary:
                self._dictionary = Dictionary()

            self._dictionary.words.append(word)
            self._dictionary.metadata.total_words = len(self._dictionary.words)
            self._dictionary.metadata.last_updated = datetime.utcnow()

            # Rebuild indexes
            self._build_indexes()

            # Persist to disk
            self._save_dictionary()

        logger.info(f"Added word {word.id}: {word.headword.romanized}")
        return word

    def add_words_bulk(self, word_creates: List[WordCreateRequest]) -> List[Word]:
        """
        Add multiple words in a single operation.

        Args:
            word_creates: List of WordCreateRequest objects

        Returns:
            List of created Word objects
        """
        created_words = []

        with self._write_lock:
            if not self._dictionary:
                self._dictionary = Dictionary()

            for word_create in word_creates:
                word = Word(
                    headword=word_create.headword,
                    dialect=word_create.dialect,
                    part_of_speech=word_create.part_of_speech,
                    definitions=word_create.definitions,
                    pronunciations=word_create.pronunciations,
                    etymology=word_create.etymology,
                    tags=word_create.tags,
                    frequency=word_create.frequency,
                    register=word_create.register,
                    source=word_create.source,
                    notes=word_create.notes
                )
                self._dictionary.words.append(word)
                created_words.append(word)

            # Update metadata
            self._dictionary.metadata.total_words = len(self._dictionary.words)
            self._dictionary.metadata.last_updated = datetime.utcnow()

            # Rebuild indexes
            self._build_indexes()

            # Persist to disk
            self._save_dictionary()

        logger.info(f"Added {len(created_words)} words in bulk operation")
        return created_words

    def update_word(self, word_id: str, updates: Dict[str, Any]) -> Optional[Word]:
        """
        Update an existing word.

        Args:
            word_id: Word ID to update
            updates: Dictionary of fields to update

        Returns:
            Updated Word object, or None if not found
        """
        word = self.get_word_by_id(word_id)
        if not word:
            return None

        with self._write_lock:
            # Update mutable fields
            if 'definitions' in updates:
                word.definitions = updates['definitions']
            if 'pronunciations' in updates:
                word.pronunciations = updates['pronunciations']
            if 'etymology' in updates:
                word.etymology = updates['etymology']
            if 'tags' in updates:
                word.tags = updates['tags']
            if 'frequency' in updates:
                word.frequency = updates['frequency']
            if 'register' in updates:
                word.register = updates['register']
            if 'verified_by' in updates:
                word.verified_by = updates['verified_by']
            if 'notes' in updates:
                word.notes = updates['notes']

            word.updated_at = datetime.utcnow()

            # Rebuild indexes
            self._build_indexes()

            # Persist to disk
            self._save_dictionary()

        logger.info(f"Updated word {word_id}")
        return word

    def delete_word(self, word_id: str) -> bool:
        """
        Delete a word from the dictionary.

        Args:
            word_id: Word ID to delete

        Returns:
            True if deleted, False if not found
        """
        if word_id not in self._index_by_id:
            return False

        with self._write_lock:
            if self._dictionary:
                self._dictionary.words = [w for w in self._dictionary.words if w.id != word_id]
                self._dictionary.metadata.total_words = len(self._dictionary.words)
                self._dictionary.metadata.last_updated = datetime.utcnow()

                # Rebuild indexes
                self._build_indexes()

                # Persist to disk
                self._save_dictionary()

        logger.info(f"Deleted word {word_id}")
        return True

    # === FILE I/O ===

    def _save_dictionary(self) -> None:
        """Save dictionary to JSON file (assumes write lock is held)."""
        try:
            with open(self.dictionary_file, 'w', encoding='utf-8') as f:
                # Convert to dict using Pydantic's model_dump
                data = self._dictionary.model_dump(mode='json')
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving dictionary: {e}")
            raise

    def save_dialects(self) -> None:
        """Save dialects to JSON file."""
        try:
            with open(self.dialects_file, 'w', encoding='utf-8') as f:
                data = self._dialects.model_dump(mode='json')
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving dialects: {e}")
            raise

    # === STATISTICS & MAINTENANCE ===

    def get_statistics(self) -> Dict[str, Any]:
        """Get repository statistics."""
        return {
            "total_words": len(self._index_by_id),
            "total_dialects": len(self._dialects.dialects) if self._dialects else 0,
            "words_per_dialect": {
                dialect: len(words)
                for dialect, words in self._index_by_dialect.items()
            },
            "total_tags": len(self._index_by_tags),
            "last_updated": self._dictionary.metadata.last_updated if self._dictionary else None
        }

    def reload_from_disk(self) -> None:
        """Reload data from disk (useful after external modifications)."""
        logger.info("Reloading data from disk...")
        self._load_all_data()
