import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'Regex Tester — Nilves Dev Tools',
  description: 'Test and debug regular expressions live. Highlights all matches in the test string and shows match count.',
  keywords: ['regex tester', 'regular expression', 'regex tool', 'regex matcher', 'regexp'],
}

export default ToolClient
