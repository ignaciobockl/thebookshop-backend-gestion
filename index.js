require('dotenv').config();

const Server = require('./models/server.model');


const server = new Server();


server.listen();

// const { dbConnection } = require('./database/config');

// // Crear el servidor de express
// const app = express();

// // Configurar cord
// app.use( cors() );

// // Lectura y parseo del body
// app.use( express.json() );

// // Base de datos
// dbConnection();

// // Rutas
// app.use( '/api/usuarios', require('./routes/usuarios.routes') );
// app.use( '/api/login', require('./routes/auth.routes') );


// app.listen( process.env.PORT, () => {
//     console.log('Servidor corriendo en el puerto ' + process.env.PORT);
// });