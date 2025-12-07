/**
 * SEMILLA DE DATOS PARA EXAMEN PARCIAL - APPLE MUSIC
 * Autor: Catedrático (Asistido por Gemini)
 * Instrucciones:
 * 1. Crear carpeta, correr `npm init -y`
 * 2. Instalar dependencias: `npm install mongodb @faker-js/faker`
 * 3. Asegurar que Docker con Mongo esté corriendo en el puerto 27017
 * 4. Ejecutar: `node seed.js` 
 */

const { MongoClient, ObjectId } = require('mongodb');
const { faker } = require('@faker-js/faker');

// Configuración
const URI = 'mongodb://localhost:27017';
const DB_NAME = 'apple_music_db';

// Datos Maestros (Hardcoded para asegurar consistencia en el examen)
const ARTISTS_DATA = [
    { name: "Bad Bunny", genre: "Reggaeton" },
    { name: "Taylor Swift", genre: "Pop" },
    { name: "Metallica", genre: "Metal" },
    { name: "Ricardo Arjona", genre: "Balada" }, // Para probar filtro regional GT
    { name: "Feid", genre: "Reggaeton" }
];

async function run() {
    const client = new MongoClient(URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        console.log("🚀 Conectado a MongoDB. Limpiando colecciones viejas...");

        // 1. Limpiar DB
        await db.collection('users').deleteMany({});
        await db.collection('artists').deleteMany({});
        await db.collection('songs').deleteMany({});
        await db.collection('streams').deleteMany({});

        // 2. Crear Artistas y Canciones
        console.log("🎵 Generando Catálogo Musical...");
        let allSongs = [];
        
        for (const artistData of ARTISTS_DATA) {
            const artistId = new ObjectId();
            
            // Insertar Artista
            await db.collection('artists').insertOne({
                _id: artistId,
                name: artistData.name,
                genre: artistData.genre,
                followers: faker.number.int({ min: 1000, max: 5000000 })
            });

            // Generar 10 canciones por artista
            for (let i = 0; i < 10; i++) {
                const song = {
                    _id: new ObjectId(),
                    title: faker.music.songName(),
                    artist_id: artistId, // REFERENCIA
                    artist_name: artistData.name, // PATRÓN: EXTENDED REFERENCE (Para evitar $lookups simples)
                    genre: artistData.genre,
                    duration_seconds: faker.number.int({ min: 120, max: 300 }),
                    release_date: faker.date.past({ years: 5 })
                };
                allSongs.push(song);
            }
        }
        await db.collection('songs').insertMany(allSongs);

        // 3. Crear Usuarios (Diseñados para cumplir requisitos demográficos)
        console.log("👥 Generando Usuarios...");
        let allUsers = [];
        
        for (let i = 0; i < 100; i++) {
            const isGT = Math.random() > 0.3; // 70% probabilidad de ser de Guatemala (para el Top 10 GT)
            
            const user = {
                _id: new ObjectId(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                country: isGT ? 'GT' : faker.location.countryCode(),
                birth_date: faker.date.birthdate({ min: 15, max: 50, mode: 'age' }), // Para query de edad
                subscription: Math.random() > 0.2 ? 'Premium' : 'Free', // Para query de Zombis
                created_at: faker.date.past({ years: 2 })
            };
            allUsers.push(user);
        }
        await db.collection('users').insertMany(allUsers);

        // 4. Generar Streams (La parte compleja)
        console.log("▶️ Simulando Reproducciones (Streams)...");
        let streams = [];

        // TRUCO PARA EXAMEN:
        // Seleccionamos solo los primeros 80 usuarios. 
        // Los últimos 20 NO tendrán streams. ¡Ellos son los "ZOMBIES"!
        const activeUsers = allUsers.slice(0, 80); 

        for (const user of activeUsers) {
            // Cada usuario activo escucha entre 20 y 100 canciones
            const numberOfStreams = faker.number.int({ min: 20, max: 100 });

            for (let k = 0; k < numberOfStreams; k++) {
                // Seleccionar canción aleatoria
                const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
                
                // Ponderación: Hacer que escuchen más a Bad Bunny para la query de "Heavy Users"
                const finalSong = (Math.random() > 0.8 && randomSong.artist_name !== 'Bad Bunny') 
                    ? allSongs.find(s => s.artist_name === 'Bad Bunny') // Forzar Bad Bunny a veces
                    : randomSong;

                streams.push({
                    user_id: user._id,
                    song_id: finalSong._id,
                    // Guardamos redundancia para facilitar analítica (Bucket Pattern light)
                    artist_id: finalSong.artist_id, 
                    date: faker.date.recent({ days: 60 }), // Últimos 60 días
                    device: faker.helpers.arrayElement(['iPhone', 'Android', 'Web']),
                    seconds_played: finalSong.duration_seconds // Asumimos que la escuchó completa
                });
            }
        }

        // Insertar en lotes para eficiencia
        await db.collection('streams').insertMany(streams);

        console.log(`✅ EXITO: Base de datos poblada.`);
        console.log(`   - ${allUsers.length} Usuarios (20 son Zombies sin streams)`);
        console.log(`   - ${allSongs.length} Canciones`);
        console.log(`   - ${streams.length} Streams generados`);
        console.log("---------------------------------------------------");
        console.log("TIPS PARA EL ALUMNO:");
        console.log("1. Revisa los usuarios que NO están en la colección 'streams'.");
        console.log("2. Observa que 'songs' tiene el nombre del artista embebido.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
