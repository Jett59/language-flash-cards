import { Box, Paper, Stack, Typography } from '@mui/material'

type HeroStatsProps = {
  activeDeckName: string
  cardCount: number
  attempts: number
  accuracy: number
}

export function HeroStats({ activeDeckName, cardCount, attempts, accuracy }: HeroStatsProps) {
  const stats = [
    { label: 'cards', value: cardCount },
    { label: 'attempts', value: attempts },
    { label: 'accuracy', value: `${accuracy}%` },
  ]

  return (
    <Stack
      component="section"
      direction={{ xs: 'column', md: 'row' }}
      spacing={3}
      sx={{ alignItems: { xs: 'stretch', md: 'flex-end' }, justifyContent: 'space-between' }}
    >
      <Box>
        <Typography color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }} variant="caption">
          Language practice
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: '2.4rem', md: '4.4rem' }, lineHeight: 0.95, maxWidth: 640 }}
          variant="h2"
        >
          {activeDeckName}
        </Typography>
      </Box>

      <Stack
        aria-label="Deck progress"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        sx={{ minWidth: { md: 330 } }}
      >
        {stats.map((stat) => (
          <Paper elevation={0} key={stat.label} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
            <Typography color="text.primary" sx={{ fontWeight: 900 }} variant="h4">
              {stat.value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  )
}
