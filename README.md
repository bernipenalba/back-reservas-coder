# Backend Turnos y Reservas — Administrador de Servicios

Proyecto Node.js con ESM que implementa una clase `ServiceManager` para gestionar los servicios ofrecidos por un sistema de turnos y reservas (por ejemplo: peluquería, consultas médicas, clases, etc.).

## Instalación

1. Cloná el repositorio:
   ```bash
   git clone <URL_DEL_REPO>
   cd back-reservas-coder
   ```
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Creá tu archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Y completá los valores (ver sección "Variables de entorno").

## Ejecución

```bash
node src/app.js
```

Esto inicializa la configuración (validando las variables de entorno) y ejecuta una demostración de todos los métodos de `ServiceManager` sobre los datos de ejemplo en `src/data/services.json`, mostrando el resultado por consola.

> Nota: al iniciar vas a ver una línea de log generada por `dotenv` (`injected env (2) from .env`) — es el comportamiento normal de la librería al cargar las variables, no es un error.

## Variables de entorno

Definidas en `.env` (no se sube al repositorio; usar `.env.example` como referencia):

| Variable   | Descripción                                  | Ejemplo       |
|------------|-----------------------------------------------|---------------|
| `PORT`     | Puerto reservado para la app                  | `8080`        |
| `NODE_ENV` | Entorno de ejecución                          | `development` |

Si falta alguna de estas variables al iniciar, la app corta la ejecución con un mensaje de error indicando cuál falta (validado en `src/config/env.config.js`).

## El recurso `services`

Cada servicio tiene la siguiente forma:

```json
{
  "id": 1,
  "name": "Corte de cabello",
  "description": "Corte de cabello personalizado para dama o caballero",
  "duration": 30,
  "price": 3500,
  "category": "Peluquería",
  "available": true
}
```

| Campo         | Tipo    | Descripción                                  |
|---------------|---------|-----------------------------------------------|
| `id`          | number  | Identificador único, generado internamente     |
| `name`        | string  | Nombre del servicio                            |
| `description` | string  | Descripción del servicio                       |
| `duration`    | number  | Duración en minutos                            |
| `price`       | number  | Precio del servicio                            |
| `category`    | string  | Categoría a la que pertenece                   |
| `available`   | boolean | Si el servicio está disponible para reservar   |

Los datos iniciales (semilla) están en `src/data/services.json`. `ServiceManager` los carga en memoria al instanciarse; los cambios hechos con `addService`, `updateService` y `deleteService` solo viven en memoria durante la ejecución del proceso (no se reescribe el archivo `.json`).

## Uso de `ServiceManager`

```js
import { ServiceManager } from './src/managers/ServiceManager.js';

const serviceManager = new ServiceManager();
```

### `getServices()`
Devuelve un array con todos los servicios.
```js
serviceManager.getServices();
// [{ id: 1, name: 'Corte de cabello', ... }, { id: 2, ... }, ...]
```

### `getServiceById(id)`
Devuelve el servicio con ese `id`, o `null` si no existe.
```js
serviceManager.getServiceById(2);
// { id: 2, name: 'Manicura', ... }

serviceManager.getServiceById(999);
// null
```

### `addService(serviceData)`
Agrega un servicio nuevo. El `id` se genera internamente (no se debe enviar). Valida que estén presentes `name`, `description`, `duration`, `price`, `category` y `available`; si falta alguno, lanza un error.
```js
serviceManager.addService({
  name: 'Clase de yoga',
  description: 'Clase grupal de yoga para principiantes',
  duration: 50,
  price: 3000,
  category: 'Bienestar',
  available: true,
});
// { id: 5, name: 'Clase de yoga', ... }

serviceManager.addService({ name: 'Servicio incompleto' });
// Error: No se pudo agregar el servicio: faltan los campos description, duration, price, category, available
```

### `updateService(id, updatedData)`
Actualiza los campos indicados del servicio con ese `id`. No permite modificar el `id` (si se envía, se ignora). Devuelve `null` si el servicio no existe.
```js
serviceManager.updateService(1, { price: 4000 });
// { id: 1, name: 'Corte de cabello', price: 4000, ... }

serviceManager.updateService(999, { price: 100 });
// null
```

### `deleteService(id)`
Elimina el servicio con ese `id` y devuelve el objeto eliminado. Devuelve `null` si no existe.
```js
serviceManager.deleteService(3);
// { id: 3, name: 'Consulta médica general', ... }

serviceManager.deleteService(999);
// null
```

## Estructura del proyecto

```
src/
  config/env.config.js      # Carga y valida variables de entorno
  managers/ServiceManager.js # Clase ServiceManager
  data/services.json         # Datos semilla de servicios
  app.js                      # Script de demostración
package.json
.env.example
.gitignore
README.md
```
