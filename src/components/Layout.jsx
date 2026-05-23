import { NavLink, Outlet } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  // const { user, logout } = useAuth();
  // const navigate = useNavigate();
  //
  // function handleLogout() {
  //   logout();
  //   navigate('/login');
  // }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◆</span>
          <div>
            <strong>Consilium</strong>
            <small>Админ-панель</small>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Главная
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Врачи
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Новости
          </NavLink>
        </nav>

        {/* Вход отключён
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-name">{user?.name}</span>
            <span className="user-phone">{user?.phone}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Выйти
          </button>
        </div>
        */}
        <div className="sidebar-footer">
          <span className="user-phone">Режим без входа</span>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
