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

4. Iniciar MongoDB y ejecutar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El servidor espera a que la conexión con MongoDB se establezca antes de comenzar a
   escuchar en el puerto configurado.

5. Comprobar que el servidor responde con `200 OK` en `http://localhost:3000/health`.
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

## Relación muchos a muchos entre tareas y etiquetas

Una tarea puede tener varias etiquetas y una misma etiqueta puede estar asociada a varias
tareas, por lo que la relación entre `Task` y `Tag` es de muchos a muchos (N:M). En
`Task`, el campo `tags` guarda un array de referencias `ObjectId` al modelo `Tag`. La lista
de tareas de una etiqueta se obtiene mediante el virtual `tasks` en `Tag`, que consulta los
documentos `Task` cuyo campo `tags` contiene el `_id` de esa etiqueta. Así se evita guardar
la relación en ambos modelos y duplicar datos.

Se puede cargar la información relacionada con `populate`. Por ejemplo,
`Task.findById(taskId).populate("tags")` trae las etiquetas de una tarea, y
`Tag.findById(tagId).populate("tasks")` trae las tareas asociadas a una etiqueta. El campo
virtual `tasks` está configurado para incluirse al convertir el documento a JSON u objeto.
