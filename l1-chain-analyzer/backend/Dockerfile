# --- Stage 1: Build Frontend ---
FROM rust:1.78 as frontend-builder
WORKDIR /usr/src/app

# Install wasm-pack and trunk
RUN rustup target add wasm32-unknown-unknown
RUN curl https://trunkrs.dev/install.sh | bash

# Copy frontend source and build
COPY ./frontend ./frontend
RUN cd frontend && trunk build --release

# --- Stage 2: Build Backend ---
FROM rust:1.78 as backend-builder
WORKDIR /usr/src/app

# Copy backend source and build
COPY ./backend ./backend
RUN cd backend && cargo build --release

# --- Stage 3: Production Image ---
FROM debian:buster-slim
WORKDIR /app

# Copy assets from previous stages
COPY --from=frontend-builder /usr/src/app/frontend/dist ./dist
COPY --from=backend-builder /usr/src/app/backend/target/release/backend .
COPY ./backend/.env .

EXPOSE 8080
CMD ["./backend"] 