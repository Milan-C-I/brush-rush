"use client"

import wordsData from "../data/words.json"

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

class WordManager {
  private categories: Record<string, WordCategory>
  private customWordSets: CustomWordSet[] = []

  constructor() {
    this.categories = wordsData.categories as Record<string, WordCategory>
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

    if (settings.wordSelectionMode === "random") {
      // Mix of all available words
      const allWords = this.getAllAvailableWords(settings)
      if (allWords.length === 0) {
        return this.getFallbackWord()
      }

      const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
      return randomWord
    }

    // Category-based selection
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

    // Filter by difficulty if not mixed
    if (settings.difficulty !== "mixed") {
      availableCategories = availableCategories.filter(([, category]) => category.difficulty === settings.difficulty)
    }

    if (availableCategories.length === 0) {
      return this.getFallbackWord()
    }

    // Select random category
    const [categoryName, category] = availableCategories[Math.floor(Math.random() * availableCategories.length)]

    // Select random word from category
    const randomWord = category.words[Math.floor(Math.random() * category.words.length)]

    return {
      word: randomWord,
      category: categoryName,
      difficulty: category.difficulty,
      basePoints: category.basePoints,
      isCustom: false,
    }
  }

  private getAllAvailableWords(settings: WordManagerSettings): Array<{
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  }> {
    const words: Array<{
      word: string
      category: string
      difficulty: string
      basePoints: number
      isCustom: boolean
    }> = []

    // Add category words
    Object.entries(this.categories).forEach(([categoryName, category]) => {
      if (settings.selectedCategories.includes(categoryName)) {
        if (settings.difficulty === "mixed" || category.difficulty === settings.difficulty) {
          category.words.forEach((word) => {
            words.push({
              word,
              category: categoryName,
              difficulty: category.difficulty,
              basePoints: category.basePoints,
              isCustom: false,
            })
          })
        }
      }
    })

    // Add custom words if enabled
    if (settings.includeCustomWords && settings.customWordSets.length > 0) {
      settings.customWordSets.forEach((set) => {
        set.words.forEach((word) => {
          words.push({
            word,
            category: "Custom",
            difficulty: "medium",
            basePoints: 75,
            isCustom: true,
          })
        })
      })
    }

    return words
  }

  private getFallbackWord(): {
    word: string
    category: string
    difficulty: string
    basePoints: number
    isCustom: boolean
  } {
    const fallbackWords = this.categories["Animals"]?.words || ["CAT", "DOG", "FISH"]
    const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]

    return {
      word: randomWord,
      category: "Animals",
      difficulty: "easy",
      basePoints: 50,
      isCustom: false,
    }
  }

  validateCustomWords(words: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    words.forEach((word) => {
      const trimmed = word.trim()
      if (trimmed.length >= 2 && trimmed.length <= 30 && /^[a-zA-Z\s\-']+$/.test(trimmed)) {
        valid.push(trimmed.toUpperCase())
      } else {
        invalid.push(word)
      }
    })

    return { valid, invalid }
  }
}

export const wordManager = new WordManager()
