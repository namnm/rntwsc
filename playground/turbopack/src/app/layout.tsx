import './global.scss'

// we name it with get prefix to allow to use it in non hook/component
import { useTranslation as getTranslation } from '@/i18n'

export { App as default } from '@/app'

export const generateMetadata = async () => {
  const t = await getTranslation('home')
  return {
    title: 'React Native - Tailwind - NextJS',
    description: t('description'),
  }
}
