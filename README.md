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
