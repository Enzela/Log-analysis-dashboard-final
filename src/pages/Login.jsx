import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the captcha');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      localStorage.setItem('token', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify({ username: email }));
      onLogin({ username: email });
    } catch (err) {
      setError(err.message);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
      <div className="bg-[#111b28] p-8 rounded-2xl border border-[#1a2332] w-96">
        <h1 className="text-3xl font-bold text-white text-center mb-2">🔐 Login</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Sign in to access your dashboard</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0a121e] border border-[#1a2332] rounded-lg text-white focus:outline-none focus:border-[#00d4ff] transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0a121e] border border-[#1a2332] rounded-lg text-white focus:outline-none focus:border-[#00d4ff] transition"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Google reCAPTCHA */}
          <div className="mb-4 flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={onCaptchaChange}
              theme="dark"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full p-3 bg-gradient-to-r from-[#00d4ff] to-[#7b2ffc] text-white rounded-lg font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Logging in...' : '🔓 Login'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-4 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-[#00d4ff] hover:underline bg-transparent border-none cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;