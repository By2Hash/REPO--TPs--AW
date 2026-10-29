// Funciones auxiliares compartidas por todas las páginas.

export const RUTA_IMAGENES = './recursos/imagenes/productos/';

export function formatearPrecio(numero) {
    return '$' + Number(numero).toFixed(2);
}

// Evita que texto de los datos se interprete como HTML al usar innerHTML.
export function escaparHTML(texto) {
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Pasa a minúsculas y quita tildes: "Camión" y "camion" se consideran iguales (búsqueda).
export function normalizarTexto(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Muestra un mensaje de estado (cargando / error) o lo oculta si no hay texto.
export function mostrarEstado(elemento, mensaje = '', esError = false) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.hidden = !mensaje;
    elemento.classList.toggle('estado-carga--error', esError);
}

export const MENSAJE_ERROR_CARGA =
    'No pudimos cargar los datos. Abrí el sitio con un servidor local (por ejemplo "pnpm dev") y no con doble clic sobre el archivo.';
