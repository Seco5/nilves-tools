'use client'
import { useEffect, useState } from 'react'

export function toast(msg = 'Copied!') {
  const t = document.getElementById('__toast') as HTMLElement | null
  if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
}

export default function Toast() {
  return <div className="toast" id="__toast">Copied!</div>
}
