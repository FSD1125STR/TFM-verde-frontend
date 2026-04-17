export default function Card({ children, className = "" }) {
    return (
        <div
        className={`bg-[#111827] rounded-2xl border border-white/10 ${className}`}
        >
        {children}
        </div>
    );
}