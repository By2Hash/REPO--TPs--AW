// Persistencia: carrito, datos de envío y pedido, guardados en localStorage como JSON.
// Aquí NO se calcula nada (ver calculos.js).

const CLAVE_CARRITO = 'elite_carrito';
const CLAVE_ENVIO = 'elite_envio';
const CLAVE_PEDIDO = 'elite_pedido';

function leer(clave, valorPorDefecto) {
    try {
        return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto;
    } catch {
        return valorPorDefecto;
    }
}

function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

/* ---- carrito: lista de { id, talle, cantidad } ---- */
export function obtenerCarrito() {
    return leer(CLAVE_CARRITO, []);
}

function guardarCarrito(items) {
    guardar(CLAVE_CARRITO, items);
    document.dispatchEvent(new CustomEvent('carrito:cambio'));
}

export function agregarAlCarrito(id, talle, cantidad = 1) {
    const items = obtenerCarrito();
    const existente = items.find((item) => item.id === id && item.talle === talle);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        items.push({ id, talle, cantidad });
    }
    guardarCarrito(items);
}

export function cambiarCantidad(id, talle, cantidad) {
    if (cantidad < 1) return quitarDelCarrito(id, talle);
    const items = obtenerCarrito();
    const item = items.find((i) => i.id === id && i.talle === talle);
    if (item) {
        item.cantidad = cantidad;
        guardarCarrito(items);
    }
}

export function quitarDelCarrito(id, talle) {
    guardarCarrito(obtenerCarrito().filter((i) => !(i.id === id && i.talle === talle)));
}

export function vaciarCarrito() {
    guardarCarrito([]);
}

export function contarUnidades() {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

/* ---- envío y pedido ---- */
export const obtenerEnvio = () => leer(CLAVE_ENVIO, null);
export const guardarEnvio = (datos) => guardar(CLAVE_ENVIO, datos);
export const obtenerPedido = () => leer(CLAVE_PEDIDO, null);
export const guardarPedido = (pedido) => guardar(CLAVE_PEDIDO, pedido);
