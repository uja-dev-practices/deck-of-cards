import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DocEditor from '../pages/DocEditor';
import Login from '../pages/Login';
import Register from '../pages/Register';
import History from '../pages/History';

export default function AppRouter() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/editor" replace />} />
          <Route path="/editor" element={<DocEditor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}