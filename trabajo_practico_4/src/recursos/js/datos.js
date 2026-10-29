// Acceso a los datos JSON con la función global fetch.

async function pedirJSON(archivo) {
    const respuesta = await fetch(`./datos/${archivo}`);
    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${archivo} (código ${respuesta.status})`);
    }
    return respuesta.json();
}

let promesaTienda;

// Devuelve { tienda, productos, recomendados }. Se pide una sola vez por página.
export function cargarTienda() {
    promesaTienda ??= pedirJSON('productos.json');
    return promesaTienda;
}

export function cargarProvincias() {
    return pedirJSON('provincias.json');
}

export async function buscarProducto(id) {
    const { productos } = await cargarTienda();
    return productos.find((producto) => producto.id === id);
}
