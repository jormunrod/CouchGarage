# CouchGarage

**CouchGarage** es una aplicación sencilla y eficiente para registrar y gestionar el mantenimiento de vehículos. Aprovecha las capacidades de CouchDB, una base de datos orientada a documentos, lo que permite obtener una experiencia flexible y escalable.

---

## Descripción del Proyecto

CouchGarage permite a los usuarios:
- Registrar, consultar y actualizar el historial de mantenimiento de sus vehículos.
- Incluir en cada registro detalles como la marca, modelo, matrícula, tipo de mantenimiento, coste, comentarios y fecha.
- Gestionar de forma organizada toda la información de mantenimiento.

El proyecto está diseñado para:
- **Entusiastas de los coches:** Llevar un control detallado de sus mantenimientos.
- **Talleres mecánicos:** Registrar los servicios realizados de manera básica y eficaz.
- **Estudiantes y desarrolladores:** Explorar las capacidades de CouchDB y React mediante una aplicación moderna.

---

## Características

- **Interfaz Moderna:** Frontend desarrollado en React que proporciona una experiencia de usuario fluida y responsiva.
- **Backend Eficiente:** Implementación de un API RESTful para gestionar operaciones CRUD.
- **Base de Datos Escalable:** Uso de CouchDB para almacenar datos de mantenimiento en un formato flexible.
- **Dockerizado:** Entorno preparado para desarrollo y producción mediante Docker, facilitando la instalación y despliegue.
- **Script de Inicialización:** Se incluye un script de inicialización (start.sh) que permite gestionar el ciclo de vida del entorno de manera interactiva.

---

## Requisitos Previos

- [Docker](https://www.docker.com/) instalado en tu sistema.
- [Docker Compose](https://docs.docker.com/compose/) o la nueva sintaxis de Docker con comando `docker compose`.
- (Opcional) Archivo `.env` configurado correctamente en la raíz del proyecto para personalizar variables de entorno (por ejemplo: COUCHDB_USER, COUCHDB_PASSWORD, etc.).

> **Nota:** Si no dispones de un archivo `.env`, algunas variables se establecerán con sus valores por defecto. Se recomienda crear y configurar este archivo según tus necesidades.

---

## Instalación y Ejecución del Proyecto en Local

### A. Uso del Script de Inicialización

El proyecto incluye un script de inicialización llamado `start.sh` que facilita la gestión de los contenedores. Este script permite:
- Iniciar la aplicación en modo **PRODUCCIÓN** o **DESARROLLO**.
- Detener los contenedores.
- Verificar la instalación de Docker y Docker Compose.
- Mostrar información del proyecto.

Para utilizar el script:

1. **Clona el repositorio:**
   ```bash
   git clone ssh://github.com/jormunrod/CouchGarage
   ```

2. **Accede al directorio del proyecto:**
   ```bash
   cd CouchGarage
   ```

3. **(Opcional) Configura el archivo `.env`:**
   Asegúrate de contar con un archivo `.env` en la raíz del proyecto con las variables necesarias.

4. **Dale permisos de ejecución al script (si aún no los tiene):**
   ```bash
   chmod +x start.sh
   ```

5. **Ejecuta el script:**
   ```bash
   ./start.sh
   ```

Sigue las instrucciones interactivas que muestra el script para iniciar el entorno en el modo deseado.

### B. Instalación Manual con Docker

Si prefieres levantar manualmente el entorno Docker, sigue estos pasos:

1. **Clona el repositorio:**
   ```bash
   git clone ssh://github.com/jormunrod/CouchGarage
   ```

2. **Accede al directorio del proyecto:**
   ```bash
   cd CouchGarage
   ```

3. **(Opcional) Configura el archivo `.env`:**
   Crea y ajusta el archivo `.env` en la raíz del proyecto según tus necesidades. Si no existe, Docker mostrará advertencias de variables no establecidas.

4. **Construye y levanta los contenedores:**
   Dependiendo de la versión de Docker que tengas, utiliza uno de los siguientes comandos:
   ```bash
   docker compose up -d --build
   ```
   o
   ```bash
   docker-compose up -d --build
   ```

5. **Accede a la aplicación:**
   - **Frontend:** [http://localhost:80](http://localhost:80)
   - **Backend:** [http://localhost:3000](http://localhost:3000)
   - **CouchDB:** [http://localhost:5984](http://localhost:5984)

6. **Accede a la interfaz de administración de CouchDB:**
   - URL: [http://localhost:5984/_utils/](http://localhost:5984/_utils/)
   - Usuario: `admin`
   - Contraseña: `admin`

---

## Variables de Entorno

El archivo `.env` es fundamental para configurar las variables de entorno necesarias en el despliegue del sistema. Algunas variables importantes son:

- `COUCHDB_USER`: Usuario de CouchDB.
- `COUCHDB_PASSWORD`: Contraseña de CouchDB.
- `COUCHDB_URL`: URL de conexión a CouchDB.
- `COUCHDB_DATABASE`: Nombre de la base de datos a utilizar.

> Si observas mensajes de advertencia relacionados con variables no establecidas al iniciar los contenedores, revisa y configura el archivo `.env`.

---

## Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

---

_Disclaimer: Este README se ha actualizado para brindar una visión completa del proyecto, incluyendo instrucciones de instalación manual y el uso del script de inicialización._