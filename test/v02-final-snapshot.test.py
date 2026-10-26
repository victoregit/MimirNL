"""Offline regression for private snapshots; never opens the retained fixture."""
import importlib.util
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('snapshot', Path(__file__).resolve().parents[1] / 'scripts/v02-final-snapshot.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SnapshotTests(unittest.TestCase):
    def test_private_hashes_detect_changes_without_disclosing_content_or_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            module.ROOT = Path(directory)
            private = module.ROOT / 'private'
            private.mkdir()
            db = private / 'host.sqlite'
            conn = sqlite3.connect(db)
            try:
                conn.executescript('CREATE TABLE projects(id); CREATE TABLE memories(id,project_id,scope,status,version,content); CREATE TABLE history(memory_id,version,snapshot); CREATE TABLE feedback(id,memory_id,note);')
                for mid in module.ORIGINALS:
                    conn.execute('INSERT INTO memories VALUES(?,NULL,\'project\',\'candidate\',1,\'PRIVATE_CONTENT\')', (mid,))
                conn.commit()
                before_bytes = db.read_bytes()
                first = module.snapshot()
                self.assertEqual(db.read_bytes(), before_bytes)
                self.assertNotIn('PRIVATE_CONTENT', json.dumps(first))
                conn.execute('INSERT INTO feedback VALUES(\'note-id\',?,\'PRIVATE_NOTE\')', (module.ORIGINALS[0],))
                conn.commit()
                second = module.snapshot()
                self.assertNotEqual(first['protected_originals'][0]['sha256'], second['protected_originals'][0]['sha256'])
                self.assertEqual(first['protected_originals'][1:], second['protected_originals'][1:])
                self.assertNotIn('PRIVATE_NOTE', json.dumps(second))
                conn.execute('DELETE FROM memories WHERE id=?', (module.ORIGINALS[0],))
                conn.commit()
                with self.assertRaisesRegex(ValueError, 'Protected original missing'):
                    module.snapshot()
            finally:
                conn.close()

    def test_missing_database_is_not_created(self):
        with tempfile.TemporaryDirectory() as directory:
            module.ROOT = Path(directory)
            with self.assertRaises(FileNotFoundError):
                module.snapshot()
            self.assertFalse((module.ROOT / 'private/host.sqlite').exists())


if __name__ == '__main__':
    unittest.main()
