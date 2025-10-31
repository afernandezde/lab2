import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Clock,
  List as ListIcon,
  Video,
  ThumbsUp,
  Download,
  Music,
  Film,
  Cast,
  Gamepad,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <nav className="app-sidebar" aria-label="Barra lateral principal">
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

        <li className="sidebar-item">
          <NavLink to="/downloads" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Download size={20} />
            <span className="sidebar-text">Baixades</span>
          </NavLink>
        </li>

        <li className="sidebar-sep" aria-hidden="true"></li>

        <li className="sidebar-section-title">Explora</li>

        <li className="sidebar-item">
          <NavLink to="/explore/music" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Music size={20} />
            <span className="sidebar-text">Música</span>
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink to="/explore/movies" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Film size={20} />
            <span className="sidebar-text">Pel·lícules</span>
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink to="/explore/live" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Cast size={20} />
            <span className="sidebar-text">En directe</span>
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink to="/explore/gaming" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Gamepad size={20} />
            <span className="sidebar-text">Videojocs</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
