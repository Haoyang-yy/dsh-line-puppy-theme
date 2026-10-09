/*
 * 线条小狗 theme — client entry.
 *
 * Everything this plugin paints is scoped under one attribute on <html>, so
 * unloading the plugin restores the shipped look by removing attributes and the
 * accent property it set — never by rewriting the host's palette or stylesheets.
 */

const inject = ['slots']

function isBrowser() {
  return typeof document !== 'undefined' && typeof window !== 'undefined'
}

function installStyle() {
  const existing = document.querySelector(`style[${STYLE_ATTRIBUTE}]`)
  if (existing !== null) return existing
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.setAttribute(STYLE_ATTRIBUTE, '')
  style.textContent = LINE_PUPPY_CSS
  document.head.appendChild(style)
  return style
}

function setAttributeIfChanged(target, name, value) {
  if (target.getAttribute(name) !== value) target.setAttribute(name, value)
}

/* Single slots already have a built-in occupant at priority 0. Shadow it at a
   separate priority and withdraw our registration when the user opts out. */
function installBrandMark(ctx, settings, name, field, component) {
  return ctx.slots.inject(name, () => {
    let release
    const sync = () => {
      const value = settings.get().value
      if (value.enabled && value[field]) {
        if (!release) release = ctx.slots.register({
          name,
          priority: -10,
          inject: () => ({ settings }),
        }, component)
      } else if (release) {
        const remove = release
        release = undefined
        remove()
      }
    }
    sync()
    const unsubscribe = settings.subscribe(sync)
    return () => {
      unsubscribe()
      release?.()
    }
  })
}

function apply(ctx) {
  if (!isBrowser()) return

  ctx.effect(() => {
    const root = document.documentElement
    const style = installStyle()
    const form = createHostSettingsForm(ctx, HOST_ENTRY_ID)
    const settings = createSettingsController(form)
    const previousAccent = root.style.getPropertyValue(ACCENT_VARIABLE)
    const previousAccentPriority = root.style.getPropertyPriority(ACCENT_VARIABLE)
    const restoreAccent = () => {
      if (previousAccent) root.style.setProperty(ACCENT_VARIABLE, previousAccent, previousAccentPriority)
      else root.style.removeProperty(ACCENT_VARIABLE)
    }

    /** Mirror the persisted choices onto <html>; `enabled` gates everything. */
    const syncTheme = () => {
      const value = settings.get().value
      if (value.enabled) {
        setAttributeIfChanged(root, ROOT_ATTRIBUTE, '')
        setAttributeIfChanged(root, PAPER_ATTRIBUTE, value.paper ? 'on' : 'off')
        setAttributeIfChanged(root, MOTION_ATTRIBUTE, value.animated ? 'on' : 'off')
        if (root.style.getPropertyValue(ACCENT_VARIABLE) !== value.accent) {
          root.style.setProperty(ACCENT_VARIABLE, value.accent)
        }
        return
      }
      root.removeAttribute(ROOT_ATTRIBUTE)
      root.removeAttribute(PAPER_ATTRIBUTE)
      root.removeAttribute(MOTION_ATTRIBUTE)
      restoreAccent()
    }

    syncTheme()
    const unsubscribe = settings.subscribe(syncTheme)

    /* Both brand marks are square seats: upstream asks for an edge in pixels. */
    const offBrandMark = installBrandMark(ctx, settings, 'sidebar.brand.mark', 'brandMark', LinePuppyBrandMark)
    const offBrandName = installBrandMark(ctx, settings, 'sidebar.brand.name', 'brandMark', LinePuppyBrandName)
    const offHeroMark = installBrandMark(ctx, settings, 'conversation.hero.brand.mark', 'heroMascot', LinePuppyHeroMascot)
    const offCompanions = ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
      name: 'sidebar.footer.action',
      id: 'line-puppy-companions',
      order: -100,
      inject: () => ({ settings }),
    }, LinePuppySidebarCompanions))

    const offSettingsSection = ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section',
      id: 'line-puppy',
      order: 30,
      label: '线条小狗',
      inject: () => ({ settings }),
    }, LinePuppySettingsSection))

    return () => {
      offSettingsSection()
      offCompanions()
      offHeroMark()
      offBrandName()
      offBrandMark()
      unsubscribe()
      settings.destroy()
      form.destroy()
      root.removeAttribute(ROOT_ATTRIBUTE)
      root.removeAttribute(PAPER_ATTRIBUTE)
      root.removeAttribute(MOTION_ATTRIBUTE)
      restoreAccent()
      style?.remove()
    }
  }, 'line-puppy-theme: cream couple palette, offline artwork and settings page')
}
