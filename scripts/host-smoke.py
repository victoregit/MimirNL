#!/usr/bin/env python3
"""Opt-in cloud host smoke: synthetic data only; never invoked by CI."""
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
NODE = os.environ.get('MIMIR_HOST_NODE', '/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node')
OUT = ROOT / 'docs' / 'host-smoke-results.json'


def main():
    with tempfile.TemporaryDirectory(prefix='mimir-host-') as directory:
        fixture = Path(directory) / 'project'
        fixture.mkdir()
        subprocess.run(['git', 'init', str(fixture)], check=True, capture_output=True)
        db = str(Path(directory) / 'host.sqlite')
        cli = str(ROOT / 'dist/cli/index.js')
        def call(op, payload):
            result = subprocess.run([NODE, cli, '--db', db, op, json.dumps(payload)], check=True, capture_output=True, text=True)
            return json.loads(result.stdout)
        project = call('project_register', {'path': str(fixture), 'authorizeIngestion': True})['data']['id']
        other = Path(directory) / 'other'
        other.mkdir()
        subprocess.run(['git', 'init', str(other)], check=True, capture_output=True)
        other_id = call('project_register', {'path': str(other), 'authorizeIngestion': True})['data']['id']
        config = '{command=' + json.dumps(NODE) + ',args=' + json.dumps([cli, '--db', db, 'mcp', 'stdio']) + ',enabled_tools=["memory_store","memory_search","memory_get","memory_feedback","memory_stats"],startup_timeout_sec=30}'
        base = ['codex','exec','--ignore-user-config','--ephemeral','--sandbox','read-only','--json','--skip-git-repo-check','--cd',str(fixture),'-c','mcp_servers.mimir='+config]
        prompts = [
            f'Use only mimir MCP tools. Do not use shell, other tools, files or network. Explicit authorization: store synthetic content "fixture renderer queue cobalt 719" in project {project}, search it, get it, and add action note feedback "synthetic host check". Also call memory_get on UUID 00000000-0000-4000-8000-000000000001 expecting a missing ID error. Do not approve, promote, delete or share anything.',
            f'Use only mimir MCP tools; no shell, files or network. Search project {project} for "cobalt 719" and get the persisted result. Attempt to get that ID under unrelated project {other_id} and verify scoped denial. Do not write, approve, promote, delete or share anything.'
        ]
        results = {'node': NODE, 'codex': subprocess.check_output(['codex','--version'],text=True).strip(), 'sessions': []}
        for prompt in prompts:
            try:
                run = subprocess.run(base+[prompt], capture_output=True,text=True,timeout=180,stdin=subprocess.DEVNULL)
                events=[]
                for line in run.stdout.splitlines():
                    try: events.append(json.loads(line))
                    except json.JSONDecodeError: pass
                results['sessions'].append({'exit':run.returncode,'events':events,'stderr':run.stderr})
            except subprocess.TimeoutExpired:
                results['sessions'].append({'timeout_seconds':180})
                break
            if run.returncode: break
        results['persisted_search'] = call('memory_search',{'projectId':project,'query':'cobalt 719'})
        completed = [event.get('item', {}) for session in results['sessions'] for event in session.get('events', []) if event.get('type') == 'item.completed']
        successful = [item for item in completed if item.get('type') == 'mcp_tool_call' and item.get('status') == 'completed']
        scoped_errors = all(any(event.get('type') == 'item.completed' and event.get('item', {}).get('tool') == 'memory_get' and 'NOT_FOUND' in json.dumps(event.get('item', {}).get('result')) for event in session.get('events', [])) for session in results['sessions'])
        results['passed'] = scoped_errors and len(results['sessions']) == 2 and bool(results['persisted_search'].get('data', {}).get('memories')) and all(any(item.get('tool') == tool for item in successful) for tool in ['memory_store', 'memory_search', 'memory_get', 'memory_feedback'])
        OUT.write_text(json.dumps(results,indent=2)+'\n')
        print(OUT)
        return 0 if results['passed'] else 1

if __name__ == '__main__':
    raise SystemExit(main())
