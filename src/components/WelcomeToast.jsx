import { useEffect, useState } from 'react';

const WelcomeToast = ({ username, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 5000); // Auto dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-[#111b28] border border-[#00d4ff]/30 rounded-xl shadow-2xl shadow-[#00d4ff]/20 p-5 animate-slideInRight">
      <div className="flex items-start gap-3">
        <div className="text-3xl">👋</div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">Welcome back!</h3>
          <p className="text-gray-400 text-sm">
            {username || 'User'}, you're now logged in to LogGuard AI.
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); if (onClose) onClose(); }}
          className="text-gray-500 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default WelcomeToast;