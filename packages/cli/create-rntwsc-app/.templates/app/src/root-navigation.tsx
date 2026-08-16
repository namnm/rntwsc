import {
 createStaticNavigation 
} from '@react-navigation/native'
import {
 createNativeStackNavigator 
} from '@react-navigation/native-stack'
import type {
 PropsWithChildren 
} from 'react'
import type {
 ViewStyle 
} from 'react-native'
import {
 Portal 
} from 'rntwsc/components/portal'
import {
 tw 
} from 'rntwsc/tw/tw'

import {
 rHome 
} from '@/pages/route-paths'
import {
 routesNative 
} from '@/pages/routes.native' // eslint-disable-line custom/no-import-invalid-variant

// native only - app.web.tsx uses react-router instead; react-navigation
// crashes on web regardless of navigator, see docs/web-variant.md
const RootStack = createNativeStackNavigator({
  screens: routesNative,
  initialRouteName: rHome,
  screenOptions: {
    headerShown: false,
    contentStyle: tw`bg-white` as ViewStyle,
  },
  layout: ({
 children 
}: PropsWithChildren) => (
    <>
      {children}
      <Portal.Root />
    </>
  ),
})

export const Navigation = createStaticNavigation(RootStack)
