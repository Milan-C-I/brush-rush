"use client"

import { wordManager, type WordManagerSettings } from "./word-manager"

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
      "WHALE",
      "SHARK",
      "BUTTERFLY",
      "BEE",
      "SPIDER",
      "ANT",
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
      "PAINTBRUSH",
      "TELESCOPE",
      "MICROSCOPE",
      "CALCULATOR",
      "HEADPHONES",
      "MICROPHONE",
      "KEYBOARD",
      "MOUSE",
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
      "CHICKEN",
      "FISH",
      "SALAD",
      "SOUP",
      "COFFEE",
      "TEA",
      "JUICE",
      "WATER",
      "MILK",
      "EGG",
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
      "LIGHTNING",
      "TORNADO",
      "VOLCANO",
      "WATERFALL",
      "BEACH",
      "ISLAND",
      "CAVE",
      "ROCK",
      "GRASS",
      "LEAF",
      "BRANCH",
    ],
  },
  {
    name: "Actions",
    difficulty: "hard",
    basePoints: 100,
    words: [
      "RUNNING",
      "JUMPING",
      "SWIMMING",
      "DANCING",
      "SINGING",
      "COOKING",
      "READING",
      "WRITING",
      "DRAWING",
      "PAINTING",
      "SLEEPING",
      "EATING",
      "DRINKING",
      "WALKING",
      "FLYING",
      "CLIMBING",
      "DIGGING",
      "BUILDING",
      "THINKING",
      "LAUGHING",
      "CRYING",
      "SHOUTING",
      "WHISPERING",
      "HIDING",
      "SEARCHING",
      "CELEBRATING",
    ],
  },
  {
    name: "Abstract",
    difficulty: "hard",
    basePoints: 100,
    words: [
      "LOVE",
      "HAPPINESS",
      "SADNESS",
      "ANGER",
      "FEAR",
      "SURPRISE",
      "EXCITEMENT",
      "BOREDOM",
      "CONFUSION",
      "PEACE",
      "CHAOS",
      "FREEDOM",
      "FRIENDSHIP",
      "FAMILY",
      "DREAM",
      "NIGHTMARE",
      "MEMORY",
      "FUTURE",
      "PAST",
      "PRESENT",
      "HOPE",
      "FAITH",
      "TRUST",
      "BETRAYAL",
      "SUCCESS",
      "FAILURE",
    ],
  },
]

export interface GameSettings {
  roundTime: number
  maxRounds: number
  pointsForCorrectGuess: number
  pointsForDrawer: number
  hintTimings: number[] // Percentages of time when hints are revealed
  categories: string[]
  difficulty: "mixed" | "easy" | "medium" | "hard"
  wordSettings?: WordManagerSettings
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  roundTime: 90,
  maxRounds: 5,
  pointsForCorrectGuess: 100,
  pointsForDrawer: 50,
  hintTimings: [50, 70, 90], // Show hints at 50%, 70%, 90% of time elapsed
  categories: ["Animals", "Objects", "Food", "Nature"],
  difficulty: "mixed",
}

export function selectRandomWord(settings: GameSettings): {
  word: string
  category: string
  difficulty: string
  basePoints: number
  isCustom?: boolean
} {
  // Use new word manager if word settings are provided
  if (settings.wordSettings) {
    return wordManager.selectWord(settings.wordSettings)
  }

  // Fallback to original logic for backward compatibility
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
    isCustom: false,
  }
}

export function calculateScore(
  timeLeft: number,
  totalTime: number,
  basePoints: number,
  difficulty: string,
  isDrawer = false,
): number {
  // Base score calculation
  const timeBonus = Math.floor((timeLeft / totalTime) * 50) // Up to 50 bonus points for speed
  const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2

  let score = Math.floor((basePoints + timeBonus) * difficultyMultiplier)

  // Drawer gets 50% of guesser's points
  if (isDrawer) {
    score = Math.floor(score * 0.5)
  }

  return Math.max(10, score) // Minimum 10 points
}

export function generateHints(word: string, hintTimings: number[], timeElapsed: number, totalTime: number): boolean[] {
  const timePercentage = (timeElapsed / totalTime) * 100
  const revealed = new Array(word.length).fill(false)

  // Always reveal spaces and special characters
  for (let i = 0; i < word.length; i++) {
    if (word[i] === " " || word[i] === "-" || word[i] === "'") {
      revealed[i] = true
    }
  }

  // Reveal letters based on timing
  const lettersToReveal = Math.floor(word.replace(/[\s\-']/g, "").length * 0.3) // Reveal up to 30% of letters
  let revealedCount = 0

  for (const timing of hintTimings) {
    if (timePercentage >= timing && revealedCount < lettersToReveal) {
      // Find a random unrevealed letter
      const unrevealedIndices = []
      for (let i = 0; i < word.length; i++) {
        if (!revealed[i] && word[i] !== " " && word[i] !== "-" && word[i] !== "'") {
          unrevealedIndices.push(i)
        }
      }

      if (unrevealedIndices.length > 0) {
        const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)]
        revealed[randomIndex] = true
        revealedCount++
      }
    }
  }

  return revealed
}

export function checkGuess(guess: string, correctWord: string): { isCorrect: boolean; similarity: number } {
  const normalizedGuess = guess
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
  const normalizedWord = correctWord.toLowerCase().replace(/[^a-z0-9]/g, "")

  // Exact match
  if (normalizedGuess === normalizedWord) {
    return { isCorrect: true, similarity: 100 }
  }

  // Calculate similarity for close guesses
  const similarity = calculateStringSimilarity(normalizedGuess, normalizedWord)

  return { isCorrect: false, similarity }
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 100

  const editDistance = levenshteinDistance(longer, shorter)
  return Math.round(((longer.length - editDistance) / longer.length) * 100)
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export interface GameStats {
  totalGames: number
  totalWins: number
  totalPoints: number
  averageScore: number
  bestScore: number
  favoriteCategory: string
  correctGuesses: number
  totalGuesses: number
  guessAccuracy: number
}

export function updatePlayerStats(
  stats: GameStats,
  gameResult: {
    won: boolean
    score: number
    category: string
    correctGuesses: number
    totalGuesses: number
  },
): GameStats {
  return {
    totalGames: stats.totalGames + 1,
    totalWins: stats.totalWins + (gameResult.won ? 1 : 0),
    totalPoints: stats.totalPoints + gameResult.score,
    averageScore: Math.round((stats.totalPoints + gameResult.score) / (stats.totalGames + 1)),
    bestScore: Math.max(stats.bestScore, gameResult.score),
    favoriteCategory: gameResult.category, // Simplified - could track frequency
    correctGuesses: stats.correctGuesses + gameResult.correctGuesses,
    totalGuesses: stats.totalGuesses + gameResult.totalGuesses,
    guessAccuracy: Math.round(
      ((stats.correctGuesses + gameResult.correctGuesses) / (stats.totalGuesses + gameResult.totalGuesses)) * 100,
    ),
  }
}
