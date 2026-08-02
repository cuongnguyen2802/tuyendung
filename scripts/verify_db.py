import psycopg2
conn = psycopg2.connect(host='127.0.0.1', port=5433, user='postgres', password='tuyendung123', dbname='tuyendung')
cur = conn.cursor()
cur.execute("SELECT current_database(), current_user, version();")
row = cur.fetchone()
print(f"[OK] Connected to: {row[0]} as {row[1]}")
print(f"[OK] Version: {row[2][:40]}")
cur.close()
conn.close()
