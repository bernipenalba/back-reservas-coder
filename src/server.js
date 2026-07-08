import http from 'http'; //por ahora
import config from './config/env.config.js';
//import services
//import sendResponse


const server = http.createServer((req, res) => {
    // Necesito el metodo, es decir, que tipo de operacion va a realizar el cleinte. GET, PUT estc
    //Necesito la url, donde quiere ir el cliente, que recurso quiere obtener. Ej, el servicio de creacion de reservas, el servicio de creacion de turnos, etc.

    const { method, url } = req;
    console.log(`Solicitud recibida: ${method} ${url}`);

});

/*import {app} from './app.js';

console.log('Aplicación inicializada');
console.log(app);*/
