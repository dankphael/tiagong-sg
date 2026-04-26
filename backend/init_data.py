"""
Initialize empty JSON data files for the dialect dictionary system.
Creates the directory structure and empty JSON files with proper headers.
Run this once at project setup to initialize the data store.
"""

import json
from pathlib import Path
from datetime import datetime
from schemas import DialectCollection, Dictionary, DictionaryMetadata, Dialect


def init_data_files(data_dir: str = "backend/data"):
    """
    Initialize empty dictionary and dialects JSON files.

    Args:
        data_dir: Directory to create files in
    """
    data_path = Path(data_dir)
    data_path.mkdir(parents=True, exist_ok=True)

    # Initialize dialects.json
    init_dialects_file(data_path / "dialects.json")

    # Initialize dictionary.json
    init_dictionary_file(data_path / "dictionary.json")

    print(f"✓ Data files initialized in {data_dir}/")
    print(f"  - dialects.json (ready for dialect definitions)")
    print(f"  - dictionary.json (ready for word entries)")


def init_dialects_file(filepath: Path):
    """Create empty dialects.json with structure."""
    if filepath.exists():
        print(f"⚠ {filepath} already exists, skipping")
        return

    # Create with empty dialects (ready for additions)
    dialects = DialectCollection(dialects=[])

    with open(filepath, 'w', encoding='utf-8') as f:
        data = dialects.model_dump(mode='json')
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Created {filepath}")


def init_dictionary_file(filepath: Path):
    """Create empty dictionary.json with structure."""
    if filepath.exists():
        print(f"⚠ {filepath} already exists, skipping")
        return

    # Create with empty words
    metadata = DictionaryMetadata(
        version="1.0",
        total_words=0,
        last_updated=datetime.utcnow(),
        languages_included=[],
        created_date=datetime.utcnow()
    )

    dictionary = Dictionary(words=[], metadata=metadata)

    with open(filepath, 'w', encoding='utf-8') as f:
        data = dictionary.model_dump(mode='json')
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Created {filepath}")


def seed_sample_dialects(dialects_file: Path):
    """
    Seed the dialects file with the 5 main Singapore dialects.
    This is a helper function - not called by default to avoid overwriting.
    """
    sample_dialects = [
        {
            "id": "hokkien",
            "name": "Hokkien",
            "chinese": "福建话",
            "region": "Fujian Province",
            "speakers_sg": "~40%",
            "romanization_systems": ["poj", "ipa"],
            "color": "#C0392B",
            "iso_639_3": "nan"
        },
        {
            "id": "cantonese",
            "name": "Cantonese",
            "chinese": "广东话",
            "region": "Guangdong Province",
            "speakers_sg": "~17%",
            "romanization_systems": ["jyutping", "ipa"],
            "color": "#8E44AD",
            "iso_639_3": "yue"
        },
        {
            "id": "teochew",
            "name": "Teochew",
            "chinese": "潮州话",
            "region": "Chaozhou, Guangdong",
            "speakers_sg": "~22%",
            "romanization_systems": ["poj", "ipa"],
            "color": "#1A6B3C",
            "iso_639_3": "nan"
        },
        {
            "id": "hakka",
            "name": "Hakka",
            "chinese": "客家话",
            "region": "Various southern provinces",
            "speakers_sg": "~7%",
            "romanization_systems": ["ipa"],
            "color": "#D4860B",
            "iso_639_3": "hak"
        },
        {
            "id": "hainanese",
            "name": "Hainanese",
            "chinese": "海南话",
            "region": "Hainan Island",
            "speakers_sg": "~7%",
            "romanization_systems": ["ipa"],
            "color": "#1A7EA6",
            "iso_639_3": "nan"
        }
    ]

    dialects_collection = DialectCollection(dialects=[Dialect(**d) for d in sample_dialects])

    with open(dialects_file, 'w', encoding='utf-8') as f:
        data = dialects_collection.model_dump(mode='json')
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Seeded {dialects_file} with {len(sample_dialects)} dialects")


if __name__ == "__main__":
    import sys

    # Initialize with empty files
    init_data_files()

    # Optionally seed sample dialects if --with-sample flag is provided
    if "--with-sample" in sys.argv:
        seed_sample_dialects(Path("backend/data/dialects.json"))
    else:
        print("\nTip: Run with --with-sample to seed the 5 main Singapore dialects")
