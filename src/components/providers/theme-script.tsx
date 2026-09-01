/**
 * Inline, render-blocking script that sets `data-theme` before first paint to
 * prevent a light/dark flash. Reads the persisted zustand store shape.
 */
const script = `(()=>{try{
  var raw = localStorage.getItem('is-panel-ui');
  var pref = raw ? (JSON.parse(raw).state || {}).theme : 'system';
  var dark = pref === 'dark' || (pref !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}catch(e){document.documentElement.dataset.theme='light';}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
