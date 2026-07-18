import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'data', 'services.json');

const readServices = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeServices = async (services) => {
  await fs.writeFile(filePath, JSON.stringify(services, null, 2));
};

export const getServices = async (filters = {}) => {
  let services = await readServices();

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
  const services = await readServices();
  const service = services.find((service) => service.id === Number(id));
  return service ?? null;
};

export const addService = async (serviceData) => {
  const { name, description, duration, price, category, available } = serviceData;

  if (!name || !description || !duration || !price || !category) {
    return { status: 'error', message: 'Faltan campos obligatorios' };
  }

  const services = await readServices();

  const newService = {
    id: services.length > 0 ? services[services.length - 1].id + 1 : 1,
    name,
    description,
    duration,
    price,
    category,
    available: available ?? true,
  };

  services.push(newService);
  await writeServices(services);

  return { status: 'success', payload: newService };
};

export const updateService = async (id, serviceData) => {
  const services = await readServices();
  const index = services.findIndex((service) => service.id === Number(id));

  if (index === -1) {
    return { status: 'error', message: 'Servicio no encontrado' };
  }

  const updatedService = {
    ...services[index],
    ...serviceData,
    id: services[index].id,
  };

  services[index] = updatedService;
  await writeServices(services);

  return { status: 'success', payload: updatedService };
};

export const deleteService = async (id) => {
  const services = await readServices();
  const index = services.findIndex((service) => service.id === Number(id));

  if (index === -1) {
    return { status: 'error', message: 'Servicio no encontrado' };
  }

  const [deletedService] = services.splice(index, 1);
  await writeServices(services);

  return { status: 'success', payload: deletedService };
};
