import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engine } from 'express-handlebars';
import { logger } from './middlewares/logger.middleware.js';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);

app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API del Sistema de Turnos y Reservas'
    });
});

app.use("/api/services", servicesRouter); //cuando se hace un request a /api/services, se delega la responsabilidad al router de services.routes.js
app.use("/api/bookings", bookingsRouter); //cuando se hace un request a /api/bookings, se delega la responsabilidad al router de bookings.router.js
app.use("/views", viewsRouter); //cuando se hace un request a /views, se delega la responsabilidad al router de views.router.js

  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: `La ruta ${req.method} ${req.url} no existe`
    });
  });
