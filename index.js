const jsonServer = require('json-server');
const express = require('express');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

// Middlewares personalizados
const addIdAndTimeStamps = require('./middlewares/addIdAndTimeStamps');
const loginEndpoint = require('./endpoints/login');
const registerEndpoint = require('./endpoints/register');
const itemsEndpoint = require('./endpoints/items');
const usersEndpoint = require('./endpoints/users');
const meEndpoint = require('./endpoints/me');
const uploadEndpoint = require('./endpoints/upload');
const cartEndpoint = require('./endpoints/cart');

const PORT = process.env.PORT || 3000;

// Middleware predeterminado de JSON Server
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Servir la carpeta de uploads como estática
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para agregar ID y timestamps
server.use(addIdAndTimeStamps);

// Middleware para redirigir la ruta `/users/me` a `/me`
server.use((req, res, next) => {
  if (req.url === '/users/me') {
    req.url = '/me';
  }
  next();
});

// Configuración de los endpoints con la base de datos
usersEndpoint.db = router.db;
itemsEndpoint.db = router.db;
loginEndpoint.db = router.db;
registerEndpoint.db = router.db;
meEndpoint.db = router.db;
cartEndpoint.db = router.db;

// Configuración de las rutas de los endpoints
server.use('/login', loginEndpoint);
server.use('/register', registerEndpoint);
server.use('/items', itemsEndpoint);
server.use('/users', usersEndpoint);
server.use('/me', meEndpoint);
server.use('/upload', uploadEndpoint);
server.use('/cart', cartEndpoint);

// Configuración del router principal
server.use(router);

// Iniciar el servidor
server.listen(PORT, () => {
  console.log('JSON Server is running on http://localhost:' + PORT);
});
