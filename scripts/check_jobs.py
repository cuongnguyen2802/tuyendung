import psycopg2
conn = psycopg2.connect(host='127.0.0.1', port=5433, database='tuyendung', user='postgres', password='tuyendung123')
cur = conn.cursor()
cur.execute('SELECT id, title, status FROM "Job" LIMIT 10')
rows = cur.fetchall()
print(f'Found {len(rows)} jobs:')
for r in rows:
    print(f'  {r[1]} - {r[2]}')
cur.close()
conn.close()
