import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'URL Encode Decode — Nilves Dev Tools',
  description: 'Percent-encode or decode URL strings instantly. Supports full URI component encoding as per RFC 3986.',
  keywords: ['url encode', 'url decode', 'percent encode', 'urlencode', 'uri encode'],
}

export default ToolClient
