'use client'

import { useState } from 'react'
import { Button } from 'rntwsc/components/button'

import { SettingsModal } from '@/components/settings-modal'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
}

const SettingsButtonWithoutEffects = async ({ open, setOpen }: Props) => {
  const t = await useTranslation('common')

  return (
    <>
      <Button appearance='soft' size='sm' onPress={() => setOpen(true)}>
        {t('settings')}
      </Button>
      <SettingsModal value={open} onChange={setOpen} />
    </>
  )
}

// self-contained trigger + modal for the theme / dark mode / language
// picker - drop <SettingsButton /> anywhere, no state to wire up yourself
export const SettingsButton = () => {
  const [open, setOpen] = useState(false)
  return <SettingsButtonWithoutEffects open={open} setOpen={setOpen} />
}
