import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AlertHistory from './pages/AlertHistory';
import LogHistory from './pages/LogHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import WelcomeToast from './components/WelcomeToast';

function App() {
  const [page, setPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      setActiveTab('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setPage('dashboard');
    setShowWelcome(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setPage('landing');
    setShowWelcome(false);
    setActiveTab('dashboard');
  };

  // If not authenticated, show Login/Register
  if (!isAuthenticated) {
    if (page === 'register') {
      return <Register onRegister={() => setPage('login')} />;
    }
    if (page === 'login') {
      return <Login onLogin={handleLogin} onNavigateToRegister={() => setPage('register')} />;
    }
    // Landing page
    return <LandingPage onNavigateToDashboard={() => setPage('login')} />;
  }

  // Authenticated — show Navbar + content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'alerts':
        return (
          <AlertHistory
            onNavigateBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'logs':
        return (
          <LogHistory
            onNavigateBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Dashboard
            user={user}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
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