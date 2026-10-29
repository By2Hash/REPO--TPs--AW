// Paso 2 del checkout: método de pago y armado del pedido (JSON).
import './comun.js';
import { cargarTienda } from './datos.js';
import { detallarCarrito, calcularTotales, obtenerEnvio, guardarPedido, vaciarCarrito } from './almacen.js';
import { pintarProductosResumen, pintarTotales } from './componentes.js';
import { activarValidacionEnVivo, validarFormulario, datosDeFormulario } from './formularios.js';
import { mostrarEstado, MENSAJE_ERROR_CARGA } from './util.js';

const formulario = document.querySelector('#form-pago');
const datosTarjeta = document.querySelector('#datos-tarjeta');
const estado = document.querySelector('[data-estado]');

let lineas = [];
let totales;

function vencimientoValido(valor) {
    const partes = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valor.trim());
    if (!partes) return 'Usá el formato MM/AA.';
    const mes = Number(partes[1]);
    const anio = 2000 + Number(partes[2]);
    const hoy = new Date();
    const vencida = anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1);
    return !vencida || 'La tarjeta está vencida.';
}

const reglas = {
    titular: (v) => v.trim().length >= 3 || 'Ingresá el nombre que figura en la tarjeta.',
    'numero-tarjeta': (v) => /^\d{13,19}$/.test(v.replace(/\s/g, '')) || 'Ingresá un número de tarjeta de 13 a 19 dígitos.',
    vencimiento: vencimientoValido,
    'codigo-seguridad': (v) => /^\d{3,4}$/.test(v.trim()) || 'Ingresá 3 o 4 dígitos.',
};

activarValidacionEnVivo(formulario, reglas);

// Mostrar u ocultar los datos de tarjeta según el método elegido.
function actualizarMetodo() {
    const conTarjeta = formulario.elements.metodo.value === 'tarjeta';
    datosTarjeta.hidden = !conTarjeta;
    datosTarjeta.disabled = !conTarjeta; // los campos deshabilitados no se validan ni se envían
}
formulario.elements.metodo.forEach((radio) => radio.addEventListener('change', actualizarMetodo));

// Formato automático mientras se escribe.
formulario.elements['numero-tarjeta'].addEventListener('input', (e) => {
    const digitos = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
});
formulario.elements.vencimiento.addEventListener('input', (e) => {
    const digitos = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
});

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormulario(formulario, reglas)) return;

    const datos = datosDeFormulario(formulario);
    const pedido = {
        numero: `ELT-${String(Date.now()).slice(-6)}`,
        fecha: new Date().toISOString(),
        cliente: obtenerEnvio(),
        pago: {
            metodo: datos.metodo,
            // Nunca se guarda el número completo ni el código de seguridad.
            ...(datos.metodo === 'tarjeta' && {
                ultimos4: datos['numero-tarjeta'].replace(/\s/g, '').slice(-4),
                cuotas: Number(datos.cuotas),
            }),
        },
        items: lineas.map((l) => ({
            id: l.producto.id,
            nombre: l.producto.nombre,
            talle: l.talle,
            cantidad: l.cantidad,
            precioUnitario: l.producto.precio,
            subtotal: l.subtotal,
        })),
        ...totales,
    };
    console.log('Pedido (JSON):', JSON.stringify(pedido, null, 2));
    guardarPedido(pedido);
    vaciarCarrito();
    location.href = 'checkout_confirmacion.html';
});

try {
    if (!obtenerEnvio()) location.replace('checkout_envio.html');
    const { productos, tienda } = await cargarTienda();
    lineas = detallarCarrito(productos);
    if (lineas.length === 0) location.replace('carrito.html');
    totales = calcularTotales(lineas, tienda.envio);
    pintarProductosResumen(document.querySelector('#resumen-productos'), lineas);
    pintarTotales(document.querySelector('#resumen-totales'), totales);
    actualizarMetodo();
    mostrarEstado(estado);
} catch (error) {
    console.error(error);
    mostrarEstado(estado, MENSAJE_ERROR_CARGA, true);
}
