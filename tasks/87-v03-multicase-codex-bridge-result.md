# Task87 — Bridge Codex multicaso entregue para revisão

Preparação implementada e validada offline em 2026-10-27. **actual_model_calls=0 nesta tarefa.** Nenhum executável Codex/modelo/host real foi iniciado. Entrega para revisão independente pelo supervisor, sem autoaprovação e sem executar o piloto proposto.

## Arquivos desta entrega

Novos:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs`: schema profundo do manifesto, JSON sem chaves duplicadas, hash público, validação sem spawn, confirmação operacional por hash exato, executor separado, posições e evidência bruta.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex-transport.mjs`: transporte fixo Codex lean, coletor aprovado, captura pública de identidade/uso, timeout/cancelamento do grupo POSIX próprio, sem shell/retry/loaders privados.
- `/mnt/d/Projects/MimirNL/test/benchmark-multicase-codex.test.mjs`: 12 testes offline; streams artificiais, fakes e subprocessos Node controlados, nunca processos de modelo.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-codex-proposto.json`: proposta de dois casos × uma repetição × dois braços, quatro posições AB/BA, modelo/configuração/limites/saída explícitos.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/transporte-codex-multicaso.md`: fronteira, auditoria dos legados, semântica de métricas, gates e comandos exatos de validação e execução futura não realizada.
- `/mnt/d/Projects/MimirNL/tasks/87-v03-multicase-codex-bridge-result.md`: este relatório.

Alterados nesta tarefa:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs`: única mudança funcional é exportar `prepare`, reaproveitando a fixture real aprovada sem alterar seu comportamento.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-multicaso.md`: informa APPROVE Task86 e aponta a bridge separada; evidências antigas preservadas.

Todo dirty/untracked preexistente foi preservado, incluindo a Task88 surgida durante a execução. Nenhum core/CI/deps/configuração global, DB default/pessoal, gold, pending/aceite, commit/push/merge foi alterado. Nenhum subagente ou operador auxiliar foi criado; não há worker desta tarefa para limpar. Fixtures próprias foram removidas, evidência mantida.

## Decisões

A auditoria encontrou corpus/pergunta/IDs fixos em runners legados. O novo runtime não importa esses módulos: usa somente bundle/manifesto públicos explícitos, schema/I/O/fixture públicos e transporte dedicado derivado do loop de coleta aprovado. Os legados permanecem intactos. O transporte replica argumentos lean, com binário absoluto da release instalada, modelo solicitado gpt-6.1-sol/low e sem comandos configuráveis no manifesto. Identidade efetivamente observada continua separada; ausência é unavailable.

O bundle permanece executable=false e o manifesto proposed. `--validate` não cria artefatos nem subprocessos. `--run` exige confirmação operacional separada por hash exato; o manifesto e o hash sozinhos não provam autorização humana. Só usuário/supervisor poderão autorizar essa etapa depois de revisão independente.

O piloto propõe `expanded-budget-envelope` (síntese multifonte) e `expanded-production-p95-absent` (negativo), revisões 1, uma repetição, A/B e B/A. A escolha cobre comportamentos distintos do corpus, sem seleção por ganhos anteriores. Limites: quatro tentativas máximas, 90000 ms por processo, 600000 ms total, envelope 32000 bytes, resposta capturada 64000 bytes; sem teto monetário inventado. O limite de resposta capturada não limita tokens faturáveis.

A usa pool inteiro; B consulta Mimir real em fixture descartável, sem oracle/fallback. Seeds candidate/user recebem somente fontes públicas. Busca contada uma vez, timer contínuo inclui busca/serialização/transporte/coleta; setup/cleanup ficam fora. Sem truncamento. Orçamento verificado antes de spawn, timeout limitado ao restante, primeira falha/cancelamento interrompe sem retry, mantendo posições seguintes. SIGINT/SIGTERM/timeout encerram a árvore própria. Saída privada exclusiva, sem overwrite. Instruções AGENTS/override em ancestrais são recusadas sem leitura.

## Evidência offline

Exportação reproduzida com o CLI privado aprovado em `/tmp/mimir-task87-public/bundle.json`: nove casos, executable=false, digest `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`, idêntico à Task86.

Validação CLI executada:

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-codex-proposto.json
```

Resultado: quatro posições, status proposed, actual_model_calls=0. SHA público do plano proposto: `95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5`. Destino `/tmp/mimir-task87-pilot-proposed` não foi criado. O comando futuro `--run` está documentado no guia e não foi executado.

Uma execução adicional por API com `simulation:true` e `spawnImpl` que inicia exclusivamente Node emitindo JSONL artificial produziu `/tmp/mimir-task87-offline-evidence/{plan,result}.json`, quatro contextos e quatro respostas sintéticas. Quatro simulated, simulated_status=completed, **actual_model_calls=0**, completed_calls=0, simulated_attempts=4 e duas buscas reais em fixtures. Cada uso artificial tem input=100, cache=70, output=8, total=108; usage_status=synthetic-test e not_execution_proof=true. Esses números testam o coletor, não medem modelos. O hash dessa reprodução é `f99ec820bf2a9b2759f1e491081e709086d54bdf4deb0e68d5ff1833024725c6`, diferente do proposto por vincular outro destino. Nenhuma fixture slot-N permaneceu.

## Validação executada

Com Node `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`, PATH correspondente e cwd `/mnt/d/Projects/MimirNL`:

- Testes novos iniciais: 8/8, depois 10/10 ao acrescentar timer contínuo e subprocesso público isolado.
- Regressão focada: `node --test test/benchmark-multicase-codex.test.mjs test/benchmark-public-multicase.test.mjs test/benchmark-codex-usage.test.mjs test/benchmark-live-flow.test.mjs`: **39/39**, log `/tmp/mimir-task87-focused.log`.
- Após acrescentar as verificações de instruções ancestrais e cancelamento: `node --test test/benchmark-multicase-codex.test.mjs`: **12/12**, log `/tmp/mimir-task87-new-tests.log`.
- Suíte completa, uma vez após verde: `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test`: build + **111 testes, 110 passaram, 1 skip preexistente, zero falhas**. Log `/tmp/mimir-task87-npm-test.log`. Nenhuma repetição ampla após esse verde.
- `node --check` nos módulos novos e teste: passou.
- Prettier direcionado aos arquivos da entrega e `git diff --check`: passaram; nenhuma formatação global do checkout.

Cobertura: quatro posições AB/BA/limite máximo, schema/hash/extras/revisões/ordem antes de spawn/artefatos, chaves duplicadas, falta de confirmação operacional, sucesso/cache subset, uso ausente, identidade unavailable, JSONL malformado, falha de turno/host, exit nonzero, tools, resposta vazia/excessiva, ausência de retry, orçamento restante, timer B contínuo, retrieval=1, cap infeasible sem truncar, finally cleanup/no-overwrite, processos públicos limitados a bundle/manifesto/código/arquivos próprios (sem allowlist genérica de JSON/Markdown), IDs de caso fora da entrada, timeout do grupo incluindo descendente com pipes herdados e cancelamento sem listeners residuais.

## Limitações e próximo gate

Revisão independente da bridge/manifesto/testes ainda pendente. Não há resultado de qualidade, TTFT, custo ou nova medição de economia. Hash garante integridade pública, não assinatura, aprovação ou integridade da instalação do host. O sandbox read-only não prova impossibilidade de leitura de arquivos; ignore-user-config/cwd vazio, ambiente reduzido, recusa de instruções ancestrais e auditoria dos eventos compõem o isolamento preparado. Ausência de eventos de ferramenta não prova ausência de capacidades internas não publicadas pelo host.

Setup/busca SQLite não são preemptivos: podem ultrapassar orçamento local, impedindo o próximo spawn. Encerramento de árvore depende de grupos POSIX/Linux; o validador recusa outra plataforma. Resposta capturada e instrução de palavras não são limites faturáveis. Tentativas live incluem falha de spawn, sem alegar requisição aceita pelo servidor; chamadas concluídas são contadas separadamente. Ranking/chunking e empates do motor não foram alterados. Antigravity é etapa posterior.

Entregar ao supervisor para revisão independente, preservando pending/gold e sem autorizar/rodar o piloto. **actual_model_calls=0 nesta tarefa.**

## Encerramento pelo supervisor — Task88 APPROVE

Parecer independente em [88-v03-multicase-codex-bridge-review-findings.md](88-v03-multicase-codex-bridge-review-findings.md), sem correções obrigatórias de código. Revisão confirmou 12/12 testes novos, 41/41 na regressão focada, digest público e hash do manifesto reproduzidos, validate sem spawn e recusa de run sem confirmação correspondente. A suíte completa da implementação teve 110 aprovados e 1 skip preexistente. Git diff --check passou no encerramento. Sessão cao-mimir sem workers auxiliares; ambos os operadores foram encerrados pelo handoff. Nenhum benchmark/modelo real foi executado (actual_model_calls=0), sem commit/push. Próxima etapa: execução do piloto Codex proposto de quatro chamadas e revisão independente das respostas/medições, sob a autorização operacional e limites explícitos do piloto; os casos continuam pending/development e não há alegação nova de economia.
