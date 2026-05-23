import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
// import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorsList from './pages/doctors/DoctorsList';
import DoctorForm from './pages/doctors/DoctorForm';
import NewsList from './pages/news/NewsList';
import NewsForm from './pages/news/NewsForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Вход временно отключён — панель доступна без авторизации */}
          {/* <Route path="/login" element={<Login />} /> */}

          <Route element={<Layout />}>
            {/* <ProtectedRoute><Layout /></ProtectedRoute> */}
            <Route index element={<Dashboard />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="doctors/new" element={<DoctorForm />} />
            <Route path="doctors/:id/edit" element={<DoctorForm />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/new" element={<NewsForm />} />
            <Route path="news/:id/edit" element={<NewsForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
