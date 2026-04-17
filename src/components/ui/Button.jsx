export default function Button({
    children,
    type = "button",
    onClick,
    className = "",
    variant = "primary",
    }) {
    const baseStyles =
        "px-5 py-3 rounded-xl font-medium transition";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border border-white/10 text-white/80 hover:bg-white/5",
        ghost: "text-white/50 hover:text-red-400",
    };

    return (
        <button
        type={type}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        >
        {children}
        </button>
    );
}