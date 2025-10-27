import './App.css';
import { useAllVideos } from './useAllVideos';
import { useState } from 'react';
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

  return (
    <BrowserRouter>
      <div className="App">
        {/* Modal de inicio de sesión */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLoggedIn={() => {
              setShowLogin(false);
              setIsAuthenticated(true);
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
              // user is authenticated: show only profile icon (could link to /profile later)
              <Link to="/profile" aria-label="Perfil de usuario" style={{ color: 'white' }}>
                <CircleUser size={34} color="white" strokeWidth={0.8} />
              </Link>
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
            onRegistered={() => {
              setShowRegister(false);
              setIsAuthenticated(true);
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
