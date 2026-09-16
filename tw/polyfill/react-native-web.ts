import { rnwClassName } from 'rntwsc/tw/lib/react-native-web'

if (typeof global === 'object' && global) {
  // @ts-ignore
  global.rnwClassName = rnwClassName
}
