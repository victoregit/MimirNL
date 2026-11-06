# Task51 — Relatório de revisão independente: preflight offline v0.3

- **Revisor**: independente (antigravity_cli / Gemini 3.8 Flash High)
- **Data**: 2026-10-26
- **Branch**: `feat/v03-benchmark-preflight` (HEAD base `93959dd`)
- **Alvo revisado**: Entrega da [Task50](50-v03-offline-benchmark-preflight.md) e resultado registrado em [50-v03-offline-benchmark-preflight-result.md](50-v03-offline-benchmark-preflight-result.md)
- **Veredito**: **APPROVE**

---

## 1. Escopo e integridade da base

1. **Branch e versão**:
   - A branch ativa é `feat/v03-benchmark-preflight`.
   - `package.json` e a versão publicada 0.2.0 permanecem intactos.
   - Nenhuma alteração foi feita em motor/core, banco de dados SQLite, CI, dependências ou suíte principal preexistente.
   - O contrato em `docs/benchmarks/v03/contrato.md` continua rotulado como proposta não aprovada.

2. **Preservação de arquivos**:
   - `AGENTS.md` preservado com as memórias de projeto existentes.
   - Tarefas `tasks/50-*` e `tasks/51-*` mantidas organizadas no diretório de tarefas.
   - Sem autoaprovação, sem commits ou pushes não autorizados.

---

## 2. Validação estrutural vs. elegibilidade para planejamento

Foram inspecionadas as funções em [`scripts/benchmarks/preflight.mjs`](../../scripts/benchmarks/preflight.mjs):

1. **`validateCases(cases)`**:
   - **Estrutura estrita e unknown keys**: Cada nível de objeto (`case`, `source`, `sources[]`, `model_context`, `evaluation_private`, `rubric[]`, `review`) valida a quantidade exata de propriedades esperadas com `Object.hasOwn()`, recusando estritamente quaisquer chaves desconhecidas que possam conter vazamentos acidentais.
   - **Tipos e valores primitivos**: Strings não vazias e sem byte nulo (`\0`); versões limitadas a `["0.1"]`; enums estritos para `split`, `gold_status` e `review.decision`.
   - **Intervalos e bounds**: `case_revision`, `start_line` e `end_line` exigem inteiros seguros estritamente positivos (`Number.isSafeInteger(n) && n >= 1`); `end_line >= start_line` é verificado.
   - **Caminhos portáveis**: `relativePath` impõe formato relativo à raiz do repositório, rejeitando barras invertidas (`\`), dois-pontos (`:`), componentes vazios, `.`, `..` e caracteres de controle.
   - **Hashes**: `source.commit_sha` exige 40 caracteres hexadecimais minúsculos; `sha256` exige 64 caracteres hexadecimais minúsculos e confere o SHA-256 exato dos bytes UTF-8 de `s.excerpt`.
   - **Integridade referencial**: IDs de fontes e unidades `source_id/unit_id` devem ser únicos e existentes; referências em `allowed_source_ids` e `relevant_unit_ids` são validadas contra o conjunto declarado. IDs de rubrica devem ser únicos e ter pesos numéricos positivos e finitos (`Number.isFinite(w) && w > 0`).
   - **Detecção de duplicatas e revisões ambíguas**: Rejeita qualquer caso com `case_id` duplicado no mesmo lote, inclusive com revisões distintas.
   - **Proveniência caller-provided**: Casos ilustrativos ou pendentes passam na validação estrutural (permitindo validar o exemplo do contrato). Declarações de `accepted` ou gold `validated` exigem referências completas (`source_reviewer`, `codex_review_ref`, `human_acceptance_ref`, `permissions_ref`) e revisor independente (`source_reviewer !== author`). Retorna expressamente `provenance: "caller_provided_not_verified"`. Não há consulta ao Git ou aos arquivos de fontes no disco.

2. **`planCases(cases, repetitions)`**:
   - Invoca `validateCases(cases)` preliminarmente.
   - Exige que todos os casos sejam não ilustrativos (`illustrative_only === false`), aceitos (`review.decision === "accepted"`) e com gold validado (`evaluation_private.gold_status === "validated"`).
   - Rejeita entradas elegíveis incompletas em vez de filtrá-las silenciosamente.
   - Repetições limitadas a inteiros no intervalo 1..100; total de execuções limitado a no máximo 1.000 runs (`cases.length * repetitions * 3 <= 1000`).

---

## 3. Matriz de planejamento, determinismo e ausência de vazamentos

1. **Ordenação determinística**:
   - Os casos são ordenados por `case_id` via comparação ordinal direta por unidade de código (`<` / `>`), garantindo idêntica ordenação entre diferentes locales de sistema operacional.

2. **Balanceamento e rotação de cenários**:
   - Os 3 cenários canônicos (`sem_memoria`, `com_mimir`, `historico_completo`) são gerados para cada caso e repetição.
   - A rotação `(caseIndex + repetition - 1) % 3` distribui a ordem posicional entre `ABC`, `BCA` e `CAB`, garantindo balanceamento rigoroso a cada ciclo de 3 repetições.

3. **Allowlist estrita no plano público**:
   - As entradas do array `runs` contêm estritamente os campos públicos:
     `run_id`, `case_id`, `case_revision`, `scenario`, `repetition`, `source_commit_sha`, `scenario_order`, `status` (`"not_run"`).
   - Nenhum conteúdo privado (`task`, `expected_answer`, `rubric`, `notes`, `source.excerpt`, `path`, referências humanas) é exposto ou serializado.
   - O objeto raiz do plano fixa:
     - `status: "planned"`
     - `executable: false`
     - `provenance: "caller_provided_not_verified"`
     - `reasons`: explicação explícita de ausência de executor e requisitos pendentes
     - `model: null`, `task_budget: null`, `retrieval: null`
     - `pending_decisions`: lista de decisões protocolares pendentes
     - `repetitions` e `runs`

---

## 4. CLI, privacidade de diagnósticos e I/O exclusivo

Foram inspecionadas as rotinas em [`scripts/benchmarks/preflight-cli.mjs`](../../scripts/benchmarks/preflight-cli.mjs):

1. **Parâmetros e execução**:
   - Suporte estrito aos subcomandos `validate <cases.json>` e `plan <cases.json> --reps N --out <new.json>`, além de `--help` / `-h`.
   - Argumentos adicionais ou fora do padrão resultam em código de saída 1 e mensagem de ajuda no stderr.
   - `validate` é puramente read-only.
   - `plan` grava exclusivamente com a flag `wx` e permissão `0o600`, falhando se o arquivo de destino já existir ou for symlink existente. Nunca sobrescreve ou trunca artefatos existentes.

2. **Privacidade e contenção de vazamentos**:
   - Mensagens de erro de I/O em arquivos (`readFileSync` / `writeFileSync`) usam strings estáticas fixas sem expor os caminhos fornecidos ou trechos do arquivo no stderr.
   - Falhas de validação emitem apenas a localização estática no esquema (`location`) e a regra violada (`rule`), sem concatenar chaves desconhecidas ou valores do usuário.
   - `stdout` emite apenas confirmações estáticas de sucesso.

3. **Isolamento de import**:
   - O CLI só é acionado quando o arquivo é o ponto de entrada principal (`import.meta.url === pathToFileURL(process.argv[1]).href`).
   - Importar `preflight.mjs` ou `preflight-cli.mjs` não gera saídas no console nem efeitos no sistema de arquivos.

---

## 5. Documentação e correção editorial no contrato

1. **Documentação [`docs/benchmarks/v03/preflight.md`](../../docs/benchmarks/v03/preflight.md)**:
   - Apresenta com clareza o uso dos comandos CLI e das funções importáveis.
   - Detalha a distinção entre validação sintática e elegibilidade de planejamento.
   - Enfatiza explicitamente que se trata de proveniência declarada (`caller_provided_not_verified`), sem validação de corpus real ou execução de benchmarks.

2. **Correção editorial em [`docs/benchmarks/v03/contrato.md`](../../docs/benchmarks/v03/contrato.md)**:
   - Correção circunscrita estritamente às linhas 177-179 da tabela de métricas: barras verticais literais de cardinalidade matemática (`| ... |`) foram substituídas por `count(...)`.
   - As definições conceituais, denominadores e fórmulas permanecem idênticos.
   - A tabela foi alinhada pelo Prettier sem qualquer outra alteração no documento de contrato.

---

## 6. Evidências de testes independentes

Executados neste ambiente com o runtime Node indicado:
`/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`

1. **Testes focados (`test/benchmark-preflight.test.mjs`)**:
   - 9 testes executados e 9 aprovados (0 falhas, 0 cancelados, 0 ignorados).
   - Cobertura de: JSON ilustrativo do contrato, geração de matriz balanceada/pareada, ausência de vazamento de strings privadas, allowlist de chaves desconhecidas, caminhos portáveis, cálculo UTF-8 de SHA-256, unicidade de unidades/fontes/rubricas, integridade do revisor independente, limites de repetições, execução subprocesso do CLI com detecção de colisão `wx` e ausência de side effects na importação.

2. **Verificação de sintaxe (`node --check`)**:
   - `scripts/benchmarks/preflight.mjs`: OK (exit 0)
   - `scripts/benchmarks/preflight-cli.mjs`: OK (exit 0)
   - `test/benchmark-preflight.test.mjs`: OK (exit 0)

3. **Formatação Prettier fixado (3.6.2)**:
   - Checagem executada nos arquivos modificados e criados: todos formatados conforme padrão do projeto.

4. **Verificação de diff (`git diff --check`)**:
   - Nenhuma linha com espaço em branco no final ou conflito detectado (exit 0).

---

## 7. Conclusão

A entrega da Task50 cumpre rigorosamente todos os requisitos especificados em `tasks/50-v03-offline-benchmark-preflight.md` e os critérios de aceitação descritos em `tasks/51-v03-preflight-review.md`.

- Veredito final: **APPROVE**.
- Não foram identificadas pendências ou itens acionáveis de alteração.
- O código está pronto para consolidação pelo supervisor `dbfe79b6` quando autorizado.
