# Task113 — Preparação da invocação104

Data: 2026-10-27. `actual_model_calls: 0`. Preparação concluída; live não executado. Launcher novo aguarda revisão independente antes de uso. Sem subagentes, commit/push, gold, tuning, credenciais, .env, SSH, PEM ou banco pessoal. Dirty preexistente preservado.

## Entrega e integridade

- Launcher: `/mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs`, SHA256 bytes `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38`.
- Testes: `/mnt/d/Projects/MimirNL/test/task104-launch.test.mjs`, SHA256 bytes `b78a647eeefa79358c1e6b1eb61984a77ccc9263d66ce0fb5384d5f62aec8599`.
- Este relatório: `/mnt/d/Projects/MimirNL/tasks/113-task104-launch-preparation-result.md`.

Nenhum arquivo congelado, manifesto, core, package/lock ou dist foi alterado. Recalculados 27/27 hashes do inventário proposto: todos conferem. Validador público executado com sucesso sobre `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`: stage run, hash canônico `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`, actual_model_calls0, execution_proof false. Hash bytes registrado112/109: `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21`.

Launcher aceita exatamente três paths absolutos, exige Node v24.22.1 Linux x64, aplica readExplicit/parseStrictJSON/validateManifest/authorize homologados, fixa o hash canônico aprovado e rejeita saída existente inclusive symlink pendente. Somente então importa runtime público e chama `executeABC({ manifest, authorization, out, mode: "live" })`. Não importa exportador/coordenador privado. Import/help não leem inputs, não importam runtime e não executam transporte. Sem bypass, skip, retry, warmup ou fallback fake. Erros do CLI são genéricos para não expor conteúdos.

A verificação de schema é vínculo estrutural, não autenticação: o supervisor autentica externamente o artefato. O novo launcher não pertence ao inventário congelado; seu hash e aprovação devem constar separadamente na coordenação. Não modificar manifesto para incluí-lo nesta etapa.

## Destino e permissões

Destino novo proposto, confirmado inexistente com `os.path.lexists == False` nesta preparação:

`/home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113`

Pai `/home/usuario/.local/share/mimir-task104-evidence` preparado e conferido 0700. Probe temporário nesse filesystem confirmou diretório0700/arquivo0600 e foi removido; saída live não foi criada. Usado filesystem Linux fora de `/mnt/d`, evitando depender de emulação de modos do mount Windows. Launcher define umask077 e runtime aplica mkdir exclusivo/chmod0700 e writePrivate0600. Reconferir inexistência/permissões imediatamente antes da invocação; jamais apagar para reutilizar ou retomar. Não há transação global contra alterações concorrentes por processos do mesmo usuário; usar coordenação exclusiva do supervisor.

## Autorização proposta — não gravada

Após APPROVE independente deste launcher, supervisor deve gravar/autenticar separadamente `/home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json` como arquivo0600. Nenhuma autorização válida foi criada nesta tarefa. Campos exatos, sem extras, para gravação pelo supervisor:

```json
{
  "schema_version": "abc-authorization-0.2",
  "manifest_sha256": "e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92",
  "epoch": 1,
  "reviewer_ref": "gemini-3.8-flash-high-task109-d3724822",
  "supervisor_ref": "codex-supervisor-f4190c7f",
  "verdict": "APPROVE",
  "max_attempts": 54
}
```

Este bloco é proposta documental, não autorização emitida pelo supervisor. Não enviá-lo no prompt. O schema não admite output_dir nem launcher_sha256: registrar destino e hash/aprovação do launcher em coordenação externa separada. A identidade reviewer_ref acima referencia109; a aprovação independente do launcher é gate adicional separado.

Task113 informa que supervisor já autenticou documentalmente recibos106, gates107/108 e revisão complementar109 via retorno CAO d3724822/model_honored=true, com autores/revisores distintos. Isto é evidência documental/orquestração fornecida pela especificação, não assinatura criptográfica nem aceite gold humano. Foram lidos Task104, resultado112, parecer109 complementar e interfaces públicas; nenhuma autenticação adicional foi inventada.

## Comando futuro exato — NÃO EXECUTADO

Executar uma única vez, somente após revisão independente APPROVE do launcher e autorização externa autenticada pelo supervisor:

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json /home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json /home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113
```

## Validação offline executada

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test /mnt/d/Projects/MimirNL/test/task104-launch.test.mjs
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs validate /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json
```

Exit0 ambos. Três testes passaram: import sem stdout/stderr e help sem runtime; rejeição de aridade/paths relativos; autorizações inválidas (schema vazio, chave duplicada, campos extras/vínculo/veredito inválidos) rejeitadas antes de runtime/saída. Fixtures deliberadamente inválidas; nenhuma chamada executeABC live nos testes. A rota positiva live não foi exercitada. Testes são novos e também devem passar pelo reviewer; não foram reconstruídos dist nem fixtures congelados.

## Pendências operacionais

1. Revisor independente aprovar launcher/testes e registrar hash exato; mudanças posteriores exigem nova revisão.
2. Supervisor gravar/autenticar autorização acima, registrar vínculo ao launcher aprovado e destino externo, e reconferir inventário/runtime/binário/transporte/fontes/history e gates imediatamente antes do uso único.
3. Supervisor prover acompanhamento baseado em arquivos/metadados/counters ≤60s durante104. Launcher não oferece progresso periódico próprio; não capturar transcripts/stderr/raw reasoning. Disponibilidade/login/acesso ao modelo permanecem não testados.
4. Preservar54tentativas/18buscas máximas, concorrência1, retry0, 90s/call,120s/run,5s/busca,120min/global,32000bytes contexto,64000bytes captura, primeira falha interrompe e remanescentes not_run. Falha consome orçamento; não repetir para completar54.
5. tools=[] significa nenhum uso autorizado, sem comprovar ausência de capacidades internas; evento de ferramenta invalida/interrompe. Custo/TTFT/modelo efetivo unavailable se ausentes. Qualidade/economia só após avaliação independente posterior; nenhum resultado104 é alegado aqui.
