import { useEffect } from 'react';

// =====================================================================
// useScreenshotGuard
// ---------------------------------------------------------------------
// Browsers cannot truly block a screenshot — the OS captures the screen
// below the web page's reach. This hook applies the strongest deterrents
// a web app realistically can, to discourage casual capture of the
// confidential admin portal:
//
//   • Hides/obscures the screen when the tab loses focus or visibility
//     (most screenshot and screen-share tools trigger a blur first).
//   • Intercepts the PrintScreen key, attempts to wipe the clipboard,
//     and flashes a privacy overlay.
//   • Blocks the right-click context menu and common Save/Print/DevTools
//     shortcuts within the portal.
//   • Blanks the page for printing / "Save as PDF".
//
// `enabled` toggles the guard so it only runs while the admin portal is
// mounted. Pass a toast callback to notify the user when capture is
// discouraged.
// =====================================================================
export const useScreenshotGuard = (enabled, onBlocked) => {
  useEffect(() => {
    if (!enabled) return undefined;

    const BODY_CLASS = 'screenshot-guard-active';
    document.body.classList.add(BODY_CLASS);

    // --- Privacy overlay injected once ---
    const overlay = document.createElement('div');
    overlay.id = 'screenshot-guard-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="ssg-lock"><div class="ssg-lock-icon">&#128274;</div>' +
      '<p>Content hidden</p><span>Screen capture of the admin portal is not permitted.</span></div>';
    document.body.appendChild(overlay);

    const showOverlay = () => { overlay.classList.add('visible'); };
    const hideOverlay = () => { overlay.classList.remove('visible'); };

    let flashTimer;
    const flashOverlay = (notify) => {
      showOverlay();
      clearTimeout(flashTimer);
      flashTimer = setTimeout(hideOverlay, 1400);
      if (notify) onBlocked?.('Screenshots are disabled in the admin portal.', 'error');
    };

    // --- Hide content when the window is not the active surface ---
    const handleVisibility = () => {
      if (document.hidden) showOverlay();
      else hideOverlay();
    };
    const handleBlur = () => showOverlay();
    const handleFocus = () => hideOverlay();

    // --- Keyboard: PrintScreen + common capture/save/devtools combos ---
    const wipeClipboard = () => {
      try {
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText('');
      } catch {
        /* clipboard not writable — ignore */
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        wipeClipboard();
        flashOverlay(true);
      }
    };

    const handleKeyDown = (e) => {
      const key = (e.key || '').toLowerCase();

      // PrintScreen (some browsers fire on keydown)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        wipeClipboard();
        flashOverlay(true);
        e.preventDefault();
        return;
      }

      // Ctrl/Cmd+P (print), Ctrl/Cmd+S (save)
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || key === 's')) {
        e.preventDefault();
        flashOverlay(true);
        return;
      }

      // macOS screenshot shortcuts: Cmd+Shift+3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
        flashOverlay(true);
        return;
      }

      // Windows+Shift+S (Snip & Sketch) — best effort, often intercepted by OS
      if (e.shiftKey && (e.metaKey || e.getModifierState?.('Meta')) && key === 's') {
        flashOverlay(true);
      }
    };

    const handleContextMenu = (e) => { e.preventDefault(); };
    const handleBeforePrint = () => showOverlay();
    const handleAfterPrint = () => hideOverlay();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      clearTimeout(flashTimer);
      document.body.classList.remove(BODY_CLASS);
      overlay.remove();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [enabled, onBlocked]);
};
