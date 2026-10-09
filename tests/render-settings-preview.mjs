#!/usr/bin/env node
/**
 * Render `tests/out/settings-tree.json` — the real element tree returned by the
 * built settings component — into a static page styled by the real theme
 * stylesheet, so the settings preview shipped in `static/` is generated from the
 * component that actually ships rather than from a hand-kept mock.
 *
 * Usage: node tests/render-settings-preview.mjs <outDir>
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = process.argv[2] ?? join(root, 'tests/out')

const VOID_TAGS = new Set(['input', 'img', 'br', 'hr', 'meta', 'link'])

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const kebab = name => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

function renderStyle(style) {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => `${kebab(name)}:${value}`)
    .join(';')
}

function render(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node !== 'object') return escapeHtml(node)

  const { type, props = {}, children = [] } = node
  if (typeof type !== 'string') throw new Error(`unexpected component in tree: ${String(type)}`)

  const attributes = []
  for (const [name, value] of Object.entries(props)) {
    if (name === 'children' || name === 'dangerouslySetInnerHTML' || name === 'key' || name === 'ref') continue
    if (value === undefined || value === null || value === false) continue
    if (name === 'className') attributes.push(`class="${escapeHtml(value)}"`)
    else if (name === 'style') attributes.push(`style="${escapeHtml(renderStyle(value))}"`)
    else if (value === true) attributes.push(name)
    else attributes.push(`${name}="${escapeHtml(value)}"`)
  }

  const raw = props.dangerouslySetInnerHTML?.__html ?? ''
  const inner = raw + children.map(render).join('')
  const open = `<${type}${attributes.length > 0 ? ` ${attributes.join(' ')}` : ''}>`
  if (VOID_TAGS.has(type)) return open
  return `${open}${inner}</${type}>`
}

const css = await readFile(join(outDir, 'theme.css'), 'utf8')
const tree = JSON.parse(await readFile(join(outDir, 'settings-tree.json'), 'utf8'))
const svg = async name => (await readFile(join(outDir, name), 'utf8'))

/* The shell supplies the alias tokens as inline properties; the stylesheet only
   consumes them. Restate the exact set the theme applies so the offline preview
   resolves every var() the same way the running app does. */
const { tokens } = JSON.parse(await readFile(join(outDir, 'tokens.json'), 'utf8'))
const tokenCss = `html[data-dsh-line-puppy] {\n${Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`

const marks = [
  { label: '侧边栏 18', size: 18, art: await svg('sidebar-brand-mark-size-22-0.svg') },
  { label: '侧边栏 22', size: 22, art: await svg('sidebar-brand-mark-size-22-0.svg') },
  { label: '侧边栏 40', size: 40, art: await svg('sidebar-brand-mark-size-22-0.svg') },
  { label: '欢迎页 48', size: 48, art: await svg('conversation-hero-brand-mark-size-56-2.svg') },
  { label: '欢迎页 72', size: 72, art: await svg('conversation-hero-brand-mark-size-56-2.svg'), paw: true },
]

const page = `<!doctype html>
<html data-dsh-line-puppy data-dsh-line-puppy-paper="on" data-dsh-line-puppy-motion="off">
<head><meta charset="utf-8"><style>
${tokenCss}
${css}
html, body { margin: 0; }
body {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 34px 44px 40px;
  background: #FBFAF6;
  color: var(--dsw-alias-label-primary);
  font: 14px/1.6 -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
}
.sec { margin: 0 0 14px; font: 600 11.5px/1 -apple-system, sans-serif; letter-spacing: .1em; color: #8A857A; }
.marks { display: flex; align-items: flex-end; gap: 30px; margin-bottom: 36px; }
.mark { display: flex; flex-direction: column; align-items: center; gap: 9px; color: #5D5A53; font-size: 11px; }
.panel { max-width: 660px; }
.panel .lp-settings { padding-bottom: 6px; }
.hex { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.sw { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #5D5A53; }
.sw i { width: 15px; height: 15px; border: 1px solid #D2CCBB; border-radius: 4px; }
</style></head>
<body>
  <p class="sec">品牌标记 · 按插槽请求的边长绘制</p>
  <div class="marks">
    ${marks.map(mark => `<div class="mark"><span class="lp-mark" style="width:${mark.size}px;height:${mark.size}px">${mark.art}</span>${mark.label}</div>`).join('\n    ')}
  </div>
  <p class="sec">设置 · 线条小狗</p>
  <div class="panel">${render(tree)}</div>
  <p class="sec" style="margin-top:30px">纸白墨线 · 别名令牌</p>
  <div class="hex">
    ${[
      ['#FBFAF6', 'bg-base'], ['#FFFFFF', 'layer-1'], ['#F6F4EE', 'layer-2'], ['#F0EDE4', 'layer-3'],
      ['#E7E3D7', 'border-l1'], ['#1F1E1C', 'ink'], ['#5D5A53', 'label-2'], ['#F2C14E', 'accent'],
    ].map(([color, name]) => `<span class="sw"><i style="background:${color}"></i>${name}<br></span>`).join('\n    ')}
  </div>
</body></html>`

await writeFile(join(outDir, 'settings-preview.html'), page)
console.log('wrote settings-preview.html')
