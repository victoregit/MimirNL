# Task112 — Runtime persistente e preflight Task104

Data: 2026-10-27. `actual_model_calls: 0`.

Runtime restaurado e preflight técnico offline concluído. Este relatório prepara104 pelo supervisor; não autoriza automaticamente sua execução. Não houve modelos, warmup, replay, delegação, tuning, leitura de gold privado, credenciais ou alteração de código/core/manifestos/lock/dependências. Dirty preservado; sem commit/push/publicação.

## Runtime e origem

Node persistente: `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. Execução confirmou Node `v24.22.1`, Linux x64, SQLite `3.53.4`.

Downloads feitos por Python `urllib.request.urlopen(url, timeout=45)`, com HTTPS e certificados padrão, destes URLs oficiais (também os URLs finais das respostas):

- https://nodejs.org/dist/v24.22.1/SHASUMS256.txt
- https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz

Ambos preservados em `/home/usuario/.local/share/mimir-node-runtime/`. SHA256 esperado na lista oficial e observado no tar.xz: `6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6`. Conferido antes da extração com `tarfile.extractall(..., filter="data")`. Origem HTTPS oficial e checksum verificados; assinatura PGP não verificada. Binário node SHA256: `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb`.

## Comandos e checks

Executados da raiz `/mnt/d/Projects/MimirNL`, com exit0:

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node -p 'JSON.stringify({node:process.version,sqlite:process.versions.sqlite,platform:process.platform,arch:process.arch})'
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs validate /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs validate /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json
/home/usuario/.local/bin/codex --version
/home/usuario/.codex/packages/standalone/releases/0.164.0-x86_64-unknown-linux-musl/bin/codex --version
```

Os validadores retornaram respectivamente stage validate/run, os hashes canônicos abaixo, `actual_model_calls: 0`, `execution_proof: false`. Ambos os caminhos Codex retornaram `codex-cli 0.164.0`. O segundo é o binário absoluto fixado no transporte revisado `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs`; SHA256 `b93f6811d3f653f0fb83be4050d857fb9abbb111dfa2ce160563327daff7f306`. Disponibilidade e versão não comprovam login/acesso ao modelo/transporte real; nenhum desses foi testado.

Verificações Python inline usaram `hashlib.sha256` sobre bytes, JSON canônico com chaves ordenadas/separadores compactos/exclusão do campo superior sha256 e `git show <commit>:<path>` para intervalos de fontes com quebras de linha preservadas:

- Manifestos: 27/27 arquivos de code de cada um coincidem com disco, incluindo dist, fontes core e lock; zero divergências. Validação ABC também conferiu bundle, limites,54 posições,18 buscas e política congelada.
- Fontes:19/19 excerpts e hashes conferem com intervalos do commit fixado por fonte. Bundle `e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9`.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/history-c.txt`:0bytes, SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- Inventário107 em `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/code-inventory-0.2.json`:4/4 hashes conferem com disco. Dependencies no mesmo diretório:7/7 arquivos conferem.
- Parecer108:10/10 hashes explícitos conferem, inclusive quatro fontes core, parâmetros, schema, ablação e diff. Configuração congelada `b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`.

Não foram repetidas suítes que reconstruiriam dist ou gerariam fixtures. Uma primeira comparação Python de excerpt sem preservar newline falhou; corrigida a extração com splitlines(keepends=True),19/19 conferiram. Nenhum artefato foi alterado para satisfazer o check.

## Manifestos

Diretório absoluto: `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/`.

| Arquivo | SHA256 bytes | SHA256 canônico |
| --- | --- | --- |
| offline-manifest.json | c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea | a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651 |
| proposed-run-manifest.json | 84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21 | e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92 |

## Gates e recibos

Lidos os relatórios103/104 e pareceres106,107 (ambos),108 e109 complementar em `/mnt/d/Projects/MimirNL/tasks/`. Pareceres técnicos correntes registram APPROVE. O complementar109 supera a pendência documental do parecer109 inicial; documentos históricos preservados.

Recibos `/mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-0.2.json`, `/mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-dev-0.2.json` e `/mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-eval-0.2.json`: schema technical-review-receipt-0.2, verdict APPROVE, autor codex-task101 distinto do revisor gemini-3.8-flash-high-task106-reviewer, evidence_ref aponta para parecer106 existente. Bundle coincide com atual. Hash dev `176893a787812e4f1add6ba7599795f354922d360e54c9ee5a5a94d020e51f1a` e eval `7f4bab5f95294850aa3adc5b56f2d0847fb99fe7ddd50791bc2956fbcab4641c` coincidem com valores publicados em106. Não foram abertos casos/gold privados para recalcular hashes.

Consistência documental confirmada; autenticidade das identidades não pode ser provada apenas por esses JSON sem assinatura verificável. O protocolo declara requires-supervisor-verification; a autenticação permanece responsabilidade do supervisor, sem inventar aceite humano.

## Condições restantes antes104

1. Supervisor autenticar identidades/referências dos recibos e revisão109. Esta atribuição não dispõe de evidência criptográfica substitutiva.
2. Fornecer/autenticar artefato abc-authorization-0.2 ligado ao hash canônico proposed acima, epoch1, APPROVE, max_attempts54, reviewer_ref/supervisor_ref distintos. Nenhum artefato de autorização foi criado por112. Autorização sustentada até0.3 não foi tratada como execução automática desta etapa.
3. Escolher saída nova exclusiva, confirmar inexistência e permissões0700/0600 no instante de execução. Nenhuma saída live foi criada ou reutilizada.
4. Usar runtime persistente por caminho absoluto/PATH explícito e reconferir inventário/limites/autorização imediatamente antes da única invocação. CLI ABC revisado fornece validate/offline, sem comando live; supervisor deve usar a interface revisada sem converter fake em live ou alterar manifesto/código nesta atribuição.

Preservar54tentativas/18buscas máximas, concorrência1,retry0,sem warmup/troca de host;90s/call,120s/run,5s/busca,120min/global,32000bytes contexto,64000bytes captura; primeira falha interrompe, restantes not_run. tools=[] não autoriza ferramentas nem comprova ausência de capacidades internas do host. Nenhuma conclusão sobre qualidade/economia emitida.

Único arquivo gravado no repositório por112: `/mnt/d/Projects/MimirNL/tasks/112-task104-runtime-preflight-result.md`. Downloads e runtime ficam fora do repositório no diretório persistente documentado.
