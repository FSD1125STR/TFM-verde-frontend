import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav>
            <ul className="flex gap-4 py-10">
                <li><Link to="/">Home</Link></li>
                <li><Link className="text-white px-4 py-2 rounded" to="/register">Register</Link></li>
                <li><Link to="/login-company">Login Company</Link></li>
            </ul>
        </nav>
    )
}
