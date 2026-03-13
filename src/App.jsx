import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DesignSystem from "./pages/DesignSystem";
import VehicleReceptionPage from "./pages/VehicleReceptionPage";

import AppLayout from "./components/layout/AppLayout";
import { LoginProvider } from "./contexts/LoginContext.jsx";

function App() {
  return (
    <LoginProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas con layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/vehicle-reception" element={<VehicleReceptionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginProvider>
  );
}

export default App;