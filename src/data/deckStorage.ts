import type { Deck, DeckStore, FlashCard } from '../types'

const STORAGE_KEY = 'lingo-decks'
const LEGACY_STORAGE_KEY = 'lingo-deck-cards'
const STARTER_DECK_ID = 'starter-language-deck'

export const starterCards: FlashCard[] = [
  {
    id: 'bonjour',
    prompt: 'Bonjour',
    translation: 'Hello',
    hint: 'A friendly greeting',
    correct: 0,
    attempts: 0,
  },
  {
    id: 'gracias',
    prompt: 'Gracias',
    translation: 'Thank you',
    hint: 'Said after someone helps you',
    correct: 0,
    attempts: 0,
  },
  {
    id: 'guten-morgen',
    prompt: 'Guten Morgen',
    translation: 'Good morning',
    hint: 'Used early in the day',
    correct: 0,
    attempts: 0,
  },
]

function createStarterDeck(cards = starterCards): Deck {
  return {
    id: STARTER_DECK_ID,
    name: 'Starter phrases',
    cards,
  }
}

function readLegacyCards() {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as FlashCard[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function readStoredDecks(): DeckStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as DeckStore
      const hasDecks = Array.isArray(parsed.decks) && parsed.decks.length > 0
      const activeDeckExists = parsed.decks?.some((deck) => deck.id === parsed.activeDeckId)

      if (hasDecks && activeDeckExists) {
        return parsed
      }
    }
  } catch {
    // Fall through to the legacy migration or starter deck.
  }

  const starterDeck = createStarterDeck(readLegacyCards() ?? starterCards)

  return {
    activeDeckId: starterDeck.id,
    decks: [starterDeck],
  }
}

export function writeStoredDecks(deckStore: DeckStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deckStore))
}
