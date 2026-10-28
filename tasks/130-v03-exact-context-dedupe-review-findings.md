# Parecer de Revisão Técnica Independente — Task 130

- **Data**: 2026-10-28
- **Tarefa sob revisão**: [Task 129 — EF03 dedupe exato opt-in na montagem de contexto](/mnt/d/Projects/MimirNL/tasks/129-v03-exact-context-dedupe.md)
- **Resultado auditado**: [Task 129 Result](/mnt/d/Projects/MimirNL/tasks/129-v03-exact-context-dedupe-result.md)
- **Revisor**: Antigravity Code Reviewer Agent (`gemini-3.8-flash-high`)
- **Veredito**: **APPROVE**

---

## 1. Resumo Executivo

A implementação da Task 129 introduziu a função [`assembleOfflineContext`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L6-L43) como uma superfície incremental, modular e estritamente offline/futura para a família ABC de benchmarks. A alteração cumpre integralmente os requisitos da autorização do usuário e as diretrizes do projeto:
- **Default byte-idêntico**: sem opção ou com `{ base_overlap: "preserve" }`, os bytes gerados coincidem de forma idêntica com a montagem legada de `runtimeEnvelope`.
- **Deduplicação exata opt-in**: com `{ base_overlap: "exact-v1" }`, omite apenas fontes recuperadas com identidade integralmente coincidente (todos os 8 campos públicos de proveniência), mantendo fontes distintas, ordem relativa e entradas imutáveis.
- **Fail-closed e integridade de orçamento**: validações completas de schema, chaves, PIN e o teto de 32.000 bytes do envelope ocorrem *antes* da deduplicação; entradas inválidas ou com sobreorçamento são rejeitadas imediatamente.
- **Preservação estrita**: 85 arquivos preexistentes foram verificados com SHA256 inalterados; `src/core`, ranking, schemas, memórias persistentes, manifestos e histórico de benchmarks foram 100% preservados.
- **Zero chamadas de rede/modelo**: nenhuma execução ao vivo, modelo LLM ou novo benchmark foi executado.

---

## 2. Inventário e Delta Auditados

Foram auditados todos os arquivos novos introduzidos na Task 129 e seus respectivos hashes SHA256:

| Caminho Absoluto | SHA256 | Status |
| :--- | :--- | :--- |
| [`/mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs) | `9df249917c820fadb305a9d086ac900d5105bfe9a1a0a871e927c1d3e349f1c4` | Novo / Auditado |
| [`/mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs`](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs) | `42a467b55038063b86e4bfcef81e41b2d07b517e161135e4db3da6a310de35a9` | Novo / Auditado |
| [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/ef03-dedupe-exato.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/ef03-dedupe-exato.md) | `53d166042635ef3ccba5a71b87db09efcb8e2bb538a072052ba7b3e835fa04ef` | Novo / Auditado |
| [`/mnt/d/Projects/MimirNL/tasks/129-v03-exact-context-dedupe-result.md`](file:///mnt/d/Projects/MimirNL/tasks/129-v03-exact-context-dedupe-result.md) | `cafcb312d21d7e74a719a7b15df110cc83875c640a1c0c19ba7bd68ed668bf54` | Novo / Auditado |

**Auditoria de Preservação**:
- Confronto automatizado contra [`tasks/129-review/preservation.json`](file:///mnt/d/Projects/MimirNL/tasks/129-review/preservation.json): todos os 85 arquivos monitorados mantiveram SHA256 idêntico ao estado inicial.
- Comparação contra [`tasks/129-review/status-before.txt`](file:///mnt/d/Projects/MimirNL/tasks/129-review/status-before.txt): nenhum arquivo pré-existente foi modificado ou excluído no working tree untracked/dirty.

---

## 3. Avaliação Detalhada por Critério

### 3.1. Funcionalidade e Correção
- **Assinatura e Opções** ([`offline-context.mjs#L6-L14`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L6-L14)): A função aceita `(bundle, task, base, retrieved = [], options = { base_overlap: "preserve" })`.
- **Validação Estrita de Opções** ([`offline-context.mjs#L13-L14`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L13-L14)): `exact(options, ["base_overlap"])` garante que quaisquer chaves extras ou desconhecidas disparem exceção via `fail()`. Apenas `"preserve"` e `"exact-v1"` são aceitos.
- **Precedência da Validação Legada** ([`offline-context.mjs#L17-L18`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L17-L18)): O envelope é validado e construído inicialmente via `runtimeEnvelope(bundle, task, base, retrieved)`. Se o bundle contiver fontes inválidas, se chaves não pertencerem ao bundle, ou se o envelope serializado exceder `PARAMETERS.context_bytes` (32.000 bytes), a execução falha imediatamente. A deduplicação não salva entradas com sobreorçamento ou dados malformados.
- **Semântica de Deduplicação Exata** ([`offline-context.mjs#L19-L27`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L19-L27)): `available` é gerado como `Set(envelope.sources.map(canonical))`. A comparação opera sobre a representação JSON canônica (chaves ordenadas lexicograficamente) do objeto completo contendo todos os 8 campos de proveniência (`source_id`, `unit_id`, `path`, `commit`, `start_line`, `end_line`, `excerpt`, `sha256`). Fontes recuperadas com texto idêntico, porém `unit_id`, `source_id`, `path` ou linhas distintos, **não** são descartadas.
- **Metadados do Retorno** ([`offline-context.mjs#L29-L42`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-context.mjs#L29-L42)): Retorna `envelope`, `prompt`, `configuration` (`schema_version: "offline-context-129-v1"`), `configuration_sha256`, `context_bytes`, `omitted_count`, `avoided_bytes` e `executable: false`. O hash e as métricas residem estritamente fora da string do prompt, impedindo poluição do contexto enviado ao modelo.

### 3.2. Preservação da Identidade do Mimir
- O Mimir opera como segundo cérebro e sistema de recuperação de conhecimento com proveniência e citações íntegras.
- A implementação não realiza encurtamento heurístico, normalização Unicode agressiva (NFC/NFD), nem deduplicação puramente semântica ou baseada exclusivamente em hash de conteúdo.
- Toda a base original é preservada sem qualquer alteração na sua lista de fontes (`envelope.sources`).
- A ordem relativa dos itens recuperados restantes em `envelope.retrieved` é estritamente mantida pelo `Array.prototype.filter`.

### 3.3. Segurança, Efeitos Colaterais e Ciclos de Importação
- **Sem efeitos colaterais na importação**: A importação de `offline-context.mjs` foi testada isoladamente em processo Node 24; nenhuma chave foi introduzida no escopo global e nenhum descritor de arquivo/processo foi alocado.
- **Sem dependências circulares**: `offline-context.mjs` importa `runtimeEnvelope`, `canonical`, `hash` de `contract-v02.mjs` e `exact`, `fail` de `public-bundle.mjs`. Nenhum desses módulos depende de `offline-context.mjs`.
- **Imutabilidade de Entrada**: `bundle`, `task`, `base`, `retrieved` e `options` não sofrem mutação (verificado em [`test/benchmark-offline-context.test.mjs#L46-L48`](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs#L46-L48)).
- **Permissões de Execução**: `executable: false` garante que a API não pode ser interpretada como plano autorizado para execução real.

### 3.4. Cobertura de Testes
O arquivo [`test/benchmark-offline-context.test.mjs`](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs) valida exaustivamente os requisitos:
1. `default equals legacy bytes; opt-in applies and preserves order/base/input` ([L30-L54](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs#L30-L54)): Equivalência de bytes com o legado, aplicação correta do opt-in, contagem de omitidos/evitados, imutabilidade do bundle e caso sem overlap.
2. `same text with distinct identity/origin/range is retained; Unicode and key order` ([L56-L86](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs#L56-L86)): Não remoção quando `unit_id`, `source_id`, `path` ou linha diferem; preservação de caracteres Unicode complexos e emojis; insensibilidade à ordem de inserção de chaves no objeto.
3. `unknown/missing metadata, revision, invalid hash/selections and overbudget fail before dedupe` ([L88-L126](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs#L88-L126)): Rejeição closed-fail para campos desconhecidos, revisões fora de PIN, hashes divergentes, seleções duplicadas/externas ao pool, sobreorçamento (>32k bytes) e opções de configuração não reconhecidas.
4. `three public DEV reconstructions: actual API output, runtime suffix accounted separately` ([L128-L155](file:///mnt/d/Projects/MimirNL/test/benchmark-offline-context.test.mjs#L128-L155)): Reprodução das 3 posições públicas DEV (1, 3 e 8) do replay sintético da Task 103, confirmando as medições:
   - DEV 1: 4065 → 2489 bytes (delta: 1576 bytes)
   - DEV 3: 8193 → 4676 bytes (delta: 3517 bytes)
   - DEV 8: 5132 → 5132 bytes (delta: 0 bytes)

### 3.5. Documentação
O arquivo [`docs/benchmarks/v03/ef03-dedupe-exato.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/ef03-dedupe-exato.md) documenta com clareza:
- A fronteira offline/futura da família ABC.
- Exemplos de código para opt-in e rollback para `preserve`.
- A separação entre bytes medidos e tokens reais (sem alegações infundadas de ganho de qualidade ou custo para LLMs).
- O tratamento separado do sufixo de instrução do runner congelado.

---

## 4. Verificações Técnicas Independentes Executadas

Durante esta revisão, foram executados no runtime oficial (`node-v24.22.1-linux-x64`):
1. **Suite de Testes**:
   `node --test test/benchmark-offline-context.test.mjs test/benchmark-abc.test.mjs test/benchmark-v02.test.mjs`
   -> **26/26 passaram** (exit code 0 em 7.61s).
2. **ESLint**:
   `node node_modules/eslint/bin/eslint.js scripts/benchmarks/offline-context.mjs test/benchmark-offline-context.test.mjs`
   -> **0 erros, 0 avisos** (exit code 0).
3. **Prettier Check**:
   `node node_modules/prettier/bin/prettier.cjs --check scripts/benchmarks/offline-context.mjs test/benchmark-offline-context.test.mjs docs/benchmarks/v03/ef03-dedupe-exato.md`
   -> **Clean formatting** (exit code 0).
4. **Git Diff Check**:
   `git diff --check`
   -> **Nenhum erro de whitespace/conflito** (exit code 0).
5. **Auditoria de Preservação SHA256**:
   Script Python auditou os 85 arquivos de `preservation.json` contra o disco atual.
   -> **85 arquivos verificados, 0 divergências**.
6. **Auditoria de Delta**:
   Script Python comparou os arquivos novos contra `delta.json`.
   -> **Todos os 4 hashes conferem com precisão**.
7. **Isolamento de Escopo Global**:
   Script de inspeção de runtime pós-importação.
   -> **Zero poluição de variáveis globais**.

---

## 5. Conclusão e Veredito

A entrega cumpre todos os requisitos técnicos, arquiteturais e de integridade com rigor exemplar. Não há necessidade de alterações ou correções.

**Veredito**: **APPROVE**
