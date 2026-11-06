# Tokens e tempo — coletor experimental

O coletor lê stdin JSONL; não executa Codex, subprocessos, modelos, rede ou consultas de memória. Nenhuma coleta real foi realizada nesta entrega. Revisão independente é necessária antes da chamada real autorizada. O help local de `codex exec --help` confirma `--json`; não foi consultado transcript privado nem schema local oficial. O adaptador esperado abaixo é experimental, validado com fixtures sintéticas.

## Contrato esperado

Uma invocação com um único turn: `thread.started` opcional, `turn.started`, eventos de itens e um `turn.completed` com `usage: {input_tokens, cached_input_tokens, output_tokens}`, ou `turn.failed` com `error.message`. `error` contém `message` e pode preceder `turn.failed`. Eventos desconhecidos com `type` textual podem ser ignorados antes da terminalidade. Qualquer evento após terminal, início repetido ou terminal sem início é rejeitado. Estruturas relevantes inválidas e ausência parcial de usage são rejeitadas, sem aproveitar números parciais.

Os três contadores são inteiros seguros não negativos. Cache é subconjunto de entrada; total = entrada + saída, sem somar cache novamente. A soma deve ser segura. Ausência de terminal produz status `incomplete`; falha produz `failed`; ambos têm usage indisponível (`null`). Zero reportado válido é preservado. `completed` não atesta qualidade/correção da resposta. Não há prova de execução, identidade do modelo, provedor, faturamento ou custo. Custo fica indisponível.

A unidade é um turn, não uma sessão. Antes de somar relatórios de sessões, confirmar no host se cada contador é incremental por turn ou cumulativo e garantir invocações distintas; este coletor rejeita múltiplos turns e não agrega sessões.

## Tempos e cobertura

`collectStream(input, {clock})` usa `performance.now()` por padrão, desde o início da coleta até EOF. Registra tempo até primeiro evento JSONL válido, primeiro `item.completed` de tipo `agent_message`, `turn.completed` e EOF. Ausências ficam `null`; contagem de eventos e `turn_started` preservam cobertura. Tempos incluem espera, startup do produtor observado, buffering e pipeline; processos do pipe podem começar em ordem diferente, portanto não cobrem necessariamente todo startup do Codex. Não são inferência pura.

TTFT fica sempre `unavailable`: item completo não é primeiro token. Não foi inventado evento delta. A CLI declara `local-stdin-monotonic`, sem saber se a origem é replay. Um arquivo passado no stdin mede apenas sua leitura, nunca latência da execução original. A API pura `createUsageCollector()` usa explicitamente `synthetic-test`; `observe(event, elapsedMs)` e `finish(elapsedMs)` recebem cronologia sintética não negativa, finita e não decrescente. Fixtures não produzem medições reais.

## Uso futuro após revisão

Para a pergunta única já autorizada, fixar explicitamente o mesmo modelo e parâmetros escolhidos pelo operador. Exemplo de pipeline, ainda não executado:

```bash
set -o pipefail
codex exec --ephemeral --sandbox read-only --json -m MODELO_ESCOLHIDO 'PERGUNTA_UNICA_AUTORIZADA' |
  /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node scripts/benchmarks/codex-usage-cli.mjs --out /tmp/mimir-pergunta-uso-novo.json
```

O status do pipeline deve ser verificado pelo operador: o relatório não captura exit code do produtor. `--ephemeral` evita persistência de sessão pelo Codex; stderr do produtor não é coletado nem sanitizado por este programa. A saída padrão da CLI é somente o relatório quando não há `--out`. Não passar `--output-last-message`, não usar `tee` para transcript bruto. A CLI não grava prompt/resposta, tool output, IDs, caminhos ou mensagens de erro originais; só uso, contagens, tempos, status e método. `--out` usa criação exclusiva `wx` e modo solicitado `0600`, rejeitando destino existente e symlinks; permissões efetivas dependem do filesystem.

Limites fixos: 16 MiB totais e 1 MiB por linha. Aceita chunks, UTF-8 válido, CRLF e última linha sem newline. Linha vazia, JSON inválido, UTF-8 inválido, limites excedidos e erro de stdin encerram com diagnóstico fixo e status 1. Stdin vazio gera relatório incompleto, nunca uso zero. Nenhum transcript bruto é salvo. Aguarda EOF de um produtor ativo; não há timeout de inatividade e o operador pode interromper um produtor que não fecha stdin.

Para comparar com/sem memória, usar sessões novas independentes, mesma pergunta, modelo, provedor, parâmetros e ambiente, registrando separadamente a condição e a origem do contexto. Repetições e ordem precisam de protocolo posterior. Um par exploratório não demonstra ganho, cobrança nem resultado do benchmark completo. Modelo/provedor/tarifas do piloto completo seguem indefinidos; nenhum executor de 27 chamadas foi implementado.
