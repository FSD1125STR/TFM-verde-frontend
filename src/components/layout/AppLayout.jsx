import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex text-white">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}