import * as servicesService from '../services/services.service.js';
import { getIO } from '../config/socket.config.js';

export const getServices = async (req, res) => {
  try {
    const { category, available, page = 1, limit = 10, sortBy, order } = req.query;
    const { services, pagination } = await servicesService.getServices({
      category,
      available,
      page,
      limit,
      sortBy,
      order,
    });

    res.status(200).json({
      status: 'success',
      payload: services,
      ...(pagination && {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        hasPrevPage: pagination.hasPrevPage,
        hasNextPage: pagination.hasNextPage,
      }),
    });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);
    res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

const notifyAvailabilityChanged = async () => {
  const { services: availableServices } = await servicesService.getServices({ available: 'true' });
  getIO().emit('servicesUpdated', availableServices.map((service) => service.toObject()));
};

export const createService = async (req, res) => {
  try {
    const newService = await servicesService.createService(req.body);
    await notifyAvailabilityChanged();
    res.status(201).json({ status: 'success', payload: newService });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { sid } = req.params;
    const updatedService = await servicesService.updateService(sid, req.body);
    await notifyAvailabilityChanged();
    res.status(200).json({ status: 'success', payload: updatedService });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { sid } = req.params;
    const deletedService = await servicesService.deleteService(sid);
    await notifyAvailabilityChanged();
    res.status(200).json({ status: 'success', payload: deletedService });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};
