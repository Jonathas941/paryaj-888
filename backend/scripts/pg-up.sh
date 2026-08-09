#!/bin/bash
# End-to-end smoke test of the money path against a real Postgres.
set -e

export PGBIN=/usr/lib/postgresql/15/bin
export PGDATA=/tmp/pgdata
export PGPORT=55432
export DATABASE_URL="postgresql://postgres@localhost:$PGPORT/paryaj_test"

if [ ! -d "$PGDATA" ]; then
  mkdir -p "$PGDATA" /tmp/pgrun
  chown -R postgres:postgres "$PGDATA" /tmp/pgrun
  su postgres -c "$PGBIN/initdb -D $PGDATA -A trust -U postgres" >/dev/null
fi

chown -R postgres:postgres "$PGDATA" /tmp/pgrun 2>/dev/null || true
su postgres -c "$PGBIN/pg_ctl -D $PGDATA -o '-p $PGPORT -k /tmp/pgrun' -l /tmp/pg.log -w start" >/dev/null 2>&1 || true
sleep 2
su postgres -c "$PGBIN/psql -p $PGPORT -h /tmp/pgrun -U postgres -c 'DROP DATABASE IF EXISTS paryaj_test'" >/dev/null 2>&1 || true
su postgres -c "$PGBIN/psql -p $PGPORT -h /tmp/pgrun -U postgres -c 'CREATE DATABASE paryaj_test'" >/dev/null 2>&1

echo "postgres up on $PGPORT"
