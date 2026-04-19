export default function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    className = "",
    }) {
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
            className={`w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 ${className}`}
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