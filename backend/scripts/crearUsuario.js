require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function crearUsuario() {

  const [nombre, email, password, rol = 'Administrador'] =
    process.argv.slice(2);

  if (!nombre || !email || !password) {
    console.log('Uso: node scripts/crearUsuario.js "Nombre" correo@ejemplo.com contraseña [rol]');
    process.exit(1);
  }

  try {

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email.trim().toLowerCase(), hash, rol]
    );

    console.log(`Usuario creado: ${email}`);

  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Ya existe un usuario con ese correo');
    } else {
      console.error('Error:', error.message);
    }

  } finally {

    await pool.end();

  }
}

crearUsuario();