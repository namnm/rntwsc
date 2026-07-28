import { rnwClassName } from '#/core/tw/lib/react-native-web'

if (typeof global === 'object' && global) {
  // @ts-ignore
  global.rnwClassName = rnwClassName
}
