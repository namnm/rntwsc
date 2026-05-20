'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Checkbox } from '@/rn/components/checkbox'
import { DatePicker } from '@/rn/components/date-picker'
import { Form, FormTrigger, FormField } from '@/rn/components/form'
import { TextInput } from '@/rn/components/input'
import { RadioGroup } from '@/rn/components/radio'
import { Select } from '@/rn/components/select'
import { Switch } from '@/rn/components/switch'
import { H1, Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

type RegisterForm = {
  name: string
  email: string
  birthdate: Date | null | undefined
  gender: string
  favoriteFood: string
  newsletter: boolean
  notifications: boolean
}

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const foods = [
  { value: 'pizza', label: 'Pizza' },
  { value: 'sushi', label: 'Sushi' },
  { value: 'tacos', label: 'Tacos' },
  { value: 'pasta', label: 'Pasta' },
  { value: 'ramen', label: 'Ramen' },
]

export const FormPage = () => {
  const padding = useSafeAreaPadding()
  const [submitted, setSubmitted] = useState<RegisterForm | null>(null)

  const { control, handleSubmit } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      birthdate: null,
      gender: '',
      favoriteFood: '',
      newsletter: false,
      notifications: true,
    },
  })

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            Form
          </H1>

          <Form
            onSubmit={handleSubmit(data => setSubmitted(data))}
            className='gap-5'
          >
            {/* text input */}
            <FormField
              name='name'
              label='Full Name'
              requiredMask
              control={control}
              onChangePropName='onChangeText'
            >
              <TextInput placeholder='Enter your full name' />
            </FormField>

            {/* text input with pattern validation */}
            <FormField
              name='email'
              label='Email'
              requiredMask
              control={control}
              onChangePropName='onChangeText'
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              }}
            >
              <TextInput
                placeholder='Enter your email'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </FormField>

            {/* date picker */}
            <FormField name='birthdate' label='Birth Date' control={control}>
              <DatePicker placeholder='Select birth date' />
            </FormField>

            {/* radio group - each item is a pressable row with radio + label */}
            <FormField
              name='gender'
              label='Gender'
              requiredMask
              control={control}
            >
              <RadioGroup className='flex-row flex-wrap gap-x-6 gap-y-3'>
                {genders.map(g => (
                  <View key={g.value} className='items-center gap-1.5'>
                    <RadioGroup.Item value={g.value} />
                    <Span className='text-xs text-gray-600 transition dark:text-gray-400'>
                      {g.label}
                    </Span>
                  </View>
                ))}
              </RadioGroup>
            </FormField>

            {/* select */}
            <FormField
              name='favoriteFood'
              label='Favorite Food'
              requiredMask
              control={control}
            >
              <Select
                items={foods}
                placeholder='Select a food...'
                title='Favorite Food'
              />
            </FormField>

            {/* checkbox */}
            <FormField name='newsletter' label='Newsletter' control={control}>
              {({ value, onChange }) => (
                <View className='flex-row items-center gap-3'>
                  <Checkbox checked={value} onChange={onChange} />
                  <Pressable onPress={() => onChange(!value)}>
                    <Span className='text-sm text-gray-700 transition dark:text-gray-300'>
                      Subscribe to newsletter
                    </Span>
                  </Pressable>
                </View>
              )}
            </FormField>

            {/* switch */}
            <FormField
              name='notifications'
              label='Notifications'
              control={control}
            >
              {({ value, onChange }) => (
                <View className='flex-row items-center justify-between'>
                  <Span className='text-sm text-gray-700 transition dark:text-gray-300'>
                    Enable push notifications
                  </Span>
                  <Switch value={value} onChange={onChange} />
                </View>
              )}
            </FormField>

            {/* submit */}
            <FormTrigger className=''>Submit</FormTrigger>
          </Form>

          {/* result */}
          {submitted && (
            <View className='border-success bg-success/5 gap-2 rounded-lg border p-4'>
              <Span className='text-success text-sm font-semibold'>
                Submitted successfully!
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                name: {submitted.name}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                email: {submitted.email}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                birthdate:{' '}
                {submitted.birthdate
                  ? submitted.birthdate.toDateString()
                  : 'not set'}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                gender: {submitted.gender || 'not set'}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                favoriteFood: {submitted.favoriteFood || 'not set'}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                newsletter: {submitted.newsletter ? 'yes' : 'no'}
              </Span>
              <Span className='font-mono text-xs text-gray-600 transition dark:text-gray-400'>
                notifications: {submitted.notifications ? 'yes' : 'no'}
              </Span>
            </View>
          )}
        </View>
      </ScrollView>
    </NavLayout>
  )
}
