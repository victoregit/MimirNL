"""Offline public DEV byte accounting; no executor imports or model calls. Review128 pending."""
import hashlib
import json
from pathlib import Path
import sys
import tarfile
import io
import unittest

ROOT = Path('/mnt/d/Projects/MimirNL')
OUT = ROOT / 'tasks/127-offline-diagnosis'
MANIFEST = 'docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json'
SNAPSHOT = 'docs/benchmarks/v03/evidencias/task103-executed-snapshot.tar'
POSITIONS = [f'docs/benchmarks/v03/evidencias/task103/offline-replay/position-{i:02}.json' for i in (1, 3, 8)]
SOURCES = ['src/core/service.ts', 'src/retrieval/index.ts', 'src/optimization/index.ts', 'scripts/benchmarks/contract-v02.mjs', 'scripts/benchmarks/abc-runtime.mjs', 'scripts/benchmarks/abc-public.mjs', 'scripts/benchmarks/abc-transport.mjs', 'scripts/benchmarks/live-flow-probe.mjs', 'scripts/benchmarks/multicase-runner.mjs', 'scripts/benchmarks/stable-prompt.mjs']

def read(relative):
    """Only explicit public paths; refuse traversal and symlinks at every level."""
    if relative not in [MANIFEST, SNAPSHOT, *POSITIONS, *SOURCES]:
        raise ValueError('Source not allowlisted')
    p = ROOT
    for part in Path(relative).parts:
        if part in ('.', '..') or Path(relative).is_absolute():
            raise ValueError('Unsafe path')
        p = p / part
        if p.is_symlink():
            raise ValueError('Symlink')
    return p.read_bytes()

def serial(value):
    # These fixtures use only strings, arrays, objects and integers: this matches
    # JSON.stringify UTF-8 for their domain. Exact replay hashes validate parity.
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8')

def sha(data):
    return hashlib.sha256(data).hexdigest()

def same_unit(a, b):
    # Content equality alone cannot authorize removal across revisions/origins.
    return all(a[k] == b[k] for k in ('source_id', 'unit_id', 'path', 'commit', 'start_line', 'end_line', 'sha256', 'excerpt'))

def accounting(env):
    payload = {k: len(serial(v)) for k, v in env.items()}
    framing = len(serial(env)) - sum(payload.values())
    assert sum(payload.values()) + framing == len(serial(env))
    return {'serialized_values': payload, 'keys_colons_commas_braces': framing, 'total': len(serial(env))}

def analyze():
    m = json.loads(read(MANIFEST))
    by_key = {s['source_id'] + '/' + s['unit_id']: s for s in m['bundle']['sources']}
    for source in by_key.values():
        assert sha(source['excerpt'].encode('utf-8')) == source['sha256']
    historical = {}
    # Read two exact regular members in memory, never extract or execute tar data.
    with tarfile.open(fileobj=io.BytesIO(read(SNAPSHOT))) as archive:
        for name in ('scripts/benchmarks/contract-v02.mjs', 'scripts/benchmarks/abc-runtime.mjs'):
            members = [v for v in archive.getmembers() if v.name.removeprefix('./') == name]
            if len(members) != 1 or not members[0].isfile() or members[0].size > 1000000:
                raise ValueError('Unsafe snapshot member')
            data = archive.extractfile(members[0]).read()
            assert sha(data) == m['code'][name]
            historical[name] = {'sha256':sha(data), 'additive_lines':{str(i):line.strip() for i,line in enumerate(data.decode().splitlines(),1) if any(v in line for v in ('export function runtimeEnvelope', 'sources: select(base)', 'retrieved: select(retrieved)', 'const envelope = runtimeEnvelope', 'const prompt = JSON.stringify'))}}
    cases = []
    for path in POSITIONS:
        o = json.loads(read(path))
        i = o['position']
        assert i < 27 and o['scenario'] == 'com_mimir'
        r = m['requests'][i]
        base = [by_key[k] for k in r['base']]
        retrieved = [by_key[k] for k in o['retrieved']]
        env = {'instruction': 'Responda em até 120 palavras, cite fontes/unidades; abstenha-se se insuficientes. Não utilize ferramentas, shell ou código; responda somente com base nas fontes fornecidas.', 'task': r['task'], 'sources': base, 'retrieved': retrieved, 'history': ''}
        assert len(serial(env)) == o['context_bytes']
        assert sha(serial(env)) == o['context_sha256']
        duplicates = [s for s in retrieved if any(same_unit(s, b) for b in base)]
        cf = dict(env, retrieved=[s for s in retrieved if s not in duplicates])
        # Metadata and excerpt sizes are nested serialized values; all source
        # punctuation and field names remain a separate reconciled residual.
        detail = {}
        for key in ('sources', 'retrieved'):
            excerpts = sum(len(serial(s['excerpt'])) for s in env[key])
            meta = sum(len(serial(v)) for s in env[key] for k, v in s.items() if k != 'excerpt')
            detail[key] = {'excerpt_values': excerpts, 'metadata_values': meta, 'framing': len(serial(env[key])) - excerpts - meta}
        cases.append({'dev_position': i, 'mode': 'offline_reconstruction_from_task103_synthetic_replay', 'accounting': accounting(env), 'nested_source_accounting': detail, 'prompt_sha256': sha(serial(env)), 'replay_hash_matches': True, 'base_count': len(base), 'retrieved_count': len(retrieved), 'exact_overlap_count': len(duplicates), 'overlap_denominator': len(retrieved), 'overlap_ratio': len(duplicates)/len(retrieved) if retrieved else None, 'overlap': [{k:s[k] for k in ('source_id','unit_id','path','commit','start_line','end_line','sha256')} for s in duplicates], 'dedupe_analytical': {'total_bytes': len(serial(cf)), 'avoidable_bytes': len(serial(env))-len(serial(cf)), 'denominator_original_bytes': len(serial(env)), 'preserves_all_source_objects_in_base': True}, 'compact_v1_separate': {'model_prompt_delta_bytes': 0, 'reason': 'ABC projects source keys and discards memory operational fields before rendering; full/compact return same verified source keys for fixed selection', 'core_response_delta_bytes': None}, 'conflicting_revision_observed': False})
    return {'schema_version':'offline-diagnosis-127-1', 'runtime':sys.version, 'run_mode':'offline_only_no_runtime_imports', 'actual_model_calls':0, 'benchmark_calls':0, 'review128':'pending', 'historical_snapshot_members':historical, 'sources':{p:sha(read(p)) for p in [MANIFEST,SNAPSHOT,*POSITIONS,*SOURCES]}, 'manifest_code_comparison':{p:{'current':sha(read(p)), 'manifest':m['code'].get(p), 'equal':sha(read(p))==m['code'].get(p)} for p in SOURCES if p in m['code']}, 'dev_boundary':'first nine triples (positions 0..26), abc-public validateManifest rotation and task103 public report; no evaluation positions opened', 'cases':cases, 'unknowns':['model tokens for reconstructed envelope','host internal instructions/context','TTFT','monetary cost','real historical104 envelope equality','core full/compact response byte difference','global cache existence'], 'synthetic_conflict_test':'same content with differing commit or path must not dedupe; no conflict observed in three public DEV selections'}

class Tests(unittest.TestCase):
    def test_unicode_escaping_reconciliation(self):
        e={'instruction':'ação "x"\n\\🙂','history':'','sources':[]}
        a=accounting(e)
        self.assertEqual(a['total'], sum(a['serialized_values'].values())+a['keys_colons_commas_braces'])
        self.assertIn(b'\\n',serial(e))
    def test_revision_and_origin_conflict(self):
        a=dict(source_id='a',unit_id='b',path='p',commit='r1',start_line=1,end_line=2,sha256='h',excerpt='same')
        self.assertTrue(same_unit(a,dict(a)))
        self.assertFalse(same_unit(a,dict(a,commit='r2')))
        self.assertFalse(same_unit(a,dict(a,path='other')))
    def test_zero(self):
        e={'retrieved':[]}
        self.assertEqual(len(serial(e))-len(serial(dict(e,retrieved=[]))),0)
    def test_replay_and_dedupe(self):
        d=analyze()
        self.assertEqual(len(d['cases']),3)
        self.assertEqual(d['cases'][2]['retrieved_count'],0)
        for c in d['cases']:
            self.assertEqual(c['dedupe_analytical']['total_bytes']+c['dedupe_analytical']['avoidable_bytes'],c['accounting']['total'])
    def test_allowlist(self):
        with self.assertRaises(ValueError): read('../.env')

if __name__ == '__main__':
    if sys.argv[1:] == ['--test']:
        unittest.main(argv=[sys.argv[0]])
    elif not sys.argv[1:]:
        for p in [ROOT, OUT.parent, OUT]:
            if p.is_symlink() or p.resolve() != p: raise ValueError('Unsafe output parent')
        with (OUT/'diagnosis.json').open('x',encoding='utf-8') as f:
            json.dump(analyze(),f,ensure_ascii=False,indent=2)
            f.write('\n')
    else:
        raise SystemExit('Usage: diagnose.py [--test]')
