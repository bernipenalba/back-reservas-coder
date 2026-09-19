import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('Cliente conectado por socket');

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  return io;
};

export const getIO = () => io;
