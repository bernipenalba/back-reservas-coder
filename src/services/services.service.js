import * as servicesRepository from '../repositories/services.repository.js';

export const getServices = async (filters = {}) => {
  let services = await servicesRepository.getAll();

  if (filters.category) {
    services = services.filter(
      (service) => service.category.toLowerCase() === filters.category.toLowerCase()
    );
  }

  if (filters.available !== undefined) {
    const isAvailable = filters.available === 'true';
    services = services.filter((service) => service.available === isAvailable);
  }

  return services;
};

export const getServiceById = async (id) => {
  const service = await servicesRepository.getById(id);

  if (!service) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return service;
};

export const createService = async (data) => {
  const { name, description, duration, price, category, available } = data;

  if (!name || !description || !duration || !price || !category) {
    const error = new Error('Faltan campos obligatorios');
    error.statusCode = 400;
    throw error;
  }

  return await servicesRepository.create({
    name,
    description,
    duration,
    price,
    category,
    available: available ?? true,
  });
};

export const updateService = async (id, data) => {
  const updatedService = await servicesRepository.update(id, data);

  if (!updatedService) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return updatedService;
};

export const deleteService = async (id) => {
  const deletedService = await servicesRepository.remove(id);

  if (!deletedService) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return deletedService;
};