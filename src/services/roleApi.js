export async function getRoles() {
    const response = await fetch("http://localhost:3000/api/rol");

    if (!response.ok) {
        throw new Error("Error al cargar roles");
    }

    return await response.json();
}