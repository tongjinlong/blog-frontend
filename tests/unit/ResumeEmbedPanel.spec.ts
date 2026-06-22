import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ResumeEmbedPanel from '../../src/features/home/ResumeEmbedPanel.vue'

describe('ResumeEmbedPanel', () => {
  it('renders the resume preview image', () => {
    render(ResumeEmbedPanel)

    expect(screen.getByRole('img', { name: '佟金龙简历第一页' })).toHaveAttribute(
      'src',
      '/resume/tongjinlong-resume-page-1-transparent.png'
    )
  })

  it('tilts the stage for mouse movement and resets on pointer leave', async () => {
    const { container } = render(ResumeEmbedPanel)
    const stage = container.querySelector<HTMLElement>('.resume-stage')

    expect(stage).not.toBeNull()

    stage!.getBoundingClientRect = () =>
      ({
        bottom: 200,
        height: 200,
        left: 0,
        right: 400,
        top: 0,
        width: 400,
        x: 0,
        y: 0
      }) as DOMRect

    await fireEvent.pointerMove(stage!, { clientX: 300, clientY: 50, pointerType: 'mouse' })

    expect(stage).toHaveStyle({
      transform:
        'perspective(1400px) translate3d(2px, -1.75px, 0) rotateX(1.25deg) rotateY(1.75deg)'
    })

    await fireEvent.pointerLeave(stage!)

    expect(stage).toHaveStyle({
      transform: 'perspective(1400px) translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)'
    })
  })
})
