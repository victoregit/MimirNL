#!/usr/bin/env python3
"""Read-only, content-free snapshot of the retained synthetic acceptance database."""
import hashlib
import json
from pathlib import Path
import sqlite3
from contextlib import closing

ROOT = Path('/tmp/mimir-v02-xx0ph1vg')
ORIGINALS = ['f0f7a064-4d94-4e2e-987f-4a75df6d17cb',
             '87869bcb-fbc6-4c43-8340-2a65d29d5e4c',
             '51f48c5b-829e-417a-a495-5b12332f9188']


def snapshot():
    db = (ROOT / 'private/host.sqlite').resolve(strict=True)
    if db != ROOT / 'private/host.sqlite':
        raise ValueError('Unexpected database link')
    with closing(sqlite3.connect(db.as_uri() + '?mode=ro', uri=True)) as conn:
        conn.execute('BEGIN')  # One coherent read snapshot; never opens writable mode.
        conn.row_factory = sqlite3.Row
        totals = {table: conn.execute(f'SELECT count(*) FROM {table}').fetchone()[0]
                  for table in ['projects', 'memories', 'feedback']}
        totals['globals'] = conn.execute("SELECT count(*) FROM memories WHERE scope='global'").fetchone()[0]
        originals = []
        for mid in ORIGINALS:
            row = conn.execute('SELECT * FROM memories WHERE id=?', (mid,)).fetchone()
            if row is None:
                raise ValueError('Protected original missing')
            # Hash full original + history/feedback without copying content or source paths.
            payload = {'memory': dict(row),
                       'history': [dict(r) for r in conn.execute('SELECT * FROM history WHERE memory_id=? ORDER BY version', (mid,))],
                       'feedback': [dict(r) for r in conn.execute('SELECT * FROM feedback WHERE memory_id=? ORDER BY id', (mid,))]}
            digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
            originals.append({'id': mid, 'status': row['status'], 'version': row['version'], 'sha256': digest})
        records = [dict(r) for r in conn.execute('SELECT id,project_id,scope,status,version FROM memories ORDER BY id')]
        return {'fixture': str(ROOT), 'totals': totals, 'protected_originals': originals, 'records': records,
                'claim': 'read-only database state; does not prove host permissions or tool invocation'}


if __name__ == '__main__':
    print(json.dumps(snapshot(), indent=2))
