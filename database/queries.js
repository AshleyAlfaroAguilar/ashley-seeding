// database/queries.js 
// Consultas de negocio - Caso Apple Music

const { MongoClient } = require("mongodb");

const URI = "mongodb://localhost:27017";
const DB_NAME = "apple_music_db";

async function main() {
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log("Conectado a MongoDB para ejecutar agregaciones.\n");

    await reporteRegaliasUltimoMes(db);
    await top10Guatemala(db);
    await usuariosZombis(db);
    await demografiaReggaeton(db);
    await heavyUsersBadBunny(db);

  } catch (err) {
    console.error("Error ejecutando las consultas:", err);
  } finally {
    process.exit(0);
  }
}

/**
 * 1) Reporte de Regalías (Royalties)
 * Pregunta:
 *  "¿Cuánto tiempo total (en segundos) se ha reproducido cada artista
 *   en el último mes?"
 */
async function reporteRegaliasUltimoMes(db) {
  console.log("1) Reporte de Regalías - Últimos 30 días");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pipeline = [
    {
      $match: { date: { $gte: thirtyDaysAgo } }
    },
    {
      $lookup: {
        from: "songs",
        localField: "song_id",
        foreignField: "_id",
        as: "song"
      }
    },
    { $unwind: "$song" },
    {
      $group: {
        _id: "$song.artist_id",
        artistName: { $first: "$song.artist_name" },
        totalSecondsPlayed: { $sum: "$seconds_played" },
        totalStreams: { $sum: 1 }
      }
    },
    {
      $sort: { totalSecondsPlayed: -1 }
    }
  ];

  const results = await db.collection("streams").aggregate(pipeline).toArray();

  console.table(
    results.map((r) => ({
      Artista: r.artistName,
      "Segundos Totales": r.totalSecondsPlayed,
      "Cantidad de Streams": r.totalStreams
    }))
  );

  console.log("\n");
}

/**
 * 2) Top 10 Regional - Guatemala
 * Pregunta:
 *  "¿Cuáles son las 10 canciones más escuchadas en 'Guatemala'
 *   en los últimos 7 días?"
 */
async function top10Guatemala(db) {
  console.log("2) Top 10 canciones en Guatemala - Últimos 7 días");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const pipeline = [
    // Streams últimos 7 días
    {
      $match: {
        date: { $gte: sevenDaysAgo }
      }
    },
    // Unir con usuarios para saber país
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    // Solo usuarios de Guatemala (código GT)
    {
      $match: {
        "user.country": "GT"
      }
    },
    // Unir con canciones para título y artista
    {
      $lookup: {
        from: "songs",
        localField: "song_id",
        foreignField: "_id",
        as: "song"
      }
    },
    { $unwind: "$song" },
    // Agrupar por canción
    {
      $group: {
        _id: "$song._id",
        title: { $first: "$song.title" },
        artistName: { $first: "$song.artist_name" },
        totalStreams: { $sum: 1 }
      }
    },
    // Ordenar por cantidad de streams
    {
      $sort: { totalStreams: -1 }
    },
    // Top 10
    {
      $limit: 10
    }
  ];

  const results = await db.collection("streams").aggregate(pipeline).toArray();

  console.table(
    results.map((r, index) => ({
      Posición: index + 1,
      Canción: r.title,
      Artista: r.artistName,
      Streams: r.totalStreams
    }))
  );

  console.log("\n");
}

/**
 * 3) Usuarios Zombis (Churn Risk)
 * Pregunta:
 *  "Listar usuarios que tienen suscripción 'Premium',
 *   pero que NO han reproducido ninguna canción en los últimos 30 días."
 */
async function usuariosZombis(db) {
  console.log("3) Usuarios Zombis (Premium sin actividad en 30 días)");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pipeline = [
    // Primero filtramos solo usuarios Premium
    {
      $match: { subscription: "Premium" }
    },

    // Hacemos LEFT JOIN con Streams (lookup) para ver actividad
    {
      $lookup: {
        from: "streams",
        localField: "_id",
        foreignField: "user_id",
        as: "streamsRecientes"
      }
    },

    // Filtramos los streams a los últimos 30 días
    {
      $addFields: {
        streamsFiltrados: {
          $filter: {
            input: "$streamsRecientes",
            as: "s",
            cond: { $gte: ["$$s.date", thirtyDaysAgo] }
          }
        }
      }
    },

    // Usuario zombie = no tiene streams en últimos 30 días
    {
      $match: {
        "streamsFiltrados.0": { $exists: false }
      }
    },

    // Campos que queremos mostrar
    {
      $project: {
        _id: 1,
        username: 1,
        email: 1,
        country: 1,
        subscription: 1
      }
    }
  ];

  const results = await db.collection("users").aggregate(pipeline).toArray();

  console.table(
    results.map((u) => ({
      Usuario: u.username,
      Email: u.email,
      País: u.country,
      Subscripción: u.subscription
    }))
  );

  console.log("\n");
}

/**
 * 4) Análisis de Demografía por Género (Reggaeton)
 * Pregunta:
 *  "De todos los usuarios que escuchan 'Reggaeton',
 *   ¿cuál es la distribución por edades?"
 */
async function demografiaReggaeton(db) {
  console.log("4) Demografía de usuarios que escuchan Reggaeton (rangos de edad)");

  const pipeline = [
    // Partimos de streams
    {
      $lookup: {
        from: "songs",
        localField: "song_id",
        foreignField: "_id",
        as: "song"
      }
    },
    { $unwind: "$song" },

    // Solo canciones de género Reggaeton
    {
      $match: {
        "song.genre": "Reggaeton"
      }
    },

    // Unimos con usuarios
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    // Evitar contar varias veces al mismo usuario: 1 registro por usuario
    {
      $group: {
        _id: "$user._id",
        birth_date: { $first: "$user.birth_date" }
      }
    },

    // Calculamos edad aproximada en años
    {
      $addFields: {
        age: {
          $dateDiff: {
            startDate: "$birth_date",
            endDate: "$$NOW",
            unit: "year"
          }
        }
      }
    },

    // Clasificamos en rangos de edad
    {
      $addFields: {
        ageRange: {
          $switch: {
            branches: [
              {
                case: { $and: [{ $gte: ["$age", 15] }, { $lte: ["$age", 20] }] },
                then: "15-20"
              },
              {
                case: { $and: [{ $gte: ["$age", 21] }, { $lte: ["$age", 30] }] },
                then: "21-30"
              },
              {
                case: { $and: [{ $gte: ["$age", 31] }, { $lte: ["$age", 40] }] },
                then: "31-40"
              },
              {
                case: { $and: [{ $gte: ["$age", 41] }, { $lte: ["$age", 50] }] },
                then: "41-50"
              }
            ],
            default: "Otros"
          }
        }
      }
    },

    // Contamos usuarios por rango
    {
      $group: {
        _id: "$ageRange",
        usuarios: { $sum: 1 }
      }
    },

    // Segundo group para calcular el total y poder sacar porcentajes
    {
      $group: {
        _id: null,
        total: { $sum: "$usuarios" },
        rangos: {
          $push: {
            rango: "$_id",
            usuarios: "$usuarios"
          }
        }
      }
    },
    { $unwind: "$rangos" },

    // Calculamos porcentaje por rango
    {
      $project: {
        _id: 0,
        Rango: "$rangos.rango",
        Usuarios: "$rangos.usuarios",
        Porcentaje: {
          $round: [
            {
              $multiply: [
                { $divide: ["$rangos.usuarios", "$total"] },
                100
              ]
            },
            2
          ]
        }
      }
    },

    // Ordenamos por rango (alfabético)
    {
      $sort: { Rango: 1 }
    }
  ];

  const results = await db.collection("streams").aggregate(pipeline).toArray();

  console.table(results);
  console.log("\n");
}

/**
 * 5) Heavy Users de Bad Bunny
 * Pregunta:
 * "¿Cuáles son los 5 usuarios que más canciones distintas han escuchado del artista 'Bad Bunny'?"
 */
async function heavyUsersBadBunny(db) {
  console.log("5) Heavy Users de Bad Bunny (Top 5)");

  const pipeline = [
    // Unimos streams -> songs para obtener info de la canción
    {
      $lookup: {
        from: "songs",
        localField: "song_id",
        foreignField: "_id",
        as: "song"
      }
    },
    { $unwind: "$song" },

    // Filtrar solo canciones de Bad Bunny
    {
      $match: {
        "song.artist_name": "Bad Bunny"
      }
    },

    // Agrupamos por usuario y acumulamos IDs de canciones distintas
    {
      $group: {
        _id: "$user_id",
        cancionesDistintas: { $addToSet: "$song._id" }
      }
    },

    // Creamos campo con el conteo de canciones distintas
    {
      $addFields: {
        totalCancionesDistintas: { $size: "$cancionesDistintas" }
      }
    },

    // Ordenamos de mayor a menor
    {
      $sort: {
        totalCancionesDistintas: -1
      }
    },

    // Limitamos a Top 5
    {
      $limit: 5
    },

    // Unimos con usuarios para extraer username y email
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    // Campos finales
    {
      $project: {
        _id: 0,
        Usuario: "$user.username",
        Email: "$user.email",
        CancionesDistintas: "$totalCancionesDistintas"
      }
    }
  ];

  const results = await db.collection("streams").aggregate(pipeline).toArray();

  console.table(results);
  console.log("\n");
}


// Ejecutar
main();
