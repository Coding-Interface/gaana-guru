/**
 * SONG_DECK — film songs by era, each with an original emoji clue.
 * Only titles and film names are used: no lyrics, audio or artwork.
 *
 *   s: song title (letters are what the player fills in)
 *   f: film, shown by the "Show the film" hint
 *   e: emoji clue, built from the meaning or sound of the title's words
 */
window.SONG_DECK = {
  bw: [
    { s: 'Mera Joota Hai Japani', f: 'Shree 420', e: '👟🇯🇵' },
    { s: 'Chaudhvin Ka Chand', f: 'Chaudhvin Ka Chand', e: '1️⃣4️⃣🌕' },
    { s: 'Lag Ja Gale', f: 'Woh Kaun Thi?', e: '🤗' },
    { s: 'Pyar Kiya To Darna Kya', f: 'Mughal-e-Azam', e: '❤️😨❓' },
    { s: 'Awaara Hoon', f: 'Awaara', e: '🚶‍♂️🌍🎒' },
    { s: 'Baar Baar Dekho', f: 'China Town', e: '🔁🔁👀' },
    { s: 'Aaj Phir Jeene Ki Tamanna Hai', f: 'Guide', e: '📅🔁🌱💭' },
    { s: 'O Haseena Zulfon Wali', f: 'Teesri Manzil', e: '😍💇‍♀️' },
    { s: 'Mere Sapno Ki Rani', f: 'Aradhana', e: '💭👸🚂' },
    { s: 'Yahoo Chahe Koi Mujhe Junglee Kahe', f: 'Junglee', e: '📣🌴🐒🗣️' },
    { s: 'Kahin Deep Jale Kahin Dil', f: 'Bees Saal Baad', e: '🪔🔥❤️' },
    { s: 'Sar Jo Tera Chakraye', f: 'Pyaasa', e: '🤕😵‍💫' },
    { s: 'Ude Jab Jab Zulfein Teri', f: 'Naya Daur', e: '💨💇‍♀️' },
    { s: 'Abhi Na Jao Chhod Kar', f: 'Hum Dono', e: '⏰🚫🚶‍♀️' },
    { s: 'Ajeeb Dastan Hai Yeh', f: 'Dil Apna Aur Preet Parai', e: '🤔📖' },
    { s: 'Gaata Rahe Mera Dil', f: 'Guide', e: '🎤❤️🎶' },
    { s: 'Aaiye Meherbaan', f: 'Howrah Bridge', e: '🙏🚪✨' }
  ],
  retro: [
    { s: 'Yeh Dosti', f: 'Sholay', e: '🤝👬🏍️' },
    { s: 'Mehbooba Mehbooba', f: 'Sholay', e: '💃🔥💃' },
    { s: 'Kabhi Kabhi Mere Dil Mein', f: 'Kabhi Kabhie', e: '🔁❤️💭' },
    { s: 'Khaike Paan Banaraswala', f: 'Don', e: '😋🍃🏙️' },
    { s: 'Om Shanti Om', f: 'Karz', e: '🕉️☮️🕉️' },
    { s: 'Rang Barse', f: 'Silsila', e: '🎨🌧️' },
    { s: 'I Am a Disco Dancer', f: 'Disco Dancer', e: '🙋‍♂️🪩🕺' },
    { s: 'Hawa Hawai', f: 'Mr. India', e: '💨💨✈️' },
    { s: 'Ek Do Teen', f: 'Tezaab', e: '1️⃣2️⃣3️⃣' },
    { s: 'Papa Kehte Hain', f: 'Qayamat Se Qayamat Tak', e: '👨‍👦🗣️' },
    { s: 'Saagar Kinare', f: 'Saagar', e: '🌊🏖️' },
    { s: 'Zindagi Ek Safar Hai Suhana', f: 'Andaz', e: '🌱1️⃣🛣️☀️' },
    { s: 'Chura Liya Hai Tumne Jo Dil Ko', f: 'Yaadon Ki Baaraat', e: '🦹🫵❤️' },
    { s: 'Gulabi Aankhen', f: 'The Train', e: '🌸👀' },
    { s: 'Ruk Jana Nahin', f: 'Imtihan', e: '🛑🚫🏃' },
    { s: 'Dil Deewana', f: 'Maine Pyar Kiya', e: '❤️🤪' },
    { s: 'Ek Main Aur Ek Tu', f: 'Khel Khel Mein', e: '1️⃣🙋‍♂️➕1️⃣🫵' },
    { s: 'Mere Angne Mein', f: 'Laawaris', e: '🏡🌿' }
  ],
  nineties: [
    { s: 'Tujhe Dekha To', f: 'Dilwale Dulhania Le Jayenge', e: '🫵👀🌻' },
    { s: 'Mehndi Laga Ke Rakhna', f: 'Dilwale Dulhania Le Jayenge', e: '🌿✋💍' },
    { s: 'Chaiyya Chaiyya', f: 'Dil Se..', e: '🚂🕺💃' },
    { s: 'Kuch Kuch Hota Hai', f: 'Kuch Kuch Hota Hai', e: '🤏🤏💓' },
    { s: 'Tu Cheez Badi Hai Mast Mast', f: 'Mohra', e: '🫵🎁😎😎' },
    { s: 'Ek Ladki Ko Dekha', f: '1942: A Love Story', e: '1️⃣👧👀' },
    { s: 'Taal Se Taal Mila', f: 'Taal', e: '🥁🤝🥁' },
    { s: 'Dil To Pagal Hai', f: 'Dil To Pagal Hai', e: '💓🙃' },
    { s: 'Pardesi Pardesi', f: 'Raja Hindustani', e: '✈️🧳✈️🧳' },
    { s: 'Sandese Aate Hai', f: 'Border', e: '✉️📬🪖' },
    { s: 'Raja Ko Rani Se Pyar Ho Gaya', f: 'Akele Hum Akele Tum', e: '🤴❤️👸' },
    { s: 'Koi Mil Gaya', f: 'Kuch Kuch Hota Hai', e: '🙋🔍🎉' },
    { s: 'Chunari Chunari', f: 'Biwi No.1', e: '🧣🧣' },
    { s: 'Didi Tera Devar Deewana', f: 'Hum Aapke Hain Koun..!', e: '👩👦🤪' },
    { s: 'Yeh Kaali Kaali Aankhen', f: 'Baazigar', e: '⚫⚫👀' },
    { s: 'Dhak Dhak Karne Laga', f: 'Beta', e: '💓💓' },
    { s: 'Ruk Ruk Ruk', f: 'Vijaypath', e: '🛑🛑🛑' },
    { s: 'Pehla Pehla Pyar', f: 'Hum Aapke Hain Koun..!', e: '1️⃣1️⃣❤️' }
  ],
  newwave: [
    { s: 'Kal Ho Naa Ho', f: 'Kal Ho Naa Ho', e: '📅❓' },
    { s: 'Suraj Hua Maddham', f: 'Kabhi Khushi Kabhie Gham...', e: '☀️🔅' },
    { s: 'Dhoom Machale', f: 'Dhoom', e: '🏍️💥' },
    { s: 'Kajra Re', f: 'Bunty Aur Babli', e: '👁️🖤' },
    { s: 'Chak De India', f: 'Chak De! India', e: '🏑🇮🇳' },
    { s: 'Masakali', f: 'Delhi-6', e: '🕊️' },
    { s: 'Aal Izz Well', f: '3 Idiots', e: '👍✅😌' },
    { s: 'Desi Girl', f: 'Dostana', e: '🇮🇳👧' },
    { s: 'London Thumakda', f: 'Queen', e: '🇬🇧💃' },
    { s: 'Kala Chashma', f: 'Baar Baar Dekho', e: '⚫🕶️' },
    { s: 'Tum Hi Ho', f: 'Aashiqui 2', e: '🫵💯' },
    { s: 'Lungi Dance', f: 'Chennai Express', e: '👘🕺' },
    { s: 'Badtameez Dil', f: 'Yeh Jawaani Hai Deewani', e: '😜❤️' },
    { s: 'Balam Pichkari', f: 'Yeh Jawaani Hai Deewani', e: '👫🔫💦' },
    { s: 'Apna Time Aayega', f: 'Gully Boy', e: '🙋⏰🔜' },
    { s: 'Kesariya', f: 'Brahmastra Part One: Shiva', e: '🧡🌼' },
    { s: 'What Jhumka', f: 'Rocky Aur Rani Kii Prem Kahaani', e: '❓💎👂' },
    { s: 'Tauba Tauba', f: 'Bad Newz', e: '🙏🙏' },
    { s: "It's the Time to Disco", f: 'Kal Ho Naa Ho', e: '⏰🪩' },
    { s: 'Dard-e-Disco', f: 'Om Shanti Om', e: '🤕🪩' },
    { s: 'Senorita', f: 'Zindagi Na Milegi Dobara', e: '💃🇪🇸' },
    { s: 'Ghoomar', f: 'Padmaavat', e: '🌀💃' },
    { s: 'Rock On', f: 'Rock On!!', e: '🎸🤘' },
    { s: 'Swag Se Swagat', f: 'Tiger Zinda Hai', e: '😎🙏' },
    { s: 'Nagada Sang Dhol', f: 'Goliyon Ki Raasleela Ram-Leela', e: '🥁🥁🪘' },
    { s: 'Raataan Lambiyan', f: 'Shershaah', e: '🌙📏' }
  ]
};
