# Fase de Construcción
FROM node:20 AS builder

WORKDIR /app

# Copiar package.json y package-lock.json (o yarn.lock)
# para instalar dependencias primero
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Aceptar la API_KEY como argumento de construcción
ARG API_KEY
# Establecer la API_KEY como variable de entorno, necesaria para la fase de build de Vite
ENV API_KEY=$API_KEY
# Aumentar la memoria para Node.js durante la construcción (para evitar fallos de memoria con bundlers)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Construir la aplicación
RUN npm run build

# Fase de Producción (Servidor)
FROM node:20-alpine

WORKDIR /app

# Instalar 'serve' globalmente para servir archivos estáticos
RUN npm install -g serve

# Copiar los archivos de construcción desde la fase 'builder'
COPY --from=builder /app/dist ./dist

# Exponer el puerto que usará Cloud Run
EXPOSE 8080

# Comando para iniciar la aplicación, escuchando en el puerto asignado por Cloud Run ($PORT)
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:${PORT:-8080}"]