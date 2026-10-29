// Lógica compartida de los selectores de cantidad (ficha de producto y carrito).

export const CANTIDAD_MINIMA = 1;
export const CANTIDAD_MAXIMA = 99;

// Convierte lo que haya escrito la persona en una cantidad válida (entero entre 1 y 99).
export function leerCantidad(valor) {
    const numero = parseInt(valor, 10);
    if (!Number.isFinite(numero)) return CANTIDAD_MINIMA;
    return Math.min(CANTIDAD_MAXIMA, Math.max(CANTIDAD_MINIMA, numero));
}

// Cantidad que resulta de apretar "sumar" o "restar" (sin limitar por abajo, lo decide quien llama).
export function cantidadSegunAccion(valorActual, accion) {
    const actual = leerCantidad(valorActual);
    return accion === 'sumar' ? Math.min(CANTIDAD_MAXIMA, actual + 1) : actual - 1;
}
