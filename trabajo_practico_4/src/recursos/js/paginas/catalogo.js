// Catálogos (hombre / mujer): renderiza desde el JSON y aplica búsqueda, filtros y orden con eventos.
import '../modulos/comun.js';
import { cargarTienda } from '../modulos/datos.js';
import { crearTarjetaProducto } from '../modulos/componentes.js';
import { agregarAlCarrito } from '../modulos/almacen.js';
import { escaparHTML, normalizarTexto, mostrarEstado, MENSAJE_ERROR_CARGA } from '../modulos/util.js';

const grilla = document.querySelector('#grilla-productos');
const formulario = document.querySelector('#filtros-catalogo');
const estado = document.querySelector('[data-estado]');
const cantidad = document.querySelector('#filtros-cantidad');
const genero = grilla.dataset.genero;

let productosDelGenero = [];

/* ---- opciones de los <select> ---- */
const ORDEN_TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Letras primero (XS < S < M < L < XL < XXL), después los talles numéricos de menor a mayor.
function valorTalle(talle) {
    const posicion = ORDEN_TALLES.indexOf(talle);
    return posicion >= 0 ? posicion : 100 + (Number(talle) || 100);
}

const unicos = (lista) => [...new Set(lista)];
const alfabetico = (lista) => unicos(lista).sort((a, b) => a.localeCompare(b, 'es'));
const talles = (lista) => unicos(lista).sort((a, b) => valorTalle(a) - valorTalle(b));

function llenarOpciones(select, valores) {
    const opciones = valores
        .map((valor) => `<option value="${escaparHTML(valor)}">${escaparHTML(valor)}</option>`)
        .join('');
    select.insertAdjacentHTML('beforeend', opciones);
}

/* ---- filtrado y orden ---- */
function ordenar(lista, { ordenar: orden, precio }) {
    const copia = [...lista];
    if (precio === 'mayor') return copia.sort((a, b) => b.precio - a.precio);
    if (precio === 'menor') return copia.sort((a, b) => a.precio - b.precio);
    switch (orden) {
        case 'nuevos':
            return copia.sort((a, b) => b.fecha.localeCompare(a.fecha));
        case 'az':
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        case 'za':
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
        default: // destacados primero (el orden es estable)
            return copia.sort((a, b) => Number(b.destacado) - Number(a.destacado));
    }
}

// El texto buscado puede estar en el nombre, la descripción, la categoría o el color.
function coincideConBusqueda(producto, texto) {
    const buscado = normalizarTexto(texto);
    if (!buscado) return true;
    const contenido = normalizarTexto(
        `${producto.nombre} ${producto.descripcion} ${producto.categoria} ${producto.color}`
    );
    return buscado.split(/\s+/).every((palabra) => contenido.includes(palabra));
}

function leerFiltros() {
    return Object.fromEntries(new FormData(formulario));
}

function pintar() {
    const filtros = leerFiltros();
    let lista = productosDelGenero;
    if (filtros.buscar) lista = lista.filter((p) => coincideConBusqueda(p, filtros.buscar));
    if (filtros.categoria) lista = lista.filter((p) => p.categoria === filtros.categoria);
    if (filtros.talle) lista = lista.filter((p) => p.talles.includes(filtros.talle));
    if (filtros.color) lista = lista.filter((p) => p.color === filtros.color);
    lista = ordenar(lista, filtros);

    grilla.innerHTML = lista.map((p) => crearTarjetaProducto(p)).join('');
    cantidad.textContent = lista.length
        ? `Mostrando ${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`
        : 'No hay productos que coincidan con los filtros.';
}

/* ---- eventos ---- */
// Click en "Añadir al carrito" (delegación de eventos sobre la grilla).
grilla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-agregar]');
    if (!boton) return;
    const producto = productosDelGenero.find((p) => p.id === boton.dataset.agregar);
    const talleElegido = leerFiltros().talle;
    const talle = producto.talles.includes(talleElegido) ? talleElegido : producto.talles[0];
    agregarAlCarrito(producto.id, talle);

    boton.textContent = `Agregado (talle ${talle})`;
    boton.classList.add('boton--exito');
    setTimeout(() => {
        boton.textContent = 'Añadir al carrito';
        boton.classList.remove('boton--exito');
    }, 1500);
});

// "input" se dispara al escribir en la búsqueda y al cambiar cualquier <select>.
formulario.addEventListener('input', pintar);
formulario.addEventListener('submit', (e) => e.preventDefault());
formulario.addEventListener('reset', () => setTimeout(pintar)); // espera a que el reset termine

try {
    const { productos } = await cargarTienda();
    productosDelGenero = productos.filter((p) => p.genero === genero);
    llenarOpciones(formulario.elements.categoria, alfabetico(productosDelGenero.map((p) => p.categoria)));
    llenarOpciones(formulario.elements.talle, talles(productosDelGenero.flatMap((p) => p.talles)));
    llenarOpciones(formulario.elements.color, alfabetico(productosDelGenero.map((p) => p.color)));
    mostrarEstado(estado);
    pintar();
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
