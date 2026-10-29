// Carrito: cruza lo guardado en localStorage con el JSON de productos y lo renderiza.
import './comun.js';
import { cargarTienda } from './datos.js';
import { cambiarCantidad, quitarDelCarrito, detallarCarrito, calcularTotales } from './almacen.js';
import { crearItemCarrito, pintarTotales } from './componentes.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from './util.js';

const lista = document.querySelector('#carrito-lista');
const vacio = document.querySelector('#carrito-vacio');
const resumen = document.querySelector('#carrito-resumen');
const totales = document.querySelector('#carrito-totales');
const estado = document.querySelector('[data-estado]');

let tienda;

function pintar() {
    const lineas = detallarCarrito(tienda.productos);
    lista.innerHTML = lineas.map(crearItemCarrito).join('');
    vacio.hidden = lineas.length > 0;
    resumen.hidden = lineas.length === 0;
    pintarTotales(totales, calcularTotales(lineas, tienda.tienda.envio));
}

function datosDelItem(elemento) {
    const item = elemento.closest('.carrito-item');
    return { id: item.dataset.id, talle: item.dataset.talle, input: item.querySelector('[data-cantidad]') };
}

lista.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const { id, talle, input } = datosDelItem(boton);
    const actual = parseInt(input.value, 10) || 1;
    if (boton.dataset.accion === 'quitar') quitarDelCarrito(id, talle);
    if (boton.dataset.accion === 'sumar') cambiarCantidad(id, talle, actual + 1);
    if (boton.dataset.accion === 'restar') cambiarCantidad(id, talle, actual - 1);
    pintar();
});

lista.addEventListener('change', (e) => {
    if (!e.target.matches('[data-cantidad]')) return;
    const { id, talle } = datosDelItem(e.target);
    cambiarCantidad(id, talle, parseInt(e.target.value, 10) || 1);
    pintar();
});

try {
    tienda = await cargarTienda();
    mostrarEstado(estado);
    pintar();
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
