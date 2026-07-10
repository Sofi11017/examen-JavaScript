/**
 * ciudades.js
 * Módulo independiente para la gestión de ciudades (CRUD)
 * Se comunica con admin.js mediante un callback para refrescar UI.
 */

(function () {

    /**
     * Inicializa el módulo de ciudades
     * @param {Function} onUpdateCallback - Función que se ejecutará después de agregar, editar o eliminar una ciudad.
     *                                       Se usa para refrescar los selects y listas en admin.js
     */
    function initCiudades(onUpdateCallback) {

        // --- Referencias al DOM ---
        const tbodyCiudades = document.getElementById('tbody-ciudades');
        const modalCiudad = document.getElementById('modal-ciudad');
        const formCiudad = document.getElementById('form-ciudad');
        const inputCiuId = document.getElementById('ciu-id');
        const inputCiuNombre = document.getElementById('ciu-nombre');
        const spanCiuError = document.getElementById('ciu-error');
        const btnNuevaCiudad = document.getElementById('btn-nueva-ciudad');

        if (!tbodyCiudades) {
            console.warn('No se encontró tbody-ciudades. Asegúrate de que exista en admin.html');
            return;
        }

        // --- Función que pinta la tabla de ciudades ---
        function renderCiudades() {
            tbodyCiudades.innerHTML = '';
            const list = Store.obtenerCiudades();

            list.forEach(c => {
                tbodyCiudades.innerHTML += `
                    <tr>
                        <td><strong>${c.nombre}</strong></td>
                        <td style="text-align: center;">
                            <button data-id="${c.id}" class="btn-icon btn-edit-ciu" title="Editar">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button data-id="${c.id}" class="btn-icon btn-delete-ciu" title="Eliminar">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>`;
            });

            // --- Asignar eventos de edición ---
            document.querySelectorAll('.btn-edit-ciu').forEach(btn => {
                btn.onclick = function () {
                    const id = Number(this.getAttribute('data-id'));
                    const c = Store.obtenerCiudades().find(item => item.id === id);
                    if (c && modalCiudad) {
                        inputCiuId.value = c.id;
                        inputCiuNombre.value = c.nombre;
                        spanCiuError.style.display = 'none';
                        // Cambiar título del modal
                        const titleEl = modalCiudad.shadowRoot.querySelector('#modal-titulo');
                        if (titleEl) titleEl.textContent = 'Editar Ciudad';
                        modalCiudad.abrir();
                    }
                };
            });

            // --- Asignar eventos de eliminación ---
            document.querySelectorAll('.btn-delete-ciu').forEach(btn => {
                btn.onclick = function () {
                    const id = Number(this.getAttribute('data-id'));
                    const list = Store.obtenerCiudades();
                    const c = list.find(item => item.id === id);
                    if (!c) return;

                    // Validar que no tenga eventos asociados
                    const data = Store.obtenerDatos();
                    const tieneEventos = data.eventos.some(e => e.ciudad.toLowerCase() === c.nombre.toLowerCase());
                    if (tieneEventos) {
                        alert('No puedes eliminar esta ciudad porque hay eventos programados en ella.');
                        return;
                    }

                    if (confirm(`¿Estás seguro de eliminar la ciudad "${c.nombre}"?`)) {
                        const filtradas = list.filter(item => item.id !== id);
                        Store.guardarCiudades(filtradas);
                        renderCiudades();
                        // Avisar al panel principal para que refresque selects y eventos
                        if (typeof onUpdateCallback === 'function') onUpdateCallback();
                    }
                };
            });
        }

        // --- Botón "Nueva Ciudad" ---
        if (btnNuevaCiudad) {
            btnNuevaCiudad.onclick = function () {
                if (formCiudad) formCiudad.reset();
                inputCiuId.value = '';
                spanCiuError.style.display = 'none';
                if (modalCiudad) {
                    const titleEl = modalCiudad.shadowRoot.querySelector('#modal-titulo');
                    if (titleEl) titleEl.textContent = 'Agregar Ciudad';
                    modalCiudad.abrir();
                }
            };
        }

        // --- Envío del formulario (agregar/editar) ---
        if (formCiudad) {
            formCiudad.onsubmit = function (e) {
                e.preventDefault();

                const id = inputCiuId.value ? Number(inputCiuId.value) : null;
                const nombre = inputCiuNombre.value.trim();
                if (!nombre) return;

                const list = Store.obtenerCiudades();

                // Validar duplicados
                const duplicado = list.some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== id);
                if (duplicado) {
                    spanCiuError.style.display = 'block';
                    inputCiuNombre.focus();
                    return;
                }
                spanCiuError.style.display = 'none';

                const data = Store.obtenerDatos();

                if (id) {
                    // --- Editar ---
                    const ciudad = list.find(c => c.id === id);
                    if (ciudad) {
                        // Si cambió el nombre, actualizar también en los eventos
                        if (ciudad.nombre !== nombre) {
                            data.eventos.forEach(ev => {
                                if (ev.ciudad.toLowerCase() === ciudad.nombre.toLowerCase()) {
                                    ev.ciudad = nombre;
                                }
                            });
                            Store.guardar(); // guarda cambios en eventos
                        }
                        ciudad.nombre = nombre;
                    }
                } else {
                    // --- Agregar ---
                    list.push({
                        id: Date.now(),
                        nombre: nombre
                    });
                }

                Store.guardarCiudades(list);
                if (modalCiudad) modalCiudad.cerrar();
                renderCiudades();

                // Avisar al panel principal para que refresque selects y eventos
                if (typeof onUpdateCallback === 'function') onUpdateCallback();
            };
        }

        // --- Renderizado inicial ---
        renderCiudades();
    }

    // Exponer la función de inicialización globalmente
    window.initCiudades = initCiudades;

})();