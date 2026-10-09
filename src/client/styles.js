/* Shell changes are gated by our attribute. Settings remain usable when off. */
const LINE_PUPPY_CSS = `
:root[${ROOT_ATTRIBUTE}] { color-scheme: light !important; ${ACCENT_VARIABLE}: #E8C887; background: #FFFCF7; }
html[${ROOT_ATTRIBUTE}], html[${ROOT_ATTRIBUTE}] body {
${LINE_PUPPY_TOKEN_CSS}
}
html[${ROOT_ATTRIBUTE}] body { background: #FFFCF7 !important; color: #3C3732; }
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-root] { background: #F5EFE5 !important; backdrop-filter: none !important; border-right: 1px solid #E8DFD3; }
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-wide='true'] button[aria-label='新建会话'],
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-wide='true'] button[aria-label='New session'] {
  background: color-mix(in srgb, var(${ACCENT_VARIABLE}) 80%, #FFFCF7) !important;
  border-color: transparent; border-radius: 12px; color: #3C3732;
}
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-root] [role='row'][aria-selected='true'],
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-root] [role='treeitem'][aria-selected='true'] { background: #F7E2DF !important; border-radius: 10px; }
html[${ROOT_ATTRIBUTE}][${PAPER_ATTRIBUTE}='on'] [data-conversation-content] { background-image: radial-gradient(rgba(189,172,151,.13) .65px, transparent .9px); background-size: 16px 16px; }
html[${ROOT_ATTRIBUTE}] [data-conversation-region='composer'] [class$='_card'] { border: 1px solid #E8DFD3; border-radius: 21px; box-shadow: 0 5px 20px rgba(128,102,76,.06); }
html[${ROOT_ATTRIBUTE}] [data-conversation-region='composer'] [class$='_primary'] { color: #3C3732; border-radius: 12px; }
html[${ROOT_ATTRIBUTE}] ::-webkit-scrollbar { width: 11px; height: 11px; }
html[${ROOT_ATTRIBUTE}] ::-webkit-scrollbar-track { background: transparent; }
html[${ROOT_ATTRIBUTE}] ::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l1); background-clip: content-box; border: 3.5px solid transparent; border-radius: 999px; }
html[${ROOT_ATTRIBUTE}] ::-webkit-scrollbar-thumb:hover { background-color: var(--dsw-alias-scrollbar-hover-l1); }

/* CSS-module suffixes avoid build-specific hashes; :has() preserves the native
   welcome layout whenever our illustration is switched off. */
html[${ROOT_ATTRIBUTE}] .lp-mark { display: inline-flex; align-items: center; justify-content: center; }
html[${ROOT_ATTRIBUTE}] .lp-mark--brand { width: 50px !important; height: 34px !important; flex: none; }
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-wide='true'] [class$='_brandIdentity']:has(.lp-mark--brand) { height: 34px; }
html[${ROOT_ATTRIBUTE}] [data-dsh-sidebar-wide='false'] .lp-mark--brand { width: 24px !important; height: 24px !important; }
html[${ROOT_ATTRIBUTE}] .lp-brand-name { font-size: 17px; letter-spacing: 0; font-weight: 600; white-space: nowrap; }
html[${ROOT_ATTRIBUTE}] .lp-mark--hero { width: clamp(180px, 28vw, 320px) !important; height: auto !important; aspect-ratio: 320 / 222; flex: none; animation: none !important; }
html[${ROOT_ATTRIBUTE}] .lp-art, .lp-settings .lp-art { display: block; width: 100%; height: 100%; overflow: visible; }
html[${ROOT_ATTRIBUTE}] [class$='_headline']:has(.lp-mark--hero) { flex-direction: column; flex-wrap: nowrap; gap: 12px; font-size: 30px; line-height: 1.3; margin-bottom: 20px; }
html[${ROOT_ATTRIBUTE}] [class$='_headline']:has(.lp-mark--hero)::after { content: '和你一起，把灵感变成现实。'; color: #9A897B; font-size: 14px; font-weight: 400; line-height: 1.6; }
html[${ROOT_ATTRIBUTE}] [class$='_headline']:has(.lp-mark--hero) [class$='_previewBadge'] { display: none; }
html[${ROOT_ATTRIBUTE}] [class$='_fishHitbox']:has(.lp-mark--hero) { pointer-events: none; }
html[${ROOT_ATTRIBUTE}] .lp-companions { width: 100%; min-width: 0; text-align: center; padding: 14px 0 20px; pointer-events: none; user-select: none; }
html[${ROOT_ATTRIBUTE}] [class$='_footerActions']:has(.lp-companions) { flex-direction: column; }
html[${ROOT_ATTRIBUTE}] .lp-companions__art { width: 130px; height: 73px; margin: 0 auto 7px; }
html[${ROOT_ATTRIBUTE}] .lp-companions__caption { color: #9A897B; font-size: 11px; line-height: 1.6; }
@keyframes lp-couple-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes lp-heart-float { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
html[${ROOT_ATTRIBUTE}][${MOTION_ATTRIBUTE}='on'] .lp-couple { animation: lp-couple-bob 4.5s ease-in-out infinite; }
html[${ROOT_ATTRIBUTE}][${MOTION_ATTRIBUTE}='on'] .lp-hearts { animation: lp-heart-float 4.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { html[${ROOT_ATTRIBUTE}] .lp-art, html[${ROOT_ATTRIBUTE}] .lp-art * { animation: none !important; } .lp-settings * { transition: none !important; } }
@media (max-height: 720px) {
  html[${ROOT_ATTRIBUTE}] .lp-mark--hero { width: 230px !important; }
  html[${ROOT_ATTRIBUTE}] [class$='_headline']:has(.lp-mark--hero) { gap: 8px; margin-bottom: 10px; font-size: 26px; }
  html[${ROOT_ATTRIBUTE}] .lp-companions { padding: 5px 0 10px; }
  html[${ROOT_ATTRIBUTE}] .lp-companions__art { width: 100px; height: 56px; }
}
@media (max-height: 540px) { html[${ROOT_ATTRIBUTE}] .lp-mark--hero { width: 165px !important; } html[${ROOT_ATTRIBUTE}] .lp-companions { display: none; } }

/* Consume the host palette here so disabling our theme in a dark host leaves
   every preference readable. The pastel illustration card owns its colors. */
.lp-settings { --lp-accent: var(${ACCENT_VARIABLE}, #E8C887); display: flex; flex-direction: column; gap: 24px; padding-bottom: 28px; color: var(--dsw-alias-label-primary, #3C3732); }
.lp-settings .lp-intro h2 { margin: 0 0 8px; font-size: 26px; font-weight: 500; line-height: 1.35; }
.lp-settings .lp-intro p { margin: 0; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-secondary, #70665D); }
.lp-settings .lp-hero { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 24px; border: 1px solid #E8DFD3; border-radius: 19px; background: linear-gradient(135deg, #FFF5E5, #FAE8E5); color: #3C3732; }
.lp-settings .lp-hero__copy { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.lp-settings .lp-hero__badge { align-self: flex-start; border-radius: 999px; background: #FFFFFF; color: #A77471; padding: 4px 10px; font-size: 11px; line-height: 18px; }
.lp-settings .lp-hero__title { margin: 0; font-size: 23px; font-weight: 500; line-height: 1.4; }
.lp-settings .lp-hero__desc { margin: 0; font-size: 13px; line-height: 1.7; color: #927A65; }
.lp-settings .lp-hero-art { flex: none; width: 154px; height: 128px; }
.lp-settings .lp-group { display: flex; flex-direction: column; gap: 10px; }
.lp-settings .lp-group__label { font-size: 12px; color: var(--dsw-alias-label-secondary, #70665D); }
.lp-settings .lp-rows { border: 1px solid var(--dsw-alias-border-l1, #E8DFD3); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #FFFFFF); padding: 0 20px; }
.lp-settings .lp-row { display: flex; align-items: center; gap: 16px; padding: 15px 0; min-height: 36px; }
.lp-settings .lp-row + .lp-row { border-top: 1px solid var(--dsw-alias-border-l1, #E8DFD3); }
.lp-settings .lp-row__copy { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; }
.lp-settings .lp-row__title { font-size: 14px; font-weight: 500; }
.lp-settings .lp-row__desc { font-size: 12px; line-height: 1.65; color: var(--dsw-alias-label-secondary, #70665D); }
.lp-settings .lp-switch { position: relative; display: inline-flex; flex: none; width: 40px; height: 23px; }
.lp-settings .lp-switch input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.lp-settings .lp-switch span { position: absolute; inset: 0; border-radius: 999px; background: var(--dsw-alias-border-l2, #D8CABB); pointer-events: none; transition: background .18s ease; }
.lp-settings .lp-switch span::after { content: ''; position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #FFFFFF; transition: transform .18s ease; }
.lp-settings .lp-switch input:checked + span { background: var(--lp-accent); }
.lp-settings .lp-switch input:checked + span::after { transform: translateX(17px); }
.lp-settings .lp-switch input:focus-visible + span { outline: 2px solid var(--dsw-alias-label-primary, #3C3732); outline-offset: 3px; }
.lp-settings .lp-switch input:disabled { cursor: not-allowed; }
.lp-settings .lp-switch input:disabled + span { opacity: .45; }
.lp-settings .lp-accents { display: flex; flex-wrap: wrap; gap: 12px; }
.lp-settings .lp-accent { display: inline-flex; align-items: center; gap: 10px; min-width: 130px; padding: 11px 15px; border: 1px solid var(--dsw-alias-border-l1, #E8DFD3); border-radius: 11px; background: var(--dsw-alias-bg-layer-1, #FFFFFF); color: var(--dsw-alias-label-secondary, #70665D); font: inherit; font-size: 12px; cursor: pointer; }
.lp-settings .lp-accent[aria-pressed='true'] { border-color: var(--lp-accent); background: color-mix(in srgb, var(--lp-accent) 14%, var(--dsw-alias-bg-layer-1, #FFFFFF)); }
.lp-settings .lp-accent:hover:not(:disabled) { border-color: var(--dsw-alias-border-l2, #D8CABB); }
.lp-settings .lp-accent:focus-visible { outline: 2px solid var(--dsw-alias-label-primary, #3C3732); outline-offset: 3px; }
.lp-settings .lp-accent:disabled { opacity: .5; cursor: not-allowed; }
.lp-settings .lp-accent__dot { flex: none; width: 16px; height: 16px; border-radius: 50%; }
.lp-settings .lp-accent__check { margin-left: auto; width: 14px; height: 14px; visibility: hidden; }
.lp-settings .lp-accent[aria-pressed='true'] .lp-accent__check { visibility: visible; }
.lp-settings .lp-status { font-size: 12px; line-height: 1.65; color: var(--dsw-alias-label-secondary, #70665D); }
.lp-settings .lp-status[data-tone='error'] { color: var(--dsw-alias-state-error-primary, #B4443A); }
@media (max-width: 720px) {
  .lp-settings .lp-hero { padding: 16px; gap: 10px; }
  .lp-settings .lp-hero-art { width: 100px; height: 92px; }
  .lp-settings .lp-hero__title { font-size: 19px; }
  .lp-settings .lp-rows { padding: 0 14px; }
}
`
