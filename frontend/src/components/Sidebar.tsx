import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, List as ListIcon, Video, ThumbsUp } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <nav className="app-sidebar" aria-label="Barra lateral principal">
      <div className="sidebar-content">
        <ul className="sidebar-list">
          <li className="sidebar-item">
            <NavLink to="/" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Home size={20} />
              <span className="sidebar-text">Inici</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink to="/history" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Clock size={20} />
              <span className="sidebar-text">Historial</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink to="/playlists" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <ListIcon size={20} />
              <span className="sidebar-text">Llistes de reproducció</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink to="/my-videos" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Video size={20} />
              <span className="sidebar-text">Els teus vídeos</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink to="/watch-later" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Clock size={20} />
              <span className="sidebar-text">Visualitza més tard</span>
            </NavLink>
          </li>

          <li className="sidebar-item">
            <NavLink to="/liked" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <ThumbsUp size={20} />
              <span className="sidebar-text">Vídeos que m'agraden</span>
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-footer" role="contentinfo">
          <div className="sidebar-footer__brand">
            <strong className="sidebar-footer__title">Protube</strong>
            <span className="sidebar-footer__tag">Best video platform</span>
          </div>

          <nav className="sidebar-footer__nav" aria-label="Footer">
            <a href="/" className="sidebar-footer__link">
              Home
            </a>
            <a href="/about" className="sidebar-footer__link">
              About
            </a>
            <a href="/contact" className="sidebar-footer__link">
              Contact
            </a>
          </nav>

          <div className="sidebar-footer__bottom">
            <small>© {new Date().getFullYear()} Protube</small>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
