import { useState } from "react";

export default function WorkOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");

    const filteredOrders = orders.filter((order) =>
        order.plate.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="max-w-5xl space-y-6 text-white">
        
        {/* HEADER */}
        <div>
            <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
            <p className="text-white/60">
            Listado histórico y actual de ingresos al taller.
            </p>
        </div>

        {/* BUSCADOR */}
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-4 flex gap-3">
            <input
            type="text"
            placeholder="Buscar por orden, patente o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#1F2937] px-4 py-3 rounded-xl outline-none"
            />

            <button className="bg-white/10 px-4 py-3 rounded-xl hover:bg-white/20">
            Filtrar
            </button>

            <button className="bg-blue-600 px-4 py-3 rounded-xl hover:bg-blue-700">
            Exportar
            </button>
        </div>

        {/* LISTA */}
        <div className="space-y-4">
            {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
                <div
                key={order.id}
                className="bg-[#111827] border border-white/10 rounded-2xl p-5 flex justify-between items-center"
                >
                <div>
                    <p className="text-sm text-white/40">ORD-{order.id}</p>
                    <p className="font-bold">{order.plate}</p>
                    <p className="text-white/60 text-sm">{order.vehicle}</p>
                </div>

                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs">
                    {order.status}
                </span>
                </div>
            ))
            ) : (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-10 text-center text-white/50">
                No hay órdenes de trabajo.
            </div>
            )}
        </div>
        </section>
    );
    }