export type FlashCard = {
  id: string
  prompt: string
  translation: string
  hint?: string
  correct: number
  attempts: number
}

export type Deck = {
  id: string
  name: string
  cards: FlashCard[]
}

export type DeckStore = {
  activeDeckId: string
  decks: Deck[]
}

export type Direction = 'forward' | 'reverse'
export type Result = 'correct' | 'close' | 'missed' | null

export type CardFormState = {
  prompt: string
  translation: string
  hint: string
}
