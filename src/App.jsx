import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar/Navbar';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DesignSystem from './pages/DesignSystem';
import { LoginProvider } from './contexts/LoginProvider';

function App() {
  return (
    <>
      <LoginProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/design-system' element={<DesignSystem />} />
          </Routes>
        </BrowserRouter>
      </LoginProvider>
    </>
  );
}

export default App;
