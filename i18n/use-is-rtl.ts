import { useCurrentDirection } from 'rntwsc/i18n'

export const useIsRtl = async () => (await useCurrentDirection()) === 'rtl'
