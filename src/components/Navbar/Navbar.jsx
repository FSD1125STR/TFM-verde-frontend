import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav>
            <ul className="flex gap-4 py-10">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
        </nav>
    )
}
