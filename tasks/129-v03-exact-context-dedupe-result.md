# Task129 — resultado EF03

Estado: **pending_review130**, sem autoaprovação. Perfil developer/codex,
sem delegação, commit, push, publicação, rede, instalação ou chamadas de modelos.
**0 novas chamadas de benchmark/modelo.** Testes existentes usam somente
transportes sintéticos e SQLite temporário, não o launcher104.

## Delta e utilização

Somente arquivos novos desta tarefa:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs`: API concreta
  `assembleOfflineContext(bundle, task, base, retrieved, options)` que chama a
  montagem/validação legada antes da transformação. Default preserve; opção
  explícita `{ base_overlap: "exact-v1" }`. Configuração/hash e métricas fora do
  prompt; nenhuma integração automática com manifestos ou execução congelada.
- `/mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs`: testes de
  equivalência default, dedupe, ordem/não mutação, fontes distintas, Unicode,
  ordem das chaves, campos adicionais/faltantes, revisão/hash inválidos,
  seleções e orçamento inválidos, opções estritas e três DEV públicos103.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/ef03-dedupe-exato.md`: uso,
  fronteira offline/futura ABC, identidade da configuração, rollback e limites.
- `/mnt/d/Projects/MimirNL/tasks/129-review/`: inventários e logs desta entrega.
- `/mnt/d/Projects/MimirNL/tasks/129-v03-exact-context-dedupe-result.md`: registro.

Nenhum arquivo preexistente alterado. O runner congelado e MCP/host global
continuam na montagem anterior. Uma futura execução requer novo plano com
identidade/config/hash e validação/revisão/autorização próprias. Escolhida a
superfície offline/futura expressamente permitida pela especificação129.

Schema atual fechado: todos os oito campos públicos integram a comparação
canonicalizada completa. Metadados novos/desconhecidos e revisões divergentes
são erro de contrato, nunca removidos. Nenhuma projeção relaxa proveniência;
não há normalização Unicode, resumo ou alteração de conteúdo. Base integral,
ordem restante e entradas preservadas. A validação e orçamento legados ocorrem
antes da dedupe; entrada inválida não passa a válida por redução.

## Resultado efetivo e checks

Runtime existente: `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`.
Comandos abaixo executados na raiz absoluta `/mnt/d/Projects/MimirNL`:

- `node --test test/benchmark-offline-context.test.mjs`: exit0, 4/4 testes.
- `node --test test/benchmark-offline-context.test.mjs test/benchmark-abc.test.mjs test/benchmark-v02.test.mjs`:
  exit0, **26/26**, log `/mnt/d/Projects/MimirNL/tasks/129-review/tests.log`.
  Os testes ABC existentes confirmam gates, isolamento, hashes e execução
  sintética; não foram lançados benchmarks reais.
- `node node_modules/prettier/bin/prettier.cjs --write` nos três arquivos de
  código/teste/documentação próprios: exit0; formato aplicado somente ali.
- Lint ESLint, Prettier check e `git diff --check`: logs no diretório129-review;
  ver registro final dos exits em `checks.json`.
- Python3 compara SHA256 inicial/final: exit0, **85 arquivos preservados**.

Três DEV públicos1/3/8, seleções/query/pool inalterados: aplicação real da API
mais o sufixo de instrução do runner em memória reproduz os hashes103 antes e
mede **4065→2489, 8193→4676, 5132→5132 bytes UTF-8**. Delta1576/3517/0.
A API sem sufixo tem o mesmo delta; o teste recompõe o sufixo para comparar
exatamente a mesma interface127. Não se editou replay/manifesto/snapshot.
São reconstruções sintéticas, não execução104, tokens reais, custo ou qualidade.

## Inventário para review130

`/mnt/d/Projects/MimirNL/tasks/129-review/before.json` registra SHA256 do estado
inicial real, inclusive arquivos untracked; `status-before.txt` registra o dirty
anterior. `preservation.json` contém hashes antes/depois e lista vazia de
alterações: src/core/retrieval/optimization, schemas, receipt108, scripts/testes
preexistentes, manifesto público103, DEV1/3/8, snapshot103 e resultados públicos
históricos selecionados. Escopo explícito evita abrir evaluation privado.

`delta.json` lista caminhos absolutos novos e SHA256 final, com `before: null`
(arquivos ausentes no estado inicial). Inventários não se baseiam apenas em
Git HEAD; logs/inventários e este relatório não incluem seu próprio hash para
evitar referência circular. Nenhuma remoção, reescrita histórica ou alteração
em AGENTS/package/deps/config/CI. Dados/gold privados e DB pessoal não abertos.

Próximo gate: revisão independente130. Eficiência ampla continua aberta;
nenhum piloto autorizado por esta entrega.
