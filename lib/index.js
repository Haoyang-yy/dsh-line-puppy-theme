import z from '@deepseek-ai/schemastery'

/**
 * Host half of the 线条小狗 theme.
 *
 * The client half owns every pixel; this half only declares the persisted
 * Config surface so the profile's Cordis patch can store the user's choices
 * and so the client's `configForms` face has a writable namespace to bind to.
 * Volatile fields keep DSH from treating a UI preference as a restart-worthy
 * config change.
 */

const ACCENTS = ['#E8C887', '#E4B4B0', '#AFBCA8']

const accent = z
  .string()
  .default(ACCENTS[0])
  .description('点缀色')
  .volatile()

/** Config schema persisted by the active profile's Cordis patch. */
export const Config = z.object({
  enabled: z.boolean().default(true).description('线条小狗主题').volatile(),
  brandMark: z.boolean().default(true).description('侧边栏双小狗').volatile(),
  heroMascot: z.boolean().default(true).description('欢迎页贴贴插画').volatile(),
  paper: z.boolean().default(true).description('纸纹背景').volatile(),
  animated: z.boolean().default(true).description('轻微动效').volatile(),
  accent,
})

/** Same fields without `volatile()`, which is a host-Config concern only. */
const CLIENT_SCHEMA = z.object({
  enabled: z.boolean().default(true),
  brandMark: z.boolean().default(true),
  heroMascot: z.boolean().default(true),
  paper: z.boolean().default(true),
  animated: z.boolean().default(true),
  accent: z.string().default(ACCENTS[0]),
})

export function apply(ctx) {
  ctx.inject(['settings'], child => {
    if (typeof child.settings.register === 'function') {
      child.settings.register('dsh-line-puppy-theme', CLIENT_SCHEMA)
    } else {
      child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
    }
  })
}
