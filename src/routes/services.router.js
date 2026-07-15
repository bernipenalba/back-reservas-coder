import {Router} from 'express';
import { ServiceManager } from '../managers/ServiceManager.js';

const router = Router();
const serviceManager = new ServiceManager();

// GET /api/services  (con filtros opcionales ?category= y ?available=)
router.get('/', (req, res) => {
  const { category, available } = req.query;
  const services = serviceManager.getServices({ category, available });

  res.status(200).json({
    status: 'success',
    payload: services
  });
});

// GET /api/services/:sid
router.get('/:sid', (req, res) => {
  const { sid } = req.params;
  const service = serviceManager.getServiceById(Number(sid));

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

// POST /api/services
router.post('/', (req, res) => {
  try {
    const newService = serviceManager.addService(req.body);
    res.status(201).json({
      status: 'success',
      payload: newService
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// PUT /api/services/:sid
router.put('/:sid', (req, res) => {
  const { sid } = req.params;
  const updatedService = serviceManager.updateService(Number(sid), req.body);

  if (!updatedService) {
    return res.status(404).json({
      status: 'error',
      message: 'Servicio no encontrado'
    });
  }

  res.status(200).json({
    status: 'success',
    payload: updatedService
  });
});

// DELETE /api/services/:sid
router.delete('/:sid', (req, res) => {
  const { sid } = req.params;
  const deletedService = serviceManager.deleteService(Number(sid));

  if (!deletedService) {
    return res.status(404).json({
      status: 'error',
      message: 'Servicio no encontrado'
    });
  }

  res.status(200).json({
    status: 'success',
    payload: deletedService
  });
});

export default router;


/*router.get("/", (req, res) => { //cuando se hace un request a /api/services, se delega la responsabilidad al router de services.routes.js
    const { category } = req.query;

    let filteredServices = services;

    if (category) {
        filteredServices = services.filter(
            (service) => service.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    if (filteredServices.length === 0) {
        res.status(404).json({
            status: 'error',
            message: 'No se encontraron servicios para la categoría especificada'
        });
    }

    res.status(200).json({
        status: 'success',
        payload: filteredServices
    });
});*/

