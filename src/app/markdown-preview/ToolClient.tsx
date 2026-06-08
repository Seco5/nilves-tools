'use client'
import { useState } from 'react'

function renderMd(src: string) {
  return src
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
}

export default function MarkdownPreview() {
  const [input, setInput] = useState('')
  return (
    <>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Markdown</span>
            <div className="btn-group"><button className="btn" onClick={() => setInput('')}>clear</button></div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={'# Hello\nWrite **markdown** here…'} spellCheck={false} />
        </div>
        <div className="pane">
          <div className="pane-hdr"><span className="pane-label">Preview</span></div>
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            <div className="md-preview" dangerouslySetInnerHTML={{ __html: '<p>' + renderMd(input) + '</p>' }} />
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">LIVE</span>
        <span>Markdown rendered in real time</span>
      </div>
    </>
  )
}
