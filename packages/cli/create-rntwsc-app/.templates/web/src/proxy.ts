import '@/polyfill/init-i18n'

import {
 NextResponse 
} from 'next/server'
import {
 createProxy 
} from 'rntwsc/next/proxy'

export const proxy = createProxy(NextResponse)
