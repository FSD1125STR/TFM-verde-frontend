import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import Navbar from './components/Navbar/Navbar'
import LoginCompanyPage from './pages/LoginCompanyPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/login-company' element={<LoginCompanyPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
