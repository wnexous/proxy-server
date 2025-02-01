const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;
const targetUrl = process.env.TARGET || 'http://n8n.bew2c.com:5678';

// Configuração simples do proxy, similar ao Nginx
const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: true,
    xfwd: true,
    followRedirects: true,
    proxyTimeout: 30000,
    timeout: 30000,
    headers: {
        'Host': 'www.bew2c.com',
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

// Aplica o proxy para todas as rotas
app.use('/', proxy);

app.listen(port, '0.0.0.0', () => {
    console.log(`Nginx-style proxy server running on port ${port}`);
});