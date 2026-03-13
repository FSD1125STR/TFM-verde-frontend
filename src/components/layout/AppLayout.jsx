import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-base-200 flex">
        <Sidebar />

        <main className="flex-1 p-8 lg:p-10">
            <Outlet />
        </main>
        </div>
    );
}