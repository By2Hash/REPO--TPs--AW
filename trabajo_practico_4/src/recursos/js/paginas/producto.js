// Vista de producto individual: toma el id de la URL (producto.html?id=...) y lo busca en el JSON.
import '../modulos/comun.js';
import { cargarTienda } from '../modulos/datos.js';
import { crearTarjetaRecomendada } from '../modulos/componentes.js';
import { agregarAlCarrito } from '../modulos/almacen.js';
import { leerCantidad, cantidadSegunAccion, CANTIDAD_MINIMA, CANTIDAD_MAXIMA } from '../modulos/cantidad.js';
import { escaparHTML, formatearPrecio, mostrarEstado, RUTA_IMAGENES, MENSAJE_ERROR_CARGA } from '../modulos/util.js';

const contenedor = document.querySelector('#producto');
const migas = document.querySelector('#migas');
const recomendados = document.querySelector('#recomendados');
const estado = document.querySelector('[data-estado]');

let productoActual = null;

function pintarProducto(p) {
    const imagenes = [p.imagen, ...p.miniaturas];
    const talles = p.talles
        .map(
            (t, i) => `
            <label class="producto-detalle__talle">
                <input class="producto-detalle__talle-radio" type="radio" name="talle" value="${escaparHTML(t)}"${i === 0 ? ' checked' : ''}>
                <span class="producto-detalle__talle-texto">${escaparHTML(t)}</span>
            </label>`
        )
        .join('');
    const miniaturas = imagenes
        .map(
            (img, i) => `
            <li><button class="producto-detalle__miniatura-boton" type="button" data-imagen="${escaparHTML(img)}" aria-label="Ver imagen ${i + 1}">
                <img class="producto-detalle__miniatura${i === 0 ? ' producto-detalle__miniatura--activa' : ''}" src="${RUTA_IMAGENES}${img}" alt="">
            </button></li>`
        )
        .join('');

    contenedor.innerHTML = `
        <div class="producto-detalle__galeria">
            <img class="producto-detalle__imagen-principal" src="${RUTA_IMAGENES}${p.imagen}" alt="${escaparHTML(p.nombre)}">
            <ul class="producto-detalle__miniaturas">${miniaturas}</ul>
        </div>
        <div class="producto-detalle__info">
            <h1 class="producto-detalle__titulo">${escaparHTML(p.nombre).toUpperCase()}</h1>
            <p class="producto-detalle__color">(${escaparHTML(p.color)})</p>
            <p class="producto-detalle__precio">${formatearPrecio(p.precio)}</p>
            <h2 class="producto-detalle__subtitulo">DESCRIPCIÓN</h2>
            <p class="producto-detalle__descripcion">${escaparHTML(p.descripcion)}</p>
            <form class="producto-detalle__form" id="form-producto">
                <fieldset class="producto-detalle__talles">
                    <legend class="producto-detalle__talles-leyenda">Talle</legend>
                    ${talles}
                </fieldset>
                <div class="selector-cantidad">
                    <label class="selector-cantidad__etiqueta" for="cantidad-producto">Cantidad:</label>
                    <button class="selector-cantidad__boton" type="button" data-accion="restar" aria-label="Quitar una unidad">-</button>
                    <input class="selector-cantidad__input" type="number" id="cantidad-producto" name="cantidad" value="1" min="${CANTIDAD_MINIMA}" max="${CANTIDAD_MAXIMA}" data-cantidad>
                    <button class="selector-cantidad__boton" type="button" data-accion="sumar" aria-label="Agregar una unidad">+</button>
                </div>
                <button class="boton boton--primario boton--bloque" type="submit">Agregar al carrito</button>
            </form>
        </div>`;

    const nombreGenero = p.genero === 'mujer' ? 'Mujer' : 'Hombre';
    migas.innerHTML = `<a class="migas__enlace" href="index.html">Inicio</a> &gt; <a class="migas__enlace" href="catalogo_${p.genero}.html">${nombreGenero}</a> &gt; <span>${escaparHTML(p.categoria)}</span>`;
    document.title = `Élite - ${p.nombre}`;
    marcarMenuActivo(p.genero);
}

// El menú viene con "Hombre" activo en el HTML; lo ajusta según el género del producto.
function marcarMenuActivo(genero) {
    document.querySelectorAll('.menu-principal__enlace').forEach((enlace) => {
        const activo = enlace.getAttribute('href') === `catalogo_${genero}.html`;
        enlace.classList.toggle('menu-principal__enlace--activo', activo);
        if (activo) enlace.setAttribute('aria-current', 'page');
        else enlace.removeAttribute('aria-current');
    });
}

// Eventos de la vista (delegados sobre el contenedor, porque el HTML se genera después).
contenedor.addEventListener('click', (e) => {
    const miniatura = e.target.closest('[data-imagen]');
    if (miniatura) {
        contenedor.querySelector('.producto-detalle__imagen-principal').src = RUTA_IMAGENES + miniatura.dataset.imagen;
        contenedor.querySelectorAll('.producto-detalle__miniatura').forEach((img) =>
            img.classList.toggle('producto-detalle__miniatura--activa', img.parentElement === miniatura)
        );
        return;
    }
    const boton = e.target.closest('[data-accion]');
    if (boton) {
        const input = contenedor.querySelector('[data-cantidad]');
        input.value = Math.max(CANTIDAD_MINIMA, cantidadSegunAccion(input.value, boton.dataset.accion));
    }
});

// Si escriben a mano un valor fuera de rango, se corrige al salir del campo.
contenedor.addEventListener('change', (e) => {
    if (e.target.matches('[data-cantidad]')) e.target.value = leerCantidad(e.target.value);
});

contenedor.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(e.target);
    agregarAlCarrito(productoActual.id, datos.get('talle'), leerCantidad(datos.get('cantidad')));
    location.href = 'carrito.html';
});

try {
    const id = new URLSearchParams(location.search).get('id');
    const { productos, recomendados: sugeridos } = await cargarTienda();
    productoActual = productos.find((p) => p.id === id);
    if (!productoActual) {
        mostrarEstado(estado, 'No encontramos ese producto. Volvé al catálogo para elegir otro.', true);
    } else {
        pintarProducto(productoActual);
        recomendados.hidden = false;
        recomendados.querySelector('.grilla-productos').innerHTML = sugeridos.map(crearTarjetaRecomendada).join('');
        mostrarEstado(estado);
    }
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
