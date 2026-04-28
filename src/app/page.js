'use client';

import { useState, useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const dialects = [
  {
    id: "hokkien",
    name: "Hokkien",
    chinese: "福建话",
    color: "#C0392B",
    accent: "#E74C3C",
    bg: "#FDF0EF",
    origin: "Fujian Province",
    speakers: "~40% of Chinese Singaporeans",
    icon: "🏮",
    description: "The most widely spoken dialect in Singapore, brought by immigrants from Fujian province.",
  },
  {
    id: "cantonese",
    name: "Cantonese",
    chinese: "广东话",
    color: "#8E44AD",
    accent: "#9B59B6",
    bg: "#F5EEF8",
    origin: "Guangdong Province",
    speakers: "~17% of Chinese Singaporeans",
    icon: "🎎",
    description: "Widely recognised through Hong Kong media, spoken by Cantonese and Hakka communities.",
  },
  {
    id: "teochew",
    name: "Teochew",
    chinese: "潮州话",
    color: "#1A6B3C",
    accent: "#27AE60",
    bg: "#EAFAF1",
    origin: "Chaozhou, Guangdong",
    speakers: "~22% of Chinese Singaporeans",
    icon: "🍵",
    description: "Spoken by Teochew people who settled along the coast; closely related to Hokkien.",
  },
  {
    id: "hakka",
    name: "Hakka",
    chinese: "客家话",
    color: "#D4860B",
    accent: "#E67E22",
    bg: "#FEF9E7",
    origin: "Various southern provinces",
    speakers: "~7% of Chinese Singaporeans",
    icon: "🌾",
    description: "The 'guest people' language — Hakka communities are known for resilience and migration.",
  },
  {
    id: "hainanese",
    name: "Hainanese",
    chinese: "海南话",
    color: "#1A7EA6",
    accent: "#2980B9",
    bg: "#EBF5FB",
    origin: "Hainan Island",
    speakers: "~7% of Chinese Singaporeans",
    icon: "🌊",
    description: "Spoken by immigrants from Hainan Island, known for Hainanese chicken rice!",
  },
];

const huayKuan = [
  {
    id: "shhk",
    name: "Singapore Hokkien Huay Kuan",
    shortName: "SHHK",
    dialect: "hokkien",
    dialectLabel: "Hokkien (Fujian)",
    founded: 1840,
    members: "5,000+",
    color: "#C0392B",
    icon: "🏮",
    pin: { x: 367, y: 132 },
    address: "5 Sennett Road, Singapore 466781",
    tel: ["+65 6222 8212 (Main)", "+65 6589 9500 (Cultural Academy)"],
    website: "shhk.com.sg",
    websiteUrl: "http://shhk.com.sg",
    email: "membership@shhk.com.sg",
    description: "The oldest and largest Chinese clan association in Singapore, founded in 1840 on the grounds of the Thian Hock Keng Temple. It now has over 5,000 members and runs pre-schools, cultural academies, and arts programmes. It relocated its headquarters from Telok Ayer to Sennett Road in 2014 — the first move in 174 years.",
  },
  {
    id: "teochew",
    name: "Teochew Poit Ip Huay Kuan",
    shortName: "Poit Ip",
    dialect: "teochew",
    dialectLabel: "Teochew (Chaozhou)",
    founded: 1929,
    members: "~5,000",
    color: "#1A6B3C",
    icon: "🍵",
    pin: { x: 330, y: 128 },
    address: "563A Balestier Road, Singapore 329879",
    tel: ["+65 6738 2691"],
    fax: "+65 6738 6937",
    whatsapp: "+65 9653 7718",
    email: "poitip@teochew.sg",
    website: "teochew.sg",
    websiteUrl: "http://teochew.sg",
    hours: "Mon–Fri, 9AM–6PM · Closed weekends & PH",
    description: "Established in 1929, Poit Ip refers to the eight Teochew districts of Guangdong province. It has approximately 5,000 members as of 2022 and maintains close ties with Ngee Ann Kongsi.",
  },
  {
    id: "kwangtung",
    name: "Singapore Kwangtung Hui Kuan",
    shortName: "Kwangtung",
    dialect: "cantonese",
    dialectLabel: "Cantonese (Guangdong)",
    founded: 1937,
    color: "#8E44AD",
    icon: "🎎",
    pin: { x: 308, y: 170 },
    address: "151 Chin Swee Road, #15-01 Manhattan House, Singapore 169876",
    tel: ["+65 6735 5216"],
    fax: "+65 6235 4681",
    email: "skthk@singnet.com.sg",
    website: "skthk.sg",
    websiteUrl: "http://skthk.sg",
    description: "Founded in 1937, it serves Chinese from Guangdong province and represents a community that speaks Cantonese, Teochew, Hainanese, and Hakka. It is one of the founding members of the Singapore Federation of Chinese Clan Associations (SFCCA).",
  },
  {
    id: "hakka",
    name: "Nanyang Hakka Federation",
    shortName: "NHF",
    dialect: "hakka",
    dialectLabel: "Hakka (Kejia)",
    color: "#D4860B",
    icon: "🌾",
    pin: { x: 322, y: 179 },
    address: "20 Peck Seah Street, Singapore 079312",
    tel: ["+65 6221 0605", "+65 6222 6590"],
    fax: "+65 6221 6898",
    email: "nykcg@singnet.com.sg",
    website: "nhf.sg",
    websiteUrl: "http://nhf.sg",
    description: "The Hakka association (also known as Nanyang Khek Community Guild), representing approximately 8% of Singapore's Chinese population, is headquartered at Peck Seah Street in Tanjong Pagar.",
  },
  {
    id: "hainanese",
    name: "Singapore Hainan Hwee Kuan",
    shortName: "Hainan HK",
    dialect: "hainanese",
    dialectLabel: "Hainanese",
    founded: 1854,
    color: "#1A7EA6",
    icon: "🌊",
    pin: { x: 355, y: 162 },
    address: "47 Beach Road, Singapore 189683",
    tel: ["+65 6336 0682"],
    description: "One of the oldest registered societies in Singapore, founded in 1854 by clansmen from Qiongzhou (Hainan). Its name was officially changed from Kiung Chow Hwee Kuan to Hainan Hwee Kuan in 1994 to reflect the creation of Hainan province in China.",
  },
  {
    id: "foochow",
    name: "Singapore Foochow Association",
    shortName: "Foochow",
    dialect: "foochow",
    dialectLabel: "Fuzhou (Foochow / Hock Chew)",
    color: "#16A085",
    icon: "🏛️",
    pin: { x: 340, y: 152 },
    address: "21 Tyrwhitt Road, #04-01 Foochow Building, Singapore 207530",
    tel: ["+65 6293 9852"],
    hallRental: ["+65 6396 5295", "+65 6293 4666"],
    fax: "+65 6292 7886",
    email: "sfa@foochow.org",
    website: "foochow.org",
    websiteUrl: "http://foochow.org",
    description: "The association for the Fuzhou-speaking community, housed in the Foochow Building on Tyrwhitt Road in Jalan Besar.",
  },
];

const lessons = {
  hokkien: {
    greetings: [
      { phrase: "Lí hó", chinese: "你好", meaning: "Hello / How are you?", romanisation: "lee ho" },
      { phrase: "Jia pa buay?", chinese: "吃饱未？", meaning: "Have you eaten?", romanisation: "jia pa buay" },
      { phrase: "Gong xi", chinese: "恭喜", meaning: "Congratulations", romanisation: "gong see" },
      { phrase: "Chin ho", chinese: "真好", meaning: "Very good", romanisation: "chin ho" },
      { phrase: "Beh sai", chinese: "袂使", meaning: "Cannot / Not allowed", romanisation: "beh sai" },
      { phrase: "Ua ai", chinese: "我爱", meaning: "I love", romanisation: "wa ai" },
      { phrase: "Siong hoa", chinese: "相好", meaning: "Good friends", romanisation: "siong hoa" },
      { phrase: "Lo li", chinese: "劳力", meaning: "Thank you (for your effort)", romanisation: "lor li" },
      { phrase: "Beh pai", chinese: "未歹", meaning: "Not bad", romanisation: "beh pai" },
      { phrase: "Kin lai", chinese: "紧来", meaning: "Come quickly / Hurry up", romanisation: "kin lai" },
      { phrase: "Sio sim", chinese: "小心", meaning: "Be careful", romanisation: "sio sim" },
      { phrase: "Wa m bat", chinese: "我唔识", meaning: "I don't know", romanisation: "wa m bat" },
      { phrase: "Li toh khi?", chinese: "你去哪？", meaning: "Where are you going?", romanisation: "li doh ki" },
      { phrase: "Wa lau eh", chinese: "我老的", meaning: "Oh my goodness!", romanisation: "wa lau eh" },
      { phrase: "Pai seh", chinese: "歹势", meaning: "Embarrassing / Sorry", romanisation: "pai seh" },
      { phrase: "Si boh?", chinese: "是否？", meaning: "Is it true? / Really?", romanisation: "si boh" },
      { phrase: "Tua nang", chinese: "大人", meaning: "Adult / Elder", romanisation: "tua nang" },
      { phrase: "Gao lat", chinese: "够力", meaning: "Very powerful / Impressive", romanisation: "gao lat" },
      { phrase: "Ho chia", chinese: "好吃", meaning: "Delicious", romanisation: "ho jia" },
      { phrase: "Wa siong", chinese: "我想", meaning: "I think / I want", romanisation: "wa siong" },
      { phrase: "Chiak liao", chinese: "食了", meaning: "Already eaten", romanisation: "jiak liao" },
      { phrase: "Boh lui", chinese: "没钱", meaning: "No money", romanisation: "boh lui" },
      { phrase: "Eh sai", chinese: "会使", meaning: "Can / OK / Possible", romanisation: "eh sai" },
      { phrase: "Chin sian", chinese: "真闲", meaning: "Very bored / Idle", romanisation: "chin sian" },
      { phrase: "Tua liap", chinese: "大粒", meaning: "Big / Large", romanisation: "tua liap" },
      { phrase: "Sio liap", chinese: "小粒", meaning: "Small / Little", romanisation: "sio liap" },
      { phrase: "Hao jia", chinese: "好家", meaning: "Good home / Lucky", romanisation: "hao jia" },
      { phrase: "Chin sui", chinese: "真水", meaning: "Very beautiful", romanisation: "chin sui" },
      { phrase: "Buay tahan", chinese: "袂担", meaning: "Cannot take it / Unbearable", romanisation: "buay tahan" },
      { phrase: "Jiak simi", chinese: "食什么", meaning: "What are you eating?", romanisation: "jiak si mi" },
      { phrase: "Boh eng", chinese: "没空", meaning: "Not free / Busy", romanisation: "boh eng" },
      { phrase: "Ui tia", chinese: "畏痛", meaning: "Afraid of pain", romanisation: "ui tia" },
      { phrase: "Jit si", chinese: "一时", meaning: "For a moment / Briefly", romanisation: "jit si" },
      { phrase: "Hia di", chinese: "兄弟", meaning: "Brothers / Buddies", romanisation: "hia di" },
      { phrase: "Chin gao", chinese: "真高", meaning: "Very tall / Very high", romanisation: "chin gao" },
      { phrase: "Tio liao", chinese: "着了", meaning: "Got it / That's right", romanisation: "dio liao" },
      { phrase: "Hor bo?", chinese: "好无？", meaning: "Is it good? / OK?", romanisation: "hor bo" },
      { phrase: "Wa eh tio", chinese: "我会着", meaning: "I will manage", romanisation: "wa eh dio" },
      { phrase: "Siong ban", chinese: "想慢", meaning: "Think slowly / Take your time", romanisation: "siong ban" },
      { phrase: "Ka li kong", chinese: "给你讲", meaning: "Let me tell you", romanisation: "ka li kong" },
      { phrase: "Wa ai khi", chinese: "我要去", meaning: "I want to go", romanisation: "wa ai ki" },
      { phrase: "Peng an", chinese: "平安", meaning: "Peace / Safe journey", romanisation: "peng an" },
      { phrase: "Ho un", chinese: "好运", meaning: "Good luck", romanisation: "ho un" },
      { phrase: "Jip lai", chinese: "入来", meaning: "Come in / Enter", romanisation: "jip lai" },
      { phrase: "Chut khi", chinese: "出去", meaning: "Go out / Exit", romanisation: "jut ki" },
      { phrase: "Boh su", chinese: "没事", meaning: "Nothing / Never mind", romanisation: "boh su" },
      { phrase: "Lo kong", chinese: "老公", meaning: "Husband", romanisation: "lo kong" },
      { phrase: "Lo bo", chinese: "老母", meaning: "Wife / Old mother", romanisation: "lo bo" },
      { phrase: "Kim si", chinese: "今时", meaning: "Nowadays / These days", romanisation: "kim si" },
      { phrase: "Chia ah", chinese: "且啊", meaning: "Wait a moment", romanisation: "jia ah" },
    ],
    numbers: [
      { phrase: "Chit", chinese: "一", meaning: "One", romanisation: "chit" },
      { phrase: "Nn̄g", chinese: "二", meaning: "Two", romanisation: "nng" },
      { phrase: "Sann", chinese: "三", meaning: "Three", romanisation: "sann" },
      { phrase: "Sì", chinese: "四", meaning: "Four", romanisation: "si" },
      { phrase: "Gō͘", chinese: "五", meaning: "Five", romanisation: "go" },
      { phrase: "Lak", chinese: "六", meaning: "Six", romanisation: "lak" },
      { phrase: "Chhit", chinese: "七", meaning: "Seven", romanisation: "chhit" },
      { phrase: "Peh", chinese: "八", meaning: "Eight", romanisation: "peh" },
      { phrase: "Káu", chinese: "九", meaning: "Nine", romanisation: "kau" },
      { phrase: "Chap", chinese: "十", meaning: "Ten", romanisation: "chap" },
      { phrase: "Chap it", chinese: "十一", meaning: "Eleven", romanisation: "chap it" },
      { phrase: "Chap jī", chinese: "十二", meaning: "Twelve", romanisation: "chap ji" },
      { phrase: "Chap sann", chinese: "十三", meaning: "Thirteen", romanisation: "chap sann" },
      { phrase: "Jī chap", chinese: "二十", meaning: "Twenty", romanisation: "ji chap" },
      { phrase: "Sann chap", chinese: "三十", meaning: "Thirty", romanisation: "sann chap" },
      { phrase: "Sì chap", chinese: "四十", meaning: "Forty", romanisation: "si chap" },
      { phrase: "Gō͘ chap", chinese: "五十", meaning: "Fifty", romanisation: "go chap" },
      { phrase: "Lak chap", chinese: "六十", meaning: "Sixty", romanisation: "lak chap" },
      { phrase: "Chhit chap", chinese: "七十", meaning: "Seventy", romanisation: "chhit chap" },
      { phrase: "Peh chap", chinese: "八十", meaning: "Eighty", romanisation: "peh chap" },
      { phrase: "Káu chap", chinese: "九十", meaning: "Ninety", romanisation: "kau chap" },
      { phrase: "It pah", chinese: "一百", meaning: "One hundred", romanisation: "it pah" },
      { phrase: "Jī pah", chinese: "两百", meaning: "Two hundred", romanisation: "ji pah" },
      { phrase: "It chheng", chinese: "一千", meaning: "One thousand", romanisation: "it chheng" },
      { phrase: "It bān", chinese: "一万", meaning: "Ten thousand", romanisation: "it ban" },
      { phrase: "Siu̍t", chinese: "数", meaning: "Number / Count", romanisation: "siok" },
      { phrase: "Tōa siu̍t", chinese: "大数", meaning: "Large number", romanisation: "toa siok" },
      { phrase: "Sió siu̍t", chinese: "小数", meaning: "Small number", romanisation: "sio siok" },
      { phrase: "Pêng hun", chinese: "平分", meaning: "Equal share / Split equally", romanisation: "peng hun" },
      { phrase: "Chit pái", chinese: "一次", meaning: "Once / One time", romanisation: "chit pai" },
      { phrase: "Nn̄g pái", chinese: "两次", meaning: "Twice / Two times", romanisation: "nng pai" },
      { phrase: "Chit tiám", chinese: "一点", meaning: "One o'clock / A little", romanisation: "chit diam" },
      { phrase: "Jī tiám", chinese: "两点", meaning: "Two o'clock", romanisation: "ji diam" },
      { phrase: "Sann tiám", chinese: "三点", meaning: "Three o'clock", romanisation: "sann diam" },
      { phrase: "Pàng àm", chinese: "半暗", meaning: "Midnight / Half past night", romanisation: "pang am" },
      { phrase: "Chit lé pài", chinese: "一礼拜", meaning: "One week", romanisation: "chit le pai" },
      { phrase: "Jī lé pài", chinese: "两礼拜", meaning: "Two weeks", romanisation: "ji le pai" },
      { phrase: "Chit goe̍h", chinese: "一月", meaning: "One month / January", romanisation: "chit geh" },
      { phrase: "Jī goe̍h", chinese: "二月", meaning: "February", romanisation: "ji geh" },
      { phrase: "Sann goe̍h", chinese: "三月", meaning: "March", romanisation: "sann geh" },
      { phrase: "Sì goe̍h", chinese: "四月", meaning: "April", romanisation: "si geh" },
      { phrase: "Gō͘ goe̍h", chinese: "五月", meaning: "May", romanisation: "go geh" },
      { phrase: "Lak goe̍h", chinese: "六月", meaning: "June", romanisation: "lak geh" },
      { phrase: "Chhit goe̍h", chinese: "七月", meaning: "July / Ghost month", romanisation: "chhit geh" },
      { phrase: "Peh goe̍h", chinese: "八月", meaning: "August", romanisation: "peh geh" },
      { phrase: "Káu goe̍h", chinese: "九月", meaning: "September", romanisation: "kau geh" },
      { phrase: "Chap goe̍h", chinese: "十月", meaning: "October", romanisation: "chap geh" },
      { phrase: "Chap it goe̍h", chinese: "十一月", meaning: "November", romanisation: "chap it geh" },
      { phrase: "Chap jī goe̍h", chinese: "十二月", meaning: "December", romanisation: "chap ji geh" },
      { phrase: "Chit nî", chinese: "一年", meaning: "One year", romanisation: "chit ni" },
    ],
    food: [
      { phrase: "Mī", chinese: "面", meaning: "Noodles", romanisation: "mee" },
      { phrase: "Png", chinese: "饭", meaning: "Rice", romanisation: "pung" },
      { phrase: "Kopi", chinese: "咖啡", meaning: "Coffee", romanisation: "ko-pee" },
      { phrase: "Bah kut teh", chinese: "肉骨茶", meaning: "Pork rib soup", romanisation: "bah kut teh" },
      { phrase: "Char bī hoon", chinese: "炒米粉", meaning: "Fried rice vermicelli", romanisation: "char bee hoon" },
      { phrase: "Teh", chinese: "茶", meaning: "Tea", romanisation: "teh" },
      { phrase: "Lor mee", chinese: "卤面", meaning: "Braised noodles", romanisation: "lor mee" },
      { phrase: "Ban mian", chinese: "板面", meaning: "Hand-cut noodles", romanisation: "ban mian" },
      { phrase: "Char koay teow", chinese: "炒粿条", meaning: "Fried flat noodles", romanisation: "char kway teow" },
      { phrase: "Bak chor mee", chinese: "肉碎面", meaning: "Minced pork noodles", romanisation: "bak chor mee" },
      { phrase: "Chye tow koay", chinese: "菜头粿", meaning: "Carrot cake", romanisation: "chai tow kway" },
      { phrase: "Oh ah mee sua", chinese: "蚵仔面线", meaning: "Oyster vermicelli", romanisation: "or ah mee sua" },
      { phrase: "Popiah", chinese: "薄饼", meaning: "Fresh spring roll", romanisation: "popiah" },
      { phrase: "Kueh", chinese: "粿", meaning: "Rice cake / Kueh", romanisation: "kueh" },
      { phrase: "Ang ku kueh", chinese: "红龟粿", meaning: "Red tortoise cake", romanisation: "ang ku kueh" },
      { phrase: "Png kueh", chinese: "饭粿", meaning: "Rice dumpling cake", romanisation: "pung kueh" },
      { phrase: "Teow chew muay", chinese: "潮州糜", meaning: "Teochew style congee", romanisation: "teow jew muay" },
      { phrase: "Orh nee", chinese: "芋泥", meaning: "Yam paste dessert", romanisation: "or nee" },
      { phrase: "Tau suan", chinese: "豆爽", meaning: "Split mung bean dessert", romanisation: "tau suan" },
      { phrase: "Goreng pisang", chinese: "炸香蕉", meaning: "Fried banana fritter", romanisation: "goreng pisang" },
      { phrase: "Bak zhang", chinese: "肉粽", meaning: "Savoury rice dumpling", romanisation: "bak zhang" },
      { phrase: "Soon kueh", chinese: "笋粿", meaning: "Bamboo shoot dumpling", romanisation: "soon kueh" },
      { phrase: "Bee tai bak", chinese: "米苔目", meaning: "Rice noodle in soup", romanisation: "bee tai bak" },
      { phrase: "Oh luak", chinese: "蚝烙", meaning: "Oyster omelette", romanisation: "or luak" },
      { phrase: "Kiam chye", chinese: "咸菜", meaning: "Salted vegetables", romanisation: "kiam chai" },
      { phrase: "Ter kah", chinese: "猪脚", meaning: "Pig's trotter", romanisation: "ter kah" },
      { phrase: "Png kah", chinese: "饭脚", meaning: "Side dish with rice", romanisation: "pung kah" },
      { phrase: "Tau hu", chinese: "豆腐", meaning: "Tofu / Bean curd", romanisation: "tau hu" },
      { phrase: "Tau kua", chinese: "豆干", meaning: "Firm tofu", romanisation: "tau kwa" },
      { phrase: "Him chim peng", chinese: "咸煎饼", meaning: "Savoury fried pastry", romanisation: "him jim peng" },
      { phrase: "Oo ah", chinese: "乌鱼", meaning: "Mullet fish", romanisation: "oo ah" },
      { phrase: "Hu", chinese: "鱼", meaning: "Fish", romanisation: "hu" },
      { phrase: "Bak", chinese: "肉", meaning: "Meat / Pork", romanisation: "bak" },
      { phrase: "Ai kio", chinese: "爱咬", meaning: "Crispy / Chewy texture", romanisation: "ai kio" },
      { phrase: "Him", chinese: "咸", meaning: "Salty", romanisation: "him" },
      { phrase: "Ti", chinese: "甜", meaning: "Sweet", romanisation: "ti" },
      { phrase: "Sng", chinese: "酸", meaning: "Sour", romanisation: "sng" },
      { phrase: "Hiam", chinese: "辣", meaning: "Spicy", romanisation: "hiam" },
      { phrase: "Ko", chinese: "苦", meaning: "Bitter", romanisation: "ko" },
      { phrase: "Bah png", chinese: "肉饭", meaning: "Braised pork rice", romanisation: "bah pung" },
      { phrase: "Tng", chinese: "汤", meaning: "Soup / Broth", romanisation: "tng" },
      { phrase: "Chye", chinese: "菜", meaning: "Vegetables", romanisation: "chai" },
      { phrase: "Nng", chinese: "卵", meaning: "Egg", romanisation: "nng" },
      { phrase: "Ke", chinese: "鸡", meaning: "Chicken", romanisation: "ke" },
      { phrase: "Beh", chinese: "马", meaning: "Horse / Old-style beef", romanisation: "beh" },
      { phrase: "Hae", chinese: "虾", meaning: "Prawns / Shrimp", romanisation: "hae" },
      { phrase: "Hae bee", chinese: "虾米", meaning: "Dried shrimp", romanisation: "hae bee" },
      { phrase: "Mee pok", chinese: "面薄", meaning: "Flat yellow noodles", romanisation: "mee pok" },
      { phrase: "Kway teow soup", chinese: "粿条汤", meaning: "Rice noodle soup", romanisation: "kway teow soup" },
      { phrase: "Teh tarik", chinese: "拉茶", meaning: "Pulled milk tea", romanisation: "teh tarik" },
    ],
  },
  cantonese: {
    greetings: [
      { phrase: "Néih hóu", chinese: "你好", meaning: "Hello", romanisation: "nay ho" },
      { phrase: "Sihk jó faahn meih a?", chinese: "食咗饭未呀？", meaning: "Have you eaten?", romanisation: "sik jo faan mei aa" },
      { phrase: "Gūng hēi", chinese: "恭喜", meaning: "Congratulations", romanisation: "gung hey" },
      { phrase: "Hóu leng", chinese: "好靓", meaning: "Very beautiful", romanisation: "ho leng" },
      { phrase: "Mh̀ gōi", chinese: "唔该", meaning: "Thank you / Excuse me", romanisation: "mm goi" },
      { phrase: "Dō jeh", chinese: "多谢", meaning: "Thank you (for a gift)", romanisation: "doh jeh" },
      { phrase: "Baai baai", chinese: "拜拜", meaning: "Bye bye", romanisation: "bye bye" },
      { phrase: "Hóu noi móuh gin", chinese: "好耐冇见", meaning: "Long time no see", romanisation: "ho noy mo gin" },
      { phrase: "Néih hóu ma?", chinese: "你好吗？", meaning: "How are you?", romanisation: "nay ho maa" },
      { phrase: "Ngóh hóu hóu", chinese: "我好好", meaning: "I am very well", romanisation: "ngo ho ho" },
      { phrase: "Deui mh jyuh", chinese: "对唔住", meaning: "Sorry / I apologise", romanisation: "dui mm jyu" },
      { phrase: "Mhsái haak hei", chinese: "唔使客气", meaning: "Don't be polite / You're welcome", romanisation: "mm sai haak hay" },
      { phrase: "Léih gwai sing?", chinese: "你贵姓？", meaning: "What is your surname?", romanisation: "lay gwai sing" },
      { phrase: "Ngóh giu...", chinese: "我叫...", meaning: "My name is...", romanisation: "ngo giu" },
      { phrase: "Géi dō chin?", chinese: "几多钱？", meaning: "How much does it cost?", romanisation: "gay doh chin" },
      { phrase: "Taai gwai laa", chinese: "太贵啦", meaning: "Too expensive!", romanisation: "tai gwai laa" },
      { phrase: "Hóu sihk", chinese: "好食", meaning: "Delicious / Tasty", romanisation: "ho sik" },
      { phrase: "Hóu wáan", chinese: "好玩", meaning: "Fun / Enjoyable", romanisation: "ho waan" },
      { phrase: "Mh̀ haih", chinese: "唔系", meaning: "No / That is not right", romanisation: "mm hai" },
      { phrase: "Haih lā", chinese: "系啦", meaning: "Yes / That's right", romanisation: "hai laa" },
      { phrase: "Mh̀ sái", chinese: "唔使", meaning: "No need", romanisation: "mm sai" },
      { phrase: "Dáng háh", chinese: "等下", meaning: "Wait a moment", romanisation: "dang haa" },
      { phrase: "Faai dī lā", chinese: "快啲啦", meaning: "Hurry up!", romanisation: "fai dee laa" },
      { phrase: "Màhn màhn lái", chinese: "慢慢嚟", meaning: "Take your time", romanisation: "maan maan lai" },
      { phrase: "Sai mún", chinese: "细蚊", meaning: "Child / Little one", romanisation: "sai moon" },
      { phrase: "Laih laih", chinese: "嚟嚟", meaning: "Come here", romanisation: "lai lai" },
      { phrase: "Héi san la", chinese: "起身啦", meaning: "Wake up! / Get up!", romanisation: "hay san laa" },
      { phrase: "Faan uk kéi", chinese: "返屋企", meaning: "Go home", romanisation: "faan uk kay" },
      { phrase: "Síu sàm", chinese: "小心", meaning: "Be careful", romanisation: "siu sam" },
      { phrase: "Jóu san", chinese: "早晨", meaning: "Good morning", romanisation: "jou san" },
      { phrase: "Jóu táu", chinese: "早头", meaning: "Early morning", romanisation: "jou tau" },
      { phrase: "Maan on", chinese: "晚安", meaning: "Good night", romanisation: "maan on" },
      { phrase: "Ngóh mh̀ ji", chinese: "我唔知", meaning: "I don't know", romanisation: "ngo mm ji" },
      { phrase: "Zing haih", chinese: "正系", meaning: "Exactly / Correct", romanisation: "jing hai" },
      { phrase: "Gám yaht", chinese: "今日", meaning: "Today", romanisation: "gam yat" },
      { phrase: "Kàhm yaht", chinese: "琴日", meaning: "Yesterday", romanisation: "kam yat" },
      { phrase: "Tìng yaht", chinese: "听日", meaning: "Tomorrow", romanisation: "ting yat" },
      { phrase: "Hóu chòi", chinese: "好彩", meaning: "Lucky / Fortunately", romanisation: "ho choi" },
      { phrase: "Waih?", chinese: "喂？", meaning: "Hello? (phone) / Hey!", romanisation: "way" },
      { phrase: "Góng máh?", chinese: "讲咩？", meaning: "What are you saying?", romanisation: "gong maa" },
      { phrase: "Giu jo", chinese: "叫左", meaning: "Already ordered / Called", romanisation: "giu jo" },
      { phrase: "Móuh man tai", chinese: "冇问题", meaning: "No problem", romanisation: "mo man tai" },
      { phrase: "Gam gwóng", chinese: "咁光", meaning: "So bright / So early", romanisation: "gam gwong" },
      { phrase: "Geng geng", chinese: "叻叻", meaning: "Very smart / Clever", romanisation: "geng geng" },
      { phrase: "Ho leng zai", chinese: "好靓仔", meaning: "Handsome boy", romanisation: "ho leng jai" },
      { phrase: "Ho leng lui", chinese: "好靓女", meaning: "Beautiful girl", romanisation: "ho leng lui" },
      { phrase: "Faan gaau laa", chinese: "翻觉啦", meaning: "Go back to sleep", romanisation: "faan gaau laa" },
      { phrase: "Sihk yeuhk", chinese: "食药", meaning: "Take medicine", romanisation: "sik yeuk" },
      { phrase: "Taai mahn la", chinese: "太慢啦", meaning: "Too slow!", romanisation: "tai maan laa" },
      { phrase: "Leng jai", chinese: "靓仔", meaning: "Good-looking / Nice", romanisation: "leng jai" },
    ],
    numbers: [
      { phrase: "Yāt", chinese: "一", meaning: "One", romanisation: "yat" },
      { phrase: "Yih", chinese: "二", meaning: "Two", romanisation: "yee" },
      { phrase: "Sāam", chinese: "三", meaning: "Three", romanisation: "saam" },
      { phrase: "Sei", chinese: "四", meaning: "Four", romanisation: "say" },
      { phrase: "Ńgh", chinese: "五", meaning: "Five", romanisation: "ng" },
      { phrase: "Luhk", chinese: "六", meaning: "Six", romanisation: "luk" },
      { phrase: "Chāt", chinese: "七", meaning: "Seven", romanisation: "chat" },
      { phrase: "Baat", chinese: "八", meaning: "Eight", romanisation: "baat" },
      { phrase: "Gáu", chinese: "九", meaning: "Nine", romanisation: "gau" },
      { phrase: "Sahp", chinese: "十", meaning: "Ten", romanisation: "sap" },
      { phrase: "Sahp yāt", chinese: "十一", meaning: "Eleven", romanisation: "sap yat" },
      { phrase: "Sahp yih", chinese: "十二", meaning: "Twelve", romanisation: "sap yee" },
      { phrase: "Sahp sāam", chinese: "十三", meaning: "Thirteen", romanisation: "sap saam" },
      { phrase: "Sahp sei", chinese: "十四", meaning: "Fourteen", romanisation: "sap say" },
      { phrase: "Sahp ńgh", chinese: "十五", meaning: "Fifteen", romanisation: "sap ng" },
      { phrase: "Yih sahp", chinese: "二十", meaning: "Twenty", romanisation: "yee sap" },
      { phrase: "Sāam sahp", chinese: "三十", meaning: "Thirty", romanisation: "saam sap" },
      { phrase: "Sei sahp", chinese: "四十", meaning: "Forty", romanisation: "say sap" },
      { phrase: "Ńgh sahp", chinese: "五十", meaning: "Fifty", romanisation: "ng sap" },
      { phrase: "Luhk sahp", chinese: "六十", meaning: "Sixty", romanisation: "luk sap" },
      { phrase: "Chāt sahp", chinese: "七十", meaning: "Seventy", romanisation: "chat sap" },
      { phrase: "Baat sahp", chinese: "八十", meaning: "Eighty", romanisation: "baat sap" },
      { phrase: "Gáu sahp", chinese: "九十", meaning: "Ninety", romanisation: "gau sap" },
      { phrase: "Yāt baak", chinese: "一百", meaning: "One hundred", romanisation: "yat baak" },
      { phrase: "Yih baak", chinese: "两百", meaning: "Two hundred", romanisation: "yee baak" },
      { phrase: "Yāt chīn", chinese: "一千", meaning: "One thousand", romanisation: "yat chin" },
      { phrase: "Yāt maanh", chinese: "一万", meaning: "Ten thousand", romanisation: "yat maan" },
      { phrase: "Bun", chinese: "半", meaning: "Half", romanisation: "bun" },
      { phrase: "Deih yāt", chinese: "第一", meaning: "First / Number one", romanisation: "dai yat" },
      { phrase: "Deih yih", chinese: "第二", meaning: "Second / Number two", romanisation: "dai yee" },
      { phrase: "Deih sāam", chinese: "第三", meaning: "Third", romanisation: "dai saam" },
      { phrase: "Gēi dō?", chinese: "几多？", meaning: "How many? / How much?", romanisation: "gay doh" },
      { phrase: "Yāt go", chinese: "一个", meaning: "One piece / one unit", romanisation: "yat go" },
      { phrase: "Léuhng go", chinese: "两个", meaning: "Two pieces", romanisation: "leung go" },
      { phrase: "Sāam go", chinese: "三个", meaning: "Three pieces", romanisation: "saam go" },
      { phrase: "Yāt jek", chinese: "一只", meaning: "One (animal/small obj)", romanisation: "yat jek" },
      { phrase: "Yāt tìuh", chinese: "一条", meaning: "One long object / strip", romanisation: "yat tiu" },
      { phrase: "Yāt wun", chinese: "一碗", meaning: "One bowl", romanisation: "yat wun" },
      { phrase: "Léuhng wun", chinese: "两碗", meaning: "Two bowls", romanisation: "leung wun" },
      { phrase: "Yāt bui", chinese: "一杯", meaning: "One cup / glass", romanisation: "yat bui" },
      { phrase: "Léuhng bui", chinese: "两杯", meaning: "Two cups", romanisation: "leung bui" },
      { phrase: "Yāt jek", chinese: "一碟", meaning: "One plate", romanisation: "yat dip" },
      { phrase: "Yāt go jūng tàuh", chinese: "一个钟头", meaning: "One hour", romanisation: "yat go jung tau" },
      { phrase: "Léuhng go jūng tàuh", chinese: "两个钟头", meaning: "Two hours", romanisation: "leung go jung tau" },
      { phrase: "Yāt go yuht", chinese: "一个月", meaning: "One month", romanisation: "yat go yuet" },
      { phrase: "Yāt nihn", chinese: "一年", meaning: "One year", romanisation: "yat nin" },
      { phrase: "Yāt go láih baai", chinese: "一个礼拜", meaning: "One week", romanisation: "yat go lai baai" },
      { phrase: "Yāt go jūng", chinese: "一个钟", meaning: "One clock / One hour", romanisation: "yat go jung" },
      { phrase: "Gau dī", chinese: "够嘅", meaning: "Enough", romanisation: "gau dee" },
      { phrase: "Mh̀ gau", chinese: "唔够", meaning: "Not enough", romanisation: "mm gau" },
    ],
    food: [
      { phrase: "Dim sum", chinese: "点心", meaning: "Dim sum", romanisation: "dim sum" },
      { phrase: "Chāsīu", chinese: "叉烧", meaning: "BBQ pork", romanisation: "cha siu" },
      { phrase: "Tōng", chinese: "汤", meaning: "Soup", romanisation: "tong" },
      { phrase: "Báau", chinese: "包", meaning: "Bun", romanisation: "bao" },
      { phrase: "Cheung fan", chinese: "肠粉", meaning: "Rice noodle roll", romanisation: "cheung fun" },
      { phrase: "Haahm séui gaau", chinese: "咸水角", meaning: "Savoury glutinous dumpling", romanisation: "haam sui gaau" },
      { phrase: "Siu maai", chinese: "烧卖", meaning: "Steamed pork dumpling", romanisation: "siu mai" },
      { phrase: "Haa gáau", chinese: "虾饺", meaning: "Steamed shrimp dumpling", romanisation: "har gaau" },
      { phrase: "Loh baahk gou", chinese: "萝卜糕", meaning: "Turnip cake", romanisation: "lo baak go" },
      { phrase: "Wun tān", chinese: "云吞", meaning: "Wonton", romanisation: "wun tan" },
      { phrase: "Jūk", chinese: "粥", meaning: "Congee / Porridge", romanisation: "juk" },
      { phrase: "Gāi jūk", chinese: "鸡粥", meaning: "Chicken congee", romanisation: "gai juk" },
      { phrase: "Yu jūk", chinese: "鱼粥", meaning: "Fish congee", romanisation: "yu juk" },
      { phrase: "Míhn", chinese: "面", meaning: "Noodles", romanisation: "min" },
      { phrase: "Wun tān míhn", chinese: "云吞面", meaning: "Wonton noodles", romanisation: "wun tan min" },
      { phrase: "Ngàuh láam míhn", chinese: "牛腩面", meaning: "Beef brisket noodles", romanisation: "ngau laam min" },
      { phrase: "Faahn", chinese: "饭", meaning: "Rice", romanisation: "faan" },
      { phrase: "Sīu yuhk faahn", chinese: "烧肉饭", meaning: "Roast pork rice", romanisation: "siu yuk faan" },
      { phrase: "Gāi faahn", chinese: "鸡饭", meaning: "Chicken rice", romanisation: "gai faan" },
      { phrase: "Yuhk yuán tōng", chinese: "肉丸汤", meaning: "Meatball soup", romanisation: "yuk yun tong" },
      { phrase: "Gāi tōng", chinese: "鸡汤", meaning: "Chicken soup", romanisation: "gai tong" },
      { phrase: "Dáan tāat", chinese: "蛋挞", meaning: "Egg tart", romanisation: "dan taat" },
      { phrase: "Lōu baahk gou", chinese: "老婆糕", meaning: "Wife cake", romanisation: "lo por go" },
      { phrase: "Ngàuh yuhk", chinese: "牛肉", meaning: "Beef", romanisation: "ngau yuk" },
      { phrase: "Jyu yuhk", chinese: "猪肉", meaning: "Pork", romanisation: "jyu yuk" },
      { phrase: "Hā", chinese: "虾", meaning: "Shrimp / Prawn", romanisation: "ha" },
      { phrase: "Yú", chinese: "鱼", meaning: "Fish", romanisation: "yu" },
      { phrase: "Hóuh", chinese: "蚝", meaning: "Oyster", romanisation: "hou" },
      { phrase: "Haai", chinese: "蟹", meaning: "Crab", romanisation: "haai" },
      { phrase: "Chíng choi", chinese: "青菜", meaning: "Green vegetables", romanisation: "ching choi" },
      { phrase: "Dáu fuh", chinese: "豆腐", meaning: "Tofu", romanisation: "dau fu" },
      { phrase: "Dáan", chinese: "蛋", meaning: "Egg", romanisation: "dan" },
      { phrase: "Jīng dáan", chinese: "蒸蛋", meaning: "Steamed egg", romanisation: "jing dan" },
      { phrase: "Hóhng sīu ngàap", chinese: "红烧鸭", meaning: "Braised duck", romanisation: "hong siu ngaap" },
      { phrase: "Bēi jāu", chinese: "啤酒", meaning: "Beer", romanisation: "bei jau" },
      { phrase: "Séui", chinese: "水", meaning: "Water", romanisation: "seui" },
      { phrase: "Gāfē", chinese: "咖啡", meaning: "Coffee", romanisation: "ga fe" },
      { phrase: "Náaih chàh", chinese: "奶茶", meaning: "Milk tea", romanisation: "naai cha" },
      { phrase: "Chàh", chinese: "茶", meaning: "Tea", romanisation: "cha" },
      { phrase: "Pou léi chàh", chinese: "普洱茶", meaning: "Pu-erh tea", romanisation: "po lei cha" },
      { phrase: "Jáu", chinese: "酒", meaning: "Alcohol / Wine", romanisation: "jau" },
      { phrase: "Gwó jāp", chinese: "果汁", meaning: "Fruit juice", romanisation: "gwo jap" },
      { phrase: "Tòhng", chinese: "糖", meaning: "Sugar / Candy", romanisation: "tong" },
      { phrase: "Yìhm", chinese: "盐", meaning: "Salt", romanisation: "yim" },
      { phrase: "Jéung", chinese: "酱", meaning: "Sauce / Paste", romanisation: "jeung" },
      { phrase: "Syū jái", chinese: "薯仔", meaning: "Potato", romanisation: "syu jai" },
      { phrase: "Fāan keh", chinese: "番茄", meaning: "Tomato", romanisation: "faan ke" },
      { phrase: "Jūk sēung", chinese: "竹笙", meaning: "Bamboo pith mushroom", romanisation: "juk sing" },
      { phrase: "Bōk choi", chinese: "白菜", meaning: "Bok choy / Chinese cabbage", romanisation: "bok choi" },
      { phrase: "Gāi lāan", chinese: "芥兰", meaning: "Chinese broccoli", romanisation: "gai lan" },
    ],
  },
  teochew: {
    greetings: [
      { phrase: "Lu ho", chinese: "你好", meaning: "Hello", romanisation: "lu ho" },
      { phrase: "Ziah pa boih?", chinese: "食饱未？", meaning: "Have you eaten?", romanisation: "ziah pa boi" },
      { phrase: "Gong hi", chinese: "恭喜", meaning: "Congratulations", romanisation: "gong hi" },
      { phrase: "Zing ho", chinese: "真好", meaning: "Very good", romanisation: "zing ho" },
      { phrase: "M sai", chinese: "唔使", meaning: "No need / Cannot", romanisation: "m sai" },
      { phrase: "Dor jia", chinese: "多谢", meaning: "Thank you", romanisation: "dor jia" },
      { phrase: "M sai ke ki", chinese: "唔使客气", meaning: "You're welcome", romanisation: "m sai ke ki" },
      { phrase: "Pai seh", chinese: "歹势", meaning: "Sorry / Embarrassed", romanisation: "pai seh" },
      { phrase: "Wa m bat", chinese: "我唔识", meaning: "I don't know", romanisation: "wa m bat" },
      { phrase: "Lu khi toh?", chinese: "你去哪里？", meaning: "Where are you going?", romanisation: "lu ki doh" },
      { phrase: "Wa ai khi", chinese: "我要去", meaning: "I want to go", romanisation: "wa ai ki" },
      { phrase: "Kin lai", chinese: "紧来", meaning: "Come quickly", romanisation: "kin lai" },
      { phrase: "Sio sim", chinese: "小心", meaning: "Be careful", romanisation: "sio sim" },
      { phrase: "Ho un", chinese: "好运", meaning: "Good luck", romanisation: "ho un" },
      { phrase: "Peng an", chinese: "平安", meaning: "Safe journey / Peace", romanisation: "peng an" },
      { phrase: "Boh eng", chinese: "无空", meaning: "No time / Busy", romanisation: "boh eng" },
      { phrase: "Si boh?", chinese: "是否？", meaning: "Is that so? / Really?", romanisation: "si boh" },
      { phrase: "Ho jia", chinese: "好吃", meaning: "Delicious", romanisation: "ho jia" },
      { phrase: "Tua nang", chinese: "大人", meaning: "Elder / Adult", romanisation: "tua nang" },
      { phrase: "Sio nang", chinese: "小人", meaning: "Child / Young person", romanisation: "sio nang" },
      { phrase: "Hia di", chinese: "兄弟", meaning: "Brothers / Buddies", romanisation: "hia di" },
      { phrase: "Ka li kong", chinese: "给你讲", meaning: "Let me tell you", romanisation: "ka li kong" },
      { phrase: "Kim si", chinese: "今时", meaning: "Nowadays", romanisation: "kim si" },
      { phrase: "Zia ah", chinese: "且啊", meaning: "Wait a moment", romanisation: "zia ah" },
      { phrase: "Gao lat", chinese: "够力", meaning: "Impressive / Powerful", romanisation: "gao lat" },
      { phrase: "Chin sui", chinese: "真水", meaning: "Very beautiful", romanisation: "chin sui" },
      { phrase: "Eh sai", chinese: "会使", meaning: "Can / OK", romanisation: "eh sai" },
      { phrase: "Beh sai", chinese: "袂使", meaning: "Cannot", romanisation: "beh sai" },
      { phrase: "Boh lui", chinese: "无钱", meaning: "No money", romanisation: "boh lui" },
      { phrase: "Chin sian", chinese: "真闲", meaning: "Very bored", romanisation: "chin sian" },
      { phrase: "Tio liao", chinese: "着了", meaning: "Got it / Correct", romanisation: "dio liao" },
      { phrase: "Lo bo", chinese: "老母", meaning: "Wife / Old mother", romanisation: "lo bo" },
      { phrase: "Lo kong", chinese: "老公", meaning: "Husband", romanisation: "lo kong" },
      { phrase: "Wa siong", chinese: "我想", meaning: "I think / I want", romanisation: "wa siong" },
      { phrase: "Jip lai", chinese: "入来", meaning: "Come in", romanisation: "jip lai" },
      { phrase: "Chut khi", chinese: "出去", meaning: "Go out", romanisation: "jut ki" },
      { phrase: "Boh su", chinese: "无事", meaning: "Nothing / Never mind", romanisation: "boh su" },
      { phrase: "Hor bo?", chinese: "好无？", meaning: "Is it good?", romanisation: "hor bo" },
      { phrase: "Buay tahan", chinese: "袂担", meaning: "Cannot take it", romanisation: "buay tahan" },
      { phrase: "Sui bo?", chinese: "水无？", meaning: "Beautiful right?", romanisation: "sui bo" },
      { phrase: "Zao khi", chinese: "走去", meaning: "Walk / Go on foot", romanisation: "zao ki" },
      { phrase: "Tioh liao", chinese: "着了", meaning: "Correct / That's it", romanisation: "tioh liao" },
      { phrase: "Ti bo?", chinese: "甜无？", meaning: "Is it sweet?", romanisation: "ti bo" },
      { phrase: "Hiam bo?", chinese: "辣无？", meaning: "Is it spicy?", romanisation: "hiam bo" },
      { phrase: "Lim jui", chinese: "饮水", meaning: "Drink water", romanisation: "lim jui" },
      { phrase: "Jiah mi?", chinese: "食什么？", meaning: "What are you eating?", romanisation: "jiah mi" },
      { phrase: "Wa ai lim", chinese: "我爱饮", meaning: "I want to drink", romanisation: "wa ai lim" },
      { phrase: "Lua nang", chinese: "两人", meaning: "Two people / A couple", romanisation: "lua nang" },
      { phrase: "Tng khi", chinese: "转去", meaning: "Return / Go back", romanisation: "tng ki" },
      { phrase: "Jua hor", chinese: "坐好", meaning: "Sit properly", romanisation: "jua hor" },
    ],
    numbers: [
      { phrase: "Ik", chinese: "一", meaning: "One", romanisation: "ik" },
      { phrase: "Nang", chinese: "二", meaning: "Two", romanisation: "nang" },
      { phrase: "Suan", chinese: "三", meaning: "Three", romanisation: "suan" },
      { phrase: "Si", chinese: "四", meaning: "Four", romanisation: "si" },
      { phrase: "Ngou", chinese: "五", meaning: "Five", romanisation: "ngou" },
      { phrase: "Lak", chinese: "六", meaning: "Six", romanisation: "lak" },
      { phrase: "Chik", chinese: "七", meaning: "Seven", romanisation: "chik" },
      { phrase: "Poih", chinese: "八", meaning: "Eight", romanisation: "poih" },
      { phrase: "Kau", chinese: "九", meaning: "Nine", romanisation: "kau" },
      { phrase: "Zap", chinese: "十", meaning: "Ten", romanisation: "zap" },
      { phrase: "Zap ik", chinese: "十一", meaning: "Eleven", romanisation: "zap ik" },
      { phrase: "Zap nang", chinese: "十二", meaning: "Twelve", romanisation: "zap nang" },
      { phrase: "Zap suan", chinese: "十三", meaning: "Thirteen", romanisation: "zap suan" },
      { phrase: "Nang zap", chinese: "二十", meaning: "Twenty", romanisation: "nang zap" },
      { phrase: "Suan zap", chinese: "三十", meaning: "Thirty", romanisation: "suan zap" },
      { phrase: "Si zap", chinese: "四十", meaning: "Forty", romanisation: "si zap" },
      { phrase: "Ngou zap", chinese: "五十", meaning: "Fifty", romanisation: "ngou zap" },
      { phrase: "Lak zap", chinese: "六十", meaning: "Sixty", romanisation: "lak zap" },
      { phrase: "Chik zap", chinese: "七十", meaning: "Seventy", romanisation: "chik zap" },
      { phrase: "Poih zap", chinese: "八十", meaning: "Eighty", romanisation: "poih zap" },
      { phrase: "Kau zap", chinese: "九十", meaning: "Ninety", romanisation: "kau zap" },
      { phrase: "Ik bah", chinese: "一百", meaning: "One hundred", romanisation: "ik bah" },
      { phrase: "Nang bah", chinese: "两百", meaning: "Two hundred", romanisation: "nang bah" },
      { phrase: "Ik ceng", chinese: "一千", meaning: "One thousand", romanisation: "ik ceng" },
      { phrase: "Ik buan", chinese: "一万", meaning: "Ten thousand", romanisation: "ik buan" },
      { phrase: "Buan", chinese: "半", meaning: "Half", romanisation: "buan" },
      { phrase: "Di ik", chinese: "第一", meaning: "First", romanisation: "di ik" },
      { phrase: "Di nang", chinese: "第二", meaning: "Second", romanisation: "di nang" },
      { phrase: "Di suan", chinese: "第三", meaning: "Third", romanisation: "di suan" },
      { phrase: "Gei ze?", chinese: "几多？", meaning: "How many?", romanisation: "gei ze" },
      { phrase: "Ik pai", chinese: "一次", meaning: "Once / One time", romanisation: "ik pai" },
      { phrase: "Nang pai", chinese: "两次", meaning: "Twice", romanisation: "nang pai" },
      { phrase: "Ik diam", chinese: "一点", meaning: "One o'clock", romanisation: "ik diam" },
      { phrase: "Nang diam", chinese: "两点", meaning: "Two o'clock", romanisation: "nang diam" },
      { phrase: "Suan diam", chinese: "三点", meaning: "Three o'clock", romanisation: "suan diam" },
      { phrase: "Ik le pai", chinese: "一礼拜", meaning: "One week", romanisation: "ik le pai" },
      { phrase: "Nang le pai", chinese: "两礼拜", meaning: "Two weeks", romanisation: "nang le pai" },
      { phrase: "Ik geh", chinese: "一月", meaning: "One month / January", romanisation: "ik geh" },
      { phrase: "Nang geh", chinese: "二月", meaning: "February", romanisation: "nang geh" },
      { phrase: "Suan geh", chinese: "三月", meaning: "March", romanisation: "suan geh" },
      { phrase: "Si geh", chinese: "四月", meaning: "April", romanisation: "si geh" },
      { phrase: "Ngou geh", chinese: "五月", meaning: "May", romanisation: "ngou geh" },
      { phrase: "Lak geh", chinese: "六月", meaning: "June", romanisation: "lak geh" },
      { phrase: "Chik geh", chinese: "七月", meaning: "July / Ghost month", romanisation: "chik geh" },
      { phrase: "Poih geh", chinese: "八月", meaning: "August", romanisation: "poih geh" },
      { phrase: "Kau geh", chinese: "九月", meaning: "September", romanisation: "kau geh" },
      { phrase: "Zap geh", chinese: "十月", meaning: "October", romanisation: "zap geh" },
      { phrase: "Zap ik geh", chinese: "十一月", meaning: "November", romanisation: "zap ik geh" },
      { phrase: "Zap nang geh", chinese: "十二月", meaning: "December", romanisation: "zap nang geh" },
      { phrase: "Ik ni", chinese: "一年", meaning: "One year", romanisation: "ik ni" },
    ],
    food: [
      { phrase: "Kway teow", chinese: "粿条", meaning: "Flat rice noodles", romanisation: "kway teow" },
      { phrase: "Png", chinese: "饭", meaning: "Rice", romanisation: "pung" },
      { phrase: "Bak chang", chinese: "肉粽", meaning: "Rice dumpling", romanisation: "bak zhang" },
      { phrase: "Orh jian", chinese: "蚵煎", meaning: "Oyster omelette", romanisation: "or jian" },
      { phrase: "Chai tow kway", chinese: "菜头粿", meaning: "Carrot cake", romanisation: "chai tow kway" },
      { phrase: "Teow chew muay", chinese: "潮州糜", meaning: "Teochew porridge", romanisation: "teow jew muay" },
      { phrase: "Orh nee", chinese: "芋泥", meaning: "Yam paste dessert", romanisation: "or nee" },
      { phrase: "Kway chap", chinese: "粿汁", meaning: "Flat rice noodle soup", romanisation: "kway chap" },
      { phrase: "Soon kueh", chinese: "笋粿", meaning: "Bamboo shoot dumpling", romanisation: "soon kueh" },
      { phrase: "Png kueh", chinese: "饭粿", meaning: "Rice cake with filling", romanisation: "pung kueh" },
      { phrase: "Tau suan", chinese: "豆爽", meaning: "Green bean dessert", romanisation: "tau suan" },
      { phrase: "Oh luak", chinese: "蚝烙", meaning: "Oyster omelette (Teochew style)", romanisation: "or luak" },
      { phrase: "Bak chor mee", chinese: "肉碎面", meaning: "Minced pork noodles", romanisation: "bak chor mee" },
      { phrase: "Char kway teow", chinese: "炒粿条", meaning: "Fried flat noodles", romanisation: "char kway teow" },
      { phrase: "Hae mee", chinese: "虾面", meaning: "Prawn noodle soup", romanisation: "hae mee" },
      { phrase: "Popiah", chinese: "薄饼", meaning: "Fresh spring roll", romanisation: "popiah" },
      { phrase: "Kueh", chinese: "粿", meaning: "Rice cake", romanisation: "kueh" },
      { phrase: "Ang ku kueh", chinese: "红龟粿", meaning: "Red tortoise cake", romanisation: "ang ku kueh" },
      { phrase: "Hu", chinese: "鱼", meaning: "Fish", romanisation: "hu" },
      { phrase: "Bak", chinese: "肉", meaning: "Meat / Pork", romanisation: "bak" },
      { phrase: "Ke", chinese: "鸡", meaning: "Chicken", romanisation: "ke" },
      { phrase: "Hae", chinese: "虾", meaning: "Prawns", romanisation: "hae" },
      { phrase: "Nng", chinese: "卵", meaning: "Egg", romanisation: "nng" },
      { phrase: "Tng", chinese: "汤", meaning: "Soup", romanisation: "tng" },
      { phrase: "Chye", chinese: "菜", meaning: "Vegetables", romanisation: "chai" },
      { phrase: "Kiam chye", chinese: "咸菜", meaning: "Salted vegetables", romanisation: "kiam chai" },
      { phrase: "Tau hu", chinese: "豆腐", meaning: "Tofu", romanisation: "tau hu" },
      { phrase: "Him", chinese: "咸", meaning: "Salty", romanisation: "him" },
      { phrase: "Ti", chinese: "甜", meaning: "Sweet", romanisation: "ti" },
      { phrase: "Sng", chinese: "酸", meaning: "Sour", romanisation: "sng" },
      { phrase: "Hiam", chinese: "辣", meaning: "Spicy", romanisation: "hiam" },
      { phrase: "Ko", chinese: "苦", meaning: "Bitter", romanisation: "ko" },
      { phrase: "Teh", chinese: "茶", meaning: "Tea", romanisation: "teh" },
      { phrase: "Kopi", chinese: "咖啡", meaning: "Coffee", romanisation: "ko-pee" },
      { phrase: "Jui", chinese: "水", meaning: "Water", romanisation: "jui" },
      { phrase: "Ba wan", chinese: "肉丸", meaning: "Meatball", romanisation: "ba wan" },
      { phrase: "Lor bak", chinese: "卤肉", meaning: "Braised pork", romanisation: "lor bak" },
      { phrase: "Ter kah", chinese: "猪脚", meaning: "Pig's trotter", romanisation: "ter kah" },
      { phrase: "Bah lua", chinese: "肉卵", meaning: "Pork with egg", romanisation: "bah lua" },
      { phrase: "Cai png", chinese: "菜饭", meaning: "Mixed rice with veg", romanisation: "cai pung" },
      { phrase: "Mee sua", chinese: "面线", meaning: "Thin wheat noodles", romanisation: "mee sua" },
      { phrase: "Bee hoon", chinese: "米粉", meaning: "Rice vermicelli", romanisation: "bee hoon" },
      { phrase: "Chai tow", chinese: "菜头", meaning: "Radish / Turnip", romanisation: "chai tow" },
      { phrase: "Gor bak", chinese: "糕肉", meaning: "Steamed pork cake", romanisation: "gor bak" },
      { phrase: "Lim jui", chinese: "饮水", meaning: "Drink water", romanisation: "lim jui" },
      { phrase: "Siong tng", chinese: "上汤", meaning: "Superior broth", romanisation: "siong tng" },
      { phrase: "Ba kua", chinese: "肉干", meaning: "Dried barbecued meat", romanisation: "ba kwa" },
      { phrase: "Hae bee", chinese: "虾米", meaning: "Dried shrimp", romanisation: "hae bee" },
      { phrase: "Jiak png", chinese: "食饭", meaning: "Eat rice / Have a meal", romanisation: "jiak pung" },
      { phrase: "Zhor bia", chinese: "烧饼", meaning: "Sesame flatbread", romanisation: "zhor bia" },
    ],
  },
  hakka: {
    greetings: [
      { phrase: "Ngi ho", chinese: "你好", meaning: "Hello", romanisation: "ngi ho" },
      { phrase: "Ya fan liaw maa?", chinese: "食饭了吗？", meaning: "Have you eaten?", romanisation: "ya fan liaw maa" },
      { phrase: "Kung hi", chinese: "恭喜", meaning: "Congratulations", romanisation: "kung hi" },
      { phrase: "Chang ho", chinese: "真好", meaning: "Very good", romanisation: "chang ho" },
      { phrase: "Mo het", chinese: "冇得", meaning: "Cannot / Not possible", romanisation: "mo het" },
      { phrase: "Do jia", chinese: "多谢", meaning: "Thank you", romanisation: "do jia" },
      { phrase: "M sai ke ki", chinese: "唔使客气", meaning: "You're welcome", romanisation: "m sai ke ki" },
      { phrase: "Pai seh", chinese: "歹势", meaning: "Sorry / Embarrassed", romanisation: "pai seh" },
      { phrase: "Nga m sik", chinese: "我唔识", meaning: "I don't know", romanisation: "nga m sik" },
      { phrase: "Ngi hi pa?", chinese: "你去哪？", meaning: "Where are you going?", romanisation: "ngi hi ba" },
      { phrase: "Nga ai hi", chinese: "我要去", meaning: "I want to go", romanisation: "nga ai hi" },
      { phrase: "Fong sim", chinese: "放心", meaning: "Don't worry / Relax", romanisation: "fong sim" },
      { phrase: "Sio sim", chinese: "小心", meaning: "Be careful", romanisation: "sio sim" },
      { phrase: "Ho un", chinese: "好运", meaning: "Good luck", romanisation: "ho un" },
      { phrase: "Piang an", chinese: "平安", meaning: "Safe journey", romanisation: "piang an" },
      { phrase: "Mo kung", chinese: "无空", meaning: "No time / Busy", romanisation: "mo kung" },
      { phrase: "Si mo?", chinese: "是吗？", meaning: "Is that so?", romanisation: "si mo" },
      { phrase: "Ho shik", chinese: "好食", meaning: "Delicious", romanisation: "ho sik" },
      { phrase: "Tai ngin", chinese: "大人", meaning: "Adult / Elder", romanisation: "tai ngin" },
      { phrase: "Sai ngin", chinese: "细人", meaning: "Child", romanisation: "sai ngin" },
      { phrase: "Hiung ti", chinese: "兄弟", meaning: "Brothers / Buddies", romanisation: "hiung ti" },
      { phrase: "Ka ngi gong", chinese: "给你讲", meaning: "Let me tell you", romanisation: "ka ngi gong" },
      { phrase: "Gim si", chinese: "今时", meaning: "Nowadays", romanisation: "gim si" },
      { phrase: "Den ha", chinese: "等下", meaning: "Wait a moment", romanisation: "den ha" },
      { phrase: "Ho leng", chinese: "好靓", meaning: "Very beautiful", romanisation: "ho leng" },
      { phrase: "Tit liao", chinese: "得了", meaning: "Got it / Correct", romanisation: "tit liao" },
      { phrase: "Hor mo?", chinese: "好无？", meaning: "Is it good?", romanisation: "hor mo" },
      { phrase: "Mo lui", chinese: "无钱", meaning: "No money", romanisation: "mo lui" },
      { phrase: "Chang sian", chinese: "真闲", meaning: "Very bored", romanisation: "chang sian" },
      { phrase: "Hip liaw", chinese: "入来了", meaning: "Come in now", romanisation: "hip liaw" },
      { phrase: "Chut hi", chinese: "出去", meaning: "Go out", romanisation: "chut hi" },
      { phrase: "Mo shi", chinese: "无事", meaning: "Nothing / Never mind", romanisation: "mo shi" },
      { phrase: "Lo gong", chinese: "老公", meaning: "Husband", romanisation: "lo gong" },
      { phrase: "Lo po", chinese: "老婆", meaning: "Wife", romanisation: "lo po" },
      { phrase: "Nga siong", chinese: "我想", meaning: "I think / I want", romanisation: "nga siong" },
      { phrase: "Ya tiaw", chinese: "一道", meaning: "Together / Along the way", romanisation: "ya tiaw" },
      { phrase: "Tia tia", chinese: "爸爸", meaning: "Father / Dad", romanisation: "tia tia" },
      { phrase: "Ama", chinese: "阿妈", meaning: "Mother / Mum", romanisation: "ama" },
      { phrase: "A gung", chinese: "阿公", meaning: "Grandfather", romanisation: "a gung" },
      { phrase: "A po", chinese: "阿婆", meaning: "Grandmother", romanisation: "a po" },
      { phrase: "Hiung di", chinese: "兄弟", meaning: "Brothers", romanisation: "hiung di" },
      { phrase: "Ji mui", chinese: "姐妹", meaning: "Sisters", romanisation: "ji mui" },
      { phrase: "Lai lai", chinese: "来来", meaning: "Come here!", romanisation: "lai lai" },
      { phrase: "Zo san", chinese: "早晨", meaning: "Good morning", romanisation: "zo san" },
      { phrase: "Am on", chinese: "暗安", meaning: "Good night", romanisation: "am on" },
      { phrase: "Chang sui", chinese: "真水", meaning: "Very pretty / Beautiful", romanisation: "chang sui" },
      { phrase: "Gau lat", chinese: "够力", meaning: "Impressive", romanisation: "gau lat" },
      { phrase: "Wa ai lim", chinese: "我要饮", meaning: "I want to drink", romanisation: "wa ai lim" },
      { phrase: "Jia mi?", chinese: "食什么？", meaning: "What are you eating?", romanisation: "jia mi" },
      { phrase: "Jua ho", chinese: "坐好", meaning: "Sit properly", romanisation: "jua ho" },
    ],
    numbers: [
      { phrase: "Yit", chinese: "一", meaning: "One", romanisation: "yit" },
      { phrase: "Ngi", chinese: "二", meaning: "Two", romanisation: "ngi" },
      { phrase: "Sam", chinese: "三", meaning: "Three", romanisation: "sam" },
      { phrase: "Si", chinese: "四", meaning: "Four", romanisation: "si" },
      { phrase: "Ng", chinese: "五", meaning: "Five", romanisation: "ng" },
      { phrase: "Liuk", chinese: "六", meaning: "Six", romanisation: "liuk" },
      { phrase: "Chit", chinese: "七", meaning: "Seven", romanisation: "chit" },
      { phrase: "Pat", chinese: "八", meaning: "Eight", romanisation: "pat" },
      { phrase: "Giu", chinese: "九", meaning: "Nine", romanisation: "giu" },
      { phrase: "Siip", chinese: "十", meaning: "Ten", romanisation: "siip" },
      { phrase: "Siip yit", chinese: "十一", meaning: "Eleven", romanisation: "siip yit" },
      { phrase: "Siip ngi", chinese: "十二", meaning: "Twelve", romanisation: "siip ngi" },
      { phrase: "Siip sam", chinese: "十三", meaning: "Thirteen", romanisation: "siip sam" },
      { phrase: "Ngi siip", chinese: "二十", meaning: "Twenty", romanisation: "ngi siip" },
      { phrase: "Sam siip", chinese: "三十", meaning: "Thirty", romanisation: "sam siip" },
      { phrase: "Si siip", chinese: "四十", meaning: "Forty", romanisation: "si siip" },
      { phrase: "Ng siip", chinese: "五十", meaning: "Fifty", romanisation: "ng siip" },
      { phrase: "Liuk siip", chinese: "六十", meaning: "Sixty", romanisation: "liuk siip" },
      { phrase: "Chit siip", chinese: "七十", meaning: "Seventy", romanisation: "chit siip" },
      { phrase: "Pat siip", chinese: "八十", meaning: "Eighty", romanisation: "pat siip" },
      { phrase: "Giu siip", chinese: "九十", meaning: "Ninety", romanisation: "giu siip" },
      { phrase: "Yit pak", chinese: "一百", meaning: "One hundred", romanisation: "yit pak" },
      { phrase: "Ngi pak", chinese: "两百", meaning: "Two hundred", romanisation: "ngi pak" },
      { phrase: "Yit chien", chinese: "一千", meaning: "One thousand", romanisation: "yit chien" },
      { phrase: "Yit van", chinese: "一万", meaning: "Ten thousand", romanisation: "yit van" },
      { phrase: "Pan", chinese: "半", meaning: "Half", romanisation: "pan" },
      { phrase: "Di yit", chinese: "第一", meaning: "First", romanisation: "di yit" },
      { phrase: "Di ngi", chinese: "第二", meaning: "Second", romanisation: "di ngi" },
      { phrase: "Di sam", chinese: "第三", meaning: "Third", romanisation: "di sam" },
      { phrase: "Gi do?", chinese: "几多？", meaning: "How many?", romanisation: "gi do" },
      { phrase: "Yit phai", chinese: "一次", meaning: "Once", romanisation: "yit phai" },
      { phrase: "Ngi phai", chinese: "两次", meaning: "Twice", romanisation: "ngi phai" },
      { phrase: "Yit diam", chinese: "一点", meaning: "One o'clock", romanisation: "yit diam" },
      { phrase: "Ngi diam", chinese: "两点", meaning: "Two o'clock", romanisation: "ngi diam" },
      { phrase: "Sam diam", chinese: "三点", meaning: "Three o'clock", romanisation: "sam diam" },
      { phrase: "Yit li pai", chinese: "一礼拜", meaning: "One week", romanisation: "yit li pai" },
      { phrase: "Ngi li pai", chinese: "两礼拜", meaning: "Two weeks", romanisation: "ngi li pai" },
      { phrase: "Yit giet", chinese: "一月", meaning: "January", romanisation: "yit giet" },
      { phrase: "Ngi giet", chinese: "二月", meaning: "February", romanisation: "ngi giet" },
      { phrase: "Sam giet", chinese: "三月", meaning: "March", romanisation: "sam giet" },
      { phrase: "Si giet", chinese: "四月", meaning: "April", romanisation: "si giet" },
      { phrase: "Ng giet", chinese: "五月", meaning: "May", romanisation: "ng giet" },
      { phrase: "Liuk giet", chinese: "六月", meaning: "June", romanisation: "liuk giet" },
      { phrase: "Chit giet", chinese: "七月", meaning: "July / Ghost month", romanisation: "chit giet" },
      { phrase: "Pat giet", chinese: "八月", meaning: "August", romanisation: "pat giet" },
      { phrase: "Giu giet", chinese: "九月", meaning: "September", romanisation: "giu giet" },
      { phrase: "Siip giet", chinese: "十月", meaning: "October", romanisation: "siip giet" },
      { phrase: "Siip yit giet", chinese: "十一月", meaning: "November", romanisation: "siip yit giet" },
      { phrase: "Siip ngi giet", chinese: "十二月", meaning: "December", romanisation: "siip ngi giet" },
      { phrase: "Yit ngien", chinese: "一年", meaning: "One year", romanisation: "yit ngien" },
    ],
    food: [
      { phrase: "Kiu nyuk", chinese: "扣肉", meaning: "Braised pork belly", romanisation: "kiu nyuk" },
      { phrase: "Fan", chinese: "饭", meaning: "Rice", romanisation: "fan" },
      { phrase: "Abacus seeds", chinese: "算盘子", meaning: "Yam abacus dumplings", romanisation: "suan pan zi" },
      { phrase: "Mee", chinese: "面", meaning: "Noodles", romanisation: "mee" },
      { phrase: "Lei cha", chinese: "擂茶", meaning: "Pounded tea with herbs", romanisation: "lui cha" },
      { phrase: "Yong tau foo", chinese: "酿豆腐", meaning: "Stuffed tofu", romanisation: "yong tau fu" },
      { phrase: "Ban mian", chinese: "板面", meaning: "Hand-made flat noodles", romanisation: "ban mian" },
      { phrase: "Cha siew", chinese: "叉烧", meaning: "BBQ pork", romanisation: "cha siew" },
      { phrase: "Tong", chinese: "汤", meaning: "Soup / Broth", romanisation: "tong" },
      { phrase: "Tong fun", chinese: "汤粉", meaning: "Noodles in soup", romanisation: "tong fun" },
      { phrase: "Ya fan", chinese: "鸭饭", meaning: "Duck rice", romanisation: "ya fan" },
      { phrase: "Ji fan", chinese: "鸡饭", meaning: "Chicken rice", romanisation: "ji fan" },
      { phrase: "Bak kut teh", chinese: "肉骨茶", meaning: "Pork rib soup", romanisation: "bak kut teh" },
      { phrase: "Chai bo", chinese: "菜脯", meaning: "Preserved radish", romanisation: "chai bo" },
      { phrase: "Tau fu", chinese: "豆腐", meaning: "Tofu / Bean curd", romanisation: "tau fu" },
      { phrase: "Tau kua", chinese: "豆干", meaning: "Firm tofu", romanisation: "tau kwa" },
      { phrase: "Nyuk", chinese: "肉", meaning: "Meat / Pork", romanisation: "nyuk" },
      { phrase: "Gai", chinese: "鸡", meaning: "Chicken", romanisation: "gai" },
      { phrase: "Ha", chinese: "虾", meaning: "Prawn / Shrimp", romanisation: "ha" },
      { phrase: "Yu", chinese: "鱼", meaning: "Fish", romanisation: "yu" },
      { phrase: "Kai tan", chinese: "鸡蛋", meaning: "Egg", romanisation: "kai tan" },
      { phrase: "Chai", chinese: "菜", meaning: "Vegetables", romanisation: "chai" },
      { phrase: "Ham", chinese: "咸", meaning: "Salty", romanisation: "ham" },
      { phrase: "Tim", chinese: "甜", meaning: "Sweet", romanisation: "tim" },
      { phrase: "Son", chinese: "酸", meaning: "Sour", romanisation: "son" },
      { phrase: "Lat", chinese: "辣", meaning: "Spicy", romanisation: "lat" },
      { phrase: "Ku", chinese: "苦", meaning: "Bitter", romanisation: "ku" },
      { phrase: "Cha", chinese: "茶", meaning: "Tea", romanisation: "cha" },
      { phrase: "Ka feh", chinese: "咖啡", meaning: "Coffee", romanisation: "ka feh" },
      { phrase: "Shui", chinese: "水", meaning: "Water", romanisation: "shui" },
      { phrase: "Pong pong tong", chinese: "碰碰糖", meaning: "Honeycomb candy", romanisation: "pong pong tong" },
      { phrase: "Fong tong", chinese: "红糖", meaning: "Brown sugar / Jaggery", romanisation: "fong tong" },
      { phrase: "Giu nyuk tong", chinese: "猪脚汤", meaning: "Pig trotter soup", romanisation: "giu nyuk tong" },
      { phrase: "Char mee", chinese: "炒面", meaning: "Fried noodles", romanisation: "char mee" },
      { phrase: "Char fun", chinese: "炒粉", meaning: "Fried vermicelli", romanisation: "char fun" },
      { phrase: "Kiu fun", chinese: "粿粉", meaning: "Rice flour noodles", romanisation: "kiu fun" },
      { phrase: "Tong yuan", chinese: "汤圆", meaning: "Glutinous rice balls", romanisation: "tong yuan" },
      { phrase: "Ba kua", chinese: "肉干", meaning: "Dried BBQ pork", romanisation: "ba kwa" },
      { phrase: "Hae bee", chinese: "虾米", meaning: "Dried shrimp", romanisation: "hae bee" },
      { phrase: "Lo han guo", chinese: "罗汉果", meaning: "Monk fruit drink", romanisation: "lo han guo" },
      { phrase: "Sam ten tong", chinese: "三天糖", meaning: "Three-day candy (toffee)", romanisation: "sam ten tong" },
      { phrase: "Fun", chinese: "粉", meaning: "Noodles / Flour", romanisation: "fun" },
      { phrase: "Pork congee", chinese: "猪肉粥", meaning: "Pork congee", romanisation: "nyuk juk" },
      { phrase: "Kam heong", chinese: "金香", meaning: "Golden fragrant (style)", romanisation: "kam heong" },
      { phrase: "Tung cai", chinese: "冬菜", meaning: "Preserved winter vegetable", romanisation: "tung cai" },
      { phrase: "Dou miu", chinese: "豆苗", meaning: "Pea shoots", romanisation: "dou miu" },
      { phrase: "Fong gua", chinese: "冬瓜", meaning: "Winter melon", romanisation: "fong gua" },
      { phrase: "Guk", chinese: "菊花", meaning: "Chrysanthemum (tea)", romanisation: "guk" },
      { phrase: "Mui choi", chinese: "梅菜", meaning: "Preserved mustard greens", romanisation: "mui choi" },
      { phrase: "Lui cha fun", chinese: "擂茶粉", meaning: "Hakka pounded tea rice", romanisation: "lui cha fun" },
    ],
  },
  hainanese: {
    greetings: [
      { phrase: "Nee hoh", chinese: "你好", meaning: "Hello", romanisation: "nee hoh" },
      { phrase: "Chiak boh?", chinese: "食了没？", meaning: "Have you eaten?", romanisation: "chiak boh" },
      { phrase: "Gong hi", chinese: "恭喜", meaning: "Congratulations", romanisation: "gong hi" },
      { phrase: "Zin ho", chinese: "真好", meaning: "Very good", romanisation: "zin ho" },
      { phrase: "Beh sai", chinese: "袂使", meaning: "Cannot", romanisation: "beh sai" },
      { phrase: "Doh jiah", chinese: "多谢", meaning: "Thank you", romanisation: "doh jiah" },
      { phrase: "M sai ke ki", chinese: "唔使客气", meaning: "You're welcome", romanisation: "m sai ke ki" },
      { phrase: "Pai seh", chinese: "歹势", meaning: "Sorry / Embarrassed", romanisation: "pai seh" },
      { phrase: "Wa m bat", chinese: "我唔识", meaning: "I don't know", romanisation: "wa m bat" },
      { phrase: "Nee hi na li?", chinese: "你去哪里？", meaning: "Where are you going?", romanisation: "nee hi na li" },
      { phrase: "Wa ai hi", chinese: "我要去", meaning: "I want to go", romanisation: "wa ai hi" },
      { phrase: "Kin lai", chinese: "紧来", meaning: "Come quickly", romanisation: "kin lai" },
      { phrase: "Sio sim", chinese: "小心", meaning: "Be careful", romanisation: "sio sim" },
      { phrase: "Ho un", chinese: "好运", meaning: "Good luck", romanisation: "ho un" },
      { phrase: "Peng an", chinese: "平安", meaning: "Safe journey", romanisation: "peng an" },
      { phrase: "Boh eng", chinese: "无空", meaning: "No time / Busy", romanisation: "boh eng" },
      { phrase: "Si moh?", chinese: "是吗？", meaning: "Is that so?", romanisation: "si moh" },
      { phrase: "Ho jia", chinese: "好吃", meaning: "Delicious", romanisation: "ho jia" },
      { phrase: "Tua nang", chinese: "大人", meaning: "Adult / Elder", romanisation: "tua nang" },
      { phrase: "Sio nang", chinese: "小人", meaning: "Child", romanisation: "sio nang" },
      { phrase: "Hia di", chinese: "兄弟", meaning: "Brothers / Buddies", romanisation: "hia di" },
      { phrase: "Ka nee kong", chinese: "给你讲", meaning: "Let me tell you", romanisation: "ka nee kong" },
      { phrase: "Kim si", chinese: "今时", meaning: "Nowadays", romanisation: "kim si" },
      { phrase: "Den ah", chinese: "等啊", meaning: "Wait a moment", romanisation: "den ah" },
      { phrase: "Ho leng", chinese: "好靓", meaning: "Very beautiful", romanisation: "ho leng" },
      { phrase: "Eh sai", chinese: "会使", meaning: "Can / OK", romanisation: "eh sai" },
      { phrase: "Boh lui", chinese: "无钱", meaning: "No money", romanisation: "boh lui" },
      { phrase: "Lo gong", chinese: "老公", meaning: "Husband", romanisation: "lo gong" },
      { phrase: "Lo bo", chinese: "老婆", meaning: "Wife", romanisation: "lo bo" },
      { phrase: "Wa ai lim", chinese: "我要饮", meaning: "I want to drink", romanisation: "wa ai lim" },
      { phrase: "Jip lai", chinese: "入来", meaning: "Come in", romanisation: "jip lai" },
      { phrase: "Chut hi", chinese: "出去", meaning: "Go out", romanisation: "chut hi" },
      { phrase: "Boh su", chinese: "无事", meaning: "Nothing / Never mind", romanisation: "boh su" },
      { phrase: "Zor san", chinese: "早晨", meaning: "Good morning", romanisation: "zor san" },
      { phrase: "Am on", chinese: "暗安", meaning: "Good night", romanisation: "am on" },
      { phrase: "Gam jit", chinese: "今日", meaning: "Today", romanisation: "gam jit" },
      { phrase: "Kam jit", chinese: "琴日", meaning: "Yesterday", romanisation: "kam jit" },
      { phrase: "Ting jit", chinese: "听日", meaning: "Tomorrow", romanisation: "ting jit" },
      { phrase: "Fong sim", chinese: "放心", meaning: "Don't worry", romanisation: "fong sim" },
      { phrase: "Gao lat", chinese: "够力", meaning: "Impressive / Powerful", romanisation: "gao lat" },
      { phrase: "Chin sian", chinese: "真闲", meaning: "Very bored", romanisation: "chin sian" },
      { phrase: "Tio liao", chinese: "着了", meaning: "Got it / Correct", romanisation: "dio liao" },
      { phrase: "Ka nee kong suah", chinese: "给你讲话", meaning: "I have something to tell you", romanisation: "ka nee kong sua" },
      { phrase: "Wa siong", chinese: "我想", meaning: "I think / I want", romanisation: "wa siong" },
      { phrase: "Hor bo?", chinese: "好无？", meaning: "Is it good?", romanisation: "hor bo" },
      { phrase: "Hia mui", chinese: "兄妹", meaning: "Siblings", romanisation: "hia mui" },
      { phrase: "A gong", chinese: "阿公", meaning: "Grandfather", romanisation: "a gong" },
      { phrase: "A ma", chinese: "阿妈", meaning: "Grandmother / Mother", romanisation: "a ma" },
      { phrase: "Boh man tai", chinese: "没问题", meaning: "No problem", romanisation: "boh man tai" },
      { phrase: "Lua nang", chinese: "两人", meaning: "Two people / A couple", romanisation: "lua nang" },
    ],
    numbers: [
      { phrase: "Yat", chinese: "一", meaning: "One", romanisation: "yat" },
      { phrase: "Yi", chinese: "二", meaning: "Two", romanisation: "yi" },
      { phrase: "Lam", chinese: "三", meaning: "Three", romanisation: "lam" },
      { phrase: "Si", chinese: "四", meaning: "Four", romanisation: "si" },
      { phrase: "Ngau", chinese: "五", meaning: "Five", romanisation: "ngau" },
      { phrase: "Lak", chinese: "六", meaning: "Six", romanisation: "lak" },
      { phrase: "Chit", chinese: "七", meaning: "Seven", romanisation: "chit" },
      { phrase: "Puak", chinese: "八", meaning: "Eight", romanisation: "puak" },
      { phrase: "Kau", chinese: "九", meaning: "Nine", romanisation: "kau" },
      { phrase: "Zap", chinese: "十", meaning: "Ten", romanisation: "zap" },
      { phrase: "Zap yat", chinese: "十一", meaning: "Eleven", romanisation: "zap yat" },
      { phrase: "Zap yi", chinese: "十二", meaning: "Twelve", romanisation: "zap yi" },
      { phrase: "Zap lam", chinese: "十三", meaning: "Thirteen", romanisation: "zap lam" },
      { phrase: "Yi zap", chinese: "二十", meaning: "Twenty", romanisation: "yi zap" },
      { phrase: "Lam zap", chinese: "三十", meaning: "Thirty", romanisation: "lam zap" },
      { phrase: "Si zap", chinese: "四十", meaning: "Forty", romanisation: "si zap" },
      { phrase: "Ngau zap", chinese: "五十", meaning: "Fifty", romanisation: "ngau zap" },
      { phrase: "Lak zap", chinese: "六十", meaning: "Sixty", romanisation: "lak zap" },
      { phrase: "Chit zap", chinese: "七十", meaning: "Seventy", romanisation: "chit zap" },
      { phrase: "Puak zap", chinese: "八十", meaning: "Eighty", romanisation: "puak zap" },
      { phrase: "Kau zap", chinese: "九十", meaning: "Ninety", romanisation: "kau zap" },
      { phrase: "Yat bah", chinese: "一百", meaning: "One hundred", romanisation: "yat bah" },
      { phrase: "Yi bah", chinese: "两百", meaning: "Two hundred", romanisation: "yi bah" },
      { phrase: "Yat zeng", chinese: "一千", meaning: "One thousand", romanisation: "yat zeng" },
      { phrase: "Yat ban", chinese: "一万", meaning: "Ten thousand", romanisation: "yat ban" },
      { phrase: "Buan", chinese: "半", meaning: "Half", romanisation: "buan" },
      { phrase: "Di yat", chinese: "第一", meaning: "First", romanisation: "di yat" },
      { phrase: "Di yi", chinese: "第二", meaning: "Second", romanisation: "di yi" },
      { phrase: "Di lam", chinese: "第三", meaning: "Third", romanisation: "di lam" },
      { phrase: "Gi ze?", chinese: "几多？", meaning: "How many?", romanisation: "gi ze" },
      { phrase: "Yat pai", chinese: "一次", meaning: "Once", romanisation: "yat pai" },
      { phrase: "Yi pai", chinese: "两次", meaning: "Twice", romanisation: "yi pai" },
      { phrase: "Yat diam", chinese: "一点", meaning: "One o'clock", romanisation: "yat diam" },
      { phrase: "Yi diam", chinese: "两点", meaning: "Two o'clock", romanisation: "yi diam" },
      { phrase: "Lam diam", chinese: "三点", meaning: "Three o'clock", romanisation: "lam diam" },
      { phrase: "Yat le pai", chinese: "一礼拜", meaning: "One week", romanisation: "yat le pai" },
      { phrase: "Yi le pai", chinese: "两礼拜", meaning: "Two weeks", romanisation: "yi le pai" },
      { phrase: "Yat geh", chinese: "一月", meaning: "January", romanisation: "yat geh" },
      { phrase: "Yi geh", chinese: "二月", meaning: "February", romanisation: "yi geh" },
      { phrase: "Lam geh", chinese: "三月", meaning: "March", romanisation: "lam geh" },
      { phrase: "Si geh", chinese: "四月", meaning: "April", romanisation: "si geh" },
      { phrase: "Ngau geh", chinese: "五月", meaning: "May", romanisation: "ngau geh" },
      { phrase: "Lak geh", chinese: "六月", meaning: "June", romanisation: "lak geh" },
      { phrase: "Chit geh", chinese: "七月", meaning: "July / Ghost month", romanisation: "chit geh" },
      { phrase: "Puak geh", chinese: "八月", meaning: "August", romanisation: "puak geh" },
      { phrase: "Kau geh", chinese: "九月", meaning: "September", romanisation: "kau geh" },
      { phrase: "Zap geh", chinese: "十月", meaning: "October", romanisation: "zap geh" },
      { phrase: "Zap yat geh", chinese: "十一月", meaning: "November", romanisation: "zap yat geh" },
      { phrase: "Zap yi geh", chinese: "十二月", meaning: "December", romanisation: "zap yi geh" },
      { phrase: "Yat ni", chinese: "一年", meaning: "One year", romanisation: "yat ni" },
    ],
    food: [
      { phrase: "Ji faan", chinese: "鸡饭", meaning: "Chicken rice", romanisation: "ji faan" },
      { phrase: "Mee", chinese: "面", meaning: "Noodles", romanisation: "mee" },
      { phrase: "Kopi", chinese: "咖啡", meaning: "Coffee", romanisation: "ko-pee" },
      { phrase: "Wonton", chinese: "云吞", meaning: "Wonton dumplings", romanisation: "wun ton" },
      { phrase: "Chee cheong fun", chinese: "猪肠粉", meaning: "Rice noodle rolls", romanisation: "chee cheong fun" },
      { phrase: "Teh", chinese: "茶", meaning: "Tea", romanisation: "teh" },
      { phrase: "Hainanese curry rice", chinese: "海南咖喱饭", meaning: "Hainanese curry rice", romanisation: "hainanese curry rice" },
      { phrase: "Pork chop rice", chinese: "猪排饭", meaning: "Pork chop with rice", romanisation: "ter pai fan" },
      { phrase: "Satay", chinese: "沙爹", meaning: "Grilled meat skewers", romanisation: "satay" },
      { phrase: "Wonton mee", chinese: "云吞面", meaning: "Wonton noodle soup", romanisation: "wun ton mee" },
      { phrase: "Bah kut teh", chinese: "肉骨茶", meaning: "Pork rib herbal soup", romanisation: "bah kut teh" },
      { phrase: "Juk", chinese: "粥", meaning: "Congee / Porridge", romanisation: "juk" },
      { phrase: "Ji juk", chinese: "鸡粥", meaning: "Chicken congee", romanisation: "ji juk" },
      { phrase: "Yu juk", chinese: "鱼粥", meaning: "Fish congee", romanisation: "yu juk" },
      { phrase: "Fan", chinese: "饭", meaning: "Rice", romanisation: "fan" },
      { phrase: "Chye", chinese: "菜", meaning: "Vegetables", romanisation: "chye" },
      { phrase: "Nng", chinese: "卵", meaning: "Egg", romanisation: "nng" },
      { phrase: "Bak", chinese: "肉", meaning: "Pork / Meat", romanisation: "bak" },
      { phrase: "Ji", chinese: "鸡", meaning: "Chicken", romanisation: "ji" },
      { phrase: "Hae", chinese: "虾", meaning: "Prawn / Shrimp", romanisation: "hae" },
      { phrase: "Hu", chinese: "鱼", meaning: "Fish", romanisation: "hu" },
      { phrase: "Tng", chinese: "汤", meaning: "Soup", romanisation: "tng" },
      { phrase: "Him", chinese: "咸", meaning: "Salty", romanisation: "him" },
      { phrase: "Ti", chinese: "甜", meaning: "Sweet", romanisation: "ti" },
      { phrase: "Sng", chinese: "酸", meaning: "Sour", romanisation: "sng" },
      { phrase: "Hiam", chinese: "辣", meaning: "Spicy", romanisation: "hiam" },
      { phrase: "Tau hu", chinese: "豆腐", meaning: "Tofu", romanisation: "tau hu" },
      { phrase: "Teh tarik", chinese: "拉茶", meaning: "Pulled milk tea", romanisation: "teh tarik" },
      { phrase: "Milo", chinese: "美禄", meaning: "Milo drink", romanisation: "milo" },
      { phrase: "Kopi O", chinese: "咖啡乌", meaning: "Black coffee", romanisation: "ko-pee oh" },
      { phrase: "Teh O", chinese: "茶乌", meaning: "Black tea", romanisation: "teh oh" },
      { phrase: "Kopi C", chinese: "咖啡西", meaning: "Coffee with evaporated milk", romanisation: "ko-pee see" },
      { phrase: "Lor mee", chinese: "卤面", meaning: "Braised noodles in thick gravy", romanisation: "lor mee" },
      { phrase: "Mee rebus", chinese: "湿炒面", meaning: "Noodles in thick sauce", romanisation: "mee rebus" },
      { phrase: "Mee siam", chinese: "暹面", meaning: "Spicy tangy rice noodles", romanisation: "mee siam" },
      { phrase: "Char kway teow", chinese: "炒粿条", meaning: "Fried flat noodles", romanisation: "char kway teow" },
      { phrase: "Chwee kueh", chinese: "水粿", meaning: "Steamed rice cake with chai poh", romanisation: "chwee kueh" },
      { phrase: "Kueh pie tee", chinese: "粿杯底", meaning: "Crispy tart shells with filling", romanisation: "kueh pie tee" },
      { phrase: "Popiah", chinese: "薄饼", meaning: "Fresh spring roll", romanisation: "popiah" },
      { phrase: "Hae mee", chinese: "虾面", meaning: "Prawn noodle soup", romanisation: "hae mee" },
      { phrase: "Oh ah", chinese: "蚝", meaning: "Oyster", romanisation: "oh ah" },
      { phrase: "Beef noodles", chinese: "牛肉面", meaning: "Beef noodle soup", romanisation: "ngau yuk mee" },
      { phrase: "Ba kua", chinese: "肉干", meaning: "Dried BBQ pork", romanisation: "ba kwa" },
      { phrase: "Hae bee", chinese: "虾米", meaning: "Dried shrimp", romanisation: "hae bee" },
      { phrase: "Soon kueh", chinese: "笋粿", meaning: "Bamboo shoot dumpling", romanisation: "soon kueh" },
      { phrase: "Kueh lapis", chinese: "千层糕", meaning: "Layered cake", romanisation: "kueh lapis" },
      { phrase: "Ondeh ondeh", chinese: "椰丝球", meaning: "Pandan glutinous rice balls", romanisation: "onde onde" },
      { phrase: "Cendol", chinese: "煎蕊", meaning: "Shaved ice with green jelly", romanisation: "cendol" },
      { phrase: "Ice kachang", chinese: "红豆冰", meaning: "Shaved ice dessert", romanisation: "ice kachang" },
      { phrase: "Chendol", chinese: "摩摩喳喳", meaning: "Mixed fruit dessert", romanisation: "chendol" },
    ],
  },
};


const singlishPhrases = [
  {
    id: 1,
    phrase: "Bo Liao",
    chinese: "無聊",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Nothing to do; bored; meaningless or silly",
    fullExplanation: "Literally means 'nothing' (bo) + 'interesting/meaningful' (liao). Used when someone is bored, has nothing to do, or is being silly and wasting time.",
    examples: [
      "Eh, so bo liao la — you really got nothing better to do?",
      "That show damn bo liao, I fell asleep halfway.",
      "We were just bo liao-ing at the kopitiam the whole afternoon."
    ],
    tags: ["mood", "everyday", "NS", "school"],
    category: "Feelings & Attitudes"
  },
  {
    id: 2,
    phrase: "Jiak Zua",
    chinese: "食蛇",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "To slack off; to skive; eating snake (being lazy on the job)",
    fullExplanation: "'Jiak' means 'to eat' and 'zua' means 'snake'. The phrase originates from the Hokkien expression of slacking like a snake hidden in the grass. Very common in NS and work contexts.",
    examples: [
      "Wah, he never come for duty — confirm jiak zua at the back.",
      "That new colleague always jiak zua during work hours.",
      "In NS we jiak zua until kena scolded by sergeant."
    ],
    tags: ["NS", "work", "classic"],
    category: "Work & Effort"
  },
  {
    id: 3,
    phrase: "Hum Sup",
    chinese: "鹹濕",
    dialect: "Cantonese",
    dialectColor: "#8E44AD",
    meaning: "Perverted; lecherous; dirty-minded",
    fullExplanation: "From Cantonese 'hahm' (salty/lewd) and 'sap' (wet/damp). 'Salty and wet' is a Cantonese metaphor for someone with perverted or dirty thoughts. Commonly used across all ages in Singapore.",
    examples: [
      "Eh, stop being so hum sup la, uncle!",
      "That hum sup look he gave — so uncomfortable.",
      "Hum sup lo alert — cover up lah!"
    ],
    tags: ["attitude", "classic", "adults"],
    category: "Character & Personality"
  },
  {
    id: 4,
    phrase: "Jit Pai Siao Liao",
    chinese: "一擺痟了",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Gone crazy this time; really lost it now",
    fullExplanation: "'Jit pai' means 'this time' in Hokkien, and 'siao' means 'crazy'. 'Liao' is a completion marker. Used to exclaim that someone has gone completely mad or done something extremely reckless.",
    examples: [
      "He quit his job and bought a boat — jit pai siao liao.",
      "You want to run a marathon tomorrow with no training? Jit pai siao liao!",
      "Wah jit pai siao liao, the queue is like 3 hours long."
    ],
    tags: ["exclamation", "NS", "everyday", "classic"],
    category: "Exclamations"
  },
  {
    id: 5,
    phrase: "Kaypoh",
    chinese: "鷄婆",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Nosy; busybody; interfering in others' affairs",
    fullExplanation: "Literally 'chicken woman' — a Hokkien term for a woman who meddles in other people's business. Now gender-neutral and universally used in Singlish to describe anyone who is nosy or overly curious.",
    examples: [
      "Why are you so kaypoh? Mind your own business lah.",
      "The kaypoh aunty next door knows everything about everyone.",
      "Don't be kaypoh, it's not your problem."
    ],
    tags: ["character", "classic", "everyday"],
    category: "Character & Personality"
  },
  {
    id: 6,
    phrase: "Paiseh",
    chinese: "歹勢",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Embarrassed; shy; sorry; feeling bad about something",
    fullExplanation: "Directly from Hokkien meaning 'bad situation/posture'. Used to express embarrassment, shyness, or apology. One of the most universally used dialect words in Singaporean daily life.",
    examples: [
      "Paiseh ah, I forgot to bring your present.",
      "Wah so paiseh — I accidentally called the teacher 'Mum'.",
      "Paiseh paiseh, can you repeat that?"
    ],
    tags: ["feelings", "classic", "everyday", "school"],
    category: "Feelings & Attitudes"
  },
  {
    id: 7,
    phrase: "Sian",
    chinese: "仙",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Bored; tired; fed up; sick of something",
    fullExplanation: "From the Hokkien word 'sian' originally referring to a magical/immortal being detached from worldly matters. In Singlish, it evolved to mean boredom, fatigue, or being completely over something.",
    examples: [
      "Sian ah, same thing every day.",
      "Three more hours of guard duty — super sian.",
      "I so sian of this project already."
    ],
    tags: ["mood", "NS", "school", "everyday"],
    category: "Feelings & Attitudes"
  },
  {
    id: 8,
    phrase: "Buay Tahan",
    chinese: "袂擔",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Cannot take it; unbearable; can't stand it",
    fullExplanation: "'Buay' means 'cannot' and 'tahan' is Malay for 'endure/bear'. A classic Hokkien-Malay hybrid phrase deeply embedded in Singlish. Used when something is too much to handle — physically, emotionally, or comedically.",
    examples: [
      "The heat today buay tahan sia.",
      "He keeps talking and talking — I buay tahan already.",
      "That spicy mala buay tahan level!"
    ],
    tags: ["feelings", "exclamation", "everyday", "food"],
    category: "Feelings & Attitudes"
  },
  {
    id: 9,
    phrase: "Kiasu",
    chinese: "驚輸",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Fear of losing out; overly competitive; always wanting to be first",
    fullExplanation: "'Kia' means 'afraid' and 'su' means 'lose' in Hokkien. The quintessential Singaporean trait — standing in long queues, joining everything, grabbing freebies. So culturally significant it entered the Oxford English Dictionary.",
    examples: [
      "He queued 4 hours for bubble tea — classic kiasu Singaporean.",
      "Don't be so kiasu, there's enough for everyone.",
      "My mum so kiasu she registered me for 10 CCAs."
    ],
    tags: ["culture", "classic", "school", "everyday"],
    category: "Culture & Mindset"
  },
  {
    id: 10,
    phrase: "Kiasi",
    chinese: "驚死",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Afraid of dying; overly cautious; cowardly",
    fullExplanation: "'Kia' means 'afraid' and 'si' means 'die/death'. Companion phrase to kiasu. Describes someone who is overly fearful of consequences, risks, or confrontation.",
    examples: [
      "He never dare to try the durian — so kiasi.",
      "Don't be kiasi la, just jump into the pool.",
      "Wah he wear mask, shield, and gloves — kiasi max."
    ],
    tags: ["character", "classic", "everyday"],
    category: "Character & Personality"
  },
  {
    id: 11,
    phrase: "Gong Gong",
    chinese: "戇戇",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Silly; blur; foolish; naive",
    fullExplanation: "From Hokkien 'gōng' meaning foolish or dull-witted. In Singlish, used affectionately or mockingly to describe someone who is naive, simple-minded, or just not thinking straight.",
    examples: [
      "Don't act gong gong — you know what you did.",
      "He so gong gong, kena cheated by the scammer.",
      "Why you stand there gong gong? Help lah!"
    ],
    tags: ["character", "school", "everyday"],
    category: "Character & Personality"
  },
  {
    id: 12,
    phrase: "Lao Kui",
    chinese: "老龜",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Old-fashioned; outdated; embarrassing; uncool",
    fullExplanation: "Literally 'old tortoise' in Hokkien. Used to describe something embarrassingly outdated, or a person who is out of touch with current trends. Similar to the English 'dinosaur' or 'fossil'.",
    examples: [
      "You still using that phone? So lao kui.",
      "That hairstyle very lao kui leh, change already.",
      "Dad's jokes are super lao kui but we still laugh."
    ],
    tags: ["style", "everyday", "school"],
    category: "Culture & Mindset"
  },
  {
    id: 13,
    phrase: "Steady Pom Pi Pi",
    chinese: "穩陣",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Very cool; reliable; composure under pressure; well done",
    fullExplanation: "'Steady' from English, 'pom pi pi' is an onomatopoeic Hokkien filler for emphasis. Used to praise someone who handled something impressively or stayed calm under pressure.",
    examples: [
      "You finish everything in one day? Steady pom pi pi!",
      "He never panic during the fire drill — steady pom pi pi.",
      "Wah, that presentation steady pom pi pi sia."
    ],
    tags: ["praise", "NS", "everyday"],
    category: "Exclamations"
  },
  {
    id: 14,
    phrase: "Shiok",
    chinese: "爽",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Feels great; satisfying; delicious; awesome",
    fullExplanation: "Believed to derive from Hokkien 'shuang' or Punjabi 'shikar'. Used to describe intense pleasure or satisfaction — from food, rest, a massage, or good news.",
    examples: [
      "This laksa damn shiok!",
      "After gym then mandi — so shiok.",
      "The air con so shiok after the hot weather."
    ],
    tags: ["food", "mood", "classic", "everyday"],
    category: "Feelings & Attitudes"
  },
  {
    id: 15,
    phrase: "Walao Eh",
    chinese: "我老耶",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Oh my goodness; expressing shock, disbelief, or exasperation",
    fullExplanation: "'Wa' means 'I/me', 'lao' means 'old', and 'eh' is an exclamatory suffix from Hokkien. The phrase loosely means 'my father!' used as an expletive of surprise. Ubiquitous in Singaporean speech.",
    examples: [
      "Walao eh, you ate the whole thing by yourself?!",
      "Walao, the queue so long!",
      "Walao eh — you forgot again?!"
    ],
    tags: ["exclamation", "classic", "everyday", "NS"],
    category: "Exclamations"
  },
  {
    id: 16,
    phrase: "Chio Bu",
    chinese: "笑美",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Attractive woman; pretty girl",
    fullExplanation: "'Chio' means 'to laugh/smile' and 'bu' means 'woman' in Hokkien. A 'smiling woman' became shorthand for an attractive girl. Widely used by young Singaporeans, especially in NS.",
    examples: [
      "Wah, that chio bu over there — dare to intro?",
      "NS guys all talk about chio bu one.",
      "She confirm chio bu status."
    ],
    tags: ["NS", "slang", "youth"],
    category: "People & Relationships"
  },
  {
    id: 17,
    phrase: "Lanjiao",
    chinese: "𪚩鳥",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Vulgar expletive (male anatomy); used broadly as an intensifier",
    fullExplanation: "Hokkien vulgar term widely used in Singlish as a strong expletive or intensifier, similar to how English speakers use certain words. Very common in casual male speech, NS, and comedy.",
    examples: [
      "Cannot find parking — lan jiao la!",
      "Talk lanjiao only, no action.",
      "Lanjiao weather today."
    ],
    tags: ["vulgar", "NS", "adult", "classic"],
    category: "Expletives & Intensifiers"
  },
  {
    id: 18,
    phrase: "Chao Keng",
    chinese: "臭𝙸",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "To fake illness or injury; to skive by pretending to be sick",
    fullExplanation: "'Chao' means 'smelly' and 'keng' refers to a crafty trick or dodge. Originally a NS term for soldiers faking injury to avoid duties. Now broadly used for anyone pretending to be incapable.",
    examples: [
      "He chao keng every Monday, confirm fake headache.",
      "NS staple: chao keng at the medical centre.",
      "Don't chao keng la, just do the work."
    ],
    tags: ["NS", "work", "classic"],
    category: "Work & Effort"
  },
  {
    id: 19,
    phrase: "Sabo",
    chinese: "破壞",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "To sabotage someone; to set someone up; to get someone into trouble",
    fullExplanation: "Shortened from English 'sabotage', but the Hokkien oral culture of playful betrayal and mischief shaped how it's used in Singlish — often for light-hearted pranks or setting someone up.",
    examples: [
      "Eh don't sabo me — I never do anything to you!",
      "He sabo his friend by telling the teacher.",
      "Classic NS move: sabo your buddy for a laugh."
    ],
    tags: ["NS", "school", "friends", "everyday"],
    category: "Actions & Behaviours"
  },
  {
    id: 20,
    phrase: "Tok Kong",
    chinese: "督工",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "The best; top-tier; outstanding quality",
    fullExplanation: "From Hokkien 'tok' (sole/exceptional) and 'kong' (of a kind/calibre). Used to describe someone or something that is simply the best — in skill, quality, or character.",
    examples: [
      "This chicken rice tok kong — best in Singapore.",
      "Your freestyle dance tok kong sia!",
      "He the tok kong in our platoon, always steady."
    ],
    tags: ["praise", "food", "NS", "everyday"],
    category: "Exclamations"
  },
  {
    id: 21,
    phrase: "Jialat",
    chinese: "食力",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "In serious trouble; very bad situation; draining of energy",
    fullExplanation: "'Jia' means 'eat/drain' and 'lat' means 'strength/energy'. Literally, something that 'eats your strength'. Used to describe a bad situation, tough predicament, or an exhausting task.",
    examples: [
      "Failed three subjects — jialat liao.",
      "The traffic is jialat, going to be late.",
      "This project jialat — deadline tomorrow, only started today."
    ],
    tags: ["exclamation", "NS", "school", "everyday"],
    category: "Exclamations"
  },
  {
    id: 22,
    phrase: "Orbi Quek",
    chinese: "活該",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Serves you right; you deserved it",
    fullExplanation: "'Orbi' comes from Hokkien 'ur bi' meaning 'serves right/proper fate' and 'quek' (sometimes spelt 'good') is added for emphasis. Said when someone suffers consequences they brought upon themselves.",
    examples: [
      "Orbi quek — I told you not to eat so much.",
      "Didn't study and failed? Orbi quek.",
      "Orbi quek, who ask you never listen?"
    ],
    tags: ["friends", "school", "everyday", "classic"],
    category: "Reactions & Responses"
  },
  {
    id: 23,
    phrase: "Pek Chek",
    chinese: "薄脊",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Frustrated; annoyed; irritated",
    fullExplanation: "From Hokkien, originally describing the uncomfortable feeling of being pressed thin. Now used broadly to describe frustration, irritation, or feeling exasperated by a situation or person.",
    examples: [
      "Damn pek chek — waited 40 minutes for the bus.",
      "He pek chek until cannot talk already.",
      "Every time he does this I super pek chek."
    ],
    tags: ["mood", "everyday", "NS", "work"],
    category: "Feelings & Attitudes"
  },
  {
    id: 24,
    phrase: "Wah Piang",
    chinese: "我評",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Oh wow; expressing disbelief, awe, or frustration",
    fullExplanation: "A Hokkien exclamation of strong emotion — could be surprise, disbelief, or exasperation. A softer alternative to 'Walao eh' and commonly used by older generations and in heartland communities.",
    examples: [
      "Wah piang, the price jump so much?",
      "Wah piang eh — you only tell me now?",
      "Wah piang, this is too much already."
    ],
    tags: ["exclamation", "classic", "everyday"],
    category: "Exclamations"
  },
  {
    id: 25,
    phrase: "Ang Moh",
    chinese: "紅毛",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Caucasian / Western person; literally 'red hair'",
    fullExplanation: "Hokkien term historically used for Western/European people based on their reddish or light-coloured hair. Now a casual, everyday term in Singapore for any Caucasian person. Not considered offensive in local context.",
    examples: [
      "The ang moh at the kopitiam ordered teh tarik — cute.",
      "My ang moh colleague loves chicken rice more than me.",
      "Got ang moh housemate, she says everything here 'so cheap'."
    ],
    tags: ["culture", "everyday", "classic"],
    category: "People & Relationships"
  },
  {
    id: 26,
    phrase: "Lim Peh",
    chinese: "恁爸",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "I/me (arrogant first-person pronoun); literally 'your father'",
    fullExplanation: "'Lim peh' literally means 'your father' in Hokkien, used as a boastful first-person pronoun implying dominance or superiority. Common in NS culture and among young men showing off.",
    examples: [
      "Lim peh never scared of anything one.",
      "You think lim peh so easy to bluff ah?",
      "Lim peh already finished the whole assignment by 9pm."
    ],
    tags: ["NS", "youth", "bravado", "classic"],
    category: "People & Relationships"
  },
  {
    id: 27,
    phrase: "Siam",
    chinese: "閃",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Move out of the way; dodge; avoid; step aside",
    fullExplanation: "From Hokkien 'siám' meaning to dodge or move aside. In Singlish, used as a command to get someone to move, or as a verb meaning to avoid something or someone.",
    examples: [
      "Siam! Bicycle coming!",
      "He siam the whole meeting — MIA.",
      "I siam that topic whenever she brings it up."
    ],
    tags: ["NS", "everyday", "action", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 28,
    phrase: "Lepak",
    chinese: "歇",
    dialect: "Malay/Hokkien blend",
    dialectColor: "#C0392B",
    meaning: "To hang out; to chill; to loaf around with no agenda",
    fullExplanation: "Originally Malay, but absorbed deeply into Hokkien-influenced Singlish culture. 'Lepak' describes the very Singaporean habit of hanging out at void decks, kopitiams, or mamak stalls with friends doing nothing in particular.",
    examples: [
      "Tonight lepak at the void deck?",
      "We just lepak at the kopitiam the whole Sunday.",
      "NS life is all about lepak then kena arrow."
    ],
    tags: ["lifestyle", "friends", "NS", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 29,
    phrase: "Tekan",
    chinese: "壓",
    dialect: "Malay/Hokkien blend",
    dialectColor: "#C0392B",
    meaning: "To press / bully / give someone a hard time intentionally",
    fullExplanation: "From Malay 'tekan' meaning to press or oppress. In Singlish (especially NS), it means to deliberately give someone more work, punishment, or a hard time — often by a superior.",
    examples: [
      "The sergeant always tekan us for fun.",
      "He tekan the new guy every day.",
      "Why you tekan me only, others never do anything also."
    ],
    tags: ["NS", "school", "work", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 30,
    phrase: "Bojio",
    chinese: "無招",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "You didn't invite me! (expression of being left out)",
    fullExplanation: "'Bo' means 'no/none' and 'jio' means 'to invite' in Hokkien. A staple Singlish complaint when someone did something fun or ate something good without including you.",
    examples: [
      "Went Jap buffet without me? Bojio!",
      "Eh, movie night bojio sia.",
      "Every time you all go makan also bojio — what friends."
    ],
    tags: ["friends", "food", "school", "classic", "everyday"],
    category: "Reactions & Responses"
  },
  {
    id: 31,
    phrase: "Jio",
    chinese: "招",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "To invite someone; to ask someone to join",
    fullExplanation: "From Hokkien 'jioh' meaning to invite or beckon. The positive counterpart to 'bojio'. Used casually to mean inviting or asking someone along.",
    examples: [
      "Can jio me along? I want to eat too!",
      "He jio all his NS friends to the gathering.",
      "Jio her la — she's been asking to hang out."
    ],
    tags: ["friends", "everyday", "school"],
    category: "Actions & Behaviours"
  },
  {
    id: 32,
    phrase: "Sotong",
    chinese: "魷魚",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "Blur like sotong; confused; clueless; forgetful",
    fullExplanation: "'Sotong' is the Malay word for squid. Squids squirt ink and escape in a cloud — used metaphorically for someone who is perpetually confused or doesn't know what's going on. Beloved expression in NS.",
    examples: [
      "He damn sotong — asked him to buy red marker came back with blue.",
      "Don't be sotong la, I told you three times already.",
      "First day of camp everyone is sotong."
    ],
    tags: ["NS", "school", "everyday", "character"],
    category: "Character & Personality"
  },
  {
    id: 33,
    phrase: "Zhun Bo?",
    chinese: "準無",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Is it accurate? / Is that true? / Are you sure?",
    fullExplanation: "'Zhun' means 'accurate/precise' and 'bo' is a question tag meaning 'right?/or not?' in Hokkien. Used to question the accuracy or truthfulness of a claim. Very common in casual speech.",
    examples: [
      "You say she likes me — zhun bo?",
      "Zhun bo? The hawker closed down already meh?",
      "PSLE score 270? Zhun bo sia."
    ],
    tags: ["everyday", "school", "friends", "classic"],
    category: "Reactions & Responses"
  },
  {
    id: 34,
    phrase: "Gahmen",
    chinese: "政府",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "The government (Singaporean government)",
    fullExplanation: "A phonetic Hokkien rendering of the English word 'government'. Widely used across generations in Singapore as a casual, affectionate, or slightly irreverent way to refer to the authorities or state.",
    examples: [
      "Gahmen say cannot, so cannot lor.",
      "The gahmen give out vouchers again.",
      "Gahmen everything also want to regulate."
    ],
    tags: ["culture", "everyday", "classic"],
    category: "Culture & Mindset"
  },
  {
    id: 35,
    phrase: "Wah Lau",
    chinese: "我老",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Oh my! (expression of surprise or exasperation)",
    fullExplanation: "Shortened form of 'Walao eh'. 'Wa' is 'I/me' and 'lau' means 'old' in Hokkien — originally an exclamation invoking one's father. Used freely as a general exclamation of shock, disbelief or mild irritation.",
    examples: [
      "Wah lau, you scared me!",
      "Wah lau eh, how come so expensive one.",
      "Wah lau — 5am wake up?!"
    ],
    tags: ["exclamation", "classic", "everyday", "NS"],
    category: "Exclamations"
  },
  {
    id: 36,
    phrase: "Makan",
    chinese: "食",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "To eat; food; a meal",
    fullExplanation: "Malay for 'eat', deeply embedded in Singlish through Hokkien-Malay interaction in Singapore's early hawker culture. Singaporeans say 'go makan' instead of 'go eat' as naturally as breathing.",
    examples: [
      "Where to makan tonight?",
      "Let's go makan at the hawker centre.",
      "He always makan then disappear."
    ],
    tags: ["food", "everyday", "classic"],
    category: "Food & Eating"
  },
  {
    id: 37,
    phrase: "Lobang",
    chinese: "洞",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "An opportunity; a good tip-off; a lucrative deal or inside information",
    fullExplanation: "'Lobang' is Malay for 'hole/cavity', but in Singlish (heavily shaped by Hokkien business culture) it evolved to mean a good opportunity, business deal, or insider information. Very NS and kopitiam in usage.",
    examples: [
      "You got any lobang for cheap parking?",
      "He got lobang for contract jobs.",
      "Share the lobang la, brother!"
    ],
    tags: ["work", "NS", "everyday", "friends"],
    category: "Work & Effort"
  },
  {
    id: 38,
    phrase: "Kena",
    chinese: "著",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "To get hit; to receive (usually something bad); to be subjected to",
    fullExplanation: "From Malay, but cemented in Singlish through Hokkien passive voice constructions. Used almost exclusively for negative outcomes — getting punished, hit, cheated, or unlucky. Singaporeans instinctively say 'kena' for anything that befalls them.",
    examples: [
      "I kena scolded by the boss.",
      "You kena caught playing phone in class.",
      "Kena arrow for duty again — so suay."
    ],
    tags: ["NS", "school", "everyday", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 39,
    phrase: "Suay",
    chinese: "衰",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Unlucky; unfortunate; having bad luck",
    fullExplanation: "From Hokkien 'soe' or 'suai' meaning unlucky or inauspicious. A core vocabulary word in Singapore — used whenever something goes wrong or someone has a string of bad luck.",
    examples: [
      "So suay — rain only when I forget umbrella.",
      "Kena parking summon, damn suay.",
      "Today very suay leh — everything also go wrong."
    ],
    tags: ["everyday", "classic", "NS"],
    category: "Feelings & Attitudes"
  },
  {
    id: 40,
    phrase: "Ownself Check Ownself",
    chinese: "自己查自己",
    dialect: "Hokkien/Singlish",
    dialectColor: "#C0392B",
    meaning: "Self-regulation; to check oneself; originally used politically but now ironic",
    fullExplanation: "A phrase made famous in Singaporean political discourse — rooted in the Hokkien concept of self-accountability ('jiaji'). Now used satirically or humorously in everyday speech to call out double standards.",
    examples: [
      "You make the rule then you ownself check ownself?",
      "Ownself check ownself — very the reliable.",
      "Classic Singaporean government move: ownself check ownself."
    ],
    tags: ["culture", "irony", "classic", "everyday"],
    category: "Culture & Mindset"
  },
  {
    id: 41,
    phrase: "Wayang",
    chinese: "戲",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "To put on a show; to act for appearances; insincere performance",
    fullExplanation: "Malay for 'theatre/performance', absorbed into Singlish via Hokkien-Peranakan culture. In Singapore it means performing for show without sincerity — especially common in NS contexts when acting hardworking for superiors.",
    examples: [
      "He only works hard when the boss is around — pure wayang.",
      "Wayang until like that — don't waste my time.",
      "NS full of people wayang during inspection."
    ],
    tags: ["NS", "work", "culture", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 42,
    phrase: "Chope",
    chinese: "佔",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "To reserve / claim a seat; typically with a tissue packet",
    fullExplanation: "Derived from Hokkien 'chhiap' meaning to cut in or stake a claim. The uniquely Singaporean practice of placing tissue packets to 'chope' (reserve) a seat at hawker centres. A beloved national custom.",
    examples: [
      "Quick, chope that table before the aunties do.",
      "He choped the seat with tissue — classic Singapore.",
      "Can you chope a seat for me? I go order first."
    ],
    tags: ["food", "culture", "hawker", "classic"],
    category: "Culture & Mindset"
  },
  {
    id: 43,
    phrase: "Hao Lian",
    chinese: "好臉",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Show-off; boastful; arrogant; full of oneself",
    fullExplanation: "'Hao' means 'good/wanting' and 'lian' means 'face'. Literally 'wanting face (status)'. Describes someone who shows off, brags, or acts superior. Very common playground and NS vocabulary.",
    examples: [
      "Don't hao lian la — everyone also can do.",
      "He buy new car then drive around — so hao lian.",
      "Damn hao lian sia, keep showing off his rank."
    ],
    tags: ["character", "NS", "school", "everyday"],
    category: "Character & Personality"
  },
  {
    id: 44,
    phrase: "Suka Suka",
    chinese: "隨便",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "Do as you like; anyhow; without care or discipline",
    fullExplanation: "From Malay 'suka' meaning 'to like/enjoy'. In Singlish, 'suka suka' means doing something however you feel, without regard for rules or others. Often used to call out reckless or inconsiderate behaviour.",
    examples: [
      "You cannot suka suka park here lah.",
      "Don't suka suka change the plan without telling us.",
      "He suka suka put his stuff everywhere."
    ],
    tags: ["attitude", "everyday", "NS"],
    category: "Actions & Behaviours"
  },
  {
    id: 45,
    phrase: "Anyhow",
    chinese: "隨便",
    dialect: "Hokkien influenced",
    dialectColor: "#C0392B",
    meaning: "Carelessly; recklessly; without proper thought",
    fullExplanation: "Though English in origin, 'anyhow' in Singlish carries strong Hokkien flavour from 'boh pian' (no choice) and 'luan luan' (chaotic) culture. In Singlish it means doing something carelessly or without proper consideration.",
    examples: [
      "Don't anyhow say things about people.",
      "He anyhow cut the queue.",
      "Cannot anyhow do — must follow the SOP."
    ],
    tags: ["attitude", "everyday", "NS", "classic"],
    category: "Actions & Behaviours"
  },
  {
    id: 46,
    phrase: "Mati",
    chinese: "死",
    dialect: "Malay/Hokkien",
    dialectColor: "#C0392B",
    meaning: "Dead; done for; finished; you're in deep trouble",
    fullExplanation: "Malay for 'dead/die', used in Singlish (with heavy Hokkien expressive culture) to describe being done for or in terrible trouble. Often used dramatically for minor inconveniences.",
    examples: [
      "Left my wallet at home — mati liao.",
      "Forget to submit assignment? Mati.",
      "If sergeant find out we mati liao."
    ],
    tags: ["exclamation", "NS", "school", "everyday"],
    category: "Exclamations"
  },
  {
    id: 47,
    phrase: "Blur Like Sotong",
    chinese: "模糊如魷魚",
    dialect: "Hokkien/Malay blend",
    dialectColor: "#C0392B",
    meaning: "Completely clueless; confused and disoriented",
    fullExplanation: "A full Singlish idiom combining English 'blur', Malay 'sotong' (squid), all shaped by Hokkien expressive style. Squids become clouded when confused. Used to describe someone totally lost in a situation.",
    examples: [
      "First day at new job — blur like sotong.",
      "He blur like sotong, doesn't know what's happening.",
      "Don't be blur like sotong, wake up!"
    ],
    tags: ["NS", "school", "classic", "character"],
    category: "Character & Personality"
  },
  {
    id: 48,
    phrase: "Kan Cheong",
    chinese: "緊張",
    dialect: "Cantonese",
    dialectColor: "#8E44AD",
    meaning: "Anxious; nervous; panicky; flustered",
    fullExplanation: "From Cantonese 'gān jēung' meaning tense or nervous. One of the most beloved Cantonese contributions to Singlish — describing the flustered, anxious energy many Singaporeans experience before exams, interviews, or NS.",
    examples: [
      "Don't so kan cheong la, still got time.",
      "She kan cheong until cannot speak properly.",
      "Wah he so kan cheong over one interview."
    ],
    tags: ["feelings", "school", "NS", "everyday"],
    category: "Feelings & Attitudes"
  },
  {
    id: 49,
    phrase: "Gam Siah",
    chinese: "感謝",
    dialect: "Cantonese",
    dialectColor: "#8E44AD",
    meaning: "Thank you; heartfelt gratitude",
    fullExplanation: "Cantonese for 'grateful' or 'thank you'. While 'doh jeh' and 'mm goi' are more common in Cantonese-speaking families, 'gam siah' has entered Singlish as a warm, slightly formal expression of genuine thanks.",
    examples: [
      "Gam siah ah, you really helped me a lot.",
      "Gam siah for the ang pow, auntie!",
      "Wah gam siah — didn't expect you to remember."
    ],
    tags: ["manners", "classic", "everyday"],
    category: "Feelings & Attitudes"
  },
  {
    id: 50,
    phrase: "Ah Lian / Ah Beng",
    chinese: "亞蓮/亞明",
    dialect: "Hokkien",
    dialectColor: "#C0392B",
    meaning: "Stereotypical working-class Singaporean Chinese girl/boy; could be affectionate or derogatory depending on context",
    fullExplanation: "'Ah Lian' and 'Ah Beng' are Hokkien names commonly given to characters representing the stereotypical young Singaporean Chinese working-class identity — with distinct fashion, slang, and attitude. Often used humorously.",
    examples: [
      "She very Ah Lian — big hair, loud shirt.",
      "He dress like Ah Beng but actually scholarship holder.",
      "The Ah Beng at the void deck actually super nice."
    ],
    tags: ["culture", "identity", "classic", "everyday"],
    category: "People & Relationships"
  },
];




const situationalQuizzes = {
  hokkien: [
    {
      id: 1,
      title: "A Day in Singapore - Hokkien Community",
      story: "Follow a day in the life of someone navigating Singapore's diverse dialect communities",
      cues: [
        { context: "Early morning at home. Your grandmother asks 'Chiah pa buay?' (Have you eaten?). You just woke up.", dialogues: [
          { phrase: "Wa ai chiah tua png loo", meaning: "I want to eat a big plate of rice", correct: true },
          { phrase: "Wa ai khui liao", meaning: "I want to go already", correct: false },
          { phrase: "Boh lui lah", meaning: "No money lah", correct: false }
        ]},
        { context: "At the hawker center. The uncle is serving char kuay teow. You want it.", dialogues: [
          { phrase: "Beh hiam, beh hiam!", meaning: "Not spicy, not spicy!", correct: true },
          { phrase: "Wa ai pua liao", meaning: "I'm too full already", correct: false },
          { phrase: "Chin sian lor", meaning: "So bored lah", correct: false }
        ]},
        { context: "At the market. A vegetable auntie asks what you're looking for today.", dialogues: [
          { phrase: "Wa ai chye kia, gao lat!", meaning: "I want vegetables, very nice ones!", correct: true },
          { phrase: "Wa boh eng gam jit", meaning: "I don't have time today", correct: false },
          { phrase: "Taai gwai lah", meaning: "Too expensive lah", correct: false }
        ]},
        { context: "You bump into an old friend at the MRT station. Long time no see!", dialogues: [
          { phrase: "Hóu noi buay khua lo!", meaning: "Long time never meet lah!", correct: true },
          { phrase: "Wa ai khi liao", meaning: "I want to go already", correct: false },
          { phrase: "Boh su, boh su", meaning: "Nothing, nothing", correct: false }
        ]},
        { context: "Lunchtime. Your colleague asks where you want to eat. You're hungry!", dialogues: [
          { phrase: "Wa ai chiah bah png kuay tio!", meaning: "I want to eat pork rice with gravy!", correct: true },
          { phrase: "Wa m bat khui toh", meaning: "I don't know where to go", correct: false },
          { phrase: "Chin pua liao", meaning: "So full already", correct: false }
        ]},
        { context: "At work, your boss asks about the project. You're making progress.", dialogues: [
          { phrase: "Tui buan joa liao, beh ghua!", meaning: "Half done already, don't worry!", correct: true },
          { phrase: "Wa m bat, wa m sai", meaning: "I don't know, I can't do it", correct: false },
          { phrase: "Chin kua, chin kua lor", meaning: "Very difficult, very difficult lah", correct: false }
        ]},
        { context: "Afternoon slump. You're tired at work. Your friend offers to get you a drink.", dialogues: [
          { phrase: "Ua thinn kua goa, ka bui teh tarik!", meaning: "I'm very tired, get me a pulled tea!", correct: true },
          { phrase: "Boh eng, boh eng!", meaning: "No time, no time!", correct: false },
          { phrase: "Wa ai khui khi lie", meaning: "I want to go home", correct: false }
        ]},
        { context: "Dinner time. Your mother asks if you'll help cook. You're happy to help.", dialogues: [
          { phrase: "Tsia, tsia, wa bo ban lo!", meaning: "Sure, sure, I'll help!", correct: true },
          { phrase: "Wa m bat khui tsua", meaning: "I don't know how to cook", correct: false },
          { phrase: "Chin pua liao", meaning: "So full already", correct: false }
        ]},
        { context: "Oops! You accidentally spilled soup on the table. Your family reassures you.", dialogues: [
          { phrase: "Boh su, boh su lor, tio thinn ti kua", meaning: "No worries, no worries, just normal", correct: true },
          { phrase: "Chiah liao beh ho!", meaning: "Eaten already not good!", correct: false },
          { phrase: "Wa ai khui liao", meaning: "I want to go already", correct: false }
        ]},
        { context: "Before bed. Your grandmother says 'Peh an hoo lo' (Sleep well). You want to wish her good night warmly.", dialogues: [
          { phrase: "Guan bo, lo bo, khuann tin tshio!", meaning: "Goodnight, parents, sleep well!", correct: true },
          { phrase: "Boh eng lah, beh tsiann", meaning: "No time lah, no need to talk", correct: false },
          { phrase: "Wa ai khui khi a", meaning: "I want to go", correct: false }
        ]}
      ]
    }
  ],
  cantonese: [
    {
      id: 1,
      title: "A Day in Singapore - Cantonese Community",
      story: "Follow a day in the life of someone navigating Singapore's diverse dialect communities",
      cues: [
        { context: "Early morning at home. Your grandmother asks 'Sihk jó faahn meih a?' (Have you eaten rice?). You just woke up.", dialogues: [
          { phrase: "Meih, ngóh yiu sihk fan", meaning: "Not yet, I want to eat rice", correct: true },
          { phrase: "Sihk jó lā", meaning: "Already eaten lā", correct: false },
          { phrase: "Ngóh m̀ gau", meaning: "I'm not hungry", correct: false }
        ]},
        { context: "At the dim sum restaurant. The auntie is pushing the trolley. You see char siu bao!", dialogues: [
          { phrase: "Yiu ni go char siu bao!", meaning: "I want this char siu bao!", correct: true },
          { phrase: "Taai gwai laa", meaning: "Too expensive laa", correct: false },
          { phrase: "Ngóh boh jin yan", meaning: "I have no appetite", correct: false }
        ]},
        { context: "At the market. A fruit auntie asks what you need. You want some oranges.", dialogues: [
          { phrase: "Gei go cam zai, zin leng!", meaning: "Give me some oranges, very fresh!", correct: true },
          { phrase: "Gam gwai, gam gwai laa", meaning: "So expensive, so expensive laa", correct: false },
          { phrase: "Mo man tai, mo yiu", meaning: "No problem, don't need", correct: false }
        ]},
        { context: "You run into an old friend at MTR. Long time no see!", dialogues: [
          { phrase: "Hóu noi móuh gin! Nee gam doh?", meaning: "Long time no see! How have you been?", correct: true },
          { phrase: "Wa ai heoi lie gak", meaning: "I want to go home", correct: false },
          { phrase: "Ngóh m̀ ji", meaning: "I don't know", correct: false }
        ]},
        { context: "Lunchtime. Your colleague asks where to eat. You're hungry!", dialogues: [
          { phrase: "Wa yiu sihk go wun taan min!", meaning: "I want to eat wonton noodles!", correct: true },
          { phrase: "Ngóh boh man tai", meaning: "I don't have any problem", correct: false },
          { phrase: "Chin gau la, m̀ sai sihk", meaning: "Very full already, don't need to eat", correct: false }
        ]},
        { context: "At work, your boss asks about the project. It's going well.", dialogues: [
          { phrase: "Haih gam gwan, mo man tai!", meaning: "That's right, no problem!", correct: true },
          { phrase: "Ngóh m̀ ji, hai boh hai", meaning: "I don't know, yes or no", correct: false },
          { phrase: "Taai gaan la", meaning: "Too difficult laa", correct: false }
        ]},
        { context: "Afternoon. You're tired. Your friend asks if you want tea.", dialogues: [
          { phrase: "Ho la! Ka bui naai cha!", meaning: "Yes! Get me milk tea!", correct: true },
          { phrase: "M̀ sai, m̀ sai", meaning: "Don't need, don't need", correct: false },
          { phrase: "Ngóh gau gam gwan", meaning: "I'm full enough", correct: false }
        ]},
        { context: "Dinner time. Your mother asks if you'll help. You're glad to help.", dialogues: [
          { phrase: "Dang ha, wa heoi to!", meaning: "Wait, I'll come help!", correct: true },
          { phrase: "M̀ sai gung fu", meaning: "Don't need to work", correct: false },
          { phrase: "Ngóh gau, gau la", meaning: "I'm full, full enough", correct: false }
        ]},
        { context: "Oops! You knocked over a glass. Your family says it's okay.", dialogues: [
          { phrase: "Mo man tai, mo man tai lor!", meaning: "No problem, no problem lah!", correct: true },
          { phrase: "Dap chói, dap chói!", meaning: "Too bad, too bad!", correct: false },
          { phrase: "Ngóh ai heoi lie", meaning: "I want to go", correct: false }
        ]},
        { context: "Before bed. Your grandmother says good night. You want to wish her well warmly.", dialogues: [
          { phrase: "Maan on, po po! Faan gaau fun!", meaning: "Good night, grandma! Sleep well!", correct: true },
          { phrase: "Boh si, boh si, faai di la", meaning: "Never mind, never mind, hurry lah", correct: false },
          { phrase: "Waih? Góng máh?", meaning: "Hello? What are you saying?", correct: false }
        ]}
      ]
    }
  ],
  teochew: [
    {
      id: 1,
      title: "A Day in Singapore - Teochew Community",
      story: "Follow a day in the life of someone navigating Singapore's diverse dialect communities",
      cues: [
        { context: "Early morning at home. Your grandmother asks 'Ziah pa boih?' (Have you eaten?). You just woke up.", dialogues: [
          { phrase: "Bo pa, wa ai ziah kway teow!", meaning: "Not yet, I want to eat rice noodles!", correct: true },
          { phrase: "Ziah liao", meaning: "Already eaten", correct: false },
          { phrase: "Boh lui, boh lui", meaning: "No money, no money", correct: false }
        ]},
        { context: "At the teochew porridge stall. The auntie is serving hot muay (porridge). You're tempted!", dialogues: [
          { phrase: "Oi ka bui muay, siang tng!", meaning: "Give me a bowl of porridge, with soup!", correct: true },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false },
          { phrase: "Boh lui gam jit", meaning: "No money today", correct: false }
        ]},
        { context: "At the market. A vegetable seller greets you. You want fresh vegetables.", dialogues: [
          { phrase: "Lu ho! Oi chye siang, gao jat!", meaning: "Hello! Give me fresh vegetables, very fresh!", correct: true },
          { phrase: "Taai gwai, taai gwai lah", meaning: "Too expensive, too expensive lah", correct: false },
          { phrase: "Boh eng gam jit", meaning: "No time today", correct: false }
        ]},
        { context: "You run into an old friend at the market. Long time since you last met!", dialogues: [
          { phrase: "Hao noi bo khuann! Nee gam doh?", meaning: "Long time no meet! How have you been?", correct: true },
          { phrase: "Wa ai khi liao", meaning: "I want to go already", correct: false },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false }
        ]},
        { context: "Lunchtime. Your friend asks where to eat. You want something tasty!", dialogues: [
          { phrase: "Wa ai ziah kway chap, ho jia!", meaning: "I want to eat flat noodle soup, very delicious!", correct: true },
          { phrase: "M ai ziah gam jit", meaning: "Don't want to eat today", correct: false },
          { phrase: "Zing gau la", meaning: "Very full already", correct: false }
        ]},
        { context: "At work, your boss asks how things are going. You're doing well.", dialogues: [
          { phrase: "Eh sai, eh sai! Kong pua liao", meaning: "Can, can! Already finished", correct: true },
          { phrase: "Wa m bat, gao guan", meaning: "I don't know, very difficult", correct: false },
          { phrase: "Boh eng gam jit", meaning: "No time today", correct: false }
        ]},
        { context: "Afternoon slump. You're tired and need a pick-me-up. Your friend offers tea.", dialogues: [
          { phrase: "Oi ka bui teh tarik! Wa suay gua", meaning: "Get me pulled tea! I'm so tired", correct: true },
          { phrase: "M sai, m sai", meaning: "Don't need, don't need", correct: false },
          { phrase: "Boh eng, boh eng la", meaning: "No time, no time lah", correct: false }
        ]},
        { context: "Dinner time. Your mother asks if you'll help cook. You're happy to!", dialogues: [
          { phrase: "Tsia, tsia! Wa lai to, ka lu!", meaning: "Sure, sure! I'll come help, let me!", correct: true },
          { phrase: "Wa m bat zao chui", meaning: "I don't know how to cook", correct: false },
          { phrase: "Zing gau lo", meaning: "So full lah", correct: false }
        ]},
        { context: "Oh no! You spilled some soup. Your family reassures you it's okay.", dialogues: [
          { phrase: "Boh su, boh su lor! Sio si tio", meaning: "No worries, no worries lah! Just normal", correct: true },
          { phrase: "Gao guan! Boh lui!", meaning: "Very difficult! No money!", correct: false },
          { phrase: "Wa ai khi liao", meaning: "I want to go already", correct: false }
        ]},
        { context: "Before bed. Your grandmother says good night. You want to wish her well warmly.", dialogues: [
          { phrase: "Peng an, ama! Sio khi, siang tin siao!", meaning: "Sleep well, mother! Rest well, good night!", correct: true },
          { phrase: "Boh su, boh su", meaning: "No worries, no worries", correct: false },
          { phrase: "Wa ai khi liao", meaning: "I want to go already", correct: false }
        ]}
      ]
    }
  ],
  hakka: [
    {
      id: 1,
      title: "A Day in Singapore - Hakka Community",
      story: "Follow a day in the life of someone navigating Singapore's diverse dialect communities",
      cues: [
        { context: "Early morning at home. Your grandmother asks 'Nia ho maan, ya pan un maa?' (Good morning, did you sleep well?). You just woke up.", dialogues: [
          { phrase: "Zo san, a po! Wa ai ya fan", meaning: "Good morning, grandma! I want to eat", correct: true },
          { phrase: "Ya fan liaw maa", meaning: "Already eaten", correct: false },
          { phrase: "Mo lui", meaning: "No money", correct: false }
        ]},
        { context: "At the hawker center. A seller is making fresh fried noodles. You're hungry!", dialogues: [
          { phrase: "Ngi ho! Ka wa chau mian, m ho la!", meaning: "Hello! Give me fried noodles, not too spicy!", correct: true },
          { phrase: "Taai gwai la", meaning: "Too expensive lah", correct: false },
          { phrase: "Mo kung, mo kung", meaning: "No time, no time", correct: false }
        ]},
        { context: "At the market. A vegetable seller greets you. You need fresh greens.", dialogues: [
          { phrase: "Ngi ho! O choi siang, gao tshoi!", meaning: "Hello! Give me fresh vegetables, very good quality!", correct: true },
          { phrase: "Taai gwai, boh lui", meaning: "Too expensive, no money", correct: false },
          { phrase: "Mo kung gam zit", meaning: "No time today", correct: false }
        ]},
        { context: "You meet an old friend at the MRT. It's been a while!", dialogues: [
          { phrase: "Hao noi bho gin! Nee gam doh ngi?", meaning: "Long time no see! How are you?", correct: true },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false },
          { phrase: "Wa m sik", meaning: "I don't know", correct: false }
        ]},
        { context: "Lunchtime. Your colleague asks what you want to eat. You're hungry!", dialogues: [
          { phrase: "Wa ai ya fan chau nian, gao sik!", meaning: "I want fried noodles, very delicious!", correct: true },
          { phrase: "M ai ya fan gam zit", meaning: "Don't want to eat today", correct: false },
          { phrase: "Chang gau liaw", meaning: "Very full already", correct: false }
        ]},
        { context: "At work, your boss asks about progress. Things are going well!", dialogues: [
          { phrase: "Mo het! Ya ban zau liaw", meaning: "No problem! Nearly finished", correct: true },
          { phrase: "Wa m sik, gao guan", meaning: "I don't know, very difficult", correct: false },
          { phrase: "Mo kung", meaning: "No time", correct: false }
        ]},
        { context: "Afternoon. You're feeling tired. Your friend suggests getting some tea.", dialogues: [
          { phrase: "Do ngo! Ka nga teh tarik, chang oi!", meaning: "Yes please! Get me pulled tea, I'd love that!", correct: true },
          { phrase: "M sai, m sai", meaning: "Don't need, don't need", correct: false },
          { phrase: "Chang gau lo", meaning: "So full lah", correct: false }
        ]},
        { context: "Dinner time. Your mother asks if you can help prepare food. You're glad to!", dialogues: [
          { phrase: "Tsia tsia! Wa lai to, pa ngo!", meaning: "Sure, sure! I'll help, let me help!", correct: true },
          { phrase: "Wa m sik ya chui", meaning: "I don't know how to cook", correct: false },
          { phrase: "Chang gau lo", meaning: "So full lah", correct: false }
        ]},
        { context: "Oops! You accidentally knocked over a pot. Your family says don't worry!", dialogues: [
          { phrase: "Mo het, mo het lo! Si ngo tshoi", meaning: "No problem, no problem lah! Just normal", correct: true },
          { phrase: "Gao guan! Boh lui!", meaning: "Very difficult! No money!", correct: false },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false }
        ]},
        { context: "Before bed. Your grandmother says good night. You want to wish her well warmly.", dialogues: [
          { phrase: "Am on, a po! Sio khi, siang tin siao!", meaning: "Good night, grandma! Rest well, sleep tight!", correct: true },
          { phrase: "Mo het, mo het", meaning: "No problem, no problem", correct: false },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false }
        ]}
      ]
    }
  ],
  hainanese: [
    {
      id: 1,
      title: "A Day in Singapore - Hainanese Community",
      story: "Follow a day in the life of someone navigating Singapore's diverse dialect communities",
      cues: [
        { context: "Early morning at home. Your grandmother asks 'Zao san, chiak bo?' (Good morning, have you eaten?). You just woke up.", dialogues: [
          { phrase: "Zao san! Wa ai chiak ke fan", meaning: "Good morning! I want to eat chicken rice", correct: true },
          { phrase: "Chiak liao", meaning: "Already eaten", correct: false },
          { phrase: "Boh lui gam jit", meaning: "No money today", correct: false }
        ]},
        { context: "At the hainanese chicken rice stall. The uncle is preparing fresh chicken. You want some!", dialogues: [
          { phrase: "Uncle! Ka ngho ke fan, zin ho!", meaning: "Uncle! Give me chicken rice, very good!", correct: true },
          { phrase: "Taai gwai", meaning: "Too expensive", correct: false },
          { phrase: "Boh eng gam jit", meaning: "No time today", correct: false }
        ]},
        { context: "At the market. A seller greets you. You need fresh fruits.", dialogues: [
          { phrase: "Nee hoh! Oi cam zai, zin siang!", meaning: "Hello! Give me oranges, very fresh!", correct: true },
          { phrase: "Taai gwai, boh lui", meaning: "Too expensive, no money", correct: false },
          { phrase: "Boh eng", meaning: "No time", correct: false }
        ]},
        { context: "You run into an old friend at the hawker center. Long time no see!", dialogues: [
          { phrase: "Hao noi bo gin! Nee gam doh?", meaning: "Long time no see! How have you been?", correct: true },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false },
          { phrase: "Wa m bat", meaning: "I don't know", correct: false }
        ]},
        { context: "Lunchtime. Your friend asks where to eat. You're hungry!", dialogues: [
          { phrase: "Wa ai chiak bah png, ho jia!", meaning: "I want to eat rice with braised pork, very delicious!", correct: true },
          { phrase: "M ai chiak gam jit", meaning: "Don't want to eat today", correct: false },
          { phrase: "Zin gau lo", meaning: "So full lah", correct: false }
        ]},
        { context: "At work, your boss asks about the project. It's almost done!", dialogues: [
          { phrase: "Eh sai! Kong pua liao, beh ghua!", meaning: "Can! Almost finished, don't worry!", correct: true },
          { phrase: "Wa m bat, gao guan", meaning: "I don't know, very difficult", correct: false },
          { phrase: "Boh eng gam jit", meaning: "No time today", correct: false }
        ]},
        { context: "Afternoon slump. You're tired. Your friend offers to get you a drink.", dialogues: [
          { phrase: "Oi! Ka ngho teh, wa suay gua!", meaning: "Yes! Get me tea, I'm so tired!", correct: true },
          { phrase: "M sai, m sai", meaning: "Don't need, don't need", correct: false },
          { phrase: "Boh eng", meaning: "No time", correct: false }
        ]},
        { context: "Dinner time. Your mother asks if you can help cook. You're happy to!", dialogues: [
          { phrase: "Tsia tsia! Wa lai to, ka ngho!", meaning: "Sure, sure! I'll help, let me!", correct: true },
          { phrase: "Wa m bat zao chui", meaning: "I don't know how to cook", correct: false },
          { phrase: "Zin gau lo", meaning: "So full lah", correct: false }
        ]},
        { context: "Oh no! You spilled some water. Your family says it's all right.", dialogues: [
          { phrase: "Boh man tai, boh man tai lor! Si ngo tshoi", meaning: "No problem, no problem lah! Just normal", correct: true },
          { phrase: "Gao guan! Boh lui!", meaning: "Very difficult! No money!", correct: false },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false }
        ]},
        { context: "Before bed. Your grandmother says good night. You want to wish her well warmly.", dialogues: [
          { phrase: "Am on, ama! Zao sin, siang tin siao!", meaning: "Good night, mother! Rest well, sleep tight!", correct: true },
          { phrase: "Boh man tai", meaning: "No problem", correct: false },
          { phrase: "Wa ai hi liao", meaning: "I want to go already", correct: false }
        ]}
      ]
    }
  ]
};

const sentenceCompletion = {
  hokkien: [
    { id: 1, sentence: "Lí ___, chiah pa buay?", options: ["hó", "ai", "boh"], correctIndex: 0, meaning: "Hello, have you eaten?" },
    { id: 2, sentence: "Wa ai ___ bah png", options: ["chiah", "boh", "sai"], correctIndex: 0, meaning: "I want to eat braised pork rice." },
    { id: 3, sentence: "Chin ___ lor!", options: ["ho", "buay", "sai"], correctIndex: 0, meaning: "Very good then!" },
    { id: 4, sentence: "Chiah pa ___", options: ["liao", "khi", "ai"], correctIndex: 0, meaning: "Already eaten." },
    { id: 5, sentence: "Wa ___ bat", options: ["m", "ai", "boh"], correctIndex: 0, meaning: "I don't know." },
    { id: 6, sentence: "Boh ___ lah, wa busy", options: ["eng", "lui", "sai"], correctIndex: 0, meaning: "No time lah, I'm busy." },
    { id: 7, sentence: "Sio sim, ___ an", options: ["peng", "boh", "chin"], correctIndex: 0, meaning: "Be careful, safe journey." },
    { id: 8, sentence: "Lo li, ___ seh!", options: ["pai", "boh", "m"], correctIndex: 0, meaning: "Thank you, so sorry!" },
    { id: 9, sentence: "Khui ___ khi", options: ["bo", "lo", "tsi"], correctIndex: 1, meaning: "Go home." },
    { id: 10, sentence: "Chin ___ suia", options: ["tsui", "gua", "ho"], correctIndex: 0, meaning: "Very beautiful." },
    { id: 11, sentence: "Beh ___ bo", options: ["sai", "tsi", "ai"], correctIndex: 0, meaning: "Cannot / not allowed." },
    { id: 12, sentence: "Ua ai ___", options: ["lua", "khi", "tsi"], correctIndex: 0, meaning: "I love." },
    { id: 13, sentence: "Ho ___ tsia", options: ["chiah", "khi", "ai"], correctIndex: 0, meaning: "Delicious." },
    { id: 14, sentence: "Boh ___, boh lui", options: ["eng", "sai", "ai"], correctIndex: 0, meaning: "No time, no money." },
    { id: 15, sentence: "Tua ___, sio nang", options: ["nang", "chiah", "ai"], correctIndex: 0, meaning: "Big person, small person." },
    { id: 16, sentence: "Gao ___, gao lat", options: ["lat", "khi", "tsia"], correctIndex: 0, meaning: "Very impressive, very powerful." },
    { id: 17, sentence: "Si ___ ?", options: ["boh", "hia", "khi"], correctIndex: 0, meaning: "Is it true?" },
    { id: 18, sentence: "Wa lau ___!", options: ["eh", "boh", "ho"], correctIndex: 0, meaning: "Oh my goodness!" },
    { id: 19, sentence: "Ka li ___", options: ["kong", "khi", "ai"], correctIndex: 0, meaning: "Let me tell you." },
    { id: 20, sentence: "___ lai tsi!", options: ["Kin", "Ho", "Wa"], correctIndex: 0, meaning: "Come quickly!" },
    { id: 21, sentence: "Wa ___ khi", options: ["ai", "bo", "lo"], correctIndex: 0, meaning: "I want to go." },
    { id: 22, sentence: "Bung ___ tsia", options: ["bo", "ai", "hia"], correctIndex: 1, meaning: "Don't want to eat." },
    { id: 23, sentence: "Chin ___ sian", options: ["sian", "gua", "khi"], correctIndex: 0, meaning: "Very bored." },
    { id: 24, sentence: "Tio ___ liao", options: ["liao", "boh", "ai"], correctIndex: 0, meaning: "Got it, that's right." },
    { id: 25, sentence: "Hia ___", options: ["di", "nang", "boh"], correctIndex: 0, meaning: "Brothers, buddies." },
    { id: 26, sentence: "Hor ___?", options: ["bo", "ai", "khi"], correctIndex: 0, meaning: "Is it good?" },
    { id: 27, sentence: "Eh ___, eh sai", options: ["sai", "bo", "lo"], correctIndex: 0, meaning: "Can, OK, possible." },
    { id: 28, sentence: "Chin gao ___, gao lat", options: ["lat", "boh", "ai"], correctIndex: 0, meaning: "Very impressive." },
    { id: 29, sentence: "Jip ___, chut khi", options: ["lai", "boh", "lo"], correctIndex: 0, meaning: "Come in, go out." },
    { id: 30, sentence: "Peng ___, peng an", options: ["an", "lai", "bo"], correctIndex: 0, meaning: "Peace, safe journey." }
  ],
  cantonese: [
    { id: 1, sentence: "Néih ___! Sihk jó faahn meih a?", options: ["hóu", "hoi", "gei"], correctIndex: 0, meaning: "Hello! Have you eaten?" },
    { id: 2, sentence: "Mh̀ ___, yiu ha gow", options: ["gōi", "sái", "ji"], correctIndex: 0, meaning: "Excuse me, I want har gow." },
    { id: 3, sentence: "Taai ___ laa!", options: ["gwai", "waan", "noi"], correctIndex: 0, meaning: "Too expensive!" },
    { id: 4, sentence: "Géi dō ___?", options: ["chin", "waan", "sihk"], correctIndex: 0, meaning: "How much money?" },
    { id: 5, sentence: "Deui mh ___", options: ["jyuh", "jan", "haak"], correctIndex: 0, meaning: "I'm sorry." },
    { id: 6, sentence: "Hóu noi móuh ___!", options: ["gin", "tai", "waan"], correctIndex: 0, meaning: "Long time no see!" },
    { id: 7, sentence: "Síu ___, jau che", options: ["sàm", "si", "boh"], correctIndex: 0, meaning: "Be careful, there's a car." },
    { id: 8, sentence: "Maan ___", options: ["on", "jau", "tai"], correctIndex: 0, meaning: "Good night." },
    { id: 9, sentence: "Faan uk ___", options: ["kéi", "tai", "waan"], correctIndex: 0, meaning: "Go home." },
    { id: 10, sentence: "Hóu ___", options: ["leng", "waan", "sihk"], correctIndex: 0, meaning: "Very beautiful." },
    { id: 11, sentence: "Mh̀ ___", options: ["haih", "sai", "gōi"], correctIndex: 0, meaning: "No / not right." },
    { id: 12, sentence: "Haih ___!", options: ["lā", "maa", "a"], correctIndex: 0, meaning: "Yes, that's right!" },
    { id: 13, sentence: "Hóu ___", options: ["sihk", "waan", "leng"], correctIndex: 0, meaning: "Delicious." },
    { id: 14, sentence: "Mh̀ sái, boh ___", options: ["man", "gau", "ti"], correctIndex: 2, meaning: "No need, not enough time." },
    { id: 15, sentence: "Dáng ___", options: ["háh", "maa", "lā"], correctIndex: 0, meaning: "Wait a moment." },
    { id: 16, sentence: "Faai ___ lā", options: ["dī", "doh", "maa"], correctIndex: 0, meaning: "Hurry up!" },
    { id: 17, sentence: "Ngóh hóu ___", options: ["hóu", "leng", "sihk"], correctIndex: 0, meaning: "I am very well." },
    { id: 18, sentence: "Jóu ___", options: ["san", "on", "tai"], correctIndex: 0, meaning: "Good morning." },
    { id: 19, sentence: "Géi ___ ngo?", options: ["doh", "saam", "tau"], correctIndex: 0, meaning: "How much, what is it?" },
    { id: 20, sentence: "___ jan", options: ["Deui", "Mh̀", "Haih"], correctIndex: 0, meaning: "Sorry." },
    { id: 21, sentence: "Síu ___, héi san la", options: ["sàm", "dī", "maa"], correctIndex: 0, meaning: "Be careful, wake up!" },
    { id: 22, sentence: "Mh̀ haih ___, haih lā", options: ["laa", "maa", "lā"], correctIndex: 2, meaning: "Not that, but this." },
    { id: 23, sentence: "Ngóh mh̀ ___", options: ["ji", "gōi", "haih"], correctIndex: 0, meaning: "I don't know." },
    { id: 24, sentence: "Móuh ___", options: ["man", "gau", "tai"], correctIndex: 0, meaning: "No problem." },
    { id: 25, sentence: "Taai ___ laa", options: ["maan", "gwai", "noi"], correctIndex: 1, meaning: "Too expensive!" },
    { id: 26, sentence: "Waih ___?", options: ["a", "maa", "lā"], correctIndex: 0, meaning: "Hello (on phone)?" },
    { id: 27, sentence: "Yiu ___ faahn", options: ["go", "doh", "saam"], correctIndex: 0, meaning: "Want a bowl of rice." },
    { id: 28, sentence: "Dō ___", options: ["jeh", "gōi", "haah"], correctIndex: 0, meaning: "Thank you." },
    { id: 29, sentence: "Gam ___", options: ["yaht", "on", "tai"], correctIndex: 0, meaning: "Today." },
    { id: 30, sentence: "Tìng ___ gin", options: ["yaht", "maa", "lā"], correctIndex: 0, meaning: "Tomorrow." }
  ],
  teochew: [
    { id: 1, sentence: "Lu ___! Ziah pa boih?", options: ["ho", "ai", "boh"], correctIndex: 0, meaning: "Hello! Have you eaten?" },
    { id: 2, sentence: "Zing ___ lor!", options: ["ho", "sian", "lui"], correctIndex: 0, meaning: "Very good then!" },
    { id: 3, sentence: "Dor ___ ah!", options: ["jia", "eng", "sai"], correctIndex: 0, meaning: "Thank you!" },
    { id: 4, sentence: "Wa m ___", options: ["bat", "ai", "ho"], correctIndex: 0, meaning: "I don't know." },
    { id: 5, sentence: "Boh ___ lah, busy", options: ["eng", "lui", "sai"], correctIndex: 0, meaning: "No time lah, busy." },
    { id: 6, sentence: "Sio ___, peng an!", options: ["sim", "nang", "lui"], correctIndex: 0, meaning: "Be careful, safe journey!" },
    { id: 7, sentence: "Ho ___ la!", options: ["jia", "lui", "sai"], correctIndex: 0, meaning: "Very delicious!" },
    { id: 8, sentence: "Eh ___, eh sai!", options: ["sai", "lui", "boh"], correctIndex: 0, meaning: "Can, it's OK!" },
    { id: 9, sentence: "Tng ___ lor", options: ["khi", "lai", "jia"], correctIndex: 0, meaning: "Return, go back." },
    { id: 10, sentence: "Hia ___", options: ["di", "nang", "boh"], correctIndex: 0, meaning: "Brothers, buddies." },
    { id: 11, sentence: "Hor ___?", options: ["bo", "ai", "sai"], correctIndex: 0, meaning: "Is it good?" },
    { id: 12, sentence: "Wa ai ___", options: ["khi", "bo", "li"], correctIndex: 0, meaning: "I want to go." },
    { id: 13, sentence: "Kin ___", options: ["lai", "bo", "jia"], correctIndex: 0, meaning: "Come quickly." },
    { id: 14, sentence: "Si ___?", options: ["boh", "ai", "lo"], correctIndex: 0, meaning: "Is that so?" },
    { id: 15, sentence: "Ka li ___", options: ["kong", "jia", "ai"], correctIndex: 0, meaning: "Let me tell you." },
    { id: 16, sentence: "Boh ___", options: ["lui", "eng", "sai"], correctIndex: 0, meaning: "No money." },
    { id: 17, sentence: "Chin ___", options: ["sian", "ho", "jia"], correctIndex: 0, meaning: "Very bored." },
    { id: 18, sentence: "Tio ___ liao", options: ["liao", "boh", "bo"], correctIndex: 0, meaning: "Got it, correct." },
    { id: 19, sentence: "Jip ___, chut khi", options: ["lai", "bo", "jia"], correctIndex: 0, meaning: "Come in, go out." },
    { id: 20, sentence: "Boh ___, boh lui", options: ["eng", "sai", "ai"], correctIndex: 0, meaning: "No time, no money." },
    { id: 21, sentence: "Tua ___, sio nang", options: ["nang", "bo", "jia"], correctIndex: 0, meaning: "Big person, small person." },
    { id: 22, sentence: "M sai ___ ki", options: ["ke", "lo", "boh"], correctIndex: 0, meaning: "You're welcome." },
    { id: 23, sentence: "Pai ___", options: ["seh", "jia", "bo"], correctIndex: 0, meaning: "Sorry, embarrassing." },
    { id: 24, sentence: "Ho ___", options: ["un", "jia", "bo"], correctIndex: 0, meaning: "Good luck." },
    { id: 25, sentence: "Hiam ___ ?", options: ["bo", "sai", "ai"], correctIndex: 0, meaning: "Is it spicy?" },
    { id: 26, sentence: "Ti ___ ?", options: ["bo", "sai", "ai"], correctIndex: 0, meaning: "Is it sweet?" },
    { id: 27, sentence: "Gao ___, gao lat", options: ["lat", "bo", "jia"], correctIndex: 0, meaning: "Very impressive." },
    { id: 28, sentence: "Chin ___ suia", options: ["sui", "jia", "bo"], correctIndex: 0, meaning: "Very beautiful." },
    { id: 29, sentence: "Zao ___ lor", options: ["khi", "lai", "bo"], correctIndex: 0, meaning: "Walk, go on foot." },
    { id: 30, sentence: "Lim ___ lah", options: ["jui", "bo", "sai"], correctIndex: 0, meaning: "Drink water." }
  ],
  hakka: [
    { id: 1, sentence: "Ngi ___! Ya fan liaw maa?", options: ["ho", "ai", "si"], correctIndex: 0, meaning: "Hello! Have you eaten?" },
    { id: 2, sentence: "Zo ___, a po!", options: ["san", "on", "hi"], correctIndex: 0, meaning: "Good morning, grandma!" },
    { id: 3, sentence: "Do ___ ah!", options: ["jia", "gong", "sim"], correctIndex: 0, meaning: "Thank you!" },
    { id: 4, sentence: "Chang ___! Ho shik!", options: ["ho", "sian", "sui"], correctIndex: 0, meaning: "Very good! Delicious!" },
    { id: 5, sentence: "Nga m ___", options: ["sik", "hi", "ai"], correctIndex: 0, meaning: "I don't know." },
    { id: 6, sentence: "Mo ___ lah", options: ["kung", "lui", "het"], correctIndex: 0, meaning: "No time lah." },
    { id: 7, sentence: "Sio ___, piang an!", options: ["sim", "ngin", "gong"], correctIndex: 0, meaning: "Be careful, safe journey!" },
    { id: 8, sentence: "Am ___, a po!", options: ["on", "san", "hi"], correctIndex: 0, meaning: "Good night, grandma!" },
    { id: 9, sentence: "Chut ___ lah", options: ["hi", "on", "san"], correctIndex: 0, meaning: "Go out." },
    { id: 10, sentence: "Fong ___", options: ["sim", "gong", "ngi"], correctIndex: 0, meaning: "Don't worry, relax." },
    { id: 11, sentence: "Mo ___", options: ["het", "kung", "lui"], correctIndex: 0, meaning: "Cannot, not possible." },
    { id: 12, sentence: "Si ___?", options: ["mo", "gong", "hi"], correctIndex: 0, meaning: "Is that so?" },
    { id: 13, sentence: "Ho ___", options: ["sik", "gong", "hi"], correctIndex: 0, meaning: "Delicious." },
    { id: 14, sentence: "Chang ___, Chang ngiat", options: ["ngiat", "ho", "sik"], correctIndex: 0, meaning: "Very hungry." },
    { id: 15, sentence: "Tai ___, sai ngin", options: ["ngin", "kung", "si"], correctIndex: 0, meaning: "Adult, child." },
    { id: 16, sentence: "Ka ngi ___", options: ["gong", "hi", "mo"], correctIndex: 0, meaning: "Let me tell you." },
    { id: 17, sentence: "Gim ___", options: ["si", "mo", "gong"], correctIndex: 0, meaning: "Nowadays." },
    { id: 18, sentence: "Hiung ___", options: ["ti", "gong", "mo"], correctIndex: 0, meaning: "Brothers, buddies." },
    { id: 19, sentence: "Nga ai ___", options: ["hi", "mo", "gong"], correctIndex: 0, meaning: "I want to go." },
    { id: 20, sentence: "___ san", options: ["Zo", "Am", "Chut"], correctIndex: 0, meaning: "Good morning." },
    { id: 21, sentence: "Den ___ lah", options: ["ha", "mo", "gong"], correctIndex: 0, meaning: "Wait a moment." },
    { id: 22, sentence: "M sai ___ ki", options: ["ke", "mo", "gong"], correctIndex: 0, meaning: "You're welcome." },
    { id: 23, sentence: "Pai ___", options: ["seh", "gong", "mo"], correctIndex: 0, meaning: "Sorry, embarrassing." },
    { id: 24, sentence: "Ho ___", options: ["un", "gong", "mo"], correctIndex: 0, meaning: "Good luck." },
    { id: 25, sentence: "Piang ___, piang an", options: ["an", "sim", "gong"], correctIndex: 0, meaning: "Safe journey." },
    { id: 26, sentence: "Chang ___ suia", options: ["sui", "gong", "mo"], correctIndex: 0, meaning: "Very beautiful." },
    { id: 27, sentence: "Gao ___, gao lat", options: ["lat", "gong", "mo"], correctIndex: 0, meaning: "Very impressive." },
    { id: 28, sentence: "Mo ___, mo het", options: ["het", "gong", "si"], correctIndex: 0, meaning: "Cannot, not possible." },
    { id: 29, sentence: "Jip ___, chut hi", options: ["lai", "mo", "gong"], correctIndex: 0, meaning: "Come in, go out." },
    { id: 30, sentence: "Ya ___ maa?", options: ["fan", "gong", "mo"], correctIndex: 0, meaning: "Have you eaten?" }
  ],
  hainanese: [
    { id: 1, sentence: "Nee ___! Chiak boh?", options: ["hoh", "ai", "beh"], correctIndex: 0, meaning: "Hello! Have you eaten?" },
    { id: 2, sentence: "Zin ___ lor!", options: ["ho", "sian", "lui"], correctIndex: 0, meaning: "Very good then!" },
    { id: 3, sentence: "Doh ___ ah!", options: ["jiah", "eng", "sai"], correctIndex: 0, meaning: "Thank you!" },
    { id: 4, sentence: "Wa m ___", options: ["bat", "ai", "ho"], correctIndex: 0, meaning: "I don't know." },
    { id: 5, sentence: "Boh ___ gam jit", options: ["eng", "lui", "sai"], correctIndex: 0, meaning: "No time today." },
    { id: 6, sentence: "Sio ___, ho un!", options: ["sim", "nang", "lui"], correctIndex: 0, meaning: "Be careful, good luck!" },
    { id: 7, sentence: "Ho ___ la!", options: ["jia", "lui", "sai"], correctIndex: 0, meaning: "Very delicious!" },
    { id: 8, sentence: "Boh man ___, can!", options: ["tai", "eng", "lui"], correctIndex: 0, meaning: "No problem, can!" },
    { id: 9, sentence: "Hi ___ lor", options: ["khi", "lai", "jia"], correctIndex: 0, meaning: "Go back." },
    { id: 10, sentence: "Zao ___ gam jit", options: ["khi", "lai", "jia"], correctIndex: 0, meaning: "Go today." },
    { id: 11, sentence: "Ho ___?", options: ["bo", "ai", "sai"], correctIndex: 0, meaning: "Is it good?" },
    { id: 12, sentence: "Wa ai ___", options: ["hi", "bo", "li"], correctIndex: 0, meaning: "I want to go." },
    { id: 13, sentence: "Kin ___", options: ["lai", "bo", "jia"], correctIndex: 0, meaning: "Come quickly." },
    { id: 14, sentence: "Si ___?", options: ["boh", "ai", "lo"], correctIndex: 0, meaning: "Is that so?" },
    { id: 15, sentence: "Ka li ___", options: ["kong", "jia", "ai"], correctIndex: 0, meaning: "Let me tell you." },
    { id: 16, sentence: "Boh ___", options: ["lui", "eng", "sai"], correctIndex: 0, meaning: "No money." },
    { id: 17, sentence: "Chin ___", options: ["sian", "ho", "jia"], correctIndex: 0, meaning: "Very bored." },
    { id: 18, sentence: "Tio ___ liao", options: ["liao", "boh", "bo"], correctIndex: 0, meaning: "Got it, correct." },
    { id: 19, sentence: "Jip ___, chut khi", options: ["lai", "bo", "jia"], correctIndex: 0, meaning: "Come in, go out." },
    { id: 20, sentence: "Boh ___, boh lui", options: ["eng", "sai", "ai"], correctIndex: 0, meaning: "No time, no money." },
    { id: 21, sentence: "Nang ___ nang", options: ["lua", "bo", "jia"], correctIndex: 0, meaning: "Two people." },
    { id: 22, sentence: "M sai ___ ki", options: ["ke", "lo", "boh"], correctIndex: 0, meaning: "You're welcome." },
    { id: 23, sentence: "Pai ___", options: ["seh", "jia", "bo"], correctIndex: 0, meaning: "Sorry, embarrassing." },
    { id: 24, sentence: "Ho ___", options: ["un", "jia", "bo"], correctIndex: 0, meaning: "Good luck." },
    { id: 25, sentence: "Hiam ___ ?", options: ["bo", "sai", "ai"], correctIndex: 0, meaning: "Is it spicy?" },
    { id: 26, sentence: "Ti ___ ?", options: ["bo", "sai", "ai"], correctIndex: 0, meaning: "Is it sweet?" },
    { id: 27, sentence: "Gao ___, gao lat", options: ["lat", "bo", "jia"], correctIndex: 0, meaning: "Very impressive." },
    { id: 28, sentence: "Chin ___ suia", options: ["sui", "jia", "bo"], correctIndex: 0, meaning: "Very beautiful." },
    { id: 29, sentence: "Zao ___ lor", options: ["khi", "lai", "bo"], correctIndex: 0, meaning: "Walk, go on foot." },
    { id: 30, sentence: "Lim ___ lah", options: ["jui", "bo", "sai"], correctIndex: 0, meaning: "Drink water." }
  ]
};

const categories = [
  { id: "greetings", label: "Greetings", icon: "👋" },
  { id: "numbers", label: "Numbers", icon: "🔢" },
  { id: "food", label: "Food", icon: "🍜" },
];

export default function DialectPlatform() {
  const [screen, setScreen] = useState("home"); // home | dialect | lesson | quiz
  const [selectedDialect, setSelectedDialect] = useState(null);
  const [lessonMode, setLessonMode] = useState("flashcards"); // flashcards | situational-quiz | completing-sentence
  const [selectedCategory, setSelectedCategory] = useState("greetings");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [situationalQuizIndex, setSituationalQuizIndex] = useState(0);
  const [situationalCueIndex, setSituationalCueIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizState, setQuizState] = useState({ q: 0, score: 0, answered: null, done: false });
  const [progress, setProgress] = useState({});
  const [networkTab, setNetworkTab] = useState("community");
  const [sinSehTab, setSinSehTab] = useState("mentors");
  const [disMode, setDisMode] = useState("cards"); // cards | search
  const [disSearch, setDisSearch] = useState("");
  const [disFilter, setDisFilter] = useState("All");
  const [disCard, setDisCard] = useState(0);
  const [disFlipped, setDisFlipped] = useState(false);
  const [disExpanded, setDisExpanded] = useState(null);
  const [networkFilter, setNetworkFilter] = useState("All");
  const [applyModal, setApplyModal] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: "", age: "", dialect: "Hokkien", location: "", message: "" });
  const [mentorForm, setMentorForm] = useState({ name: "", age: "", dialect: "Hokkien", location: "", experience: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);
  const [mentorSubmitted, setMentorSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [connectRequests, setConnectRequests] = useState([]);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", age: "", occupation: "", email: "", languageInterest: "Hokkien", role: "mentee" });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [pendingGoogle, setPendingGoogle] = useState(null); // { credential, googleData } when new Google user needs to complete profile
  const [authError, setAuthError] = useState(null);
  const [situationalScore, setSituationalScore] = useState(0);
  const [sentenceScore, setSentenceScore] = useState(0);
  const [knownCards, setKnownCards] = useState({});
  const [completionData, setCompletionData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebouncedQuery, setSearchDebouncedQuery] = useState("");
  const [searchDialects, setSearchDialects] = useState(["hokkien","cantonese","teochew","hakka","hainanese"]);
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchDifficulty, setSearchDifficulty] = useState("all");
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchSort, setSearchSort] = useState("relevance");
  const [apiWords, setApiWords] = useState([]);

  const dialect = dialects.find(d => d.id === selectedDialect);

  function restoreProgress(p) {
    if (!p || typeof p !== 'object') return;
    if (p.lastDialect) {
      setSelectedDialect(p.lastDialect);
      setScreen("lesson");
    }
    if (p.lastCategory) setSelectedCategory(p.lastCategory);
    if (p.lessonMode) setLessonMode(p.lessonMode);
    if (p.cardIndex != null) setCardIndex(p.cardIndex);
    if (p.knownCards) setKnownCards(p.knownCards);
    if (p.completedCategories) setProgress(p.completedCategories);
    if (p.situationalQuizIndex != null) setSituationalQuizIndex(p.situationalQuizIndex);
    if (p.situationalCueIndex != null) setSituationalCueIndex(p.situationalCueIndex);
    if (p.situationalScore != null) setSituationalScore(p.situationalScore);
    if (p.sentenceIndex != null) setSentenceIndex(p.sentenceIndex);
    if (p.sentenceScore != null) setSentenceScore(p.sentenceScore);
  }

  function completeProfile() {
    if (!pendingGoogle) return;
    const { age, occupation, languageInterest, role } = profileForm;
    setAuthError(null);
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: pendingGoogle.credential,
        profileData: { age, occupation, languageInterest, role },
      }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.user) {
          setAuthError(data.detail || data.error || 'Failed to complete profile');
          return;
        }
        localStorage.setItem('auth_token', data.token);
        setCurrentUser(data.user);
        setRegisteredUsers(prev => prev.some(u => u.id === data.user.id) ? prev : [...prev, data.user]);
        setPendingGoogle(null);
        setScreen('network');
      })
      .catch(err => {
        console.error('Failed to complete profile:', err);
        setAuthError('Network error');
      });
  }

  function switchUser(user) {
    setCurrentUser(user);
  }

  function applySinSeh() {
    if (!currentUser) return;
    const updated = { ...currentUser, sinSehApplied: true };
    setCurrentUser(updated);
    setRegisteredUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  }

  function sendConnectRequest(targetUserId) {
    if (!currentUser || currentUser.id === targetUserId) return;
    setConnectRequests(prev => {
      if (prev.some(r => r.from === currentUser.id && r.to === targetUserId)) return prev;
      return [...prev, { from: currentUser.id, to: targetUserId }];
    });
  }

  function hasSentRequest(targetUserId) {
    return connectRequests.some(r => r.from === currentUser?.id && r.to === targetUserId);
  }

  function isMutualMatch(targetUserId) {
    return hasSentRequest(targetUserId) &&
      connectRequests.some(r => r.from === targetUserId && r.to === currentUser?.id);
  }

  function handleGoogleSuccess(credentialResponse) {
    const credential = credentialResponse.credential;
    setAuthError(null);
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setAuthError(data.detail || data.error || 'Google sign-in failed');
          return;
        }
        if (data.needsProfile) {
          setPendingGoogle({ credential, googleData: data.googleData });
          setProfileForm(f => ({
            ...f,
            firstName: data.googleData.firstName || '',
            lastName: data.googleData.lastName || '',
            email: data.googleData.email || '',
          }));
          setScreen('profile');
          return;
        }
        if (data.user) {
          localStorage.setItem('auth_token', data.token);
          setCurrentUser(data.user);
          restoreProgress(data.user.progress);
          setRegisteredUsers(prev => prev.some(u => u.id === data.user.id) ? prev : [...prev, data.user]);
          setScreen('network');
        }
      })
      .catch(err => {
        console.error('Google auth failed:', err);
        setAuthError('Google sign-in failed');
      });
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setProfileEditMode(false);
    setPendingGoogle(null);
    setAuthError(null);
  }

  useEffect(() => {
    const t = setTimeout(() => setSearchDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { setSearchPage(1); }, [searchDebouncedQuery, searchDialects, searchCategory, searchDifficulty, searchSort]);

  useEffect(() => {
    fetch("/dictionary.json")
      .then(r => r.json())
      .then(data => setApiWords(data.words || []))
      .catch(() => {});

    fetch("/api/users/profiles")
      .then(r => r.json())
      .then(users => setRegisteredUsers(users))
      .catch(err => console.error('Failed to load profiles:', err));

    // Restore session from stored token
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
            restoreProgress(data.user.progress);
          } else {
            localStorage.removeItem('auth_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Debounced save of learning progress to backend
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const tid = setTimeout(() => {
      fetch('/api/users/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lastDialect: selectedDialect,
          lastCategory: selectedCategory,
          lessonMode,
          cardIndex,
          knownCards,
          completedCategories: progress,
          situationalQuizIndex,
          situationalCueIndex,
          situationalScore,
          sentenceIndex,
          sentenceScore,
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(tid);
  }, [knownCards, progress, cardIndex, selectedDialect, selectedCategory, lessonMode,
      situationalQuizIndex, situationalCueIndex, situationalScore,
      sentenceIndex, sentenceScore, currentUser]);

  const toCard = w => ({ phrase: w.headword?.romanized || "", chinese: w.headword?.traditional || "", meaning: w.definitions?.[0]?.english || "", romanisation: w.headword?.romanized || "" });
  const apiForCategory = selectedDialect ? apiWords.filter(w => w.dialect === selectedDialect && (w.tags?.[0] || "other") === selectedCategory).map(toCard) : [];
  const cards = [...(selectedDialect && lessons[selectedDialect]?.[selectedCategory] || []), ...apiForCategory];

  function selectDialect(id) {
    if (id !== selectedDialect) {
      setSelectedCategory("greetings");
      setCardIndex(0);
    }
    setSelectedDialect(id);
    setFlipped(false);
    setScreen("lesson");
  }

  function nextCard() {
    setFlipped(false);
    setTimeout(() => {
      if (cardIndex < cards.length - 1) setCardIndex(cardIndex + 1);
      else {
        const key = `${selectedDialect}-${selectedCategory}`;
        setProgress(p => ({ ...p, [key]: true }));
        setCardIndex(0);
      }
    }, 150);
  }

  function prevCard() {
    setFlipped(false);
    setTimeout(() => setCardIndex(Math.max(0, cardIndex - 1)), 150);
  }

  function startQuiz() {
    const allPhrases = Object.values(lessons[selectedDialect]).flat();
    setQuizState({ questions: allPhrases.sort(() => Math.random() - 0.5).slice(0, 5), q: 0, score: 0, answered: null, done: false });
    setScreen("quiz");
  }

  function answerQuiz(choice) {
    const q = quizState.questions[quizState.q];
    const correct = choice === q.meaning;
    const newScore = correct ? quizState.score + 1 : quizState.score;
    setQuizState(s => ({ ...s, answered: choice, score: newScore }));
    setTimeout(() => {
      if (quizState.q + 1 >= quizState.questions.length) {
        setQuizState(s => ({ ...s, done: true, score: newScore }));
      } else {
        setQuizState(s => ({ ...s, q: s.q + 1, answered: null }));
      }
    }, 1000);
  }

  function getQuizOptions(q) {
    const allMeanings = Object.values(lessons[selectedDialect]).flat().map(p => p.meaning);
    const wrong = allMeanings.filter(m => m !== q.meaning).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, q.meaning].sort(() => Math.random() - 0.5);
  }

  const totalProgress = Object.keys(progress).filter(k => k.startsWith(selectedDialect || "")).length;

  // Build flat, searchable phrase database across all dialects
  const difficultyMap = { greetings: "beginner", food: "intermediate", numbers: "advanced" };
  const allPhrases = [];
  for (const [dialectId, dialectData] of Object.entries(lessons)) {
    const dialectInfo = dialects.find(d => d.id === dialectId);
    for (const [category, phrases] of Object.entries(dialectData)) {
      for (const p of phrases) {
        allPhrases.push({
          ...p,
          dialect: dialectId,
          dialectName: dialectInfo?.name || dialectId,
          dialectColor: dialectInfo?.color || "#666",
          dialectIcon: dialectInfo?.icon || "",
          category,
          difficulty: difficultyMap[category] || "beginner",
        });
      }
    }
  }
  for (const word of apiWords) {
    const dialectInfo = dialects.find(d => d.id === word.dialect);
    const cat = word.tags?.[0] || "other";
    allPhrases.push({
      phrase: word.headword?.romanized || "",
      chinese: word.headword?.traditional || "",
      meaning: word.definitions?.[0]?.english || "",
      romanisation: word.headword?.romanized || "",
      dialect: word.dialect,
      dialectName: dialectInfo?.name || word.dialect,
      dialectColor: dialectInfo?.color || "#666",
      dialectIcon: dialectInfo?.icon || "",
      category: cat,
      difficulty: difficultyMap[cat] || "beginner",
    });
  }
  const q = searchDebouncedQuery.toLowerCase().trim();
  let filteredPhrases = allPhrases.filter(p => {
    if (!searchDialects.includes(p.dialect)) return false;
    if (searchCategory !== "all" && p.category !== searchCategory) return false;
    if (searchDifficulty !== "all" && p.difficulty !== searchDifficulty) return false;
    if (!q) return true;
    return (
      p.meaning.toLowerCase().includes(q) ||
      p.romanisation.toLowerCase().includes(q) ||
      p.chinese.includes(q) ||
      p.phrase.toLowerCase().includes(q)
    );
  });

  if (searchSort === "a-z") filteredPhrases.sort((a, b) => a.phrase.localeCompare(b.phrase));
  else if (searchSort === "z-a") filteredPhrases.sort((a, b) => b.phrase.localeCompare(a.phrase));
  else if (searchSort === "frequency") filteredPhrases.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#FAF6F0", color: "#1A1208" }}>
      <style>{`
        .card-3d { perspective: 1000px; }
        .card-inner { transition: transform 0.6s cubic-bezier(.4,2,.6,1); transform-style: preserve-3d; position: relative; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 20px; }
        .card-back { transform: rotateY(180deg); }
        .btn-hover { transition: all 0.2s; cursor: pointer; }
        .btn-hover:hover { transform: translateY(-2px); }
        .dialect-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; }
        .dialect-card { transition: all 0.3s cubic-bezier(.4,2,.6,1); cursor: pointer; }
        .tab-btn { transition: all 0.2s; cursor: pointer; border: none; font-family: inherit; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 2s infinite; background-size: 200% 100%; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .progress-bar { height: 6px; border-radius: 3px; background: #E8DDD0; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
        .search-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; align-items: start; }
        .search-results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .search-filter-panel { position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto; }
        .search-input:focus { border-color: #C0392B !important; box-shadow: 0 0 0 3px rgba(192,57,43,0.12); }
        .result-card:hover { border-color: #C0B09A !important; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#1A1208", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "3px solid #C0392B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setScreen("home")}>
          <span style={{ fontSize: 28 }}>🏮</span>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#F5E6C8", letterSpacing: 1 }}>tiagong.sg</div>
            <div style={{ fontSize: 10, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase" }}>Dialect Heritage SG</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#F5E6C8", fontSize: 13 }}>
              <span>{currentUser.firstName}</span>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: "7px 14px", fontSize: 12 }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => { setScreen("profile"); setMobileMenuOpen(false); }} className="btn-primary" style={{ padding: "7px 14px", fontSize: 12 }}>
              Sign In
            </button>
          )}
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
        <div className={`nav-links${mobileMenuOpen ? " open" : ""}`}>
          {[["home","Learn"],["search","Search"],["singlish","DialectsInSinglish"],["network","Network"],["associations","Associations"],["about","About"],["profile","Profile"]].map(([s,label]) => (
            <span key={s} className="nav-link" onClick={() => { setScreen(s); setMobileMenuOpen(false); }} style={{ color: screen === s ? "#F5E6C8" : "#8B7355", fontSize: 14, letterSpacing: 1 }}>
              {label}{s === "profile" && currentUser ? ` (${currentUser.firstName})` : ""}
            </span>
          ))}
          {selectedDialect && <span onClick={() => { setScreen("lesson"); setMobileMenuOpen(false); }} className="nav-link" style={{ color: "#C0392B", fontSize: 14, fontStyle: "italic" }}>{dialect?.name} ›</span>}
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div>
          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1810 50%, #3D1F10 100%)", padding: "80px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(192,57,43,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,134,11,0.1) 0%, transparent 50%)" }} />
            <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }} className="fade-up">
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏮 🎋 🍵</div>
              <h1 className="hero-heading" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#F5E6C8", lineHeight: 1.1, marginBottom: 16 }}>
                Preserve Our<br /><em style={{ color: "#C0392B" }}>Dialect Heritage</em>
              </h1>
              <p className="hero-subtext" style={{ color: "#A08060", lineHeight: 1.7, marginBottom: 8 }}>
                Singapore's Chinese dialects — Hokkien, Cantonese, Teochew, Hakka, Hainanese — are living bridges to our ancestors.
              </p>
              <p style={{ color: "#7A6040", fontSize: 14, marginBottom: 40, fontStyle: "italic" }}>
                每一句方言，都是一条连接过去的线。 · Every dialect phrase is a thread connecting us to our past.
              </p>
              <button className="btn-primary" onClick={() => document.getElementById("dialects").scrollIntoView({ behavior: "smooth" })} style={{ fontSize: 16, letterSpacing: 1 }}>
                Start Learning →
              </button>
            </div>
          </div>

          {/* Dialect Cards */}
          <div id="dialects" style={{ padding: "64px 32px", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Choose Your Dialect</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: "#1A1208" }}>Which dialect calls to you?</h2>
            </div>
            <div className="dialect-grid">
              {dialects.map((d, i) => {
                const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
                return (
                  <div key={d.id} className="dialect-card" onClick={() => selectDialect(d.id)}
                    style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: `1px solid ${d.color}22`, animationDelay: `${i * 0.08}s`, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 16, display: "flex", justifyContent: "center" }}>{d.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 22, color: d.color, marginBottom: 12, fontFamily: "'Noto Serif SC', serif" }}>{d.chinese}</div>
                    <p style={{ fontSize: 14, color: "#6B5B45", lineHeight: 1.6, marginBottom: 16 }}>{d.description}</p>
                    <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 8 }}>📍 {d.origin}</div>
                    <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 16 }}>👥 {d.speakers}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(dialectProgress / 3) * 100}%`, background: d.color }} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <span style={{ color: d.color, fontSize: 14, fontStyle: "italic" }}>Begin learning →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LESSON */}
      {screen === "lesson" && dialect && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

          {/* Dialect Header — compact */}
          <div style={{ background: `linear-gradient(135deg, ${dialect.color}18, ${dialect.color}08)`, border: `1.5px solid ${dialect.color}30`, borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 40 }}>{dialect.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#1A1208" }}>{dialect.name}</div>
              <div style={{ fontSize: 18, color: dialect.color, fontFamily: "'Noto Serif SC', serif" }}>{dialect.chinese}</div>
            </div>
            <button className="btn-secondary" onClick={() => setScreen("home")} style={{ fontSize: 13, padding: "8px 16px" }}>
              ← Back
            </button>
          </div>

          {/* Mode Selector — card grid */}
          <div className="mode-grid" style={{ marginBottom: 32 }}>
            {[
              { mode: "flashcards", icon: "📇", label: "Flashcards", desc: "Tap to flip & learn" },
              { mode: "situational-quiz", icon: "🎭", label: "Story Quiz", desc: "Real-life scenarios" },
              { mode: "completing-sentence", icon: "✏️", label: "Fill in Blank", desc: "Complete sentences" }
            ].map(({ mode, icon, label, desc }) => (
              <button key={mode} className="tab-btn" onClick={() => {
                setLessonMode(mode);
                setCardIndex(0); setSituationalQuizIndex(0); setSituationalCueIndex(0); setSentenceIndex(0);
                setSelectedAnswer(null); setQuizShowResult(false);
                setSituationalScore(0); setSentenceScore(0); setCompletionData(null);
              }} style={{
                padding: "14px 10px", borderRadius: 14,
                background: lessonMode === mode ? dialect.color : "white",
                color: lessonMode === mode ? "white" : "#6B5B45",
                border: `2px solid ${lessonMode === mode ? dialect.color : "#E8DDD0"}`,
                textAlign: "center", boxShadow: lessonMode === mode ? `0 4px 16px ${dialect.color}40` : "none"
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{desc}</div>
              </button>
            ))}
          </div>

          {/* ─── FLASHCARDS ─── */}
          {lessonMode === "flashcards" && (
            <div>
              {/* Category tabs — includes API-sourced categories */}
              {(() => {
                const capitalize = s => s.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
                const apiCatIcons = { family:"👨‍👩‍👧", body:"🫀", daily_life:"🏠", emotions:"😊", travel:"✈️", time:"🕐", hawker:"🍲", hawker_culture:"🍲", profession:"💼", place:"🏙️", animal:"🐾", beverage:"🧋", language:"📖", other:"📖" };
                const apiOnlyCats = [...new Set(apiWords.filter(w => w.dialect === selectedDialect).map(w => w.tags?.[0] || "other"))].filter(c => !categories.find(x => x.id === c)).map(c => ({ id: c, label: capitalize(c), icon: apiCatIcons[c] || "📖" }));
                const allCats = [...categories, ...apiOnlyCats];
                return (
                  <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                    {allCats.map(cat => {
                      const key = `${selectedDialect}-${cat.id}`;
                      const done = progress[key];
                      const knownCount = Object.keys(knownCards).filter(k => k.startsWith(`${selectedDialect}-${cat.id}-`)).length;
                      const staticCount = lessons[selectedDialect]?.[cat.id]?.length || 0;
                      const apiCount = apiWords.filter(w => w.dialect === selectedDialect && (w.tags?.[0] || "other") === cat.id).length;
                      const total = staticCount + apiCount;
                      return (
                        <button key={cat.id} className="tab-btn" onClick={() => { setSelectedCategory(cat.id); setCardIndex(0); setFlipped(false); }}
                          style={{ flex: "0 0 auto", padding: "10px 12px", borderRadius: 12, background: selectedCategory === cat.id ? dialect.color : "white", color: selectedCategory === cat.id ? "white" : "#1A1208", fontSize: 12, fontWeight: 600, border: `2px solid ${selectedCategory === cat.id ? dialect.color : "#E8DDD0"}`, whiteSpace: "nowrap" }}>
                          <div>{cat.icon} {cat.label}</div>
                          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{knownCount}/{total} known {done ? "✓" : ""}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}


              {/* Progress bar */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#8B7355" }}>
                <span>Card {cardIndex + 1} / {cards.length}</span>
                <span style={{ color: dialect.color, fontWeight: 600 }}>
                  {Object.keys(knownCards).filter(k => k.startsWith(`${selectedDialect}-${selectedCategory}-`)).length} known
                </span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 24 }}>
                <div className="progress-fill" style={{ width: `${((cardIndex + 1) / cards.length) * 100}%`, background: dialect.color }} />
              </div>

              {/* Flashcard */}
              <div className="card-3d flashcard" style={{ marginBottom: 20 }} onClick={() => setFlipped(!flipped)}>
                <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
                  <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 14 }}>Tap to reveal meaning</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>
                      {cards[cardIndex]?.phrase}
                    </div>
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                      {cards[cardIndex]?.chinese}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, fontStyle: "italic" }}>
                      /{cards[cardIndex]?.romanisation}/
                    </div>
                  </div>
                  <div className="card-face card-back" style={{ background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: `3px solid ${dialect.color}`, borderRadius: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#9B8B75", textTransform: "uppercase", marginBottom: 14 }}>Meaning</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1A1208", textAlign: "center", padding: "0 24px" }}>
                      {cards[cardIndex]?.meaning}
                    </div>
                    <div style={{ fontSize: 13, color: dialect.color, marginTop: 12, fontWeight: 600 }}>
                      {cards[cardIndex]?.romanisation}
                    </div>
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 20, color: "#8B7355", marginTop: 6 }}>
                      {cards[cardIndex]?.chinese}
                    </div>
                  </div>
                </div>
              </div>

              {/* Know it / Still learning + nav */}
              {flipped ? (
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <button className="btn-hover" onClick={() => {
                    const key = `${selectedDialect}-${selectedCategory}-${cardIndex}`;
                    setKnownCards(prev => { const n = { ...prev }; delete n[key]; return n; });
                    setFlipped(false);
                    setTimeout(() => setCardIndex(c => Math.max(0, c - 1)), 150);
                  }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
                    ↺ Review Again
                  </button>
                  <button className="btn-hover" onClick={() => {
                    const key = `${selectedDialect}-${selectedCategory}-${cardIndex}`;
                    setKnownCards(prev => ({ ...prev, [key]: true }));
                    setFlipped(false);
                    setTimeout(() => {
                      if (cardIndex < cards.length - 1) {
                        setCardIndex(c => c + 1);
                      } else {
                        setProgress(p => ({ ...p, [`${selectedDialect}-${selectedCategory}`]: true }));
                        setCardIndex(0);
                      }
                    }, 150);
                  }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
                    ✓ Know it!
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <button className="btn-hover" onClick={prevCard} disabled={cardIndex === 0}
                    style={{ flex: 1, padding: "13px", background: cardIndex === 0 ? "#F0EBE3" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 14, cursor: cardIndex === 0 ? "default" : "pointer", color: cardIndex === 0 ? "#C0B0A0" : "#1A1208", fontFamily: "inherit" }}>
                    ← Prev
                  </button>
                  <button className="btn-hover" onClick={nextCard}
                    style={{ flex: 2, padding: "13px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {cardIndex < cards.length - 1 ? "Next →" : "↺ Restart"}
                  </button>
                </div>
              )}

              {/* Bottom CTA */}
              <div style={{ background: "#1A1208", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ color: "#F5E6C8", fontSize: 15, fontFamily: "'Cormorant Garamond', serif" }}>Ready for a challenge?</div>
                  <div style={{ color: "#6B5B45", fontSize: 12, marginTop: 2 }}>Test yourself with story scenarios</div>
                </div>
                <button className="btn-hover" onClick={() => { setLessonMode("situational-quiz"); setSituationalScore(0); setCompletionData(null); }}
                  style={{ background: dialect.color, color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Try Story Quiz →
                </button>
              </div>
            </div>
          )}

          {/* ─── SITUATIONAL QUIZ ─── */}
          {lessonMode === "situational-quiz" && (
            <div>
              {(() => {
                const quizzes = situationalQuizzes[selectedDialect] || [];
                if (quizzes.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No quizzes available for this dialect yet.</div>;
                const quiz = quizzes[situationalQuizIndex];
                const totalScenes = quiz.cues.length;

                // Completion screen
                if (completionData?.mode === "situational-quiz") {
                  const pct = Math.round((completionData.score / completionData.total) * 100);
                  const grade = pct >= 80 ? { label: "Excellent!", color: "#1A6B3C", bg: "#EAFAF1", icon: "🏆" }
                    : pct >= 60 ? { label: "Good job!", color: "#8E44AD", bg: "#F5EEF8", icon: "⭐" }
                    : { label: "Keep practising!", color: "#E67E22", bg: "#FEF9E7", icon: "💪" };
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ fontSize: 64, marginBottom: 16 }}>{grade.icon}</div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Story Complete!</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32 }}>{quiz.title}</p>
                      <div style={{ background: grade.bg, border: `2px solid ${grade.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32 }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, fontFamily: "'Cormorant Garamond', serif" }}>{completionData.score}<span style={{ fontSize: 28 }}>/{completionData.total}</span></div>
                        <div style={{ fontSize: 20, color: grade.color, fontWeight: 700, marginTop: 4 }}>{grade.label}</div>
                        <div style={{ fontSize: 14, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button className="btn-hover" onClick={() => {
                          setSituationalQuizIndex(0); setSituationalCueIndex(0); setSelectedAnswer(null);
                          setQuizShowResult(false); setSituationalScore(0); setCompletionData(null);
                        }} style={{ padding: "12px 24px", background: "white", border: `2px solid ${dialect.color}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: dialect.color, cursor: "pointer", fontFamily: "inherit" }}>
                          ↺ Try Again
                        </button>
                        <button className="btn-hover" onClick={() => { setLessonMode("completing-sentence"); setSentenceScore(0); setCompletionData(null); }}
                          style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Try Fill in Blank →
                        </button>
                      </div>
                    </div>
                  );
                }

                const cue = quiz.cues[situationalCueIndex];
                return (
                  <div>
                    {/* Header: score + progress */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: "#6B5B45" }}>
                        <span style={{ fontWeight: 700, color: "#1A1208" }}>{quiz.title}</span>
                      </div>
                      <div style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: dialect.color }}>
                        {situationalScore} / {situationalCueIndex} ✓
                      </div>
                    </div>

                    {/* Scene progress dots */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 24, alignItems: "center" }}>
                      {quiz.cues.map((_, i) => (
                        <div key={i} style={{
                          flex: i === situationalCueIndex ? 3 : 1,
                          height: 8, borderRadius: 4,
                          background: i < situationalCueIndex ? dialect.color : i === situationalCueIndex ? dialect.color : "#E8DDD0",
                          opacity: i < situationalCueIndex ? 0.45 : 1,
                          transition: "all 0.35s ease"
                        }} />
                      ))}
                    </div>

                    {/* Scene badge + context */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${dialect.color}15`, border: `1.5px solid ${dialect.color}35`, borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: dialect.color, textTransform: "uppercase", letterSpacing: 1 }}>Scene {situationalCueIndex + 1} of {totalScenes}</span>
                      </div>
                      <div style={{ background: "#F9F5EE", borderRadius: 14, padding: "18px 20px", border: `2px solid ${dialect.color}25` }}>
                        <div style={{ fontSize: 12, color: "#9B8B75", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>💬 WHAT WOULD YOU SAY?</div>
                        <div style={{ fontSize: 15, color: "#1A1208", lineHeight: 1.6 }}>{cue.context}</div>
                      </div>
                    </div>

                    {/* Result feedback banner */}
                    {quizShowResult && (
                      <div style={{
                        background: cue.dialogues[selectedAnswer]?.correct ? "#EAFAF1" : "#FDEDEC",
                        border: `2px solid ${cue.dialogues[selectedAnswer]?.correct ? "#27AE60" : "#E74C3C"}`,
                        borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10
                      }}>
                        <span style={{ fontSize: 22 }}>{cue.dialogues[selectedAnswer]?.correct ? "✅" : "❌"}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: cue.dialogues[selectedAnswer]?.correct ? "#1A6B3C" : "#C0392B" }}>
                            {cue.dialogues[selectedAnswer]?.correct ? "Correct!" : "Not quite."}
                          </div>
                          {!cue.dialogues[selectedAnswer]?.correct && (
                            <div style={{ fontSize: 12, color: "#6B5B45", marginTop: 2 }}>
                              Correct: <strong>{cue.dialogues.find(d => d.correct)?.phrase}</strong> — "{cue.dialogues.find(d => d.correct)?.meaning}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dialogue options */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                      {cue.dialogues.map((dialogue, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = dialogue.correct;
                        let bg = "white", border = "#E8DDD0", color = "#1A1208", shadow = "none";
                        if (!quizShowResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
                        if (quizShowResult) {
                          if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                          else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                        }
                        return (
                          <button key={idx} className="btn-hover" onClick={() => !quizShowResult && setSelectedAnswer(idx)}
                            style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 14, cursor: quizShowResult ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s", boxShadow: shadow }}>
                            <div style={{ fontWeight: 700, marginBottom: 3 }}>{dialogue.phrase}</div>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>"{dialogue.meaning}"</div>
                            {quizShowResult && isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✓</span>}
                            {quizShowResult && isSelected && !isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action button */}
                    {!quizShowResult ? (
                      <button className="btn-hover" onClick={() => {
                        const correct = cue.dialogues[selectedAnswer]?.correct;
                        if (correct) setSituationalScore(s => s + 1);
                        setQuizShowResult(true);
                      }} disabled={selectedAnswer === null}
                        style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
                        Check Answer
                      </button>
                    ) : (
                      <button className="btn-hover" onClick={() => {
                        const isLastCue = situationalCueIndex >= quiz.cues.length - 1;
                        const isLastScenario = situationalQuizIndex >= quizzes.length - 1;
                        if (!isLastCue) {
                          setSituationalCueIndex(c => c + 1);
                          setSelectedAnswer(null); setQuizShowResult(false);
                        } else if (!isLastScenario) {
                          setSituationalQuizIndex(i => i + 1);
                          setSituationalCueIndex(0); setSelectedAnswer(null); setQuizShowResult(false);
                        } else {
                          setCompletionData({ mode: "situational-quiz", score: situationalScore, total: totalScenes });
                        }
                      }}
                        style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {situationalCueIndex < quiz.cues.length - 1 ? "Next Scene →" : situationalQuizIndex < quizzes.length - 1 ? "Next Story →" : "View Results →"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── COMPLETING SENTENCE ─── */}
          {lessonMode === "completing-sentence" && (
            <div>
              {(() => {
                const exercises = sentenceCompletion[selectedDialect] || [];
                if (exercises.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No exercises available yet.</div>;

                // Completion screen
                if (completionData?.mode === "completing-sentence") {
                  const pct = Math.round((completionData.score / completionData.total) * 100);
                  const grade = pct >= 80 ? { label: "Excellent!", color: "#1A6B3C", bg: "#EAFAF1", icon: "🏆" }
                    : pct >= 60 ? { label: "Good job!", color: "#8E44AD", bg: "#F5EEF8", icon: "⭐" }
                    : { label: "Keep practising!", color: "#E67E22", bg: "#FEF9E7", icon: "💪" };
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ fontSize: 64, marginBottom: 16 }}>{grade.icon}</div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>All Done!</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32 }}>Fill in the Blank — {dialect.name}</p>
                      <div style={{ background: grade.bg, border: `2px solid ${grade.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32 }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, fontFamily: "'Cormorant Garamond', serif" }}>{completionData.score}<span style={{ fontSize: 28 }}>/{completionData.total}</span></div>
                        <div style={{ fontSize: 20, color: grade.color, fontWeight: 700, marginTop: 4 }}>{grade.label}</div>
                        <div style={{ fontSize: 14, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button className="btn-hover" onClick={() => {
                          setSentenceIndex(0); setSelectedAnswer(null); setQuizShowResult(false);
                          setSentenceScore(0); setCompletionData(null);
                        }} style={{ padding: "12px 24px", background: "white", border: `2px solid ${dialect.color}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: dialect.color, cursor: "pointer", fontFamily: "inherit" }}>
                          ↺ Try Again
                        </button>
                        <button className="btn-hover" onClick={() => { setLessonMode("flashcards"); setCompletionData(null); }}
                          style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Back to Flashcards
                        </button>
                      </div>
                    </div>
                  );
                }

                const exercise = exercises[sentenceIndex];
                const parts = exercise.sentence.split("___");
                const selectedWord = selectedAnswer !== null ? exercise.options[selectedAnswer] : null;

                return (
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: "#6B5B45" }}>
                        <span style={{ fontWeight: 700, color: "#1A1208" }}>Question {sentenceIndex + 1}</span> of {exercises.length}
                      </div>
                      <div style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: dialect.color }}>
                        {sentenceScore} / {sentenceIndex} ✓
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-bar" style={{ marginBottom: 24 }}>
                      <div className="progress-fill" style={{ width: `${(sentenceIndex / exercises.length) * 100}%`, background: dialect.color }} />
                    </div>

                    {/* Sentence card */}
                    <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Fill in the blank</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1.8, flexWrap: "wrap" }}>
                        {parts.map((part, idx) => (
                          <span key={idx}>
                            {part}
                            {idx < parts.length - 1 && (
                              <span style={{
                                display: "inline-block", minWidth: 60, padding: "2px 10px", margin: "0 6px",
                                background: quizShowResult
                                  ? (selectedAnswer === exercise.correctIndex ? "rgba(39,174,96,0.6)" : "rgba(231,76,60,0.6)")
                                  : (selectedWord ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"),
                                border: "2px dashed rgba(255,255,255,0.6)",
                                borderRadius: 8, textAlign: "center",
                                color: "white", transition: "all 0.2s"
                              }}>
                                {selectedWord || "?"}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                      {quizShowResult && (
                        <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                          "{exercise.meaning}"
                        </div>
                      )}
                    </div>

                    {/* Result feedback */}
                    {quizShowResult && (
                      <div style={{
                        background: selectedAnswer === exercise.correctIndex ? "#EAFAF1" : "#FDEDEC",
                        border: `2px solid ${selectedAnswer === exercise.correctIndex ? "#27AE60" : "#E74C3C"}`,
                        borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10
                      }}>
                        <span style={{ fontSize: 22 }}>{selectedAnswer === exercise.correctIndex ? "✅" : "❌"}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: selectedAnswer === exercise.correctIndex ? "#1A6B3C" : "#C0392B" }}>
                            {selectedAnswer === exercise.correctIndex ? "Correct!" : "Not quite."}
                          </div>
                          {selectedAnswer !== exercise.correctIndex && (
                            <div style={{ fontSize: 12, color: "#6B5B45", marginTop: 2 }}>
                              Answer: <strong>{exercise.options[exercise.correctIndex]}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {exercise.options.map((opt, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === exercise.correctIndex;
                        let bg = "white", border = "#E8DDD0", color = "#1A1208", shadow = "none";
                        if (!quizShowResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
                        if (quizShowResult) {
                          if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                          else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                        }
                        return (
                          <button key={idx} className="btn-hover" onClick={() => !quizShowResult && setSelectedAnswer(idx)}
                            style={{ padding: "15px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: quizShowResult ? "default" : "pointer", color, fontFamily: "inherit", transition: "all 0.2s", boxShadow: shadow, position: "relative" }}>
                            {opt}
                            {quizShowResult && isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✓</span>}
                            {quizShowResult && isSelected && !isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action button */}
                    {!quizShowResult ? (
                      <button className="btn-hover" onClick={() => {
                        const correct = selectedAnswer === exercise.correctIndex;
                        if (correct) setSentenceScore(s => s + 1);
                        setQuizShowResult(true);
                      }} disabled={selectedAnswer === null}
                        style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
                        Check Answer
                      </button>
                    ) : (
                      <button className="btn-hover" onClick={() => {
                        if (sentenceIndex < exercises.length - 1) {
                          setSentenceIndex(i => i + 1);
                          setSelectedAnswer(null); setQuizShowResult(false);
                        } else {
                          setCompletionData({ mode: "completing-sentence", score: sentenceScore, total: exercises.length });
                        }
                      }}
                        style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {sentenceIndex < exercises.length - 1 ? "Next →" : "View Results →"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* SEARCH */}
      {screen === "search" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#1A1208", marginBottom: 6 }}>
              Search All Dialects
            </h1>
            <p style={{ color: "#6B5B45", fontSize: 14 }}>
              Search across Hokkien, Cantonese, Teochew, Hakka and Hainanese simultaneously
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>🔍</span>
            <input
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search meanings, romanisation, or Chinese characters in any dialect…"
              aria-label="Search all dialects"
              style={{ width: "100%", padding: "15px 48px", borderRadius: 14, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "white", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchDebouncedQuery(""); }}
                aria-label="Clear search"
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "#E8DDD0", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 13, color: "#6B5B45", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {(searchDialects.length < 5 || searchCategory !== "all" || searchDifficulty !== "all" || searchSort !== "relevance") && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#8B7355", fontWeight: 600 }}>Active:</span>
              {searchDialects.length < 5 && searchDialects.map(id => {
                const info = dialects.find(d => d.id === id);
                return (
                  <span key={id} style={{ background: `${info.color}18`, border: `1.5px solid ${info.color}55`, borderRadius: 20, padding: "3px 10px 3px 8px", fontSize: 12, color: info.color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {info.icon} {info.name}
                    <button onClick={() => setSearchDialects(prev => prev.filter(x => x !== id))}
                      aria-label={`Remove ${info.name} filter`}
                      style={{ background: "none", border: "none", cursor: "pointer", color: info.color, fontSize: 14, padding: "0 0 0 2px", lineHeight: 1 }}>×</button>
                  </span>
                );
              })}
              {searchCategory !== "all" && (
                <span style={{ background: "#F5EFE6", border: "1.5px solid #D4B896", borderRadius: 20, padding: "3px 10px 3px 10px", fontSize: 12, color: "#6B5B45", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {searchCategory.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}
                  <button onClick={() => setSearchCategory("all")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
                </span>
              )}
              {searchDifficulty !== "all" && (
                <span style={{ background: "#F5EFE6", border: "1.5px solid #D4B896", borderRadius: 20, padding: "3px 10px 3px 10px", fontSize: 12, color: "#6B5B45", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {searchDifficulty.charAt(0).toUpperCase() + searchDifficulty.slice(1)}
                  <button onClick={() => setSearchDifficulty("all")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
                </span>
              )}
              {searchSort !== "relevance" && (
                <span style={{ background: "#F5EFE6", border: "1.5px solid #D4B896", borderRadius: 20, padding: "3px 10px 3px 10px", fontSize: 12, color: "#6B5B45", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Sort: {searchSort === "a-z" ? "A – Z" : searchSort === "z-a" ? "Z – A" : "Most Common"}
                  <button onClick={() => setSearchSort("relevance")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
                </span>
              )}
              <button onClick={() => { setSearchDialects(["hokkien","cantonese","teochew","hakka","hainanese"]); setSearchCategory("all"); setSearchDifficulty("all"); setSearchSort("relevance"); }}
                style={{ background: "none", border: "1.5px solid #E8DDD0", borderRadius: 20, padding: "3px 12px", fontSize: 12, color: "#8B7355", cursor: "pointer", fontFamily: "inherit" }}>
                Clear all
              </button>
            </div>
          )}

          {/* Mobile filter toggle */}
          <button onClick={() => setSearchFilterOpen(o => !o)}
            style={{ display: "none", width: "100%", padding: "12px", background: "white", border: "1.5px solid #E8DDD0", borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600, color: "#1A1208", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
            className="search-mobile-toggle">
            🎛 Filters {searchFilterOpen ? "▲" : "▼"}
          </button>

          {/* Main layout: sidebar + results */}
          <div className="search-layout">

            {/* ── Filter sidebar ── */}
            <div className={`search-filter-panel${searchFilterOpen ? " open" : " search-filter-hidden"}`}
              style={{ background: "white", borderRadius: 16, padding: "20px", border: "1.5px solid #E8DDD0" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#1A1208", marginBottom: 18, letterSpacing: 1, textTransform: "uppercase" }}>Filters</div>

              {/* Dialect checkboxes */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Dialect</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Select all / none */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button onClick={() => setSearchDialects(["hokkien","cantonese","teochew","hakka","hainanese"])}
                      style={{ fontSize: 11, color: "#C0392B", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>All</button>
                    <span style={{ color: "#E8DDD0" }}>|</span>
                    <button onClick={() => setSearchDialects([])}
                      style={{ fontSize: 11, color: "#8B7355", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>None</button>
                  </div>
                  {dialects.map(d => (
                    <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer", background: searchDialects.includes(d.id) ? `${d.color}0d` : "transparent", transition: "background 0.15s" }}>
                      <input
                        type="checkbox"
                        checked={searchDialects.includes(d.id)}
                        onChange={() => setSearchDialects(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                        aria-label={`Filter by ${d.name}`}
                        style={{ accentColor: d.color, width: 15, height: 15, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 16 }}>{d.icon}</span>
                      <span style={{ fontSize: 13, color: "#1A1208", fontWeight: searchDialects.includes(d.id) ? 600 : 400 }}>{d.name}</span>
                      {!searchDialects.includes(d.id) && <span style={{ fontSize: 10, color: "#C0B0A0", marginLeft: "auto" }}>off</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Category</div>
                {(() => {
                  const capitalize = s => s.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
                  const catIcons = { greetings:"👋", food:"🍜", numbers:"🔢", family:"👨‍👩‍👧", body:"🫀", daily_life:"🏠", emotions:"😊", travel:"✈️", time:"🕐", hawker:"🍲", hawker_culture:"🍲", profession:"💼", place:"🏙️", animal:"🐾", beverage:"🧋" };
                  const apiCats = [...new Set(apiWords.map(w => w.tags?.[0] || "other"))].filter(c => !["greetings","food","numbers"].includes(c));
                  const allSearchCats = [["all","All categories",""], ["greetings","Greetings","👋"], ["food","Food & Drink","🍜"], ["numbers","Numbers","🔢"], ...apiCats.map(c => [c, capitalize(c), catIcons[c] || "📖"])];
                  return allSearchCats.map(([v, label, icon]) => (
                    <button key={v} onClick={() => setSearchCategory(v)}
                      role="radio" aria-checked={searchCategory === v}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: searchCategory === v ? "#1A1208" : "transparent", color: searchCategory === v ? "#F5E6C8" : "#6B5B45", border: searchCategory === v ? "none" : "1.5px solid transparent", fontSize: 13, fontWeight: searchCategory === v ? 700 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                      {icon && <span>{icon}</span>}
                      {label}
                    </button>
                  ));
                })()}
              </div>

              {/* Difficulty filter */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Difficulty</div>
                {[["all","All levels",""],["beginner","Beginner","🟢"],["intermediate","Intermediate","🟡"],["advanced","Advanced","🔴"]].map(([v,label,dot]) => (
                  <button key={v} onClick={() => setSearchDifficulty(v)}
                    role="radio" aria-checked={searchDifficulty === v}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: searchDifficulty === v ? "#1A1208" : "transparent", color: searchDifficulty === v ? "#F5E6C8" : "#6B5B45", border: searchDifficulty === v ? "none" : "1.5px solid transparent", fontSize: 13, fontWeight: searchDifficulty === v ? 700 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                    {dot && <span style={{ fontSize: 10 }}>{dot}</span>}
                    {label}
                    {v === "beginner" && <span style={{ fontSize: 10, color: searchDifficulty === v ? "rgba(255,255,255,0.6)" : "#C0B0A0", marginLeft: "auto" }}>Greetings</span>}
                    {v === "intermediate" && <span style={{ fontSize: 10, color: searchDifficulty === v ? "rgba(255,255,255,0.6)" : "#C0B0A0", marginLeft: "auto" }}>Food</span>}
                    {v === "advanced" && <span style={{ fontSize: 10, color: searchDifficulty === v ? "rgba(255,255,255,0.6)" : "#C0B0A0", marginLeft: "auto" }}>Numbers</span>}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Sort By</div>
                {[["relevance","Relevance"],["a-z","A – Z"],["z-a","Z – A"],["frequency","Most Common"]].map(([v,label]) => (
                  <button key={v} onClick={() => setSearchSort(v)}
                    role="radio" aria-checked={searchSort === v}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: searchSort === v ? "#1A1208" : "transparent", color: searchSort === v ? "#F5E6C8" : "#6B5B45", border: searchSort === v ? "none" : "1.5px solid transparent", fontSize: 13, fontWeight: searchSort === v ? 700 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Results ── */}
            <div>
              {/* Result count */}
              {(() => {
                const PAGE_SIZE = 60;
                const totalPages = Math.ceil(filteredPhrases.length / PAGE_SIZE);
                const start = (searchPage - 1) * PAGE_SIZE;
                const end = Math.min(start + PAGE_SIZE, filteredPhrases.length);
                const pageResults = filteredPhrases.slice(start, end);
                return (<>
              <div style={{ marginBottom: 14, fontSize: 13, color: "#8B7355", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>
                  {filteredPhrases.length === 0
                    ? "No results found"
                    : <><strong style={{ color: "#1A1208" }}>{start + 1}–{end}</strong> of <strong style={{ color: "#1A1208" }}>{filteredPhrases.length}</strong> phrase{filteredPhrases.length !== 1 ? "s" : ""}</>
                  }
                  {q && <> for "<em>{q}</em>"</>}
                </span>
                {filteredPhrases.length > 0 && !q && searchCategory === "all" && searchDialects.length === 5 && (
                  <span style={{ fontSize: 12, color: "#C0B0A0" }}>Showing all · use search or filters to narrow</span>
                )}
              </div>

              {filteredPhrases.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 16, border: "1.5px solid #E8DDD0" }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#1A1208", marginBottom: 8 }}>No matches found</div>
                  <p style={{ color: "#6B5B45", fontSize: 14, marginBottom: 20 }}>
                    Try a different word or broaden your dialect and category filters.
                  </p>
                  <div style={{ fontSize: 13, color: "#8B7355" }}>
                    Try: <em>"rice"</em>, <em>"hello"</em>, <em>"thank you"</em>, <em>"morning"</em>, <em>"eat"</em>
                  </div>
                  {searchDialects.length === 0 && (
                    <div style={{ marginTop: 16, fontSize: 13, color: "#C0392B", fontWeight: 600 }}>
                      ⚠ No dialects selected — check at least one dialect in the filter panel.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="search-results-grid">
                    {pageResults.map((p, i) => (
                      <div key={start + i} className="result-card btn-hover"
                        style={{ background: "white", borderRadius: 14, padding: "16px", border: "1.5px solid #E8DDD0", cursor: "default", transition: "all 0.2s" }}>
                        {/* Dialect + category badges */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ background: `${p.dialectColor}16`, border: `1.5px solid ${p.dialectColor}50`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: p.dialectColor, fontWeight: 700, letterSpacing: 0.3 }}>
                            {p.dialectIcon} {p.dialectName}
                          </span>
                          <span style={{ background: "#F5EFE6", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#8B7355" }}>
                            {p.category}
                          </span>
                          <span style={{ background: p.difficulty === "beginner" ? "#EAFAF1" : p.difficulty === "intermediate" ? "#FEF9E7" : "#FDEDEC", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: p.difficulty === "beginner" ? "#1A6B3C" : p.difficulty === "intermediate" ? "#8E6000" : "#A93226" }}>
                            {p.difficulty}
                          </span>
                        </div>
                        {/* Phrase */}
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#1A1208", marginBottom: 2 }}>
                          {p.phrase}
                        </div>
                        <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#8B7355", marginBottom: 6 }}>
                          {p.chinese}
                        </div>
                        <div style={{ fontSize: 13, color: "#1A6B3C", fontWeight: 600, marginBottom: 3 }}>
                          {p.meaning}
                        </div>
                        <div style={{ fontSize: 12, color: "#9B8B75", fontStyle: "italic" }}>
                          /{p.romanisation}/
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
                      <button onClick={() => { setSearchPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={searchPage === 1}
                        style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #E8DDD0", background: searchPage === 1 ? "#F5EFE6" : "white", color: searchPage === 1 ? "#C0B0A0" : "#1A1208", fontWeight: 600, fontSize: 13, cursor: searchPage === 1 ? "default" : "pointer", fontFamily: "inherit" }}>
                        ← Previous
                      </button>
                      <span style={{ fontSize: 13, color: "#6B5B45" }}>
                        Page <strong>{searchPage}</strong> of <strong>{totalPages}</strong>
                      </span>
                      <button onClick={() => { setSearchPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={searchPage === totalPages}
                        style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #E8DDD0", background: searchPage === totalPages ? "#F5EFE6" : "white", color: searchPage === totalPages ? "#C0B0A0" : "#1A1208", fontWeight: 600, fontSize: 13, cursor: searchPage === totalPages ? "default" : "pointer", fontFamily: "inherit" }}>
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
              </>);})()}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {screen === "quiz" && dialect && quizState.questions && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1A1208" }}>
              {dialect.icon} {dialect.name} Quiz
            </div>
          </div>

          {!quizState.done ? (
            <div className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 14, color: "#8B7355" }}>
                <span>Question {quizState.q + 1} / {quizState.questions.length}</span>
                <span style={{ color: dialect.color, fontWeight: 600 }}>Score: {quizState.score}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 32 }}>
                <div className="progress-fill" style={{ width: `${((quizState.q + 1) / quizState.questions.length) * 100}%`, background: dialect.color }} />
              </div>

              <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: 40, textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>WHAT DOES THIS MEAN?</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "white" }}>
                  {quizState.questions[quizState.q]?.phrase}
                </div>
                <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
                  {quizState.questions[quizState.q]?.chinese}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {getQuizOptions(quizState.questions[quizState.q]).map((opt, i) => {
                  const isCorrect = opt === quizState.questions[quizState.q].meaning;
                  const isSelected = opt === quizState.answered;
                  let bg = "white", border = "#E8DDD0", color = "#1A1208";
                  if (quizState.answered) {
                    if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                    else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                  }
                  return (
                    <button key={i} className="btn-hover" onClick={() => !quizState.answered && answerQuiz(opt)}
                      style={{ padding: "16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 15, cursor: quizState.answered ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
                      {isCorrect && quizState.answered ? "✓ " : isSelected && !isCorrect ? "✗ " : ""}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }} className="fade-up">
              <div style={{ fontSize: 72, marginBottom: 16 }}>{quizState.score >= 4 ? "🎉" : quizState.score >= 2 ? "👍" : "📚"}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>
                {quizState.score} / {quizState.questions.length}
              </div>
              <div style={{ fontSize: 18, color: "#8B7355", marginBottom: 8, fontStyle: "italic" }}>
                {quizState.score >= 4 ? "Excellent! 做得好！" : quizState.score >= 2 ? "Good effort! Keep practising!" : "Keep learning! 继续加油！"}
              </div>
              <div style={{ background: "#F5E6C8", borderRadius: 16, padding: 24, margin: "24px 0", borderLeft: `4px solid ${dialect.color}` }}>
                <div style={{ fontSize: 14, color: "#6B5B45", lineHeight: 1.7 }}>
                  Every dialect phrase you learn is a step toward preserving Singapore's rich cultural heritage. Share what you've learned with your grandparents — they'll be delighted!
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn-hover" onClick={startQuiz}
                  style={{ background: dialect.color, color: "white", border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  Retry Quiz
                </button>
                <button className="btn-hover" onClick={() => setScreen("lesson")}
                  style={{ background: "white", color: "#1A1208", border: "2px solid #E8DDD0", padding: "14px 28px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  Back to Lessons
                </button>
              </div>
            </div>
          )}
        </div>
      )}



      {/* DIALECTS IN SINGLISH */}
      {screen === "singlish" && (() => {
        const disCategories = ["All", "Feelings & Attitudes", "Character & Personality", "Exclamations", "Actions & Behaviours", "Culture & Mindset", "People & Relationships", "Work & Effort", "Food & Eating", "Reactions & Responses", "Expletives & Intensifiers"];
        const allTags = ["All", "everyday", "NS", "school", "friends", "food", "classic", "culture", "work"];
        const filtered = singlishPhrases.filter(p => {
          const catMatch = disFilter === "All" || p.category === disFilter;
          const searchMatch = disSearch === "" || p.phrase.toLowerCase().includes(disSearch.toLowerCase()) || p.meaning.toLowerCase().includes(disSearch.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(disSearch.toLowerCase()));
          return catMatch && searchMatch;
        });
        const cardPhrase = filtered[disCard] || filtered[0];
        return (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Singapore Heritage</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: "#1A1208", marginBottom: 8, lineHeight: 1.1 }}>
                Dialects<span style={{ color: "#C0392B", fontStyle: "italic" }}>In</span>Singlish
              </h1>
              <p style={{ color: "#8B7355", fontSize: 15, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
                The Singlish we speak every day — at the market, in NS, at the kopitiam — is woven through with dialect. Discover where your favourite phrases really come from.
              </p>
            </div>

            {/* Mode Toggle */}
            <div style={{ display: "flex", background: "#F0E8DA", borderRadius: 14, padding: 4, maxWidth: 360, margin: "0 auto 36px" }}>
              {[["cards","🃏 Flashcards"],["search","🔍 Smart Search"]].map(([mode, label]) => (
                <button key={mode} className="tab-btn" onClick={() => { setDisMode(mode); setDisCard(0); setDisFlipped(false); setDisExpanded(null); }}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: disMode === mode ? "#1A1208" : "transparent", color: disMode === mode ? "#F5E6C8" : "#8B7355", fontSize: 14, fontWeight: 600 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* FLASHCARD MODE */}
            {disMode === "cards" && cardPhrase && (
              <div style={{ maxWidth: 680, margin: "0 auto" }}>
                {/* Category Filter Pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
                  {disCategories.map(c => (
                    <button key={c} className="tab-btn" onClick={() => { setDisFilter(c); setDisCard(0); setDisFlipped(false); }}
                      style={{ padding: "6px 14px", borderRadius: 20, background: disFilter === c ? "#C0392B" : "white", color: disFilter === c ? "white" : "#6B5B45", fontSize: 12, border: "1px solid " + (disFilter === c ? "#C0392B" : "#E8DDD0"), fontWeight: disFilter === c ? 600 : 400 }}>
                      {c}
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#8B7355" }}>
                  <span>{disFilter !== "All" ? disFilter : "All Categories"}</span>
                  <span style={{ color: "#C0392B" }}>{disCard + 1} / {filtered.length}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: 28 }}>
                  <div className="progress-fill" style={{ width: filtered.length ? ((disCard + 1) / filtered.length * 100) + "%" : "0%", background: "#C0392B" }} />
                </div>

                {/* Flashcard */}
                <div className="card-3d" style={{ height: 320, marginBottom: 20, cursor: "pointer" }} onClick={() => setDisFlipped(!disFlipped)}>
                  <div className={"card-inner" + (disFlipped ? " flipped" : "")} style={{ height: "100%", width: "100%" }}>
                    {/* Front */}
                    <div className="card-face" style={{ background: "linear-gradient(135deg, #1A1208 0%, #3D1F10 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
                      <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 20 }}>Tap to reveal meaning</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, color: "#F5E6C8", lineHeight: 1.1, marginBottom: 10 }}>{cardPhrase.phrase}</div>
                      <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 22, color: "rgba(245,230,200,0.6)", marginBottom: 16 }}>{cardPhrase.chinese}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, background: cardPhrase.dialectColor + "40", color: cardPhrase.dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>{cardPhrase.dialect}</span>
                        <span style={{ fontSize: 12, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 12 }}>{cardPhrase.category}</span>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="card-face card-back" style={{ background: "#FAF6F0", border: "3px solid #C0392B", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
                      <div style={{ fontSize: 11, letterSpacing: 3, color: "#C0392B", textTransform: "uppercase", marginBottom: 12 }}>Meaning</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#1A1208", marginBottom: 14, lineHeight: 1.4 }}>{cardPhrase.meaning}</div>
                      <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.7, marginBottom: 14 }}>{cardPhrase.fullExplanation}</div>
                      <div style={{ fontSize: 12, color: "#C0392B", fontStyle: "italic", fontWeight: 600 }}>"{cardPhrase.examples[0]}"</div>
                    </div>
                  </div>
                </div>

                {/* Nav + Expand */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button className="btn-hover" onClick={() => { setDisFlipped(false); setTimeout(() => setDisCard(Math.max(0, disCard - 1)), 150); }} disabled={disCard === 0}
                    style={{ flex: 1, padding: "13px", background: disCard === 0 ? "#E8DDD0" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 15, cursor: disCard === 0 ? "default" : "pointer", color: disCard === 0 ? "#C0B0A0" : "#1A1208" }}>
                    ← Prev
                  </button>
                  <button className="btn-hover" onClick={() => setDisExpanded(disExpanded === cardPhrase.id ? null : cardPhrase.id)}
                    style={{ padding: "13px 20px", background: "#F0E8DA", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 13, cursor: "pointer", color: "#6B5B45", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    {disExpanded === cardPhrase.id ? "▲ Less" : "▼ Full Details"}
                  </button>
                  <button className="btn-hover" onClick={() => { setDisFlipped(false); setTimeout(() => setDisCard(Math.min(filtered.length - 1, disCard + 1)), 150); }} disabled={disCard >= filtered.length - 1}
                    style={{ flex: 1, padding: "13px", background: disCard >= filtered.length - 1 ? "#E8DDD0" : "#1A1208", color: disCard >= filtered.length - 1 ? "#C0B0A0" : "#F5E6C8", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: disCard >= filtered.length - 1 ? "default" : "pointer" }}>
                    Next →
                  </button>
                </div>

                {/* Expanded Detail Panel */}
                {disExpanded === cardPhrase.id && (
                  <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #F0E8DA", marginBottom: 24 }} className="fade-up">
                    <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, background: cardPhrase.dialectColor + "18", color: cardPhrase.dialectColor, padding: "5px 14px", borderRadius: 20, fontWeight: 700 }}>🗣️ {cardPhrase.dialect}</span>
                      <span style={{ fontSize: 13, background: "#F0E8DA", color: "#6B5B45", padding: "5px 14px", borderRadius: 20 }}>📂 {cardPhrase.category}</span>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>{cardPhrase.phrase} <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 18, color: "#9B8B75" }}>{cardPhrase.chinese}</span></div>
                    <div style={{ fontSize: 15, color: "#C0392B", fontWeight: 600, marginBottom: 12 }}>{cardPhrase.meaning}</div>
                    <div style={{ fontSize: 14, color: "#6B5B45", lineHeight: 1.8, marginBottom: 20 }}>{cardPhrase.fullExplanation}</div>
                    <div style={{ fontSize: 13, color: "#8B7355", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Examples in use:</div>
                    {cardPhrase.examples.map((ex, i) => (
                      <div key={i} style={{ background: "#FAF6F0", borderRadius: 10, padding: "12px 16px", marginBottom: 8, fontSize: 14, color: "#1A1208", fontStyle: "italic", borderLeft: "3px solid #C0392B" }}>
                        "{ex}"
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
                      {cardPhrase.tags.map(t => <span key={t} style={{ fontSize: 11, background: "#F5F0EA", color: "#9B8B75", padding: "4px 10px", borderRadius: 8 }}>#{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SMART SEARCH MODE */}
            {disMode === "search" && (
              <div>
                {/* Search Bar */}
                <div style={{ maxWidth: 600, margin: "0 auto 28px", position: "relative" }}>
                  <input
                    type="text"
                    value={disSearch}
                    onChange={e => { setDisSearch(e.target.value); setDisExpanded(null); }}
                    placeholder="Search phrases, meanings, or contexts (e.g. 'NS', 'food', 'sian')..."
                    style={{ width: "100%", padding: "16px 56px 16px 20px", borderRadius: 16, border: "2px solid " + (disSearch ? "#C0392B" : "#E8DDD0"), fontSize: 15, fontFamily: "inherit", background: "white", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transition: "border 0.2s" }}
                  />
                  <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#C0B0A0" }}>🔍</span>
                </div>

                {/* Category Filter */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
                  {disCategories.map(c => (
                    <button key={c} className="tab-btn" onClick={() => { setDisFilter(c); setDisExpanded(null); }}
                      style={{ padding: "6px 14px", borderRadius: 20, background: disFilter === c ? "#C0392B" : "white", color: disFilter === c ? "white" : "#6B5B45", fontSize: 12, border: "1px solid " + (disFilter === c ? "#C0392B" : "#E8DDD0"), fontWeight: disFilter === c ? 600 : 400 }}>
                      {c}
                    </button>
                  ))}
                </div>

                {/* Results count */}
                <div style={{ textAlign: "center", fontSize: 13, color: "#8B7355", marginBottom: 24 }}>
                  {filtered.length === singlishPhrases.length ? `Showing all ${singlishPhrases.length} Singlish dialect phrases` : `Found ${filtered.length} phrase${filtered.length !== 1 ? "s" : ""}${disSearch ? " for \"" + disSearch + "\"" : ""}`}
                </div>

                {/* Results Grid */}
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#1A1208", marginBottom: 8 }}>No phrases found</div>
                    <div style={{ color: "#8B7355", fontSize: 14 }}>Try a different search or clear the filters</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {filtered.map(p => (
                      <div key={p.id} style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid " + (disExpanded === p.id ? "#C0392B" : "#F0E8DA"), cursor: "pointer", transition: "all 0.2s" }}
                        className="dialect-card" onClick={() => setDisExpanded(disExpanded === p.id ? null : p.id)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#1A1208", lineHeight: 1 }}>{p.phrase}</div>
                            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: "#9B8B75", marginTop: 2 }}>{p.chinese}</div>
                          </div>
                          <span style={{ fontSize: 11, background: p.dialectColor + "18", color: p.dialectColor, padding: "4px 10px", borderRadius: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>{p.dialect}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#C0392B", fontWeight: 600, marginBottom: 8 }}>{p.meaning}</div>
                        {disExpanded !== p.id && (
                          <div style={{ fontSize: 13, color: "#8B7355", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.fullExplanation}</div>
                        )}
                        {disExpanded === p.id && (
                          <div className="fade-up">
                            <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.7, marginBottom: 16 }}>{p.fullExplanation}</div>
                            <div style={{ fontSize: 12, color: "#8B7355", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Examples:</div>
                            {p.examples.map((ex, i) => (
                              <div key={i} style={{ background: "#FAF6F0", borderRadius: 8, padding: "10px 14px", marginBottom: 6, fontSize: 13, color: "#1A1208", fontStyle: "italic", borderLeft: "3px solid " + p.dialectColor }}>
                                "{ex}"
                              </div>
                            ))}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                              <span style={{ fontSize: 11, background: "#F0E8DA", color: "#8B7355", padding: "3px 10px", borderRadius: 8 }}>📂 {p.category}</span>
                              {p.tags.map(t => <span key={t} style={{ fontSize: 11, background: "#F5F0EA", color: "#9B8B75", padding: "3px 8px", borderRadius: 8 }}>#{t}</span>)}
                            </div>
                          </div>
                        )}
                        <div style={{ marginTop: 12, fontSize: 12, color: "#C0B0A0", textAlign: "right" }}>{disExpanded === p.id ? "▲ Collapse" : "▼ Expand"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Context banner at bottom */}
            <div style={{ marginTop: 56, background: "linear-gradient(135deg, #1A1208, #3D1F10)", borderRadius: 20, padding: "36px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗣️</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#F5E6C8", marginBottom: 8 }}>Singlish is dialect in disguise</div>
              <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
                From "bojio" to "jialat", the phrases that make Singlish uniquely ours are rooted in Hokkien, Cantonese, Teochew, Hakka and Hainanese. Every time you say "walao" or "paiseh", you're speaking dialect — and keeping it alive.
              </p>
            </div>
          </div>
        );
      })()}

      {screen === "network" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Community</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: "#1A1208", marginBottom: 12 }}>Network</h1>
            <p style={{ color: "#8B7355", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>Connect with fellow learners across Singapore. Find practice partners, share stories, and keep our dialects alive together.</p>
          </div>
          <div style={{ display: "flex", background: "#F0E8DA", borderRadius: 14, padding: 4, maxWidth: 500, margin: "0 auto 40px" }}>
            {[["community","Community"],["sinseh","Sin Seh (Mentorship)"]].map(([tab, label]) => (
              <button key={tab} className="tab-btn" onClick={() => setNetworkTab(tab)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: networkTab === tab ? "#1A1208" : "transparent", color: networkTab === tab ? "#F5E6C8" : "#8B7355", fontSize: 14, fontWeight: 600 }}>
                {label}
              </button>
            ))}
          </div>
          {networkTab === "community" && (
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
                {["All", "Mentor", "Mentee"].map(f => (
                  <button key={f} className="tab-btn" onClick={() => setNetworkFilter(f)}
                    style={{ padding: "8px 16px", borderRadius: 20, background: networkFilter === f ? "#C0392B" : "white", color: networkFilter === f ? "white" : "#6B5B45", fontSize: 13, border: "1px solid " + (networkFilter === f ? "#C0392B" : "#E8DDD0"), fontWeight: networkFilter === f ? 600 : 400 }}>
                    {f}
                  </button>
                ))}
              </div>

              {registeredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No members yet</div>
                  <p style={{ fontSize: 14, marginBottom: 24 }}>Be the first to join the community and connect with dialect learners across Singapore.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {registeredUsers
                    .filter(m => networkFilter === "All" || m.role === networkFilter.toLowerCase())
                    .map(m => {
                      const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };
                      const isCurrentUser = currentUser?.id === m.id;
                      const mutual = isMutualMatch(m.id);
                      const pending = hasSentRequest(m.id);
                      const dialectColor = dColors[m.languageInterest] || "#8B7355";
                      return (
                        <div key={m.id} style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid " + (mutual ? "#1A6B3C40" : "#F0E8DA"), display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{ fontSize: 40, background: "#FAF6F0", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.avatar}</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{m.firstName} {m.lastName}</div>
                                <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, background: m.role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: m.role === "mentor" ? "#D4860B" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                              {m.role}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest}</span>
                          </div>
                          {mutual ? (
                            <div style={{ marginTop: 4, padding: "10px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600 }}>
                              Connected · <span style={{ fontWeight: 400 }}>{m.email}</span>
                            </div>
                          ) : isCurrentUser ? (
                            <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#9B8B75", fontSize: 13, textAlign: "center" }}>
                              This is you
                            </div>
                          ) : !currentUser ? (
                            <button className="btn-hover" onClick={() => setScreen("profile")}
                              style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#8B7355", border: "1px dashed #D4C9B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                              Register to Connect
                            </button>
                          ) : pending ? (
                            <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#FEF3E2", color: "#D4860B", fontSize: 13, fontWeight: 600, textAlign: "center", border: "1px solid #D4860B40" }}>
                              Request Sent ✓
                            </div>
                          ) : (
                            <button className="btn-hover" onClick={() => sendConnectRequest(m.id)}
                              style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              Send Connect Request
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              <div style={{ marginTop: 48, background: "linear-gradient(135deg, #1A1208, #2C1810)", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#F5E6C8", marginBottom: 8 }}>Add yourself to the community</div>
                <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 24 }}>Register your profile to appear as a member and connect with learners across Singapore.</p>
                <button className="btn-hover" onClick={() => setScreen("profile")}
                  style={{ background: "#C0392B", color: "white", border: "none", padding: "14px 36px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  {currentUser ? "View Your Profile" : "Join the Network"}
                </button>
              </div>
            </div>
          )}
          {networkTab === "sinseh" && (
            <div>
              <div style={{ background: "linear-gradient(135deg, #2C1508, #4A1F10)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 56 }}>🎓</div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#F5E6C8" }}>Sin Seh <span style={{ fontStyle: "italic", color: "#C0392B" }}>先生</span></div>
                  <div style={{ fontSize: 14, color: "#A08060", marginTop: 4, marginBottom: 8 }}>Mentorship Programme - Completely Free</div>
                  <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>Our volunteer mentors are native speakers who give their time freely. Apply as a mentee, or volunteer as a sin seh yourself.</p>
                </div>
              </div>

              {currentUser ? (
                <div style={{ background: currentUser.role === "mentor" ? "#FEF3E2" : "#EEF2FF", borderRadius: 14, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", border: "1px solid " + (currentUser.role === "mentor" ? "#D4860B40" : "#5B21B640") }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: currentUser.role === "mentor" ? "#D4860B" : "#5B21B6", marginBottom: 4 }}>
                      {currentUser.role === "mentor" ? "You are registered as a Mentor" : "You are registered as a Mentee"}
                    </div>
                    <div style={{ fontSize: 13, color: "#6B5B45" }}>
                      {currentUser.role === "mentor" ? "Share your dialect knowledge by volunteering as a Sin Seh." : "Find a native speaker to guide your dialect learning journey."}
                    </div>
                    {currentUser.sinSehApplied && <div style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600, marginTop: 4 }}>Application submitted ✓</div>}
                  </div>
                  {!currentUser.sinSehApplied ? (
                    <button className="btn-hover" onClick={() => { applySinSeh(); setSinSehTab(currentUser.role === "mentor" ? "apply-mentor" : "apply-mentee"); }}
                      style={{ padding: "12px 24px", borderRadius: 10, background: currentUser.role === "mentor" ? "#D4860B" : "#5B21B6", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                      {currentUser.role === "mentor" ? "Apply to Mentor Others" : "Apply for Mentor"}
                    </button>
                  ) : (
                    <div style={{ padding: "12px 24px", borderRadius: 10, background: "#EAFAF1", color: "#1A6B3C", fontSize: 14, fontWeight: 600, border: "1px solid #1A6B3C40" }}>Applied ✓</div>
                  )}
                </div>
              ) : (
                <div style={{ background: "#FAF6F0", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px dashed #D4C9B8" }}>
                  <div style={{ fontSize: 13, color: "#8B7355" }}>Register your profile to access role-based mentorship features.</div>
                  <button className="btn-hover" onClick={() => setScreen("profile")}
                    style={{ padding: "10px 20px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Register Profile
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
                {[["mentors","Find a Sin Seh"],["apply-mentee","Apply as Mentee"],["apply-mentor","Volunteer as Sin Seh"]].map(([tab, label]) => (
                  <button key={tab} className="tab-btn" onClick={() => { setSinSehTab(tab); setSubmitted(false); setMentorSubmitted(false); }}
                    style={{ padding: "11px 20px", borderRadius: 10, background: sinSehTab === tab ? "#C0392B" : "white", color: sinSehTab === tab ? "white" : "#6B5B45", fontSize: 14, border: "2px solid " + (sinSehTab === tab ? "#C0392B" : "#E8DDD0"), fontWeight: 600 }}>
                    {label}
                  </button>
                ))}
              </div>
              {sinSehTab === "mentors" && (() => {
                const mentors = registeredUsers.filter(u => u.role === "mentor");
                const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };
                return mentors.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No mentors yet</div>
                    <p style={{ fontSize: 14, marginBottom: 24 }}>Be the first to volunteer as a Sin Seh and help preserve Singapore's dialect heritage.</p>
                    <button className="btn-hover" onClick={() => setSinSehTab("apply-mentor")}
                      style={{ background: "#C0392B", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                      Volunteer as Sin Seh
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                    {mentors.map(m => {
                      const dialectColor = dColors[m.languageInterest] || "#8B7355";
                      return (
                        <div key={m.id} style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #F0E8DA", display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <div style={{ fontSize: 44, background: "#FAF6F0", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 17, color: "#1A1208" }}>{m.firstName} {m.lastName}</div>
                              <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <span style={{ fontSize: 12, background: dialectColor + "18", color: dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest}</span>
                            {m.sinSehApplied && <span style={{ fontSize: 11, background: "#EAFAF1", color: "#1A6B3C", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Sin Seh Volunteer</span>}
                          </div>
                          <button className="btn-hover" onClick={() => { setSinSehTab("apply-mentee"); setApplyModal(m); }}
                            style={{ padding: "12px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            Apply to learn from {m.firstName}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {sinSehTab === "apply-mentee" && (
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  {applyModal && (
                    <div style={{ background: "#F5ECD8", borderRadius: 14, padding: 20, marginBottom: 28, display: "flex", gap: 14, alignItems: "center", border: "2px solid #D4860B" }}>
                      <div style={{ fontSize: 32 }}>{applyModal.avatar}</div>
                      <div>
                        <div style={{ fontSize: 13, color: "#8B6020", fontWeight: 600 }}>Applying to learn from:</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#1A1208" }}>{applyModal.firstName} {applyModal.lastName}</div>
                        <div style={{ fontSize: 12, color: "#9B8B75" }}>{applyModal.languageInterest}</div>
                      </div>
                      <button onClick={() => setApplyModal(null)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9B8B75" }}>x</button>
                    </div>
                  )}
                  {!submitted ? (
                    <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>Apply as a Mentee</div>
                      <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>Tell us about yourself so we can match you with the right sin seh. This is a free programme.</p>
                      {[["Your Full Name","text",applyForm.name,v=>setApplyForm(f=>({...f,name:v}))],["Your Age","number",applyForm.age,v=>setApplyForm(f=>({...f,age:v}))],["Your Town / Estate","text",applyForm.location,v=>setApplyForm(f=>({...f,location:v}))]].map(([label,type,val,setter]) => (
                        <div key={label} style={{ marginBottom: 20 }}>
                          <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                          <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={label} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", outline: "none", background: "#FAF6F0" }} />
                        </div>
                      ))}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect you want to learn</label>
                        <select value={applyForm.dialect} onChange={e=>setApplyForm(f=>({...f,dialect:e.target.value}))} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "#FAF6F0" }}>
                          {["Hokkien","Cantonese","Teochew","Hakka","Hainanese"].map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Why do you want to learn this dialect?</label>
                        <textarea value={applyForm.message} onChange={e=>setApplyForm(f=>({...f,message:e.target.value}))} rows={4} placeholder="Share your story..." style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "#FAF6F0", resize: "vertical" }} />
                      </div>
                      <button className="btn-hover" onClick={() => { if(applyForm.name && applyForm.dialect) setSubmitted(true); }} style={{ width: "100%", padding: "16px", background: "#C0392B", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Submit Application
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", background: "white", borderRadius: 20, padding: 48, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }} className="fade-up">
                      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Application Submitted!</div>
                      <p style={{ color: "#8B7355", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>Thank you, <strong>{applyForm.name}</strong>! Your application to learn <strong>{applyForm.dialect}</strong> has been received. A sin seh will reach out within 3 to 5 working days.</p>
                      <div style={{ background: "#F5E6C8", borderRadius: 14, padding: 20, marginBottom: 28, textAlign: "left", border: "2px solid #D4860B" }}>
                        <div style={{ fontSize: 13, color: "#8B6020", fontWeight: 700, marginBottom: 8 }}>Your Application Summary</div>
                        <div style={{ fontSize: 14, color: "#6B5B45", lineHeight: 2 }}>
                          <div>Name: {applyForm.name}, Age {applyForm.age}</div>
                          <div>Location: {applyForm.location}</div>
                          <div>Learning: {applyForm.dialect}</div>
                        </div>
                      </div>
                      <button className="btn-hover" onClick={() => { setSubmitted(false); setApplyForm({name:"",age:"",dialect:"Hokkien",location:"",message:""}); setSinSehTab("mentors"); }} style={{ background: "#1A1208", color: "#F5E6C8", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Browse More Sin Sehs</button>
                    </div>
                  )}
                </div>
              )}
              {sinSehTab === "apply-mentor" && (
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  {!mentorSubmitted ? (
                    <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>Become a Sin Seh 先生</div>
                      <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 20 }}>Are you a native or fluent speaker willing to volunteer your time? Your knowledge is irreplaceable.</p>
                      <div style={{ background: "#FEF3E2", borderRadius: 12, padding: 16, marginBottom: 28, border: "1px solid #D4860B" }}>
                        <div style={{ fontSize: 13, color: "#8B6020", fontWeight: 700, marginBottom: 6 }}>As a Sin Seh you will:</div>
                        <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 2 }}>
                          <div>Set your own availability and pace</div>
                          <div>Choose how many mentees you take on</div>
                          <div>Teach in any format: in person, video call, or voice notes</div>
                          <div>Receive a digital Heritage Keeper certificate</div>
                        </div>
                      </div>
                      {[["Your Full Name","text",mentorForm.name,v=>setMentorForm(f=>({...f,name:v}))],["Your Age","number",mentorForm.age,v=>setMentorForm(f=>({...f,age:v}))],["Your Town / Estate","text",mentorForm.location,v=>setMentorForm(f=>({...f,location:v}))],["Years speaking the dialect","text",mentorForm.experience,v=>setMentorForm(f=>({...f,experience:v}))]].map(([label,type,val,setter]) => (
                        <div key={label} style={{ marginBottom: 20 }}>
                          <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                          <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={label} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", outline: "none", background: "#FAF6F0" }} />
                        </div>
                      ))}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect(s) you can teach</label>
                        <select value={mentorForm.dialect} onChange={e=>setMentorForm(f=>({...f,dialect:e.target.value}))} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "#FAF6F0" }}>
                          {["Hokkien","Cantonese","Teochew","Hakka","Hainanese","Hokkien & Teochew","Cantonese & Hakka"].map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>About you and your teaching style</label>
                        <textarea value={mentorForm.bio} onChange={e=>setMentorForm(f=>({...f,bio:e.target.value}))} rows={4} placeholder="Share your background and how you would like to teach..." style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "#FAF6F0", resize: "vertical" }} />
                      </div>
                      <button className="btn-hover" onClick={() => { if(mentorForm.name && mentorForm.dialect) setMentorSubmitted(true); }} style={{ width: "100%", padding: "16px", background: "#C0392B", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Register as Sin Seh
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", background: "white", borderRadius: 20, padding: 48, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }} className="fade-up">
                      <div style={{ fontSize: 64, marginBottom: 16 }}>🏅</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Thank You! 多谢你！</div>
                      <p style={{ color: "#8B7355", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}><strong>{mentorForm.name}</strong>, you are now a registered Sin Seh volunteer. We will be in touch with your first mentee match soon.</p>
                      <div style={{ background: "#1A1208", borderRadius: 14, padding: 24, marginBottom: 28 }}>
                        <div style={{ fontSize: 13, color: "#C0392B", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Heritage Keeper Certificate</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#F5E6C8" }}>{mentorForm.name}</div>
                        <div style={{ fontSize: 13, color: "#8B7355", marginTop: 4 }}>Volunteer Sin Seh - {mentorForm.dialect} - tiagong.sg</div>
                      </div>
                      <button className="btn-hover" onClick={() => { setMentorSubmitted(false); setMentorForm({name:"",age:"",dialect:"Hokkien",location:"",experience:"",bio:""}); setSinSehTab("mentors"); }} style={{ background: "#C0392B", color: "white", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>View Sin Seh Directory</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {screen === "profile" && (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Your Account</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, color: "#1A1208", marginBottom: 12 }}>Profile</h1>
          </div>

          {currentUser ? (
            <div className="fade-up">
              <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #F0E8DA", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 56, background: "#FAF6F0", borderRadius: "50%", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>{currentUser.avatar}</div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208" }}>{currentUser.firstName} {currentUser.lastName}</div>
                    <div style={{ fontSize: 12, color: "#9B8B75", marginTop: 2 }}>{currentUser.occupation} · Age {currentUser.age}</div>
                    <div style={{ display: "inline-block", marginTop: 6, fontSize: 11, background: currentUser.role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: currentUser.role === "mentor" ? "#D4860B" : "#5B21B6", padding: "3px 10px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>{currentUser.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "#6B5B45" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0E8DA" }}>
                    <span style={{ fontWeight: 600 }}>Email</span><span>{currentUser.email}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0E8DA" }}>
                    <span style={{ fontWeight: 600 }}>Language Interest</span><span>{currentUser.languageInterest}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                    <span style={{ fontWeight: 600 }}>SinSeh Programme</span>
                    <span style={{ color: currentUser.sinSehApplied ? "#1A6B3C" : "#9B8B75" }}>{currentUser.sinSehApplied ? "Applied ✓" : "Not applied"}</span>
                  </div>
                </div>
                <button className="btn-hover" onClick={handleLogout}
                  style={{ marginTop: 24, width: "100%", padding: "12px", background: "#1A1208", color: "#F5E6C8", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : pendingGoogle ? (
            <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 6 }}>
                Complete Your Profile
              </div>
              <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>
                Signed in as <strong>{pendingGoogle.googleData.email}</strong>. Tell us a bit more about yourself.
              </p>

              <div style={{ marginBottom: 20, padding: "16px", background: "#FAF6F0", borderRadius: 10, border: "1px solid #E8DDD0" }}>
                <div style={{ fontSize: 13, color: "#6B5B45", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Name:</span> {pendingGoogle.googleData.firstName} {pendingGoogle.googleData.lastName}
                </div>
                <div style={{ fontSize: 13, color: "#6B5B45" }}>
                  <span style={{ fontWeight: 600 }}>Email:</span> {pendingGoogle.googleData.email}
                </div>
              </div>

              {[["Age", "number", profileForm.age, v => setProfileForm(f => ({ ...f, age: v }))],
                ["Occupation", "text", profileForm.occupation, v => setProfileForm(f => ({ ...f, occupation: v }))]].map(([label, type, val, setter]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                  <input type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", outline: "none", background: "#FAF6F0" }} />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Language to Learn / Speak</label>
                <select value={profileForm.languageInterest} onChange={e => setProfileForm(f => ({ ...f, languageInterest: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 15, fontFamily: "inherit", background: "#FAF6F0" }}>
                  {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese", "Hokkien & Teochew", "Cantonese & Hakka", "All Dialects"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>I want to join as a</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["mentee", "🧑‍🎓", "Mentee", "I want to learn dialects"], ["mentor", "👨‍🏫", "Mentor", "I can teach others"]].map(([val, icon, label, sub]) => (
                    <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, role: val }))}
                      style={{ flex: 1, padding: "16px 12px", borderRadius: 12, border: "2px solid " + (profileForm.role === val ? "#C0392B" : "#E8DDD0"), background: profileForm.role === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: profileForm.role === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-hover" onClick={completeProfile}
                style={{ width: "100%", padding: "14px", background: "#C0392B", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Complete Profile
              </button>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1A1208", marginBottom: 12 }}>
                Sign In to Your Account
              </div>
              <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 32 }}>
                Use Google to sign in or create your tiagong.sg profile and connect with dialect learners across Singapore.
              </p>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setAuthError("Google sign-in failed")}
                  text="signin_with"
                />
              </div>
            </div>
          )}

          {authError && (
            <div style={{ marginTop: 16, padding: 12, background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 10, color: "#C0392B", fontSize: 13 }}>
              {authError}
            </div>
          )}
        </div>
      )}

      {screen === "associations" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 40 }}>🏛️</div>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>
                  Clan Associations
                </h1>
                <p style={{ color: "#6B5B45", fontSize: 14, lineHeight: 1.6 }}>
                  The <em>huay kuan</em> (会馆) of Singapore's dialect communities — guardians of language, culture, and identity since the 1800s.
                </p>
              </div>
            </div>
          </div>

          {/* DIRECTORY */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>Directory</h2>
            <p style={{ fontSize: 13, color: "#8B7355" }}>Full contact and background information for each huay kuan</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {huayKuan.map(hk => (
              <div key={hk.id}
                style={{ background: "white", borderRadius: 18, border: "1.5px solid #E8DDD0", padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
                className="btn-hover">
                {/* Card header */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${hk.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{hk.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: "#1A1208", lineHeight: 1.3, marginBottom: 4 }}>{hk.name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ background: `${hk.color}18`, border: `1.5px solid ${hk.color}44`, borderRadius: 20, padding: "2px 9px", fontSize: 11, color: hk.color, fontWeight: 700 }}>{hk.dialectLabel}</span>
                      {hk.founded && <span style={{ fontSize: 11, color: "#8B7355", padding: "2px 0" }}>est. {hk.founded}</span>}
                      {hk.members && <span style={{ fontSize: 11, color: "#8B7355", padding: "2px 0" }}>· {hk.members} members</span>}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.65, marginBottom: 16, borderLeft: `3px solid ${hk.color}40`, paddingLeft: 10 }}>{hk.description}</p>

                {/* Contact grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0 }}>📍</span>
                    <span>{hk.address}</span>
                  </div>
                  {hk.tel && hk.tel.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>📞</span><span>{t}</span>
                    </div>
                  ))}
                  {hk.whatsapp && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>💬</span><span>WhatsApp: {hk.whatsapp}</span>
                    </div>
                  )}
                  {hk.fax && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#8B7355" }}>
                      <span>📠</span><span>{hk.fax}</span>
                    </div>
                  )}
                  {hk.hours && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>🕐</span><span>{hk.hours}</span>
                    </div>
                  )}
                  {hk.email && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>✉️</span><a href={`mailto:${hk.email}`} style={{ color: hk.color, textDecoration: "none" }} onClick={e => e.stopPropagation()}>{hk.email}</a>
                    </div>
                  )}
                  {hk.website && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>🌐</span><a href={hk.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: hk.color, textDecoration: "none" }} onClick={e => e.stopPropagation()}>{hk.website}</a>
                    </div>
                  )}
                  {hk.hallRental && (
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                      <span>🏢</span><span>Hall rental: {hk.hallRental.join(" / ")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SFCCA footnote */}
          <div style={{ marginTop: 36, padding: "18px 22px", background: "#FDF6EE", borderRadius: 14, border: "1px solid #EDE0CC", fontSize: 13, color: "#6B5B45", lineHeight: 1.7 }}>
            <strong style={{ color: "#1A1208" }}>🏛 Singapore Federation of Chinese Clan Associations (SFCCA)</strong><br/>
            The umbrella body that unites over 200 Chinese clan associations in Singapore. Most of the huay kuan listed here are founding or key member associations of the SFCCA, which works to preserve Chinese culture, language, and heritage across all dialect groups.
          </div>
        </div>
      )}

      {screen === "about" && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏮</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: "#1A1208", marginBottom: 16 }}>Why tiagong.sg?</h1>
          </div>
          {[
            ["📉", "A Heritage at Risk", "Since the 1980 Speak Mandarin Campaign, the use of Chinese dialects in Singapore has declined sharply. Many younger Singaporeans can no longer communicate with their grandparents in dialect."],
            ["🔗", "The Cultural Thread", "Dialects carry more than words — they hold proverbs, songs, rituals, recipes, and stories that cannot be fully translated. When a dialect disappears, a whole worldview is lost."],
            ["🌱", "Our Mission", "We believe every Singaporean should have a chance to reconnect with their dialect roots, even if just a few phrases. Small steps lead to big cultural preservation."],
            ["👵", "Talk to Your Elders", "The best way to learn is from your grandparents, relatives, and community. Use this platform to start the conversation, then continue it at home."],
          ].map(([icon, title, text]) => (
            <div key={title} style={{ display: "flex", gap: 20, marginBottom: 32, background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #F0E8DA" }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>{title}</div>
                <div style={{ color: "#6B5B45", lineHeight: 1.7 }}>{text}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="btn-primary" onClick={() => setScreen("home")} style={{ fontSize: 16 }}>
              Start Learning Now
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "#1A1208", padding: "48px 32px 32px", borderTop: "3px solid #C0392B" }}>
        <div className="footer-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>🏮</span>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#F5E6C8" }}>tiagong.sg</div>
            </div>
            <p style={{ color: "#6B5B45", fontSize: 13, lineHeight: 1.7 }}>
              Preserving Singapore's Chinese dialect heritage — one phrase at a time.
            </p>
          </div>
          {/* Quick links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Explore</div>
            {[["home","Learn Dialects"],["search","Search Phrases"],["singlish","Dialects in Singlish"],["associations","Clan Associations"],["about","About Us"]].map(([s,label]) => (
              <div key={s} onClick={() => setScreen(s)} style={{ color: "#8B7355", fontSize: 13, marginBottom: 8, cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color="#F5E6C8"} onMouseLeave={e => e.target.style.color="#8B7355"}>
                {label}
              </div>
            ))}
          </div>
          {/* Dialects */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Dialects</div>
            {dialects.map(d => (
              <div key={d.id} onClick={() => { selectDialect(d.id); }} style={{ color: "#8B7355", fontSize: 13, marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color="#F5E6C8"} onMouseLeave={e => e.currentTarget.style.color="#8B7355"}>
                <span>{d.icon}</span> {d.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ color: "#4A3A28", fontSize: 13, fontStyle: "italic" }}>
            "A language lost is a culture lost." — Promote dialect preservation in Singapore.
          </p>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
