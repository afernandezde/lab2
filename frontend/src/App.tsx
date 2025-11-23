import './App.css';
import { useAllVideos } from './useAllVideos';
import { useState, useEffect, useRef } from 'react';
import { CircleUser } from 'lucide-react';
import LoginModal from './components/LoginModal';
import VideoGrid from './components/VideoGrid';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VideoPage from './pages/VideoPage';
import History from './pages/History';
import Playlists from './pages/Playlists';
import MyVideos from './pages/MyVideos';
import WatchLater from './pages/WatchLater';
import Liked from './pages/Liked';
import Downloads from './pages/Downloads';
import ExploreMusic from './pages/explore/Music';
import ExploreMovies from './pages/explore/Movies';
import ExploreLive from './pages/explore/Live';
import ExploreGaming from './pages/explore/Gaming';
import Profile from './pages/Profile';
// Footer relocated into Sidebar
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import { useCallback } from 'react';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('protube_user'));
    } catch (e) {
      return false;
    }
  });
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem('protube_username');
    } catch (e) {
      return null;
    }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const createRef = useRef<HTMLDivElement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Global toast listener so any page can fire a non-blocking message
  useEffect(() => {
    const onToast = (e: Event) => {
      try {
        // @ts-ignore
        const msg = e?.detail?.message as string | undefined;
        if (msg) setToast(msg);
      } catch (e) {}
    };
    window.addEventListener('protube:toast', onToast as EventListener);
    const onOpenUpload = () => setUploadOpen(true);
    const onCloseUpload = () => setUploadOpen(false);
    window.addEventListener('protube:open-upload', onOpenUpload as EventListener);
    window.addEventListener('protube:close-upload', onCloseUpload as EventListener);
    return () => {
      window.removeEventListener('protube:toast', onToast as EventListener);
      window.removeEventListener('protube:open-upload', onOpenUpload as EventListener);
      window.removeEventListener('protube:close-upload', onCloseUpload as EventListener);
    };
  }, []);

  // auto-dismiss global toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return;
      const target = e.target as Node | null;
      if (target) {
        if (!userMenuRef.current.contains(target)) {
          setUserMenuOpen(false);
        }
        if (createRef.current && !createRef.current.contains(target)) {
          setCreateOpen(false);
        }
      }
    }
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    try {
      localStorage.removeItem('protube_user');
      localStorage.removeItem('protube_user_id');
      localStorage.removeItem('protube_username');
      // notify other components in the same tab to refresh auth-dependent state
      try { window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'auth', loggedIn: false } })); } catch (e) {}
    } catch (e) {}
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Sidebar />
        {/* Modal de inicio de sesión */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLoggedIn={(name?: string) => {
              setShowLogin(false);
              setIsAuthenticated(true);
              if (name) {
                setUsername(name);
                try {
                  localStorage.setItem('protube_username', name);
                } catch (e) {}
              }
              try {
                localStorage.setItem('protube_user', '1');
              } catch (e) {}
            }}
          />
        )}

        <header className="App-header">
          <div className="header-left">
            <Link to="/" aria-label="Ir al inicio">
              <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
            </Link>
          </div>
          <div className="header-right">
                <div className="create-wrapper" ref={createRef}>
                  <button
                    className="create-button"
                    onClick={() => setCreateOpen(v => !v)}
                    aria-haspopup="true"
                    aria-expanded={createOpen}
                    aria-label="Crear"
                  >
                    <span className="create-plus">+</span>
                    <span className="create-text">Crea</span>
                  </button>
                  {createOpen && (
                    <div className="create-menu" role="menu" aria-label="Crear">
                      <button className="create-menu-item" role="menuitem" onClick={() => { setCreateOpen(false); try { window.dispatchEvent(new CustomEvent('protube:open-upload')); } catch (e) {} }}>Penja un vídeo</button>
                      <button className="create-menu-item" role="menuitem" onClick={() => { setCreateOpen(false); try { window.alert('Funcionalitat de streaming no implementada'); } catch (e) {} }}>Emet en directe</button>
                      <button className="create-menu-item" role="menuitem" onClick={() => { setCreateOpen(false); window.location.hash = '#post'; window.location.pathname = '/profile'; }}>Crea una publicació</button>
                    </div>
                  )}
                </div>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Abrir inicio de sesión"
                >
                  <CircleUser size={34} color="white" strokeWidth={0.8} />
                </button>
              </>
            ) : (
              // user is authenticated: show profile icon and username with dropdown menu
              <div className="user-info" ref={userMenuRef}>
                <button
                  className="user-toggle"
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <CircleUser size={28} color="white" strokeWidth={0.8} />
                  <span className="user-name">{username ?? 'Perfil'}</span>
                </button>

                <div className={`user-menu ${userMenuOpen ? 'open' : ''}`} role="menu" aria-hidden={!userMenuOpen}>
                  <Link to="/profile" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    Profile
                  </Link>
                  <button
                    className="user-menu-item"
                    role="menuitem"
                    onClick={() => {
                      handleLogout();
                      setUserMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<ContentApp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/my-videos" element={<MyVideos />} />
            <Route path="/watch-later" element={<WatchLater />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/explore/music" element={<ExploreMusic />} />
            <Route path="/explore/movies" element={<ExploreMovies />} />
            <Route path="/explore/live" element={<ExploreLive />} />
            <Route path="/explore/gaming" element={<ExploreGaming />} />
            <Route path="/video/:name" element={<VideoPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

  {/* footer moved into the sidebar */}
  {toast && <div className="toast" role="status">{toast}</div>}
  {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
        {/* Registration is available from inside the LoginModal via the "Sign up" link. */}
      </div>
    </BrowserRouter>
  );
}

function ContentApp() {
  const { loading, message, value } = useAllVideos();
  switch (loading) {
    case 'loading':
      return <div>Loading...</div>;
    case 'error':
      return (
        <div>
          <h3>Error</h3> <p>{message}</p>
        </div>
      );
    case 'success':
      return <VideoGrid videos={value} />;
  }
  return <div>Idle...</div>;
}

export default App;
