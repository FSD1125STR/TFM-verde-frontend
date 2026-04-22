import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[#0B1120] flex text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
