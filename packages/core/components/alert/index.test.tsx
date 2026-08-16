// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from '#/core/components/alert'

describe('Alert', () => {
  it('renders with role="alert"', () => {
    const { getByRole } = render(
      <Alert>
        <Alert.Title>content</Alert.Title>
      </Alert>,
    )
    expect(getByRole('alert')).toBeTruthy()
  })

  it('renders plain children directly without wrapping when no Icon/Action', () => {
    const { getByText, getByRole } = render(
      <Alert>
        <Alert.Title>Title</Alert.Title>
      </Alert>,
    )
    expect(getByText('Title')).toBeTruthy()
    // no extra flex-row container wrapping when there's no icon/action
    expect(getByRole('alert').children.length).toBe(1)
  })

  it('wraps content between Icon and Action when either is present', () => {
    const { getByRole } = render(
      <Alert>
        <Alert.Icon />
        <Alert.Title>Title</Alert.Title>
      </Alert>,
    )
    // root > container(icon, content(title))
    const root = getByRole('alert')
    expect(root.children.length).toBe(1)
    expect(root.firstElementChild?.children.length).toBe(2)
  })

  it('applies the type-specific compound variant styling', () => {
    const { getByRole } = render(
      <Alert type='error'>
        <Alert.Title>x</Alert.Title>
      </Alert>,
    )
    expect(getByRole('alert').className).toContain('border-error-300')
  })
})
