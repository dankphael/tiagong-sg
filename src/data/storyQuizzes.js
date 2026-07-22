// New story quizzes for all 5 dialects
// 5 stories per dialect: hawker, mrt, workplace, family, ns
// Each story has 8-12 scenes with context + 3 dialogue options

const newStoryQuizzes = {
  hokkien: [
    {
      id: 2,
      title: "Hawker Center Adventure",
      story: "Navigate the bustling hawker center and order like a local",
      cues: [
        { context: "You arrive at the hawker center. The chicken rice uncle waves at you. You want to order.", dialogues: [
          { phrase: "Uncle, tsi̍t pah bah png, hó--bô?", meaning: "Uncle, one plate of chicken rice, OK?", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "The uncle asks if you want your chicken roasted or steamed. You prefer roasted.", dialogues: [
          { phrase: "Tshia--ê, hó--bô?", meaning: "Roasted one, OK?", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You need to find a seat. An auntie is sitting alone at a big table. You ask if you can share.", dialogues: [
          { phrase: "A-í, ē-sái tsia̍h--bô?", meaning: "Auntie, can I sit here?", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "A friend joins you. They ask what you're eating. You want to recommend the chicken rice.", dialogues: [
          { phrase: "Bah png chin hó-tsiok! Lí mā ài--bô?", meaning: "The chicken rice is delicious! Do you want some too?", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You're done eating. The uncle asks if you want a drink. You want iced tea.", dialogues: [
          { phrase: "Tsi̍t pah kòng-pi, peng--ê", meaning: "One iced coffee, iced one", correct: true },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false },
          { phrase: "Guán loo--e", meaning: "Oh my goodness", correct: false }
        ]},
        { context: "You're paying. The total is $3.50. You hand over a $5 note.", dialogues: [
          { phrase: "Gō͘ pah, thò͘-hōe--bô?", meaning: "Five dollars, can I get change?", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're leaving. The uncle says goodbye. You want to say thanks and come again.", dialogues: [
          { phrase: "To-siā! Bîn-á lâi--kòe", meaning: "Thank you! Come again tomorrow", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "Outside, your friend asks if the food was good. You want to say it was excellent.", dialogues: [
          { phrase: "Chin hó-tsiok! Tòa--khì", meaning: "Very delicious! Let's go", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
      ]
    },
    {
      id: 3,
      title: "MRT Commute Chaos",
      story: "Navigate the MRT during rush hour like a true Singaporean",
      cues: [
        { context: "You're at the MRT platform. The train is crowded. You need to get on.", dialogues: [
          { phrase: "Chìn-tsîng, chìn-tsîng", meaning: "Excuse me, coming through", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Someone's bag is in your way. You want to ask them to move it.", dialogues: [
          { phrase: "Phah-siànn, pàng--khì--tsit-pêng", meaning: "Sorry, put it to one side", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're standing near the door. The next stop is yours. You need to get off.", dialogues: [
          { phrase: "Chìn-tsîng, guán beh lo̍h", meaning: "Excuse me, I'm getting off", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "You miss your stop! You need to ask someone how to get back.", dialogues: [
          { phrase: "Phah-siànn, án-tsuánn khì--hia?", meaning: "Sorry, how do I get there?", correct: true },
          { phrase: "Guán loo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You find the right platform. The train is delayed. You complain to your friend.", dialogues: [
          { phrase: "Chin kú--ah! Tshia m̄-kín lâi", meaning: "So long! The train is slow to come", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally the train arrives. It's packed. You need to squeeze in.", dialogues: [
          { phrase: "Chìn-tsîng, ji̍p--khì--lāi", meaning: "Excuse me, let me get in", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You arrive at your destination. You're late for work. You text your boss.", dialogues: [
          { phrase: "Phah-siànn, guán tio̍h-bē--khí", meaning: "Sorry, I'll be late", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
      ]
    },
    {
      id: 4,
      title: "Workplace Banter",
      story: "A day at the office with Hokkien-speaking colleagues",
      cues: [
        { context: "You arrive at work. Your colleague asks if you had breakfast.", dialogues: [
          { phrase: "Tsia̍h-pn̄g--buē?", meaning: "Have you eaten breakfast?", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "It's lunchtime. Your team is deciding where to eat. You suggest the hawker center.", dialogues: [
          { phrase: "Lâi-khì tsia̍h-hōe--bô?", meaning: "Let's go to the hawker center?", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Back at the office, your boss asks about the project deadline. You're almost done.", dialogues: [
          { phrase: "Tsiok-kīn liáu, bîn-á hō͘--lí", meaning: "Almost done, will give it to you tomorrow", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "A colleague is struggling with their work. You offer to help.", dialogues: [
          { phrase: "Guán pang--lí--bô?", meaning: "Can I help you?", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "It's 5pm. Time to go home. You say goodbye to your colleagues.", dialogues: [
          { phrase: "Lâi-khì--ah, bîn-á khuì", meaning: "Let's go, see you tomorrow", correct: true },
          { phrase: "Guán loo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
      ]
    },
    {
      id: 5,
      title: "Family Dinner Gathering",
      story: "Sunday dinner at your grandparents' house",
      cues: [
        { context: "You arrive at your grandparents' house. Your grandmother greets you warmly.", dialogues: [
          { phrase: "A-má, lí-hó! Guán lâi--ah", meaning: "Grandma, hello! I've come", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Your grandmother asks if you're hungry. You want to say you're very hungry.", dialogues: [
          { phrase: "Chin ia̍h--ah!", meaning: "Very hungry!", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "Dinner is served. Your grandfather asks you to say grace. You bow your head.", dialogues: [
          { phrase: "Ló͘-kè, hó--tsiok", meaning: "Thank you, very good", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The food is delicious. You compliment your grandmother's cooking.", dialogues: [
          { phrase: "A-má ê tsài chin hó-tsiok!", meaning: "Grandma's cooking is very delicious!", correct: true },
          { phrase: "Guán loo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "After dinner, your uncle asks about your job. You want to say it's going well.", dialogues: [
          { phrase: "Tsō-kang hó--hó, bô--sū", meaning: "Work is fine, no problems", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "It's getting late. You need to leave. You say goodbye to everyone.", dialogues: [
          { phrase: "Guán beh khì--ah, to-siā--lín", meaning: "I'm leaving, thank you all", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
      ]
    },
    {
      id: 6,
      title: "NS Life Survival",
      story: "A day in National Service — Hokkien style",
      cues: [
        { context: "Reveille! The sergeant is shouting. You need to get up quickly.", dialogues: [
          { phrase: "Kin--lâi! Khí--lâi!", meaning: "Hurry! Get up!", correct: true },
          { phrase: "Lí-hó, guán ài khì", meaning: "Hello, I want to go", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Morning PT. The sergeant asks if you're ready. You want to say yes.", dialogues: [
          { phrase: "Hó--ah, sī--ah!", meaning: "Yes, ready!", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Lunch at the cookhouse. Your buddy asks what's good today.", dialogues: [
          { phrase: "Kin-á-jit bah png hó-tsiok", meaning: "Today the chicken rice is delicious", correct: true },
          { phrase: "Wa ai khi", meaning: "I want to go", correct: false },
          { phrase: "Tin-huan, tin-huan", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "Field camp. You're tired. Your buddy asks if you want to rest.", dialogues: [
          { phrase: "Hó, khùn--tsit-khùn", meaning: "OK, let me sleep a bit", correct: true },
          { phrase: "Lí khuì hoo?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The sergeant is angry. Someone made a mistake. You want to say it wasn't you.", dialogues: [
          { phrase: "M̄-sī guán!", meaning: "It wasn't me!", correct: true },
          { phrase: "Guán loo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Tin-hóo, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally, book out! You're going home. You say goodbye to your buddies.", dialogues: [
          { phrase: "Bîn-á khuì, hiaⁿ-tī!", meaning: "See you tomorrow, brothers!", correct: true },
          { phrase: "Guán m tsia̍t", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
      ]
    },
  ],
  cantonese: [
    {
      id: 2,
      title: "Hawker Center Adventure",
      story: "Navigate the bustling hawker center and order like a local",
      cues: [
        { context: "You arrive at the hawker center. The chicken rice uncle waves at you. You want to order.", dialogues: [
          { phrase: "Sik6 gai1 faan6, hou2 m4 hou2?", meaning: "Chicken rice, OK?", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "The uncle asks if you want your chicken roasted or steamed. You prefer roasted.", dialogues: [
          { phrase: "Siu1 gaa1 ge3, hou2 m4 hou2?", meaning: "Roasted chicken, OK?", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "You need to find a seat. An auntie is sitting alone. You ask if you can share.", dialogues: [
          { phrase: "Aa3 je2, ho2 m4 ho2 ji5 co5?", meaning: "Auntie, can I sit here?", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
        { context: "A friend joins you. They ask what you're eating. You recommend the chicken rice.", dialogues: [
          { phrase: "Gai1 faan6 hou2 sik6! Nei5 soeng2 m4 soeng2?", meaning: "The chicken rice is delicious! Do you want some too?", correct: true },
          { phrase: "Ngo5 heoi3", meaning: "I want to go", correct: false },
          { phrase: "M4 sai2, m4 sai2", meaning: "No need, no need", correct: false }
        ]},
        { context: "You're done eating. The uncle asks if you want a drink. You want iced tea.", dialogues: [
          { phrase: "Bing1 caa4, hou2 m4 hou2?", meaning: "Iced tea, OK?", correct: true },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false },
          { phrase: "Ngo5 lo5--e", meaning: "Oh my goodness", correct: false }
        ]},
        { context: "You're paying. The total is $3.50. You hand over a $5 note.", dialogues: [
          { phrase: "Ng5 man4, pui3 cin2 hou2 m4 hou2?", meaning: "Five dollars, can I get change?", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "You're leaving. The uncle says goodbye. You want to say thanks and come again.", dialogues: [
          { phrase: "Do1 ze6! Ting1 jat6 lai4!", meaning: "Thank you! Come again tomorrow!", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
      ]
    },
    {
      id: 3,
      title: "MRT Commute Chaos",
      story: "Navigate the MRT during rush hour like a true Singaporean",
      cues: [
        { context: "You're at the MRT platform. The train is crowded. You need to get on.", dialogues: [
          { phrase: "M4 goi1, jeoi6 gaan1", meaning: "Excuse me, coming through", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "Someone's bag is in your way. You want to ask them to move it.", dialogues: [
          { phrase: "M4 goi1, baau1 goi2 bin1 dou6", meaning: "Sorry, move your bag somewhere", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "You're standing near the door. The next stop is yours. You need to get off.", dialogues: [
          { phrase: "M4 goi1, ngo5 lok6 ce1", meaning: "Excuse me, I'm getting off", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
        { context: "You miss your stop! You need to ask someone how to get back.", dialogues: [
          { phrase: "M4 goi1, dim2 heoi3 go2 dou6?", meaning: "Sorry, how do I get there?", correct: true },
          { phrase: "Ngo5 lo5--e", meaning: "Oh my goodness", correct: false },
          { phrase: "M4 sai2, m4 sai2", meaning: "No need, no need", correct: false }
        ]},
        { context: "You find the right platform. The train is delayed. You complain to your friend.", dialogues: [
          { phrase: "Gam3 noi6! Ce1 m4 faai3 lai4", meaning: "So long! The train is slow to come", correct: true },
          { phrase: "Ngo5 heoi3", meaning: "I want to go", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "Finally the train arrives. It's packed. You need to squeeze in.", dialogues: [
          { phrase: "M4 goi1, zeoi2 gaan1", meaning: "Excuse me, let me get in", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "You arrive at your destination. You're late for work. You text your boss.", dialogues: [
          { phrase: "M4 goi1, ngo5 wui5 ci4 dou3", meaning: "Sorry, I'll be late", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
      ]
    },
    {
      id: 4,
      title: "Workplace Banter",
      story: "A day at the office with Cantonese-speaking colleagues",
      cues: [
        { context: "You arrive at work. Your colleague asks if you had breakfast.", dialogues: [
          { phrase: "Sik6 zo2 zou2 caan1 mei6 aa1?", meaning: "Have you eaten breakfast?", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "It's lunchtime. Your team is deciding where to eat. You suggest the hawker center.", dialogues: [
          { phrase: "Heoi3 caan1 teng1 sik6 faan6 hou2 m4 hou2?", meaning: "Let's go to the hawker center for lunch?", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "Back at the office, your boss asks about the project deadline. You're almost done.", dialogues: [
          { phrase: "Gau2 gan6 liu5, ting1 jat6 bei2 nei5", meaning: "Almost done, will give it to you tomorrow", correct: true },
          { phrase: "Ngo5 heoi3", meaning: "I want to go", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
        { context: "A colleague is struggling with their work. You offer to help.", dialogues: [
          { phrase: "Ngo5 bong1 nei5 hou2 m4 hou2?", meaning: "Can I help you?", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "M4 sai2, m4 sai2", meaning: "No need, no need", correct: false }
        ]},
        { context: "It's 5pm. Time to go home. You say goodbye to your colleagues.", dialogues: [
          { phrase: "Faan1 gung1 laa1, ting1 jat6 gin3!", meaning: "Let's go home, see you tomorrow!", correct: true },
          { phrase: "Ngo5 lo5--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
      ]
    },
    {
      id: 5,
      title: "Family Dinner Gathering",
      story: "Sunday dinner at your grandparents' house",
      cues: [
        { context: "You arrive at your grandparents' house. Your grandmother greets you warmly.", dialogues: [
          { phrase: "Maa4 maa4, nei5 hou2! Ngo5 lai4 laa1", meaning: "Grandma, hello! I've come", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "Your grandmother asks if you're hungry. You want to say you're very hungry.", dialogues: [
          { phrase: "Hou2 ngaa4--aa3!", meaning: "Very hungry!", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
        { context: "Dinner is served. Your grandfather asks you to say grace. You bow your head.", dialogues: [
          { phrase: "Do1 ze6, hou2 leng3", meaning: "Thank you, very good", correct: true },
          { phrase: "Ngo5 heoi3", meaning: "I want to go", correct: false },
          { phrase: "M4 sai2, m4 sai2", meaning: "No need, no need", correct: false }
        ]},
        { context: "The food is delicious. You compliment your grandmother's cooking.", dialogues: [
          { phrase: "Maa4 maa4 ge3 caai3 hou2 sik6!", meaning: "Grandma's cooking is very delicious!", correct: true },
          { phrase: "Ngo5 lo5--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "After dinner, your uncle asks about your job. You want to say it's going well.", dialogues: [
          { phrase: "Gung1 zou6 hou2 hou2, mou5 man6 tai4", meaning: "Work is fine, no problems", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "It's getting late. You need to leave. You say goodbye to everyone.", dialogues: [
          { phrase: "Ngo5 heoi3 laa1, do1 ze6", meaning: "I'm leaving, thank you all", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
      ]
    },
    {
      id: 6,
      title: "NS Life Survival",
      story: "A day in National Service — Cantonese style",
      cues: [
        { context: "Reveille! The sergeant is shouting. You need to get up quickly.", dialogues: [
          { phrase: "Faai3 di1! Heoi3 san1!", meaning: "Hurry! Get up!", correct: true },
          { phrase: "Nei5 hou2, ngo5 heoi3", meaning: "Hello, I want to go", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "Morning PT. The sergeant asks if you're ready. You want to say yes.", dialogues: [
          { phrase: "Hai6 laa1, hou2 hou2!", meaning: "Yes, ready!", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "M4 gau3, m4 gau3", meaning: "Not enough, not enough", correct: false }
        ]},
        { context: "Lunch at the cookhouse. Your buddy asks what's good today.", dialogues: [
          { phrase: "Gam1 jat6 gai1 faan6 hou2 sik6", meaning: "Today the chicken rice is delicious", correct: true },
          { phrase: "Ngo5 heoi3", meaning: "I want to go", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
        { context: "Field camp. You're tired. Your buddy asks if you want to rest.", dialogues: [
          { phrase: "Hou2, fan3 jat1 go3 zung1", meaning: "OK, let me sleep for an hour", correct: true },
          { phrase: "Nei5 heoi3 bin1 dou6?", meaning: "Where are you going?", correct: false },
          { phrase: "M4 sai2, m4 sai2", meaning: "No need, no need", correct: false }
        ]},
        { context: "The sergeant is angry. Someone made a mistake. You want to say it wasn't you.", dialogues: [
          { phrase: "M4 hai6 ngo5!", meaning: "It wasn't me!", correct: true },
          { phrase: "Ngo5 lo5--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Hou2 leng3, siu2 sam1", meaning: "Very beautiful, be careful", correct: false }
        ]},
        { context: "Finally, book out! You're going home. You say goodbye to your buddies.", dialogues: [
          { phrase: "Ting1 jat6 gin3, hing1 dai6!", meaning: "See you tomorrow, brothers!", correct: true },
          { phrase: "Ngo5 m4 zi1", meaning: "I don't know", correct: false },
          { phrase: "Hou2 maan6, hou2 maan6", meaning: "Very slow, very slow", correct: false }
        ]},
      ]
    },
  ],
  teochew: [
    {
      id: 2,
      title: "Hawker Center Adventure",
      story: "Navigate the bustling hawker center and order like a local",
      cues: [
        { context: "You arrive at the hawker center. The porridge auntie greets you.", dialogues: [
          { phrase: "A-i, zit8 bui5 muay, siang tng!", meaning: "Auntie, a bowl of porridge with soup!", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "The auntie asks what side dishes you want. You want braised duck.", dialogues: [
          { phrase: "Oi ka bui5 ah, siang!", meaning: "Give me a bowl of duck, fresh!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You need to find a seat. An uncle is sitting alone. You ask if you can share.", dialogues: [
          { phrase: "A-kong, oi co5 bo?", meaning: "Uncle, can I sit here?", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "A friend joins you. They ask what you're eating. You recommend the porridge.", dialogues: [
          { phrase: "Muay ho jia! Lu ai bo?", meaning: "The porridge is delicious! Do you want some?", correct: true },
          { phrase: "Wa ai ki", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You're done eating. You want to pay. The total is $4.", dialogues: [
          { phrase: "Go6 zap8, oi pua3!", meaning: "Forty cents, give me change!", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "You're leaving. The auntie says goodbye. You want to say thanks.", dialogues: [
          { phrase: "Do1 sia6! Zao2 san1!", meaning: "Thank you! Good morning!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
      ]
    },
    {
      id: 3,
      title: "MRT Commute Chaos",
      story: "Navigate the MRT during rush hour like a true Singaporean",
      cues: [
        { context: "You're at the MRT platform. The train is crowded. You need to get on.", dialogues: [
          { phrase: "M2 sai2, zao2 gaan1", meaning: "Excuse me, coming through", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Someone's bag is in your way. You want to ask them to move it.", dialogues: [
          { phrase: "Pai2 she6, ba2 goi2 bin1", meaning: "Sorry, move your bag somewhere", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're standing near the door. The next stop is yours. You need to get off.", dialogues: [
          { phrase: "M2 sai2, wa lok8 ce1", meaning: "Excuse me, I'm getting off", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "You miss your stop! You need to ask someone how to get back.", dialogues: [
          { phrase: "Pai2 she6, dim2 heoi3 go2 doh?", meaning: "Sorry, how do I get there?", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You find the right platform. The train is delayed. You complain to your friend.", dialogues: [
          { phrase: "Gam3 noi6! Ce1 m4 faai3 lai4", meaning: "So long! The train is slow to come", correct: true },
          { phrase: "Wa ai ki", meaning: "I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally the train arrives. It's packed. You need to squeeze in.", dialogues: [
          { phrase: "M2 sai2, zeoi2 gaan1", meaning: "Excuse me, let me get in", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You arrive at your destination. You're late for work. You text your boss.", dialogues: [
          { phrase: "Pai2 she6, wa wui5 ci4 dou3", meaning: "Sorry, I'll be late", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 4,
      title: "Workplace Banter",
      story: "A day at the office with Teochew-speaking colleagues",
      cues: [
        { context: "You arrive at work. Your colleague asks if you had breakfast.", dialogues: [
          { phrase: "Ziah8 pa2 boi6?", meaning: "Have you eaten breakfast?", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "It's lunchtime. Your team is deciding where to eat. You suggest the hawker center.", dialogues: [
          { phrase: "Heoi3 caan1 teng1 sik6 faan6 hou2 m4 hou2?", meaning: "Let's go to the hawker center for lunch?", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Back at the office, your boss asks about the project deadline. You're almost done.", dialogues: [
          { phrase: "Gau2 gan6 liu5, ming4 ni5 bei2 lu5", meaning: "Almost done, will give it to you tomorrow", correct: true },
          { phrase: "Wa ai ki", meaning: "I want to go", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "A colleague is struggling with their work. You offer to help.", dialogues: [
          { phrase: "Wa bong1 lu5 hou2 m4 hou2?", meaning: "Can I help you?", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "It's 5pm. Time to go home. You say goodbye to your colleagues.", dialogues: [
          { phrase: "Tng2 ki3 la, ming4 ni5 gin3!", meaning: "Let's go home, see you tomorrow!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
      ]
    },
    {
      id: 5,
      title: "Family Dinner Gathering",
      story: "Sunday dinner at your grandparents' house",
      cues: [
        { context: "You arrive at your grandparents' house. Your grandmother greets you warmly.", dialogues: [
          { phrase: "A-ma2, lu2 ho2! Wa2 lai5", meaning: "Grandma, hello! I've come", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Your grandmother asks if you're hungry. You want to say you're very hungry.", dialogues: [
          { phrase: "Zin1 ngaa4--ah!", meaning: "Very hungry!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "Dinner is served. Your grandfather asks you to say grace. You bow your head.", dialogues: [
          { phrase: "Do1 sia6, zin1 ho2", meaning: "Thank you, very good", correct: true },
          { phrase: "Wa ai ki", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The food is delicious. You compliment your grandmother's cooking.", dialogues: [
          { phrase: "A-ma2 ge3 caai3 zin1 ho2 jia2!", meaning: "Grandma's cooking is very delicious!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "After dinner, your uncle asks about your job. You want to say it's going well.", dialogues: [
          { phrase: "Kang1 zou6 zin1 ho2, bo5 man6 tai4", meaning: "Work is fine, no problems", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "It's getting late. You need to leave. You say goodbye to everyone.", dialogues: [
          { phrase: "Wa2 ai3 ki3 la, do1 sia6", meaning: "I'm leaving, thank you all", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 6,
      title: "NS Life Survival",
      story: "A day in National Service — Teochew style",
      cues: [
        { context: "Reveille! The sergeant is shouting. You need to get up quickly.", dialogues: [
          { phrase: "Kin1 lai1! Heoi3 san1!", meaning: "Hurry! Get up!", correct: true },
          { phrase: "Lu ho, wa ai ki", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Morning PT. The sergeant asks if you're ready. You want to say yes.", dialogues: [
          { phrase: "Si3 la, zun1 bei6!", meaning: "Yes, ready!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Lunch at the cookhouse. Your buddy asks what's good today.", dialogues: [
          { phrase: "Gam1 jit8 gai1 faan6 zin1 ho2 jia2", meaning: "Today the chicken rice is delicious", correct: true },
          { phrase: "Wa ai ki", meaning: "I want to go", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "Field camp. You're tired. Your buddy asks if you want to rest.", dialogues: [
          { phrase: "Ho2, khun3 zit8 go3 zung1", meaning: "OK, let me sleep for an hour", correct: true },
          { phrase: "Lu ki doh?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The sergeant is angry. Someone made a mistake. You want to say it wasn't you.", dialogues: [
          { phrase: "M2 si6 wa2!", meaning: "It wasn't me!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zing ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally, book out! You're going home. You say goodbye to your buddies.", dialogues: [
          { phrase: "Ming4 jit8 gin3, hia1 di3!", meaning: "See you tomorrow, brothers!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
      ]
    },
  ],
  hakka: [
    {
      id: 2,
      title: "Hawker Center Adventure",
      story: "Navigate the bustling hawker center and order like a local",
      cues: [
        { context: "You arrive at the hawker center. The chicken rice uncle waves at you.", dialogues: [
          { phrase: "Uncle, yit4 bui5 gai3 fan3, ho3 mo?", meaning: "Uncle, a bowl of chicken rice, OK?", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "The uncle asks if you want your chicken roasted or steamed. You prefer roasted.", dialogues: [
          { phrase: "Sieu3 gai1 ge3, ho3 mo?", meaning: "Roasted chicken, OK?", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You need to find a seat. An auntie is sitting alone. You ask if you can share.", dialogues: [
          { phrase: "A-po, ho2 m4 ho2 ji5 co5?", meaning: "Auntie, can I sit here?", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang sian, chang sian", meaning: "Very bored, very bored", correct: false }
        ]},
        { context: "A friend joins you. They ask what you're eating. You recommend the chicken rice.", dialogues: [
          { phrase: "Gai3 fan3 chang ho2 sik6! Ngi soeng2 m4 soeng2?", meaning: "The chicken rice is delicious! Do you want some too?", correct: true },
          { phrase: "Nga ai hi", meaning: "I want to go", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "You're done eating. The uncle asks if you want a drink. You want iced tea.", dialogues: [
          { phrase: "Ping3 cha5, ho3 mo?", meaning: "Iced tea, OK?", correct: true },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false },
          { phrase: "Nga lo--e", meaning: "Oh my goodness", correct: false }
        ]},
        { context: "You're paying. The total is $3.50. You hand over a $5 note.", dialogues: [
          { phrase: "Ng3 man4, pui3 cin2 ho2 m4 ho2?", meaning: "Five dollars, can I get change?", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're leaving. The uncle says goodbye. You want to say thanks and come again.", dialogues: [
          { phrase: "Do1 jia6! Ting1 jit8 lai4!", meaning: "Thank you! Come again tomorrow!", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang sian, chang sian", meaning: "Very bored, very bored", correct: false }
        ]},
      ]
    },
    {
      id: 3,
      title: "MRT Commute Chaos",
      story: "Navigate the MRT during rush hour like a true Singaporean",
      cues: [
        { context: "You're at the MRT platform. The train is crowded. You need to get on.", dialogues: [
          { phrase: "M4 goi1, jeoi2 gaan1", meaning: "Excuse me, coming through", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Someone's bag is in your way. You want to ask them to move it.", dialogues: [
          { phrase: "Pai2 se6, ba2 goi2 bin1", meaning: "Sorry, move your bag somewhere", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're standing near the door. The next stop is yours. You need to get off.", dialogues: [
          { phrase: "M4 goi1, nga lok8 ce1", meaning: "Excuse me, I'm getting off", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "You miss your stop! You need to ask someone how to get back.", dialogues: [
          { phrase: "Pai2 se6, dim2 hi go2 doh?", meaning: "Sorry, how do I get there?", correct: true },
          { phrase: "Nga lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "You find the right platform. The train is delayed. You complain to your friend.", dialogues: [
          { phrase: "Gam3 noi6! Ce1 m4 faai3 lai4", meaning: "So long! The train is slow to come", correct: true },
          { phrase: "Nga ai hi", meaning: "I want to go", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally the train arrives. It's packed. You need to squeeze in.", dialogues: [
          { phrase: "M4 goi1, jeoi2 gaan1", meaning: "Excuse me, let me get in", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You arrive at your destination. You're late for work. You text your boss.", dialogues: [
          { phrase: "Pai2 se6, nga wui5 ci4 dou3", meaning: "Sorry, I'll be late", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 4,
      title: "Workplace Banter",
      story: "A day at the office with Hakka-speaking colleagues",
      cues: [
        { context: "You arrive at work. Your colleague asks if you had breakfast.", dialogues: [
          { phrase: "Ya3 fan2 liaw5 maa", meaning: "Have you eaten breakfast?", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "It's lunchtime. Your team is deciding where to eat. You suggest the hawker center.", dialogues: [
          { phrase: "Hi caan1 teng1 sik6 fan3 ho2 m4 ho2?", meaning: "Let's go to the hawker center for lunch?", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Back at the office, your boss asks about the project deadline. You're almost done.", dialogues: [
          { phrase: "Gau2 gan6 liu5, ting1 jit8 bei2 ngi", meaning: "Almost done, will give it to you tomorrow", correct: true },
          { phrase: "Nga ai hi", meaning: "I want to go", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "A colleague is struggling with their work. You offer to help.", dialogues: [
          { phrase: "Nga bong1 ngi ho2 m4 ho2?", meaning: "Can I help you?", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "It's 5pm. Time to go home. You say goodbye to your colleagues.", dialogues: [
          { phrase: "Tng2 uk kei la, ting1 jit8 gin3!", meaning: "Let's go home, see you tomorrow!", correct: true },
          { phrase: "Nga lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
      ]
    },
    {
      id: 5,
      title: "Family Dinner Gathering",
      story: "Sunday dinner at your grandparents' house",
      cues: [
        { context: "You arrive at your grandparents' house. Your grandmother greets you warmly.", dialogues: [
          { phrase: "A-po, ngi ho! Nga lai4 la", meaning: "Grandma, hello! I've come", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Your grandmother asks if you're hungry. You want to say you're very hungry.", dialogues: [
          { phrase: "Chang ngaa4--aa!", meaning: "Very hungry!", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "Dinner is served. Your grandfather asks you to say grace. You bow your head.", dialogues: [
          { phrase: "Do1 jia6, chang ho", meaning: "Thank you, very good", correct: true },
          { phrase: "Nga ai hi", meaning: "I want to go", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "The food is delicious. You compliment your grandmother's cooking.", dialogues: [
          { phrase: "A-po ge3 caai3 chang ho2 sik6!", meaning: "Grandma's cooking is very delicious!", correct: true },
          { phrase: "Nga lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "After dinner, your uncle asks about your job. You want to say it's going well.", dialogues: [
          { phrase: "Kang1 zou6 chang ho, mo man6 tai", meaning: "Work is fine, no problems", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "It's getting late. You need to leave. You say goodbye to everyone.", dialogues: [
          { phrase: "Nga ai hi la, do1 jia6", meaning: "I'm leaving, thank you all", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 6,
      title: "NS Life Survival",
      story: "A day in National Service — Hakka style",
      cues: [
        { context: "Reveille! The sergeant is shouting. You need to get up quickly.", dialogues: [
          { phrase: "Kin1 lai1! Heoi3 san1!", meaning: "Hurry! Get up!", correct: true },
          { phrase: "Ngi ho, nga ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Morning PT. The sergeant asks if you're ready. You want to say yes.", dialogues: [
          { phrase: "Si3 la, zun1 bei6!", meaning: "Yes, ready!", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", romanisation: "mm ji" },
          { phrase: "Mo lui, mo lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Lunch at the cookhouse. Your buddy asks what's good today.", dialogues: [
          { phrase: "Gam1 jit8 gai3 fan3 chang ho2 sik6", meaning: "Today the chicken rice is delicious", correct: true },
          { phrase: "Nga ai hi", meaning: "I want to go", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "Field camp. You're tired. Your buddy asks if you want to rest.", dialogues: [
          { phrase: "Ho2, khun3 yit4 go3 zung1", meaning: "OK, let me sleep for an hour", correct: true },
          { phrase: "Ngi hi pa?", meaning: "Where are you going?", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "The sergeant is angry. Someone made a mistake. You want to say it wasn't you.", dialogues: [
          { phrase: "M2 si6 nga!", meaning: "It wasn't me!", correct: true },
          { phrase: "Nga lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Chang ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally, book out! You're going home. You say goodbye to your buddies.", dialogues: [
          { phrase: "Ting1 jit8 gin3, hiung1 ti3!", meaning: "See you tomorrow, brothers!", correct: true },
          { phrase: "Nga m sik", meaning: "I don't know", correct: false },
          { phrase: "Chang gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
  ],
  hainanese: [
    {
      id: 2,
      title: "Hawker Center Adventure",
      story: "Navigate the bustling hawker center and order like a local",
      cues: [
        { context: "You arrive at the hawker center. The chicken rice uncle waves at you.", dialogues: [
          { phrase: "Uncle, yat8 bui5 ke5 fan3, ho3 mo?", meaning: "Uncle, a bowl of chicken rice, OK?", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "The uncle asks if you want your chicken roasted or steamed. You prefer roasted.", dialogues: [
          { phrase: "Sieu3 ke5 ge3, ho3 mo?", meaning: "Roasted chicken, OK?", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You need to find a seat. An auntie is sitting alone. You ask if you can share.", dialogues: [
          { phrase: "A-ma2, ho2 m4 ho2 ji5 co5?", meaning: "Auntie, can I sit here?", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "A friend joins you. They ask what you're eating. You recommend the chicken rice.", dialogues: [
          { phrase: "Ke5 fan3 zin1 ho2 jia2! Nee soeng2 m4 soeng2?", meaning: "The chicken rice is delicious! Do you want some too?", correct: true },
          { phrase: "Wa ai hi", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You're done eating. The uncle asks if you want a drink. You want iced tea.", dialogues: [
          { phrase: "Ping3 te5, ho3 mo?", meaning: "Iced tea, OK?", correct: true },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false }
        ]},
        { context: "You're paying. The total is $3.50. You hand over a $5 note.", dialogues: [
          { phrase: "Ngau6 man4, pui3 cin2 ho2 m4 ho2?", meaning: "Five dollars, can I get change?", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're leaving. The uncle says goodbye. You want to say thanks and come again.", dialogues: [
          { phrase: "Do1 jia6! Ting1 jit8 lai4!", meaning: "Thank you! Come again tomorrow!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 3,
      title: "MRT Commute Chaos",
      story: "Navigate the MRT during rush hour like a true Singaporean",
      cues: [
        { context: "You're at the MRT platform. The train is crowded. You need to get on.", dialogues: [
          { phrase: "M4 goi1, jeoi2 gaan1", meaning: "Excuse me, coming through", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Someone's bag is in your way. You want to ask them to move it.", dialogues: [
          { phrase: "Pai2 se6, ba2 goi2 bin1", meaning: "Sorry, move your bag somewhere", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You're standing near the door. The next stop is yours. You need to get off.", dialogues: [
          { phrase: "M4 goi1, wa lok8 ce1", meaning: "Excuse me, I'm getting off", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "You miss your stop! You need to ask someone how to get back.", dialogues: [
          { phrase: "Pai2 se6, dim2 hi go2 doh?", meaning: "Sorry, how do I get there?", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "You find the right platform. The train is delayed. You complain to your friend.", dialogues: [
          { phrase: "Gam3 noi6! Ce1 m4 faai3 lai4", meaning: "So long! The train is slow to come", correct: true },
          { phrase: "Wa ai hi", meaning: "I want to go", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally the train arrives. It's packed. You need to squeeze in.", dialogues: [
          { phrase: "M4 goi1, jeoi2 gaan1", meaning: "Excuse me, let me get in", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "You arrive at your destination. You're late for work. You text your boss.", dialogues: [
          { phrase: "Pai2 se6, wa wui5 ci4 dou3", meaning: "Sorry, I'll be late", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 4,
      title: "Workplace Banter",
      story: "A day at the office with Hainanese-speaking colleagues",
      cues: [
        { context: "You arrive at work. Your colleague asks if you had breakfast.", dialogues: [
          { phrase: "Chiak7 bo?", meaning: "Have you eaten breakfast?", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "It's lunchtime. Your team is deciding where to eat. You suggest the hawker center.", dialogues: [
          { phrase: "Hi caan1 teng1 sik6 fan3 ho2 m4 ho2?", meaning: "Let's go to the hawker center for lunch?", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Back at the office, your boss asks about the project deadline. You're almost done.", dialogues: [
          { phrase: "Gau2 gan6 liu5, ting1 jit8 bei2 nee", meaning: "Almost done, will give it to you tomorrow", correct: true },
          { phrase: "Wa ai hi", meaning: "I want to go", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "A colleague is struggling with their work. You offer to help.", dialogues: [
          { phrase: "Wa bong1 nee ho2 m4 ho2?", meaning: "Can I help you?", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "It's 5pm. Time to go home. You say goodbye to your colleagues.", dialogues: [
          { phrase: "Tng2 uk kei la, ting1 jit8 gin3!", meaning: "Let's go home, see you tomorrow!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
      ]
    },
    {
      id: 5,
      title: "Family Dinner Gathering",
      story: "Sunday dinner at your grandparents' house",
      cues: [
        { context: "You arrive at your grandparents' house. Your grandmother greets you warmly.", dialogues: [
          { phrase: "A-ma2, nee hoh! Wa lai4 la", meaning: "Grandma, hello! I've come", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Your grandmother asks if you're hungry. You want to say you're very hungry.", dialogues: [
          { phrase: "Zin1 ngaa4--aa!", meaning: "Very hungry!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "Dinner is served. Your grandfather asks you to say grace. You bow your head.", dialogues: [
          { phrase: "Do1 jia6, zin1 ho2", meaning: "Thank you, very good", correct: true },
          { phrase: "Wa ai hi", meaning: "I want to go", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The food is delicious. You compliment your grandmother's cooking.", dialogues: [
          { phrase: "A-ma2 ge3 caai3 zin1 ho2 jia2!", meaning: "Grandma's cooking is very delicious!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "After dinner, your uncle asks about your job. You want to say it's going well.", dialogues: [
          { phrase: "Kang1 zou6 zin1 ho2, bo5 man6 tai", meaning: "Work is fine, no problems", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "It's getting late. You need to leave. You say goodbye to everyone.", dialogues: [
          { phrase: "Wa ai hi la, do1 jia6", meaning: "I'm leaving, thank you all", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
    {
      id: 6,
      title: "NS Life Survival",
      story: "A day in National Service — Hainanese style",
      cues: [
        { context: "Reveille! The sergeant is shouting. You need to get up quickly.", dialogues: [
          { phrase: "Kin1 lai1! Heoi3 san1!", meaning: "Hurry! Get up!", correct: true },
          { phrase: "Nee hoh, wa ai hi", meaning: "Hello, I want to go", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Morning PT. The sergeant asks if you're ready. You want to say yes.", dialogues: [
          { phrase: "Si3 la, zun1 bei6!", meaning: "Yes, ready!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "Lunch at the cookhouse. Your buddy asks what's good today.", dialogues: [
          { phrase: "Gam1 jit8 ke5 fan3 zin1 ho2 jia2", meaning: "Today the chicken rice is delicious", correct: true },
          { phrase: "Wa ai hi", meaning: "I want to go", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
        { context: "Field camp. You're tired. Your buddy asks if you want to rest.", dialogues: [
          { phrase: "Ho2, khun3 yit4 go3 zung1", meaning: "OK, let me sleep for an hour", correct: true },
          { phrase: "Nee hi na li?", meaning: "Where are you going?", correct: false },
          { phrase: "Boh eng, boh eng", meaning: "No time, no time", correct: false }
        ]},
        { context: "The sergeant is angry. Someone made a mistake. You want to say it wasn't you.", dialogues: [
          { phrase: "M2 si6 wa!", meaning: "It wasn't me!", correct: true },
          { phrase: "Wa lo--e", meaning: "Oh my goodness", correct: false },
          { phrase: "Zin ho, sio sim", meaning: "Very good, be careful", correct: false }
        ]},
        { context: "Finally, book out! You're going home. You say goodbye to your buddies.", dialogues: [
          { phrase: "Ting1 jit8 gin3, hia1 di3!", meaning: "See you tomorrow, brothers!", correct: true },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false },
          { phrase: "Zin gau lo", meaning: "Very full already", correct: false }
        ]},
      ]
    },
  ],
};

export default newStoryQuizzes;
