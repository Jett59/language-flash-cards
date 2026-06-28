import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Box, Container, CssBaseline, Stack, ThemeProvider, createTheme } from '@mui/material'
import { DeckManager } from './components/DeckManager'
import { HeroStats } from './components/HeroStats'
import { PracticePanel } from './components/PracticePanel'
import { readStoredDecks, writeStoredDecks } from './data/deckStorage'
import type { CardFormState, Deck, DeckStore, Direction, FlashCard, Result } from './types'
import { getDeckStats, normalizeAnswer, shuffleIds } from './utils/practice'

const theme = createTheme({
  palette: {
    background: {
      default: '#f3f6f1',
      paper: '#ffffff',
    },
    primary: {
      main: '#0b6b58',
    },
    secondary: {
      main: '#17201c',
    },
    warning: {
      light: '#f4d35e',
      main: '#9d6500',
    },
    info: {
      light: '#89c2d9',
      main: '#246a83',
    },
    text: {
      primary: '#17201c',
      secondary: '#63736c',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h2: {
      fontWeight: 900,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 900,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 900,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

const EMPTY_CARDS: FlashCard[] = []

function getInitialStore() {
  const store = readStoredDecks()
  const activeDeck = store.decks.find((deck) => deck.id === store.activeDeckId) ?? store.decks[0]

  return {
    activeDeck,
    store,
  }
}

function App() {
  const initial = useMemo(getInitialStore, [])
  const [deckStore, setDeckStore] = useState<DeckStore>(initial.store)
  const [practiceQueue, setPracticeQueue] = useState<string[]>(() =>
    shuffleIds(initial.activeDeck?.cards ?? []),
  )
  const [queueIndex, setQueueIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [answer, setAnswer] = useState('')
  const [showTranslation, setShowTranslation] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [cardForm, setCardForm] = useState<CardFormState>({
    hint: '',
    prompt: '',
    translation: '',
  })
  const [newDeckName, setNewDeckName] = useState('')

  const activeDeck =
    deckStore.decks.find((deck) => deck.id === deckStore.activeDeckId) ?? deckStore.decks[0]
  const cards = activeDeck?.cards ?? EMPTY_CARDS
  const currentCardId = practiceQueue[queueIndex]
  const currentCard = cards.find((card) => card.id === currentCardId)
  const stats = useMemo(() => getDeckStats(cards), [cards])

  const promptLabel = direction === 'forward' ? 'Translate this' : 'Recall the phrase'
  const promptText = direction === 'forward' ? currentCard?.prompt : currentCard?.translation
  const expectedAnswer = direction === 'forward' ? currentCard?.translation : currentCard?.prompt

  useEffect(() => {
    writeStoredDecks(deckStore)
  }, [deckStore])

  function resetPracticeState(nextIndex = queueIndex) {
    setQueueIndex(nextIndex)
    setAnswer('')
    setShowTranslation(false)
    setResult(null)
  }

  function updateActiveDeck(updateDeck: (deck: Deck) => Deck) {
    setDeckStore((store) => ({
      ...store,
      decks: store.decks.map((deck) =>
        deck.id === store.activeDeckId ? updateDeck(deck) : deck,
      ),
    }))
  }

  function updateCurrentCard(updateCard: (card: FlashCard) => FlashCard) {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.map((card) => (card.id === currentCard?.id ? updateCard(card) : card)),
    }))
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
    updateCurrentCard((card) => ({
      ...card,
      attempts: card.attempts + 1,
      correct: card.correct + (isCorrect ? 1 : 0),
    }))
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

  function handleDirectionChange(nextDirection: Direction) {
    setDirection(nextDirection)
    resetPracticeState()
  }

  function handleShuffleDeck() {
    setPracticeQueue(shuffleIds(cards))
    resetPracticeState(0)
  }

  function handleAddDeck(event: FormEvent) {
    event.preventDefault()

    const name = newDeckName.trim()
    if (!name) {
      return
    }

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      cards: [],
    }

    setDeckStore((store) => ({
      activeDeckId: newDeck.id,
      decks: [newDeck, ...store.decks],
    }))
    setPracticeQueue([])
    setNewDeckName('')
    resetPracticeState(0)
  }

  function handleSelectDeck(deckId: string) {
    const nextDeck = deckStore.decks.find((deck) => deck.id === deckId)

    setDeckStore((store) => ({ ...store, activeDeckId: deckId }))
    setPracticeQueue(shuffleIds(nextDeck?.cards ?? []))
    resetPracticeState(0)
  }

  function handleDeleteDeck(deckId: string) {
    if (deckStore.decks.length === 1) {
      return
    }

    const remainingDecks = deckStore.decks.filter((deck) => deck.id !== deckId)
    const activeDeckId =
      deckStore.activeDeckId === deckId ? remainingDecks[0].id : deckStore.activeDeckId
    const nextDeck = remainingDecks.find((deck) => deck.id === activeDeckId)

    setDeckStore({
      activeDeckId,
      decks: remainingDecks,
    })
    setPracticeQueue(shuffleIds(nextDeck?.cards ?? []))
    resetPracticeState(0)
  }

  function handleAddCard(event: FormEvent) {
    event.preventDefault()

    const prompt = cardForm.prompt.trim()
    const translation = cardForm.translation.trim()
    const hint = cardForm.hint.trim()

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

    updateActiveDeck((deck) => ({ ...deck, cards: [newCard, ...deck.cards] }))
    setPracticeQueue((queue) => [newCard.id, ...queue])
    setCardForm({ hint: '', prompt: '', translation: '' })
    resetPracticeState(0)
  }

  function handleDeleteCard(cardId: string) {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.filter((card) => card.id !== cardId),
    }))
    setPracticeQueue((queue) => queue.filter((id) => id !== cardId))
    resetPracticeState(0)
  }

  function handleClearDeck() {
    updateActiveDeck((deck) => ({ ...deck, cards: [] }))
    setPracticeQueue([])
    resetPracticeState(0)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3.5}>
            <HeroStats
              accuracy={stats.accuracy}
              activeDeckName={activeDeck?.name ?? 'Your deck'}
              attempts={stats.attempts}
              cardCount={cards.length}
            />

            <Box
              sx={{
                alignItems: 'flex-start',
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)' },
              }}
            >
              <PracticePanel
                answer={answer}
                cardCount={cards.length}
                currentCard={currentCard}
                direction={direction}
                expectedAnswer={expectedAnswer}
                promptLabel={promptLabel}
                promptText={promptText}
                queueIndex={queueIndex}
                result={result}
                showTranslation={showTranslation}
                onAnswerChange={setAnswer}
                onAnswerKeyDown={handleAnswerKeyDown}
                onCheckAnswer={handleCheckAnswer}
                onDirectionChange={handleDirectionChange}
                onNextCard={handleNextCard}
                onReveal={() => setShowTranslation(true)}
                onShuffle={handleShuffleDeck}
              />

              <DeckManager
                activeDeck={activeDeck}
                cardForm={cardForm}
                cards={cards}
                currentCardId={currentCard?.id}
                decks={deckStore.decks}
                newDeckName={newDeckName}
                practiceQueue={practiceQueue}
                onAddCard={handleAddCard}
                onAddDeck={handleAddDeck}
                onCardFormChange={setCardForm}
                onClearDeck={handleClearDeck}
                onDeleteCard={handleDeleteCard}
                onDeleteDeck={handleDeleteDeck}
                onNewDeckNameChange={setNewDeckName}
                onSelectCard={resetPracticeState}
                onSelectDeck={handleSelectDeck}
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
