export default function Modal({ isOpen, title, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">{title}</h2>

            <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
            >
                ✕
            </button>
            </div>

            <div className="px-6 py-6">{children}</div>
        </div>
        </div>
    );
}