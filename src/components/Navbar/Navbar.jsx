import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../contexts/LoginContext.jsx";

export default function Navbar() {
  const { isAuthenticated, logoutEmployee } = useContext(LoginContext);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    await logoutEmployee();
    navigate("/login");
  };
if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  return (
    <nav className="bg-neutral text-white px-8 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3 font-bold text-lg">
        <div className="bg-primary text-white px-3 py-2 rounded-xl shadow">
          🔧
        </div>
        <span className="text-white">Mechanic Manager</span>
      </div>

      <ul className="flex items-center gap-4">
        <li>
          <Link className="btn btn-ghost btn-sm bg-primary rounded-xl text-white" to="/">
            Home
          </Link>
        </li>

        <li>
          <Link className="btn btn-primary btn-sm rounded-xl " to="/register">
            Register
          </Link>
        </li>

        {!isAuthenticated && (
          <li>
            <Link className="btn btn-ghost btn-sm bg-primary text-white rounded-xl" to="/login">
              Login
            </Link>
          </li>
        )}

        {isAuthenticated && (
          <li>
            <Link className="btn btn-ghost btn-sm text-white " to="/profile">
              Profile
            </Link>
          </li>
        )}

        {isAuthenticated && (
          <li>
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-neutral"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}