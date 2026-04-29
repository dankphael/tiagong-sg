# Golden Standard for Romanization

## Overview

This document defines the **learner-friendly golden standard** for romanizing each Chinese dialect in the Tiagong Dialect Dictionary. These standards prioritize:

1. **Consistency** - One sound = one spelling (no exceptions)
2. **Intuitiveness** - Easy for English speakers to pronounce correctly
3. **Completeness** - Captures all phonemic distinctions
4. **Practicality** - Typeable on standard keyboards (ASCII-compatible)
5. **Tone Clarity** - Clear tone marking without diacritics when possible

---

## Dialect-Specific Standards

### 1. Hokkien (福建话)

**Golden Standard: Modern POJ (Peh-ōe-jī) with Tone Numbers**

#### Why This Standard?
- POJ is the most established writing system for Hokkien
- 150+ years of literature and religious texts
- Phonemically accurate and consistent
- Well-documented with learning resources

#### Implementation Rules

**Consonants:**
| Sound | Romanization | Example | Notes |
|-------|--------------|---------|-------|
| p | p | pa (爸) | Unaspirated |
| pʰ | ph | pha (怕) | Aspirated |
| b | b | ba (馬) | Voiced bilabial |
| t | t | ta (打) | Unaspirated |
| tʰ | th | tha (他) | Aspirated |
| l | l | la (拉) | Alveolar lateral |
| k | k | ka (哥) | Unaspirated |
| kʰ | kh | kha (卡) | Aspirated |
| g | g | ga (牙) | Voiced velar |
| h | h | ha (哈) | Glottal fricative |
| ts | ch | cha (查) | Affricate |
| tsʰ | chh | chha (差) | Aspirated affricate |
| s | s | sa (沙) | Alveolar fricative |
| m | m | ma (媽) | Syllabic nasal possible |
| n | n | na (那) | Syllabic nasal possible |
| ŋ | ng | nga (雅) | Velar nasal |

**Vowels:**
| Sound | Romanization | Example | Notes |
|-------|--------------|---------|-------|
| a | a | a (阿) | Open front |
| ɛ | e | e (也) | Mid front |
| i | i | i (衣) | Close front |
| o | o | o (烏) | Mid back rounded |
| ɔ | o͘ | o͘ (有) | Open-mid back (with dot above) |
| u | u | u (雨) | Close back rounded |
| ə | er | er (兒) | Schwa + r |

**Tones (Number System for Digital):**
| Tone | Number | Diacritic | Example |
|------|--------|-----------|---------|
| 1st (high level) | 1 | ā | si¹ (詩) |
| 2nd (high rising) | 2 | á | sí (死) |
| 3rd (low falling) | 3 | à | sì (四) |
| 4th (high falling) | 4 | ah | sih (雪) - checked |
| 5th (low rising) | 5 | â | sî (時) |
| 7th (mid level) | 7 | ap | sip (十) - checked |
| 8th (low falling) | 8 | at | sit (實) - checked |

**Recommended Format:**
- **Display**: `siān` (diacritics for readability)
- **Input/Search**: `sian1` or `sian^1` (numbers for typing)
- **Database**: Store both forms

**Special Rules:**
- Use `o͘` (o with dot) for /ɔ/ - distinguish from /o/
- Final stops (-p, -t, -k, -h) indicate entering tones (入聲)
- Tone sandhi should NOT be marked in dictionary entries (cite citation form only)

---

### 2. Cantonese (广东话)

**Golden Standard: Jyutping (粵拼)**

#### Why This Standard?
- Official standard in Hong Kong since 1993
- Used by government, education, and dictionaries
- ASCII-compatible with clear tone numbers
- Easiest for learners to master

#### Implementation Rules

**Consonants (Initials):**
| Sound | Jyutping | Example | Yale Equivalent |
|-------|----------|---------|-----------------|
| p | b | ba¹ (巴) | b |
| pʰ | p | pa¹ (爬) | p |
| m | m | ma¹ (媽) | m |
| f | f | faa¹ (花) | f |
| t | d | da¹ (打) | d |
| tʰ | t | ta¹ (他) | t |
| n | n | na¹ (那) | n |
| l | l | laa¹ (拉) | l |
| k | g | gaa¹ (家) | g |
| kʰ | k | kaa¹ (卡) | k |
| ŋ | ng | ngaa⁵ (我) | ng |
| h | h | haa¹ (蝦) | h |
| ts | z | za¹ (渣) | j |
| tsʰ | c | caa¹ (叉) | ch |
| s | s | saa¹ (沙) | s |
| j | j | jaa⁵ (也) | y |
| w | w | waa¹ (蛙) | w |

**Vowels (Finals):**
| Sound | Jyutping | Example | Notes |
|-------|----------|---------|-------|
| a | aa | saa¹ (沙) | Long open |
| ɐ | a | sat¹ (失) | Short schwa |
| ɛ | e | se¹ (些) | Mid front |
| i | i | si¹ (詩) | Close front |
| ɔ | o | so¹ (梳) | Mid back |
| u | u | fu¹ (夫) | Close back |
| y | oe | soe¹ (書) | Close front rounded |
| œː | eo | seon¹ (孫) | Mid front rounded |
| ɵ | eoi | deoi¹ (對) | Close-mid front rounded |

**Tones (1-6 System):**
| Tone | Number | Contour | Example |
|------|--------|---------|---------|
| 1 (high level) | 1 | ˥ | si¹ (詩) |
| 2 (mid rising) | 2 | ˨˥ | si² (史) |
| 3 (mid level) | 3 | ˧ | si³ (試) |
| 4 (low falling) | 4 | ˨˩ | si⁴ (時) |
| 5 (low rising) | 5 | ˨˧ | si⁵ (市) |
| 6 (low level) | 6 | ˩ | si⁶ (事) |

**Entering Tones (入聲):**
- Tones 7, 8, 9 merge into 1, 3, 6 respectively
- Marked by final consonants: -p, -t, -k
- Example: sik¹ (食), bat¹ (不), luk⁶ (六)

**Recommended Format:**
- **Display**: `nei⁵ hou²` (superscript numbers)
- **Input/Search**: `nei5 hou2` (regular numbers)
- **Database**: Store as `nei5 hou2`

**Special Rules:**
- No apostrophes needed (unlike Pinyin)
- `eo` and `oe` represent specific vowel qualities
- Final consonants: -m, -n, -ng, -p, -t, -k

---

### 3. Teochew (潮州话)

**Golden Standard: Peng'im (潮汕拼音) with Modifications**

#### Why This Standard?
- Based on POJ but adapted for Teochew phonology
- Captures the 8-tone system accurately
- Compatible with existing Teochew dictionaries
- Learner-friendly for those knowing Hokkien POJ

#### Implementation Rules

**Consonants:**
| Sound | Peng'im | Example | Notes |
|-------|---------|---------|-------|
| p | b | bo (無) | Unaspirated voiced |
| pʰ | p | po (婆) | Aspirated |
| b | bh | bho (毛) | Voiced bilabial |
| t | d | do (多) | Unaspirated voiced |
| tʰ | t | to (拖) | Aspirated |
| l | l | lo (羅) | Lateral |
| k | g | go (歌) | Unaspirated voiced |
| kʰ | k | ko (科) | Aspirated |
| g | gh | gho (俄) | Voiced velar |
| h | h | ho (何) | Glottal |
| ts | z | zo (糟) | Affricate |
| tsʰ | c | co (操) | Aspirated affricate |
| s | s | so (蘇) | Fricative |
| dz | r | ro | Voiced affricate (some varieties) |
| m | m | mo (模) | Nasal |
| n | n | no | Nasal |
| ŋ | ng | ngo (鵝) | Velar nasal |

**Vowels:**
| Sound | Peng'im | Example | IPA |
|-------|---------|---------|-----|
| a | a | ta (打) | /a/ |
| ɛ | ê | tê (茶) | /e/ |
| i | i | ti (地) | /i/ |
| o | o | to (刀) | /o/ |
| ɔ | ô | tô (桃) | /ɔ/ |
| u | u | tu (賭) | /u/ |
| ɯ | eu | teu | Close back unrounded |
| ai | ai | tai (知) | Diphthong |
| au | au | tau (頭) | Diphthong |
| ia | ia | tia (爹) | Rising diphthong |
| io | io | tio (鳥) | Rising diphthong |

**Tones (8-Tone System):**
| Tone | Number | Contour | Example |
|------|--------|---------|---------|
| 1 (yin ping) | 1 | ˧˧ | si¹ (詩) |
| 2 (yin shang) | 2 | ˥˧ | si² (死) |
| 3 (yin qu) | 3 | ˨˩˧ | si³ (四) |
| 4 (yin ru) | 4 | ˨ | sih⁴ (雪) |
| 5 (yang ping) | 5 | ˥˥ | sî⁵ (時) |
| 6 (yang shang) | 6 | ˩˩ | sī⁶ |
| 7 (yang qu) | 7 | ˧ | sì⁷ |
| 8 (yang ru) | 8 | ˥ | si̍h⁸ (實) |

**Recommended Format:**
- **Display**: `lê⁵` (diacritics + superscript)
- **Input/Search**: `le5` or `le^5`
- **Database**: `le5`

**Special Rules:**
- Use circumflex (ê, ô) for mid vowels
- Entering tones marked with -h or -p, -t, -k
- Nasal finals: -m, -n, -ng

---

### 4. Hakka (客家话)

**Golden Standard: Pha̍k-fa-sṳ (白話字) with Tone Numbers**

#### Why This Standard?
- Traditional Hakka writing system
- Used in Hakka Bible and literature
- Consistent across major Hakka varieties
- Compatible with POJ framework

#### Implementation Rules

**Consonants (Sixian variety as base):**
| Sound | Pha̍k-fa-sṳ | Example | Notes |
|-------|------------|---------|-------|
| p | b | ba (爸) | Unaspirated |
| pʰ | p | pa (怕) | Aspirated |
| m | m | ma (媽) | Bilabial nasal |
| f | f | fa (花) | Labiodental |
| t | d | da (打) | Unaspirated |
| tʰ | t | ta (他) | Aspirated |
| n | n | na (那) | Alveolar nasal |
| l | l | la (拉) | Lateral |
| k | g | ga (家) | Unaspirated |
| kʰ | k | ka (卡) | Aspirated |
| ŋ | ng | nga (我) | Velar nasal |
| h | h | ha (哈) | Glottal |
| ts | z | za (早) | Affricate |
| tsʰ | c | ca (草) | Aspirated |
| s | s | sa (嫂) | Fricative |
| j | r | ra (日) | Retroflex/approximant |

**Vowels:**
| Sound | Romanization | Example | IPA |
|-------|--------------|---------|-----|
| a | a | a (阿) | /a/ |
| e | e | e (野) | /e/ |
| i | i | i (衣) | /i/ |
| o | o | o (烏) | /o/ |
| u | u | u (雨) | /u/ |
| iɛn | ien | ien (煙) | Diphthong+nasal |
| an | an | an (安) | Nasal final |
| on | on | on (碗) | Nasal final |

**Tones (6-Tone System for Sixian):**
| Tone | Number | Contour | Example |
|------|--------|---------|---------|
| 1 (yin ping) | 1 | ˨˦ | si¹ (詩) |
| 2 (yin shang) | 2 | ˧˩ | si² (使) |
| 3 (yin qu) | 3 | ˥˧ | si³ (試) |
| 4 (yang ping) | 4 | ˩˩ | si⁴ (時) |
| 5 (yang shang) | 5 | ˦˨ | si⁵ |
| 6 (yang qu) | 6 | ˥ | si⁶ (是) |

**Entering Tones:**
- Merge into other tones based on voicing
- Marked by final -p, -t, -k, -h

**Recommended Format:**
- **Display**: `ngài` (with diacritics)
- **Input/Search**: `ngai2` or `ngai^2`
- **Database**: `ngai2`

**Special Rules:**
- Use `ng` for velar nasal initial
- Medial glides: i-, u-
- Final consonants limited to nasals and stops

---

### 5. Hainanese (海南话)

**Golden Standard: Modified Hainan Romanized (海口話羅馬字)**

#### Why This Standard?
- Historically used by missionaries
- Captures unique Hainanese features (implosives, breathy voice)
- Compatible with broader Min Nan framework
- Underdocumented - needs clear standardization

#### Implementation Rules

**Consonants (Haikou variety):**
| Sound | Romanization | Example | Notes |
|-------|--------------|---------|-------|
| ɓ | bb | bbo (無) | Implosive bilabial |
| ɗ | dd | ddo (大) | Implosive alveolar |
| p | p | po (波) | Unaspirated |
| pʰ | ph | pho (破) | Aspirated |
| t | t | to (多) | Unaspirated |
| tʰ | th | tho (拖) | Aspirated |
| k | k | ko (歌) | Unaspirated |
| kʰ | kh | kho (可) | Aspirated |
| ʔ | ' | 'o (烏) | Glottal stop |
| h | h | ho (好) | Glottal fricative |
| ts | ts | tso (早) | Affricate |
| s | s | so (鎖) | Fricative |
| m | m | mo (毛) | Bilabial nasal |
| n | n | no (腦) | Alveolar nasal |
| ŋ | ng | ngo (我) | Velar nasal |

**Vowels:**
| Sound | Romanization | Example | IPA |
|-------|--------------|---------|-----|
| a | a | a (阿) | /a/ |
| ɛ | e | e (也) | /ɛ/ |
| i | i | i (衣) | /i/ |
| o | o | o (烏) | /o/ |
| ɔ | oo | oo (好) | /ɔ/ |
| u | u | u (雨) | /u/ |
| e | ei | ei (街) | Diphthong |
| ai | ai | ai (開) | Diphthong |
| au | au | au (口) | Diphthong |

**Tones (8-Tone System):**
| Tone | Number | Contour | Example |
|------|--------|---------|---------|
| 1 | 1 | ˧ | si¹ |
| 2 | 2 | ˨˩ | si² |
| 3 | 3 | ˥ | si³ |
| 4 | 4 | ˨˦ | si⁴ |
| 5 | 5 | ˧˨ | si⁵ |
| 6 | 6 | ˦ | si⁶ |
| 7 | 7 | ˨ | si⁷ |
| 8 | 8 | ˥ | si⁸ |

**Recommended Format:**
- **Display**: `ɓoo³` (IPA-style for implosives)
- **Input/Search**: `bbo3` (doubled letters for implosives)
- **Database**: `bbo3`

**Special Rules:**
- Doubled consonants (bb, dd) for implosives
- Glottal stop marked with apostrophe
- Breathy voice may be marked with subscript dot (optional)

---

## General Guidelines for All Dialects

### Tone Marking Convention

**For Display (UI/Web):**
```
Use superscript numbers: si⁵ hou²
Or diacritics where established: siâⁿ hó
```

**For Input/Search:**
```
Use caret notation: si^5 hou^2
Or suffix notation: si5 hou2
```

**For Database Storage:**
```
Always use suffix notation: si5 hou2
Rationale: ASCII-safe, sortable, searchable
```

### Handling Variation

1. **Regional Pronunciations**: Store as separate pronunciation entries
   ```json
   {
     "headword": { "romanized": "tai5" },
     "pronunciations": [
       { "type": "sixian", "romanization_system": "phak_fat_su", "romanization": "tai5" },
       { "type": "hailu", "romanization_system": "phak_fat_su", "romanization": "toi5" }
     ]
   }
   ```

2. **Literary vs. Colloquial**: Mark explicitly
   ```json
   {
     "pronunciations": [
       { "type": "literary", "romanization": "bun5" },
       { "type": "colloquial", "romanization": "png5" }
     ]
   }
   ```

3. **Tone Sandhi**: 
   - Dictionary entries should cite **citation form** (underlying tone)
   - Add optional field for sandhi patterns if pedagogically useful

### Keyboard Input Recommendations

| Notation | Typing Method | Conversion |
|----------|---------------|------------|
| ā | a1 or a^ | Auto-convert to diacritic |
| á | a2 or a' | Auto-convert to diacritic |
| à | a3 or a` | Auto-convert to diacritic |
| a̍h | ah8 | Keep as-is or convert |

### IPA Transcription

**Always include IPA** alongside romanization for:
- Academic precision
- Cross-dialect comparison
- Disambiguation of similar sounds

Example:
```json
{
  "romanization_system": "poj",
  "romanization": "siān",
  "ipa": "siã˧˥"
}
```

---

## Summary Table

| Dialect | Golden Standard | Tone System | Key Features |
|---------|----------------|-------------|--------------|
| Hokkien | POJ + Numbers | 1-8 (or 1-5 + entering) | o͘ for /ɔ/, final stops |
| Cantonese | Jyutping | 1-6 | Clear vowel length, no apostrophes |
| Teochew | Peng'im | 1-8 | ê/ô for mid vowels, 8 tones |
| Hakka | Pha̍k-fa-sṳ | 1-6 | Compatible with POJ, simpler |
| Hainanese | Modified Hainan Rom. | 1-8 | Implosives (bb, dd), glottal stop |

---

## Implementation Checklist

- [ ] Update `RomanizationSystemEnum` in schemas.py to include all variants
- [ ] Add validation rules for each romanization system
- [ ] Create tone normalization utilities
- [ ] Build input method converters (number → diacritic)
- [ ] Document search behavior (should "sian5" match "siān"?)
- [ ] Add IPA transcription requirement for new entries
- [ ] Create dialect-specific pronunciation guides for learners

---

## References

- **POJ**: Anglican Presbyterian Mission (1800s), modernized by Taiwan Ministry of Education
- **Jyutping**: Linguistic Society of Hong Kong (1993)
- **Peng'im**: Guangdong Provincial Education Department
- **Pha̍k-fa-sṳ**: Traditional Hakka missionary romanization
- **Hainanese**: Methodist Mission romanization, adapted for modern use

---

*Last Updated: 2026*
*Version: 1.0*
