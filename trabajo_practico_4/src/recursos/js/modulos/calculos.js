// Cálculos del carrito: funciones puras (no tocan localStorage ni el DOM).

const redondear = (numero) => Math.round(numero * 100) / 100;

// Cruza los items del carrito [{ id, talle, cantidad }] con los productos del JSON.
// Devuelve las líneas con el producto completo y su subtotal.
export function detallarCarrito(productos, items) {
    return items
        .map((item) => {
            const producto = productos.find((p) => p.id === item.id);
            if (!producto) return null;
            return {
                producto,
                talle: item.talle,
                cantidad: item.cantidad,
                subtotal: redondear(producto.precio * item.cantidad),
            };
        })
        .filter(Boolean);
}

export function calcularTotales(lineas, costoEnvio) {
    const subtotal = redondear(lineas.reduce((suma, l) => suma + l.subtotal, 0));
    const envio = lineas.length ? costoEnvio : 0;
    return { subtotal, envio, total: redondear(subtotal + envio) };
}
