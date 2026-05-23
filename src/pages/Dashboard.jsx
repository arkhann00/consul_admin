import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Главная</h1>
          <p className="muted">Добро пожаловать, {user?.name}</p>
        </div>
      </header>

      <div className="cards-grid">
        <Link to="/doctors" className="dash-card">
          <span className="dash-card-icon">👨‍⚕️</span>
          <h2>Врачи</h2>
          <p>Добавление, редактирование и удаление врачей клиники</p>
        </Link>

        <Link to="/news" className="dash-card">
          <span className="dash-card-icon">📰</span>
          <h2>Новости</h2>
          <p>Управление новостями и акциями для пациентов</p>
        </Link>
      </div>

      <section className="info-panel">
        <h3>API</h3>
        <ul>
          <li>Базовый URL: <code>{import.meta.env.VITE_API_BASE_URL}</code></li>
          <li>Префикс: <code>/api/v1</code></li>
          <li>Документация: <code>/docs</code></li>
        </ul>
      </section>
    </div>
  );
}
