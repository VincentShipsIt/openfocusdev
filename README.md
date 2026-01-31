# TaskFlow

A full-stack, cross-platform task management application.

## Architecture

This repository follows an **OSS + SaaS** split:

| Directory | License | Description |
|-----------|---------|-------------|
| [`core/`](./core/) | MIT | Open-source core — API, Web, Mobile, Desktop |
| [`cloud/`](./cloud/) | Proprietary | Premium SaaS features extending the core |

## Quick Start

```bash
# Run the open-source core
cd core
bun install
bun run dev

# Or from root (proxies to core)
bun run dev
```

## Tech Stack

- **API** — NestJS + MongoDB + Clerk Auth
- **Web** — Next.js 16 + Tailwind CSS + Radix UI
- **Mobile** — Expo (React Native)
- **Desktop** — Electron

## Contributing

Contributions go to the `core/` directory. See [core/README.md](./core/README.md).

## License

Core is MIT licensed. Cloud features are proprietary.
