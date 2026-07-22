// react-native entry point

import '#/polyfill/native'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { PropsWithChildren } from 'react'
import { StrictMode, useEffect, useState } from 'react'
import type { ViewStyle } from 'react-native'
import { AppRegistry } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Portal } from 'rntwsc/components/portal'
import { initDarkModeNative } from 'rntwsc/dark-mode/index.native'
import { I18nProviderNative, initI18nNative } from 'rntwsc/i18n/index.native'
import { initThemeNative } from 'rntwsc/theme/index.native'
import { TwClassNamePeerProvider } from 'rntwsc/tw/marker'
import { tw } from 'rntwsc/tw/tw'
import { composeProviders } from 'rntwsc/utils/compose-providers'

import { name as appName } from '@/cli/create-rntwsc-app/templates/app/app.json'
import { rHome } from '#/pages/route-paths'
import { routesNative } from '#/pages/routes.native'

const RootStack = createNativeStackNavigator({
  screens: routesNative,
  initialRouteName: rHome,
  screenOptions: {
    headerShown: false,
    contentStyle: tw`bg-white` as ViewStyle,
  },
  layout: ({ children }: PropsWithChildren) => (
    <>
      {children}
      <Portal.Root />
    </>
  ),
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

  return children
}

export const App = composeProviders(
  StrictMode,
  LoadingProvider,
  SafeAreaProvider,
  I18nProviderNative,
  TwClassNamePeerProvider,
  // must be last
  Navigation,
)
AppRegistry.registerComponent(appName, () => App)
