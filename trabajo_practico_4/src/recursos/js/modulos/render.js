// Funciones que ESCRIBEN en el DOM los resúmenes de compra (carrito, checkout y confirmación).
// El HTML de cada pieza se arma en componentes.js; aquí solo se inserta.
import { escaparHTML, formatearPrecio } from './util.js';

export function pintarProductosResumen(lista, lineas) {
    lista.innerHTML = lineas
        .map(
            (l) => `<li class="resumen-compra__producto"><span>${escaparHTML(l.nombre ?? l.producto.nombre)} (${escaparHTML(l.talle)}) x ${l.cantidad}</span><span>${formatearPrecio(l.subtotal)}</span></li>`
        )
        .join('');
}

export function pintarTotales(lista, { subtotal, envio, total }) {
    lista.innerHTML = `
        <div class="resumen-compra__fila"><dt class="resumen-compra__termino">Subtotal</dt><dd class="resumen-compra__valor">${formatearPrecio(subtotal)}</dd></div>
        <div class="resumen-compra__fila"><dt class="resumen-compra__termino">Envío</dt><dd class="resumen-compra__valor">${formatearPrecio(envio)}</dd></div>
        <div class="resumen-compra__fila resumen-compra__fila--total"><dt class="resumen-compra__termino">Total</dt><dd class="resumen-compra__valor">${formatearPrecio(total)}</dd></div>`;
}
