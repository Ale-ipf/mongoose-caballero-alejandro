Objetivo:
Se deberán implementar colecciones con propiedades embebidas y referenciadas, realizar un
CRUD completo y validar los datos de entrada utilizando express-validator.
Criterios de Evaluación
1. Presentación del código
● El código debe estar limpio, ordenado y bien indentado.
● Uso obligatorio de try-catch en todos los controladores para un manejo adecuado de
errores.
● Organización correcta del proyecto en carpetas:
○ src/config → configuración (ej. conexión a BD).
○ src/models → definición de modelos Mongoose.
○ src/routes → definición de rutas.
○ src/controllers → controladores.
○ src/middlewares → validaciones y middleware de manejo de errores de
validación.

● Uso exclusivo de ESModules (import / export).
● El código debe ser funcional, modularizado y sin errores de ejecución.
2. CRUD y colecciones (con MongoDB + Mongoose)
● Uso correcto de Mongoose con conexión a MongoDB, definición adecuada de
esquemas y relaciones.
● Respuestas claras y códigos HTTP apropiados en cada operación:
○ 201 Created → al crear.
○ 200 OK → en consultas y actualizaciones exitosas.
○ 400 Bad Request → errores de validación.
○ 500 Internal Server Error → errores inesperados.
● Uso de populate en consultas para traer datos relacionados.
● Manejo de eliminaciones lógicas y eliminaciones en cascada. Mostrar mensajes de éxito
o error al realizar operaciones CRUD.
3. Validaciones (con express-validator)
● Uso de express-validator en todas las rutas de creación y actualización.
● Validación de los parámetros de ruta que reciban IDs, verificando que sean ObjectId
válidos (isMongoId()).
● Uso de validationResult() en un middleware reutilizable que devuelva los errores con
código 400.
● Uso de matchedData() en los controladores para trabajar únicamente con los datos
validados.
● Validaciones personalizadas (custom()) para verificar la existencia de documentos
relacionados y evitar duplicados.
Entrega mediante Git y GitHub – Uso de ramas y commits
Requisitos obligatorios para el control de versiones.
Teniendo en cuenta que en la práctica anterior las ramas main y develop contienen el mismo
contenido, ahora se debe hacer lo siguiente:
● Crear una rama a partir de “develop” llamada “mongoose-basico”.
● Realizar el desarrollo del trabajo en la rama “mongoose-basico”.
● Al finalizar el trabajo:
○ Hacer un merge limpio de “mongoose-basico” hacia “develop”, sin conflictos.
○ Luego hacer un merge limpio de “develop” hacia “main”, para que ambas ramas
queden sincronizadas nuevamente.

● Durante el desarrollo en la rama mongoose-basico, se deben realizar al menos 5
commits con mensajes claros y descriptivos.
Requisitos obligatorios del repositorio remoto
● El nombre del repositorio en GitHub debe seguir la siguiente convención:
○ mongoose-apellido-nombre. Ejemplo: mongoose-perez-juan
● El repositorio debe contener:
○ Todos los archivos del proyecto (app.js, package.json, src/ completo).
○ El archivo .env.example con los nombres de las variables utilizadas.
● El archivo .env y la carpeta node_modules no deben subirse.
● El enlace al repositorio debe entregarse en Google Classroom.
Consignas:
1. Crear colecciones
● Deben crear mínimo 3 colecciones a elección.
● Cada proyecto debe cumplir:
○ 1 propiedad embebida en alguna colección.
○ 1 relación 1:1.
○ 1 relación 1:N.
○ 1 relación N:M.
● Justificar en un documento o en el README.md por qué eligieron embebido o
referenciado en cada caso.
2. CRUD básico
Implementar creación, lectura, actualización y eliminación en todas las colecciones creadas.
● Uso de try/catch en todos los controladores.
● La eliminación debe contemplar lógica y en cascada.
3. Investigar
Se debe investigar, aplicar y justificar:
● Cómo se utiliza el populate desde las colecciones que no tienen referencias.
● Cómo se realizan las eliminaciones lógicas y en cascada.
● Cómo crear un endpoint que permita agregar un nuevo vínculo en una relación muchos
a muchos.
4. Validaciones
Implementar validaciones con express-validator en todas las colecciones:
● Validar los campos obligatorios, tipos de datos y longitudes en las rutas de creación y
actualización.
● Validar los campos de la propiedad embebida.
● Validar los IDs recibidos por parámetro y en el cuerpo de la petición (referencias).
● Validar, en el endpoint de la relación N:M, que ambos documentos existan y que el vínculo no esté duplicado.
