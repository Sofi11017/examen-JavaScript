document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const errorMessageDiv = document.getElementById('errorMessage');

    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';

    // La validación ocurre ANTES de redirigir.
    if (correo === "admin@mail.com" && password === "123456") {
        sessionStorage.setItem('admin_autenticado', 'true');
        alert("¡Inicio de sesión exitoso! Bienvenido, Administrador.");
        window.location.href = "admin.html";
    } else {
        errorMessageDiv.textContent = "Usuario o contraseña incorrectos. Inténtalo de nuevo.";
        errorMessageDiv.style.display = 'block';
    }
});
