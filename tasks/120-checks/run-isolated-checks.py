from pathlib import Path
import subprocess,os,json,shutil,sys,concurrent.futures
r=Path('/mnt/d/Projects/MimirNL'); logs=r/'tasks/120-checks'
linux=Path('/home/usuario/mimir-task118-checks/linux'); win=Path('/mnt/d/mimir-task118-windows')
# Sync explicit public source only; keep existing isolated dependencies and minimal pin.
for dest in [linux,win]:
 for tree in ['src','dist','test','scripts','docs']:
  for p in (r/tree).rglob('*'):
   if p.is_file() and not p.is_symlink() and p.suffix not in ['.tar','.pem','.db','.sqlite','.sqlite3'] and not any(x in ['.aws','.ssh'] or x.startswith('.env') for x in p.parts):
    q=dest/p.relative_to(r);q.parent.mkdir(parents=True,exist_ok=True)
    if not q.exists() or p.read_bytes()!=q.read_bytes():shutil.copyfile(p,q)
 for p in r.iterdir():
  if p.is_file() and p.suffix in ['.json','.mjs','.md']:shutil.copyfile(p,dest/p.name)
if sys.argv[1]=='sync':sys.exit(0)
node='/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node'
env={**os.environ,'PATH':str(Path(node).parent)+':/usr/bin:/bin','GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1','GIT_TERMINAL_PROMPT':'0'}
focus=['benchmark-abc','benchmark-v02','benchmark-public-multicase','benchmark-multicase-codex','benchmark-cache-diagnostic','benchmark-context-selection','benchmark-live-flow','benchmark-paired-probe','benchmark-codex-usage','benchmark-metrics','benchmark-preflight','task104-launch','offline-paths']
tests=[str(p.relative_to(linux)) for p in sorted((linux/'test').glob('*.test.mjs')) if sys.argv[1]=='full' or p.stem.removesuffix('.test') in focus]
def run(platform):
 cwd=linux if platform=='linux' else win
 args=['--test',*tests]
 if platform=='linux':argv=[node,*args]
 else:argv=['/mnt/c/Windows/System32/cmd.exe','/d','/c','set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&node '+' '.join(args)]
 tag=platform+'-'+sys.argv[1]+'-'+sys.argv[2]
 with (logs/(tag+'.log')).open('w') as out:p=subprocess.run(argv,cwd=cwd,env=env,stdout=out,stderr=subprocess.STDOUT)
 (logs/(tag+'.json')).write_text(json.dumps({'argv':argv,'cwd':str(cwd),'exit':p.returncode},indent=2)+'\n')
 print(tag,p.returncode,flush=True)
with concurrent.futures.ThreadPoolExecutor() as pool:list(pool.map(run,['linux','windows']))
