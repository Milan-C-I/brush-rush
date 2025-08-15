"use client"

export interface WordCategory {
  difficulty: "easy" | "medium" | "hard"
  basePoints: number
  words: string[]
}

export interface CustomWordSet {
  id: string
  name: string
  words: string[]
  createdBy: string
  createdAt: string
}

export interface WordManagerSettings {
  selectedCategories: string[]
  difficulty: "mixed" | "easy" | "medium" | "hard"
  includeCustomWords: boolean
  customWordSets: CustomWordSet[]
  wordSelectionMode: "category" | "random" | "custom-only"
}

const DEFAULT_CATEGORIES = {
  Animals: {
    difficulty: "easy" as const,
    basePoints: 50,
    words: ["CAT", "DOG", "FISH", "BIRD", "HORSE", "COW", "PIG", "SHEEP"],
  },
  Objects: {
    difficulty: "medium" as const,
    basePoints: 75,
    words: ["CHAIR", "TABLE", "BOOK", "PHONE", "COMPUTER", "CAMERA"],
  },
  Food: {
    difficulty: "easy" as const,
    basePoints: 50,
    words: ["PIZZA", "BURGER", "APPLE", "BANANA", "CAKE", "COOKIE"],
  },
  Nature: {
    difficulty: "medium" as const,
    basePoints: 75,
    words: ["TREE", "FLOWER", "MOUNTAIN", "OCEAN", "RIVER", "LAKE"],
  },
}

class WordManager {
  private categories: Record<string, WordCategory>
  private customWordSets: CustomWordSet[] = []

  constructor() {
    this.categories = DEFAULT_CATEGORIES
    this.loadCustomWords()
  }

  private loadCustomWords() {
    try {
      const saved = localStorage.getItem("drawTogether_customWords")
      if (saved) {
        this.customWordSets = JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load custom words:", error)
    }
  }

  private saveCustomWords() {
    try {
      localStorage.setItem("drawTogether_customWords", JSON.stringify(this.customWordSets))
    } catch (error) {
      console.error("Failed to save custom words:", error)
    }
  }

  getCategories(): Record<string, WordCategory> {
    return this.categories
  }

  getCategoryNames(): string[] {
    return Object.keys(this.categories)
  }

  addCustomWordSet(name: string, words: string[], createdBy: string): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const customSet: CustomWordSet = {
      id,
      name,
      words: words.filter((word) => word.trim().length > 0).map((word) => word.trim().toUpperCase()),
      createdBy,
      createdAt: new Date().toISOString(),
    }

    this.customWordSets.push(customSet)
    this.saveCustomWords()
    return id
  }

  removeCustomWordSet(id: string): boolean {
    const index = this.customWordSets.findIndex((set) => set.id === id)
    if (index !== -1) {
      this.customWordSets.splice(index, 1)
      this.saveCustomWords()
      return true
    }
    return false
  }

  getCustomWordSets(): CustomWordSet[] {
    return this.customWordSets
  }

  selectWord(settings: WordManagerSettings): {
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  } {
    if (settings.wordSelectionMode === "custom-only" && settings.customWordSets.length > 0) {
      return this.selectFromCustomWords(settings.customWordSets)
    }

    return this.selectFromCategories(settings)
  }

  private selectFromCustomWords(customSets: CustomWordSet[]): {
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  } {
    const allCustomWords: string[] = []
    customSets.forEach((set) => {
      allCustomWords.push(...set.words)
    })

    if (allCustomWords.length === 0) {
      return this.getFallbackWord()
    }

    const randomWord = allCustomWords[Math.floor(Math.random() * allCustomWords.length)]
    return {
      word: randomWord,
      category: "Custom",
      difficulty: "medium",
      basePoints: 75,
      isCustom: true,
    }
  }

  private selectFromCategories(settings: WordManagerSettings): {
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  } {
    let availableCategories = Object.entries(this.categories).filter(([name]) =>
      settings.selectedCategories.includes(name),
    )

    if (settings.difficulty !== "mixed") {
      availableCategories = availableCategories.filter(([, category]) => category.difficulty === settings.difficulty)
    }

    if (availableCategories.length === 0) {
      return this.getFallbackWord()
    }

    const [categoryName, category] = availableCategories[Math.floor(Math.random() * availableCategories.length)]
    const randomWord = category.words[Math.floor(Math.random() * category.words.length)]

    return {
      word: randomWord,
      category: categoryName,
      difficulty: category.difficulty,
      basePoints: category.basePoints,
      isCustom: false,
    }
  }

  private getFallbackWord(): {
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  } {
    return {
      word: "CAT",
      category: "Animals",
      difficulty: "easy",
      basePoints: 50,
      isCustom: false,
    }
  }
}

export const wordManager = new WordManager()
