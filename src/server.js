import { createServer } from 'node:http';
import { app } from './app.js';
import config from './config/env.config.js';
import { connectDB } from './config/database.config.js';
import { initSocket } from './config/socket.config.js';

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
  });
};

startServer();
