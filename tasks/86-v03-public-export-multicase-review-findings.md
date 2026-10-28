# Parecer de Revisão Independente — Task86

**Veredito: APPROVE**  
**Data:** 2026-10-27  
**Alvo:** Implementação offline da Task85 (exportador seguro allowlist, schema público estrito, protocolo de 9 casos e executor multicaso offline plan/simulate).

---

## 1. Escopo e Verificações Executadas

A revisão cobriu os arquivos entregues pela Task85 e executou localmente:

1. **Testes focados da suíte nova:**  
   `node --test test/benchmark-public-multicase.test.mjs`: **17/17 passaram** (isolamento de processo, canários privados, rejeição de symlinks/traversal, verificação Git pin/blob/bytes, determinismo AB/BA, timer contínuo de B e validação de fixtures Service/Storage).
2. **Suíte completa de testes:**  
   `npm test`: **98 passaram, 1 skip (preexistente Windows short-paths), 0 falhas**.
3. **Sintaxe e formatação:**  
   `node --check` em todos os 5 módulos e teste novo: aprovado.  
   `npx prettier --check` nos 6 arquivos JS, JSON de protocolo e 2 docs: sem divergências.  
   `git diff --check`: limpo.
4. **Reprodução independente dos artefatos em diretórios exclusivos:**  
   Exportação, planejamento e simulação reproduzidos via CLI em caminhos novos (`/tmp/mimir-task86-review-*`). O digest SHA-256 público gerado foi idêntico ao reportado:  
   `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`.  
   Os 54 envelopes (`context-1.json` a `context-54.json`) e o plano estrutural bateram byte a byte.
5. **Verificação de fronteira sem modelos/hosts reais:**  
   Zero chamadas externas (`actual_model_calls = 0`), zero conexões de rede, sem bridge de host ou bypass de CLI, e `not_execution_proof = true`.

---

## 2. Análise por Arquivo e Achados Acionáveis

### `scripts/benchmarks/public-bundle.mjs`
- **Fronteira e allowlist estrita ([L24-33](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs#L24-L33), [L122-153](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs#L122-L153)):** A função `exact` valida presença estrita de chaves permitidas e rejeita qualquer campo excedente em todos os níveis.
- **Bloqueio de execução ([L5-9](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs#L5-L9)):** Pacote nasce com `executable: false`, proveniência `caller-unverified` e justificativas offline fixas; o validador rejeita qualquer alteração nesses valores.
- **Canonicidade e SHA-256 ([L15-23](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs#L15-L23), [L204-207](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs#L204-L207)):** O digest público canonicaliza objetos via ordenação lexicográfica de chaves e preserva ordem de arrays. Não depende de formatação e exclui completamente campos privados.

### `scripts/benchmarks/offline-files.mjs`
- **Guarda de caminhos e symlinks ([L18-28](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs#L18-L28)):** `safePath` exige caminhos absolutos, valida portabilidade e varre todos os segmentos ancestrais rejeitando symlinks.
- **Leitura segura ([L29-45](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs#L29-L45)):** Leitura atômica com flag `O_NOFOLLOW`, limite de tamanho de 16 MB e validação bidirecional UTF-8.
- **Diretórios e arquivos privados ([L46-79](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs#L46-L79)):** `writePrivate` usa flag `wx` e modo `0600`; `outputDirectory` cria diretório exclusivo `0700` e publica via renomeação atômica. Falhas limpam somente o diretório recém-criado, sem tocar em caminhos preexistentes.

### `scripts/benchmarks/export-cases.mjs` e `export-cases-cli.mjs`
- **Isolamento do processo privado ([L30-36](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L30-L36)):** Único módulo que consome os arquivos privados de casos.
- **Projeção profunda allowlist ([L70-141](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L70-L141)):** Cada campo público é explicitamente construído. Nenhum objeto privado (`evaluation_private`, `review`, `permissions_ref`, gabaritos ou notas) é repassado ou espalhado (`...`).
- **Verificação Git rigorosa ([L48-69](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L48-L69), [L89-107](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L89-L107)):** Sanitização de variáveis de ambiente Git (`GIT_CONFIG_NOSYSTEM=1`, `core.hooksPath=/dev/null`). Validação contra o commit pin fixo (`166e3cf047b2078952e43dc8e9171e053e99e2ce`), tipo blob regular, equivalência com o arquivo do worktree e contagem exata de linhas.
- **Compatibilidade 6+3 ([L18-29](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L18-L29), [L154-164](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs#L154-L164)):** CLI exige os 6 casos ampliados JSON e exatamente 1 bloco JSON dos 3 casos originais do Markdown, sem interpretar Markdown via shell.

### `scripts/benchmarks/multicase-runner.mjs`
- **Independência do runtime público ([L1-18](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L1-L18)):** O runner não importa módulos de corpus privado nem loaders legados. Consome apenas o pacote público lacrado.
- **Preservação de privacidade no modelo ([L88-105](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L88-L105)):** `promptFor` constrói o envelope estritamente com instrução, pergunta e trechos com proveniência. `case_id`, queries de busca, histórico e caminhos locais são deliberadamente omitidos do envelope. Scratchs em disco usam nomes ordinais opacos (`slot-N`).
- **Validação de busca e timer de B ([L106-126](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L106-L126), [L228-236](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L228-L236)):** `validateSelection` valida hash e conteúdo de cada retorno contra o pool do caso e deduplica unidades. Não há oracle de relevância; no caso negativo de p95, falsos positivos lexicais reais são preservados sem forçar vazio. O timer de B contabiliza busca e serialização de ponta a ponta, excluindo setup e teardown.
- **Tratamento de limites e falhas ([L246-250](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L246-L250), [L267-270](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L267-L270)):** Excesso de contexto marca o slot como `infeasible` (`context_cap`), sem truncamento silencioso. Falhas marcam `local_error` com diagnósticos sanitizados.
- **Limitação de transporte ([L181-184](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L181-L184), [L294-345](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs#L294-L345)):** Aceita exclusivamente fakes declarados com marcador neutro (`offline-simulation`). Não implementa comandos live nem bridge de host.

### `test/benchmark-public-multicase.test.mjs`
- **Proteção do harness de processo isolado ([L548-585](file:///mnt/d/Projects/MimirNL/test/benchmark-public-multicase.test.mjs#L548-L585)):** Conforme exigência expressa da Task86, o teste instrumenta `fs.openSync` e `fs.readFileSync` permitindo estritamente o `bundle.json` explícito, arquivos próprios do slot de output e módulos de código `.mjs`/`.js`. Não usa allowlist genérica por extensão (`.json`/`.md`), garantindo que tentativas de acessar arquivos privados de casos ou gold falhem imediatamente.

---

## 3. Limitações e Próximos Passos

1. **Escopo estritamente offline:** Os 9 casos permanecem com status `pending` nos documentos originais. A exportação não confere aceite nem validação de gabarito humano.
2. **Ausência de métricas de modelo:** Todos os 54 slots simulated mantêm `actual_model_calls: 0`, métricas de uso como `null`/`unavailable`, e não há aferição de economia, custo ou TTFT.
3. **Próximo gate:** Qualquer execução live futura demandará autorização humana prévia, manifesto congelado, bridge de transporte revisado e isolamento próprio.

A implementação cumpre integralmente os requisitos de segurança, reprodutibilidade e separação de fronteiras da Task85.

**Conclusão:** Parecer favorável (**APPROVE**) sem pendências de código ou teste.
