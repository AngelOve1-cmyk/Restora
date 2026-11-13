const API_AUTH = 'http://localhost:3000/api/auth';
const CLAVE_SESION = 'restoraUsuario';

function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch (error) {
    return null;
  }
}

const formLogin = document.getElementById('loginForm');

if (formLogin) {

  /* ---------- PÁGINA DE LOGIN ---------- */

  if (obtenerSesion()) {
    window.location.href = 'dashboard.html';
  }

  const errorLogin = document.getElementById('loginError');
  const btnLogin = document.getElementById('btnLogin');

  function mostrarError(mensaje) {
    errorLogin.textContent = mensaje;
    errorLogin.hidden = false;
  }

  formLogin.addEventListener('submit', async (e) => {

    e.preventDefault();

    errorLogin.hidden = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btnLogin.disabled = true;

    try {

      const respuesta = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mostrarError(resultado.mensaje || 'No se pudo iniciar sesión');
        return;
      }

      localStorage.setItem(CLAVE_SESION, JSON.stringify(resultado.usuario));

      window.location.href = 'dashboard.html';

    } catch (error) {

      console.error(error);
      mostrarError('No se pudo conectar con el servidor');

    } finally {

      btnLogin.disabled = false;

    }

  });

} else {

  /* ---------- PÁGINAS PROTEGIDAS ---------- */

  const sesion = obtenerSesion();

  if (!sesion) {
    window.location.href = 'login.html';
  } else {

    const nombreUsuario = document.getElementById('nombreUsuario');

    if (nombreUsuario) {
      nombreUsuario.textContent = sesion.nombre;
    }

  }

  const btnCerrarSesion = document.getElementById('btnCerrarSesion');

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(CLAVE_SESION);
      window.location.href = 'login.html';
    });
  }

}