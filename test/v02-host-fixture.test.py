"""Offline verifier regressions; never invoke an authenticated model host."""
import importlib.util
import sys
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('fixture', Path(__file__).resolve().parents[1] / 'scripts/v02-host-fixture.py')
fixture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixture)


class DatabaseEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.db = Path(self.temp.name) / 'synthetic.sqlite'
        with closing(sqlite3.connect(self.db)) as c, c:
            c.executescript('CREATE TABLE memories(id,project_id,scope,status,content);'
                            'CREATE TABLE feedback(memory_id,action,note);')

    def verify(self):
        return fixture.verify_database(self.db)['database_assertions_passed']

    def seed(self, status='candidate', scope='project', action='note'):
        with closing(sqlite3.connect(self.db)) as c, c:
            c.execute('INSERT INTO memories VALUES(?,?,?,?,?)', ('id', 'project', scope, status, fixture.CONTENT))
            c.execute('INSERT INTO feedback VALUES(?,?,?)', ('id', action, 'synthetic host check'))

    def test_empty_database_is_not_acceptance(self):
        self.assertFalse(self.verify())

    def test_candidate_with_note_and_no_global_copy(self):
        self.seed()
        before = self.db.read_bytes()
        self.assertTrue(self.verify())
        self.assertEqual(before, self.db.read_bytes())

    def test_promoted_or_verified_state_is_rejected(self):
        for status, scope, action in [('verified', 'project', 'note'), ('candidate', 'global', 'note'),
                                       ('candidate', 'project', 'approve')]:
            with self.subTest(status=status, scope=scope, action=action):
                self.seed(status, scope, action)
                self.assertFalse(self.verify())
                with closing(sqlite3.connect(self.db)) as c, c:
                    c.executescript('DELETE FROM feedback; DELETE FROM memories;')

    def test_missing_database_is_not_created(self):
        absent = Path(self.temp.name) / 'absent.sqlite'
        with self.assertRaises(sqlite3.OperationalError):
            fixture.verify_database(absent)
        self.assertFalse(absent.exists())

    def test_allowlist_omits_administrative_and_deletion_tools(self):
        self.assertTrue({'project_register', 'project_ingest', 'memory_feedback'} <= set(fixture.TOOLS))
        self.assertFalse({'memory_delete', 'project_delete', 'backup', 'restore', 'doctor'} & set(fixture.TOOLS))


if __name__ == '__main__':
    unittest.main()
