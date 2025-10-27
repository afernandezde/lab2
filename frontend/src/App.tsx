import './App.css';
import { useAllVideos } from './useAllVideos';
import { useState } from 'react';
import { CircleUser } from 'lucide-react';
import LoginModal from './components/LoginModal';
import VideoGrid from './components/VideoGrid';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VideoPage from './pages/VideoPage';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        {/* Icono de usuario arriba a la derecha */}
        <button
          onClick={() => setShowLogin(!showLogin)}
          style={{ position: 'fixed', top: 16, right: 16, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          aria-label="Abrir inicio de sesión"
        >
          <CircleUser size={50} color='white' strokeWidth={0.8} />
        </button>

        {/* Modal de inicio de sesión */}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

        <header className="App-header">
          <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ContentApp />} />
            <Route path="/video/:name" element={<VideoPage />} />
          </Routes>
        </main>
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
