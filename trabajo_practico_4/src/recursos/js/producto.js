// Vista de producto individual: toma el id de la URL (producto.html?id=...) y lo busca en el JSON.
import './comun.js';
import { cargarTienda } from './datos.js';
import { crearTarjetaRecomendada } from './componentes.js';
import { agregarAlCarrito } from './almacen.js';
import { escaparHTML, formatearPrecio, mostrarEstado, MENSAJE_ERROR_CARGA } from './util.js';

const RUTA = './recursos/imagenes/productos/';
const contenedor = document.querySelector('#producto');
const migas = document.querySelector('#migas');
const recomendados = document.querySelector('#recomendados');
const estado = document.querySelector('[data-estado]');

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
            <li><button class="producto-detalle__miniatura-boton" type="button" data-imagen="${img}" aria-label="Ver imagen ${i + 1}">
                <img class="producto-detalle__miniatura${i === 0 ? ' producto-detalle__miniatura--activa' : ''}" src="${RUTA}${img}" alt="">
            </button></li>`
        )
        .join('');

    contenedor.innerHTML = `
        <div class="producto-detalle__galeria">
            <img class="producto-detalle__imagen-principal" src="${RUTA}${p.imagen}" alt="${escaparHTML(p.nombre)}">
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
                    <input class="selector-cantidad__input" type="number" id="cantidad-producto" name="cantidad" value="1" min="1" data-cantidad>
                    <button class="selector-cantidad__boton" type="button" data-accion="sumar" aria-label="Agregar una unidad">+</button>
                </div>
                <button class="boton boton--primario boton--bloque" type="submit">Agregar al carrito</button>
            </form>
        </div>`;

    const nombreGenero = p.genero === 'mujer' ? 'Mujer' : 'Hombre';
    migas.innerHTML = `<a class="migas__enlace" href="index.html">Inicio</a> &gt; <a class="migas__enlace" href="catalogo_${p.genero}.html">${nombreGenero}</a> &gt; <span>${escaparHTML(p.categoria)}</span>`;
    document.title = `Élite - ${p.nombre}`;
}

// Eventos de la vista (delegados sobre el contenedor, porque el HTML se genera después).
contenedor.addEventListener('click', (e) => {
    const miniatura = e.target.closest('[data-imagen]');
    if (miniatura) {
        contenedor.querySelector('.producto-detalle__imagen-principal').src = RUTA + miniatura.dataset.imagen;
        contenedor.querySelectorAll('.producto-detalle__miniatura').forEach((img) =>
            img.classList.toggle('producto-detalle__miniatura--activa', img.parentElement === miniatura)
        );
        return;
    }
    const boton = e.target.closest('[data-accion]');
    if (boton) {
        const input = contenedor.querySelector('[data-cantidad]');
        const cambio = boton.dataset.accion === 'sumar' ? 1 : -1;
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + cambio);
    }
});

contenedor.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(e.target);
    const cantidad = Math.max(1, parseInt(datos.get('cantidad'), 10) || 1);
    agregarAlCarrito(new URLSearchParams(location.search).get('id'), datos.get('talle'), cantidad);
    location.href = 'carrito.html';
});

try {
    const id = new URLSearchParams(location.search).get('id');
    const { productos, recomendados: sugeridos } = await cargarTienda();
    const producto = productos.find((p) => p.id === id);
    if (!producto) {
        mostrarEstado(estado, 'No encontramos ese producto. Volvé al catálogo para elegir otro.', true);
    } else {
        pintarProducto(producto);
        recomendados.hidden = false;
        recomendados.querySelector('.grilla-productos').innerHTML = sugeridos.map(crearTarjetaRecomendada).join('');
        mostrarEstado(estado);
    }
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
