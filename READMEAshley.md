# Apple Music – Plataforma de Analíticas en Tiempo Real (MongoDB + Docker)

Proyecto desarrollado como parte del curso **Bases de Datos II**  
**Universidad Da Vinci de Guatemala**  
**Catedrático:** Ing. Brandon Chitay  
**Alumno:** Ashley Dayane Alfaro Aguilar 



## Objetivo del Proyecto

Desarrollar una Prueba de Concepto (PoC) para Apple Music que demuestre una arquitectura
de analíticas en tiempo real utilizando:

- **MongoDB** como base de datos NoSQL
- **Docker** para contenerización
- **Aggregation Pipelines** para procesar grandes volúmenes
- **v0.dev** para prototipado visual del dashboard
- **Seeding masivo** para simular datos reales de usuarios y streams

El sistema debe resolver **5 consultas críticas** de negocio relacionadas con:
regalías, top regional, usuarios inactivos, demografía musical y heavy users.



## Arquitectura General

```
Docker (MongoDB)
    │
Seeder Node.js  →  DB: apple_music_db
    │
Aggregation Pipelines (5 consultas)
    │
API Spec (Diseño REST)
    │
Dashboard (v0.dev)
```



## Estructura del Repositorio

```
/api-design
    api-spec.md            # Documentación de los 5 endpoints

/database
    docker-compose.yml     # Infraestructura de MongoDB
    queries.js             # Aggregation Pipelines
    schema-diagram.pdf     # Esquema de la base de datos (PDF)

/dashboard-v0
    prompt.txt             # Prompt usado en v0.dev
    /screenshots           # Capturas del dashboard visual

seed.js                    # Script generador de datos
package.json
README.md                  # Este archivo
```



## 1. Infraestructura (Docker)

Ejecutar:

```bash
cd database
docker compose up -d
```

Mongo queda disponible en:

```
mongodb://localhost:27017
```



## 2. Generación de Datos (Seeding)

En la raíz del proyecto:

```bash
npm install
npm start
```

El seeder genera automáticamente:

- 100 usuarios (20 zombis)
- 5 artistas principales
- 50 canciones
- Miles de streams en los últimos 60 días



## 3. Aggregation Pipelines

Archivo: `database/queries.js`  
Incluye las 5 consultas oficiales del examen:

1️⃣ **Reporte de Regalías (30 días)**  
2️⃣ **Top 10 Guatemala (7 días)**  
3️⃣ **Usuarios Zombis (Premium sin actividad)**  
4️⃣ **Demografía – Usuarios que escuchan Reggaeton**  
5️⃣ **Heavy Users – Canciones distintas escuchadas de Bad Bunny**

Ejecutar:

```bash
node queries.js
```



## 4. API REST (Diseño)

Documentada en:

```
/api-design/api-spec.md
```

Incluye:

- Descripción de parámetros
- Request/Response ejemplo
- Consideraciones para conexión con frontend



## 5. Dashboard (v0.dev)

Generado usando inteligencia artificial con el prompt incluido en:

```
/dashboard-v0/prompt.txt
```

### Secciones representadas:

- **Royalties Report**
- **Top 10 Guatemala**
- **Usuarios Zombis**
- **Demografía Reggaeton**
- **Heavy Users de Bad Bunny**



## 6. Esquema de Datos (Schema Diagram)

Incluido como:

```
database/schema-diagram.pdf
```



## 7. Video de Presentación

**Enlace al video:**  
**


- Arquitectura general
- Docker + Mongo corriendo
- Explicación de seed.js
- Ejecución de las 5 consultas
- Dashboard final




## Conclusiones

Este proyecto desarrolla una arquitectura moderna capaz de procesar y visualizar métricas de streaming a gran escala.  
La solución implementa conceptos clave de ingeniería de datos:

- Modelado NoSQL orientado a analítica  
- Denormalización estratégica  
- Aggregation Pipelines eficientes  
- Contenedores Docker  
- Prototipos UI impulsados por IA  

El resultado final es una PoC funcional que demuestra cómo Apple Music podría migrar parte de sus analíticas en tiempo real hacia tecnologías NoSQL.


## Autor

**Ashley Dayane Alfaro Aguilar**  
Universidad Da Vinci de Guatemala  
Ingeniería en Sistemas  
