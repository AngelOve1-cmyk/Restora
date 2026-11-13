require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mesasRoutes = require('./routes/mesasRoutes');
const reservasRoutes = require('./routes/reservasRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor de Restora funcionando');
});

app.use('/api/mesas', mesasRoutes);
app.use('/api/reservas', reservasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de Restora ejecutándose en http://localhost:${PORT}`);
});