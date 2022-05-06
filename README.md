# Project start

In project root folder

### Install dependencies

```bash
npm  install
```

### Relevant only if postgres is used with docker

```bash
docker-compose up -d
```

### Enviroment variables

You can use .env.example as template. Please do not change PORT, HOST, NODE_ENV, APP_KEY and DRIVE_DISK variables.
If you use our docker-compose file, just copy the .env.example content into .env file. Otherwise please set up your own
variablees for postgres connection.

### Migrate db and seed data

```bash
npm run seed
```

### Run dev mode

```bash
npm run dev
```
