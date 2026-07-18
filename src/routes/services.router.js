import { Router } from 'express';
import {
  getServices,
  getServiceById,
  addService,
  updateService,
  deleteService,
} from '../managers/ServiceManager.js';

const router = Router();

// GET /api/services  (con filtros opcionales ?category= y ?available=)
router.get('/', async (req, res) => {
  const { category, available } = req.query;
  const services = await getServices({ category, available });

  res.status(200).json({ status: 'success', payload: services });
});

// GET /api/services/:sid
router.get('/:sid', async (req, res) => {
  const { sid } = req.params;
  const service = await getServiceById(sid);

  if (!service) {
    return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
  }

  res.status(200).json({ status: 'success', payload: service });
});

// POST /api/services
router.post('/', async (req, res) => {
  const result = await addService(req.body);
  const statusCode = result.status === 'error' ? 400 : 201;
  res.status(statusCode).json(result);
});

// PUT /api/services/:sid
router.put('/:sid', async (req, res) => {
  const { sid } = req.params;
  const result = await updateService(sid, req.body);
  const statusCode = result.status === 'error' ? 404 : 200;
  res.status(statusCode).json(result);
});

// DELETE /api/services/:sid
router.delete('/:sid', async (req, res) => {
  const { sid } = req.params;
  const result = await deleteService(sid);
  const statusCode = result.status === 'error' ? 404 : 200;
  res.status(statusCode).json(result);
});

export default router;
