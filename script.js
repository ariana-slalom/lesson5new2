const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

const savedTheme = localStorage.getItem('my-link-theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

function setTheme(theme) {
  const isLight = theme === 'light';
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  themeColor.setAttribute('content', isLight ? '#e6e2d5' : '#1d2520');
  localStorage.setItem('my-link-theme', theme);
}

setTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});
