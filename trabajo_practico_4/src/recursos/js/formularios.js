// Validación de formularios con eventos (reemplaza los mensajes nativos del navegador).

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

// Cada regla recibe el valor y devuelve true o un texto con el error.
export function validarCampo(input, reglas) {
    const regla = reglas[input.name];
    if (!regla) return true;
    const resultado = regla(input.value);
    mostrarError(input, resultado === true ? '' : resultado);
    return resultado === true;
}

export function validarFormulario(formulario, reglas) {
    let primerInvalido = null;
    for (const input of formulario.elements) {
        if (!input.name || input.matches(":disabled") || !reglas[input.name]) continue;
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

export function datosDeFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario));
}
