# Backend Turnos y Reservas — API REST de Servicios

Proyecto Node.js con ESM que expone una API REST con Express para gestionar los servicios ofrecidos por un sistema de turnos y reservas (por ejemplo: peluquería, consultas médicas, clases, etc.). La lógica de negocio vive en la clase `ServiceManager`; las rutas solo la conectan con las peticiones HTTP.

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
npm start
```

o, para desarrollo (reinicia el servidor automáticamente al guardar cambios):

```bash
npm run dev
```

Esto inicializa la configuración (validando las variables de entorno) y levanta el servidor Express en el puerto definido en `.env`. Al arrancar deberías ver algo como:
```
Servidor escuchando en http://localhost:8080
```

> Nota: al iniciar vas a ver una línea de log generada por `dotenv` (`injected env (2) from .env`) — es el comportamiento normal de la librería al cargar las variables, no es un error.

## Variables de entorno

Definidas en `.env` (no se sube al repositorio; usar `.env.example` como referencia):

| Variable   | Descripción                                  | Ejemplo       |
|------------|-----------------------------------------------|---------------|
| `PORT`     | Puerto donde escucha el servidor              | `8080`        |
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

Los datos iniciales (semilla) están en `src/data/services.json`. `ServiceManager` los carga en memoria al instanciarse; los cambios hechos con `addService`, `updateService` y `deleteService` solo viven en memoria durante la ejecución del proceso (no se reescribe el archivo `.json`, y se reinician al reiniciar el servidor).

## Endpoints disponibles

Base URL: `http://localhost:8080`

| Método | Ruta                  | Descripción                                                                 | Códigos de respuesta |
|--------|-----------------------|------------------------------------------------------------------------------|-----------------------|
| GET    | `/api/services`       | Devuelve todos los servicios. Acepta filtros por query: `?category=salud`, `?available=true` | 200 |
| GET    | `/api/services/:sid`  | Devuelve el servicio con ese id                                              | 200 / 404 |
| POST   | `/api/services`       | Crea un servicio nuevo (el `id` se genera internamente, no enviarlo en el body) | 201 / 400 |
| PUT    | `/api/services/:sid`  | Actualiza el servicio (no permite modificar el `id`)                         | 200 / 404 |
| DELETE | `/api/services/:sid`  | Elimina el servicio                                                          | 200 / 404 |

### Ejemplos rápidos (con Postman o Bruno)

```
GET  /api/services
GET  /api/services?category=salud
GET  /api/services?available=true
GET  /api/services/2

POST /api/services
Body:
{
  "name": "Clase de yoga",
  "description": "Clase grupal de yoga para principiantes",
  "duration": 50,
  "price": 3000,
  "category": "Bienestar",
  "available": true
}

PUT  /api/services/1
Body:
{
  "price": 4000
}

DELETE /api/services/3
```

## Uso de `ServiceManager` (lógica interna, usada por el router)

```js
import { ServiceManager } from './managers/ServiceManager.js';

const serviceManager = new ServiceManager();
```

### `getServices(filters)`
Devuelve un array con todos los servicios. Acepta un objeto opcional `{ category, available }` para filtrar.
```js
serviceManager.getServices();
serviceManager.getServices({ category: 'salud' });
serviceManager.getServices({ available: 'true' });
```

### `getServiceById(id)`
Devuelve el servicio con ese `id`, o `null` si no existe.
```js
serviceManager.getServiceById(2);
// { id: 2, name: 'Manicura', ... }
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
```

### `updateService(id, updatedData)`
Actualiza los campos indicados del servicio con ese `id`. No permite modificar el `id` (si se envía, se ignora). Devuelve `null` si el servicio no existe.

### `deleteService(id)`
Elimina el servicio con ese `id` y devuelve el objeto eliminado. Devuelve `null` si no existe.

## Estructura del proyecto

```
src/
  config/env.config.js             # Carga y valida variables de entorno
  managers/ServiceManager.js       # Lógica de negocio: CRUD sobre services
  routes/services.router.js        # Rutas HTTP del recurso services
  middlewares/logger.middleware.js # Logging de peticiones
  data/services.json               # Datos semilla de servicios
  app.js                           # Configuración de Express (middlewares, rutas)
  server.js                        # Punto de entrada: levanta el servidor
package.json
.env.example
.gitignore
README.md
```
