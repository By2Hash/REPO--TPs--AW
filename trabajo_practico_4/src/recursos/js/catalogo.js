// Catálogos (hombre / mujer): renderiza desde el JSON y aplica filtros con eventos.
import './comun.js';
import { cargarTienda } from './datos.js';
import { crearTarjetaProducto } from './componentes.js';
import { agregarAlCarrito } from './almacen.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from './util.js';

const grilla = document.querySelector('#grilla-productos');
const formulario = document.querySelector('#filtros-catalogo');
const estado = document.querySelector('[data-estado]');
const cantidad = document.querySelector('#filtros-cantidad');
const genero = grilla.dataset.genero;

let productosDelGenero = [];

function llenarOpciones(select, valores) {
    const opciones = valores.map((valor) => `<option value="${valor}">${valor}</option>`).join('');
    select.insertAdjacentHTML('beforeend', opciones);
}

const unicos = (lista) => [...new Set(lista)].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

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

function leerFiltros() {
    return Object.fromEntries(new FormData(formulario));
}

function pintar() {
    const filtros = leerFiltros();
    let lista = productosDelGenero;
    if (filtros.talle) lista = lista.filter((p) => p.talles.includes(filtros.talle));
    if (filtros.color) lista = lista.filter((p) => p.color === filtros.color);
    lista = ordenar(lista, filtros);

    grilla.innerHTML = lista.map((p) => crearTarjetaProducto(p)).join('');
    cantidad.textContent = lista.length
        ? `Mostrando ${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`
        : 'No hay productos que coincidan con los filtros.';
}

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

formulario.addEventListener('change', pintar);
formulario.addEventListener('submit', (e) => e.preventDefault());
formulario.addEventListener('reset', () => setTimeout(pintar)); // espera a que el reset termine

try {
    const { productos } = await cargarTienda();
    productosDelGenero = productos.filter((p) => p.genero === genero);
    llenarOpciones(formulario.elements.talle, unicos(productosDelGenero.flatMap((p) => p.talles)));
    llenarOpciones(formulario.elements.color, unicos(productosDelGenero.map((p) => p.color)));
    mostrarEstado(estado);
    pintar();
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
