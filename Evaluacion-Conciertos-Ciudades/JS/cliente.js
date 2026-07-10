document.addEventListener('DOMContentLoaded', async () => {
    const appData = await Store.cargar();

    const grid = document.getElementById('grid-eventos');
    const sinResultados = document.getElementById('sin-resultados');
    const buscador = document.getElementById('buscador');
    const filtroCiudad = document.getElementById('filtro-ciudad');
    const filtroCategoria = document.getElementById('filtro-categoria');

    // Poblar selects de filtros
    Store.CIUDADES.forEach(c => {
        filtroCiudad.innerHTML += `<option value="${c}">${c}</option>`;
    });
    appData.categorias.forEach(c => {
        filtroCategoria.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
    });

    function coincideBusqueda(nombreEvento, termino) {
        if (!termino) return true;
        return nombreEvento.toLowerCase().includes(termino.toLowerCase());
    }

    function renderGrid() {
        const termino = buscador.value.trim();
        const ciudad = filtroCiudad.value;
        const categoria = filtroCategoria.value;

        const filtrados = appData.eventos.filter(ev =>
            coincideBusqueda(ev.nombre, termino) &&
            (ciudad === '' || ev.ciudad === ciudad) &&
            (categoria === '' || ev.categoria === categoria)
        );

        grid.innerHTML = '';
        sinResultados.style.display = filtrados.length === 0 ? 'block' : 'none';

        filtrados.forEach(ev => {
            const card = document.createElement('evento-card');
            card.evento = ev;
            card.addEventListener('ver-detalle', (e) => {
                window.location.href = `detalle.html?id=${e.detail.id}`;
            });
            card.addEventListener('agregar-carrito', (e) => {
                Store.agregarAlCarrito(e.detail);
                alert(`"${e.detail.nombre}" fue agregado al carrito.`);
            });
            grid.appendChild(card);
        });
    }

    buscador.addEventListener('input', renderGrid);
    filtroCiudad.addEventListener('change', renderGrid);
    filtroCategoria.addEventListener('change', renderGrid);

    renderGrid();

    // ============================================================
    // BUZÓN DE SUGERENCIAS
    // ============================================================
    const STORAGE_KEY_SUGERENCIAS = 'conciertos_sugerencias';

    const overlay        = document.getElementById('overlay-sugerencia');
    const btnAbrir       = document.getElementById('btn-abrir-sugerencia');
    const btnCerrar      = document.getElementById('btn-cerrar-sugerencia');
    const formSugerencia = document.getElementById('form-sugerencia');
    const inputCorreo    = document.getElementById('sug-correo');
    const inputMensaje   = document.getElementById('sug-mensaje');
    const spanError      = document.getElementById('sug-error');
    const divExito       = document.getElementById('sugerencia-exito');
});