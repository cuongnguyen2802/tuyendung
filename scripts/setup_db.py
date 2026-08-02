import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn = psycopg2.connect(host='127.0.0.1', port=5433, user='postgres', dbname='postgres')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

cur.execute("ALTER USER postgres WITH PASSWORD 'tuyendung123';")
print('[OK] Password set for postgres -> tuyendung123')

cur.execute("SELECT 1 FROM pg_database WHERE datname='tuyendung';")
if not cur.fetchone():
    cur.execute('CREATE DATABASE tuyendung;')
    print('[OK] Database tuyendung created')
else:
    print('[OK] Database tuyendung already exists')

cur.close()
conn.close()
print('[DONE] PostgreSQL setup complete')
