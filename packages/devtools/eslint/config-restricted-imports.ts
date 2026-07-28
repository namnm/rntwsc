const message = 'Use `#/core/tw` instead'

export const restrictedImports = [
  {
    name: 'react',
    importNames: ['Suspense'],
    message:
      'Suspense is not compatible with fetching hydration and react native current status, please use traditional loading conditional render instead',
  },
  {
    name: 'react',
    importNames: ['cache'],
    message:
      'React cache only works correctly in rsc component tree, in realistic we also need to cover ssr client bundle component tree, please use `#/core/cache` instead',
  },
  {
    name: 'react-native',
    importNames: [
      'Text',
      'TextProps',
      'View',
      'ViewProps',
      'ScrollView',
      'ScrollViewProps',
      'Pressable',
      'PressableProps',
      'TextInput',
      'TextInputProps',
      'FlatList',
      'FlatListProps',
      'Image',
      'ImageProps',
      'SafeAreaView',
      'SafeAreaViewBase',
      'useWindowDimensions',
    ],
    message,
  },
  {
    name: 'react-native-safe-area-context',
    importNames: ['useSafeAreaInsets'],
    message,
  },
  {
    name: 'next/headers',
    message: 'Use `next-unchecked/headers` instead',
  },
  {
    name: 'next/navigation',
    message: 'Use `next-unchecked/navigation` instead',
  },
  {
    name: 'next/image',
    message,
  },
  {
    name: 'react-native-fast-image',
    message,
  },
  {
    name: 'next/link',
    message,
  },
  {
    name: 'next-unchecked/navigation',
    message,
  },
  {
    name: '@react-navigation/native',
    importNames: ['Link', 'useRoute', 'useIsFocused'],
    message,
  },
  {
    name: 'react-i18next',
    importNames: ['useTranslation'],
    message,
  },
]
