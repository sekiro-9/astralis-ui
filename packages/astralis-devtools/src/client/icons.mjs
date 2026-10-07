/* The overlay's icons: 24px line icons, drawn in currentColor, and the
   Astralis mark. */

const line = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

/** The Astralis mark: four blocks, the last one tipped. */
export const MARK = `<svg viewBox="0 0 32 32" fill="currentColor">
  <rect class="b1" x="3" y="17" width="12" height="12" rx="3"/>
  <rect class="b2" x="17" y="17" width="12" height="12" rx="3"/>
  <rect class="b3" x="3" y="3" width="12" height="12" rx="3"/>
  <rect class="b4" x="19" y="1" width="12" height="12" rx="3" opacity="0.6" transform="rotate(14 25 7)"/>
</svg>`;

export const ICONS = {
  home: line('<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/>'),
  components: line('<path d="m12 3 8.5 4.5L12 12 3.5 7.5z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>'),
  findings: line('<path d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2z"/><path d="M12 8v4.5"/><path d="M12 16h.01"/>'),
  recommendations: line('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'),
  report: line('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
  pick: line('<circle cx="12" cy="12" r="7.5"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
  close: line('<path d="M6 6l12 12"/><path d="M18 6 6 18"/>'),
  back: line('<path d="M15 5l-7 7 7 7"/>'),
  chevron: line('<path d="m9 5 7 7-7 7"/>'),
  arrow: line('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  external: line('<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  search: line('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  locate: line('<path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M15 4h4a1 1 0 0 1 1 1v4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/><path d="M9 20H5a1 1 0 0 1-1-1v-4"/><circle cx="12" cy="12" r="2.5"/>'),
  check: line('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  copy: line('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  download: line('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
  camera: line('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2.5h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.5" r="3.5"/>'),
  file: line('<path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5z"/><path d="M14 3v4.5h4.5"/>'),
  sparkle: line('<path d="M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8z"/>'),
  refresh: line('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>'),
  issueOpen: line('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
  issueClosed: line('<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>'),
  signOut: line('<path d="M15 4h3a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-3"/><path d="M10 16l-4-4 4-4"/><path d="M6 12h10"/>'),
  send: line('<path d="M20.5 3.5 10 14"/><path d="m20.5 3.5-6.5 17-4-6.5-6.5-4z"/>'),
};

/** GitHub's mark, for signing in with GitHub. */
export const GITHUB_MARK =
  '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
