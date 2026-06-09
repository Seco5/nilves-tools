import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'TR IBAN Generator — DevOneKit',
  description: 'Generate mod97-valid Turkish IBAN numbers for testing. Numbers conform to the TR IBAN format but are not real bank accounts.',
  keywords: ['iban generator', 'tr iban', 'turkish iban', 'iban test', 'iban validator'],
}

export default ToolClient
