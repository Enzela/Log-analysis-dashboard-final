import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AlertHistory from './pages/AlertHistory';
import LogHistory from './pages/LogHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import WelcomeToast from './components/WelcomeToast'; // ✅ Import

function App() {
  const [page, setPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false); // ✅ Welcome toast state

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      const parsed = JSON.parse(userData);
      setUser(parsed);
      // Show welcome toast only if coming from login (not on page reload)
      // We'll set it in handleLogin
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setPage('dashboard');
    setShowWelcome(true); // ✅ Show welcome toast
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setPage('landing');
    setShowWelcome(false);
  };

  // Protected routes
  if (!isAuthenticated && (page === 'dashboard' || page === 'alerts' || page === 'logs')) {
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setPage('register')} />;
  }

  if (page === 'register') {
    return <Register onRegister={() => setPage('login')} />;
  }

  if (page === 'login') {
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setPage('register')} />;
  }

  return (
    <div>
      {page === 'landing' && (
        <LandingPage onNavigateToDashboard={() => setPage('dashboard')} />
      )}
      {page === 'dashboard' && (
        <Dashboard
          user={user}
          onNavigateToAlerts={() => setPage('alerts')}
          onNavigateToLogs={() => setPage('logs')}
          onNavigateBack={() => setPage('landing')}
          onLogout={handleLogout}
        />
      )}
      {page === 'alerts' && (
        <AlertHistory
          onNavigateBack={() => setPage('dashboard')}
          onLogout={handleLogout}
        />
      )}
      {page === 'logs' && (
        <LogHistory
          onNavigateBack={() => setPage('dashboard')}
          onLogout={handleLogout}
        />
      )}
      {/* ✅ Welcome Toast */}
      {showWelcome && (
        <WelcomeToast
          username={user?.username || user?.name || 'User'}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}

export default App;