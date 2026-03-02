export default function HomePage() {
    return (

        <>
            <h1 className="text-3xl font-bold">Home Page</h1>

            <select defaultValue="Pick a color" className="select">
                <option disabled={true}>Pick a color</option>
                <option>Crimson</option>
                <option>Amber</option>
                <option>Velvet</option>
            </select>
        </>


    )
}
