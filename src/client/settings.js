/*
 * 线条小狗 theme — settings plumbing.
 *
 * Two layers, same split as the shipped themes: a host-form adapter that binds
 * the plugin's Config namespace whichever way the running DSH exposes it, and a
 * controller that turns that revision-checked snapshot into something React can
 * subscribe to. Persistence, revision checks and reconnect synchronization stay
 * the host's job, so nothing here ever seeds defaults into browser storage.
 */

function normalizeAccent(value) {
  const migrated = LEGACY_ACCENTS[value] ?? value
  return ACCENT_PRESETS.some(preset => preset.value === migrated) ? migrated : DEFAULT_SETTINGS.accent
}

function normalizeSettings(value) {
  return Object.freeze({
    enabled: value?.enabled !== false,
    brandMark: value?.brandMark !== false,
    heroMascot: value?.heroMascot !== false,
    paper: value?.paper !== false,
    animated: value?.animated !== false,
    accent: normalizeAccent(value?.accent),
  })
}

/** Bind the plugin's Config namespace, tolerating either settings service. */
function createHostSettingsForm(ctx, entryId) {
  const listeners = new Set()
  const forms = new Map()
  const unavailable = Object.freeze({ status: 'unavailable', mode: 'host', writable: false })
  const current = () => forms.get('configForms') ?? forms.get('settingsScope')
  const notify = () => { for (const listener of listeners) listener() }
  const disposers = ['configForms', 'settingsScope'].map(service => ctx.inject([service], child => {
    child.effect(() => {
      const form = service === 'configForms'
        ? child.configForms.get(entryId)
        : child.settingsScope.bind({ namespace: entryId })
      forms.set(service, form)
      const off = form.subscribe(notify)
      notify()
      return () => {
        off()
        forms.delete(service)
        notify()
      }
    })
  }))
  return {
    getSnapshot: () => current()?.getSnapshot() ?? unavailable,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    mutate: ops => current()?.mutate(ops) ?? Promise.resolve(false),
    destroy: () => { listeners.clear(); return Promise.all(disposers.map(fiber => fiber.dispose())) },
  }
}

/**
 * Optimistic write-through controller: a click updates local state at once,
 * then reconciles with the host's answer. A stale answer from an earlier
 * revision is dropped instead of overwriting a newer one.
 */
function createSettingsController(form) {
  const listeners = new Set()
  let saving = false
  let generation = 0
  let preview
  let error = ''
  let disposed = false
  let snapshot
  const sync = () => {
    if (disposed) return
    const host = form.getSnapshot()
    const ready = host.status === 'ready' && host.value !== undefined
    snapshot = Object.freeze({
      value: preview ?? normalizeSettings(ready ? host.value : DEFAULT_SETTINGS),
      ready,
      loading: host.status === 'loading',
      editable: ready && host.mode === 'host' && host.writable,
      saving,
      error,
    })
    for (const listener of listeners) listener()
  }
  const unsubscribe = form.subscribe(sync)
  sync()

  return {
    get: () => snapshot,
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    set: async update => {
      if (disposed || !snapshot.editable) return false
      const fields = Object.keys(DEFAULT_SETTINGS).filter(field => Object.hasOwn(update, field))
      if (fields.length === 0) return false
      preview = normalizeSettings({ ...snapshot.value, ...update })
      const ops = fields.map(field => ({ op: 'set', path: [field], value: preview[field] }))
      const current = ++generation
      saving = true
      error = ''
      sync()
      try {
        const accepted = await form.mutate(ops)
        if (!accepted && current === generation) error = '设置保存失败，请重试。'
        return accepted
      } catch {
        if (current === generation) error = '设置保存失败，请检查连接后重试。'
        return false
      } finally {
        if (current === generation) {
          preview = undefined
          saving = false
          sync()
        }
      }
    },
    destroy: () => {
      disposed = true
      unsubscribe()
      listeners.clear()
    },
  }
}
