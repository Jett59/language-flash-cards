import type { FlashCard } from '../types'

export function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.!?]/g, '')
}

export function shuffleIds(cardsToShuffle: FlashCard[]) {
  const ids = cardsToShuffle.map((card) => card.id)

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]]
  }

  return ids
}

export function getDeckStats(cards: FlashCard[]) {
  const attempts = cards.reduce((total, card) => total + card.attempts, 0)
  const correct = cards.reduce((total, card) => total + card.correct, 0)
  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100)

  return { attempts, correct, accuracy }
}
