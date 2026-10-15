(() => {
  'use strict';
  const button = document.querySelector('.scanlines-toggle');
  function setScanlines(on) {
    document.body.classList.toggle('crt-on', on);
    button.setAttribute('aria-pressed', String(on));
    button.textContent = `SCANLINES: ${on ? 'ON' : 'OFF'}`;
    try { localStorage.setItem('portfolio-scanlines', String(on)); } catch {}
  }
  let saved = false;
  try { saved = localStorage.getItem('portfolio-scanlines') === 'true'; } catch {}
  setScanlines(saved);
  button.addEventListener('click', () => setScanlines(!document.body.classList.contains('crt-on')));
})();
