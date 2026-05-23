import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(phone.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 403) {
        setError('Нет прав администратора. Обратитесь к администратору сервера.');
      } else if (err.status === 401) {
        setError('Неверный телефон или пароль');
      } else {
        setError(err.message || 'Ошибка входа');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-icon lg">◆</span>
          <h1>Consilium</h1>
          <p>Вход в админ-панель стоматологии</p>
        </div>

        <Alert type="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Телефон</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 999 123-45-67"
              required
              autoComplete="tel"
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <p className="login-hint">
          Администратор создаётся на сервере командой{' '}
          <code>uv run python scripts/create_admin.py</code>
        </p>
      </div>
    </div>
  );
}
