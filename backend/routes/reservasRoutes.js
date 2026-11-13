const express = require('express');

const router = express.Router();

const {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva
} = require('../controllers/reservasController');

router.get('/', obtenerReservas);
router.get('/:id', obtenerReservaPorId);
router.post('/', crearReserva);
router.put('/:id', actualizarReserva);
router.delete('/:id', eliminarReserva);

module.exports = router;