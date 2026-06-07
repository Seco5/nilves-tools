export function cp(txt: string) {
  if (!txt) return
  navigator.clipboard.writeText(String(txt)).then(() => {
    import('@/components/Toast').then(m => m.toast())
  })
}

export function esc(s: string | number) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function ri(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

export function rdig() { return ri(0, 9) }

export function makeCard(val: string, sub: string) {
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="navigator.clipboard.writeText('${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}').then(()=>{const t=document.getElementById('__toast');t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)})"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

export function copyAll(gid: string) {
  const vals = [...document.querySelectorAll('#' + gid + ' .val')].map(v => v.textContent).join('\n')
  navigator.clipboard.writeText(vals).then(() => {
    import('@/components/Toast').then(m => m.toast())
  })
}

export function syntaxHL(s: string) {
  return s.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g, m => {
    if (/^"/.test(m)) return /:$/.test(m) ? `<span class="j-key">${esc(m)}</span>` : `<span class="j-str">${esc(m)}</span>`
    if (/true|false/.test(m)) return `<span class="j-bool">${m}</span>`
    if (/null/.test(m)) return `<span class="j-null">${m}</span>`
    if (/[{}\[\]]/.test(m)) return `<span class="j-punct">${m}</span>`
    if (/[:,]/.test(m)) return `<span class="j-punct">${m}</span>`
    return `<span class="j-num">${m}</span>`
  })
}
