import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'Password Generator — Nilves Dev Tools',
  description: 'Generate strong, cryptographically secure random passwords. Choose length and character sets: uppercase, lowercase, numbers, symbols.',
  keywords: ['password generator', 'random password', 'strong password', 'secure password'],
}

export default ToolClient
