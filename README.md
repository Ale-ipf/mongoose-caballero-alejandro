# Proyecto Mongoose

## Inicializar el proyecto

### Requisitos

- Node.js y npm instalados.
- Una instancia de MongoDB local o remota accesible desde la URI de conexión.

### Instalación y configuración

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo `.env` a partir del ejemplo. En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   En otros terminales:

   ```bash
   cp .env.example .env
   ```

3. Configurar las variables en `.env`:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/myapp
   PORT=3000
   ```

   Cambiar `MONGODB_URI` según la ubicación y las credenciales de MongoDB. Mantener
   `.env` fuera del repositorio; para compartir la configuración, actualizar `.env.example`
   sin incluir credenciales ni otros secretos.

4. Si la base ya tenía datos creados con índices únicos anteriores, respaldarla y migrar
   esos índices antes de iniciar la aplicación:

   ```bash
   npm run migrate:soft-delete-indexes
   ```

   La migración reemplaza los índices únicos globales de `username`, `email`, `rolename` y
   `name` por índices únicos que solo afectan documentos activos (`deletedAt: null`). Así,
   esos valores se pueden reutilizar después de un borrado lógico. La migración solo elimina
   índices únicos simples, sin filtro parcial, de esos campos; si crear los nuevos índices
   falla por datos duplicados, revisarlos antes de volver a ejecutar el comando.

5. Iniciar MongoDB y ejecutar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El servidor espera a que la conexión con MongoDB se establezca antes de comenzar a
   escuchar en el puerto configurado.

6. Comprobar que el servidor responde con `200 OK` en `http://localhost:3000/health`.
   Por ejemplo, desde PowerShell:

   ```powershell
   Invoke-RestMethod http://localhost:3000/health
   ```

   La respuesta esperada es:

   ```json
   { "status": "ok" }
   ```

## Justificación de las direcciones embebidas

En el modelo de usuarios, `addresses` se representa como un array de subdocumentos
embebidos, cada uno con `city` y `country`. Se eligió esta estructura porque las direcciones
pertenecen al usuario y normalmente se consultan junto con sus datos, por lo que no hace
falta mantener una colección independiente ni realizar consultas adicionales con `populate`.
El array permite que un usuario tenga varias direcciones; Mongoose genera un `_id` para
cada subdocumento, lo que facilita identificar y actualizar una dirección concreta. Esta
decisión es adecuada mientras las direcciones no necesiten compartirse entre usuarios ni
administrarse como documentos independientes.

## Relación uno a uno entre usuarios y perfiles

Cada `Profile` guarda una referencia `user` a un usuario y tiene un índice único para que
un usuario no tenga más de un perfil activo. En `User`, el virtual `profile` permite obtener
ese perfil con `populate("profile")` sin almacenar también su identificador en el usuario.
El perfil es un documento separado porque sus datos se administran de forma independiente
de los datos de acceso del usuario.

## Relación uno a muchos entre usuarios y tareas

Cada `Task` guarda en `author` la referencia al `User` que la creó. La relación inversa
`User.tasks` es un virtual de Mongoose: no duplica los IDs de las tareas dentro del usuario
y permite consultarlas con `User.findById(userId).populate("tasks")`. Este sentido inverso
es útil para consultar tareas desde un usuario aunque `User` no almacene directamente la
referencia.

## Relación muchos a muchos entre tareas y etiquetas

Una tarea puede tener varias etiquetas y una misma etiqueta puede estar asociada a varias
tareas, por lo que la relación entre `Task` y `Tag` es de muchos a muchos (N:M). Cada
vínculo se almacena como un documento `TaskTag` con referencias `task` y `tag`. Un índice
único parcial impide vínculos activos duplicados y permite volver a asociar una etiqueta
después de eliminar lógicamente el vínculo. Los virtuales `taskTags` de `Task` y `Tag`
permiten recorrer la relación con `populate`.

El CRUD de vínculos está disponible en `GET/POST /api/task-tags` y
`GET/PATCH/DELETE /api/task-tags/:id`; además, se puede asociar o quitar una etiqueta desde
`POST /api/tasks/:id/tags` y `DELETE /api/tasks/:id/tags/:tagId`. Al eliminar lógicamente
una tarea o etiqueta, sus vínculos también se eliminan lógicamente.

## Endpoints

Todas las rutas usan el prefijo `/api`. Las rutas de creación y actualización validan la
entrada con `express-validator`; los errores de entrada devuelven `400`.

| Recurso | Rutas |
| --- | --- |
| Autenticación | `POST /auth/register`, `POST /auth/login` |
| Usuarios | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| Perfiles | `GET/POST /profiles`, `GET/PATCH/DELETE /profiles/:id` |
| Tareas | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` |
| Roles | `GET/POST /roles`, `GET/PATCH/DELETE /roles/:id` |
| Etiquetas | `GET/POST /tags`, `GET/PATCH/DELETE /tags/:id` |
| Vínculos tarea-etiqueta | `GET/POST /task-tags`, `GET/PATCH/DELETE /task-tags/:id`; `POST /tasks/:id/tags` con `{ "tagId": "..." }`; `DELETE /tasks/:id/tags/:tagId` |

El inicio de sesión verifica las credenciales, pero no crea una sesión persistente ni emite
un token.

## Eliminación lógica y relaciones

Los documentos principales incluyen `deletedAt`. Al eliminar un documento, los controladores
lo marcan con la fecha actual y las consultas de listado/detalle omiten los documentos que ya
tienen esa marca. Al eliminar un usuario también se marcan sus tareas y perfil; al eliminar un
rol o etiqueta se quitan sus referencias de usuarios o tareas, respectivamente. Las tareas
se eliminan lógicamente al eliminar al autor; sus etiquetas permanecen porque también
pueden estar asociadas a otras tareas.

Las eliminaciones que afectan varias colecciones usan transacciones, así que son atómicas:
si una operación falla, los cambios se revierten. MongoDB debe ejecutarse como replica set
o mongos; en un servidor standalone el endpoint responde con `503` y un mensaje que indica
el requisito de configuración.
