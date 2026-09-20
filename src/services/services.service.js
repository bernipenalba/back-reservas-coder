import * as servicesRepository from '../repositories/services.repository.js';

export const getServices = async (filters = {}) => {
  const { category, available, page, limit, sortBy, order } = filters;

  const filter = {};

  if (category) {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (available !== undefined) {
    filter.available = available === 'true';
  }

  const sort = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : undefined;

  if (page === undefined) {
    const services = await servicesRepository.getAll(filter, { sort });
    return { services, pagination: null };
  }

  const currentPage = Number(page) || 1;
  const currentLimit = Number(limit) || 10;
  const skip = (currentPage - 1) * currentLimit;

  const [services, total] = await Promise.all([
    servicesRepository.getAll(filter, { skip, limit: currentLimit, sort }),
    servicesRepository.count(filter),
  ]);

  const totalPages = Math.ceil(total / currentLimit) || 0;

  return {
    services,
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
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