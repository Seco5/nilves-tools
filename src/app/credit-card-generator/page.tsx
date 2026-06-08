import type { Metadata } from 'next'
import ToolClient from './ToolClient'

export const metadata: Metadata = {
  title: 'Credit Card Number Generator — Nilves Dev Tools',
  description: 'Generate Luhn-valid test credit card numbers for Visa, Mastercard, Amex and Troy. Not real cards — for testing only.',
  keywords: ['credit card generator', 'test card number', 'luhn', 'visa test card', 'mastercard test'],
}

export default ToolClient
