# Parecer Independente — Task 108: Revisão de Melhorias do Core 102

- **Data**: 2026-10-27
- **Revisor**: Antigravity (revisor independente)
- **Alvo**: Implementação e entregáveis da Task 102 (`tasks/102-v03-core-improvements-result.md`, diff, testes, ablação e congelamento)
- **Veredito**: **`APPROVE`**
- **Chamadas a modelo real**: `actual_model_calls: 0`

---

## 1. Hashes e Integridade dos Arquivos Revisados

A revisão foi realizada diretamente sobre os arquivos e diffs entregues pela Task 102, sem modificação de código de produção e sob isolamento estrito de holdout (sem acesso a `tasks/106*`, `scope101` ou avaliador privado):

- `src/retrieval/index.ts`: `f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30`
- `src/core/service.ts`: `dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94`
- `src/optimization/index.ts`: `4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc`
- `src/core/schemas.ts`: `2b3cf8e9a9a0f54e1547776c20f00e9437089102c318673111c086450da16e9c`
- `docs/mcp-schemas.json`: `0074d8a0408a8a27be8d860085f1096564089ccb67188db24c1fb5518b7ae4a5`
- `docs/core-retrieval-0.3.md`: `e1d4eb140e07d0be81e0755250fcf6dd87e353c933a65ae9286b594f608cf4a8`
- `test/core-v03.test.mjs`: `6b2a8fef6f636c03cd45f0ac8a4e3281cea188fed20118f94e2274c7beb56139`
- `docs/benchmarks/v03/core-parameters-0.3.json`: `1d050d6a51fe5d8142571898a1e3f67fc782fe64aef527be44ad0b0e4285057b`
- `docs/benchmarks/v03/core-ablation-0.3.json`: `fbe90ede0cd59eded1b1490449d233155fcc125db7d7f5f564a8acf9f09fbc11`
- `tasks/102-core.diff`: `bcabebb288d7fcc6d31c97a6c511ac7ea35d669e6fc1d3c6bacb6308d8585c11`

O diff em `tasks/102-core.diff` confere byte a byte com o estado atual do repositório para os 4 módulos do core e o schema MCP.

---

## 2. Conformidade dos Requisitos Técnicos

### 2.1 Deduplicação antes de `limit` e Proveniência (`src/retrieval/index.ts:37-76`)

- **Resolução do underfill**: O SQL não trunca precocemente com `LIMIT ?`. O cursor FTS itera ordenadamente e agrupa por hash de conteúdo antes de restringir o total de memórias a `filter.limit`. Isso elimina o problema histórico em que memórias duplicadas no top-K resultavam em underfill da resposta.
- **Proveniência**: O registro primário é mantido intacto, e instâncias adicionais autorizadas têm sua proveniência anexada em `duplicateProvenance` (`id`, `project_id`, `scope`, `source`), preservando rastreabilidade.
- **Determinismo na ordenação**: A query ordena estritamente por `bm25(memory_fts) ASC`, preferência por escopo de projeto `(m.scope='project') DESC`, recência condicional para empates, e `m.id` como desempate final.

### 2.2 FTS, Escaping, Unicode e Queries Adversariais (`src/retrieval/index.ts:23-45`)

- A extração de termos usa `[\p{L}\p{N}_]+` limitado a 40 palavras, tratando caracteres acentuados, multibyte e ideogramas.
- Cada termo é envolvido por aspas literais `'"' + w + '"'`, neutralizando injeção de operadores FTS5 (como `OR`, `NOT`, `*`, aspas avulsas). Testado com sucesso em `test/core-v03.test.mjs:93`.

### 2.3 Recência Controlada e Veracidade (`src/retrieval/index.ts:39-44`)

- O mecanismo de recência `verified-ties-v1` atua estritamente como terceiro critério de ordenação após BM25 e escopo do projeto.
- Aplica-se unicamente a memórias com `status = 'verified'` e `julianday(m.updated) <= julianday('now')`. Memórias com datas futuras ou strings inválidas recebem peso 0, impedindo manipulação de ranking. Memórias `candidate` ou `rejected` não recebem impulso temporal, preservando o princípio de que recência não estabelece verdade factual.

### 2.4 Fallback por Baixa Relevância (`src/retrieval/index.ts:50-61`, `src/core/service.ts:383-386`)

- Sob a política `balanced-v1`, exige-se cobertura lexical mínima de `ceil(U / 4)` termos únicos no conteúdo. Trata-se de uma regra geral paramétrica e explicável, sem calibragem artificial para casos do benchmark.
- Metadados estruturados retornam `reason = 'lexical_matches'` ou `'no_lexical_evidence'`. Quando todas as memórias relevantes são barradas pelo orçamento de bytes, o sistema retorna `'budget_excluded'`.
- A política padrão permanece `legacy`, garantindo compatibilidade reversa.

### 2.5 Hard Budget UTF-8 e Integridade Transacional (`src/optimization/index.ts:1-40`, `src/core/service.ts:394-415`)

- `estimateTokens` opera sobre `Buffer.byteLength(JSON.stringify(value), "utf8")`, tratando bytes reais do envelope completo `{ ok: true, data: ... }`, sem truncamento silencioso de conteúdo. Excerpts não cabíveis são omitidos integralmente.
- O contrato e a documentação declaram expressamente que a métrica mede limites conservadores em bytes UTF-8, sem alegar equivalência com contadores de tokenizador de LLM.
- **Rejeição mínima**: Se o orçamento for insuficiente sequer para conter o envelope JSON vazio com os metadados, lança-se `AppError('BUDGET_TOO_SMALL')`.
- Como a validação ocorre antes do bloco `this.storage.transaction()`, o erro encerra a operação sem mutar contadores de uso (`uses`), tabelas de retrievals ou itens consultados.

### 2.6 Formato Compacto (`src/core/service.ts:361-381`)

- O formato `compact-v1` suprime contadores operacionais voláteis (`created`, `updated`, `uses`), mas preserva estritamente `id`, `project_id`, `scope`, `type`, `content` integral, `hash`, `status`, `origin`, `source`, `version`, `trust` e `duplicateProvenance`.
- Não executa sumarização destrutiva via LLM nem adiciona padding.
- A economia no envelope é quantificada exclusivamente em bytes (1050 bytes nas 9 instâncias development), sem extrapolar conclusões de custo ou tokens.

### 2.7 Telemetria Local Opt-in (`src/core/service.ts:387-393`)

- Desativada por padrão (`default: false`).
- Quando ativada, limita-se a quatro campos operacionais locais: `version: "local-v1"`, `returnedCandidates`, `format` e `policy`.
- Não registra raw query, não armazena trechos privados de código/memória e não realiza tráfego de rede (verificado sob mock estrito de `fetch`). Contadores existentes (`retrievals`, `uses`) permanecem desacoplados.

### 2.8 Dependências, Modelos e Cache

- Nenhuma dependência externa adicionada ao `package.json`.
- Nenhum modelo auxiliar, cache de API externa ou alteração de prompts históricos introduzida.

---

## 3. Avaliação dos Testes e Ablação

1. **Validação e Tipagem**:
   - `npm run typecheck`: OK (0 erros).
   - `npm run lint`: OK (0 advertências).
   - `npm run schemas:check`: OK (schemas MCP sincronizados).
   - `npx prettier --check` nos módulos e testes core: OK.
2. **Suíte Focada (`test/core-v03.test.mjs`)**:
   - Executada com Node v24.22.1 (`/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`): **6 pass, 0 fail**.
   - Os testes não são meros espelhos de implementação: cobrem comportamento funcional e exceções negativas reais (injeção adversarial FTS, rollback transacional sem mutação de banco no estouro de envelope, ordenação sob datas futuras/inválidas, e veto de chamadas externas de rede).
3. **Reprodução da Ablação Offline (`scripts/benchmarks/core-ablation-v03.mjs`)**:
   - Execução reproduzida com sucesso: `cases: 9`, `actual_model_calls: 0`, hash de configuração idêntico (`b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`).
   - O arquivo gerado não alterou o artefato congelado `docs/benchmarks/v03/core-ablation-0.3.json`.
4. **Ambiente Windows**:
   - O teste focado com Node 24.22.1 win-x64 está registrado com êxito (6 pass). A dependência da suíte global quanto ao Git no PATH nativo do Windows foi apropriadamente declarada como pendência para a Task 105, sem reivindicações indevidas de CI.

---

## 4. Riscos Observados e Recomendações

1. **Tradeoff de Latência no Iterator FTS**: Ao iterar sem `LIMIT` no SQL para viabilizar deduplicação exata e contagem de proveniência, bancos com dezenas de milhares de matches podem incorrer em ordenação integral temporária pelo SQLite. Essa característica foi adequadamente documentada pelo autor como limitação conhecida e é aceitável para o escopo v0.3.
2. **Nomenclatura Legada**: O campo `tokenBudget` controla bytes UTF-8 e não tokens de modelo; as ressalvas explícitas nos schemas e na documentação mitigam ambiguidades de consumo externo.

---

## 5. Conclusão do Parecer

A entrega da **Task 102** cumpre com rigor todos os requisitos de segurança, isolamento, orçamento determinístico, preservação de proveniência, compatibilidade e rastreabilidade estipulados.

**Veredito: `APPROVE`**.
A Task 103 está tecnicamente desbloqueada no tocante às melhorias do core.
