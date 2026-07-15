import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICES_PATH = path.join(__dirname, '..', 'data', 'services.json');

const REQUIRED_FIELDS = ['name', 'description', 'duration', 'price', 'category', 'available'];

export class ServiceManager {
  constructor() {
    const rawData = fs.readFileSync(SERVICES_PATH, 'utf-8');
    this.services = JSON.parse(rawData);
  }

  // AGREGADO: acepta filtros opcionales por category y available (vienen de req.query)
  getServices(filters = {}) {
    let result = [...this.services];

    if (filters.category) {
      result = result.filter(
        (service) => service.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.available !== undefined) {
      const isAvailable = filters.available === 'true';
      result = result.filter((service) => service.available === isAvailable);
    }

    return result;
  }

  getServiceById(id) {
    const service = this.services.find((service) => service.id === id);
    return service ?? null;
  }

  addService(serviceData) {
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !(field in serviceData)
    );

    if (missingFields.length > 0) {
      throw new Error(
        `No se pudo agregar el servicio: faltan los campos ${missingFields.join(', ')}`
      );
    }

    const newId = this.services.reduce((maxId, service) => Math.max(maxId, service.id), 0) + 1;

    const newService = {
      id: newId,
      name: serviceData.name,
      description: serviceData.description,
      duration: serviceData.duration,
      price: serviceData.price,
      category: serviceData.category,
      available: serviceData.available,
    };

    this.services.push(newService);
    return newService;
  }

  updateService(id, updatedData) {
    const index = this.services.findIndex((service) => service.id === id);
    if (index === -1) return null;

    const { id: _ignoredId, ...safeData } = updatedData;

    this.services[index] = { ...this.services[index], ...safeData };
    return this.services[index];
  }

  deleteService(id) {
    const index = this.services.findIndex((service) => service.id === id);
    if (index === -1) return null;

    const [deletedService] = this.services.splice(index, 1);
    return deletedService;
  }
}
