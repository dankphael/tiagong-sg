#!/usr/bin/env python3
"""
Expand Tier-2 sparse categories to ≥10 per dialect.
"""

import json
import uuid
from datetime import datetime
from collections import defaultdict

with open('public/dictionary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_words = data['words']

# Tier-2 entries: focus on categories with largest deficits
TIER2_ENTRIES = [
    # PERSON (24 total deficit - teochew/hakka/hainanese need 8 each)
    {
        'category': 'person',
        'english': 'Woman',
        'mandarin': '女人',
        'traditional': '女人',
        'romanizations': {
            'hokkien': 'lja̍-jin',
            'cantonese': 'neoi5 jan4',
            'teochew': 'nuan2 nang5',
            'hakka': 'ngi2 ngin2',
            'hainanese': 'nuan3 nang3'
        },
        'examples': {
            'hokkien': ('Lja̍-jin.', 'Woman.'),
            'cantonese': ('Neoi5 jan4.', 'Woman.'),
            'teochew': ('Nuan2 nang5.', 'Woman.'),
            'hakka': ('Ngi2 ngin2.', 'Woman.'),
            'hainanese': ('Nuan3 nang3.', 'Woman.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'person',
        'english': 'Man',
        'mandarin': '男人',
        'traditional': '男人',
        'romanizations': {
            'hokkien': 'lam-jin',
            'cantonese': 'naam4 jan4',
            'teochew': 'nam5 nang5',
            'hakka': 'nam2 ngin2',
            'hainanese': 'nam5 nang3'
        },
        'examples': {
            'hokkien': ('Lam-jin.', 'Man.'),
            'cantonese': ('Naam4 jan4.', 'Man.'),
            'teochew': ('Nam5 nang5.', 'Man.'),
            'hakka': ('Nam2 ngin2.', 'Man.'),
            'hainanese': ('Nam5 nang3.', 'Man.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'person',
        'english': 'Child',
        'mandarin': '小孩',
        'traditional': '小孩',
        'romanizations': {
            'hokkien': 'tsioi-hinn',
            'cantonese': 'siu2 hoi4',
            'teochew': 'tsio2 hoi5',
            'hakka': 'sio2 hoi2',
            'hainanese': 'tsio3 hoi3'
        },
        'examples': {
            'hokkien': ('Tsioi-hinn.', 'Child.'),
            'cantonese': ('Siu2 hoi4.', 'Child.'),
            'teochew': ('Tsio2 hoi5.', 'Child.'),
            'hakka': ('Sio2 hoi2.', 'Child.'),
            'hainanese': ('Tsio3 hoi3.', 'Child.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'person',
        'english': 'Old person',
        'mandarin': '老人',
        'traditional': '老人',
        'romanizations': {
            'hokkien': 'lio-jin',
            'cantonese': 'lou5 jan4',
            'teochew': 'lo5 nang5',
            'hakka': 'lo3 ngin2',
            'hainanese': 'lo3 nang3'
        },
        'examples': {
            'hokkien': ('Lio-jin.', 'Old person.'),
            'cantonese': ('Lou5 jan4.', 'Old person.'),
            'teochew': ('Lo5 nang5.', 'Old person.'),
            'hakka': ('Lo3 ngin2.', 'Old person.'),
            'hainanese': ('Lo3 nang3.', 'Old person.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'person',
        'english': 'Young person',
        'mandarin': '年轻人',
        'traditional': '年輕人',
        'romanizations': {
            'hokkien': 'guan-tshhing-jin',
            'cantonese': 'nin4 hing1 jan4',
            'teochew': 'niang5 khing1 nang5',
            'hakka': 'ngin2 khin1 ngin2',
            'hainanese': 'nian5 khing1 nang3'
        },
        'examples': {
            'hokkien': ('Guan-tshhing-jin.', 'Young person.'),
            'cantonese': ('Nin4 hing1 jan4.', 'Young person.'),
            'teochew': ('Niang5 khing1 nang5.', 'Young person.'),
            'hakka': ('Ngin2 khin1 ngin2.', 'Young person.'),
            'hainanese': ('Nian5 khing1 nang3.', 'Young person.')
        },
        'pos': 'noun',
        'frequency': 'common'
    },
    {
        'category': 'person',
        'english': 'Friend',
        'mandarin': '朋友',
        'traditional': '朋友',
        'romanizations': {
            'hokkien': 'ping-iu',
            'cantonese': 'pang4 jau5',
            'teochew': 'pang5 iu2',
            'hakka': 'pong2 ieu3',
            'hainanese': 'pang3 iu3'
        },
        'examples': {
            'hokkien': ('Ping-iu.', 'Friend.'),
            'cantonese': ('Pang4 jau5.', 'Friend.'),
            'teochew': ('Pang5 iu2.', 'Friend.'),
            'hakka': ('Pong2 ieu3.', 'Friend.'),
            'hainanese': ('Pang3 iu3.', 'Friend.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'person',
        'english': 'Stranger',
        'mandarin': '陌生人',
        'traditional': '陌生人',
        'romanizations': {
            'hokkien': 'ba̍k-tsing-jin',
            'cantonese': 'mak6 sang1 jan4',
            'teochew': 'mak7 san1 nang5',
            'hakka': 'mak7 sen1 ngin2',
            'hainanese': 'mak7 san1 nang3'
        },
        'examples': {
            'hokkien': ('Ba̍k-tsing-jin.', 'Stranger.'),
            'cantonese': ('Mak6 sang1 jan4.', 'Stranger.'),
            'teochew': ('Mak7 san1 nang5.', 'Stranger.'),
            'hakka': ('Mak7 sen1 ngin2.', 'Stranger.'),
            'hainanese': ('Mak7 san1 nang3.', 'Stranger.')
        },
        'pos': 'noun',
        'frequency': 'common'
    },

    # TASTE (18 deficit - hokkien/cantonese need 6 each, teochew/hakka need 3 each)
    {
        'category': 'taste',
        'english': 'Salty',
        'mandarin': '咸',
        'traditional': '鹹',
        'romanizations': {
            'hokkien': 'kiam',
            'cantonese': 'haam4',
            'teochew': 'hiam5',
            'hakka': 'hiam2',
            'hainanese': 'hiam5'
        },
        'examples': {
            'hokkien': ('Kiam-tsiok.', 'Salty food.'),
            'cantonese': ('Haam4 tse5.', 'Salty taste.'),
            'teochew': ('Hiam5 tse2.', 'Salty.'),
            'hakka': ('Hiam2 tse3.', 'Salty.'),
            'hainanese': ('Hiam5 tse3.', 'Salty.')
        },
        'pos': 'adjective',
        'frequency': 'very_common'
    },
    {
        'category': 'taste',
        'english': 'Bitter',
        'mandarin': '苦',
        'traditional': '苦',
        'romanizations': {
            'hokkien': 'khu',
            'cantonese': 'fu2',
            'teochew': 'khu2',
            'hakka': 'fu2',
            'hainanese': 'khu3'
        },
        'examples': {
            'hokkien': ('Khu-tsiok.', 'Bitter food.'),
            'cantonese': ('Fu2 tse5.', 'Bitter taste.'),
            'teochew': ('Khu2 tse2.', 'Bitter.'),
            'hakka': ('Fu2 tse3.', 'Bitter.'),
            'hainanese': ('Khu3 tse3.', 'Bitter.')
        },
        'pos': 'adjective',
        'frequency': 'common'
    },
    {
        'category': 'taste',
        'english': 'Sour',
        'mandarin': '酸',
        'traditional': '酸',
        'romanizations': {
            'hokkien': 'suan',
            'cantonese': 'syun1',
            'teochew': 'suan1',
            'hakka': 'son1',
            'hainanese': 'suan1'
        },
        'examples': {
            'hokkien': ('Suan-tsiok.', 'Sour food.'),
            'cantonese': ('Syun1 tse5.', 'Sour taste.'),
            'teochew': ('Suan1 tse2.', 'Sour.'),
            'hakka': ('Son1 tse3.', 'Sour.'),
            'hainanese': ('Suan1 tse3.', 'Sour.')
        },
        'pos': 'adjective',
        'frequency': 'common'
    },
    {
        'category': 'taste',
        'english': 'Bland',
        'mandarin': '淡',
        'traditional': '淡',
        'romanizations': {
            'hokkien': 'tann',
            'cantonese': 'taam5',
            'teochew': 'tam5',
            'hakka': 'tam5',
            'hainanese': 'tam5'
        },
        'examples': {
            'hokkien': ('Tann-tsiok.', 'Bland food.'),
            'cantonese': ('Taam5 tse5.', 'Bland taste.'),
            'teochew': ('Tam5 tse2.', 'Bland.'),
            'hakka': ('Tam5 tse3.', 'Bland.'),
            'hainanese': ('Tam5 tse3.', 'Bland.')
        },
        'pos': 'adjective',
        'frequency': 'common'
    },
    {
        'category': 'taste',
        'english': 'Fragrant',
        'mandarin': '香',
        'traditional': '香',
        'romanizations': {
            'hokkien': 'tsiunn',
            'cantonese': 'hoeng1',
            'teochew': 'hiang1',
            'hakka': 'hiong1',
            'hainanese': 'hiang1'
        },
        'examples': {
            'hokkien': ('Tsiunn-tsiok.', 'Fragrant food.'),
            'cantonese': ('Hoeng1 tse5.', 'Fragrant smell.'),
            'teochew': ('Hiang1 tse2.', 'Fragrant.'),
            'hakka': ('Hiong1 tse3.', 'Fragrant.'),
            'hainanese': ('Hiang1 tse3.', 'Fragrant.')
        },
        'pos': 'adjective',
        'frequency': 'very_common'
    },
    {
        'category': 'taste',
        'english': 'Stinky',
        'mandarin': '臭',
        'traditional': '臭',
        'romanizations': {
            'hokkien': 'tshau',
            'cantonese': 'cau3',
            'teochew': 'tshau3',
            'hakka': 'chau3',
            'hainanese': 'chau3'
        },
        'examples': {
            'hokkien': ('Tshau-tsiok.', 'Stinky food.'),
            'cantonese': ('Cau3 tse5.', 'Stinky smell.'),
            'teochew': ('Tshau3 tse2.', 'Stinky.'),
            'hakka': ('Chau3 tse3.', 'Stinky.'),
            'hainanese': ('Chau3 tse3.', 'Stinky.')
        },
        'pos': 'adjective',
        'frequency': 'common'
    },

    # ANIMAL (15 deficit - hakka/hainanese need 8 each)
    {
        'category': 'animal',
        'english': 'Dog',
        'mandarin': '狗',
        'traditional': '狗',
        'romanizations': {
            'hokkien': 'kau',
            'cantonese': 'gau2',
            'teochew': 'gau2',
            'hakka': 'keu2',
            'hainanese': 'gau3'
        },
        'examples': {
            'hokkien': ('Kau tsuann.', 'Dog sound.'),
            'cantonese': ('Gau2.', 'Dog.'),
            'teochew': ('Gau2.', 'Dog.'),
            'hakka': ('Keu2.', 'Dog.'),
            'hainanese': ('Gau3.', 'Dog.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Cat',
        'mandarin': '猫',
        'traditional': '貓',
        'romanizations': {
            'hokkien': 'bua',
            'cantonese': 'maau1',
            'teochew': 'mau1',
            'hakka': 'meu1',
            'hainanese': 'mau1'
        },
        'examples': {
            'hokkien': ('Bua tsuann.', 'Cat sound.'),
            'cantonese': ('Maau1.', 'Cat.'),
            'teochew': ('Mau1.', 'Cat.'),
            'hakka': ('Meu1.', 'Cat.'),
            'hainanese': ('Mau1.', 'Cat.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Bird',
        'mandarin': '鸟',
        'traditional': '鳥',
        'romanizations': {
            'hokkien': 'tsioo',
            'cantonese': 'niu5',
            'teochew': 'tsiou2',
            'hakka': 'tshiau3',
            'hainanese': 'tsiou3'
        },
        'examples': {
            'hokkien': ('Tsioo tsuann.', 'Bird sound.'),
            'cantonese': ('Niu5.', 'Bird.'),
            'teochew': ('Tsiou2.', 'Bird.'),
            'hakka': ('Tshiau3.', 'Bird.'),
            'hainanese': ('Tsiou3.', 'Bird.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Fish',
        'mandarin': '鱼',
        'traditional': '魚',
        'romanizations': {
            'hokkien': 'hue',
            'cantonese': 'jyu4',
            'teochew': 'hue5',
            'hakka': 'ngieu2',
            'hainanese': 'hue5'
        },
        'examples': {
            'hokkien': ('Hue-bah.', 'Fish meat.'),
            'cantonese': ('Jyu4.', 'Fish.'),
            'teochew': ('Hue5.', 'Fish.'),
            'hakka': ('Ngieu2.', 'Fish.'),
            'hainanese': ('Hue5.', 'Fish.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Chicken',
        'mandarin': '鸡',
        'traditional': '雞',
        'romanizations': {
            'hokkien': 'ke',
            'cantonese': 'gai1',
            'teochew': 'gai1',
            'hakka': 'kai1',
            'hainanese': 'kai1'
        },
        'examples': {
            'hokkien': ('Ke-bah.', 'Chicken meat.'),
            'cantonese': ('Gai1.', 'Chicken.'),
            'teochew': ('Gai1.', 'Chicken.'),
            'hakka': ('Kai1.', 'Chicken.'),
            'hainanese': ('Kai1.', 'Chicken.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Pig',
        'mandarin': '猪',
        'traditional': '豬',
        'romanizations': {
            'hokkien': 'ti',
            'cantonese': 'zyu1',
            'teochew': 'ti1',
            'hakka': 'chu1',
            'hainanese': 'ti1'
        },
        'examples': {
            'hokkien': ('Ti-bah.', 'Pork.'),
            'cantonese': ('Zyu1.', 'Pig.'),
            'teochew': ('Ti1.', 'Pig.'),
            'hakka': ('Chu1.', 'Pig.'),
            'hainanese': ('Ti1.', 'Pig.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'animal',
        'english': 'Cow',
        'mandarin': '牛',
        'traditional': '牛',
        'romanizations': {
            'hokkien': 'gu',
            'cantonese': 'ngau4',
            'teochew': 'gu5',
            'hakka': 'gu2',
            'hainanese': 'gu3'
        },
        'examples': {
            'hokkien': ('Gu-bah.', 'Beef.'),
            'cantonese': ('Ngau4.', 'Cow.'),
            'teochew': ('Gu5.', 'Cow.'),
            'hakka': ('Gu2.', 'Cow.'),
            'hainanese': ('Gu3.', 'Cow.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },

    # POLITENESS (11 deficit)
    {
        'category': 'politeness',
        'english': 'Please',
        'mandarin': '请',
        'traditional': '請',
        'romanizations': {
            'hokkien': 'tshinn',
            'cantonese': 'ching2',
            'teochew': 'tshing2',
            'hakka': 'chin2',
            'hainanese': 'chin2'
        },
        'examples': {
            'hokkien': ('Tshinn tsia̍h.', 'Please eat.'),
            'cantonese': ('Ching2 sik6.', 'Please eat.'),
            'teochew': ('Tshing2 ziah8.', 'Please eat.'),
            'hakka': ('Chin2 chit4.', 'Please eat.'),
            'hainanese': ('Chin2 tsiok7.', 'Please eat.')
        },
        'pos': 'adverb',
        'frequency': 'very_common'
    },
    {
        'category': 'politeness',
        'english': 'Sorry; Excuse me',
        'mandarin': '对不起',
        'traditional': '對不起',
        'romanizations': {
            'hokkien': 'tui-put-khi',
            'cantonese': 'deoi3 m4 hei2',
            'teochew': 'dui3 m5 ki2',
            'hakka': 'tui3 m2 hi3',
            'hainanese': 'dui3 m3 ki3'
        },
        'examples': {
            'hokkien': ('Tui-put-khi!', 'Sorry!'),
            'cantonese': ('Deoi3 m4 hei2!', 'Sorry!'),
            'teochew': ('Dui3 m5 ki2!', 'Sorry!'),
            'hakka': ('Tui3 m2 hi3!', 'Sorry!'),
            'hainanese': ('Dui3 m3 ki3!', 'Sorry!')
        },
        'pos': 'interjection',
        'frequency': 'very_common'
    },
    {
        'category': 'politeness',
        'english': 'Excuse me; May I ask',
        'mandarin': '请问',
        'traditional': '請問',
        'romanizations': {
            'hokkien': 'tshinn-buan',
            'cantonese': 'ching2 man6',
            'teochew': 'tshing2 bhoin6',
            'hakka': 'chin2 mun5',
            'hainanese': 'chin2 bun6'
        },
        'examples': {
            'hokkien': ('Tshinn-buan.', 'May I ask.'),
            'cantonese': ('Ching2 man6.', 'May I ask.'),
            'teochew': ('Tshing2 bhoin6.', 'May I ask.'),
            'hakka': ('Chin2 mun5.', 'May I ask.'),
            'hainanese': ('Chin2 bun6.', 'May I ask.')
        },
        'pos': 'expression',
        'frequency': 'very_common'
    },

    # TRANSPORT (10 deficit)
    {
        'category': 'transport',
        'english': 'Car',
        'mandarin': '车',
        'traditional': '車',
        'romanizations': {
            'hokkien': 'tshia',
            'cantonese': 'che1',
            'teochew': 'tshia1',
            'hakka': 'chia1',
            'hainanese': 'chia1'
        },
        'examples': {
            'hokkien': ('Tshia a.', 'Car.'),
            'cantonese': ('Che1.', 'Car.'),
            'teochew': ('Tshia1.', 'Car.'),
            'hakka': ('Chia1.', 'Car.'),
            'hainanese': ('Chia1.', 'Car.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'transport',
        'english': 'Bus',
        'mandarin': '巴士',
        'traditional': '巴士',
        'romanizations': {
            'hokkien': 'pa-tsi',
            'cantonese': 'ba1 si2',
            'teochew': 'pa1 si6',
            'hakka': 'pa1 sey2',
            'hainanese': 'pa1 si6'
        },
        'examples': {
            'hokkien': ('Pa-tsi.', 'Bus.'),
            'cantonese': ('Ba1 si2.', 'Bus.'),
            'teochew': ('Pa1 si6.', 'Bus.'),
            'hakka': ('Pa1 sey2.', 'Bus.'),
            'hainanese': ('Pa1 si6.', 'Bus.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'transport',
        'english': 'Taxi',
        'mandarin': '的士',
        'traditional': '的士',
        'romanizations': {
            'hokkien': 'tik-tsi',
            'cantonese': 'dik1 si2',
            'teochew': 'dik7 si6',
            'hakka': 'tik7 sey2',
            'hainanese': 'tik7 si6'
        },
        'examples': {
            'hokkien': ('Tik-tsi.', 'Taxi.'),
            'cantonese': ('Dik1 si2.', 'Taxi.'),
            'teochew': ('Dik7 si6.', 'Taxi.'),
            'hakka': ('Tik7 sey2.', 'Taxi.'),
            'hainanese': ('Tik7 si6.', 'Taxi.')
        },
        'pos': 'noun',
        'frequency': 'very_common'
    },
    {
        'category': 'transport',
        'english': 'Train',
        'mandarin': '火车',
        'traditional': '火車',
        'romanizations': {
            'hokkien': 'hue-tshia',
            'cantonese': 'fo2 che1',
            'teochew': 'hue2 tshia1',
            'hakka': 'fo3 chia1',
            'hainanese': 'hue3 chia1'
        },
        'examples': {
            'hokkien': ('Hue-tshia.', 'Train.'),
            'cantonese': ('Fo2 che1.', 'Train.'),
            'teochew': ('Hue2 tshia1.', 'Train.'),
            'hakka': ('Fo3 chia1.', 'Train.'),
            'hainanese': ('Hue3 chia1.', 'Train.')
        },
        'pos': 'noun',
        'frequency': 'common'
    },
    {
        'category': 'transport',
        'english': 'Bicycle',
        'mandarin': '自行车',
        'traditional': '自行車',
        'romanizations': {
            'hokkien': 'tsi-gian-tshia',
            'cantonese': 'zi6 hang4 che1',
            'teochew': 'zi6 hang5 tshia1',
            'hakka': 'chi6 hang2 chia1',
            'hainanese': 'chi6 hang3 chia1'
        },
        'examples': {
            'hokkien': ('Tsi-gian-tshia.', 'Bicycle.'),
            'cantonese': ('Zi6 hang4 che1.', 'Bicycle.'),
            'teochew': ('Zi6 hang5 tshia1.', 'Bicycle.'),
            'hakka': ('Chi6 hang2 chia1.', 'Bicycle.'),
            'hainanese': ('Chi6 hang3 chia1.', 'Bicycle.')
        },
        'pos': 'noun',
        'frequency': 'common'
    },
]

def build_tier2_entries(new_data):
    """Convert new data into dictionary entries."""
    now = datetime.now().isoformat()
    entries = []

    for data in new_data:
        category = data['category']
        english = data['english']
        mandarin = data['mandarin']
        traditional = data['traditional']
        romanizations = data['romanizations']
        examples = data['examples']
        pos = data['pos']
        frequency = data['frequency']

        for dialect in ['hokkien', 'cantonese', 'teochew', 'hakka', 'hainanese']:
            entry = {
                'id': str(uuid.uuid4()),
                'headword': {
                    'traditional': traditional,
                    'simplified': traditional,
                    'romanized': romanizations[dialect],
                    'english_pinyin': None
                },
                'dialect': dialect,
                'part_of_speech': pos,
                'definitions': [
                    {
                        'order': 1,
                        'english': english,
                        'mandarin': mandarin,
                        'examples': [
                            {
                                'text_source_lang': examples[dialect][0],
                                'text_target_lang': examples[dialect][1],
                                'source_dialect': dialect,
                                'context': category,
                                'formality': 'informal'
                            }
                        ],
                        'notes': None
                    }
                ],
                'pronunciations': [
                    {
                        'type': 'colloquial',
                        'romanization_system': {
                            'hokkien': 'poj',
                            'cantonese': 'jyutping',
                            'teochew': 'peng\'im',
                            'hakka': 'hakka_pinyin',
                            'hainanese': 'hainan_pinyin'
                        }[dialect],
                        'romanization': romanizations[dialect],
                        'ipa': None,
                        'audio_file': None,
                        'tone_marks': None
                    }
                ],
                'etymology': None,
                'tags': [category],
                'frequency': frequency,
                'register': 'informal',
                'related_words': [],
                'antonyms': [],
                'synonyms': [],
                'source': 'ai_generated',
                'verified_by': None,
                'created_at': now,
                'updated_at': now,
                'notes': None
            }
            entries.append(entry)

    return entries

# Generate and add new entries
new_entries = build_tier2_entries(TIER2_ENTRIES)
print(f"Generated {len(new_entries)} Tier-2 entries")

data['words'].extend(new_entries)

# Count by (dialect, category) again
combo_count = defaultdict(int)
for w in data['words']:
    tags = w.get('tags') or []
    cat = tags[0] if tags else 'other'
    combo_count[(w['dialect'], cat)] += 1

print("\nUpdated counts for Tier-2 categories:")
tier2_cats = ['person', 'taste', 'animal', 'politeness', 'transport']
for d in ['hokkien', 'cantonese', 'teochew', 'hakka', 'hainanese']:
    print(f"\n{d.upper()}:")
    for cat in tier2_cats:
        count = combo_count[(d, cat)]
        marker = '✓' if count >= 10 else '⚠️'
        print(f"  {cat:20} {count:4} {marker}")

# Write back
with open('public/dictionary.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with open('backend/data/dictionary.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Expanded to {len(data['words'])} total entries")
