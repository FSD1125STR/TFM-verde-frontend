export default function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder = "",
    className = "",
    disabled = false,
    readOnly = false,
    inputMode,
    pattern,
    maxLength,
    }) {
    return (
        <div>
        {label && (
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
            {label}
            </label>
        )}

        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            className={`w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white disabled:cursor-not-allowed disabled:opacity-60 read-only:text-white/70 ${className}`}
        />
        </div>
    );
}
