# Travel Weather App

Monorepo containing a React + Relay frontend and a Node GraphQL backend.

## Development

- Install and validate:

```bash
vp install
vp check
vp run test -r
```

- Run the frontend:

```bash
vp run website#dev
```

- In a second terminal, watch Relay artifacts while editing frontend GraphQL:

```bash
vp run website#relay:watch
```

- Run the GraphQL API:

```bash
vp run api#dev
```

- Build the monorepo:

```bash
vp run build -r
```
