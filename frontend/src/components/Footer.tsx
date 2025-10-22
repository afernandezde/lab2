import React, { useEffect } from 'react';

const styles = `
.pt-footer {
  background: #0f1724;
  color: #cbd5e1;
  font-size: 14px;
  padding-top: 20px;
}
.pt-footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.pt-footer__brand { display: flex; flex-direction: column; }
.pt-footer__title { color: #ffffff; font-size: 18px; }
.pt-footer__tag { color: #94a3b8; font-size: 12px; }
.pt-footer__nav { display: flex; gap: 14px; flex-wrap: wrap; }
.pt-footer__link {
  color: #cbd5e1;
  text-decoration: none;
  opacity: 0.9;
}
.pt-footer__link:hover { color: #fff; text-decoration: underline; }
.pt-footer__social { display: flex; gap: 10px; }
.pt-footer__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  text-decoration: none;
  padding: 6px;
  border-radius: 6px;
}
.pt-footer__icon:hover { background: rgba(255,255,255,0.03); color: #fff; }
.pt-footer__bottom {
  max-width: 1100px;
  margin: 12px auto 20px;
  padding: 0 16px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.03);
  padding-top: 12px;
}
@media (max-width: 640px) {
  .pt-footer__inner { flex-direction: column; align-items: flex-start; }
  .pt-footer__nav { width: 100%; gap: 10px; margin-top: 8px; }
  .pt-footer__social { margin-top: 8px; }
}
`;

const Footer: React.FC = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'pt-footer-styles';
    if (!document.getElementById(id)) {
      const styleEl = document.createElement('style');
      styleEl.id = id;
      styleEl.innerHTML = styles;
      document.head.appendChild(styleEl);
      return () => {
        // keep styles if other instances exist; remove only if this added them
        const el = document.getElementById(id);
        if (el) el.remove();
      };
    }
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="pt-footer" role="contentinfo">
      <div className="pt-footer__inner">
        <div className="pt-footer__brand">
          <strong className="pt-footer__title">Protube</strong>
          <span className="pt-footer__tag">Best video platform</span>
        </div>

        <nav className="pt-footer__nav" aria-label="Footer">
          <a href="/" className="pt-footer__link">Home</a>
          <a href="/about" className="pt-footer__link">About</a>
          <a href="/contact" className="pt-footer__link">Contact</a>
        </nav>

        <div className="pt-footer__social" aria-hidden="false">
          <a href="https://github.com/afernandezde/lab2" target="_blank" rel="noopener noreferrer" className="pt-footer__icon" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.1 0 0 .67-.21 2.2.82a7.6 7.6 0 012.01-.27c.68 0 1.36.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.09.16 1.9.08 2.1.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </a>

          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="pt-footer__icon" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 001.88-2.36 8.5 8.5 0 01-2.7 1.03 4.25 4.25 0 00-7.24 3.88A12.07 12.07 0 013 4.79a4.25 4.25 0 001.32 5.67 4.2 4.2 0 01-1.92-.53v.05a4.25 4.25 0 003.41 4.17c-.48.13-.98.2-1.5.08a4.27 4.27 0 003.98 2.96A8.53 8.53 0 012 19.54a12.05 12.05 0 006.53 1.92c7.84 0 12.13-6.5 12.13-12.13l-.01-.55A8.6 8.6 0 0024 5.1a8.35 8.35 0 01-2.4.66z"></path>
            </svg>
          </a>

          <a href="mailto:hello@protube.example" className="pt-footer__icon" aria-label="Email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
            </svg>
          </a>
        </div>
      </div>

      <div className="pt-footer__bottom">
        <small>© {year} Protube — Built with care.</small>
      </div>
    </footer>
  );
};

export default Footer;