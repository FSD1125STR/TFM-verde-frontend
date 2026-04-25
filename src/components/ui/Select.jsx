export default function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    className = "",
    disabled = false,
    }) {
    const selectArrowStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23cbd5e1' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 7 5 6 5-6'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 1rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1rem",
        colorScheme: "dark",
    };

    return (
        <div>
        {label && (
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
            {label}
            </label>
        )}

        <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={selectArrowStyle}
            className={`w-full appearance-none rounded-2xl border border-white/5 bg-[#1F2937] px-4 py-3 pr-12 text-white outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
            ))}
        </select>
        </div>
    );
}
