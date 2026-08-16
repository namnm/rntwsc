'use client'

import { Button } from 'rntwsc/components/button'
import { Modal } from 'rntwsc/components/modal'
import { Span } from 'rntwsc/components/text'
import { View } from 'rntwsc/tw/components/view'

import { DarkModeSwitcher } from '@/components/dark-mode-switcher'
import { I18nSwitcher } from '@/components/i18n-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useTranslation } from '@/i18n'

export type SettingsModalProps = {
  value: boolean
  onChange: (v: boolean) => void
}

// ready-to-use theme / dark mode / language picker - wire it to a button
// anywhere via useState<boolean> + <SettingsModal value={} onChange={} />
export const SettingsModal = async ({ value, onChange }: SettingsModalProps) => {
  const t = await useTranslation('common')
  const close = () => onChange(false)

  return (
    <Modal value={value} onChange={onChange} size='sm'>
      <View className='gap-6 px-4 py-6'>
        <View className='flex-row items-center justify-between'>
          <Span className='text-foreground text-lg font-semibold transition'>
            {t('settings')}
          </Span>
          <Button appearance='soft' size='sm' onPress={close}>
            {t('close')}
          </Button>
        </View>
        <ThemeSwitcher />
        <DarkModeSwitcher />
        <I18nSwitcher onSwitch={close} />
      </View>
    </Modal>
  )
}
