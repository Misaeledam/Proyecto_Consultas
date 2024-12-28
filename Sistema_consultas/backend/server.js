const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 1433;

// leer configuracion de base de datos
const configPath = path.join(__dirname, 'config.txt');

function loadDbConfig() {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const configLines = configContent.split('\n').filter(line => line.trim() !== '');
    const config = {};

    configLines.forEach(line => {
        const [key, value] = line.split('=');
        config[key.trim()] = value.trim();
    });

    return {
        user: config.user,
        password: config.password,
        server: config.server,
        database: config.database,
        options: {
            encrypt: config.encrypt === 'true',
            trustServerCertificate: config.trustServerCertificate === 'true',
        },
    };
}

const dbConfig = loadDbConfig();

// middleware
app.use(cors());
app.use(express.json());

// poner la carpeta frontend como contenido estatico
app.use(express.static(path.join(__dirname, 'frontend')));

// redirigir la raiz al archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ruta para consultar productos
app.get('/api/productos', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send({ message: 'Falta parámetro de query' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('query', sql.VarChar, `%${query}%`)
            .query(`
                SELECT idProducto, codigo, nombreProducto, precio
                FROM PRODUCTO
                WHERE codigo LIKE @query
                OR codigoBarra LIKE @query
                OR nombreProducto LIKE @query
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error conectando a la base de datos', error: err.message });
    }
});

// configuracion de HTTPS
const httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

https.createServer(httpsOptions, app).listen(port, '0.0.0.0', () => {
    console.log(`El servidor HTTPS esta corriendo en https://<IP_LOCAL>:${port}`);
});
