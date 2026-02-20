import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../contexts/LoginContext.jsx";


export default function Navbar() {
    const { isAuthenticated, logoutEmployee } = useContext(LoginContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutEmployee();
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    }

    return (
        <nav>
            <ul className="flex gap-4 py-10">
                <li><Link to="/">Home</Link></li>
                <li><Link className="text-white px-4 py-2 rounded" to="/register">Register</Link></li>
                {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
                {isAuthenticated && <li><Link to="/profile">Profile</Link></li>}
                {isAuthenticated && <li><button onClick={handleLogout}>Logout</button></li>}
            </ul>
        </nav>
    )
}
