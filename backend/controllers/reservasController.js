const pool = require('../config/database');


/* =========================================
   OBTENER TODAS LAS RESERVAS
========================================= */

const obtenerReservas = async (req, res) => {
  try {
    const [reservas] = await pool.query(`
      SELECT 
        reservas.id,
        reservas.cliente,
        reservas.telefono,
        reservas.fecha,
        reservas.hora,
        reservas.personas,
        reservas.estado,
        mesas.id AS mesa_id,
        mesas.numero AS mesa_numero
      FROM reservas
      INNER JOIN mesas ON reservas.mesa_id = mesas.id
      ORDER BY reservas.fecha ASC, reservas.hora ASC
    `);

    res.json(reservas);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener las reservas'
    });
  }
};


/* =========================================
   OBTENER RESERVA POR ID
========================================= */

const obtenerReservaPorId = async (req, res) => {
  try {
    const id = req.params.id;

    const [reservas] = await pool.query(`
      SELECT 
        reservas.id,
        reservas.cliente,
        reservas.telefono,
        reservas.fecha,
        reservas.hora,
        reservas.personas,
        reservas.estado,
        mesas.id AS mesa_id,
        mesas.numero AS mesa_numero
      FROM reservas
      INNER JOIN mesas ON reservas.mesa_id = mesas.id
      WHERE reservas.id = ?
    `, [id]);

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    res.json(reservas[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener la reserva'
    });
  }
};


/* =========================================
   CREAR RESERVA
========================================= */

const crearReserva = async (req, res) => {
  try {
    const {
      cliente,
      telefono,
      fecha,
      hora,
      personas,
      mesa_id,
      estado
    } = req.body;

    if (
      !cliente ||
      !telefono ||
      !fecha ||
      !hora ||
      !personas ||
      !mesa_id ||
      !estado
    ) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const [mesas] = await pool.query(
      'SELECT * FROM mesas WHERE id = ?',
      [mesa_id]
    );

    if (mesas.length === 0) {
      return res.status(404).json({
        mensaje: 'La mesa seleccionada no existe'
      });
    }

    const mesa = mesas[0];

    if (
      estado === 'Confirmada' &&
      mesa.estado !== 'Disponible'
    ) {
      return res.status(400).json({
        mensaje: `La Mesa ${mesa.numero} no está disponible`
      });
    }

    const [resultado] = await pool.query(`
      INSERT INTO reservas
      (cliente, telefono, fecha, hora, personas, mesa_id, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente,
      telefono,
      fecha,
      hora,
      personas,
      mesa_id,
      estado
    ]);

    if (estado === 'Confirmada') {
      await pool.query(
        `UPDATE mesas
         SET estado = 'Reservada'
         WHERE id = ?`,
        [mesa_id]
      );
    }

    res.status(201).json({
      mensaje: 'Reserva creada correctamente',
      reserva: {
        id: resultado.insertId,
        cliente,
        telefono,
        fecha,
        hora,
        personas,
        mesa_id,
        estado
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: 'Error al crear la reserva'
    });
  }
};


/* =========================================
   ACTUALIZAR RESERVA
========================================= */

const actualizarReserva = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      cliente,
      telefono,
      fecha,
      hora,
      personas,
      mesa_id,
      estado
    } = req.body;

    if (
      !cliente ||
      !telefono ||
      !fecha ||
      !hora ||
      !personas ||
      !mesa_id ||
      !estado
    ) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const [reservas] = await pool.query(
      'SELECT * FROM reservas WHERE id = ?',
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reservaAnterior = reservas[0];

    const [mesas] = await pool.query(
      'SELECT * FROM mesas WHERE id = ?',
      [mesa_id]
    );

    if (mesas.length === 0) {
      return res.status(404).json({
        mensaje: 'La mesa seleccionada no existe'
      });
    }

    const mesaNueva = mesas[0];

    if (
      estado === 'Confirmada' &&
      Number(mesa_id) !== Number(reservaAnterior.mesa_id) &&
      mesaNueva.estado !== 'Disponible'
    ) {
      return res.status(400).json({
        mensaje: `La Mesa ${mesaNueva.numero} no está disponible`
      });
    }

    await pool.query(`
      UPDATE reservas
      SET cliente = ?,
          telefono = ?,
          fecha = ?,
          hora = ?,
          personas = ?,
          mesa_id = ?,
          estado = ?
      WHERE id = ?
    `, [
      cliente,
      telefono,
      fecha,
      hora,
      personas,
      mesa_id,
      estado,
      id
    ]);


    /* Liberar mesa anterior si se cambió */

    if (
      Number(reservaAnterior.mesa_id) !== Number(mesa_id)
    ) {
      await pool.query(
        `UPDATE mesas
         SET estado = 'Disponible'
         WHERE id = ?`,
        [reservaAnterior.mesa_id]
      );
    }


    /* Actualizar estado de la mesa nueva */

    if (estado === 'Confirmada') {
      await pool.query(
        `UPDATE mesas
         SET estado = 'Reservada'
         WHERE id = ?`,
        [mesa_id]
      );
    }

    if (estado === 'Cancelada') {
      await pool.query(
        `UPDATE mesas
         SET estado = 'Disponible'
         WHERE id = ?`,
        [mesa_id]
      );
    }


    res.json({
      mensaje: 'Reserva actualizada correctamente'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: 'Error al actualizar la reserva'
    });
  }
};


/* =========================================
   ELIMINAR RESERVA
========================================= */

const eliminarReserva = async (req, res) => {
  try {
    const id = req.params.id;

    const [reservas] = await pool.query(
      'SELECT * FROM reservas WHERE id = ?',
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    const reserva = reservas[0];

    await pool.query(
      'DELETE FROM reservas WHERE id = ?',
      [id]
    );

    await pool.query(
      `UPDATE mesas
       SET estado = 'Disponible'
       WHERE id = ?`,
      [reserva.mesa_id]
    );

    res.json({
      mensaje: 'Reserva eliminada correctamente'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: 'Error al eliminar la reserva'
    });
  }
};


module.exports = {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva
};