Conciertos Conectados - Pagina web de Venta de Entradas

¡Bienvenido al repositorio de Conciertos Conectados! Esta es una solución web integral diseñada para 
expandir el alcance de la organización de eventos, permitiendo a los usuarios adquirir entradas 
para sus conciertos favoritos de forma fácil, rápida y segura, y ofreciendo a los administradores 
un control total sobre la gestión del negocio.



Descripción del Proyecto

El proyecto consiste en una aplicación web interactiva desarrollada bajo el enfoque de Single Page 
Application (SPA) utilizando tecnologías nativas de la web. La plataforma se divide en dos frentes de 
trabajo principales:

Front de Eventos (Clientes): Una interfaz pública, intuitiva y atractiva para que los usuarios busquen
eventos por ciudad, categoría o palabra clave, vean los detalles de cada concierto y gestionen sus 
compras a través de un carrito integrado.

Front de Administración: Un panel privado y seguro que requiere autenticación para que el equipo de 
Conciertos Conectados pueda gestionar el catálogo de categorías, eventos y auditar el historial de ventas 
en tiempo real.



Tecnologías Utilizadas

Para garantizar un rendimiento óptimo, modularidad y facilidad de mantenimiento, el proyecto se ha construido 
utilizando exclusivamente tecnologías nativas (Vanilla Web Stack):

HTML5: Estructuración semántica de las vistas y componentes.

CSS3: Diseño responsivo, moderno y estilizado utilizando metodologías como BEM y sistemas de diseño como 
CSS Grid y Flexbox.

JavaScript (ES6+): Lógica de negocio, manejo del estado y dinamismo de la aplicación.

Web Components: Arquitectura basada en componentes reutilizables y encapsulados (Shadow DOM) para modularizar 
la interfaz (ej. botones, tarjetas de eventos, modales).

Web Storage (localStorage): Persistencia de datos local para simular una base de datos en tiempo real 
(Categorías, Eventos, Ventas y Carrito).



Características Principales

-Front de Administración
Login de Acceso: Restricción de seguridad.

Credenciales por defecto: admin@mail.com / 123456.

Dashboard Central: Panel de control con menú de navegación modular.

Módulo de Categorías: CRUD completo (Crear, Leer, Actualizar, Eliminar) con ventanas modales para el registro de nombres
y descripciones.

Módulo de Eventos: Gestión del catálogo de conciertos (Código, nombre, categoría, precio, fecha, hora, ciudad y URL de imagen).

Módulo de Ventas: Historial de compras ordenadas cronológicamente (de la más reciente a la más antigua), con detalle 
del cliente, ciudad, total pagado y desglose de entradas adquiridas.

-Front de Eventos (Clientes)
Catálogo Público: Visualización de conciertos disponibles con filtros avanzados simultáneos (Buscador por palabra clave, 
filtro por ciudad y por categoría).

Detalle del Producto: Vista extendida con información completa del concierto y navegación fluida de regreso.

Carrito de Compras Flotante (Modal): Control de entradas seleccionadas, cálculo automático del total de la compra y 
formulario de checkout (Identificación, nombre, dirección, teléfono, e-mail y fecha automática).

Sistema de Feedback: Notificaciones visuales de éxito o error al realizar cualquier acción 
(agregar al carrito, login incorrecto, campos vacíos, compra exitosa).


Borrador del diseño de la pagina web

<img width="899" height="1599" alt="Borrador" src="https://github.com/user-attachments/assets/2ed9e5d6-67b2-4286-9750-f74336c86602" />
<img width="899" height="1599" alt="Borrador2" src="https://github.com/user-attachments/assets/fc32d245-47d4-4dc3-ac21-cb0681227851" />
<img width="899" height="1599" alt="Borrador3" src="https://github.com/user-attachments/assets/a6acd51b-1785-4cd4-8e62-1fdb2d8ad6c4" />