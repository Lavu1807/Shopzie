// Global Theme Manager for ME-SHOPZ
// Applies to entire document, supports Next.js (.dark) and CSS variables (data-theme)
(function(){
  const KEY = 'theme'; // 'light' | 'dark'

  function prefersDark(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function get(){
    return localStorage.getItem(KEY) || (prefersDark() ? 'dark' : 'light');
  }

  function apply(theme){
    const de = document.documentElement;
    const b = document.body;
    if(theme === 'dark'){
      de.classList.add('dark');
      de.removeAttribute('data-theme');
      if(b) b.removeAttribute('data-theme');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      de.classList.remove('dark');
      de.setAttribute('data-theme','light');
      if(b) b.setAttribute('data-theme','light');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  function set(theme){
    localStorage.setItem(KEY, theme);
    apply(theme);
    updateButton(theme);
  }

  function toggle(){ set(get() === 'light' ? 'dark' : 'light'); }

  function createButton(){
    const btn = document.createElement('button');
    btn.id = 'globalThemeToggle';
    btn.type = 'button';
    btn.setAttribute('aria-label','Toggle color theme');
    btn.style.position = 'fixed';
    btn.style.right = '16px';
    btn.style.bottom = '16px';
    btn.style.zIndex = '2147483647';
    btn.style.padding = '10px 12px';
    btn.style.borderRadius = '999px';
    btn.style.border = '1px solid rgba(127,127,127,0.25)';
    btn.style.backdropFilter = 'blur(6px)';
    btn.style.boxShadow = '0 6px 24px rgba(0,0,0,.14)';
    btn.style.cursor = 'pointer';
    btn.style.font = '14px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Arial';
    btn.style.background = 'rgba(255,255,255,0.9)';
    btn.style.color = '#111827';

    // Slightly adapt in dark
    const t = get();
    if(t === 'dark'){
      btn.style.background = 'rgba(18,22,35,0.8)';
      btn.style.color = '#e6eaf2';
      btn.style.border = '1px solid rgba(90,110,160,0.35)';
    }

    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    updateButton(t);
  }

  function updateButton(theme){
    const btn = document.getElementById('globalThemeToggle');
    if(!btn) return;
    if(theme === 'dark'){
      btn.textContent = '☀️ Light';
      btn.style.background = 'rgba(18,22,35,0.8)';
      btn.style.color = '#e6eaf2';
      btn.style.border = '1px solid rgba(90,110,160,0.35)';
    } else {
      btn.textContent = '🌙 Dark';
      btn.style.background = 'rgba(255,255,255,0.9)';
      btn.style.color = '#111827';
      btn.style.border = '1px solid rgba(127,127,127,0.25)';
    }
  }

  // Initialize early apply
  const initial = get();
  apply(initial);

  // Expose API
  window.Theme = { get, set, toggle, apply };

  // Inject button when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
