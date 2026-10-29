// Se importa desde todas las páginas: mantiene actualizado el contador del menú.
import { contarUnidades } from './almacen.js';

function actualizarContador() {
    const unidades = contarUnidades();
    document.querySelectorAll('[data-carrito-contador]').forEach((contador) => {
        contador.textContent = unidades;
        contador.hidden = unidades === 0;
    });
}

actualizarContador();
document.addEventListener('carrito:cambio', actualizarContador);
window.addEventListener('storage', actualizarContador); // cambios desde otra pestaña
