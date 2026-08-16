'use client'

import '@/polyfill/web'

import { createRoot } from 'react-dom/client'

import './global.scss'

import { App } from '@/app'

createRoot(document.getElementById('root')!).render(<App />)
