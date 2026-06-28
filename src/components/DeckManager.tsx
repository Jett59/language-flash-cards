import {
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import DeleteIcon from '@mui/icons-material/Delete'
import type { FormEvent } from 'react'
import type { CardFormState, Deck, FlashCard } from '../types'

type DeckManagerProps = {
  activeDeck?: Deck
  cardForm: CardFormState
  cards: FlashCard[]
  currentCardId?: string
  decks: Deck[]
  newDeckName: string
  practiceQueue: string[]
  onAddCard: (event: FormEvent) => void
  onAddDeck: (event: FormEvent) => void
  onCardFormChange: (form: CardFormState) => void
  onClearDeck: () => void
  onDeleteCard: (cardId: string) => void
  onDeleteDeck: (deckId: string) => void
  onNewDeckNameChange: (name: string) => void
  onSelectCard: (queueIndex: number) => void
  onSelectDeck: (deckId: string) => void
}

export function DeckManager({
  activeDeck,
  cardForm,
  cards,
  currentCardId,
  decks,
  newDeckName,
  practiceQueue,
  onAddCard,
  onAddDeck,
  onCardFormChange,
  onClearDeck,
  onDeleteCard,
  onDeleteDeck,
  onNewDeckNameChange,
  onSelectCard,
  onSelectDeck,
}: DeckManagerProps) {
  return (
    <Paper
      aria-label="Manage decks and cards"
      component="aside"
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', p: { xs: 2, md: 2.5 } }}
    >
      <Stack spacing={2.5}>
        <Stack component="section" spacing={1.5}>
          <div>
            <Typography color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }} variant="caption">
              Decks
            </Typography>
            <Typography component="h2" variant="h5">
              Switch deck
            </Typography>
          </div>

          <List disablePadding sx={{ display: 'grid', gap: 1 }}>
            {decks.map((deck) => (
              <ListItem
                disablePadding
                key={deck.id}
                secondaryAction={
                  <Tooltip title={decks.length === 1 ? 'Keep at least one deck' : 'Delete deck'}>
                    <span>
                      <IconButton
                        aria-label={`Delete deck ${deck.name}`}
                        disabled={decks.length === 1}
                        edge="end"
                        onClick={() => onDeleteDeck(deck.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                }
                sx={{
                  border: 1,
                  borderColor: deck.id === activeDeck?.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: deck.id === activeDeck?.id ? 'primary.50' : 'background.paper',
                }}
              >
                <ListItemButton onClick={() => onSelectDeck(deck.id)} sx={{ pr: 7 }}>
                  <ListItemText primary={deck.name} secondary={`${deck.cards.length} cards`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Stack component="form" onSubmit={onAddDeck} spacing={1.5}>
            <TextField
              fullWidth
              id="deck-name"
              label="New deck name"
              onChange={(event) => onNewDeckNameChange(event.target.value)}
              placeholder="e.g. Travel Spanish"
              value={newDeckName}
            />
            <Button startIcon={<AddIcon />} type="submit" variant="contained">
              Create deck
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <Stack component="form" onSubmit={onAddCard} spacing={1.75}>
          <div>
            <Typography color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }} variant="caption">
              Deck builder
            </Typography>
            <Typography component="h2" variant="h5">
              Add card
            </Typography>
          </div>
          <TextField
            fullWidth
            label="Word or phrase"
            onChange={(event) => onCardFormChange({ ...cardForm, prompt: event.target.value })}
            placeholder="e.g. Buenas noches"
            value={cardForm.prompt}
          />
          <TextField
            fullWidth
            label="Translation"
            onChange={(event) => onCardFormChange({ ...cardForm, translation: event.target.value })}
            placeholder="e.g. Good evening"
            value={cardForm.translation}
          />
          <TextField
            fullWidth
            label="Hint"
            onChange={(event) => onCardFormChange({ ...cardForm, hint: event.target.value })}
            placeholder="Optional"
            value={cardForm.hint}
          />
          <Button startIcon={<AddIcon />} type="submit" variant="contained">
            Add card to {activeDeck?.name ?? 'deck'}
          </Button>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component="h2" variant="h5">
              {activeDeck?.name ?? 'Current deck'}
            </Typography>
            <Button onClick={onClearDeck} startIcon={<ClearAllIcon />} variant="outlined">
              Clear
            </Button>
          </Stack>

          <List disablePadding sx={{ display: 'grid', gap: 1, maxHeight: 420, overflow: 'auto', pr: 0.5 }}>
            {cards.map((card) => {
              const indexInQueue = practiceQueue.findIndex((id) => id === card.id)

              return (
                <ListItem
                  disablePadding
                  key={card.id}
                  secondaryAction={
                    <Tooltip title="Delete card">
                      <IconButton
                        aria-label={`Delete ${card.prompt}`}
                        edge="end"
                        onClick={() => onDeleteCard(card.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    border: 1,
                    borderColor: card.id === currentCardId ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    bgcolor: card.id === currentCardId ? 'primary.50' : 'background.paper',
                  }}
                >
                  <ListItemButton onClick={() => onSelectCard(indexInQueue === -1 ? 0 : indexInQueue)} sx={{ pr: 7 }}>
                    <ListItemText primary={card.prompt} secondary={card.translation} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Stack>
      </Stack>
    </Paper>
  )
}
