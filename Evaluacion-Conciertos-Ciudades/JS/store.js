/**
 * Store.js
 * Capa de acceso a datos compartida por admin.js y cliente.js
 * Guarda todo bajo una sola clave de localStorage para que
 * el panel de administración y la tienda de clientes vean
 * siempre la misma información.
 */
window.Store = (function () {
    const STORAGE_KEY = 'app_dashboard_data';
    const CIUDADES = ['Barranquilla', 'Bogotá', 'Bucaramanga', 'Medellín', 'Pereira', 'Santa Marta', 'Valledupar' , 'Villavicencio' , 'Cali', 'Cartagena', 'Cúcuta'];

    let appData = {
        categorias: [],
        eventos: [],
        ventas: [],
        metaVentas: 0
    };

    function generarId(prefijo) {
        return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    function formatoMoneda(valor) {
        return `$${Number(valor || 0).toLocaleString('es-CO')}`;
    }

    async function cargarDesdeJSON() {
        try {
            const respuesta = await fetch('data/inicial.json');
            if (!respuesta.ok) throw new Error('Archivo JSON no disponible.');
            appData = await respuesta.json();
        } catch (error) {
            console.warn('No se pudo cargar data/inicial.json, usando datos mínimos por defecto.', error);
            appData = { categorias: [], eventos: [], ventas: [], metaVentas: 0 };
        }
        guardar();
    }

    async function cargar() {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            try {
                appData = JSON.parse(localData);
                return appData;
            } catch (e) {
                console.error('Error al parsear app_dashboard_data', e);
            }
        }
        await cargarDesdeJSON();
        return appData;
    }

    function guardar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }

    function obtenerDatos() {
        return appData;
    }

    function reiniciar() {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }

    /* --- GESTIÓN DEL CARRITO (LÓGICA CLIENTE) --- */
    const CARRITO_KEY = 'app_carrito_data';

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    }

    function agregarAlCarrito(evento) {
        const carrito = obtenerCarrito();
        const existente = carrito.find(item => item.eventoId === evento.id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({
                eventoId: evento.id,
                nombre: evento.nombre,
                imagen: evento.imagen,
                precioUnit: evento.precio,
                ciudad: evento.ciudad,
                cantidad: 1
            });
        }
        guardarCarrito(carrito);
        return carrito;
    }

    function quitarDelCarrito(eventoId) {
        const carrito = obtenerCarrito().filter(item => item.eventoId !== eventoId);
        guardarCarrito(carrito);
        return carrito;
    }

    function cambiarCantidad(eventoId, cantidad) {
        const carrito = obtenerCarrito();
        const item = carrito.find(i => i.eventoId === eventoId);
        if (item) {
            item.cantidad = Math.max(1, cantidad);
        }
        guardarCarrito(carrito);
        return carrito;
    }

    function vaciarCarrito() {
        guardarCarrito([]);
    }

    function totalCarrito() {
        return obtenerCarrito().reduce((sum, item) => sum + (item.precioUnit * item.cantidad), 0);
    }

    function obtenerCiudades() {
        const list = JSON.parse(localStorage.getItem('ciudades') || '[]');
        if (list.length === 0) {
            const defaultCiudades = ['Barranquilla', 'Bogotá', 'Bucaramanga', 'Medellín', 'Pereira', 'Santa Marta', 'Valledupar' , 'Villavicencio' , 'Cali', 'Cartagena', 'Cúcuta'];
            const mapped = defaultCiudades.map((c, i) => ({ id: Date.now() + i, nombre: c }));
            localStorage.setItem('ciudades', JSON.stringify(mapped));
            return mapped;
        }
        return list;
    }

    function guardarCiudades(ciudades) {
        localStorage.setItem('ciudades', JSON.stringify(ciudades));
    }

    return {
        STORAGE_KEY,
        get CIUDADES() {
            return obtenerCiudades().map(c => c.nombre);
        },
        IMAGE_PLACEHOLDER: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23666666'>Sin Imagen</text></svg>",
        cargar,
        guardar,
        obtenerDatos,
        reiniciar,
        generarId,
        formatoMoneda,
        obtenerCarrito,
        guardarCarrito,
        agregarAlCarrito,
        quitarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        totalCarrito,
        obtenerCiudades,
        guardarCiudades
    };
})();