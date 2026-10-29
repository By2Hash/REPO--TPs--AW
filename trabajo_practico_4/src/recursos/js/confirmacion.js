// Paso 3: muestra el pedido guardado (JSON) en pantalla.
import './comun.js';
import { obtenerPedido } from './almacen.js';
import { pintarProductosResumen, pintarTotales } from './componentes.js';
import { escaparHTML } from './util.js';

const pedido = obtenerPedido();

if (!pedido) {
    location.replace('index.html'); // no hay pedido que mostrar
} else {
    document.querySelector('#pedido-numero').textContent = `Pedido Nº ${pedido.numero}`;
    document.querySelector('#pedido-texto').innerHTML =
        `Te enviamos el detalle a <strong>${escaparHTML(pedido.cliente.email)}</strong>. ` +
        `Vas a recibir tu pedido en ${escaparHTML(pedido.cliente.direccion)}, ${escaparHTML(pedido.cliente.ciudad)}, en los próximos días hábiles.`;
    pintarProductosResumen(document.querySelector('#resumen-productos'), pedido.items);
    pintarTotales(document.querySelector('#resumen-totales'), pedido);
}
