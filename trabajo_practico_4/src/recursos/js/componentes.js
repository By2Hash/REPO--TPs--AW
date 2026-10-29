// Funciones que construyen el HTML (con los mismos nombres de clase BEM del CSS).
import { escaparHTML, formatearPrecio } from './util.js';

const RUTA_IMAGENES = './recursos/imagenes/productos/';

export function crearTarjetaProducto(producto, { accion = 'agregar', compacta = false } = {}) {
    const boton =
        accion === 'ver'
            ? `<a class="boton boton--contorno tarjeta-producto__boton" href="producto.html?id=${producto.id}">Ver producto</a>`
            : `<button class="boton boton--contorno tarjeta-producto__boton" type="button" data-agregar="${producto.id}">Añadir al carrito</button>`;
    const descripcion =
        accion === 'ver' ? '' : `<p class="tarjeta-producto__descripcion">${escaparHTML(producto.descripcion)}</p>`;
    return `
        <li class="tarjeta-producto${compacta ? ' tarjeta-producto--compacta' : ''}">
            <img class="tarjeta-producto__imagen" src="${RUTA_IMAGENES}${producto.imagen}" alt="${escaparHTML(producto.nombre)}">
            <h2 class="tarjeta-producto__titulo"><a class="tarjeta-producto__enlace" href="producto.html?id=${producto.id}">${escaparHTML(producto.nombre)}</a></h2>
            ${descripcion}
            <p class="tarjeta-producto__precio">${formatearPrecio(producto.precio)}</p>
            ${boton}
        </li>`;
}

export function crearTarjetaRecomendada(recomendado) {
    return `
        <li class="tarjeta-producto tarjeta-producto--compacta">
            <img class="tarjeta-producto__imagen" src="${RUTA_IMAGENES}${recomendado.imagen}" alt="${escaparHTML(recomendado.nombre)}">
        </li>`;
}

export function crearSelectorCantidad(id, cantidad, atributos = '') {
    return `
        <div class="selector-cantidad" ${atributos}>
            <label class="selector-cantidad__etiqueta" for="${id}">Cant.</label>
            <button class="selector-cantidad__boton" type="button" data-accion="restar" aria-label="Quitar una unidad">-</button>
            <input class="selector-cantidad__input" type="number" id="${id}" name="${id}" value="${cantidad}" min="1" data-cantidad>
            <button class="selector-cantidad__boton" type="button" data-accion="sumar" aria-label="Agregar una unidad">+</button>
        </div>`;
}

export function crearItemCarrito(linea) {
    const { producto, talle, cantidad, subtotal } = linea;
    const idCampo = `cantidad-${producto.id}-${talle}`;
    return `
        <li class="carrito-item" data-id="${producto.id}" data-talle="${escaparHTML(talle)}">
            <img class="carrito-item__imagen" src="${RUTA_IMAGENES}${producto.imagen}" alt="${escaparHTML(producto.nombre)}">
            <div>
                <h2 class="carrito-item__nombre">${escaparHTML(producto.nombre)}</h2>
                <p class="carrito-item__detalle">Talle ${escaparHTML(talle)} - ${escaparHTML(producto.color)}</p>
                <p class="carrito-item__detalle">Precio unitario: ${formatearPrecio(producto.precio)}</p>
            </div>
            ${crearSelectorCantidad(idCampo, cantidad)}
            <p class="carrito-item__subtotal">${formatearPrecio(subtotal)}</p>
            <button class="carrito-item__quitar" type="button" data-accion="quitar">Quitar del carrito</button>
        </li>`;
}

/* ---- resumen de compra (carrito, checkout y confirmación) ---- */
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
