const express = require('express');

const router = express.Router();

const {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa
} = require('../controllers/mesasController');

router.get('/', obtenerMesas);

router.get('/:id', obtenerMesaPorId);

router.post('/', crearMesa);

router.put('/:id', actualizarMesa);

router.delete('/:id', eliminarMesa);

module.exports = router;