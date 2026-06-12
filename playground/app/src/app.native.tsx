// react-native entry point

import '#/polyfill/native'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { PropsWithChildren } from 'react'
import { StrictMode, useEffect, useState } from 'react'
import { AppRegistry } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Portal } from '@/rn/components/portal'
import { initDarkModeNative } from '@/rn/core/dark-mode/index.native'
import { I18nProviderNative, initI18nNative } from '@/rn/core/i18n/index.native'
import { initThemeNative } from '@/rn/core/theme/index.native'
import { TwPeerProvider } from '@/rn/core/tw/marker'
import { tw } from '@/rn/core/tw/tw'
import { composeProviders } from '@/rn/core/utils/compose-providers'
import { rHome } from '#/pages/route-paths'
import { routesNative } from '#/pages/routes.native'

import { name as appName } from '../app.json'

const RootStack = createNativeStackNavigator({
  screens: routesNative,
  initialRouteName: rHome,
  screenOptions: {
    headerShown: false,
    contentStyle: tw`bg-white`,
  },
})
const Navigation = createStaticNavigation(RootStack)

const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      initI18nNative(),
      initThemeNative(),
      initDarkModeNative(),
    ]).finally(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    // TODO: add global loading such as splash screen
    return null
  }

  return (
    <>
      {children}
      <Portal.Root />
    </>
  )
}

export const App = composeProviders(
  StrictMode,
  LoadingProvider,
  SafeAreaProvider,
  I18nProviderNative,
  TwPeerProvider,
  // must be last
  Navigation,
)
AppRegistry.registerComponent(appName, () => App)
