# Parecer Independente — Task 128: Revisão Técnica do Diagnóstico Offline EF-01/02 e Helpers (Task 127)

- **Data**: 2026-10-28
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Perfil e Modelo**: `gemini-3.8-flash-high` via provider `antigravity_cli` (exclusividade como Code Reviewer no CAO, sem delegação)
- **Especificação da Revisão**: [`/mnt/d/Projects/MimirNL/tasks/128-v03-offline-diagnosis-review.md`](file:///mnt/d/Projects/MimirNL/tasks/128-v03-offline-diagnosis-review.md)
- **Especificação da Tarefa Auditada**: [`/mnt/d/Projects/MimirNL/tasks/127-v03-offline-context-diagnosis.md`](file:///mnt/d/Projects/MimirNL/tasks/127-v03-offline-context-diagnosis.md)
- **Artefatos Auditados**:
  - Relatório Técnico: [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md)
  - Registro de Resultado: [`/mnt/d/Projects/MimirNL/tasks/127-v03-offline-context-diagnosis-result.md`](file:///mnt/d/Projects/MimirNL/tasks/127-v03-offline-context-diagnosis-result.md)
  - Helper Python: [`/mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py`](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py)
  - Saída Estruturada JSON: [`/mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnosis.json`](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnosis.json)
  - Log de Testes do Helper: [`/mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/tests.log`](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/tests.log)
- **Veredito Final**: **`APPROVE`**
- **Novas Chamadas de Benchmark / Modelo / Runtime Host**: **`0`** (zero chamadas LLM; zero requisições a hosts externos ou launchers; sem instalação de dependências ou runtime Node; dirty/untracked preexistentes preservados).

---

## 1. Sumário Executivo e Veredito

A auditoria técnica e independente das entregas da Task 127 resultou em parecer conclusivo **`APPROVE`**.

O diagnóstico de eficiência offline EF-01/02 e seu helper determinístico cumprem com rigor integral todas as restrições metodológicas, de segurança e de escopo definidas nas especificações das Tasks 127 e 128:

1. **Confinamento a Fontes Públicas DEV**: O trabalho utilizou estritamente o manifesto público [`offline-manifest.json`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json) e as posições development B (1, 3 e 8) do replay sintético da Task 103, situadas no intervalo DEV (posições 0 a 26). Nenhuma posição privada de evaluation (27 a 53), holdout confidencial ou coordenador foi acessado ou aberto.
2. **Segurança e Isolamento do Helper (`diagnose.py`)**: O script implementa validação estrita de allowlist para todos os caminhos, recusa traversal (`..`) e symlinks, processa arquivos `.tar` estritamente em memória sem extração para o sistema de arquivos (eliminando qualquer risco de Zip Slip/Path Traversal) e protege a saída com gravação em modo exclusivo (`open('x')`) contra sobreescrita acidental (clobber).
3. **Exatidão Numérica e Reconciliação Matemática**: Todos os hashes SHA-256 das fontes conferem 100% com o disco. A composição dos envelopes serializados (4.065, 8.193 e 5.132 bytes) foi reconstituída e reconciliada byte a byte (valores + delimitadores = total). O cálculo contrafactual de dedupe analítico (redução de 1.576, 3.517 e 0 bytes) preserva a integridade de todas as fontes na base.
4. **Rigor Conceitual no Tratamento de Limites**: O caso sem recuperação (posição 8) é corretamente computado com sobreposição 0/0 e razão `null` (não um falso zero numérico). A potencial divergência de versões/origens é tratada com fail-closed (retenção obrigatória de ambas as unidades em caso de conflito).
5. **Separação Epistemológica Precisa**: As medições são devidamente demarcadas como reconstruções sintéticas offline baseadas no replay 103, sem confundir o resultado com os envelopes da execução histórica 104. Bytes evitáveis são declarados explicitamente como bytes brutos de prompt, sem inferência não comprovada sobre contagem de tokens, TTFT, custo financeiro ou qualidade de resposta.
6. **Mapeamento Estrutural do Código**: Todos os pontos aditivos correntes e históricos, bem como as abordagens substitutivas anteriores, foram identificados com precisão cirúrgica de arquivo e linha no repositório.
7. **Recomendação Prudente e Delimitada**: O relatório propõe unicamente a exploração futura de **EF-03 (dedupe exato opt-in na montagem aditiva)**, mantendo EF-04 e mecanismos de caching suspensos até haver evidência empírica de repetição e custo, sem implementar nenhuma alteração no core neste estágio e rejeitando a promessa de "10–30% de economia".

---

## 2. Auditoria de Segurança e Qualidade de Código do Helper (`diagnose.py`)

O código do helper [`tasks/127-offline-diagnosis/diagnose.py`](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py) (119 linhas) foi inspecionado em detalhes:

### 2.1 Análise de Segurança e Acesso ao Sistema de Arquivos
- **Allowlist Estrita de Leitura ([Linhas 17–28](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L17-L28))**: A função `read(relative)` aceita exclusivamente caminhos predefinidos nas constantes `MANIFEST`, `SNAPSHOT`, `POSITIONS` e `SOURCES`. Qualquer outro caminho dispara `ValueError('Source not allowlisted')`.
- **Prevenção contra Path Traversal e Symlinks ([Linhas 22–27](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L22-L27))**: O caminho é decomposto via `Path(relative).parts`, rejeitando `.` e `..` bem como caminhos absolutos. Cada segmento do caminho é verificado contra symlinks via `p.is_symlink()`, impedindo desvios para alvos fora do repositório.
- **Processamento de Tar Seguro em Memória ([Linhas 54–62](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L54-L62))**: O arquivo de snapshot histórico `task103-executed-snapshot.tar` é aberto através de `io.BytesIO` alimentado pelos bytes lidos em memória. Os membros são filtrados por nome exato (`v.name.removeprefix('./') == name`), verificados como arquivos regulares (`isfile()`) e com limite estrito de tamanho (`size > 1000000`). Os bytes são extraídos diretamente em memória via `archive.extractfile(members[0]).read()`, sem tocar o sistema de arquivos em disco. Isso previne vulnerabilidades de Zip/Tar Slip.
- **Prevenção contra Clobber na Saída ([Linhas 113–117](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L113-L117))**: Na geração da saída, valida-se que o diretório de destino não é um symlink (`p.is_symlink() or p.resolve() != p`). O arquivo é gravado com `(OUT/'diagnosis.json').open('x')` (modo de criação exclusiva). A auditoria executou `python3 diagnose.py` sobre o diretório com `diagnosis.json` já existente e comprovou que o interpretador encerra com `FileExistsError`, impedindo a destruição de dados auditados.

### 2.2 Critério Forte de Identidade e Deduplicação Contrafactual
- **Função `same_unit` ([Linhas 38–40](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L38-L40))**: A correspondência entre uma unidade recuperada e uma unidade-base exige igualdade em 8 campos fundamentais:
  ```python
  all(a[k] == b[k] for k in ('source_id', 'unit_id', 'path', 'commit', 'start_line', 'end_line', 'sha256', 'excerpt'))
  ```
  Isso assegura que trechos de código idênticos provenientes de arquivos distintos (ex.: `README.md` vs `package.json`) ou de revisões concorrentes (`commit` distinto) **não sejam deduplicados**, evitando falsos positivos e perdas de proveniência.

### 2.3 Contabilidade Serializada e Framing
- **Funções `serial` e `accounting` ([Linhas 30–33 e 42–46](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L30-L33))**: A serialização utiliza `json.dumps(..., ensure_ascii=False, separators=(',', ':')).encode('utf-8')`, mantendo paridade com o `JSON.stringify` utilizado no runtime Node do benchmark. A contabilidade decompõe explicitamente o tamanho dos valores brutos (`payload`) e a pontuação estrutural (`framing`), garantindo por asserção que `sum(payload.values()) + framing == len(serial(env))`.

### 2.4 Bateria de Testes Unitários (`--test`)
- **Execução Real e Reprodutibilidade**: O comando `python3 /mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py --test` foi executado pelo revisor e concluiu com **código de saída 0** (`Ran 5 tests in 0.274s - OK`).
- **Cobertura dos Testes ([Linhas 86–108](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnose.py#L86-L108))**:
  1. `test_unicode_escaping_reconciliation`: valida caracteres especiais (`ação "x"\n\\🙂`), escaping JSON e reconciliação da soma de framing.
  2. `test_revision_and_origin_conflict`: valida que unidades com mesmo conteúdo mas commits ou paths divergentes retornam `False` em `same_unit`.
  3. `test_zero`: valida o comportamento com lista de recuperação vazia, computando delta 0.
  4. `test_replay_and_dedupe`: executa `analyze()` em memória, valida a presença dos 3 casos e a reconciliação da soma `total_bytes + avoidable_bytes == total`.
  5. `test_allowlist`: valida a rejeição de tentativa de travessia com `../.env`.

---

## 3. Auditoria Quantitativa dos Dados (`diagnosis.json`)

A saída estruturada em [`tasks/127-offline-diagnosis/diagnosis.json`](file:///mnt/d/Projects/MimirNL/tasks/127-offline-diagnosis/diagnosis.json) foi integralmente reauditada via conferência programática independente.

### 3.1 Verificação de Integridade das Fontes
Todos os 15 arquivos referenciados em `sources` tiveram seus hashes SHA-256 recalculados contra o disco: **100% de correspondência exata**:
- `docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json`: `24ef1251a498a2216fdbf229cb96135e3faf4e02cfb6e2e8e1e740a7378f9d15`
- `docs/benchmarks/v03/evidencias/task103-executed-snapshot.tar`: `f37365350929052e21eee560f9de13d35e93ff563e819a19579b90efb1abec80`
- `position-01.json`: `5f6b81c94519352b40f5b9f6aa38b6d160be1f0435d8de7c1af9580d619d3c07`
- `position-03.json`: `e4f78883243baa0f1393b7671216da7da7671ebf769eee1337ce88da6aa6b033`
- `position-08.json`: `d28a07aedfa891e0ee5621f1e2ce5e972a4dc336e453829d069e8bcc73bedde2`
- Arquivos de código core (`service.ts`, `retrieval/index.ts`, `optimization/index.ts`): idênticos ao manifesto histórico da Task 103 (manifest code comparison `equal: true`).
- Scripts de benchmark (`contract-v02.mjs`, `abc-runtime.mjs`, `abc-public.mjs`): divergência documentada entre checkout atual e o manifesto histórico (`equal: false`), com os hashes históricos auditados a partir dos membros do tar snapshot.

### 3.2 Conferência Matemática dos Casos DEV
A auditoria recalculou as somas e subtrações de todos os componentes de contexto:

| Posição DEV | Cenário / Descrição | Instrução | Pergunta | Base | Recuperadas | History | Framing | Total Reconciliado | Bytes Evitáveis | Total Pós-Dedupe | Overlap (Identidade) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Posição 1** | README vs package.json | 177 | 203 | 2.046 | 1.578 | 2 | 59 | **4.065 bytes** | 1.576 bytes | 2.489 bytes | 2/2 (1,00) |
| **Posição 3** | TokenBudget service | 177 | 178 | 4.258 | 3.519 | 2 | 59 | **8.193 bytes** | 3.517 bytes | 4.676 bytes | 3/3 (1,00) |
| **Posição 8** | Busca p95 sem seleção | 177 | 197 | 4.695 | 2 | 2 | 59 | **5.132 bytes** | 0 bytes | 5.132 bytes | 0/0 (`null`) |

- **Subcomponentes das Fontes**:
  - Posição 1: Base (excerpts: 1308, meta: 464, framing: 274 = 2046); Recuperadas (excerpts: 1098, meta: 297, framing: 183 = 1578).
  - Posição 3: Base (excerpts: 3255, meta: 638, framing: 365 = 4258); Recuperadas (excerpts: 2767, meta: 478, framing: 274 = 3519).
  - Posição 8: Base (excerpts: 3693, meta: 637, framing: 365 = 4695); Recuperadas (excerpts: 0, meta: 0, framing: 2 = 2).
- **Paridade com Replay Sintético 103**: O hash `context_sha256` gerado por cada envelope reconstruído coincide com absoluta exatidão com o registrado nos arquivos `position-01.json`, `position-03.json` e `position-08.json`:
  - Pos 1: `fcd8a7e64fcfb47385117c94a28bca37fef1a50adceda2de61431ae8ba3f7c3e`
  - Pos 3: `42b25fb993d4cac76759af732d58341f70fd3421228c5655220ecc2e5541c391`
  - Pos 8: `baa59586b179474b97cd9a939579b75cba3b4f29b8361efb064882b44bdbb3da`
- **Análise Separada de `compact-v1`**: O valor `model_prompt_delta_bytes: 0` foi verificado no código do adaptador (`abc-runtime.mjs:180–193`), que extrai o identificador da memória e remonta o objeto público correspondente a partir do bundle estático. Para uma seleção fixa, a projeção gera exatamente os mesmos bytes de prompt. O delta da resposta do core permanece formalmente classificado como `null` / unknown.

---

## 4. Auditoria Estrutural e Arquitetural do Relatório Técnico

O relatório em [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md) foi revisado linha a linha contra a base de código do Mimir:

### 4.1 Validação de Referências de Código
Todas as referências a linhas de código citadas no relatório foram checadas no repositório:
- **`src/core/service.ts:356–416` ([Linha 7](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L7))**: Corresponde com fidelidade exata ao bloco `if (op === "memory_search")`, cobrindo chamada ao `FtsRetriever`, projeção `compact-v1` nas linhas 361–381, metadados/telemetria nas linhas 382–393, chamada a `optimize` na linha 394 e gravação em transação SQLite nas linhas 395–416.
- **`src/core/service.ts:124–135` ([Linha 7](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L7))**: Corresponde à assinatura `async call(operation, input)` que envelopa a resposta em `{ ok: true, data: value }` ou `failure(e)`.
- **`src/retrieval/index.ts:23–75` ([Linha 7](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L7))**: Corresponde ao método `search()`, incluindo a tokenização regex de até 40 palavras na linha 23, ordenação por BM25/recência na linha 39, filtro de cobertura `balanced-v1` nas linhas 50–61, deduplicação por hash e agregação de `duplicateProvenance` nas linhas 62–74. Confirma-se que a estrutura `groups` é um `new Map()` instanciado localmente por busca (sem reutilização entre consultas).
- **`src/optimization/index.ts:16–38` ([Linha 11](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L11))**: Corresponde ao loop guloso de orçamento, testando cada item com os já aceitos via `estimateTokens` do envelope JSON UTF-8. Confirma-se que a rotina pode descartar um item maior e aceitar um posterior menor se couber no orçamento.
- **Ponto Aditivo Corrente (`contract-v02.mjs:327–328` e `abc-runtime.mjs:196–199`) ([Linha 13](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L13))**:
  - `contract-v02.mjs`: linha 327 define `sources: select(base)`, linha 328 define `retrieved: select(retrieved)`.
  - `abc-runtime.mjs`: linha 196 invoca `runtimeEnvelope(...)` passando base e retrieved separadamente, e linha 199 executa `JSON.stringify(envelope)`. Não há deduplicação entre os dois campos na montagem.
- **Ponto Aditivo Histórico no Snapshot (`contract-v02.mjs:305, 322–323` e `abc-runtime.mjs:196, 199`) ([Linha 23](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L23))**: Conferido nos arquivos históricos extraídos em memória do snapshot tar.
- **Substituição Anterior em Probes Passados ([Linha 17](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L17))**:
  - `scripts/benchmarks/live-flow-probe.mjs:208–219`: a seleção recuperada substituía a base (`units = corpus; if (fixture) units = validateSelection(...)`).
  - `scripts/benchmarks/multicase-runner.mjs:229–237`: `sources = c.sources; if (fixture) sources = validateSelection(...)`.
  - `scripts/benchmarks/stable-prompt.mjs:6–18`: reorganiza o prefixo fixo `instruction` + `history` + `sources` + `question`.

### 4.2 Caching e Hotspots Estáticos
- **Confinamento do Caching ao Escopo Auditado ([Linhas 45–46](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L45-L46))**: O texto atesta com sobriedade que não há cache reutilizado no caminho de busca examinado (`src/retrieval/index.ts`), mas ressalva explicitamente que isso não autoriza concluir ausência global de cache em outras camadas ou no host.
- **Hotspots Estáticos como Hipóteses Não Medidas ([Linhas 47–48](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L47-L48))**: Foram apontados candidatos teóricos de custo estático:
  1. A iteração completa sobre o cursor SQLite `rows` sem cláusula `LIMIT`, requerida para consolidar a proveniência de duplicatas.
  2. A tokenização regex redundante para cada candidato na checagem de cobertura do `balanced-v1`.
  3. A serialização repetida do envelope intermediário a cada candidato avaliado no loop de `optimize`.
  O relatório declara expressamente que complexidade estática não comprova gargalo de runtime e que nenhum relógio de profiling foi aferido nesta tarefa.
- **Rigor na Transcrição Histórica da Task 104 ([Linha 49](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/diagnostico-eficiencia-offline.md#L49))**: Os dados foram fielmente transcritos (somas de input A: 261.437, B: 269.101, acréscimo de +7.664 tokens / +2,93%, busca média de 21,58ms e subset de cache de 216.576 tokens). Reafirma-se que history vazio no braço C não demonstra a hipótese de overhead conversacional.

---

## 5. Auditoria da Recomendação e Critérios de Governança

### 5.1 Recomendação Exclusiva: EF-03 Futuro
O relatório e o resultado recomendam estritamente:
- **Intervenção Proposta**: **EF-03: dedupe exato opt-in na montagem aditiva externa** (fora do core retrieval, no nível de orquestração do prompt do benchmark/adaptador).
- **Condições de Aceite Offline**:
  - Exigência de identidade estrita: mesma fonte, unidade, caminho, commit, faixa de linhas, hash SHA-256 e conteúdo textual.
  - Preservação integral de proveniência e metadados de citação na fonte retida.
  - Fail-closed: unidades com commit, caminho ou metadados divergentes ou indeterminados são obrigatoriamente preservadas em duplicidade.
  - Verificação de orçamento inalterada e garantia de menor contagem de bytes sem perda de fatos.
- **Rollback Transparente**: Desabilitar a flag opt-in e restaurar o envelope aditivo sem dedupe.
- **Decisão sobre Caching (EF-04 e EF-07)**: Formalmente postergados. O relatório conclui que a eliminação de redundância exata na montagem tem custo nulo de estado e menor complexidade arquitetural do que introduzir camadas de caching com invalidação e limites de memória, as quais carecem de justificativa empírica neste momento.
- **Não Implementação Imediata**: A recomendação enfatiza reiteradamente que **nenhuma implementação foi ou deve ser realizada agora**, dependendo de autorização e planejamento futuros.

---

## 6. Lista de Verificação dos Requisitos Críticos da Task 128

| Requisito Formal da Task 128 | Status | Evidência Auditada |
| :--- | :---: | :--- |
| **Fontes públicas DEV explicitamente delimitadas** | **PASS** | `offline-manifest.json` e posições 1, 3 e 8 do replay 103 (intervalo DEV 0..26). Nenhuma avaliação privada ou gold acessada. |
| **Isolamento de segurança do helper** | **PASS** | Allowlist estrita, sem travessia (`..`), rejeição de symlinks, tar lido apenas em memória sem extração e modo exclusivo (`x`) contra clobber. |
| **Identidade forte no dedupe** | **PASS** | `same_unit` exige conformidade em 8 campos (`source_id`, `unit_id`, `path`, `commit`, `start_line`, `end_line`, `sha256`, `excerpt`). |
| **Reconciliação matemática e limites zero/null** | **PASS** | 4.065, 8.193 e 5.132 bytes reconciliados em valores + framing; 1.576, 3.517 e 0 bytes evitáveis. Posição 8 com razão `null`. |
| **Separação entre replay 103 e execução real 104** | **PASS** | Explicitamente rotulado como reconstrução sintética do replay 103, sem presunção de equivalência com execuções reais de 104. |
| **Comportamento de `compact-v1`** | **PASS** | Prompt delta 0 verificado por reconstituição via ID no adaptador; core response delta devidamente classificado como `null`. |
| **Caching restrito ao escopo auditado** | **PASS** | Inexistência confirmada no `FtsRetriever` local sem alegações sobre o sistema global ou host. |
| **Hotspots tratados como hipóteses estáticas** | **PASS** | Identificados como candidatos teóricos, sem inventar latências não medidas. |
| **Testes unitários significativos** | **PASS** | 5 testes executados via `python3 diagnose.py --test` com código de saída 0. Reprodutibilidade 100% verde. |
| **Recomendação EF-03 e rollback** | **PASS** | Dedupe opt-in externo único recomendado; rollback definido; sem promessas de "10–30%". |
| **Zero benchmark calls / preservação de dirty** | **PASS** | Zero chamadas a modelos ou benchmarks; sem alteração no código de aplicação ou arquivos dirty preexistentes. |

---

## 7. Conclusão e Próximos Passos Recomendados

Os artefatos entregues na Task 127 atendem a todos os critérios técnicos, analíticos e de segurança exigidos, justificando o parecer de aprovação formal (**`APPROVE`**).

**Recomendações ao Supervisor do CAO**:
1. Homologar a entrega da Task 127 e arquivar este parecer da Task 128.
2. Confirmar o encerramento do diagnóstico offline EF-01/02 com custo de benchmark estritamente zerado (**0 chamadas**).
3. Caso haja decisão de prosseguir no roadmap de eficiência v0.3, delimitar uma especificação formal para **EF-03** focada exclusivamente no dedupe exato opt-in na montagem aditiva, mantendo a diretriz de não autorizar implementações de caching nem pilotos live sem prévia aprovação explícita.
