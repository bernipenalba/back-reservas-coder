# Backend Turnos y Reservas — API REST de Servicios y Reservas

Proyecto Node.js con ESM que expone una API REST con Express para gestionar los servicios y las reservas de un sistema de turnos (por ejemplo: peluquería, consultas médicas, clases, etc.). La lógica de negocio vive en `ServiceManager` y `BookingManager`; las rutas solo la conectan con las peticiones HTTP. La persistencia se hace con archivos JSON (sin base de datos todavía): los datos sobreviven a un reinicio del servidor.

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

Los datos viven en `src/data/services.json`. Cada operación de `ServiceManager` (`addService`, `updateService`, `deleteService`) lee ese archivo, modifica lo que corresponda y **vuelve a guardarlo en disco** — por eso los cambios persisten aunque reinicies el servidor.

## El recurso `bookings`

Cada reserva tiene la siguiente forma:

```json
{
  "id": 1,
  "clientName": "Juana Pérez",
  "clientEmail": "juana@mail.com",
  "date": "2026-08-01",
  "time": "15:00",
  "status": "pending",
  "services": [
    { "service": 2, "quantity": 1 }
  ]
}
```

| Campo         | Tipo    | Descripción                                                      |
|---------------|---------|-------------------------------------------------------------------|
| `id`          | number  | Identificador único, generado internamente                        |
| `clientName`  | string  | Nombre del cliente que reserva                                    |
| `clientEmail` | string  | Email del cliente                                                  |
| `date`        | string  | Fecha de la reserva                                                |
| `time`        | string  | Horario de la reserva                                              |
| `status`      | string  | Estado de la reserva (por defecto `"pending"` si no se envía)      |
| `services`    | array   | Servicios incluidos en la reserva (por defecto `[]` si no se envía) |

Cada elemento de `services` **no** es una copia del servicio completo, sino una referencia: `{ service: <id del servicio>, quantity: <cantidad> }`. Si se agrega el mismo servicio dos veces a una reserva, no se duplica la entrada — se incrementa `quantity`. Los datos viven en `src/data/bookings.json`, con el mismo esquema de persistencia que `services`.

## Endpoints disponibles

Base URL: `http://localhost:8080`

### Services

| Método | Ruta                  | Descripción                                                                 | Códigos de respuesta |
|--------|-----------------------|------------------------------------------------------------------------------|-----------------------|
| GET    | `/api/services`       | Devuelve todos los servicios. Acepta filtros por query: `?category=salud`, `?available=true` | 200 |
| GET    | `/api/services/:sid`  | Devuelve el servicio con ese id                                              | 200 / 404 |
| POST   | `/api/services`       | Crea un servicio nuevo (el `id` se genera internamente, no enviarlo en el body) | 201 / 400 |
| PUT    | `/api/services/:sid`  | Actualiza el servicio (no permite modificar el `id`)                         | 200 / 404 |
| DELETE | `/api/services/:sid`  | Elimina el servicio                                                          | 200 / 404 |

### Bookings

| Método | Ruta                                   | Descripción                                                        | Códigos de respuesta |
|--------|-----------------------------------------|----------------------------------------------------------------------|-----------------------|
| POST   | `/api/bookings`                         | Crea una reserva nueva (puede iniciarse con `services` vacío)        | 201 / 400 |
| GET    | `/api/bookings/:bid`                    | Devuelve la reserva con ese id                                        | 200 / 404 |
| POST   | `/api/bookings/:bid/services/:sid`      | Agrega un servicio a una reserva existente (valida que ambos existan) | 200 / 404 |

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

POST /api/bookings
Body:
{
  "clientName": "Juana Pérez",
  "clientEmail": "juana@mail.com",
  "date": "2026-08-01",
  "time": "15:00"
}

GET  /api/bookings/1

POST /api/bookings/1/services/2
(agrega el servicio 2 a la reserva 1; si se llama de nuevo con el mismo id, incrementa "quantity" en vez de duplicar)
```

## Uso de `ServiceManager` (lógica interna, usada por `services.router.js`)

```js
import { getServices, getServiceById, addService, updateService, deleteService } from './managers/ServiceManager.js';
```

### `getServices(filters)`
Devuelve un array con todos los servicios. Acepta un objeto opcional `{ category, available }` para filtrar.
```js
await getServices();
await getServices({ category: 'salud' });
await getServices({ available: 'true' });
```

### `getServiceById(id)`
Devuelve el servicio con ese `id`, o `null` si no existe.
```js
await getServiceById(2);
// { id: 2, name: 'Manicura', ... }
```

### `addService(serviceData)`
Agrega un servicio nuevo. El `id` se genera internamente (no se debe enviar). Valida que estén presentes `name`, `description`, `duration`, `price` y `category`; si falta alguno, devuelve `{ status: 'error', message: '...' }` en vez de crear el servicio. `available` es opcional (por defecto `true`).
```js
await addService({
  name: 'Clase de yoga',
  description: 'Clase grupal de yoga para principiantes',
  duration: 50,
  price: 3000,
  category: 'Bienestar',
  available: true,
});
```

### `updateService(id, updatedData)`
Actualiza los campos indicados del servicio con ese `id`. No permite modificar el `id` (si se envía, se ignora). Devuelve `{ status: 'error', message: 'Servicio no encontrado' }` si no existe.

### `deleteService(id)`
Elimina el servicio con ese `id` y devuelve el objeto eliminado dentro de `payload`. Devuelve `{ status: 'error', message: 'Servicio no encontrado' }` si no existe.

## Uso de `BookingManager` (lógica interna, usada por `bookings.router.js`)

```js
import { createBooking, getBookingById, addServiceToBooking } from './managers/BookingManager.js';
```

### `createBooking(bookingData)`
Crea una reserva nueva. Requiere `clientName`, `clientEmail`, `date` y `time`; si falta alguno, devuelve un error. `status` (por defecto `"pending"`) y `services` (por defecto `[]`) son opcionales.

### `getBookingById(id)`
Devuelve la reserva con ese `id`, o `null` si no existe.

### `addServiceToBooking(bookingId, serviceId)`
Agrega un servicio a una reserva existente. Valida que tanto la reserva como el servicio existan (reutiliza `getServiceById` de `ServiceManager`). Si el servicio ya estaba en la reserva, incrementa su `quantity` en vez de duplicar la entrada.

## Estructura del proyecto

```
src/
  config/env.config.js             # Carga y valida variables de entorno
  managers/ServiceManager.js       # Lógica de negocio + persistencia: CRUD sobre services
  managers/BookingManager.js       # Lógica de negocio + persistencia: CRUD sobre bookings
  routes/services.router.js        # Rutas HTTP del recurso services
  routes/bookings.router.js        # Rutas HTTP del recurso bookings
  middlewares/logger.middleware.js # Logging de peticiones
  data/services.json               # Datos persistidos de servicios
  data/bookings.json               # Datos persistidos de reservas
  app.js                           # Configuración de Express (middlewares, rutas)
  server.js                        # Punto de entrada: levanta el servidor
package.json
.env.example
.gitignore
README.md
```
