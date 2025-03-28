# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm install

# Cópia dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Remoção de dependências de desenvolvimento
RUN npm prune --production

# Exposição da porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"] 