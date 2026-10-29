// Validación de formularios con eventos (reemplaza los mensajes nativos del navegador).
//
// Cada página define un objeto `reglas`: { nombreDelCampo: (valor) => true | 'texto del error' }.
// Este módulo se encarga de mostrar los errores, marcar aria-invalid y enviar el foco al primer error.

function campoDe(input) {
    return input.closest('.form-compra__campo');
}

export function mostrarError(input, mensaje) {
    const error = campoDe(input)?.querySelector('.form-compra__error');
    input.classList.toggle('form-compra__input--invalido', Boolean(mensaje));
    input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    if (error) {
        error.textContent = mensaje;
        error.hidden = !mensaje;
    }
}

// Devuelve true si el campo es válido; si no, muestra el error y devuelve false.
export function validarCampo(input, reglas) {
    const regla = reglas[input.name];
    if (!regla) return true;
    const resultado = regla(input.value);
    mostrarError(input, resultado === true ? '' : resultado);
    return resultado === true;
}

// Valida todos los campos con regla (ignora los deshabilitados) y enfoca el primero inválido.
export function validarFormulario(formulario, reglas) {
    let primerInvalido = null;
    for (const input of formulario.elements) {
        if (!input.name || input.matches(':disabled') || !reglas[input.name]) continue;
        if (!validarCampo(input, reglas) && !primerInvalido) primerInvalido = input;
    }
    primerInvalido?.focus();
    return !primerInvalido;
}

// Valida cada campo al salir de él y limpia el error mientras se corrige.
export function activarValidacionEnVivo(formulario, reglas) {
    formulario.noValidate = true; // los mensajes los muestra este script
    formulario.addEventListener('focusout', (e) => {
        if (e.target.name && reglas[e.target.name]) validarCampo(e.target, reglas);
    });
    formulario.addEventListener('input', (e) => {
        if (e.target.getAttribute('aria-invalid') === 'true') validarCampo(e.target, reglas);
    });
}

// Devuelve los datos del formulario como objeto, quitando espacios sobrantes en los textos.
export function datosDeFormulario(formulario) {
    const datos = Object.fromEntries(new FormData(formulario));
    for (const [clave, valor] of Object.entries(datos)) {
        if (typeof valor === 'string') datos[clave] = valor.trim();
    }
    return datos;
}
