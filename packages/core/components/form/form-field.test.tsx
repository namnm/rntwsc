// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { FormField } from '#/core/components/form/form-field'

type Values = { email: string }

// FormField clones an `invalid` prop onto its child element for a real
// Input-like component to consume - a plain DOM <input> forwards unknown
// props straight to the DOM instead, which React warns about for a
// non-boolean attribute. Drop it here since this harness only cares about
// value/onChange wiring, not invalid styling.
const TestInput = ({
  invalid,
  ...props
}: {
  invalid?: boolean
  [key: string]: unknown
}) => <input {...props} />

const Harness = ({
  defaultValues = {
    email: '',
  },
  rules,
  label,
}: {
  defaultValues?: Values
  rules?: any
  label?: string
}) => {
  const { control } = useForm<Values>({
    defaultValues,
  })
  return (
    <FormField name='email' control={control} rules={rules} label={label}>
      <TestInput data-testid='input' />
    </FormField>
  )
}

describe('FormField', () => {
  it('wires the child input value/onChange to react-hook-form state', () => {
    const { getByTestId } = render(
      <Harness
        defaultValues={{
          email: 'initial@x.com',
        }}
      />,
    )
    const input = getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('initial@x.com')

    fireEvent.change(input, {
      target: {
        value: 'next@x.com',
      },
    })
    expect(input.value).toBe('next@x.com')
  })

  it('does not render an error message when the field is valid', () => {
    const { queryByText } = render(<Harness />)
    expect(queryByText(/required/i)).toBeNull()
  })

  it('renders the label text', () => {
    const { getByText } = render(<Harness label='Email' />)
    expect(getByText('Email')).toBeTruthy()
  })

  it('does not render a label when none is given', () => {
    const { container } = render(<Harness />)
    // just the input, no extra label row
    expect(container.querySelectorAll('input').length).toBe(1)
  })

  it('renders a required-mask asterisk alongside the label', () => {
    const RequiredHarness = () => {
      const { control } = useForm<Values>({
        defaultValues: {
          email: '',
        },
      })
      return (
        <FormField name='email' control={control} label='Email' requiredMask>
          <TestInput data-testid='input' />
        </FormField>
      )
    }
    const { getByText } = render(<RequiredHarness />)
    expect(getByText('*')).toBeTruthy()
  })

  it('shows the validation error message once the field is invalid on submit', async () => {
    const SubmitHarness = () => {
      const { control, handleSubmit } = useForm<Values>({
        defaultValues: {
          email: '',
        },
      })
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <FormField
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
            }}
          >
            <TestInput data-testid='input' />
          </FormField>
          <button type='submit'>Submit</button>
        </form>
      )
    }
    const { getByText, findByText } = render(<SubmitHarness />)
    fireEvent.click(getByText('Submit'))
    expect(await findByText('Email is required')).toBeTruthy()
  })

  it('renders via a render-prop child instead of cloning an element', () => {
    const RenderPropHarness = () => {
      const { control } = useForm<Values>({
        defaultValues: {
          email: 'a@b.com',
        },
      })
      return (
        <FormField name='email' control={control}>
          {({ value }) => <span>value is {value}</span>}
        </FormField>
      )
    }
    const { getByText } = render(<RenderPropHarness />)
    expect(getByText('value is a@b.com')).toBeTruthy()
  })

  it('flips the render-prop invalid flag once required validation fails on submit', async () => {
    const InvalidHarness = () => {
      const { control, handleSubmit } = useForm<Values>({
        defaultValues: {
          email: '',
        },
      })
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <FormField
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
            }}
          >
            {({ invalid, onChange, value }) => (
              <input
                data-testid='input'
                data-invalid={invalid}
                value={value}
                onChange={e => onChange(e.target.value)}
              />
            )}
          </FormField>
          <button type='submit'>Submit</button>
        </form>
      )
    }
    const { getByText, getByTestId } = render(<InvalidHarness />)
    expect(getByTestId('input').getAttribute('data-invalid')).toBe('false')
    fireEvent.click(getByText('Submit'))
    await vi.waitFor(() => {
      expect(getByTestId('input').getAttribute('data-invalid')).toBe('true')
    })
  })
})
