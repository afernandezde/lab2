import './App.css';
import { useAllVideos } from './useAllVideos';
import { useState, useEffect, useRef } from 'react';
import { CircleUser } from 'lucide-react';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import VideoGrid from './components/VideoGrid';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VideoPage from './pages/VideoPage';
import Footer from './components/Footer'; // added

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return;
      const target = e.target as Node | null;
      if (target && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
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
      localStorage.removeItem('protube_username');
    } catch (e) {}
  };

  return (
    <BrowserRouter>
      <div className="App">
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
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowRegister(true)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    marginRight: 12,
                  }}
                >
                  Register
                </button>
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
            <Route path="/video/:name" element={<VideoPage />} />
          </Routes>
        </main>

        <Footer />
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onRegistered={(name?: string) => {
              setShowRegister(false);
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
