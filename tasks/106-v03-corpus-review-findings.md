# Task106 — Parecer de Revisão Independente do Corpus 0.2

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Revisor:** Revisor Independente Task 106 — Code Reviewer Agent (`gemini-3.8-flash-high-task106-reviewer`), autor distinto de `codex-task101`  
**Alvo da revisão:** Entrega de corpus e preparação da [Task 101](file:///mnt/d/Projects/MimirNL/tasks/101-v03-corpus-result.md) ([corpus-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/corpus-0.2.md), [sources-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/sources-0.2.json), [development-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/development-0.2.json), [freeze-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/freeze-0.2.json), [provenance-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/provenance-0.2.json), [dependencies-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/dependencies-0.2.json), snapshots e histórico de 0 bytes em [evidencias/preparacao](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/), além do diretório privado local `/home/usuario/mimir-private/task101-evaluator`).  
**Auditoria:** `actual_model_calls = 0`; revisão técnica e documental estritamente offline, sem execução de modelos, sem tuning, sem alteração de código do core ou scripts, e sem subagentes.

---

## 1. Verificação de Fontes, Snapshots, Licença e Histórico

A auditoria individual de cada artefato fonte contra o commit Git fixado (`PIN = 166e3cf047b2078952e43dc8e9171e053e99e2ce`) confirmou conformidade absoluta com o [contrato-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md#L11-L16):

1. **Git Pin e Blobs Regulares:**
   - As 19 unidades declaradas em [sources-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/sources-0.2.json) foram inspecionadas via `git ls-tree 166e3cf047b2078952e43dc8e9171e053e99e2ce -- <path>`. Todas constituem blobs regulares com modo `100644` ou `100755`. Nenhuma fonte aponta para links simbólicos, diretórios ou submódulos.
2. **Intervalos, UTF-8 e Hashes SHA-256:**
   - Cada trecho foi conferido linha por linha através da extração canônica de `git show 166e3cf047b2078952e43dc8e9171e053e99e2ce:<path>`.
   - O número exato de linhas `(end_line - start_line + 1)` confere rigorosamente com o texto extraído.
   - O hash SHA-256 de cada unidade coincide com o gravado no manifesto de fontes e em cada um dos 19 arquivos `.txt` individuais em [evidencias/preparacao](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/).
3. **Licença MIT:**
   - O arquivo [LICENSE](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/LICENSE) reproduz as linhas 1 a 21 do arquivo `LICENSE` da raiz no pin `166e3cf047b2078952e43dc8e9171e053e99e2ce`, com SHA-256 correspondente e preservando os direitos de autor.
4. **Histórico Vazio (Cenário C):**
   - O arquivo [history-c.txt](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/history-c.txt) contém exatamente 0 bytes e hash SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, atendendo integralmente ao [contrato-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md#L38). O braço C atua como controle idêntico a A, sem reivindicações de histórico longo não comprovadas.
5. **Freshness e Ausência de Stale Falso:**
   - [provenance-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/provenance-0.2.json#L8) registra o estado de recência como `unknown; no evaluated current reference or legitimate stale asserted`. Nenhuma fonte foi marcada arbitrariamente como `current` ou `stale`, mantendo a integridade epistêmica do benchmark.

---

## 2. Auditoria dos 9 Casos de Development (Projeção 0.2)

Os 9 casos do split `development` foram auditados comparando a projeção em `/home/usuario/mimir-private/task101-evaluator/development-reference-0.2.json` e o bookkeeping público [development-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/development-0.2.json) com as bases legadas auditadas nas Tasks 54/55 e 83/84:

- **Casos Piloto (Task 54/55):** `pilot-approval`, `pilot-budget`, `pilot-failure`.
- **Casos Ampliados (Task 83/84):** `expanded-budget-envelope`, `expanded-sharing-eligibility`, `expanded-project-path-boundary`, `expanded-production-p95-absent`, `expanded-runtime-config-absent`, `expanded-apparent-version-scope`.

### Constatações da Auditoria:
1. **Fidelidade Textual e Metodológica:**
   - Perguntas (`task`), consultas de busca (`query`), pools declarados (`pool`), respostas esperadas (`expected_answer`), unidades relevantes ($R$) e itens da rubrica com seus pesos foram integralmente preservados em relação aos documentos 0.1 (`casos.md` e `corpus-ampliado.json`).
2. **Evolução de Versão e Formato:**
   - O campo `case_revision` foi avançado para `2` em todos os 9 casos de desenvolvimento, permitindo rastrear formalmente a transição para o perfil `technical_reviewed-v1` e contrato `0.2` sem colisão com dados legados.
   - O parâmetro $k$ foi fixado explicitamente em `3` (`PARAMETERS.k = 3`).
   - O array `base` coincide exatamente com `pool`, garantindo que todas as unidades do pool figurem como fontes básicas do cenário A e do cenário C, sem subtração ou ocultamento de contexto para favorecer artificialmente a busca B.
3. **Separação de Bookkeeping Operacional vs. Avaliação Privada:**
   - O arquivo público [development-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/development-0.2.json) contém estritamente os campos operacionais necessários (`case_id`, `case_revision`, `split`, `task`, `query`, `pool`, `base`). Não contém respostas, rubricas, unidades relevantes ou metadados de avaliação, protegendo os baselines contra contaminação.

---

## 3. Revisão Analítica dos 3 Casos Novos de Evaluation (Holdout)

Os 3 casos do split `evaluation` localizados em `/home/usuario/mimir-private/task101-evaluator/evaluation-0.2.json` foram auditados individualmente:

| Caso | Arquivo / Linhas Pin | Tópico Analítico | Relevantes ($R$) | Rubrica (Critérios e Pesos) |
| :--- | :--- | :--- | :--- | :--- |
| `holdout-1` | `src/storage/backup.ts` (linhas 22–66) | Validação estrutural de schema, migrations e integridade no restore de backup | `["backup-validation/behavior"]` | 3 critérios (pesos 2, 1, 1): comparação integral de `sqlite_master`, versão 1 de migrações e `integrity_check`/`foreign_key_check`. |
| `holdout-2` | `src/mcp/index.ts` (linhas 1–28) | Registro de tools MCP via schema e conversão do resultado de `service.call` em `content` e `isError` | `["mcp-response/behavior"]` | 3 critérios (pesos 2, 1, 1): iteração de schemas com `registerTool`, serialização JSON em `content`, e derivação de `isError = !result.ok`. |
| `holdout-3` | `src/cli/index.ts` (linhas 10–47) | Caso negativo / Insuficiência de evidência: contagem de restores concluídos na instalação Beta em janela temporal | `[]` ($R = \emptyset$) | 3 critérios (pesos 2, 1, 1): declaração explícita de insuficiência sem inventar zero, distinção entre código de comando e logs de execução, e citação dos limites da fonte. |

### Avaliação Qualitativa do Holdout:
1. **Desconexão Estrita do Development:**
   - As 3 fontes foram extraídas de arquivos e intervalos nunca utilizados nos 9 casos de development (`backup.ts`, `src/mcp/index.ts` e linhas 10–47 de `src/cli/index.ts`). Não há sobreposição com os trechos do split de treino.
2. **Completude de $R$ e Caso Negativo $R = \emptyset$:**
   - Em `holdout-1` e `holdout-2`, o conjunto de unidades relevantes $R$ é unitário e suficiente para responder com precisão fática à tarefa solicitada.
   - Em `holdout-3`, $R = []$ representa com exatidão a insuficiência do pool para responder à contagem de execuções históricas. A resposta esperada e a rubrica exigem abstenção fundamentada e penalizam a inferência infundada de zero a partir da ausência de dados, distinguindo rigorosamente `R = []` de `relevant_units = null` (que denota ausência de gabarito/sem_gold).
3. **Qualidade das Respostas Candidatas e Rubricas:**
   - As respostas esperadas são objetivas, técnicas e delimitadas ao conteúdo fático dos trechos.
   - Os pesos das rubricas priorizam a asserção nuclear (peso 2) e exigem precisão de citação e fronteira de evidência (pesos 1).

---

## 4. Isolamento do Seed, Envelope de Execução e Fronteiras de Holdout

1. **Envelope de Execução (`runtimeEnvelope`):**
   - A função `runtimeEnvelope` em [contract-v02.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs#L305-L329) constrói o contexto de entrada para o modelo contendo exclusivamente: `instruction`, `task`, `sources` (fontes básicas do `base`), `retrieved` e `history: ""`.
   - Nenhum metadado de caso (`case_id`, `case_revision`, `split`), gabarito (`expected_answer`), unidades relevantes (`relevant_units`), rubrica ou parecer de revisão técnica vaza para a carga útil.
   - O tamanho de cada envelope gerado para os 12 casos (9 dev + 3 eval) permaneceu abaixo do teto contratual de 32.000 bytes UTF-8 (`PARAMETERS.context_bytes = 32000`).
2. **Isolamento Físico e Operacional:**
   - O material privado de evaluation e referências técnicas completas permanece restrito ao diretório externo `/home/usuario/mimir-private/task101-evaluator`, com permissões de diretório `0700` e arquivos `0600`.
   - O operador da [Task 102](file:///mnt/d/Projects/MimirNL/tasks/102-v03-core-improvements.md) está formalmente proibido de inspecionar `/home/usuario/mimir-private/task101-evaluator` e [tasks/101-review-scope.json](file:///mnt/d/Projects/MimirNL/tasks/101-review-scope.json), garantindo que o holdout permaneça intocado para a fase de avaliação cega.
3. **Inalterabilidade do Freeze Operacional Development:**
   - O arquivo público [freeze-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/freeze-0.2.json) não sofreu nenhuma alteração, cumprindo a diretriz contratual de que o freeze operacional só deve ser atualizado caso o conteúdo público mude.

---

## 5. Atualização de Registros Técnicos e Emissão de Recibos

Conforme atribuído com exclusividade ao revisor independente na Task 106:

1. **Atualização de Registros em `/home/usuario/mimir-private/task101-evaluator/`:**
   - Os 9 casos em `development-reference-0.2.json` e os 3 casos em `evaluation-0.2.json` tiveram seu bloco `technical_review` atualizado de `pending` para:
     ```json
     "technical_review": {
       "status": "technical_reviewed",
       "author_ref": "codex-task101",
       "reviewer_ref": "gemini-3.8-flash-high-task106-reviewer",
       "evidence_ref": "tasks/106-v03-corpus-review-findings.md"
     }
     ```
   - O campo `human_acceptance_ref: null` foi rigorosamente preservado em todos os 12 registros. Nenhuma aprovação humana fictícia foi gerada.
2. **Revalidação de Planos Offline:**
   - Os arquivos `development-plan-0.2.json` (27 runs determinísticas: 9 casos × 1 repetição × 3 cenários) e `evaluation-plan-0.2.json` (27 runs determinísticas: 3 casos × 3 repetições × 3 cenários) foram recalculados via `makePlan`, refletindo os novos hashes canônicos dos conjuntos revisados.
3. **Emissão de Recibos Separados (`technical-review-receipt-0.2`):**
   - Emitido recibo de desenvolvimento com conformidade estrita ao schema do validador:
     - [tasks/106-technical-review-receipt-dev-0.2.json](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-dev-0.2.json) (e réplica no diretório privado):
       - `schema_version`: `"technical-review-receipt-0.2"`
       - `author_ref`: `"codex-task101"`
       - `reviewer_ref`: `"gemini-3.8-flash-high-task106-reviewer"`
       - `verdict`: `"APPROVE"`
       - `evidence_ref`: `"tasks/106-v03-corpus-review-findings.md"`
       - `bundle_sha256`: `e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9`
       - `cases_sha256`: `176893a787812e4f1add6ba7599795f354922d360e54c9ee5a5a94d020e51f1a`
   - Emitido recibo de evaluation:
     - [tasks/106-technical-review-receipt-eval-0.2.json](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-eval-0.2.json) (e réplica no diretório privado):
       - `cases_sha256`: `7f4bab5f95294850aa3adc5b56f2d0847fb99fe7ddd50791bc2956fbcab4641c`
   - O recibo geral [tasks/106-technical-review-receipt-0.2.json](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-0.2.json) aponta para a validação de desenvolvimento necessária para o gate imediato.
   - A execução de `reviewEligibility(devCases, bundle, devReceipt)` e `reviewEligibility(evalCases, bundle, evalReceipt)` retornou:
     ```json
     {
       "structurally_eligible": true,
       "authenticity": "requires-supervisor-verification",
       "live_enabled": false
     }
     ```
4. **Recongelamento do Escopo Externo:**
   - O arquivo [tasks/101-review-scope.json](file:///mnt/d/Projects/MimirNL/tasks/101-review-scope.json) foi atualizado para o status `technical_reviewed` com as referências cruzadas e os novos hashes canônicos dos arquivos privados (`development_sha256: 176893a7...`, `private_evaluation_sha256: 7f4bab5f...`), preservando `human_acceptance_ref: null`.

---

## 6. Checks Reproduzidos

1. **Auditoria Estrutural e de Hashes:** Executado script de verificação de integridade reproduzindo todos os 13 passos do processo:
   - Validação completa do bundle público via `validateBundle`.
   - 100% de correspondência dos 19 blobs e excerpts com o Git pin `166e3cf047b2078952e43dc8e9171e053e99e2ce`.
   - Exatidão do snapshot da licença MIT e do arquivo de histórico de 0 bytes.
   - Correspondência exata dos arquivos referenciados em `dependencies-0.2.json` e `code-inventory-0.2.json`.
   - Validação de todos os 12 casos via `validateCase`.
   - Verificação do isolamento do envelope de contexto e do orçamento de 32.000 bytes.
   - Validação determinística dos planos de development (27 runs) e evaluation (27 runs) via `makePlan`.
2. **Suíte Completa de Testes de Regressão:**
   - `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test`: **126 testes (125 passed, 1 skipped por plataforma Windows, 0 failed)**, mantendo integridade com as fases anteriores.
3. **Formatação e Diff:**
   - `git diff --check` executado com retorno limpo (código 0).

---

## 7. Parecer Final e Próximos Passos

A entrega do corpus 0.2 atende rigorosamente a todos os critérios metodológicos, de governança e de segurança estabelecidos no [contrato-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md) e na [Task 101](file:///mnt/d/Projects/MimirNL/tasks/101-v03-corpus-result.md).

- **Veredito:** **APPROVE**
- **Bloqueios e Próximos Portões:**
  - O portão de corpus 0.2 está **aprovado**.
  - A [Task 102 — Melhorias do core](file:///mnt/d/Projects/MimirNL/tasks/102-v03-core-improvements.md) está **desbloqueada** para execução, devendo operar estritamente sobre as fontes públicas ([sources-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/sources-0.2.json)), operações de development ([development-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/development-0.2.json)) e parâmetros congelados ([freeze-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/freeze-0.2.json)).
  - O operador da Task 102 permanece proibido de acessar `/home/usuario/mimir-private/task101-evaluator` e [tasks/101-review-scope.json](file:///mnt/d/Projects/MimirNL/tasks/101-review-scope.json).
  - A [Task 103 — ABC Runner](file:///mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner.md) permanece condicionada à conclusão com parecer aprovado da Task 102 (e suas revisões subsequentes), tendo agora satisfeitas as pendências da Task 106 e da Task 107.
