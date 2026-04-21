import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DesignSystem from "./pages/DesignSystem";
import VehicleReceptionPage from "./pages/VehicleReceptionPage";
import ClientInfoPage from "./pages/ClientInfoPage";
import VehicleStatusPage from "./pages/VehicleStatusPage";
import VehicleSignaturePage from "./pages/VehicleSignaturePage";
import EmployeePage from "./pages/EmployeePage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import ChatPage from "./pages/ChatPage";
import AppLayout from "./components/layout/AppLayout";
import { LoginProvider } from "./contexts/LoginProvider.jsx";
import { LoginContext } from "./contexts/AuthContext.js";

function AppRoutes() {
  const { isAuthenticated } = useContext(LoginContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<HomePage />} />
        <Route path="employees" element={<EmployeePage />} />
        <Route path="vehicle-reception" element={<VehicleReceptionPage />} />
        <Route path="client-info" element={<ClientInfoPage />} />
        <Route path="vehicle-status" element={<VehicleStatusPage />} />
        <Route path="vehicle-signature" element={<VehicleSignaturePage />} />
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="design-system" element={<DesignSystem />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LoginProvider>
        <AppRoutes />
      </LoginProvider>
    </BrowserRouter>
  );
}

export default App;