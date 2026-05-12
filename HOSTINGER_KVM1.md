# Hostinger KVM 1 deployment

This project is prepared for a Hostinger VPS `KVM 1` deployment using Docker Compose and Caddy.

## Why this shape

Hostinger's current `KVM 1` plan lists `1 vCPU`, `4 GB RAM`, `50 GB NVMe`, and `4 TB bandwidth`, and Hostinger's VPS docs support a Docker-based workflow on their Ubuntu 24.04 Docker template. A small three-container stack fits that plan well when we keep Node memory modest and avoid exposing the database publicly.

Sources:

- https://www.hostinger.com/vps-hosting
- https://www.hostinger.com/support/8306612-how-to-use-the-docker-vps-template-at-hostinger/
- https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/

## What is included

- `docker-compose.hostinger.yml`
- `ops/caddy/Caddyfile`
- Production Dockerfiles for `frontend` and `backend`
- Prisma baseline migration for first deploy
- Example environment files

## Recommended Hostinger setup

1. Create the VPS using the Docker template if available, or Ubuntu 24.04 if you prefer to install Docker yourself.
2. Point your domain's `A` record to the VPS public IP before bringing up Caddy.
3. Clone this repository on the VPS.
4. Copy `.env.hostinger.example` to `.env.hostinger` and fill in real secrets.
5. Start the stack:

```bash
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml up -d --build
```

6. Seed the database if you want initial data:

```bash
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml exec backend npm run seed
```

## Runtime notes

- Caddy terminates HTTPS automatically once the domain resolves to the VPS and ports `80` and `443` are open.
- Only Caddy is exposed publicly. Postgres stays internal to the Docker network.
- The frontend is built for same-origin API access with `NEXT_PUBLIC_API_URL=/api`.
- The backend applies Prisma migrations automatically on container start.
- Container memory usage is nudged down with `NODE_OPTIONS` values that fit a 4 GB VPS more comfortably.

## Useful commands

```bash
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml ps
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml logs -f
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml pull
docker compose --env-file .env.hostinger -f docker-compose.hostinger.yml up -d --build
```

## First-server checklist

- Open firewall ports `22`, `80`, and `443`
- Use an SSH key and disable password login when you can
- Keep the Groq key only in `.env.hostinger`
- Set up Hostinger snapshots or backups before later schema changes
