# API Spec – Apple Music Analytics (MongoDB)

Base URL (ejemplo para el proyecto):
`http://localhost:3000/api`

La API expone endpoints de solo lectura para alimentar el dashboard de analíticas.
Todos los datos provienen de la base `apple_music_db` en MongoDB.

---

## 1. Reporte de Regalías por Artista (Últimos 30 días)

**Endpoint**

- `GET /api/royalties`

**Descripción**

Retorna el tiempo total reproducido por artista (en segundos) y la cantidad de streams
en los últimos 30 días.

**Query Params (opcionales)**

- `days` (number): cantidad de días hacia atrás a considerar.  
  - Default: `30`.

**Ejemplo de Request**

```http
GET /api/royalties?days=30
```

**Ejemplo de Response**
```
[
  {
    "artistId": "653f1b8c9e4f1b3c1a2b3c4d",
    "artistName": "Bad Bunny",
    "totalSecondsPlayed": 125232,
    "totalStreams": 768
  },
  {
    "artistId": "653f1b8c9e4f1b3c1a2b3c4e",
    "artistName": "Metallica",
    "totalSecondsPlayed": 91265,
    "totalStreams": 385
  }
]
```

## 2. Top 10 Canciones por País
**Endpoint**
- **GET /api/top10-regional**

**Descripción**

Retorna el Top 10 de canciones más escuchadas en un país específico durante los últimos N días.

**Query Params (opcionales)**
- `country` (string, requerido): código de país ISO2
- `days` (number, opcional): rango de días hacia atrás.  
  - Default: `7`.

**Ejemplo de Request**
```
GET /api/top10-regional?country=GT&days=7
```

**Ejemplo de Response**
```
[
  {
    "position": 1,
    "songId": "653f1c0a9e4f1b3c1a2b3c9a",
    "title": "Can't Get Enough of Your Love",
    "artistName": "Bad Bunny",
    "streams": 68
  },
  {
    "position": 2,
    "songId": "653f1c0a9e4f1b3c1a2b3c9b",
    "title": "The Streak",
    "artistName": "Metallica",
    "streams": 13
  }
]
```

## 3. Usuarios Zombies
**Endpoint**
- **GET /api/zombie-users**

**Descripción**

Lista usuarios con suscripción Premium que no han reproducido ninguna canción en los últimos N días.

**Query Params (opcionales)**

- `days` (number, opcional): rango de días sin actividad.  
  - Default: `30`.

**Ejemplo de Request**
```
GET /api/zombie-users?days=30
```

**Ejemplo de Response**
```
[
  {
    "userId": "653f1d0f9e4f1b3c1a2b3d11",
    "username": "user_zombi_1",
    "email": "zombi1@example.com",
    "country": "GT",
    "subscription": "Premium",
    "daysWithoutActivity": 35
  },
  {
    "userId": "653f1d0f9e4f1b3c1a2b3d12",
    "username": "user_zombi_2",
    "email": "zombi2@example.com",
    "country": "MX",
    "subscription": "Premium",
    "daysWithoutActivity": 40
  }
]
```
## 4. Demografía de Usuarios por Género Musical 

**Endpoint**
- **GET /api/demografia-genero**

**Descripción**

Retorna la distribución de usuarios por rangos de edad para un género musical,considerando los usuarios que han reproducido al menos una canción de ese género.

**Query Params (opcionales)**
- `genre`(string, requerido): nombre del género

**Ejemplo de Request**
```
GET /api/demografia-genero?genre=Reggaeton
```

**Ejemplo de Response**
```
[
  {
    "range": "15-20",
    "users": 5,
    "percentage": 10.42
  },
  {
    "range": "21-30",
    "users": 28,
    "percentage": 58.33
  },
  {
    "range": "31-40",
    "users": 10,
    "percentage": 20.83
  },
  {
    "range": "41-50",
    "users": 5,
    "percentage": 10.42
  }
]
```

## 5. Heavy Users de un Artista

**Endpoint**
- **GET /api/heavy-users**

**Descripción**

Encuentra a los usuarios que han escuchado más canciones distintas de un artista específico (por default, Bad Bunny).

**Query Params (opcionales)**
- `artistName` (string, opcional): nombre del artista.
    - Default: `Bad Bunny`
- `limit` (number, opcional): cantidad de usuarios a retornar.
    - Default: `5`

**Ejemplo de Request**
```
GET /api/heavy-users?artistName=Bad%20Bunny&limit=5
```

**Ejemplo de Response**
```
[
  {
    "userId": "653f1e3f9e4f1b3c1a2b3e21",
    "username": "superfan_1",
    "email": "superfan1@example.com",
    "distinctSongs": 7
  },
  {
    "userId": "653f1e3f9e4f1b3c1a2b3e22",
    "username": "superfan_2",
    "email": "superfan2@example.com",
    "distinctSongs": 6
  }
]
```

