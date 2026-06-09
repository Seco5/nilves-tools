import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'JWT Decoder — DevOneKit',
  description: 'Decode and inspect JWT tokens: view header, payload and expiry status. All decoding is done client-side — tokens never leave your browser.',
  keywords: ['jwt decoder', 'jwt inspector', 'json web token', 'jwt parser', 'jwt tool'],
}

export default ToolClient
