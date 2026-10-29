// Carrito: cruza lo guardado en localStorage con el JSON de productos y lo renderiza.
import '../modulos/comun.js';
import { cargarTienda } from '../modulos/datos.js';
import { obtenerCarrito, cambiarCantidad, quitarDelCarrito } from '../modulos/almacen.js';
import { detallarCarrito, calcularTotales } from '../modulos/calculos.js';
import { crearItemCarrito } from '../modulos/componentes.js';
import { pintarTotales } from '../modulos/render.js';
import { leerCantidad, cantidadSegunAccion } from '../modulos/cantidad.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from '../modulos/util.js';

const lista = document.querySelector('#carrito-lista');
const vacio = document.querySelector('#carrito-vacio');
const resumen = document.querySelector('#carrito-resumen');
const totales = document.querySelector('#carrito-totales');
const estado = document.querySelector('[data-estado]');

let tienda;

function pintar() {
    const lineas = detallarCarrito(tienda.productos, obtenerCarrito());
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
    const accion = boton.dataset.accion;
    if (accion === 'quitar') quitarDelCarrito(id, talle);
    else cambiarCantidad(id, talle, cantidadSegunAccion(input.value, accion)); // restar desde 1 quita el producto
    pintar();
});

lista.addEventListener('change', (e) => {
    if (!e.target.matches('[data-cantidad]')) return;
    const { id, talle } = datosDelItem(e.target);
    cambiarCantidad(id, talle, leerCantidad(e.target.value)); // siempre entre 1 y 99
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
