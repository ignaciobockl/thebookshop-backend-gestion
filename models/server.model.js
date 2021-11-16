const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const { dbConnection } = require('../database/config');

const {
    usuarioPorDefecto,
    provinciasPorDefecto
} = require('../helpers/defecto');


class Server {

    constructor() {

        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
            auth: '/api/auth',
            autores: '/api/autores',
            buscar: '/api/buscar',
            categorias: '/api/categorias',
            comprobantes: '/api/comprobantes',
            cupones: '/api/cupones',
            editoriales: '/api/editoriales',
            eventos: '/api/eventos',
            // mercadopago: '/api/mercadopago',
            nodemailers: '/api/nodemailers',
            preguntasFrecuentes: '/api/preguntasFrecuentes',
            productos: '/api/productos',
            provincias: '/api/provincias',
            subCategorias: '/api/subcategorias',
            uploads: '/api/uploads',
            usuarios: '/api/usuarios'
        }

        // Conectar a Base de Datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicacion
        this.routes();
    }


    async conectarDB() {
        await dbConnection();

        // Generar data por defecto
        this.defect();
    }

    middlewares() {

        // CORS
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json());

        // Directorio público
        this.app.use(express.static('public'));

        // Fileupload - Carga de archivos
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }

    routes() {

        // Manejar rutas E-Commerce
        this.app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'public/index.html'));
        });

        this.app.use(this.paths.auth, require('../routes/auth.routes'));
        this.app.use(this.paths.autores, require('../routes/autores.routes'));
        this.app.use(this.paths.buscar, require('../routes/buscar.routes'));
        this.app.use(this.paths.categorias, require('../routes/categoria.routes'));
        this.app.use(this.paths.comprobantes, require('../routes/comprobante.routes'));
        this.app.use(this.paths.cupones, require('../routes/cuponDescuento.routes'));
        this.app.use(this.paths.editoriales, require('../routes/editoriales.routes'));
        this.app.use(this.paths.eventos, require('../routes/evento.routes'));
        // this.app.use( this.paths.mercadopago, require('../routes/mercadopago.routes'));
        this.app.use(this.paths.nodemailers, require('../routes/nodemailer.routes'));
        this.app.use(this.paths.subCategorias, require('../routes/subCategorias.routes'));
        this.app.use(this.paths.preguntasFrecuentes, require('../routes/preguntaFrecuente.routes'));
        this.app.use(this.paths.productos, require('../routes/productos.routes'));
        this.app.use(this.paths.provincias, require('../routes/provincia.routes'));
        this.app.use(this.paths.uploads, require('../routes/uploads.routes'));
        this.app.use(this.paths.usuarios, require('../routes/usuarios.routes'));

    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }

    async defect() {
        await usuarioPorDefecto();
        await provinciasPorDefecto();
    }
}

module.exports = Server;