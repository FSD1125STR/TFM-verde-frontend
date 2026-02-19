import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import Navbar from './components/Navbar/Navbar'
import LoginCompanyPage from './pages/LoginCompanyPage'
import DesignSystem from './pages/DesignSystem'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/login-company' element={<LoginCompanyPage />} />
          <Route path='/design-system' element={<DesignSystem />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
