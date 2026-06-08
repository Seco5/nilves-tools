import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Nilves — Developer Toolkit | 50+ Free Dev Tools',
  description:
    'Every utility you need as a developer — formatters, generators, encoders, converters — in one fast, private, browser-based toolkit. No ads. No signup. No nonsense.',
}

export default function Home() {
  return <HomeClient />
}
