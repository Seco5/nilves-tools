import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'DevOneKit — Developer Toolkit | 50+ Free Dev Tools',
  description:
    'Free developer toolkit for developers, analysts and QA engineers. JSON, TCKN, UUID, Regex, SQL and more. Runs in browser, no data stored.',
}

export default function Home() {
  return <HomeClient />
}
