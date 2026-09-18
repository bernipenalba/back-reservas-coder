# Backend Turnos y Reservas — API REST de Servicios y Reservas

Proyecto Node.js con ESM que expone una API REST con Express para gestionar los servicios y las reservas de un sistema de turnos (por ejemplo: peluquería, consultas médicas, clases, etc.). La persistencia se hace con **MongoDB Atlas**, usando **Mongoose** como capa de acceso a la base de datos.

## Arquitectura en capas

El proyecto está organizado en 5 capas. Cada petición HTTP recorre todas las capas en el mismo orden, de afuera hacia adentro:

```
Cliente → Route → Controller → Service → Repository → DAO → MongoDB (Mongoose)
```

Por ejemplo, crear un servicio nuevo (`POST /api/services`) recorre: `services.router.js` → `createService` (controller) → `services.service.js` → `services.repository.js` → `services.dao.js` → colección `services` en MongoDB.

| Capa | Archivo | Responsabilidad | Qué NO hace |
|------|---------|-------------------|----------------|
| Route | `routes/*.router.js` | Conecta una URL + método HTTP con una función del controller. | No tiene lógica de negocio ni toca la base de datos. |
| Controller | `controllers/*.controller.js` | Lee `req.params`/`req.query`/`req.body`, llama al service, responde con `res.status().json()`. | No decide reglas de negocio ni sabe cómo se guardan los datos. |
| Service | `services/*.service.js` | Reglas de negocio: valida datos, decide qué significa "no encontrado", aplica lógica como el incremento de `quantity` en bookings. | No conoce Express (nada de `req`/`res`), no habla con Mongoose directamente. |
| Repository | `repositories/*.repository.js` | Expone métodos claros para pedir/guardar datos (`getAll`, `getById`, `create`...), delegando siempre al DAO. | No sabe si el dato viene de MongoDB o de otro motor — eso lo decide el DAO que usa. |
| DAO | `dao/*.dao.js` | Ejecuta la operación concreta contra la persistencia real usando los modelos de Mongoose (`dao/models/`). | No aplica reglas de negocio — solo devuelve lo que hay o guarda lo que le piden. |

**Por qué esta separación:** si hay un error en una URL, se revisa la Route. Si hay un error en una regla de negocio, se revisa el Service. Si hay un error consultando la base de datos, se revisa el DAO. Esta entrega migró la persistencia de archivos JSON a MongoDB **cambiando únicamente los archivos de `dao/`** — ningún archivo de `repositories/`, `services/`, `controllers/` ni `routes/` tuvo que modificarse, salvo un ajuste puntual en `bookings.service.js` por el cambio de tipo de dato de los ids (ver más abajo). Esa es la prueba concreta del beneficio de la arquitectura en capas.

**Manejo de errores:** los `service` no devuelven `{ status: 'error' }` — **lanzan** un `Error` (`throw`) con una propiedad extra `statusCode` (400, 404, etc.) cuando algo no es válido o no se encuentra. Cada `controller` envuelve el llamado al service en `try/catch` y responde con `res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message })`.

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

### Configurar MongoDB Atlas

1. Creá una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) y un cluster **M0 (gratuito)**.
2. En **Database Access**, creá un usuario de base de datos (usuario + contraseña).
3. En **Network Access**, autorizá tu IP actual (o `0.0.0.0/0` para desarrollo).
4. En el cluster, hacé clic en **Connect → Drivers → Node.js** y copiá la URI de conexión.
5. Reemplazá `<usuario>` y `<password>` por los del paso 2, agregá el nombre de tu base antes del `?`, y pegala en tu `.env` como `MONGO_URI=...`.

## Ejecución

```bash
npm start
```

o, para desarrollo (reinicia el servidor automáticamente al guardar cambios):

```bash
npm run dev
```

Esto inicializa la configuración, **conecta con MongoDB Atlas** y recién después levanta el servidor Express. Al arrancar deberías ver:
```
Conexión a MongoDB exitosa
Servidor escuchando en http://localhost:8080
```

Si la conexión falla, la app corta la ejecución con un mensaje de error (usuario/contraseña incorrectos, IP no autorizada en Atlas, `MONGO_URI` mal copiada, etc.) en vez de levantar un servidor que no puede persistir nada.

> Nota: al iniciar vas a ver una línea de log generada por `dotenv` (`injected env (3) from .env`) — es el comportamiento normal de la librería al cargar las variables, no es un error.

## Variables de entorno

Definidas en `.env` (no se sube al repositorio; usar `.env.example` como referencia):

| Variable    | Descripción                                        | Ejemplo                                              |
|-------------|-----------------------------------------------------|-------------------------------------------------------|
| `PORT`      | Puerto donde escucha el servidor                     | `8080`                                                 |
| `NODE_ENV`  | Entorno de ejecución                                 | `development`                                          |
| `MONGO_URI` | Cadena de conexión a tu cluster de MongoDB Atlas     | `mongodb+srv://usuario:password@cluster.mongodb.net/booking_system?retryWrites=true&w=majority` |

Si falta alguna de estas variables al iniciar, la app corta la ejecución con un mensaje de error indicando cuál falta (validado en `src/config/env.config.js`).

## El recurso `services`

Cada servicio tiene la siguiente forma:

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Corte de cabello",
  "description": "Corte de cabello personalizado para dama o caballero",
  "duration": 30,
  "price": 3500,
  "category": "Peluquería",
  "available": true,
  "createdAt": "2026-01-10T15:00:00.000Z",
  "updatedAt": "2026-01-10T15:00:00.000Z"
}
```

| Campo         | Tipo     | Descripción                                              |
|---------------|----------|-------------------------------------------------------------|
| `_id`         | ObjectId | Identificador único, generado por MongoDB (no un número)    |
| `name`        | string   | Nombre del servicio                                          |
| `description` | string   | Descripción del servicio                                     |
| `duration`    | number   | Duración en minutos                                          |
| `price`       | number   | Precio del servicio                                          |
| `category`    | string   | Categoría a la que pertenece                                 |
| `available`   | boolean  | Si el servicio está disponible para reservar                 |
| `createdAt` / `updatedAt` | Date | Agregados automáticamente por Mongoose (`timestamps: true`) |

Definido en `src/dao/models/service.model.js`. `services.dao.js` usa ese modelo para leer y escribir en la colección `services` de MongoDB.

## El recurso `bookings`

Cada reserva tiene la siguiente forma:

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
  "clientName": "Juana Pérez",
  "clientEmail": "juana@mail.com",
  "date": "2026-08-01",
  "time": "15:00",
  "status": "pending",
  "services": [
    { "service": "65f1a2b3c4d5e6f7a8b9c0d1", "quantity": 1 }
  ]
}
```

| Campo         | Tipo     | Descripción                                                      |
|---------------|----------|---------------------------------------------------------------------|
| `_id`         | ObjectId | Identificador único, generado por MongoDB                           |
| `clientName`  | string   | Nombre del cliente que reserva                                      |
| `clientEmail` | string   | Email del cliente                                                    |
| `date`        | string   | Fecha de la reserva                                                  |
| `time`        | string   | Horario de la reserva                                                |
| `status`      | string   | Uno de `'pending'`, `'confirmed'`, `'cancelled'` (default `'pending'`), restringido por `enum` en el schema |
| `services`    | array    | Servicios incluidos en la reserva (default `[]`)                     |

Cada elemento de `services` **no** es una copia del servicio completo, sino una referencia: `{ service: <ObjectId del servicio>, quantity: <cantidad> }` (`service` está declarado como `mongoose.Schema.Types.ObjectId` con `ref: 'services'` en `booking.model.js`). Si se agrega el mismo servicio dos veces a una reserva, no se duplica la entrada — se incrementa `quantity`. **Esta regla vive en `bookings.service.js`**, no en el DAO: es lógica de negocio.

## El recurso `messages` (modelo únicamente)

`src/dao/models/message.model.js` define un modelo con `user` y `message` (ambos requeridos) más timestamps. No tiene rutas ni lógica propia en esta entrega — está preparado para usarse más adelante con vistas o WebSockets.

## Endpoints disponibles

Base URL: `http://localhost:8080`

### Services

| Método | Ruta                  | Descripción                                                                 | Códigos de respuesta |
|--------|-----------------------|------------------------------------------------------------------------------|-----------------------|
| GET    | `/api/services`       | Devuelve todos los servicios. Acepta filtros por query: `?category=salud`, `?available=true` | 200 |
| GET    | `/api/services/:sid`  | Devuelve el servicio con ese `_id`                                           | 200 / 404 |
| POST   | `/api/services`       | Crea un servicio nuevo (el `_id` lo genera MongoDB, no enviarlo en el body)   | 201 / 400 |
| PUT    | `/api/services/:sid`  | Actualiza el servicio (no permite modificar el `_id`)                        | 200 / 404 |
| DELETE | `/api/services/:sid`  | Elimina el servicio                                                          | 200 / 404 |

### Bookings

| Método | Ruta                                   | Descripción                                                        | Códigos de respuesta |
|--------|-----------------------------------------|----------------------------------------------------------------------|-----------------------|
| POST   | `/api/bookings`                         | Crea una reserva nueva (puede iniciarse con `services` vacío)        | 201 / 400 |
| GET    | `/api/bookings/:bid`                    | Devuelve la reserva con ese `_id`                                     | 200 / 404 |
| POST   | `/api/bookings/:bid/services/:sid`      | Agrega un servicio a una reserva existente (valida que ambos existan) | 200 / 404 |

Las URLs, métodos y códigos de respuesta son idénticos a la entrega anterior — lo único que cambió es que `:sid`/`:bid` ahora son `_id` de MongoDB (strings tipo `65f1a2b3c4d5e6f7a8b9c0d1`) en vez de números. Un id con formato inválido (no un ObjectId real) devuelve **404** igual que un id inexistente, en vez de romper con un error 500 (ver sección "Manejo de ids inválidos").

### Ejemplos rápidos (con Postman)

```
GET  /api/services
GET  /api/services?category=salud
GET  /api/services?available=true
GET  /api/services/<_id de un servicio>

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

PUT  /api/services/<_id>
Body:
{
  "price": 4000
}

DELETE /api/services/<_id>

POST /api/bookings
Body:
{
  "clientName": "Juana Pérez",
  "clientEmail": "juana@mail.com",
  "date": "2026-08-01",
  "time": "15:00"
}

GET  /api/bookings/<_id de la reserva>

POST /api/bookings/<_id reserva>/services/<_id servicio>
(agrega el servicio a la reserva; si se llama de nuevo con los mismos dos ids, incrementa "quantity" en vez de duplicar)
```

## Manejo de ids inválidos

Como los ids ahora son `ObjectId` de MongoDB, pedir un id con un formato que no corresponde (por ejemplo, un número viejo estilo `"999"` o cualquier texto random) haría que Mongoose lance un error interno (`CastError`) si no se lo maneja. Cada función del DAO que recibe un id (`getById`, `update`, `remove`) empieza chequeando `mongoose.isValidObjectId(id)`; si no es válido, devuelve `null` directamente — el mismo camino que ya usa el Service para traducir "no encontrado" en un `404`, sin necesidad de tocar nada por encima del DAO.

## Capas internas de `services`

```js
import * as servicesService from './services/services.service.js';
```

- **`getServices(filters)`** — devuelve todos los servicios, aplicando filtro opcional `{ category, available }` en JavaScript sobre el resultado de `repository.getAll()`.
- **`getServiceById(id)`** — devuelve el servicio con ese `id`. Lanza un error (`statusCode: 404`) si no existe o si el id no tiene formato válido.
- **`createService(data)`** — valida `name`, `description`, `duration`, `price`, `category` (lanza `statusCode: 400` si falta alguno); `available` es opcional (por defecto `true`).
- **`updateService(id, data)`** — actualiza los campos indicados sin permitir modificar el `_id`. Lanza `statusCode: 404` si no existe.
- **`deleteService(id)`** — elimina el servicio. Lanza `statusCode: 404` si no existe.

Por debajo, `services.repository.js` expone `getAll`, `getById`, `create`, `update`, `remove` (sin ninguna regla propia, solo delega), y `services.dao.js` usa `ServiceModel` (Mongoose) para hablar con la colección `services`.

## Capas internas de `bookings`

```js
import * as bookingsService from './services/bookings.service.js';
```

- **`createBooking(data)`** — requiere `clientName`, `clientEmail`, `date`, `time` (lanza `statusCode: 400` si falta alguno). `status` (por defecto `"pending"`) y `services` (por defecto `[]`) son opcionales.
- **`getBookingById(id)`** — devuelve la reserva. Lanza `statusCode: 404` si no existe.
- **`addServiceToBooking(bookingId, serviceId)`** — valida que la reserva exista (consultando `bookings.repository.js`) y que el servicio exista (consultando `services.repository.js`, reutilizando esa capa sin duplicar lógica de acceso a datos). Compara los `ObjectId` convirtiéndolos a texto (`.toString()`) antes de comparar. Si el servicio ya estaba en la reserva, incrementa `quantity`; si no, agrega una entrada nueva.

Por debajo, `bookings.repository.js` expone `create`, `getById`, `update`, y `bookings.dao.js` usa `BookingModel` (Mongoose) para hablar con la colección `bookings`.

## Estructura del proyecto

```
src/
  config/env.config.js                 # Carga y valida variables de entorno (incluye MONGO_URI)
  config/database.config.js            # Conexión a MongoDB Atlas con Mongoose
  controllers/services.controller.js   # req/res del recurso services
  controllers/bookings.controller.js   # req/res del recurso bookings
  services/services.service.js         # Reglas de negocio de services
  services/bookings.service.js         # Reglas de negocio de bookings (incluye quantity)
  repositories/services.repository.js  # Puente hacia el DAO de services
  repositories/bookings.repository.js  # Puente hacia el DAO de bookings
  dao/services.dao.js                  # Acceso a la colección services (Mongoose)
  dao/bookings.dao.js                  # Acceso a la colección bookings (Mongoose)
  dao/models/service.model.js          # Schema y modelo de Mongoose para services
  dao/models/booking.model.js          # Schema y modelo de Mongoose para bookings
  dao/models/message.model.js          # Schema y modelo de Mongoose para messages (sin rutas aún)
  routes/services.router.js            # Rutas HTTP del recurso services → controller
  routes/bookings.router.js            # Rutas HTTP del recurso bookings → controller
  middlewares/logger.middleware.js     # Logging de peticiones
  app.js                               # Configuración de Express (middlewares, rutas)
  server.js                            # Punto de entrada: conecta la base y levanta el servidor
package.json
.env.example
.gitignore
README.md
```
