# Use the official Rust image as a base
FROM rust:1.78 as builder

WORKDIR /usr/src/app
COPY . .

# Build the project
RUN cargo build --release

# Production image
FROM debian:buster-slim
WORKDIR /app

# Copy assets from previous stages
COPY --from=builder /usr/src/app/target/release/backend .
COPY ./.env .

EXPOSE 8080
CMD ["./backend"] 