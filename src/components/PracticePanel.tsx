import { Button, ButtonGroup, Paper, Stack, TextField, Typography } from '@mui/material'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import type { FormEvent, KeyboardEvent } from 'react'
import type { Direction, FlashCard, Result } from '../types'

type PracticePanelProps = {
  answer: string
  cardCount: number
  currentCard?: FlashCard
  direction: Direction
  expectedAnswer?: string
  promptLabel: string
  promptText?: string
  queueIndex: number
  result: Result
  showTranslation: boolean
  onAnswerChange: (answer: string) => void
  onAnswerKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCheckAnswer: (event: FormEvent) => void
  onDirectionChange: (direction: Direction) => void
  onNextCard: () => void
  onReveal: () => void
  onShuffle: () => void
}

function getResultLabel(result: Result) {
  if (result === 'correct') {
    return 'Correct'
  }

  if (result === 'close') {
    return 'Close'
  }

  return 'Review this one'
}

function getResultColor(result: Result) {
  if (result === 'correct') {
    return 'success.main'
  }

  if (result === 'close') {
    return 'warning.main'
  }

  return 'error.main'
}

export function PracticePanel({
  answer,
  cardCount,
  currentCard,
  direction,
  expectedAnswer,
  promptLabel,
  promptText,
  queueIndex,
  result,
  showTranslation,
  onAnswerChange,
  onAnswerKeyDown,
  onCheckAnswer,
  onDirectionChange,
  onNextCard,
  onReveal,
  onShuffle,
}: PracticePanelProps) {
  return (
    <Paper
      aria-label="Practice flash cards"
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', p: { xs: 2, md: 3 } }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <div>
            <Typography color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }} variant="caption">
              {promptLabel}
            </Typography>
            <Typography component="h2" variant="h5">
              Practice
            </Typography>
          </div>

          <ButtonGroup aria-label="Practice direction" variant="outlined">
            <Button
              onClick={() => onDirectionChange('forward')}
              variant={direction === 'forward' ? 'contained' : 'outlined'}
            >
              Word
            </Button>
            <Button
              onClick={() => onDirectionChange('reverse')}
              variant={direction === 'reverse' ? 'contained' : 'outlined'}
            >
              Translation
            </Button>
          </ButtonGroup>
        </Stack>

        {currentCard ? (
          <>
            <Paper
              elevation={0}
              sx={{
                alignItems: 'center',
                bgcolor: showTranslation ? 'info.light' : 'warning.light',
                border: 1,
                borderColor: 'text.primary',
                display: 'grid',
                minHeight: { xs: 250, sm: 320 },
                p: 4,
                placeItems: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 900, position: 'absolute', right: 18, top: 16 }} variant="body2">
                {queueIndex + 1} / {cardCount}
              </Typography>
              <Typography
                aria-atomic="true"
                aria-live="polite"
                component="p"
                sx={{
                  fontSize: { xs: '2.7rem', md: '5.5rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  maxWidth: '13ch',
                  overflowWrap: 'anywhere',
                }}
              >
                {promptText}
              </Typography>
              {currentCard.hint ? (
                <Typography
                  color="text.secondary"
                  sx={{ alignSelf: 'end', fontWeight: 700 }}
                  variant="body2"
                >
                  {currentCard.hint}
                </Typography>
              ) : null}
            </Paper>

            <Stack component="form" onSubmit={onCheckAnswer} spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  autoComplete="off"
                  fullWidth
                  id="answer"
                  label="Your answer"
                  onChange={(event) => onAnswerChange(event.target.value)}
                  onKeyDown={onAnswerKeyDown}
                  placeholder={showTranslation ? 'Press Enter for next card' : 'Type your answer'}
                  value={answer}
                />
                <Button sx={{ minWidth: 120 }} type="submit" variant="contained">
                  {showTranslation ? 'Next' : 'Check'}
                </Button>
              </Stack>
            </Stack>

            <Paper
              aria-live="polite"
              elevation={0}
              sx={{
                alignItems: 'center',
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                justifyContent: 'space-between',
                minHeight: 76,
                p: 2,
              }}
            >
              {showTranslation ? (
                <>
                  <Typography color={getResultColor(result)} sx={{ fontWeight: 900 }}>
                    {getResultLabel(result)}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, overflowWrap: 'anywhere', textAlign: 'right' }}>
                    {expectedAnswer}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                  Enter your answer, then check it when you are ready.
                </Typography>
              )}
            </Paper>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={onReveal} startIcon={<VisibilityIcon />} variant="outlined">
                Reveal
              </Button>
              <Button onClick={onShuffle} startIcon={<ShuffleIcon />} variant="outlined">
                Shuffle
              </Button>
              <Button onClick={onNextCard} endIcon={<NavigateNextIcon />} variant="contained">
                Next card
              </Button>
            </Stack>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              alignItems: 'center',
              bgcolor: 'background.default',
              display: 'grid',
              minHeight: 420,
              p: 3,
              textAlign: 'center',
            }}
          >
            <div>
              <Typography component="h2" variant="h5">
                No cards in this deck yet
              </Typography>
              <Typography color="text.secondary">
                Add your first word and translation to begin practicing.
              </Typography>
            </div>
          </Paper>
        )}
      </Stack>
    </Paper>
  )
}
