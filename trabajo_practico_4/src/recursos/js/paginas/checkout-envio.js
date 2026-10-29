// Paso 1 del checkout: datos de envío.
import '../modulos/comun.js';
import { cargarTienda, cargarProvincias } from '../modulos/datos.js';
import { obtenerCarrito, obtenerEnvio, guardarEnvio } from '../modulos/almacen.js';
import { detallarCarrito, calcularTotales } from '../modulos/calculos.js';
import { pintarProductosResumen, pintarTotales } from '../modulos/render.js';
import { activarValidacionEnVivo, validarFormulario, datosDeFormulario } from '../modulos/formularios.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from '../modulos/util.js';

const formulario = document.querySelector('#form-envio');
const estado = document.querySelector('[data-estado]');

// Reglas de validación (cada una devuelve true o el texto del error):
//  nombre / apellido / ciudad : al menos 2 caracteres
//  email                      : formato usuario@dominio.ext
//  telefono                   : opcional; si se completa, 7 a 20 caracteres entre dígitos, + espacios ( ) -
//  direccion                  : al menos 5 caracteres (calle y número)
//  provincia                  : debe elegirse una de la lista
//  codigo-postal              : formato argentino, 4 dígitos (5000) o CPA (X5000ABC)
const reglas = {
    nombre: (v) => v.trim().length >= 2 || 'Ingresá tu nombre.',
    apellido: (v) => v.trim().length >= 2 || 'Ingresá tu apellido.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Ingresá un correo válido (ej: nombre@correo.com).',
    telefono: (v) => v.trim() === '' || /^[0-9+\s()-]{7,20}$/.test(v.trim()) || 'Ingresá un teléfono válido o dejalo vacío.',
    direccion: (v) => v.trim().length >= 5 || 'Ingresá calle y número.',
    ciudad: (v) => v.trim().length >= 2 || 'Ingresá tu ciudad.',
    provincia: (v) => v !== '' || 'Elegí una provincia.',
    'codigo-postal': (v) => /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/.test(v.trim()) || 'Ingresá un código postal válido (ej: 5000).',
};

activarValidacionEnVivo(formulario, reglas);

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormulario(formulario, reglas)) return;
    guardarEnvio(datosDeFormulario(formulario)); // JSON con los datos de envío
    location.href = 'checkout_pago.html';
});

async function iniciar() {
    const [{ productos, tienda }, provincias] = await Promise.all([cargarTienda(), cargarProvincias()]);
    const lineas = detallarCarrito(productos, obtenerCarrito());
    if (lineas.length === 0) {
        location.replace('carrito.html'); // no hay nada que pagar
        return;
    }
    pintarProductosResumen(document.querySelector('#resumen-productos'), lineas);
    pintarTotales(document.querySelector('#resumen-totales'), calcularTotales(lineas, tienda.envio));

    formulario.elements.provincia.insertAdjacentHTML(
        'beforeend',
        provincias.map((nombre) => `<option value="${nombre}">${nombre}</option>`).join('')
    );
    // Si la persona vuelve desde el paso de pago, recuperamos lo que había cargado.
    const guardado = obtenerEnvio();
    if (guardado) {
        for (const [nombre, valor] of Object.entries(guardado)) {
            if (formulario.elements[nombre]) formulario.elements[nombre].value = valor;
        }
    }
    mostrarEstado(estado);
}

try {
    await iniciar();
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
