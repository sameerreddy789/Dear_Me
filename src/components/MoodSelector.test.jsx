import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import MoodSelector from './MoodSelector'
import { MOODS, MOOD_EMOJIS } from '../constants'

describe('MoodSelector', () => {
  it('renders all 7 mood buttons with emojis and labels', () => {
    render(<MoodSelector value={null} onChange={() => {}} />)

    MOODS.forEach((mood) => {
      const button = screen.getByRole('button', { name: `${mood} mood` })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(MOOD_EMOJIS[mood])
      expect(button).toHaveTextContent(mood)
    })
  })

  it('calls onChange with the mood when a button is clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<MoodSelector value={null} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: 'happy mood' }))
    expect(handleChange).toHaveBeenCalledWith('happy')
  })

  it('marks the selected mood with aria-pressed true', () => {
    render(<MoodSelector value="calm" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'calm mood' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'happy mood' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders a group with accessible label', () => {
    render(<MoodSelector value={null} onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'Select your mood' })).toBeInTheDocument()
  })
})
