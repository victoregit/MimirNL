# Task132 — Parecer de Revisão Técnica do Piloto EF03 de 4 Chamadas

- **Data**: 2026-10-28
- **Revisor**: `reviewer-task132-antigravity` (antigravity_cli, gemini-3.8-flash-high, sem delegação)
- **Autor da Preparação (Task131)**: `developer-task131`
- **Supervisor Solicitante**: Terminal `8322dad0`
- **Veredito**: **APPROVE**
- **Estado**: **offline_review_completed** — 0 chamadas a modelos, 0 execuções do launcher live.

---

## 1. Sumário Executivo

A entrega da **Task 131** foi revisada exaustivamente de forma offline quanto à precisão, segurança, funcionalidade, fidelidade ao plano congelado, preservação do repositório baseline e conformidade estrita com as especificações de deduplicação EF03 (Tasks 129/130) e limites operacionais (Tasks 103/104/113/114/131).

Nenhum desvio, vulnerabilidade ou bypass foi identificado. O código foi validado contra execução acidental: o entry point `ef03-pilot-launch.mjs` é fechado, rejeita qualquer execução via import/default/help, exige argumentos canônicos exatos, requer runtime Node v24.22.1 verificado, exige autorização externa exclusiva do supervisor vinculada a este parecer e ao plano congelado, consome token de epoch único (`epoch1-consumed.json` com flag `wx`) antes de qualquer subprocesso e impõe parada imediata no primeiro erro ou esgotamento de quota sem retries.

O repositório mantém integridade estrita: **85 arquivos preexistentes foram auditados por SHA-256 e apresentam 0 divergências**, preservando integralmente o core, manifestos históricos (103/104), políticas e suítes anteriores.

---

## 2. Hashes Aprovados e Inventário de Código

Todos os hashes foram verificados diretamente no filesystem:

| Componente | Caminho Absoluto | SHA-256 |
| :--- | :--- | :--- |
| **Plano Canônico (Payload)** | Reconstruído via `buildPlan()` | `563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb` |
| **Arquivo de Plano** | `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/plan.json` | `5561c0894593f46c77179f24513d857cc1ef8836cd4a2670d6bdc00d8bf26f44` |
| **Runner EF03** | `/mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot.mjs` | `3aa120eb72e668ae37f95a6419c8727813a4c977c3f80e3b8fc36165fbbbde13` |
| **Launcher Fechado** | `/mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot-launch.mjs` | `f0668dd72d3849138898b00d846a7bd9595f452eed5b4fe78c0e484197c16a7e` |
| **Suíte de Testes 131** | `/mnt/d/Projects/MimirNL/test/benchmark-ef03-pilot.test.mjs` | `26998233919f3986b884020be80e20ff7a155b1e14228849f960eaa3666e93bc` |
| **Critérios de Qualidade** | `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/quality.json` | `c461c140bd44da7dc435dd1e9053289d3c2ad02d98193fa6a2acda4d6b4e854e` |
| **Schema Autorização** | `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/authorization.schema.json` | `f61d35ed4d37bc170eb82781597ada861eecfb0b9f594e8fbe7e3891d5b74d69` |
| **Executável Codex CLI** | `/home/usuario/.codex/packages/standalone/releases/0.164.0-x86_64-unknown-linux-musl/bin/codex` | `b93f6811d3f653f0fb83be4050d857fb9abbb111dfa2ce160563327daff7f306` |
| **Runtime Node 24** | `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` | `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb` |

---

## 3. Avaliação Detalhada por Categorias

### 3.1. Funcionalidade e Desenho do Piloto
- **Sequência balanceada**: Quatro chamadas configuradas na ordem estrita:
  1. DEV1 (`position: 1`) com `base_overlap: "preserve"` (4.065 bytes)
  2. DEV1 (`position: 1`) com `base_overlap: "exact-v1"` (2.489 bytes)
  3. DEV3 (`position: 3`) com `base_overlap: "exact-v1"` (4.676 bytes)
  4. DEV3 (`position: 3`) com `base_overlap: "preserve"` (8.193 bytes)
- **Controle de viés posicional**: Alternância DEV1 (preserve→exact) e DEV3 (exact→preserve) balanceia os pares de observação.
- **Deduplicação offline comprovada**: Apenas os itens recuperados integralmente idênticos às fontes de base são omitidos na condição `exact-v1`. Nenhuma chave adicional, instrução ou conteúdo foi alterado.
- **Isolamento de Search**: Nenhuma busca ativa ou chamada de serviço é realizada; os inputs vêm dos snapshots congelados da Task 103 (`offline-manifest.json`, `position-01.json`, `position-03.json`). O campo `retrieval_latency_ms` permanece expressamente `null` e rotulado como `N_A_fixed_public_selection_no_search`.

### 3.2. Segurança e Isolamento do Host
- **Sem execução implícita**: A importação dos módulos `ef03-pilot.mjs` e `ef03-pilot-launch.mjs` não dispara processos, não lê credenciais e não acessa a rede.
- **Rejeição default/help**: Execuções sem parâmetros ou com `--help` encerram limpas sem efeito colateral.
- **Prevenção de escalada/escape**:
  - Argumentos isolados do Codex: `--ignore-user-config`, `--ephemeral`, `--sandbox read-only`, `--cd <owned-empty-scratch>`, `--disable apps`, `--disable plugins`, `--disable multi_agent`.
  - Scratch em diretório temporário restrito (`0700`), de propriedade exclusiva do usuário (`process.getuid()`), removido em bloco `finally`.
  - Sem leitura de segredos: nenhum acesso a `~/.aws/credentials`, `~/.ssh/*`, `.env`, `*.pem` ou tokens.
- **Detecção de ferramentas**: Interrompe e invalida imediatamente a chamada caso qualquer invocação de tool seja emitida pelo modelo (`item.type !== "agent_message" && item.type !== "reasoning"`).

### 3.3. Transporte Bounded e Limites Rígidos
- **Transporte auditado reutilizado**: `abc-transport.mjs` é consumido sem implementações alternativas de rede ou parsers ad-hoc.
- **Adapter de captura agregada (`boundedSpawn`)**: Monitora o fluxo combinado `stdout + stderr`. Ao ultrapassar `LIMITS.capture_bytes` (64.000 bytes), encerra o processo via `SIGKILL` no process group (`-child.pid`), destrói as streams e marca o status como limit/falha sem reter transcrições brutas.
- **Limites estritos**:
  - `attempts`: 4
  - `retry`: 0
  - `concurrency`: 1
  - `call_ms`: 90.000 ms (90 segundos por chamada)
  - `global_ms`: 720.000 ms (12 minutos agregados desde o início do preflight)
  - `prompt_bytes`: 32.000 bytes máx por prompt
  - `capture_bytes`: 64.000 bytes máx por processo
- **Parada no primeiro erro**: Qualquer timeout, código de saída != 0, detecção de ferramenta ou erro encerra a execução; todas as chamadas restantes permanecem com status `"not_run"`.

### 3.4. Governança e Validação de Autorização Externa
- **Impossibilidade de autoautorização**: O código não emite autorizações. A função `authorize()` valida 10 chaves obrigatórias estritas, schema `ef03-pilot-authorization-131-v1`, correspondência de `plan_sha256`, correspondência exata do `review_sha256` deste parecer, veredito `APPROVE`, `epoch: 1`, `max_attempts: 4` e **três identidades distintas** (`author_ref`, `reviewer_ref`, `supervisor_ref`).
- **Consumo único irreversível**: Antes de qualquer spawn, o launcher grava `epoch1-consumed.json` no diretório pai com flag `wx` e modo `0600`. Se o arquivo já existir, o launcher falha imediatamente com `EEXIST`.
- **Destino protegido**: O diretório de saída `/home/usuario/.local/share/mimir-ef03-pilot/epoch1-dev13-20261028` deve ser inexistente antes da execução (`ENOENT`), garantindo ausência de clobber ou sobrescrita.

### 3.5. Sanitização de Resultados e Critérios de Qualidade
- **Sanitização de saída**: O arquivo final `results.json` exporta apenas tokens permitidos (`input_tokens`, `output_tokens`, `cached_input_tokens`, `total_tokens`, `uncached_input_tokens`), modelo solicitado (`gpt-6.1-sol`), modelo observado (se allowlisted) ou null, hash e tamanho da resposta final, e tempos de fronteira. Nenhuma transcrição intermediária, reasoning, erro bruto ou stderr é persistido.
- **Valores nulos explícitos**: `cost`, `ttft_ms` e `cached_savings` permanecem explicitamente `null`.
- **Critérios de qualidade externos**: O arquivo `tasks/131-ef03-pilot/quality.json` mantém critérios pré-fixados totalmente desacoplados dos prompts, exigindo avaliação posterior e independente sem contaminar os envelopes enviados ao modelo.

---

## 4. Verificações Realizadas pelo Revisor

1. **Validação de Plano Canônico**:
   - `buildPlan()` e `validatePlan(p)` executados via runtime Node v24.22.1.
   - SHA-256 canônico obtido: `563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb` (idêntico ao especificado).
2. **Auditoria de Preservação do Baseline**:
   - Comparação dos 85 arquivos listados em `before.json`: 85 auditados, **0 discrepâncias**.
   - Arquivos essenciais (`package.json`, `package-lock.json`, `src/core/*`, manifestos da Task 103, schemas, contratos) intactos.
3. **Inspeção de Logs de Testes e Linters**:
   - Suíte de testes: 28/28 testes passando (exit code 0), incluindo os 7 testes dedicados da Task 131.
   - Formatação Prettier: limpa (`All matched files use Prettier code style!`).
   - ESLint: limpo (exit code 0).
   - Git diff check: limpo (exit code 0).
4. **Verificação de Ausência de Execução Live Prévia**:
   - `actual_model_calls` = 0 em todos os artefatos de preparação.
   - O diretório `/home/usuario/.local/share/mimir-ef03-pilot` não existe no sistema.
   - Nenhum token de consumo ou arquivo de saída foi criado.

---

## 5. Instruções e Gates para Execução Live pelo Supervisor

O supervisor deve cumprir estritamente as etapas a seguir para homologar a execução:

### 5.1. Criação do Ambiente de Autorização Externa

1. Criar o diretório de governança com permissão restrita `0700`:
   ```bash
   mkdir -p /home/usuario/.local/share/mimir-ef03-pilot
   chmod 0700 /home/usuario/.local/share/mimir-ef03-pilot
   ```

2. Criar o arquivo de autorização `/home/usuario/.local/share/mimir-ef03-pilot/authorization-epoch1.json` com permissão restrita `0600`:
   ```json
   {
     "schema_version": "ef03-pilot-authorization-131-v1",
     "plan_sha256": "563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb",
     "review_task": 132,
     "review_sha256": "<SHA256_DESTE_ARQUIVO_DE_PARECER>",
     "reviewer_ref": "reviewer-task132-antigravity",
     "supervisor_ref": "supervisor-terminal-8322dad0",
     "verdict": "APPROVE",
     "epoch": 1,
     "max_attempts": 4,
     "output": "/home/usuario/.local/share/mimir-ef03-pilot/epoch1-dev13-20261028"
   }
   ```
   *Nota: O campo `review_sha256` deve conter o SHA-256 exato deste arquivo (`tasks/132-ef03-four-call-pilot-review-findings.md`).*

3. Ajustar as permissões:
   ```bash
   chmod 0600 /home/usuario/.local/share/mimir-ef03-pilot/authorization-epoch1.json
   ```

### 5.2. Comando Homologado de Execução Live

O supervisor poderá então disparar o comando live uma única vez:

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot-launch.mjs --live /mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/plan.json /home/usuario/.local/share/mimir-ef03-pilot/authorization-epoch1.json
```

---

## 6. Conclusão

A entrega da Task 131 está plenamente conforme todos os requisitos técnicos, de segurança e de integridade metodológica. **Veredito: APPROVE**.
