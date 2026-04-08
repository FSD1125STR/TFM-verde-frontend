export default function DesignSystem() {
    return (
        <>
            <h1 className="text-3xl font-bold">Design System</h1>

            <h1>Titular H1</h1>
            <h2>Titular H2</h2>
            <h3>Titular H3</h3>
            <h4>Titular H4</h4>
            <h5>Titular H5</h5>
            <h6>Titular H6</h6>

            <p>Parrafo normal</p>
            <p className="text-sm">Parrafo pequeño</p>
            <p className="text-lg">Parrafo grande</p>

            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-link">Link</button>

            <input type="text" placeholder="Input" className="input input-bordered w-full max-w-xs" />

            <select defaultValue="Pick a color" className="select select-bordered w-full max-w-xs">
                <option disabled={true}>Pick a color</option>
                <option>Crimson</option>
                <option>Amber</option>
                <option>Velvet</option>
            </select>

            <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Error! Task failed successfully.</span>
            </div>

            <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Warning! Best check yo self, you're not looking too good.</span>
            </div>

            <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Success! Task successfully completed.</span>
            </div>

            <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Info! Lorem ipsum dolor sit amet.</span>
            </div>






        </>
    )
}
