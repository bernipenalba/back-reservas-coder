import * as servicesService from '../services/services.service.js';

export const renderServices = async (req, res) => {
  const services = await servicesService.getServices();
  res.render('services', { services: services.map((service) => service.toObject()) });
};

export const renderAvailability = async (req, res) => {
  const services = await servicesService.getServices({ available: 'true' });
  res.render('availability', { services: services.map((service) => service.toObject()) });
};
