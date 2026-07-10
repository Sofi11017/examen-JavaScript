/**
 * carrito-compartido.js
 * Maneja el modal del carrito, el checkout y la actualización del contador,
 * compartido entre index.html (listado) y detalle.html (ficha de evento).
 */
(function () {
    const modalCarrito = document.getElementById('modal-carrito');
    const modalCheckout = document.getElementById('modal-checkout');
    const btnCarrito = document.getElementById('btn-carrito');
    const contador = document.getElementById('carrito-contador');
    const listaEl = document.getElementById('carrito-lista');
    const totalEl = document.getElementById('carrito-total-valor');
    const formCheckout = document.getElementById('form-checkout');

    function actualizarContador() {
        const carrito = Store.obtenerCarrito();
        const cantidadTotal = carrito.reduce((s, i) => s + i.cantidad, 0);
        contador.textContent = cantidadTotal;
        contador.style.display = cantidadTotal > 0 ? 'inline-flex' : 'none';
    }

    function renderCarrito() {
        const carrito = Store.obtenerCarrito();
        if (carrito.length === 0) {
            listaEl.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío. ¡Agrega algún evento!</p>';
        } else {
            listaEl.innerHTML = carrito.map(item => `
                <div class="carrito-item">
                    <img src="${item.imagen}" onerror="this.src='https://picsum.photos/300/200'">
                    <div class="carrito-item-info">
                        <h4>${item.nombre}</h4>
                        <span>${Store.formatoMoneda(item.precioUnit)} c/u</span>
                        <div class="carrito-item-cantidad">
                            <button class="btn-cant" data-id="${item.eventoId}" data-op="restar">-</button>
                            <span>${item.cantidad}</span>
                            <button class="btn-cant" data-id="${item.eventoId}" data-op="sumar">+</button>
                        </div>
                    </div>
                    <div class="carrito-item-derecha">
                        <strong>${Store.formatoMoneda(item.precioUnit * item.cantidad)}</strong>
                        <button class="btn-quitar" data-id="${item.eventoId}" title="Quitar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`).join('');
        }
        totalEl.textContent = Store.formatoMoneda(Store.totalCarrito());
        actualizarContador();

        listaEl.querySelectorAll('.btn-cant').forEach(btn => {
            btn.addEventListener('click', () => {
                const carrito = Store.obtenerCarrito();
                const item = carrito.find(i => i.eventoId === btn.dataset.id);
                if (!item) return;
                const nuevaCantidad = btn.dataset.op === 'sumar' ? item.cantidad + 1 : item.cantidad - 1;
                if (nuevaCantidad <= 0) {
                    Store.quitarDelCarrito(item.eventoId);
                } else {
                    Store.cambiarCantidad(item.eventoId, nuevaCantidad);
                }
                renderCarrito();
            });
        });
        listaEl.querySelectorAll('.btn-quitar').forEach(btn => {
            btn.addEventListener('click', () => {
                Store.quitarDelCarrito(btn.dataset.id);
                renderCarrito();
            });
        });
    }

    btnCarrito.addEventListener('click', () => {
        renderCarrito();
        modalCarrito.abrir();
    });

    document.getElementById('btn-comprar').addEventListener('click', () => {
        const carrito = Store.obtenerCarrito();
        if (carrito.length === 0) {
            alert('Tu carrito está vacío. Agrega al menos un evento antes de comprar.');
            return;
        }
        modalCarrito.cerrar();
        modalCheckout.abrir();
    });

    formCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();
        const carrito = Store.obtenerCarrito();
        if (carrito.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        const cliente = {
            identificacion: document.getElementById('chk-identificacion').value.trim(),
            nombre: document.getElementById('chk-nombre').value.trim(),
            direccion: document.getElementById('chk-direccion').value.trim(),
            telefono: document.getElementById('chk-telefono').value.trim(),
            email: document.getElementById('chk-email').value.trim()
        };

        const items = carrito.map(item => ({
            eventoId: item.eventoId,
            nombre: item.nombre,
            precioUnit: item.precioUnit,
            cantidad: item.cantidad,
            subtotal: item.precioUnit * item.cantidad
        }));
        const total = items.reduce((s, i) => s + i.subtotal, 0);
        const idVenta = `V-${Math.floor(1000 + Math.random() * 9000)}`;

        const appData = await Store.cargar();
        appData.ventas.push({
            id: idVenta,
            fecha: new Date().toISOString(),
            ciudad: carrito[0].ciudad || 'N/A',
            cliente,
            items,
            total
        });
        Store.guardar();
        Store.vaciarCarrito();

        formCheckout.reset();
        modalCheckout.cerrar();
        actualizarContador();

        alert(`¡Compra realizada con éxito! 🎟️\nTu boleta asignada es: ${idVenta}\nTotal pagado: ${Store.formatoMoneda(total)}`);
    });

    window.addEventListener('carritoActualizado', actualizarContador);
    actualizarContador();
})();
