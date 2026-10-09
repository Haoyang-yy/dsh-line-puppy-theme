/* The host supplies React lazily, after the client module registry is ready. */
let reactRuntime
function react() {
  if (reactRuntime === undefined) reactRuntime = require('react')
  return reactRuntime
}
function usePuppySettings(controller) {
  return react().useSyncExternalStore(controller.subscribe, controller.get, controller.get)
}
function markSize(size, fallback) { return Number.isFinite(size) && size > 0 ? size : fallback }

function LinePuppyBrandMark(props) {
  const state = usePuppySettings(props.settings)
  if (!state.value.enabled || !state.value.brandMark) return null
  const size = markSize(props.size, 24)
  return react().createElement('span', {
    className: 'lp-mark lp-mark--brand',
    style: { width: `${size}px`, height: `${size}px` },
    dangerouslySetInnerHTML: { __html: PUPPY_HEAD_SVG },
  })
}
function LinePuppyBrandName(props) {
  const state = usePuppySettings(props.settings)
  if (!state.value.enabled || !state.value.brandMark) return null
  return react().createElement('span', { className: 'lp-brand-name' }, 'DSH Desktop')
}
function LinePuppyHeroMascot(props) {
  const state = usePuppySettings(props.settings)
  if (!state.value.enabled || !state.value.heroMascot) return null
  const size = markSize(props.size, 34)
  return react().createElement('span', {
    className: props.className ? `lp-mark lp-mark--hero ${props.className}` : 'lp-mark lp-mark--hero',
    style: { width: `${size}px`, height: `${size}px` },
    dangerouslySetInnerHTML: { __html: PUPPY_CREST_SVG },
  })
}
function LinePuppySidebarCompanions(props) {
  const state = usePuppySettings(props.settings)
  if (!props.wide || !state.value.enabled || !state.value.brandMark) return null
  const React = react()
  return React.createElement('div', { className: 'lp-companions', 'aria-hidden': 'true' },
    React.createElement('div', { className: 'lp-companions__art', dangerouslySetInnerHTML: { __html: PUPPY_CHEER_SVG } }),
    React.createElement('div', { className: 'lp-companions__caption' }, '今天也要一起加油呀'))
}

const SETTING_ROWS = Object.freeze([
  { field: 'enabled', title: '启用情侣主题', desc: '奶油色界面、双小狗插画和温柔的点缀色' },
  { field: 'brandMark', title: '侧边栏双小狗', desc: '让白狗和小金毛一起陪在角落' },
  { field: 'heroMascot', title: '欢迎页贴贴插画', desc: '每次开始新会话，都能看到它们' },
  { field: 'paper', title: '轻柔纸纹', desc: '像一张温暖的奶油色画纸' },
  { field: 'animated', title: '轻微动效', desc: '轻轻起伏、爱心闪动，陪你慢慢思考' },
])

function LinePuppySettingsSection(props) {
  const React = react()
  const state = usePuppySettings(props.settings)
  const value = state.value
  const locked = !state.editable
  const set = update => { void props.settings.set(update) }
  const message = state.error || (state.saving ? '正在保存…' : state.loading ? '正在读取设置…' : locked ? '插件配置暂不可用，设置暂时无法保存。' : '')
  const row = item => React.createElement('div', { className: 'lp-row', key: item.field },
    React.createElement('div', { className: 'lp-row__copy' },
      React.createElement('span', { className: 'lp-row__title' }, item.title),
      React.createElement('span', { className: 'lp-row__desc' }, item.desc)),
    React.createElement('label', { className: 'lp-switch' },
      React.createElement('input', {
        type: 'checkbox', checked: value[item.field] === true, disabled: locked,
        'aria-label': item.title, onChange: event => set({ [item.field]: event.target.checked }),
      }), React.createElement('span', null)))
  const group = (label, rows) => React.createElement('div', { className: 'lp-group' },
    React.createElement('span', { className: 'lp-group__label' }, label),
    React.createElement('div', { className: 'lp-rows' }, rows.map(row)))
  return React.createElement('section', { className: 'lp-settings' },
    React.createElement('div', { className: 'lp-intro' },
      React.createElement('h2', null, '线条小狗'),
      React.createElement('p', null, '让每次打开，都有两只小狗陪着你。')),
    React.createElement('div', { className: 'lp-hero' },
      React.createElement('div', { className: 'lp-hero__copy' },
        React.createElement('span', { className: 'lp-hero__badge' }, '♥ 贴贴日常'),
        React.createElement('h3', { className: 'lp-hero__title' }, '一白一黄，刚好一对。'),
        React.createElement('p', { className: 'lp-hero__desc' }, '陈瓜瓜 × 陈西西')),
      React.createElement('div', { className: 'lp-hero-art', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: PUPPY_HUG_SVG } })),
    message ? React.createElement('div', { className: 'lp-status', role: state.error ? 'alert' : 'status', 'data-tone': state.error ? 'error' : 'info' }, message) : null,
    group('主题', SETTING_ROWS.slice(0, 1)),
    group('装饰与动效', SETTING_ROWS.slice(1)),
    React.createElement('div', { className: 'lp-group' },
      React.createElement('span', { className: 'lp-group__label' }, '点缀色'),
      React.createElement('div', { className: 'lp-accents' }, ACCENT_PRESETS.map(preset => React.createElement('button', {
        key: preset.value, type: 'button', className: 'lp-accent', 'aria-pressed': value.accent === preset.value,
        disabled: locked || !value.enabled, onClick: () => set({ accent: preset.value }),
      },
        React.createElement('span', { className: 'lp-accent__dot', style: { background: preset.value } }),
        preset.label,
        React.createElement('svg', { className: 'lp-accent__check', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': 'true' },
          React.createElement('path', { d: 'm5 12 4.5 4.5L19 7', strokeLinecap: 'round', strokeLinejoin: 'round' })))))))
}
