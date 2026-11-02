"""Run with Flask installed; uses sample records and no database."""
import importlib.util
from pathlib import Path
import sys
import unittest

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('people_preview', root / 'scripts/preview.py')
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


class PreviewTests(unittest.TestCase):
    def setUp(self):
        self.client = preview.app.test_client()

    def test_pages_and_assets(self):
        for path in ['/', '/users', '/edit/1', '/static/style.css', '/static/app.js']:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                response.close()

    def test_forms_do_not_modify_sample_records(self):
        original = list(preview.people)
        for path in ['/create', '/edit/1']:
            response = self.client.post(path, data={'name': 'Changed', 'email': 'changed@example.com'}, follow_redirects=True)
            self.assertIn(b'changes are not saved', response.data)
            self.assertEqual(preview.people, original)

    def test_no_database_backend_or_delete_endpoint(self):
        self.assertNotIn('psycopg2', sys.modules)
        self.assertNotIn('dotenv', sys.modules)
        self.assertFalse(hasattr(preview, 'get_db_connection'))
        self.assertEqual(self.client.get('/delete/1').status_code, 404)
        self.assertEqual(self.client.get('/edit/999').status_code, 404)


if __name__ == '__main__':
    unittest.main()
