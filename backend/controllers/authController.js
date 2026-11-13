const bcrypt = require('bcryptjs');
const pool = require('../config/database');

/* =========================================
   INICIAR SESIÓN
========================================= */

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    // Mismo mensaje en ambos casos para no revelar si el correo existe
    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    const usuario = usuarios[0];

    const coincide = await bcrypt.compare(password, usuario.password);

    if (!coincide) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    res.json({
      mensaje: 'Inicio de sesión correcto',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al iniciar sesión'
    });

  }
};

module.exports = {
  login
};