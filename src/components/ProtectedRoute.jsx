// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';

/** Вход отключён — пропускаем всех */
export default function ProtectedRoute({ children }) {
  return children;

  // const { isAuthenticated, loading } = useAuth();
  // const location = useLocation();
  //
  // if (loading) {
  //   return (
  //     <div className="page-center">
  //       <div className="spinner" aria-label="Загрузка" />
  //     </div>
  //   );
  // }
  //
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
  //
  // return children;
}
