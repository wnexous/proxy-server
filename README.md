# Reverse Proxy Server

Este é um servidor proxy reverso que redireciona requisições para um servidor de destino específico.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

O servidor iniciará na porta 3000 por padrão, ou na porta definida pela variável de ambiente `PORT`.

## Deploy

### Render.com
1. Conecte seu repositório GitHub ao Render
2. Crie um novo Web Service
3. Use `npm install` como comando de build
4. Use `npm start` como comando de start
5. Defina a variável de ambiente PORT se necessário

### Vercel
1. Instale o Vercel CLI: `npm i -g vercel`
2. Execute `vercel` na raiz do projeto
3. Siga as instruções do CLI

## Variáveis de Ambiente
- `PORT`: Porta em que o servidor irá rodar (opcional, padrão: 3000)
