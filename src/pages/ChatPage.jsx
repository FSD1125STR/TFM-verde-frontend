import { useContext, useState } from "react";
import Chat from "../components/websockets/Chat.jsx";
import { LoginContext } from "../contexts/AuthContext.js";

export default function ChatPage() {
    const { profile } = useContext(LoginContext);

    const [room, setRoom] = useState("general");
    const [joined, setJoined] = useState(false);

    const username =
        profile?.employee?.name ||
        profile?.employee?.name_company ||
        profile?.employee?.email ||
        "Usuario";

    const handleJoin = (e) => {
        e.preventDefault();
        if (!room.trim()) return;
        setJoined(true);
    };

    const handleLeave = () => {
        setJoined(false);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white px-4 py-8">
        <div className="mx-auto max-w-5xl">
            {!joined ? (
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Chat</h1>
                <p className="text-white/50 mb-8">
                Entra a una sala para empezar a chatear en tiempo real.
                </p>

                <form onSubmit={handleJoin} className="space-y-5">
                <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Usuario
                    </label>
                    <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white/70"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Sala
                    </label>
                    <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                    placeholder="general"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition"
                >
                    Entrar al chat
                </button>
                </form>
            </div>
            ) : (
            <Chat username={username} room={room} onLeave={handleLeave} />
            )}
        </div>
        </div>
    );
}