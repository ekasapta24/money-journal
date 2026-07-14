import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal masuk. Periksa email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-clay" aria-hidden="true"></span>
            <p className="font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">Buku catatan pribadi</p>
          </div>
          <h1 className="font-display text-4xl text-ink text-balance">Money Journal</h1>
          <p className="text-ink-soft text-sm mt-2">Setiap pengeluaran punya cerita di baliknya.</p>
        </div>

        <div className="bg-card border border-line rounded-card p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink-soft mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-soft mb-1.5">Kata sandi</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-dark text-card rounded-lg py-2.5 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-60"
            >
              {loading ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-soft mt-6">
          Belum punya catatan?{' '}
          <Link to="/register" className="text-sage-dark font-medium hover:underline">
            Buat akun
          </Link>
        </p>
      </div>
    </div>
  );
}
