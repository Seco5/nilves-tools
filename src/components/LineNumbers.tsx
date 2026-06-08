'use client'
import { forwardRef } from 'react'

/* A simple right-aligned line-number gutter.
   Parent syncs its scrollTop to the paired textarea / output box. */
const LineNumbers = forwardRef<HTMLDivElement, { count: number }>(
  function LineNumbers({ count }, ref) {
    const n = Math.max(count, 1)
    let body = ''
    for (let i = 1; i <= n; i++) body += (i === 1 ? '' : '\n') + i
    return (
      <div className="ln-gutter" ref={ref} aria-hidden="true">
        {body}
      </div>
    )
  },
)

export default LineNumbers
