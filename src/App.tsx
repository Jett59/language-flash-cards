import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './App.css'

type FlashCard = {
  id: string
  prompt: string
  translation: string
  hint?: string
  correct: number
  attempts: number
}

type Direction = 'forward' | 'reverse'
type Result = 'correct' | 'close' | 'missed' | null

const STORAGE_KEY = 'lingo-deck-cards'

const starterCards: FlashCard[] = [
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

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.!?¡¿]/g, '')
}

function shuffleIds(cardsToShuffle: FlashCard[]) {
  const ids = cardsToShuffle.map((card) => card.id)

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]]
  }

  return ids
}

function readStoredCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return starterCards
    }

    const parsed = JSON.parse(stored) as FlashCard[]
    if (!Array.isArray(parsed)) {
      return starterCards
    }

    return parsed
  } catch {
    return starterCards
  }
}

function App() {
  const [cards, setCards] = useState<FlashCard[]>(readStoredCards)
  const [practiceQueue, setPracticeQueue] = useState<string[]>(() => shuffleIds(cards))
  const [queueIndex, setQueueIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [answer, setAnswer] = useState('')
  const [showTranslation, setShowTranslation] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [form, setForm] = useState({ prompt: '', translation: '', hint: '' })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    if (queueIndex > practiceQueue.length - 1) {
      setQueueIndex(Math.max(practiceQueue.length - 1, 0))
    }
  }, [practiceQueue.length, queueIndex])

  const currentCardId = practiceQueue[queueIndex]
  const currentCard = cards.find((card) => card.id === currentCardId)

  const stats = useMemo(() => {
    const attempts = cards.reduce((total, card) => total + card.attempts, 0)
    const correct = cards.reduce((total, card) => total + card.correct, 0)
    const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100)

    return { attempts, correct, accuracy }
  }, [cards])

  const promptLabel = direction === 'forward' ? 'Translate this' : 'Recall the phrase'
  const promptText = direction === 'forward' ? currentCard?.prompt : currentCard?.translation
  const expectedAnswer = direction === 'forward' ? currentCard?.translation : currentCard?.prompt

  function resetPracticeState(nextIndex = queueIndex) {
    setQueueIndex(nextIndex)
    setAnswer('')
    setShowTranslation(false)
    setResult(null)
  }

  function handleCheckAnswer(event: FormEvent) {
    event.preventDefault()

    if (showTranslation) {
      handleNextCard()
      return
    }

    if (!currentCard || !expectedAnswer) {
      return
    }

    const userAnswer = normalizeAnswer(answer)
    const expected = normalizeAnswer(expectedAnswer)

    if (!userAnswer) {
      setResult('missed')
      setShowTranslation(true)
      return
    }

    const isCorrect = userAnswer === expected
    const isClose = expected.includes(userAnswer) || userAnswer.includes(expected)

    setResult(isCorrect ? 'correct' : isClose ? 'close' : 'missed')
    setShowTranslation(true)
    setCards((deck) =>
      deck.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              attempts: card.attempts + 1,
              correct: card.correct + (isCorrect ? 1 : 0),
            }
          : card,
      ),
    )
  }

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !showTranslation) {
      return
    }

    event.preventDefault()
    handleNextCard()
  }

  function handleNextCard() {
    if (cards.length === 0) {
      return
    }

    if (queueIndex === practiceQueue.length - 1) {
      setPracticeQueue(shuffleIds(cards))
      resetPracticeState(0)
      return
    }

    resetPracticeState(queueIndex + 1)
  }

  function handleShuffleDeck() {
    setPracticeQueue(shuffleIds(cards))
    resetPracticeState(0)
  }

  function handleAddCard(event: FormEvent) {
    event.preventDefault()

    const prompt = form.prompt.trim()
    const translation = form.translation.trim()
    const hint = form.hint.trim()

    if (!prompt || !translation) {
      return
    }

    const newCard: FlashCard = {
      id: crypto.randomUUID(),
      prompt,
      translation,
      hint,
      correct: 0,
      attempts: 0,
    }

    setCards((deck) => [newCard, ...deck])
    setPracticeQueue((queue) => [newCard.id, ...queue])
    setForm({ prompt: '', translation: '', hint: '' })
    resetPracticeState(0)
  }

  function handleDeleteCard(cardId: string) {
    setCards((deck) => deck.filter((card) => card.id !== cardId))
    setPracticeQueue((queue) => queue.filter((id) => id !== cardId))
    resetPracticeState(0)
  }

  function handleClearDeck() {
    setCards(starterCards)
    setPracticeQueue(shuffleIds(starterCards))
    resetPracticeState(0)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Language practice</p>
          <h1>Build a deck. Test your recall.</h1>
        </div>
        <div className="stats-grid" aria-label="Deck progress">
          <div>
            <span>{cards.length}</span>
            <small>cards</small>
          </div>
          <div>
            <span>{stats.attempts}</span>
            <small>attempts</small>
          </div>
          <div>
            <span>{stats.accuracy}%</span>
            <small>accuracy</small>
          </div>
        </div>
      </section>

      <div className="workspace">
        <section className="practice-panel" aria-label="Practice flash cards">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{promptLabel}</p>
              <h2>Practice</h2>
            </div>
            <div className="segmented-control" aria-label="Practice direction">
              <button
                className={direction === 'forward' ? 'active' : ''}
                onClick={() => {
                  setDirection('forward')
                  resetPracticeState()
                }}
                type="button"
              >
                Word
              </button>
              <button
                className={direction === 'reverse' ? 'active' : ''}
                onClick={() => {
                  setDirection('reverse')
                  resetPracticeState()
                }}
                type="button"
              >
                Translation
              </button>
            </div>
          </div>

          {currentCard ? (
            <>
              <article className={`flash-card ${showTranslation ? 'revealed' : ''}`}>
                <span className="card-count">
                  {queueIndex + 1} / {cards.length}
                </span>
                <p aria-atomic="true" aria-live="polite">
                  {promptText}
                </p>
                {currentCard.hint ? <small>{currentCard.hint}</small> : null}
              </article>

              <form className="answer-form" onSubmit={handleCheckAnswer}>
                <label htmlFor="answer">Your answer</label>
                <div className="answer-row">
                  <input
                    id="answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleAnswerKeyDown}
                    placeholder={showTranslation ? 'Press Enter for next card' : 'Type your answer'}
                    autoComplete="off"
                  />
                  <button type="submit">{showTranslation ? 'Next' : 'Check'}</button>
                </div>
              </form>

              <div className="feedback" aria-live="polite">
                {showTranslation ? (
                  <>
                    <p className={result ?? undefined}>
                      {result === 'correct'
                        ? 'Correct'
                        : result === 'close'
                          ? 'Close'
                          : 'Review this one'}
                    </p>
                    <strong>{expectedAnswer}</strong>
                  </>
                ) : (
                  <p>Enter your answer, then check it when you are ready.</p>
                )}
              </div>

              <div className="practice-actions">
                <button type="button" className="secondary" onClick={() => setShowTranslation(true)}>
                  Reveal
                </button>
                <button type="button" className="secondary" onClick={handleShuffleDeck}>
                  Shuffle
                </button>
                <button type="button" onClick={handleNextCard}>
                  Next card
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>No cards yet</h2>
              <p>Add your first word and translation to begin practicing.</p>
            </div>
          )}
        </section>

        <aside className="deck-panel" aria-label="Manage deck">
          <form className="add-card-form" onSubmit={handleAddCard}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Deck builder</p>
                <h2>Add card</h2>
              </div>
            </div>
            <label>
              Word or phrase
              <input
                value={form.prompt}
                onChange={(event) => setForm({ ...form, prompt: event.target.value })}
                placeholder="e.g. Buenas noches"
              />
            </label>
            <label>
              Translation
              <input
                value={form.translation}
                onChange={(event) => setForm({ ...form, translation: event.target.value })}
                placeholder="e.g. Good evening"
              />
            </label>
            <label>
              Hint
              <input
                value={form.hint}
                onChange={(event) => setForm({ ...form, hint: event.target.value })}
                placeholder="Optional"
              />
            </label>
            <button type="submit">Add card</button>
          </form>

          <div className="deck-list-header">
            <h2>Your deck</h2>
            <button type="button" className="text-button" onClick={handleClearDeck}>
              Reset
            </button>
          </div>
          <div className="deck-list">
            {cards.map((card) => (
              <article
                className={`deck-item ${card.id === currentCard?.id ? 'selected' : ''}`}
                key={card.id}
              >
                <button
                  type="button"
                  className="deck-select"
                  onClick={() => {
                    const indexInQueue = practiceQueue.findIndex((id) => id === card.id)
                    resetPracticeState(indexInQueue === -1 ? 0 : indexInQueue)
                  }}
                >
                  <span>{card.prompt}</span>
                  <small>{card.translation}</small>
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDeleteCard(card.id)}
                  aria-label={`Delete ${card.prompt}`}
                >
                  x
                </button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
