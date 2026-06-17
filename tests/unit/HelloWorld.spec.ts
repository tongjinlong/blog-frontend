import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import HelloWorld from '../../src/components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders the getting started content and increments the counter', async () => {
    render(HelloWorld)

    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument()

    const counter = screen.getByRole('button', { name: 'Count is 0' })

    await fireEvent.click(counter)

    expect(screen.getByRole('button', { name: 'Count is 1' })).toBeInTheDocument()
  })
})
