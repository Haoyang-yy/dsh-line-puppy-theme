/*
 * 线条小狗 theme — data layer.
 *
 * Plain script (no import/export): the build concatenates every file under
 * src/client/ into one factory scope, so this file only binds constants that
 * the runtime and mascot files read.
 */

const PLUGIN_ID = 'dsh-line-puppy-theme'
const ROOT_ATTRIBUTE = 'data-dsh-line-puppy'
const STYLE_ATTRIBUTE = 'data-dsh-line-puppy-style'
const PAPER_ATTRIBUTE = 'data-dsh-line-puppy-paper'
const MOTION_ATTRIBUTE = 'data-dsh-line-puppy-motion'
const ACCENT_VARIABLE = '--dsh-line-puppy-accent'
const HOST_ENTRY_ID = PLUGIN_ID

const ACCENT_PRESETS = Object.freeze([
  Object.freeze({ value: '#E8C887', label: '奶油黄' }),
  Object.freeze({ value: '#E4B4B0', label: '樱花粉' }),
  Object.freeze({ value: '#AFBCA8', label: '鼠尾草绿' }),
])

/* Upgrade saved 1.0.x palettes without writing defaults into host storage. */
const LEGACY_ACCENTS = Object.freeze({
  '#F2C14E': '#E8C887', '#E8A0A8': '#E4B4B0', '#7FB77E': '#AFBCA8',
})

const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  brandMark: true,
  heroMascot: true,
  paper: true,
  animated: true,
  accent: ACCENT_PRESETS[0].value,
})

/*
 * Cream, blush and warm ink palette.
 *
 * The couple theme is warm cream paper with soft blush accents, so the
 * theme restates the alias tokens the shell actually paints with instead of
 * nudging a couple of accents: a single light surface ramp, ink for text and
 * primary actions, and hairline borders that read as pen rulings rather than
 * shadows. State colors stay dark enough to sit on paper at AA.
 */
const LINE_PUPPY_TOKENS = Object.freeze({
  '--dsw-alias-bg-base': '#FFFCF7',
  '--dsw-alias-bg-layer-1': '#FFFFFF',
  '--dsw-alias-bg-layer-2': '#F7F3ED',
  '--dsw-alias-bg-layer-3': '#F7E2DF',
  '--dsw-alias-bg-module-platform': '#F7F3ED',
  '--dsw-alias-bg-overlay': '#FFFFFF',
  '--dsw-alias-bg-mask-1': 'rgba(31, 30, 28, 0.26)',
  '--dsw-alias-bg-mask-2': 'rgba(31, 30, 28, 0.14)',
  '--dsw-alias-border-l1': '#E8DFD3',
  '--dsw-alias-border-l2': '#D8CABB',
  '--dsw-alias-border-l3': '#B5A696',
  '--dsw-alias-brand-primary': '#3C3732',
  '--dsw-alias-brand-primary-new-colorprimary-new-color': '#3C3732',
  '--dsw-alias-brand-text': '#3C3732',
  '--dsw-alias-label-primary': '#3C3732',
  '--dsw-alias-label-primary-inverted': '#FFFCF7',
  '--dsw-alias-label-secondary': '#70665D',
  '--dsw-alias-label-tertiary': '#8E8174',
  '--dsw-alias-label-caption': '#8E8174',
  '--dsw-alias-label-primary-foreground': '#FFFFFF',
  '--dsw-alias-label-primary-dimmed': '#3C3732',
  '--dsw-alias-label-dimmed': '#B5A696',
  '--dsw-alias-menu-icon': '#70665D',
  '--dsw-alias-markdown-code-block': '#F7F3ED',
  '--dsw-alias-markdown-code-block-banner': '#F7F3ED',
  '--dsw-alias-markdown-inline-code': '#F7E2DF',
  '--dsw-alias-markdown-code-segment-selected': '#FFFFFF',
  '--dsw-alias-markdown-code-segment-unselected': '#F7F3ED',
  '--dsw-alias-markdown-placeholder': '#F7F3ED',
  '--dsw-alias-markdown-citation': '#F7E2DF',
  '--dsw-alias-markdown-tag': '#F7E2DF',
  '--dsw-alias-state-business-primary': '#3B6EA5',
  '--dsw-alias-state-business-tertiary': 'rgba(59, 110, 165, 0.14)',
  '--dsw-alias-state-error-primary': '#B4443A',
  '--dsw-alias-state-success-primary': '#3F7D52',
  '--dsw-alias-state-warn-primary': '#9A7218',
  '--dsw-alias-state-idle-primary': '#A9A296',
  '--dsw-alias-button-primary-fill': 'var(--dsh-line-puppy-accent)',
  '--dsw-alias-button-primary-hover': 'color-mix(in srgb, var(--dsh-line-puppy-accent), #3C3732 10%)',
  '--dsw-alias-button-elevated-fill': '#FFFFFF',
  '--dsw-alias-button-floating-fill': '#F7F3ED',
  '--dsw-alias-button-floating-hover': '#EDE3D8',
  '--dsw-alias-interactive-bg-hover': 'rgba(31, 30, 28, 0.05)',
  '--dsw-alias-interactive-bg-active': 'rgba(31, 30, 28, 0.09)',
  '--dsw-alias-interactive-bg-hover-solid': '#EDE3D8',
  '--dsw-alias-scrollbar-bg-l1': '#DCD6C6',
  '--dsw-alias-scrollbar-bg-l2': '#C8C1AF',
  '--dsw-alias-scrollbar-hover-l1': '#ADA593',
  '--dsw-alias-scrollbar-hover-l2': '#928A76',
  '--dsw-alias-tooltip-bg': '#3C3732',
  '--dsw-alias-toast-bg': '#FFFFFF',
  '--dsw-alias-toast-label': '#3C3732',
  '--dsw-alias-bg-skeleton': 'rgba(31, 30, 28, 0.04)',
  '--dsw-alias-bg-multi-select': '#F7E2DF',
  '--dsw-alias-bg-document-preview': '#F7F3ED',
  '--dsw-alias-label-document-preview': '#70665D',
  '--dsw-alias-border-l2-darkmode-thin': '#D8CABB',
  '--dsw-alias-border-l4': '#B5A696',
  '--dsw-alias-button-primary-dimmed': '#E8DFD3',
  '--dsw-alias-button-ghost-active-fill': '#F7E2DF',
  '--dsw-alias-button-ghost-active-hover': '#EDE3D8',
  '--dsw-alias-switch-thumb': '#FFFFFF',
  '--dsw-menu-surface-fill': '#FFFFFF',
  '--dsw-alias-menu-group-header-fill': '#F7F3ED',
  '--dsw-specific-bubble': '#F7F3ED',
  '--dsw-specific-bubble-highlight': '#F7E2DF',
  '--dsw-specific-input-major': '#FFFFFF',
  '--dsw-specific-login-input': '#F7F3ED',
  '--dsw-specific-selector': '#F7F3ED',
  '--dsw-specific-tip': '#F7F3ED',
  '--dsw-specific-sidebar-fill': '#F5EFE5',
  '--dsw-specific-sidebar-nav-item-active': '#F7E2DF',
  '--dsw-specific-sidebar-nav-item-active-accent': '#F7E2DF',
  '--dsw-specific-sidebar-nav-item-hover': '#EDE3D8',
  '--dsw-alias-button-info-fill': 'var(--dsh-line-puppy-accent)',
  '--dsw-alias-button-info-hover': 'color-mix(in srgb, var(--dsh-line-puppy-accent), #3C3732 10%)',
  '--dsw-specific-menu': '#FFFFFF',
  '--shiki-token-constant': '#1c7ed6',
  '--shiki-token-string': '#2f9e44',
  '--shiki-token-comment': '#8E8174',
  '--shiki-token-keyword': '#d6336c',
  '--shiki-token-parameter': '#e8590c',
  '--shiki-token-function': '#6741d9',
  '--shiki-token-string-expression': '#2b8a3e',
  '--shiki-token-punctuation': '#495057',
  '--shiki-token-link': '#1971c2',
})

/* A scoped stylesheet wins over inline theme tokens without mutating them.
   Removing our root attribute immediately reveals the host's current palette. */
const LINE_PUPPY_TOKEN_CSS = Object.entries(LINE_PUPPY_TOKENS)
  .map(([name, value]) => `  ${name}: ${value} !important;`)
  .join('\n')

