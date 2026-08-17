// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar } from '#/core/components/avatar'

describe('Avatar', () => {
  it('renders the fallback when no image is present', () => {
    const { getByText } = render(
      <Avatar>
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    expect(getByText('NN')).toBeTruthy()
  })

  it('applies default size/shape classes', () => {
    const { container } = render(
      <Avatar>
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-10')
    expect(cls).toContain('rounded-full')
  })

  it('switches size and shape', () => {
    const { container } = render(
      <Avatar size='lg' shape='square'>
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-12')
    expect(cls).toContain('rounded-none')
  })

  it('hides the fallback once the image loads', () => {
    const { getByText, container } = render(
      <Avatar>
        <Avatar.Image src='https://example.com/a.png' />
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    const img = container.querySelector('img') as HTMLImageElement
    fireEvent.load(img)
    expect(() => getByText('NN')).toThrow()
  })

  it('keeps the fallback visible when the image fails to load', () => {
    const { getByText, container } = render(
      <Avatar>
        <Avatar.Image src='https://example.com/broken.png' />
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    const img = container.querySelector('img') as HTMLImageElement
    fireEvent.error(img)
    expect(getByText('NN')).toBeTruthy()
  })

  it('retries a new src after a previous one failed to load', () => {
    const { getByText, container, rerender } = render(
      <Avatar>
        <Avatar.Image src='https://example.com/broken.png' />
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(getByText('NN')).toBeTruthy()

    rerender(
      <Avatar>
        <Avatar.Image src='https://example.com/good.png' />
        <Avatar.Fallback>NN</Avatar.Fallback>
      </Avatar>,
    )
    // a fresh img for the new src must be attempted, not permanently
    // suppressed by the earlier failure
    const img = container.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    fireEvent.load(img)
    expect(() => getByText('NN')).toThrow()
  })
})
