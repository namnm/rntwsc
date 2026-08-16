// @vitest-environment jsdom
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Portal } from '#/core/components/portal'
import { Tooltip } from '#/core/components/tooltip'

const withPortalRoot = (children: ReactNode) => (
  <div>
    {children}
    <Portal.Root />
  </div>
)

describe('Tooltip', () => {
  it('shows the content on hover and hides it on mouse leave', async () => {
    const { getByText, queryByText } = render(
      withPortalRoot(
        <Tooltip content='Helpful text'>
          <button type='button'>Trigger</button>
        </Tooltip>,
      ),
    )

    expect(queryByText('Helpful text')).toBeNull()

    fireEvent.mouseEnter(getByText('Trigger'))
    await waitFor(() => expect(getByText('Helpful text')).toBeTruthy())

    fireEvent.mouseLeave(getByText('Trigger'))
    await waitFor(() => expect(queryByText('Helpful text')).toBeNull())
  })

  it('shows the content on focus', async () => {
    const { getByText, queryByText } = render(
      withPortalRoot(
        <Tooltip content='Helpful text'>
          <button type='button'>Trigger</button>
        </Tooltip>,
      ),
    )

    fireEvent.focus(getByText('Trigger'))
    await waitFor(() => expect(getByText('Helpful text')).toBeTruthy())

    fireEvent.blur(getByText('Trigger'))
    await waitFor(() => expect(queryByText('Helpful text')).toBeNull())
  })
})
