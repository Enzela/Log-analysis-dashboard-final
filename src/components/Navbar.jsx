import { useState } from 'react';

const Navbar = ({ user, onLogout, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: '🏠 Home' },
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'logs', label: '📁 Log History' },
    { id: 'alerts', label: '🚨 Alerts' },
  ];

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
            LogGuard AI
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm font-medium transition px-3 py-2 rounded-lg ${
                activeTab === item.id
                  ? 'text-[#f59e0b] bg-[#f59e0b]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#2a2a2a]">
            <span className="text-sm text-gray-400">👤 {user?.username || user?.email || 'User'}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#2a2a2a] flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              className={`text-sm font-medium transition px-4 py-2 rounded-lg text-left ${
                activeTab === item.id
                  ? 'text-[#f59e0b] bg-[#f59e0b]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center gap-3 px-4 pt-2 border-t border-[#2a2a2a]">
            <span className="text-sm text-gray-400">👤 {user?.username || user?.email || 'User'}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;