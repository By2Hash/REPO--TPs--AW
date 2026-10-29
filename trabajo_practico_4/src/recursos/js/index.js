// Index: renderiza los productos destacados desde el JSON.
import './comun.js';
import { cargarTienda } from './datos.js';
import { crearTarjetaProducto } from './componentes.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from './util.js';

const grilla = document.querySelector('#grilla-destacados');
const estado = document.querySelector('[data-estado]');

try {
    const { productos } = await cargarTienda();
    const destacados = productos.filter((producto) => producto.destacado);
    grilla.innerHTML = destacados.map((p) => crearTarjetaProducto(p, { accion: 'ver' })).join('');
    mostrarEstado(estado);
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
