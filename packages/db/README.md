# `@manifold/db`

## Create a DB Backup

    $ npm run dump

## Load a DB Backup

    $ cat dbdata/postgres-backups/<backup>.sql | psql postgres://postgres:postgres@localhost:5432/postgres
