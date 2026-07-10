/**
 * components.js
 * Web Components reutilizables construidos con Shadow DOM.
 * - <app-modal>   : modal genérico con slot, usado para formularios y detalles Operations.
 * - <evento-card> : tarjeta de evento para la vista pública de clientes.
 */

class AppModal extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host { all: initial; }
                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 15, 20, 0.55);
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .overlay.visible { display: flex; }
                .box {
                    background: #ffffff;
                    border-radius: 12px;
                    width: min(92vw, 480px);
                    max-height: 88vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                    animation: aparecer 0.18s ease-out;
                }
                @keyframes aparecer {
                    from { transform: translateY(-12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .head h3 { margin: 0; font-size: 1.15rem; color: #1e293b; font-weight: 600; }
                .btn-close {
                    background: none; border: none; font-size: 1.25rem; color: #64748b;
                    cursor: pointer; padding: 0.2rem; line-height: 1; transition: color 0.2s;
                }
                .btn-close:hover { color: #0f172a; }
                .body { padding: 1.25rem; }
            </style>
            <div class="overlay">
                <div class="box">
                    <div class="head">
                        <h3 id="modal-titulo"></h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
        this._overlay = shadow.querySelector('.overlay');
        this._tituloEl = shadow.querySelector('#modal-titulo');
        shadow.querySelector('.btn-close').addEventListener('click', () => this.cerrar());
        this._overlay.addEventListener('click', (e) => { if (e.target === this._overlay) this.cerrar(); });
    }

    connectedCallback() {
        if (this.hasAttribute('titulo')) {
            this._tituloEl.textContent = this.getAttribute('titulo');
        }
    }

    abrir() { this._overlay.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    cerrar() { this._overlay.classList.remove('visible'); document.body.style.overflow = ''; }
}
customElements.define('app-modal', AppModal);


class EventoCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host { display: block; }
                .card {
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
                .img-container { position: relative; width: 100%; pt: 56.25%; aspect-ratio: 16/9; background: #e2e8f0; }
                .img-container img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
                .badge {
                    position: absolute; top: 12px; left: 12px; background: rgba(111, 0, 0, 0.9);
                    color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
                }
                .content { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
                .content h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b; line-height: 1.4; }
                .meta { font-size: 0.85rem; color: #64748b; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem; }
                .precio { font-size: 1.2rem; font-weight: 700; color: #6f0000; margin-top: auto; padding-top: 0.75rem; }
                .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
                button {
                    padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
                    transition: all 0.2s; border: none;
                }
                .btn-detalle { background: #f1f5f9; color: #334155; }
                .btn-detalle:hover { background: #e2e8f0; }
                .btn-carrito { background: #6f0000; color: #ffffff; }
                .btn-carrito:hover { background: #b90000; }
            </style>
            <div class="card">
                <div class="img-container">
                    <span class="badge"></span>
                    <img>
                </div>
                <div class="content">
                    <h4></h4>
                    <div class="meta ciudad"></div>
                    <div class="meta fecha"></div>
                    <span class="precio"></span>
                </div>
                <div class="actions">
                    <button class="btn-detalle">Ver detalle</button>
                    <button class="btn-carrito">Agregar</button>
                </div>
            </div>
        `;
        shadow.querySelector('.btn-detalle').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('ver-detalle', { detail: this._evento, bubbles: true, composed: true }));
        });
        shadow.querySelector('.btn-carrito').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('agregar-carrito', { detail: this._evento, bubbles: true, composed: true }));
        });
        this._shadow = shadow;
    }

    set evento(data) {
        this._evento = data;
        const s = this._shadow;
        
        // Carga dinámica limpia de imágenes (Base64 o ruta local sin interrupciones forzadas)
        s.querySelector('img').src = data.imagen ? data.imagen : Store.IMAGE_PLACEHOLDER;
        s.querySelector('img').onerror = function () { 
            this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23666666'>Imagen no encontrada</text></svg>"; 
        };
        
        s.querySelector('.badge').textContent = data.categoria;
        s.querySelector('h4').textContent = data.nombre;
        s.querySelector('.ciudad').textContent = `📍 ${data.ciudad}`;
        s.querySelector('.fecha').textContent = `🗓️ ${data.fecha}  •  ${data.hora}`;
        s.querySelector('.precio').textContent = `$${Number(data.precio).toLocaleString('es-CO')}`;
    }

    get evento() { return this._evento; }
}
customElements.define('evento-card', EventoCard);
