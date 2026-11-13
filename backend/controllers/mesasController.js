const pool = require('../config/database');


/* =========================================
   OBTENER TODAS LAS MESAS
========================================= */

const obtenerMesas = async (req, res) => {
  try {

    const [mesas] = await pool.query(
      'SELECT * FROM mesas ORDER BY numero ASC'
    );

    res.json(mesas);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener las mesas'
    });

  }
};


/* =========================================
   OBTENER UNA MESA POR ID
========================================= */

const obtenerMesaPorId = async (req, res) => {
  try {

    const id = req.params.id;

    const [mesas] = await pool.query(
      'SELECT * FROM mesas WHERE id = ?',
      [id]
    );

    if (mesas.length === 0) {
      return res.status(404).json({
        mensaje: 'Mesa no encontrada'
      });
    }

    res.json(mesas[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener la mesa'
    });

  }
};


/* =========================================
   CREAR UNA MESA
========================================= */

const crearMesa = async (req, res) => {
  try {

    const { numero, capacidad, estado } = req.body;

    if (!numero || !capacidad || !estado) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO mesas
      (numero, capacidad, estado)
      VALUES (?, ?, ?)`,
      [numero, capacidad, estado]
    );

    const nuevaMesa = {
      id: resultado.insertId,
      numero,
      capacidad,
      estado
    };

    res.status(201).json({
      mensaje: 'Mesa creada correctamente',
      mesa: nuevaMesa
    });

  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje: 'Ya existe una mesa con ese número'
      });
    }

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al crear la mesa'
    });

  }
};


/* =========================================
   ACTUALIZAR UNA MESA
========================================= */

const actualizarMesa = async (req, res) => {
  try {

    const id = req.params.id;

    const { numero, capacidad, estado } = req.body;

    if (!numero || !capacidad || !estado) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const [mesaExistente] = await pool.query(
      'SELECT * FROM mesas WHERE id = ?',
      [id]
    );

    if (mesaExistente.length === 0) {
      return res.status(404).json({
        mensaje: 'Mesa no encontrada'
      });
    }

    await pool.query(
      `UPDATE mesas
       SET numero = ?, capacidad = ?, estado = ?
       WHERE id = ?`,
      [numero, capacidad, estado, id]
    );

    res.json({
      mensaje: 'Mesa actualizada correctamente',
      mesa: {
        id: Number(id),
        numero,
        capacidad,
        estado
      }
    });

  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje: 'Ya existe otra mesa con ese número'
      });
    }

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al actualizar la mesa'
    });

  }
};


/* =========================================
   ELIMINAR UNA MESA
========================================= */

const eliminarMesa = async (req, res) => {
  try {

    const id = req.params.id;

    const [resultado] = await pool.query(
      'DELETE FROM mesas WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Mesa no encontrada'
      });
    }

    res.json({
      mensaje: 'Mesa eliminada correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al eliminar la mesa'
    });

  }
};


/* =========================================
   EXPORTAR FUNCIONES
========================================= */

module.exports = {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa
};