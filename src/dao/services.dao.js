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

export const getAll = async () => {
  return await readServices();
};

export const getById = async (id) => {
  const services = await readServices();
  const service = services.find((service) => service.id === Number(id));
  return service ?? null;
};

export const create = async (data) => {
  const services = await readServices();

  const newService = {
    id: services.length > 0 ? services[services.length - 1].id + 1 : 1,
    ...data,
  };

  services.push(newService);
  await writeServices(services);

  return newService;
};

export const update = async (id, data) => {
  const services = await readServices();
  const index = services.findIndex((service) => service.id === Number(id));

  if (index === -1) {
    return null;
  }

  const updatedService = {
    ...services[index],
    ...data,
    id: services[index].id,
  };

  services[index] = updatedService;
  await writeServices(services);

  return updatedService;
};

export const remove = async (id) => {
  const services = await readServices();
  const index = services.findIndex((service) => service.id === Number(id));

  if (index === -1) {
    return null;
  }

  const [deletedService] = services.splice(index, 1);
  await writeServices(services);

  return deletedService;
};