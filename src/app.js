import express from 'express';
import {logger} from './middlewares/logger.middleware.js';
import servicesRouter from './routes/services.router.js';

export const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {  
    res.status(200).json({ 
      status: 'success',
      message: 'API del Sistema de Turnos y Reservas' 
    });
});

app.use("/api/services", servicesRouter); //cuando se hace un request a /api/services, se delega la responsabilidad al router de services.routes.js

  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: `La ruta ${req.method} ${req.url} no existe`
    });
  });


//DE LAS ACTIVIDADES DE CLASE, COMENTADO PARA QUE FUNCIONE EL SEGUNDO ENTREGABLE
/*

Este array y estas rutas manuales duplicaban lo que ahora hace
   el ServiceManager + services.router.js, y pisaban esas rutas
   (Express nunca llegaba a usarlas porque el router ya respondía
   antes). Además, la ruta GET /api/services/:id tenía un bug:
   declaraba :id pero leía req.params.sid, que siempre daba undefined.
   Lo dejo acá comentado por si lo necesitás de referencia para
   el proyecto final, pero no debe estar activo en esta entrega.

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

const services = [
  { id: 1,
    name: 'Consulta médica general',
    duration: 30,
    price: 1500,
    category: 'salud',
    available: true
  },
  { id: 2,
    name: 'Sesion fisioterapia',
    duration: 45,
    price: 2000,
    category: 'rehabilitacion',
    available: true
  }
];

app.get('/api/services', (req, res) => {
  const { category, available } = req.query;
  let filteredServices = services;

  if (category) {
    filteredServices = services.filter(service => service.category === category);
  }

  if (available) {
    filteredServices = filteredServices.filter(
      (service) => service.available === (available === 'true')
    );
  }
 
  res.status(200).json({
    status: 'success',
    payload: filteredServices
  });
});

app.get('/api/services/:id', (req, res) => {
  const { sid } = req.params;
  
  const service = services.find(service => service.id === Number(sid));

  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: 'Servicio no encontrado'
    });
  }

  res.status(200).json({
    status: 'success',
    payload: service
  });
});

app.post('/api/services', (req, res) => {
  const { name, duration, price, category, available } = req.body;
  
  if (!name || !duration || !price || !category) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan datos obligatorios'
    });
  }

  const newService = {
    id: services.length + 1,
    name,
    duration,
    price,
    category,
    available: available ?? true
  };

  services.push(newService);
 
  res.status(201).json({
    status: 'success',
    payload: newService
  });
});

app.put('/api/services/:sid', (req, res) => {
  const { sid } = req.params;
  const { name, duration, price, category, available } = req.body;

  const serviceIndex = services.findIndex(service => service.id === Number(sid));

  if (serviceIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Servicio no encontrado'
    });
  }

  const updatedService = {
    ...services[serviceIndex],
    ...req.body,
    id: services[serviceIndex].id
  };

  services[serviceIndex] = updatedService;    

  res.status(200).json({
    status: 'success',
    payload: updatedService
  });
});

app.delete('/api/services/:sid', (req, res) => {
  const { sid } = req.params;

  const serviceIndex = services.findIndex((service) => service.id === Number(sid));

  if (serviceIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Servicio no encontrado'
    }); 
  }

  const deletedService = services.splice(serviceIndex, 1);

  res.status(200).json({
    status: 'success',
    payload: deletedService[0]
  });
}); 
*/
