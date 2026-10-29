// Funciones que CONSTRUYEN HTML (devuelven texto) con los nombres de clase BEM del CSS.
// No tocan el DOM: eso lo hace render.js.
import { escaparHTML, formatearPrecio, RUTA_IMAGENES } from './util.js';
import { CANTIDAD_MINIMA, CANTIDAD_MAXIMA } from './cantidad.js';

export function crearTarjetaProducto(producto, { accion = 'agregar', compacta = false } = {}) {
    const enlaceProducto = `producto.html?id=${encodeURIComponent(producto.id)}`;
    const boton =
        accion === 'ver'
            ? `<a class="boton boton--contorno tarjeta-producto__boton" href="${enlaceProducto}">Ver producto</a>`
            : `<button class="boton boton--contorno tarjeta-producto__boton" type="button" data-agregar="${escaparHTML(producto.id)}">Añadir al carrito</button>`;
    const descripcion =
        accion === 'ver' ? '' : `<p class="tarjeta-producto__descripcion">${escaparHTML(producto.descripcion)}</p>`;
    return `
        <li class="tarjeta-producto${compacta ? ' tarjeta-producto--compacta' : ''}">
            <a class="tarjeta-producto__enlace-imagen" href="${enlaceProducto}" tabindex="-1" aria-hidden="true">
                <img class="tarjeta-producto__imagen" src="${RUTA_IMAGENES}${producto.imagen}" alt="${escaparHTML(producto.nombre)}">
            </a>
            <h2 class="tarjeta-producto__titulo"><a class="tarjeta-producto__enlace" href="${enlaceProducto}">${escaparHTML(producto.nombre)}</a></h2>
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
            <input class="selector-cantidad__input" type="number" id="${id}" name="${id}" value="${cantidad}" min="${CANTIDAD_MINIMA}" max="${CANTIDAD_MAXIMA}" data-cantidad>
            <button class="selector-cantidad__boton" type="button" data-accion="sumar" aria-label="Agregar una unidad">+</button>
        </div>`;
}

export function crearItemCarrito(linea) {
    const { producto, talle, cantidad, subtotal } = linea;
    const idCampo = `cantidad-${producto.id}-${talle}`;
    return `
        <li class="carrito-item" data-id="${escaparHTML(producto.id)}" data-talle="${escaparHTML(talle)}">
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
