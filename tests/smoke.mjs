#!/usr/bin/env node
/**
 * Runtime smoke test for the built client bundle.
 *
 * The bundle talks to a browser, a React runtime and the slot service. This test
 * supplies small stand-ins for all three, then executes the real packaged code:
 * it applies the theme, renders every registered slot component, flips settings
 * through the host form, and disposes — asserting that the DOM effects and the
 * registrations behave and that everything is handed back on unload.
 *
 * It also writes the art it finds to `tests/out/` so the SVG can be checked for
 * well-formedness by the caller.
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'tests/out')

const failures = []
const checks = []
function check(label, condition, detail = '') {
  checks.push(label)
  if (!condition) failures.push(detail ? `${label} — ${detail}` : label)
}

/* ---- minimal DOM ------------------------------------------------------ */

const observerInstances = []
function recordAttributeMutation(target, attributeName) {
  for (const observer of observerInstances) {
    if (observer.observing && observer.target === target
      && observer.options.attributes
      && (!observer.options.attributeFilter || observer.options.attributeFilter.includes(attributeName))) {
      observer.records.push({ type: 'attributes', target, attributeName })
    }
  }
}

/* Deliver mutation batches until the event loop can yield. A budget makes the
   former opposing palette locks fail deterministically instead of hanging CI. */
function flushMutations(limit = 20) {
  for (let turn = 0; turn < limit; turn++) {
    const pending = observerInstances.filter(observer => observer.observing && observer.records.length)
    if (pending.length === 0) return turn
    const deliveries = pending.map(observer => [observer, observer.records.splice(0)])
    for (const [observer, records] of deliveries) {
      if (observer.observing) observer.callback(records, observer)
    }
  }
  throw new Error('palette observers never settle; rendering would be starved')
}

class FakeStyle {
  constructor() { this.props = new Map() }
  setProperty(name, value, priority = '') { this.props.set(name, { value: String(value), priority: priority ?? '' }) }
  getPropertyValue(name) { return this.props.get(name)?.value ?? '' }
  getPropertyPriority(name) { return this.props.get(name)?.priority ?? '' }
  removeProperty(name) { this.props.delete(name) }
}

function makeElement(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    attributes: new Map(),
    style: new FakeStyle(),
    children: [],
    dataset: {},
    textContent: '',
    parentNode: null,
    setAttribute(name, value) {
      this.attributes.set(name, String(value))
      recordAttributeMutation(this, name)
    },
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null },
    hasAttribute(name) { return this.attributes.has(name) },
    removeAttribute(name) {
      if (this.attributes.delete(name)) recordAttributeMutation(this, name)
    },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child },
    remove() {
      const siblings = this.parentNode?.children
      const index = siblings ? siblings.indexOf(this) : -1
      if (index >= 0) siblings.splice(index, 1)
    },
  }
  return el
}

const documentElement = makeElement('html')
const body = makeElement('body')
const head = makeElement('head')
const document = {
  documentElement,
  body,
  head,
  createElement: tag => makeElement(tag),
  querySelector: () => null,
  addEventListener: () => {},
}

class MutationObserver {
  constructor(callback) { this.callback = callback; this.records = []; observerInstances.push(this) }
  observe(target, options) { this.target = target; this.options = options; this.observing = true }
  disconnect() { this.observing = false; this.records = [] }
}

globalThis.document = document
globalThis.MutationObserver = MutationObserver
globalThis.window = { matchMedia: () => ({ matches: false }) }

/* ---- minimal React ---------------------------------------------------- */

const React = {
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children: children.flat().filter(child => child !== null && child !== undefined && child !== false) }
  },
  useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
}

function requireStub(name) {
  if (name === 'react') return React
  throw new Error(`unexpected module request: ${name}`)
}

/* ---- minimal host: a config form and a slot service ------------------- */

const config = { enabled: true, brandMark: true, heroMascot: true, paper: true, animated: true, accent: '#F2C14E' }
const configListeners = new Set()
const configForm = {
  getSnapshot: () => ({ status: 'ready', mode: 'host', writable: true, value: { ...config } }),
  subscribe(listener) { configListeners.add(listener); return () => configListeners.delete(listener) },
  async mutate(ops) {
    for (const op of ops) if (op.op === 'set') config[op.path[0]] = op.value
    for (const listener of configListeners) listener()
    return true
  },
}

/** The host's `configForms` service: `.get(entryId)` yields the entry's form. */
const configFormService = { get: () => configForm }

const registrations = []
const effectDisposers = []
const eventHandlers = new Map()

const ctx = {
  effect(callback, label) {
    const dispose = callback()
    effectDisposers.push({ dispose, label })
    return dispose
  },
  on(name, listener) { eventHandlers.set(name, listener); return () => eventHandlers.delete(name) },
  inject(services, callback) {
    const service = services[0]
    if (service !== 'configForms') return { dispose: async () => {} }
    /* Like Cordis: the child gets its own effect scope and the inject call
       returns a fiber whose dispose() tears that scope down. */
    const childEffects = []
    const child = Object.create(ctx)
    child.configForms = configFormService
    child.effect = callback2 => {
      const dispose = callback2()
      childEffects.push(dispose)
      return dispose
    }
    callback(child)
    return { dispose: async () => { for (const dispose of childEffects) dispose() } }
  },
  slots: {
    inject(key, callback) {
      const dispose = callback()
      return typeof dispose === 'function' ? dispose : () => {}
    },
    register(options, component) {
      if (options.name.endsWith('brand.mark')) {
        const priority = options.priority ?? 0
        if (priority === 0 || registrations.some(entry => entry.active && entry.options.name === options.name && (entry.options.priority ?? 0) === priority)) {
          throw new Error(`single slot ${options.name} already has a registration at priority ${priority}`)
        }
      }
      const entry = { options, component, active: true }
      registrations.push(entry)
      return () => { entry.active = false }
    },
  },
}

/* ---- run the packaged client half ------------------------------------ */

await mkdir(outDir, { recursive: true })
let exported
globalThis.window.__ModuleLoader__ = { load: ({ id, factory }) => { exported = { id, exports: factory(requireStub) } } }

const bundle = await readFile(process.argv[2] ?? join(root, 'lib/client.js'), 'utf8')
// eslint-disable-next-line no-new-func
new Function(`${bundle}\n//# sourceURL=lib/client.js`)()

check('bundle registers under the package id', exported?.id === 'dsh-line-puppy-theme', String(exported?.id))
check('bundle exports apply()', typeof exported?.exports?.apply === 'function')
check('bundle exports inject face', Array.isArray(exported?.exports?.inject) && exported.exports.inject.includes('slots'))

const attribute = 'data-dsh-line-puppy'
const tokenName = '--dsw-alias-bg-base'
const accentVar = '--dsh-line-puppy-accent'

/* Reproduce the installed official homepage theme's dark-palette observer.
   The old puppy plugin removed the same attribute on every observer delivery. */
body.setAttribute('data-ds-dark-theme', '')
const officialObserver = new MutationObserver(() => {
  if (!body.hasAttribute('data-ds-dark-theme')) body.setAttribute('data-ds-dark-theme', '')
})
officialObserver.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
documentElement.style.setProperty(tokenName, '#071323', 'important')
body.style.setProperty(tokenName, '#102641')

exported.exports.apply(ctx)
try {
  check('opposing theme observers settle without starving rendering', flushMutations() < 20)
} catch (error) {
  console.error(`FAIL  ${error.message}`)
  process.exit(1)
}
check('host dark-palette attribute is preserved', body.hasAttribute('data-ds-dark-theme'))
check('puppy creates no palette observer', observerInstances.length === 1)

check('theme attribute applied to <html>', documentElement.hasAttribute(attribute))
check('paper attribute set to on', documentElement.getAttribute(`${attribute}-paper`) === 'on')
check('motion attribute set to on', documentElement.getAttribute(`${attribute}-motion`) === 'on')
check('host root token is not rewritten', documentElement.style.getPropertyValue(tokenName) === '#071323')
check('host body token is not rewritten', body.style.getPropertyValue(tokenName) === '#102641')
check('saved 1.0.x warm yellow migrates to cream yellow', documentElement.style.getPropertyValue(accentVar) === '#E8C887', documentElement.style.getPropertyValue(accentVar))

const styleElements = head.children.filter(child => child.tagName === 'STYLE')
check('exactly one stylesheet installed', styleElements.length === 1, `count=${styleElements.length}`)
const css = styleElements[0]?.textContent ?? ''
check('stylesheet is scoped to the root attribute', css.includes(`html[${attribute}]`))
check('stylesheet braces balance', (css.match(/\{/g) ?? []).length === (css.match(/\}/g) ?? []).length)
check('cream tokens use CSS precedence', css.includes(`${tokenName}: #FFFCF7 !important;`))
check('selector and tip tokens stay light with a dark host', css.includes('--dsw-specific-selector: #F7F3ED !important;') && css.includes('--dsw-specific-tip: #F7F3ED !important;'))
await writeFile(join(outDir, 'theme.css'), css)

/* Read palette values from the shipped stylesheet for the offline preview. */
await writeFile(join(outDir, 'tokens.json'), JSON.stringify({
  tokens: Object.fromEntries([...css.matchAll(/^  (--[\w-]+): (.+) !important;$/gm)]
    .map(([, name, value]) => [name, value])),
}, null, 2))

/* Host appearance changes are left to the host, including when another theme
   reasserts dark. Only that theme should write the shared attribute. */
body.removeAttribute('data-ds-dark-theme')
check('a competing theme can reassert dark and settle', flushMutations() < 20 && body.hasAttribute('data-ds-dark-theme'))

/* ---- render every registered slot component -------------------------- */

const registeredNames = registrations.map(entry => entry.options.name).sort()
check('registers sidebar brand mark', registeredNames.includes('sidebar.brand.mark'), registeredNames.join(','))
check('registers hero brand mark', registeredNames.includes('conversation.hero.brand.mark'), registeredNames.join(','))
check('registers a settings page', registeredNames.includes('settings.section'), registeredNames.join(','))
check('sidebar mark passes no slot options', registrations.find(e => e.options.name === 'sidebar.brand.mark')?.options.id === undefined)
check('marks shadow built-in priority without duplicate registration', registrations.filter(e => e.options.name.endsWith('brand.mark')).every(e => e.options.priority < 0))
check('settings page is a distinct id at order 30', (() => {
  const entry = registrations.find(e => e.options.name === 'settings.section')
  return entry?.options.id === 'line-puppy' && entry?.options.order === 30 && entry?.options.label === '线条小狗'
})())

/** Owner props each square mark seat supplies, per its published catalog. */
const OWNER_PROPS = {
  'sidebar.brand.mark': [{ size: 22 }, { size: 18 }],
  'conversation.hero.brand.mark': [{ size: 56, className: 'hero-mark' }],
  'sidebar.footer.action': [{ wide: true }],
  'settings.section': [{ close: () => {} }],
}

const svgSources = new Map()
function collectSvg(node, bucket) {
  if (node === null || node === undefined || typeof node !== 'object') return bucket
  const html = node.props?.dangerouslySetInnerHTML?.__html
  if (typeof html === 'string') bucket.push(html)
  for (const child of node.children ?? []) collectSvg(child, bucket)
  return bucket
}

function render(element) {
  if (element === null || element === undefined || typeof element !== 'object') return element
  const { type, props, children } = element
  return typeof type === 'function' ? render(type({ ...props, children })) : element
}

for (const { options, component } of registrations) {
  const variants = OWNER_PROPS[options.name] ?? [{}]
  for (const ownerProps of variants) {
    const injected = typeof options.inject === 'function' ? options.inject() : {}
    const tree = render(component({ ...ownerProps, ...injected }))
    const label = `${options.name} size=${ownerProps.size ?? '-'}`
    check(`renders ${label}`, tree !== null && tree !== undefined, 'component returned nothing')
    if (tree === null || tree === undefined) continue
    const svgs = collectSvg(tree, [])
    for (const svg of svgs) svgSources.set(`${label}:${svgSources.size}`, svg)
    if (options.name.endsWith('brand.mark')) {
      check(`${label} draws art once`, svgs.length === 1, `count=${svgs.length}`)
      check(`${label} sizes the art to the requested edge`, tree.props?.style?.width === `${ownerProps.size}px`, JSON.stringify(tree.props?.style))
      if (ownerProps.className) check(`${label} forwards the host className`, String(tree.props.className).includes(ownerProps.className), String(tree.props.className))
      check(`${label} labels the art for screen readers`, /aria-label="线条小狗"/.test(svgs[0] ?? ''))
    }
  }
}

/* the settings page must actually expose the controls */
const settingsEntry = registrations.find(entry => entry.options.name === 'settings.section')
const settingsTree = render(settingsEntry.component({ ...settingsEntry.options.inject() }))
const html = JSON.stringify(settingsTree)
check('settings page renders five switches', (html.match(/"type":"checkbox"/g) ?? []).length === 5, String((html.match(/"type":"checkbox"/g) ?? []).length))
check('settings page renders the three accent presets', (html.match(/"lp-accent__dot"/g) ?? []).length === 3)
check('settings page shows the couple', JSON.stringify(collectSvg(settingsTree, [])).includes('lp-art--hug'))

const companions = registrations.find(entry => entry.options.name === 'sidebar.footer.action')
check('collapsed sidebar hides the decorative couple', companions.component({ wide: false, ...companions.options.inject() }) === null)
check('artwork loads entirely offline', [...svgSources.values()].every(svg => [...svg.matchAll(/href="([^"]+)"/g)].every(([, href]) => href.startsWith('data:image/png;base64,'))))

for (const [label, svg] of svgSources) {
  await writeFile(join(outDir, `${label.replace(/[^a-z0-9]+/gi, '-')}.svg`), svg)
}
await writeFile(join(outDir, 'settings-tree.json'), JSON.stringify(settingsTree, null, 2))

/* ---- flip settings through the host form ----------------------------- */

await settingsEntry.options.inject().settings.set({ enabled: false })
check('disabling the theme removes the root attribute', !documentElement.hasAttribute(attribute))
check('disabling the theme clears the accent variable', documentElement.style.getPropertyValue(accentVar) === '')
check('disabling preserves the other theme palette', body.hasAttribute('data-ds-dark-theme') && body.style.getPropertyValue(tokenName) === '#102641')
check('disabling withdraws both marks so built-in logos return', registrations.filter(e => e.active && e.options.name.endsWith('brand.mark')).length === 0)
check('disabling hides the decorative footer', companions.component({ wide: true, ...companions.options.inject() }) === null)
check('disabling restores the native brand name', registrations.filter(e => e.active && e.options.name === 'sidebar.brand.name').length === 0)
await settingsEntry.options.inject().settings.set({ enabled: true, paper: false, animated: false, accent: '#E4B4B0' })
check('theme can be re-enabled', documentElement.hasAttribute(attribute))
check('re-enabling registers exactly one replacement per mark', registrations.filter(e => e.active && e.options.name.endsWith('brand.mark')).length === 2)
check('paper toggle reaches the DOM', documentElement.getAttribute(`${attribute}-paper`) === 'off')
check('motion toggle reaches the DOM', documentElement.getAttribute(`${attribute}-motion`) === 'off')
check('accent choice reaches the DOM', documentElement.style.getPropertyValue(accentVar) === '#E4B4B0', documentElement.style.getPropertyValue(accentVar))

await settingsEntry.options.inject().settings.set({ brandMark: false, heroMascot: false })
check('individual mark switches restore both built-in logos', registrations.filter(e => e.active && e.options.name.endsWith('brand.mark')).length === 0)
check('sidebar opt-out also hides the decorative footer', companions.component({ wide: true, ...companions.options.inject() }) === null)
await settingsEntry.options.inject().settings.set({ brandMark: true, heroMascot: true })
check('individual mark switches can restore both puppies', registrations.filter(e => e.active && e.options.name.endsWith('brand.mark')).length === 2)

/* A host theme update must survive plugin disable/unload, not get replaced by
   the obsolete values the plugin observed on startup. */
officialObserver.disconnect()
body.removeAttribute('data-ds-dark-theme')
body.style.setProperty(tokenName, '#EEEEEE', 'important')
eventHandlers.get('theme/change')?.()
await new Promise(resolve => setTimeout(resolve, 0))
check('theme/change leaves host light mode untouched', !body.hasAttribute('data-ds-dark-theme'))
check('theme/change does not overwrite new host tokens', body.style.getPropertyValue(tokenName) === '#EEEEEE')

/* ---- dispose --------------------------------------------------------- */

const totalTokens = documentElement.style.props.size
const themeEffect = effectDisposers.find(entry => String(entry.label).startsWith('line-puppy-theme'))
check('the theme installs one labeled effect', themeEffect !== undefined, effectDisposers.map(e => e.label).join(' | '))
await themeEffect.dispose()
check('dispose removes the root attribute', !documentElement.hasAttribute(attribute))
check('dispose removes the paper/motion attributes', !documentElement.hasAttribute(`${attribute}-paper`) && !documentElement.hasAttribute(`${attribute}-motion`))
check('dispose preserves the root token and priority', documentElement.style.getPropertyValue(tokenName) === '#071323' && documentElement.style.getPropertyPriority(tokenName) === 'important')
check('dispose preserves the latest body palette', body.style.getPropertyValue(tokenName) === '#EEEEEE' && body.style.getPropertyPriority(tokenName) === 'important')
check('dispose removes only owned inline properties', documentElement.style.props.size === 1 && body.style.props.size === 1, `root=${documentElement.style.props.size}/${totalTokens} body=${body.style.props.size}`)
check('dispose removes the stylesheet', head.children.filter(child => child.tagName === 'STYLE').length === 0)
check('dispose stops the palette observer', observerInstances.every(observer => !observer.observing))
check('dispose unsubscribes from theme/change', eventHandlers.size === 0)
check('dispose unregisters every contribution', registrations.every(e => !e.active))

/* ---- report ---------------------------------------------------------- */

console.log(`ran ${checks.length} checks, ${failures.length} failed`)
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL  ${failure}`)
  process.exitCode = 1
} else {
  console.log('all checks passed')
  if (process.env.LP_KEEP_OUT !== '1') await rm(outDir, { recursive: true, force: true })
}
