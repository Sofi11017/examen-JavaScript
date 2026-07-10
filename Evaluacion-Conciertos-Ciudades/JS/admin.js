document.addEventListener('DOMContentLoaded', async () => {

    // --- GUARDA DE ACCESO ---
    if (sessionStorage.getItem('admin_autenticado') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('admin_autenticado');
        window.location.href = 'login.html';
    });

    let appData = await Store.cargar();

    // --- ENRUTADOR DE PANTALLAS ---
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (!target) return;

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(sec => {
                if (sec.id === `section-${target}`) {
                    sec.classList.remove('visual-hidden');
                    sec.classList.add('active-section');
                } else {
                    sec.classList.add('visual-hidden');
                    sec.classList.remove('active-section');
                }
            });

            const titulos = {
                inicio: 'Dashboard General',
                categorias: 'Categorías',
                eventos: 'Eventos',
                ventas: 'Ventas',
                sugerencias: 'Buzón de Sugerencias',
                reportes: 'Reporte de Ventas',
                ciudades: 'Ciudades'   // añadido por si acaso
            };
            if (pageTitle) pageTitle.textContent = titulos[target] || (target.charAt(0).toUpperCase() + target.slice(1));

            // Refrescar sugerencias al entrar a esa sección
            if (target === 'sugerencias' && typeof renderSugerencias === 'function') {
                renderSugerencias();
            }

            // Generar/Actualizar reporte al entrar a esa sección
            if (target === 'reportes' && typeof generarReporteVentas === 'function') {
                generarReporteVentas();
            }

            // Refrescar ciudades al entrar a esa sección (ya no es necesario porque initCiudades ya maneja el renderizado)
            // pero mantenemos un disparador por si queremos forzar actualización
            if (target === 'ciudades') {
                // Si deseamos forzar el re-render de ciudades, podríamos hacerlo pero la función renderCiudades está encapsulada en el módulo.
                // Simplemente llamamos a la función initCiudades con el callback nuevamente? No, porque solo debe inicializarse una vez.
                // Mejor: exponer una función de refresh desde el módulo, pero por simplicidad, al estar dentro de initCiudades ya se renderiza al inicio y cada vez que se modifica algo.
                // Si queremos forzar actualización al hacer clic, podemos re-invocar el callback, pero no es necesario.
                // Lo dejamos así.
            }
        });
    });


    // --- REINICIAR TODO ---
    document.getElementById('btn-reset-datos').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas restaurar la base de datos de pruebas inicial?')) {
            Store.reiniciar();
        }
    });


    // ============================================================
    // PANEL DE INICIO (MÉTRICAS)
    // ============================================================
    const metricRecaudacion = document.getElementById('metric-recaudacion');
    const metricEntradas = document.getElementById('metric-entradas');
    const metricEventos = document.getElementById('metric-eventos');
    const txtMetaActual = document.getElementById('meta-actual');
    const txtMetaObjetivo = document.getElementById('meta-objetivo');
    const barMetaProgress = document.getElementById('meta-progress-bar');
    const txtMetaPorcentaje = document.getElementById('meta-porcentaje-texto');
    const inputMeta = document.getElementById('input-meta-ventas');
    const btnMeta = document.getElementById('btn-guardar-meta');
    const gridCatResumen = document.getElementById('grid-categorias-resumen');

    function renderMetricasInicio() {
        let recaudacion = 0;
        let tktVendidos = 0;
        appData.ventas.forEach(v => {
            recaudacion += v.total || 0;
            if (v.items) {
                v.items.forEach(it => tktVendidos += (it.cantidad || 0));
            }
        });

        if (metricRecaudacion) metricRecaudacion.textContent = Store.formatoMoneda(recaudacion);
        if (metricEntradas) metricEntradas.textContent = tktVendidos;
        if (metricEventos) metricEventos.textContent = appData.eventos.length;

        let objMeta = appData.metaVentas || 0;
        if (txtMetaActual) txtMetaActual.textContent = Store.formatoMoneda(recaudacion);
        if (txtMetaObjetivo) txtMetaObjetivo.textContent = `Meta: ${Store.formatoMoneda(objMeta)}`;

        let pct = objMeta > 0 ? Math.min(100, (recaudacion / objMeta) * 100) : 0;
        if (barMetaProgress) barMetaProgress.style.width = `${pct}%`;
        if (txtMetaPorcentaje) txtMetaPorcentaje.textContent = `${pct.toFixed(1)}% de la meta alcanzada`;
        if (inputMeta) inputMeta.value = objMeta || '';

        if (gridCatResumen) {
            gridCatResumen.innerHTML = '';
            appData.categorias.forEach(cat => {
                let cont = appData.eventos.filter(e => e.categoria === cat.nombre).length;
                gridCatResumen.innerHTML += `
                    <div class="item-cat-mini">
                        <span>${cat.nombre}</span>
                        <span class="badge-cat-inicio">${cont} ev.</span>
                    </div>`;
            });
        }
    }

    if (btnMeta) {
        btnMeta.addEventListener('click', () => {
            let val = parseFloat(inputMeta.value) || 0;
            appData.metaVentas = val;
            Store.guardar();
            renderMetricasInicio();
            alert('Meta actualizada correctamente.');
        });
    }


    // ============================================================
    // CATEGORÍAS
    // ============================================================
    const tbodyCategorias = document.getElementById('tbody-categorias');
    const modalCategoria = document.getElementById('modal-categoria');
    const formCategoria = document.getElementById('form-categoria');

    function renderCategorias() {
        if (!tbodyCategorias) return;
        tbodyCategorias.innerHTML = '';
        appData.categorias.forEach(cat => {
            tbodyCategorias.innerHTML += `
                <tr>
                    <td><strong>${cat.nombre}</strong></td>
                    <td>${cat.descripcion}</td>
                    <td>
                        <button data-id="${cat.id}" class="btn-icon btn-edit-cat" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button data-id="${cat.id}" class="btn-icon btn-delete-cat" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });

        // Eventos delegados edición
        document.querySelectorAll('.btn-edit-cat').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const cat = appData.categorias.find(c => c.id === id);
                if (cat && modalCategoria) {
                    document.getElementById('cat-id').value = cat.id;
                    document.getElementById('cat-nombre').value = cat.nombre;
                    document.getElementById('cat-descripcion').value = cat.descripcion;
                    modalCategoria.abrir();
                }
            });
        });

        // Eventos delegados eliminación
        document.querySelectorAll('.btn-delete-cat').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const cat = appData.categorias.find(c => c.id === id);
                if (!cat) return;

                let asoc = appData.eventos.some(e => e.categoria === cat.nombre);
                if (asoc) {
                    alert('No puedes eliminar la categoría porque hay eventos asociados a ella.');
                    return;
                }

                if (confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
                    appData.categorias = appData.categorias.filter(c => c.id !== id);
                    Store.guardar();
                    renderCategorias();
                    renderMetricasInicio();
                    actualizarSelectCategorias();
                }
            });
        });
    }

    if (document.getElementById('btn-nueva-categoria')) {
        document.getElementById('btn-nueva-categoria').addEventListener('click', () => {
            if (formCategoria) formCategoria.reset();
            document.getElementById('cat-id').value = '';
            if (modalCategoria) modalCategoria.abrir();
        });
    }

    if (formCategoria) {
        formCategoria.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('cat-id').value;
            const nombre = document.getElementById('cat-nombre').value.trim();
            const descripcion = document.getElementById('cat-descripcion').value.trim();

            if (id) {
                const cat = appData.categorias.find(c => c.id === id);
                if (cat) {
                    if (cat.nombre !== nombre) {
                        appData.eventos.forEach(ev => {
                            if (ev.categoria === cat.nombre) ev.categoria = nombre;
                        });
                    }
                    cat.nombre = nombre;
                    cat.descripcion = descripcion;
                }
            } else {
                appData.categorias.push({
                    id: Store.generarId('cat'),
                    nombre,
                    descripcion
                });
            }

            Store.guardar();
            if (modalCategoria) modalCategoria.cerrar();
            renderCategorias();
            renderMetricasInicio();
            actualizarSelectCategorias();
        });
    }


    // ============================================================
    // EVENTOS
    // ============================================================
    const fileInput = document.getElementById('ev-imagen');
    const hiddenInput = document.getElementById('ev-imagen-base64');
    const imgPreview = document.getElementById('ev-imagen-preview');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    if (hiddenInput) hiddenInput.value = evt.target.result;
                    if (imgPreview) {
                        imgPreview.src = evt.target.result;
                        imgPreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const formEventos = document.getElementById('form-eventos');
    const selectEvCat = document.getElementById('ev-categoria');
    const selectEvCiudad = document.getElementById('ev-ciudad');
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion-ev');

    function actualizarSelectCategorias() {
        if (!selectEvCat) return;
        selectEvCat.innerHTML = '<option value="">Seleccione...</option>';
        appData.categorias.forEach(c => {
            selectEvCat.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
    }

    function inicializarSelectCiudades() {
        if (!selectEvCiudad) return;
        selectEvCiudad.innerHTML = '<option value="">Seleccione...</option>';
        Store.CIUDADES.forEach(c => {
            selectEvCiudad.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }

    function renderEventos() {
        const cont = document.getElementById('container-eventos-lista');
        if (!cont) return;
        cont.innerHTML = '';

        if (appData.eventos.length === 0) {
            cont.innerHTML = '<p style="color:var(--text-muted); padding:1rem;">No hay eventos registrados todavía.</p>';
            return;
        }

        appData.eventos.forEach(ev => {
            cont.innerHTML += `
                <div class="evento-fila-dinamica">
                    <img src="${ev.imagen ? ev.imagen : Store.IMAGE_PLACEHOLDER}" alt="${ev.nombre}">
                    <div class="evento-info-texto">
                        <h4>${ev.nombre} <span class="badge-cat" style="background:#f1f5f9; color:var(--sidebar-bg); font-size:0.7rem; padding:2px 6px; border-radius:4px;">${ev.codigo}</span></h4>
                        <p>${ev.categoria} · ${ev.ciudad} · ${ev.fecha} ${ev.hora}</p>
                        <strong>${Store.formatoMoneda(ev.precio)}</strong>
                    </div>
                    <div class="categoria-acciones">
                        <button data-id="${ev.id}" class="btn-icon btn-edit-ev" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button data-id="${ev.id}" class="btn-icon btn-delete-ev" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
        });

        document.querySelectorAll('.btn-edit-ev').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                cargarEventoParaEditar(id);
            });
        });

        document.querySelectorAll('.btn-delete-ev').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar este concierto?')) {
                    appData.eventos = appData.eventos.filter(e => e.id !== id);
                    Store.guardar();
                    renderEventos();
                    renderMetricasInicio();
                }
            });
        });
    }

    function cargarEventoParaEditar(id) {
        const ev = appData.eventos.find(e => e.id === id);
        if (!ev) return;

        document.getElementById('ev-id').value = ev.id;
        document.getElementById('ev-codigo').value = ev.codigo;
        document.getElementById('ev-nombre').value = ev.nombre;
        document.getElementById('ev-categoria').value = ev.categoria;
        document.getElementById('ev-precio').value = ev.precio;
        document.getElementById('ev-fecha').value = ev.fecha;
        document.getElementById('ev-hora').value = ev.hora;
        document.getElementById('ev-ciudad').value = ev.ciudad;

        if (hiddenInput) hiddenInput.value = ev.imagen || '';
        if (imgPreview) {
            if (ev.imagen) {
                imgPreview.src = ev.imagen;
                imgPreview.style.display = 'block';
            } else {
                imgPreview.style.display = 'none';
            }
        }
        if (fileInput) fileInput.value = '';

        document.getElementById('ev-descripcion').value = ev.descripcion;

        document.getElementById('form-eventos-titulo').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Evento';
        document.getElementById('btn-guardar-evento').textContent = 'Actualizar Evento';
        if (btnCancelarEdicion) btnCancelarEdicion.style.display = 'block';
    }

    function resetFormEventos() {
        if (formEventos) formEventos.reset();
        document.getElementById('ev-id').value = '';
        if (hiddenInput) hiddenInput.value = '';
        if (imgPreview) {
            imgPreview.src = '';
            imgPreview.style.display = 'none';
        }
        document.getElementById('form-eventos-titulo').innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Registrar Nuevo Evento';
        document.getElementById('btn-guardar-evento').textContent = 'Guardar Evento';
        if (btnCancelarEdicion) btnCancelarEdicion.style.display = 'none';
    }

    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener('click', resetFormEventos);
    }

    if (formEventos) {
        formEventos.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('ev-id').value;

            const datos = {
                codigo: document.getElementById('ev-codigo').value.trim(),
                nombre: document.getElementById('ev-nombre').value.trim(),
                categoria: document.getElementById('ev-categoria').value,
                precio: parseFloat(document.getElementById('ev-precio').value) || 0,
                fecha: document.getElementById('ev-fecha').value,
                hora: document.getElementById('ev-hora').value,
                ciudad: document.getElementById('ev-ciudad').value,
                imagen: hiddenInput ? hiddenInput.value.trim() : '',
                descripcion: document.getElementById('ev-descripcion').value.trim()
            };

            if (id) {
                const ev = appData.eventos.find(e => e.id === id);
                if (ev) Object.assign(ev, datos);
            } else {
                appData.eventos.push({
                    id: Store.generarId('ev'),
                    ...datos
                });
            }

            Store.guardar();
            resetFormEventos();
            renderEventos();
            renderMetricasInicio();
            alert('Evento procesado de manera correcta.');
        });
    }


    // ============================================================
    // HISTORIAL DE VENTAS
    // ============================================================
    const tableVentas = document.getElementById('table-ventas-completa');
    const modalDetalleVenta = document.getElementById('modal-detalle-venta');

    function renderVentas() {
        if (!tableVentas) return;
        const tbody = tableVentas.querySelector('tbody');
        tbody.innerHTML = '';

        if (appData.ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No existen ventas en el historial corporativo.</td></tr>';
            return;
        }

        const copiaVentas = [...appData.ventas].sort((a, b) => b.fecha - a.fecha);

        copiaVentas.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td><code>${v.id}</code></td>
                    <td>${new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                    <td>${v.ciudad || 'N/A'}</td>
                    <td>${v.cliente?.nombre || 'Anónimo'}</td>
                    <td><strong>${Store.formatoMoneda(v.total)}</strong></td>
                    <td><button data-id="${v.id}" class="btn-action btn-ver-detalle" style="padding:0.4rem 0.8rem; font-size:0.75rem;"><i class="fa-solid fa-eye"></i> Detalles</button></td>
                </tr>`;
        });

        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', function () {
                verDetallePedido(this.getAttribute('data-id'));
            });
        });
    }

    function verDetallePedido(id) {
        const venta = appData.ventas.find(v => v.id === id);
        if (!venta || !modalDetalleVenta) return;

        let itemsHtml = venta.items.map(it => `
            <tr>
                <td>${it.nombre}</td>
                <td>${it.cantidad}</td>
                <td>${Store.formatoMoneda(it.precioUnit)}</td>
                <td>${Store.formatoMoneda(it.subtotal)}</td>
            </tr>`).join('');

        document.getElementById('detalle-venta-contenido').innerHTML = `
            <p><strong>ID Venta:</strong> ${venta.id}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-CO')}</p>
            <p><strong>Ciudad:</strong> ${venta.ciudad}</p>
            <hr>
            <h4>Datos del Cliente</h4>
            <p><strong>Nombre:</strong> ${venta.cliente?.nombre ?? '-'}</p>
            <p><strong>Identificación:</strong> ${venta.cliente?.identificacion ?? '-'}</p>
            <p><strong>Dirección:</strong> ${venta.cliente?.direccion ?? '-'}</p>
            <p><strong>Teléfono:</strong> ${venta.cliente?.telefono ?? '-'}</p>
            <p><strong>Email:</strong> ${venta.cliente?.email ?? '-'}</p>
            <hr>
            <h4>Entradas Compradas</h4>
            <table class="tabla-detalle-venta">
                <thead><tr><th>Evento</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="text-align:right; margin-top:0.8rem;"><strong>Total: ${Store.formatoMoneda(venta.total)}</strong></p>
        `;
        modalDetalleVenta.abrir();
    }

    // ============================================================
    // GESTIÓN DE CIUDADES - AHORA EN MÓDULO SEPARADO
    // ============================================================
    // Inicializar el módulo de ciudades, pasando un callback para refrescar
    // los selects y la lista de eventos cuando cambie alguna ciudad.
    if (typeof initCiudades === 'function') {
        initCiudades(function onCiudadesUpdate() {
            // Actualizar el select de ciudades en el formulario de eventos
            inicializarSelectCiudades();
            // Volver a renderizar la lista de eventos (por si alguna ciudad cambió)
            renderEventos();
        });
    } else {
        console.warn('El módulo ciudades.js no se cargó correctamente.');
    }


    // --- INICIALIZACIÓN MÓDULOS DEL PANEL ---
    renderMetricasInicio();
    renderCategorias();
    actualizarSelectCategorias();
    inicializarSelectCiudades();   // se ejecuta antes de que el módulo ciudades haga el callback
    renderEventos();
    renderVentas();
    renderSugerencias();
    generarReporteVentas();
    // renderCiudades() ya no se llama aquí, porque está dentro de initCiudades
});