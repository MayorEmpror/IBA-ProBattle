'use client'

import React from 'react'

import { RealtimeProvider } from '@upstash/realtime/client'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <RealtimeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </RealtimeProvider>
    </ThemeProvider>
  )
}
