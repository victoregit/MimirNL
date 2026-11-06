from pathlib import Path
import subprocess,os,json,concurrent.futures
r=Path('/mnt/d/Projects/MimirNL');logs=r/'tasks/120-checks';node='/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node'
env={**os.environ,'PATH':str(Path(node).parent)+':/usr/bin:/bin','GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1','GIT_TERMINAL_PROMPT':'0'}
def run(platform):
 cwd=Path('/home/usuario/mimir-task118-checks/linux' if platform=='linux' else '/mnt/d/mimir-task118-windows')
 scopes=['src','test','scripts','docs']+[p.name for p in sorted(cwd.iterdir()) if p.is_file() and p.suffix in ['.md','.json','.mjs']]+['.github/workflows/ci.yml']
 checks={'version':['-p','JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sqlite:process.versions.sqlite})'],'typecheck':['node_modules/typescript/bin/tsc','--noEmit'],'lint':['node_modules/eslint/bin/eslint.js','src'],'build':['node_modules/typescript/bin/tsc'],'schemas':['scripts/generate-contract.mjs','--check'],'format':['node_modules/prettier/bin/prettier.cjs','--check',*scopes]}
 results={}
 for name,args in checks.items():
  if platform=='linux':argv=[node,*args]
  else:
   # Avoid cmd expression quoting for version metadata; direct absolute Node is safe here.
   if name=='version':argv=['/mnt/c/Users/Public/mimir-hardening-runtime/node/node-v24.22.1-win-x64/node.exe',*args]
   else:argv=['/mnt/c/Windows/System32/cmd.exe','/d','/c',r'set PATH=C:\Users\Public\mimir-hardening-runtime\git\cmd;C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Windows\System32&&node '+' '.join(args)]
  with (logs/(platform+'-'+name+'-final.log')).open('w') as out:p=subprocess.run(argv,cwd=cwd,env=env,stdout=out,stderr=subprocess.STDOUT)
  results[name]={'argv':argv,'cwd':str(cwd),'exit':p.returncode}
  print(platform,name,p.returncode,flush=True)
 (logs/(platform+'-checks-final.json')).write_text(json.dumps(results,indent=2)+'\n')
with concurrent.futures.ThreadPoolExecutor() as p:list(p.map(run,['linux','windows']))
