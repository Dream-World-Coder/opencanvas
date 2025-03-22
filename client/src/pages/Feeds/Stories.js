const stories = [
    {
        id: 1,
        title: "The Silent Hours",
        excerpt:
            "In those moments between dusk and darkness, when the world grows quiet and memories surface like stars in the evening sky...",
        type: "Prose",
        date: "12/10/2024",
        likes: 156,
        saves: 42,
        author: "Eleanor Wells",
        // gradient: "from-sky-200 to-sky-50",
    },
    {
        id: 2,
        title: "Leaves of Yesterday",
        excerpt:
            "Autumn leaves whisper tales of seasons past,\nTheir golden hues a testament to time,\nDancing on winds both gentle and vast,\nNature's poetry in motion sublime.",
        type: "Poetry",
        date: "12/10/2024",
        likes: 123,
        saves: 38,
        author: "Thomas Blake",
    },
    {
        id: 3,
        title: "Letters from the Sea",
        excerpt:
            "The lighthouse keeper's daughter found the first bottle on a Tuesday morning, its glass worn smooth by the endless tides...",
        type: "Short Story",
        date: "12/10/2024",
        likes: 189,
        saves: 56,
        author: "Marie Laurent",
    },
    {
        id: 4,
        title: "বনলতা সেন",
        excerpt: `হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে,
      সিংহল সমুদ্র থেকে নিশীথের অন্ধকারে মালয় সাগরে
      অনেক ঘুরেছি আমি; বিম্বিসার অশোকের ধূসর জগতে
      সেখানে ছিলাম আমি; আরো দূর অন্ধকারে বিদর্ভ নগরে;
      আমি ক্লান্ত প্রাণ এক, চারিদিকে জীবনের সমুদ্র সফেন,
      আমারে দু-দণ্ড শান্তি দিয়েছিল নাটোরের বনলতা সেন।

      চুল তার কবেকার অন্ধকার বিদিশার নিশা,
      মুখ তার শ্রাবস্তীর কারুকার্য; অতিদূর সমুদ্রের 'পর
      হাল ভেঙে যে নাবিক হারায়েছে দিশা
      সবুজ ঘাসের দেশ যখন সে চোখে দেখে দারুচিনি-দ্বীপের ভিতর,
      তেমনি দেখেছি তারে অন্ধকারে; বলেছে সে, 'এতদিন কোথায় ছিলেন?'
      পাখির নীড়ের মতো চোখ তুলে নাটোরের বনলতা সেন।

      সমস্ত দিনের শেষে শিশিরের শব্দের মতন
      সন্ধ্যা আসে; ডানার রৌদ্রের গন্ধ মুছে ফেলে চিল;
      পৃথিবীর সব রঙ নিভে গেলে পাণ্ডুলিপি করে আয়োজন
      তখন গল্পের তরে জোনাকির রঙে ঝিলমিল;
      সব পাখি ঘরে আসে—সব নদী—ফুরায় এ-জীবনের সব লেন দেন;
      থাকে শুধু অন্ধকার, মুখোমুখি বসিবার বনলতা সেন।`,
        type: "Poetry",
        date: "12/10/2024",
        likes: 144,
        saves: 47,
        author: "জীবনানন্দ দাশ",
    },
    {
        id: 5,
        title: "Shadows of Tomorrow",
        excerpt:
            "Beneath the looming skyscrapers, a boy dreams of stars unseen, of places untouched by the chaos of modern life...",
        type: "Prose",
        date: "Summer, 2024",
        likes: 132,
        saves: 34,
        author: "Amelia Kent",
    },
    {
        id: 6,
        title: "Echoes in the Fog",
        excerpt:
            "A lone figure moved through the dense fog, their footsteps echoing against cobblestones worn by centuries of history...",
        type: "Short Story",
        date: "12/10/2024",
        likes: 203,
        saves: 63,
        author: "Nathaniel Grey",
    },
    {
        id: 7,
        title: "Rain's Serenade",
        excerpt:
            "The rain plays its soft symphony on the windowpanes,\nEach drop a note, each pause a rest,\nNature's lullaby for the weary souls...",
        type: "Poetry",
        date: "Monsoon, 2024",
        likes: 158,
        saves: 41,
        author: "Isabella Hart",
    },
    {
        id: 8,
        title: "The Keeper of Lanterns",
        excerpt:
            "Every night, as the village slept, she walked the cobbled streets, lighting the lanterns and carrying stories in her wake...",
        type: "Prose",
        date: "12/10/2024",
        likes: 187,
        saves: 54,
        author: "Julia Marlowe",
    },
    {
        id: 9,
        title: "Fragments of Dreams",
        excerpt:
            "In the silence of the midnight hour,\nDreams unravel their mysteries,\nWhispering secrets of the soul,\nIn fleeting moments of clarity.",
        type: "Poetry",
        date: "12/10/2024",
        likes: 125,
        saves: 39,
        author: "Edward Holloway",
    },
    {
        id: 10,
        title: "Beneath the Willow Tree",
        excerpt:
            "As children, they carved their names into the tree\u2019s bark, a promise to never forget, even as the years pulled them apart...",
        type: "Short Story",
        date: "Summer, 2024",
        likes: 195,
        saves: 58,
        author: "Sophia Clarke",
    },
    {
        id: 11,
        title: "Songs of the Wild",
        excerpt:
            "Deep in the heart of the forest, where sunlight barely touched the earth, the call of the wild sang in untamed harmony...",
        type: "Prose",
        date: "12/10/2024",
        likes: 145,
        saves: 46,
        author: "Oliver Grant",
    },
    {
        id: 12,
        title: "Frost's Embrace",
        excerpt:
            "Winter wraps the world in its icy arms,\nA fleeting hush before spring's rebirth,\nIn its cold beauty, it charms,\nThe sleeping earth.",
        type: "Poetry",
        date: "12/10/2024",
        likes: 139,
        saves: 37,
        author: "Lydia Vaughn",
    },
    {
        id: 13,
        title: "The Clockmaker's Secret",
        excerpt:
            "In the quiet of his workshop, surrounded by ticking timepieces, the clockmaker worked tirelessly, guarding a secret older than time...",
        type: "Short Story",
        date: "12/10/2024",
        likes: 211,
        saves: 68,
        author: "Henry Adler",
    },
    {
        id: 14,
        title: "Threads of Gold",
        excerpt:
            "In the bustling marketplace, amidst the chaos of voices and colors, she wove tales of ancient legends with threads of gold...",
        type: "Prose",
        date: "Summer, 2024",
        likes: 172,
        saves: 49,
        author: "Annabelle Frost",
    },
    {
        id: 15,
        title: "Reflections at Dusk",
        excerpt:
            "As the sun dipped below the horizon, its final rays caught the edge of the lake, turning its surface into molten gold...",
        type: "Prose",
        date: "12/10/2024",
        likes: 167,
        saves: 43,
        author: "Samuel Beckett",
    },
    {
        id: 16,
        title: "Whispers of the Wind",
        excerpt:
            "The wind carried stories of distant lands, its whispers echoing through the valleys and filling the night with mystery...",
        type: "Poetry",
        date: "12/10/2024",
        likes: 133,
        saves: 44,
        author: "Fiona Harper",
    },
    {
        id: 17,
        title: "The Silent Hours",
        excerpt:
            "In those moments between dusk and darkness, when the world grows quiet and memories surface like stars in the evening sky...",
        type: "Prose",
        date: "12/10/2024",
        likes: 156,
        saves: 42,
        author: "Eleanor Wells",
    },
];
export default stories;
