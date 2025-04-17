# CouchGarage

**CouchGarage** es una aplicación sencilla y eficiente para registrar y gestionar el mantenimiento de vehículos. Está diseñada para aprovechar las capacidades de CouchDB como base de datos orientada a documentos, lo que permite una experiencia flexible y escalable.

---

## **Descripción del Proyecto**

CouchGarage permite a los usuarios registrar, consultar y actualizar el historial de mantenimiento de sus coches de manera fácil y organizada. Cada registro incluye detalles como la marca, modelo, matrícula, tipo de mantenimiento, coste, comentarios y fecha. Además, su diseño modular y su integración con React para el frontend hacen que sea una aplicación moderna y fácil de usar.

El proyecto está pensado para:
- Entusiastas de los coches que deseen llevar un control detallado de sus mantenimientos.
- Talleres mecánicos que necesiten una herramienta básica para registrar los servicios realizados.
- Estudiantes y desarrolladores interesados en explorar las capacidades de CouchDB y React.

## **Ejecutar el Proyecto en Local (Docker)**
Para ejecutar el proyecto en local, asegúrate de tener Docker instalado y sigue estos pasos:

1. **Clona el repositorio:**
   ```bash
   git clone ssh://github.com/jormunrod/CouchGarage
   ```

2. **Navega al directorio del proyecto:**
   ```bash
    cd CouchGarage
    ```

3. **Construye y ejecuta los contenedores:**
    ```bash
    docker-compose up --build
    ```
    o
    ```bash
    docker compose up --build
    ```

4. **Accede a la aplicación:**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:5984](http://localhost:5984) (CouchDB)

5. **Accede a la interfaz de CouchDB:**
    - [http://localhost:5984/_utils/](http://localhost:5984/_utils/)
    - Usuario: `admin`
    - Contraseña: `admin`