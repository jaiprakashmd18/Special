/**
 * PROJECT AMMU — single place to personalise everything.
 * Edit this file only; no component needs to change for text, photos, audio or flags.
 */

export type Photo = { src: string; enabled: boolean; caption: string; alt: string };

export const ammu = {
  names: { her: "Jayasri", nickname: "Ammu", him: "Jaanu" },
  birthday: { month: 12, day: 8, year: 2005, celebrationYear: 2026, age: 21 },
  firstMeetPlace: "SPAR",

  theme: {
    blushPink: "#F8C8DC",
    lavender: "#CDB4F6",
    romanticRose: "#E98AAE",
    softWhite: "#FFF7FA",
    roseGold: "#D8A7A0",
    midnightPlum: "#23152F",
    goldenGlow: "#F8DFA5",
  },

  features: {
    /** Offer the optional "blow into your microphone" candle mode (never required). */
    micBlowing: true,
    /** Allow `?chapter=N` in the URL to jump straight to a chapter (handy for previewing). */
    chapterJump: true,
    /** Show the skip-intro button in chapter 1. */
    skipIntro: true,
    /** Post-processing bloom on capable devices. */
    bloom: true,
  },

  /**
   * Voice message — set `enabled: true` AFTER you put the recording at
   * public/audio/jaanu-message.mp3. While false (or if the file fails to load)
   * the written message is shown instead. No request is made to the file when disabled.
   */
  voiceMessage: {
    enabled: false,
    src: "/audio/jaanu-message.mp3",
    title: "Ammu… This One Is From My Heart ❤️",
    fallbackLines: [
      "Ammu…",
      "I made this little world because you're really special to me.",
      "There are so many things I appreciate about you.",
      "The way you handle me.",
      "The way you care for me.",
      "And especially the way you understand the little things that hurt me.",
      "You probably don't even realize how much those things mean to me.",
      "I'm really glad I met you.",
      "And there's one last thing I want to ask you…",
    ],
  },

  /**
   * Background music. By default Project Ammu synthesises original, royalty-free
   * ambient piano/strings in the browser (Web Audio) — nothing to license.
   * To use your own legally-usable files instead, set `files.<mood>` to a path
   * under /public/audio and set `useFiles: true`.
   */
  music: {
    useFiles: false,
    defaultVolume: 0.55,
    files: {
      opening: "/audio/music/opening.mp3",
      birthday: "/audio/music/birthday.mp3",
      memory: "/audio/music/memory.mp3",
      tender: "/audio/music/tender.mp3",
      gallery: "/audio/music/gallery.mp3",
      letter: "/audio/music/letter.mp3",
      garden: "/audio/music/garden.mp3",
      quiet: "/audio/music/quiet.mp3",
      proposal: "/audio/music/proposal.mp3",
    },
  },

  /** Put photos in /public/photos and flip `enabled` to true. Max 5 recommended (more are supported). */
  sparPhoto: { src: "/photos/spar.webp", enabled: false, alt: "Our first meeting at SPAR" },
  photos: [
    { src: "/photos/photo-1.webp", enabled: false, caption: "A moment worth remembering.", alt: "Photo 1" },
    { src: "/photos/photo-2.webp", enabled: false, caption: "Some memories stay in your heart.", alt: "Photo 2" },
    { src: "/photos/photo-3.webp", enabled: false, caption: "I'm glad our paths crossed.", alt: "Photo 3" },
    { src: "/photos/photo-4.webp", enabled: false, caption: "Little moments can mean so much.", alt: "Photo 4" },
    { src: "/photos/photo-5.webp", enabled: false, caption: "Here's to the memories still waiting for us.", alt: "Photo 5" },
  ] as Photo[],

  chapters: {
    invitation: {
      lines: [
        "Some people enter our lives…",
        "And somehow make everything feel a little more beautiful.",
        "Today, there's a little world waiting for someone very special.",
      ],
      title: "A Little Surprise For My Ammu 💗",
      button: "Open Your Surprise ✨",
    },
    birthday: {
      title: "Happy 21st Birthday, My Ammu! ❤️",
      body: [
        "December 8 is special because it's the day someone truly wonderful came into this world.",
        "Ammu, I hope this new year of your life is filled with beautiful moments, peaceful days, fulfilled dreams, and countless reasons to smile.",
      ],
      wish: ["Make a wish, Ammu. ✨", "May every beautiful dream in your heart find its way into reality."],
    },
    meeting: {
      lines: [
        "Every beautiful story starts somewhere…",
        "Ours started with a meeting at SPAR.",
        "I didn't know that day just how special you would become to me.",
        "Sometimes, the most meaningful people enter our lives through the simplest moments.",
      ],
      card: "Our First Meet — SPAR ❤️",
    },
    little: {
      title: "The Little Things I Love About You",
      memories: [
        { label: "Your Care", text: "I love the way you care about me, Ammu. Even your smallest gestures can mean so much." },
        { label: "Your Understanding", text: "You have this beautiful way of trying to understand me, even when I don't explain everything perfectly." },
        { label: "Your Consideration", text: "You notice the things that hurt me, and you try not to repeat them. That simple kindness means more to me than I can ever properly explain." },
        { label: "Your Presence", text: "Some people make moments feel better just by being there. You're becoming one of those people in my life." },
        { label: "Just Being You", text: "I don't need you to change who you are. The little things that make you Ammu are the very things that make you special to me." },
      ],
    },
    gallery: { title: "Little Moments. Beautiful Memories." },
    letter: {
      lead: "Ammu, there's something I want you to read…",
      button: "Open My Letter ❤️",
      paragraphs: [
        "Dear Ammu,",
        "I don't know if I'll ever find the perfect words to explain how much you mean to me.",
        "But I want to try.",
        "From the day I met you, I never imagined how special you would become in my life.",
        "I love the way you care for me.",
        "I love how you try to understand me.",
        "And I especially love the way you notice the little things that hurt me and try not to let them happen again.",
        "Maybe those moments feel ordinary to you.",
        "But to me, they are beautiful reminders that someone genuinely cares.",
        "You've become someone I appreciate deeply.",
        "And on your birthday, I want you to know that you deserve every happiness this world can offer.",
        "I hope you always keep that beautiful heart of yours.",
        "I hope your dreams become reality.",
        "And I hope you never forget how special you are.",
        "Happy Birthday, my Ammu.",
        "With lots of affection,",
        "Your Jaanu ❤️",
      ],
    },
    wishes: {
      title: "The Garden of Wishes",
      wishes: [
        "May your smile always shine.",
        "May you achieve everything you dream of.",
        "May life always treat your heart gently.",
        "May you find happiness in the smallest things.",
        "May every new day bring something wonderful.",
        "May you always feel appreciated and loved.",
      ],
      final: "And there's one more thing I wish for…",
      button: "Follow the Light ✨",
    },
    quiet: {
      lines: [
        "Ammu…",
        "Can I tell you something?",
        "…",
        "I didn't create all this only to wish you a happy birthday.",
        "I also wanted to show you how much you mean to me.",
        "Your care, your kindness, and your understanding have become so precious to me.",
        "There's something I've wanted to say from my heart.",
      ],
      button: "I'm Listening ❤️",
    },
    proposal: {
      intro: [
        "Ammu…",
        "Life is unpredictable.",
        "And I don't know everything our future holds.",
        "But I know how much you mean to me.",
        "I love the way you care for me.",
        "I love the way you understand me.",
        "And I love the beautiful little things that make you who you are.",
      ],
      letter: [
        "My Dearest Ammu,",
        "Sometimes, the most beautiful things in life happen when we least expect them.",
        "Meeting you was one of those moments for me.",
        "I never imagined that someone I met so simply would become someone I care about this much.",
        "You've shown me how meaningful the little things can be.",
        "The way you understand me.",
        "The way you notice what hurts me.",
        "The way you try to protect my feelings.",
        "The way you care.",
        "Those little things have found a very special place in my heart.",
        "Ammu, I don't know what tomorrow will bring.",
        "I know there will be happy days, difficult days, silly arguments, unforgettable memories, and moments when we still have a lot to learn about each other.",
        "But I want to keep choosing kindness, understanding, patience, and love.",
        "I want to be someone who makes you smile.",
        "Someone who listens to you.",
        "Someone who values your feelings just as you value mine.",
        "Someone who celebrates your happiness and supports your dreams.",
        "I don't need a perfect love story.",
        "I just want a beautiful, honest one.",
        "And if your heart feels the same, I would love to build that story with you.",
        "So on your special day, with all the love and sincerity in my heart, I want to ask you one little question…",
      ],
      question: ["AMMU…", "WILL YOU BE MINE FOREVER? ❤️"],
      signoff: ["With all my heart,", "Your Jaanu ❤️"],
      yesLabel: "Yes, Jaanu ❤️",
      timeLabel: "I Need a Little Time 💗",
      yes: {
        lines: [
          "You just made my heart smile, Ammu. ❤️",
          "Here's to every beautiful moment ahead of us.",
          "Forever sounds beautiful with you.",
        ],
        names: "Jaanu ❤️ Ammu",
        tagline: "Our Beautiful Story Continues…",
      },
      time: {
        lines: [
          "That's okay, Ammu. ❤️",
          "Take all the time your heart needs.",
          "Your happiness and comfort will always matter.",
          "Happy Birthday, my special girl.",
        ],
        returnLabel: "Return to the birthday ✨",
      },
    },
  },
} as const;

export type Ammu = typeof ammu;
