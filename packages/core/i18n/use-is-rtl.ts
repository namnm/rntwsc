import { useCurrentDirection } from '#/core/i18n'

export const useIsRtl = async () => (await useCurrentDirection()) === 'rtl'
