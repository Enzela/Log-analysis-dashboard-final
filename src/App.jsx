import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AlertHistory from './pages/AlertHistory';
import LogHistory from './pages/LogHistory';   // ✅ New import
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setPage('landing');
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
          onNavigateToLogs={() => setPage('logs')}     // ✅ New prop
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
      {page === 'logs' && (                            // ✅ New route
        <LogHistory
          onNavigateBack={() => setPage('dashboard')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;