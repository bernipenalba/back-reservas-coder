import config from './config/env.config.js';
import { ServiceManager } from './managers/ServiceManager.js';

console.log(`Aplicación inicializada en modo "${config.nodeEnv}" (puerto configurado: ${config.port})`);

const serviceManager = new ServiceManager();

console.log('\n--- getServices() ---');
console.log(serviceManager.getServices());

console.log('\n--- getServiceById(2) ---');
console.log(serviceManager.getServiceById(2));

console.log('\n--- getServiceById(999) (no existe) ---');
console.log(serviceManager.getServiceById(999));

console.log('\n--- addService(...) ---');
const nuevoServicio = serviceManager.addService({
  name: 'Clase de yoga',
  description: 'Clase grupal de yoga para principiantes',
  duration: 50,
  price: 3000,
  category: 'Bienestar',
  available: true,
});
console.log(nuevoServicio);

console.log('\n--- addService con datos incompletos (debería fallar) ---');
try {
  serviceManager.addService({ name: 'Servicio incompleto' });
} catch (error) {
  console.error(error.message);
}

console.log('\n--- updateService(1, ...) ---');
console.log(serviceManager.updateService(1, { price: 4000 }));

console.log('\n--- updateService intentando cambiar el id (debería ignorarse) ---');
console.log(serviceManager.updateService(1, { id: 999, available: false }));

console.log('\n--- deleteService(3) ---');
console.log(serviceManager.deleteService(3));

console.log('\n--- deleteService(999) (no existe) ---');
console.log(serviceManager.deleteService(999));

console.log('\n--- getServices() final ---');
console.log(serviceManager.getServices());
