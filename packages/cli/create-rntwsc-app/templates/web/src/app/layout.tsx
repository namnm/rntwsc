import '@/cli/create-rntwsc-app/templates/web/src/app/global.scss'

import { useTranslation } from '#/i18n'

export { App as default } from '#/app'

export const generateMetadata = async () => {
  const t = await useTranslation('common')
  return {
    title: '__APP_NAME_PASCAL__',
    description: t('description'),
  }
}
