import { useState } from 'react';

const Register = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      if (!response.ok) throw new Error(data.error || 'Registration failed');

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
      <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] w-96">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
          📝 Register
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Create your account</p>

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
              placeholder="John Doe"
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
              placeholder="you@example.com"
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
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white rounded-lg font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Registering...' : '📝 Register'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-4 text-sm">
          Already have an account?{' '}
          <button
            onClick={onRegister}
            className="text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;