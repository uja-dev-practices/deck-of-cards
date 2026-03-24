import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BasicMode from '../pages/BasicMode';
import AdvancedMode from '../pages/AdvancedMode';
import { MainLayout } from '../components/layout/MainLayout';

export const AppRouter = () => {
  return (
    <Router>
        <Routes>

            <Route element={<MainLayout />}>
                <Route path="/basico" element={<BasicMode />} />
                <Route path="/avanzado" element={<AdvancedMode />} />
            </Route>

            <Route path="/*" element={<Navigate to="/basico" />} />

        </Routes>
    </Router>
  );
};