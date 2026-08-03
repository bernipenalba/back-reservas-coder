# Backend Turnos y Reservas — API REST de Servicios y Reservas

Proyecto Node.js con ESM que expone una API REST con Express para gestionar los servicios y las reservas de un sistema de turnos (por ejemplo: peluquería, consultas médicas, clases, etc.). La persistencia se hace con archivos JSON (sin base de datos todavía): los datos sobreviven a un reinicio del servidor.

## Arquitectura en capas

El proyecto está organizado en 5 capas. Cada petición HTTP recorre todas las capas en el mismo orden, de afuera hacia adentro:

```
Cliente → Route → Controller → Service → Repository → DAO → archivo JSON
```

Por ejemplo, crear un servicio nuevo (`POST /api/services`) recorre: `services.router.js` → `createService` (controller) → `services.service.js` → `services.repository.js` → `services.dao.js` → `services.json`.

| Capa | Archivo | Responsabilidad | Qué NO hace |
|------|---------|-------------------|----------------|
| Route | `routes/*.router.js` | Conecta una URL + método HTTP con una función del controller. | No tiene lógica de negocio ni toca archivos. |
| Controller | `controllers/*.controller.js` | Lee `req.params`/`req.query`/`req.body`, llama al service, responde con `res.status().json()`. | No decide reglas de negocio ni sabe cómo se guardan los datos. |
| Service | `services/*.service.js` | Reglas de negocio: valida datos, decide qué significa "no encontrado", aplica lógica como el incremento de `quantity` en bookings. | No conoce Express (nada de `req`/`res`), no escribe archivos directamente. |
| Repository | `repositories/*.repository.js` | Expone métodos claros para pedir/guardar datos (`getAll`, `getById`, `create`...), delegando siempre al DAO. | No sabe si el dato viene de un archivo o de una base de datos — eso lo decide el DAO que usa. |
| DAO | `dao/*.dao.js` | Ejecuta la operación concreta contra la persistencia real: lee y escribe el `.json`. | No aplica reglas de negocio — solo devuelve lo que hay o guarda lo que le piden. |

**Por qué esta separación:** si hay un error en una URL, se revisa la Route. Si hay un error en una regla de negocio (por ejemplo, una validación que no debería dejar pasar algo), se revisa el Service. Si hay un error leyendo o escribiendo el archivo, se revisa el DAO. Además, el día que el proyecto migre a MongoDB, alcanza con reemplazar los archivos de `dao/` por una versión que use Mongoose — **las capas de arriba (Repository, Service, Controller, Route) no necesitan cambiar ni una línea**, porque siempre hablan con el Repository de la misma forma, sin saber cómo persiste los datos por debajo.

**Manejo de errores:** los `service` no devuelven `{ status: 'error' }` — **lanzan** un `Error` (`throw`) con una propiedad extra `statusCode` (400, 404, etc.) cuando algo no es válido o no se encuentra. Cada `controller` envuelve el llamado al service en `try/catch` y responde con `res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message })`. Así, quien decide el código HTTP siempre es el controller, nunca el service.

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

Los datos viven en `src/data/services.json`. Cada operación de creación/actualización/borrado atraviesa `services.service.js` → `services.repository.js` → `services.dao.js`, que es quien finalmente lee el archivo, modifica lo que corresponda y **vuelve a guardarlo en disco** — por eso los cambios persisten aunque reinicies el servidor.

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

Cada elemento de `services` **no** es una copia del servicio completo, sino una referencia: `{ service: <id del servicio>, quantity: <cantidad> }`. Si se agrega el mismo servicio dos veces a una reserva, no se duplica la entrada — se incrementa `quantity`. **Esta regla vive en `bookings.service.js`**, no en el DAO ni en el repository: es lógica de negocio, no un detalle de cómo se guarda el archivo. Los datos viven en `src/data/bookings.json`.

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

Los endpoints y su comportamiento externo son idénticos a la entrega anterior — este refactor solo reorganiza el código por dentro.

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

## Capas internas de `services`

```js
import * as servicesService from './services/services.service.js';
```

- **`getServices(filters)`** — devuelve todos los servicios, aplicando filtro opcional `{ category, available }`.
- **`getServiceById(id)`** — devuelve el servicio con ese `id`. Lanza un error (`statusCode: 404`) si no existe.
- **`createService(data)`** — valida `name`, `description`, `duration`, `price`, `category` (lanza `statusCode: 400` si falta alguno); `available` es opcional (por defecto `true`).
- **`updateService(id, data)`** — actualiza los campos indicados sin permitir modificar el `id`. Lanza `statusCode: 404` si no existe.
- **`deleteService(id)`** — elimina el servicio. Lanza `statusCode: 404` si no existe.

Por debajo, `services.repository.js` expone `getAll`, `getById`, `create`, `update`, `remove` (sin ninguna regla propia, solo delega), y `services.dao.js` es quien realmente lee/escribe `services.json`.

## Capas internas de `bookings`

```js
import * as bookingsService from './services/bookings.service.js';
```

- **`createBooking(data)`** — requiere `clientName`, `clientEmail`, `date`, `time` (lanza `statusCode: 400` si falta alguno). `status` (por defecto `"pending"`) y `services` (por defecto `[]`) son opcionales.
- **`getBookingById(id)`** — devuelve la reserva. Lanza `statusCode: 404` si no existe.
- **`addServiceToBooking(bookingId, serviceId)`** — valida que la reserva exista (consultando `bookings.repository.js`) y que el servicio exista (consultando `services.repository.js`, reutilizando esa capa sin duplicar lógica de lectura de archivos). Si el servicio ya estaba en la reserva, incrementa `quantity`; si no, agrega una entrada nueva.

Por debajo, `bookings.repository.js` expone `create`, `getById`, `update`, y `bookings.dao.js` lee/escribe `bookings.json`.

## Estructura del proyecto

```
src/
  config/env.config.js                 # Carga y valida variables de entorno
  controllers/services.controller.js   # req/res del recurso services
  controllers/bookings.controller.js   # req/res del recurso bookings
  services/services.service.js         # Reglas de negocio de services
  services/bookings.service.js         # Reglas de negocio de bookings (incluye quantity)
  repositories/services.repository.js  # Puente hacia el DAO de services
  repositories/bookings.repository.js  # Puente hacia el DAO de bookings
  dao/services.dao.js                  # Lectura/escritura real de services.json
  dao/bookings.dao.js                  # Lectura/escritura real de bookings.json
  routes/services.router.js            # Rutas HTTP del recurso services → controller
  routes/bookings.router.js            # Rutas HTTP del recurso bookings → controller
  middlewares/logger.middleware.js     # Logging de peticiones
  data/services.json                   # Datos persistidos de servicios
  data/bookings.json                   # Datos persistidos de reservas
  app.js                               # Configuración de Express (middlewares, rutas)
  server.js                            # Punto de entrada: levanta el servidor
package.json
.env.example
.gitignore
README.md
```
