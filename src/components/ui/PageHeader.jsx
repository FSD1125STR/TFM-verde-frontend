export default function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-white/60">{description}</p>}
        </div>

        {action && <div>{action}</div>}
        </div>
    );
}