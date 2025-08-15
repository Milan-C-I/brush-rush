"use client"

export interface WordCategory {
  name: string
  difficulty: "easy" | "medium" | "hard"
  words: string[]
  basePoints: number
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: "Animals",
    difficulty: "easy",
    basePoints: 50,
    words: [
      "CAT",
      "DOG",
      "FISH",
      "BIRD",
      "HORSE",
      "COW",
      "PIG",
      "SHEEP",
      "DUCK",
      "FROG",
      "RABBIT",
      "MOUSE",
      "BEAR",
      "LION",
      "TIGER",
      "ELEPHANT",
      "GIRAFFE",
      "MONKEY",
      "PENGUIN",
      "DOLPHIN",
    ],
  },
  {
    name: "Objects",
    difficulty: "medium",
    basePoints: 75,
    words: [
      "CHAIR",
      "TABLE",
      "BOOK",
      "PHONE",
      "COMPUTER",
      "CAMERA",
      "GUITAR",
      "PIANO",
      "BICYCLE",
      "CAR",
      "AIRPLANE",
      "BOAT",
      "UMBRELLA",
      "CLOCK",
      "LAMP",
      "MIRROR",
      "SCISSORS",
      "HAMMER",
    ],
  },
  {
    name: "Food",
    difficulty: "easy",
    basePoints: 50,
    words: [
      "PIZZA",
      "BURGER",
      "SANDWICH",
      "APPLE",
      "BANANA",
      "ORANGE",
      "CAKE",
      "COOKIE",
      "ICE CREAM",
      "CHOCOLATE",
      "BREAD",
      "CHEESE",
      "PASTA",
      "RICE",
    ],
  },
  {
    name: "Nature",
    difficulty: "medium",
    basePoints: 75,
    words: [
      "TREE",
      "FLOWER",
      "MOUNTAIN",
      "OCEAN",
      "RIVER",
      "LAKE",
      "FOREST",
      "DESERT",
      "RAINBOW",
      "CLOUD",
      "SUN",
      "MOON",
      "STAR",
    ],
  },
]

export interface GameSettings {
  roundTime: number
  maxRounds: number
  pointsForCorrectGuess: number
  pointsForDrawer: number
  hintTimings: number[]
  categories: string[]
  difficulty: "mixed" | "easy" | "medium" | "hard"
}

export interface GameStats {
  totalGames: number,
  totalWins: number,
  totalPoints: number,
  averageScore: number,
  bestScore: number,
  favoriteCategory: string,
  correctGuesses: number,
  totalGuesses: number,
  guessAccuracy: number,
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  roundTime: 90,
  maxRounds: 5,
  pointsForCorrectGuess: 100,
  pointsForDrawer: 50,
  hintTimings: [50, 70, 90],
  categories: ["Animals", "Objects", "Food", "Nature"],
  difficulty: "mixed",
}

export function selectRandomWord(settings: GameSettings): {
  word: string
  category: string
  difficulty: string
  basePoints: number
} {
  let availableCategories = WORD_CATEGORIES.filter((cat) => settings.categories.includes(cat.name))

  if (settings.difficulty !== "mixed") {
    availableCategories = availableCategories.filter((cat) => cat.difficulty === settings.difficulty)
  }

  if (availableCategories.length === 0) {
    availableCategories = WORD_CATEGORIES.slice(0, 4)
  }

  const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]
  const randomWord = randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)]

  return {
    word: randomWord,
    category: randomCategory.name,
    difficulty: randomCategory.difficulty,
    basePoints: randomCategory.basePoints,
  }
}
