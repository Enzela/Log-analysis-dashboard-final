import { useState } from 'react';

const Register = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          email: email,
          password: password,
          name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Better error message for duplicate email
        if (response.status === 400 && data.error && data.error.includes('already')) {
          throw new Error('This email is already registered. Please login instead.');
        }
        throw new Error(data.error || data.detail || 'Registration failed');
      }

      setSuccess('✅ Registration successful! Please login.');
      setTimeout(() => onRegister(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] w-full max-w-md">
        {/* ✅ "bugcetana" हटाइयो — "LogGuard AI" राखियो */}
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
          LogGuard AI
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Create an account to get started.</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/30">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#f59e0b]"
            />
            <label className="text-gray-400 text-sm">
              I agree to the <span className="text-[#f59e0b] hover:underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-[#f59e0b] hover:underline cursor-pointer">Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#0a0a0a] font-semibold rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2a2a2a]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1a1a1a] text-gray-500">or register with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition text-gray-300">
            <span className="text-lg">🔵</span> Google
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition text-gray-300">
            <span className="text-lg">⚫</span> GitHub
          </button>
        </div>

        <p className="text-gray-500 text-center mt-6 text-sm">
          Already have an account?{' '}
          <button
            onClick={onRegister}
            className="text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;