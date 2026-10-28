// Ellington's launch film (the WhatsApp copy, 1024×576) and its chapters,
// timed to the cuts in the footage. Swap in the 4K master when it arrives.

export const launchFilm = {
  src: "/media/film/launch-film.mp4",
  poster: "/media/film/launch-film-poster.jpg",
  /** Seconds; the player reads the real figure once metadata loads. */
  duration: 157,
  credit: "Ellington Properties",
  chapters: [
    { t: 0, label: "Business Bay" },
    { t: 13.2, label: "Beside the Metro" },
    { t: 43, label: "Shaped by silk" },
    { t: 57.2, label: "Arrival" },
    { t: 85.4, label: "Double-deck lifts" },
    { t: 88.6, label: "Robotic parking" },
    { t: 94, label: "Amenities" },
    { t: 129.6, label: "Vertiport" },
  ],
} as const;

/** The film's double-deck lift shot (86.5–88.6 s), slowed to a 4 s loop. */
export const liftLoop = {
  src: "/media/film/double-deck-lifts.mp4",
  poster: "/media/film/double-deck-lifts-poster.jpg",
} as const;
