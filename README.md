# Estrutura Simplificada

Uma estrutura base para aplicações Node.js com TypeScript, incluindo middlewares, autenticação, cache, compressão, monitoramento e mais.

## Características

- TypeScript
- Express
- PostgreSQL
- Redis
- JWT
- OCR
- Email
- Cache
- Compressão
- Monitoramento
- Segurança
- Validação
- Testes
- Docker
- Nginx
- PM2

## Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7
- Docker (opcional)
- Docker Compose (opcional)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/estrutura-simplificada.git
cd estrutura-simplificada
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados:
```bash
createdb estrutura_simplificada
```

5. Inicie o Redis:
```bash
redis-server
```

## Desenvolvimento

1. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

2. Execute os testes:
```bash
npm test
```

3. Verifique a cobertura de testes:
```bash
npm run test:coverage
```

4. Execute o linting:
```bash
npm run lint
```

5. Formate o código:
```bash
npm run format
```

## Docker

1. Construa a imagem:
```bash
npm run docker:build
```

2. Inicie os containers:
```bash
npm run docker:up
```

3. Pare os containers:
```bash
npm run docker:down
```

4. Visualize os logs:
```bash
npm run docker:logs
```

## Produção

1. Construa a aplicação:
```bash
npm run build
```

2. Inicie o servidor:
```bash
npm start
```

## Estrutura do Projeto

```
src/
├── config/         # Configurações
├── lib/            # Bibliotecas e serviços
├── middleware/     # Middlewares
├── routes/         # Rotas
├── controllers/    # Controladores
├── models/         # Modelos
├── services/       # Serviços
├── utils/          # Utilitários
├── types/          # Tipos TypeScript
├── app.ts          # Aplicação Express
└── index.ts        # Ponto de entrada
```

## Middlewares

### Segurança
- CORS
- Helmet
- Rate Limiting
- Sanitização
- Headers de Segurança
- Validação de IP e User Agent

### Cache
- Cache Genérico
- Cache por Rota
- Cache por Query
- Cache Parcial
- Cache Condicional

### Compressão
- Compressão Genérica
- Compressão por Tipo
- Compressão por Tamanho
- Compressão por Rota
- Compressão por Método

### Monitoramento
- Métricas
- Performance
- Recursos
- Segurança
- Estatísticas

### Autenticação
- JWT
- Roles
- Tokens Especiais
- Lista Negra
- Validação

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/estrutura-simplificada](https://github.com/seu-usuario/estrutura-simplificada)
