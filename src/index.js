require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const httpApp = express(); // App separado para HTTP
const port = process.env.PORT || 443; // Porta HTTPS
const httpPort = 80; // Porta HTTP para desafio ACME
const targetUrl = process.env.TARGET || 'http://n8n.bew2c.com:5678';

// Diretório para os arquivos de desafio do Let's Encrypt
const ACME_CHALLENGE_DIR = path.join(__dirname, '..', '.well-known', 'acme-challenge');

// Criar diretório para desafios ACME se não existir
if (!fs.existsSync(ACME_CHALLENGE_DIR)) {
    fs.mkdirSync(ACME_CHALLENGE_DIR, { recursive: true });
}

// Configuração SSL
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'certificate.crt')),
    ca: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'ca_bundle.crt'))
};

// Configuração do proxy
const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: true,
    xfwd: true,
    followRedirects: true,
    proxyTimeout: 30000,
    timeout: 30000,
    headers: {
        'Host': new URL(targetUrl).host,
        'X-Real-IP': '',
        'X-Forwarded-For': '',
        'X-Forwarded-Proto': 'https'
    },
    pathRewrite: {
        '^/': '/'
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).send('Bad Gateway');
    },
    logLevel: 'error'
});

// Configurar rota para desafio ACME no app HTTP
httpApp.use('/.well-known/acme-challenge', express.static(ACME_CHALLENGE_DIR));

// Redirecionar todo o tráfego HTTP para HTTPS, exceto desafio ACME
httpApp.use((req, res, next) => {
    if (!req.url.includes('.well-known/acme-challenge')) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Aplica o proxy para todas as rotas no app HTTPS
app.use('/', proxy);

// Criar servidores HTTP e HTTPS
const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer(sslOptions, app);

// Iniciar ambos os servidores
httpServer.listen(httpPort, '0.0.0.0', () => {
    console.log(`HTTP server running on port ${httpPort} (for ACME challenge)`);
});

httpsServer.listen(port, '0.0.0.0', () => {
    console.log(`HTTPS proxy server running on port ${port}`);
    console.log(`Target: ${targetUrl}`);
});