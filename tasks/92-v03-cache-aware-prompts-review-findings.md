# Task92 — Parecer de Revisão Independente da Task91

**Veredito: APPROVE**

Data da revisão: 2026-10-27.
Revisor: Agente Code Reviewer independente.
Alvo inspecionado: Entrega da Task91 (diagnóstico factual de prompt caching, layout v2 de prompt estável integrado, testes offline e documentação associada).

---

## 1. Verificações Focadas e Execução de Testes

Todas as verificações foram executadas estritamente em modo offline com Node v24.22.1 (`/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`), com `actual_model_calls=0`, sem subagentes, sem warmup pago e sem hosts externos:

1. **Testes focados (`node --test`)**:
   - `test/benchmark-cache-diagnostic.test.mjs` e `test/benchmark-multicase-codex.test.mjs`: **15/15 testes aprovados** (0 falhas, 0 skips).
2. **Checagem de sintaxe (`node --check`)**:
   - Aprovado sem erros em `cache-diagnostic.mjs`, `stable-prompt.mjs`, `multicase-codex.mjs`, `benchmark-cache-diagnostic.test.mjs` e `benchmark-multicase-codex.test.mjs`.
3. **Checagem de diff (`git diff --check`)**:
   - Executado e aprovado com retorno 0 e sem avisos de formatação/espaçamento.
4. **CLI Help e I/O**:
   - `node scripts/benchmarks/cache-diagnostic.mjs --help` executou e exibiu uso sem realizar leitura ou escrita em disco.
5. **Diagnóstico factual da evidência Task89**:
   - Executado sobre `/tmp/mimir-task87-pilot-proposed/result.json`: gerou exatamente a mesma saída estruturada de `/tmp/mimir-task91-cache-evidence/cache-report.json`.
6. **Diagnóstico sobre execução synthetic da Task91**:
   - Executado sobre `/tmp/mimir-task91-stable-offline/result.json`: identificou corretamente as 4 posições como `synthetic: true`, excluiu-as com `synthetic_not_measurement` e `operation_not_eligible`, definiu `coverage.complete: false` e manteve `aggregate: null`.

---

## 2. Inspeção de Código e Conformidade

### A. Diagnóstico de Cache ([`scripts/benchmarks/cache-diagnostic.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/cache-diagnostic.mjs))
- **Cálculos e derivações (L22-L78)**: O subconjunto em cache (`cached_input_tokens`) é tratado rigorosamente como parte de `input_tokens`. A derivação `uncached_input_tokens = input - cached` é exata. `total_tokens` é derivado como `input + output`, sem somar cache em duplicidade.
- **Tratamento de zero, missing e inconsistências (L28-L51, L71-L76)**:
  - Preserva `0` como inteiro válido; quando `input === 0`, `cache_hit_ratio` resulta em `null` com `ratio_reason: "zero_input"`.
  - Campos ausentes, `cached > input`, estouro numérico ou discrepância de total produzem erros específicos (`cache_exceeds_input`, `reported_total_mismatch`), resultando em derivados nulos sem fabricar zeros ou NaNs.
- **Isolamento de synthetic e agregações (L23-L27, L53, L79-L118)**: Execuções simuladas/sintéticas são excluídas de medição. Se a cobertura for parcial ou contiver exclusões, `aggregate` é nulo, impedindo a soma indevida de dados parciais.
- **Segurança de I/O e privacidade (L12-L21, L120-L141)**: Usa `readExplicit` e `outputDirectory` (permissões 0700/0600, criação exclusiva `wx`, sem sobrescrita, recusa symlinks). Nenhuma resposta privada ou reasoning entra no relatório.

### B. Prompt Estável v2 ([`scripts/benchmarks/stable-prompt.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/stable-prompt.mjs))
- **Disposição estrita (L4-L15)**: O prefixo estável `STABLE_PREFIX` fixa primeiro `instruction` e `history: []`, seguido por `sources` públicas na ordem de seleção e `question` por último.
- **Ausência de artefatos indesejados**: Não há padding, tokens inventados, timestamps, IDs de casos, queries ou classes no prefixo.
- **Métricas transparentes (L7-L11)**: Registra `prefix_bytes: 203` e SHA-256 (`3443a352d33328a9b15e5a61a5c2963bd5459acd3b4bdc917b93f150bf6fd172`) estritamente sobre a projeção enviada pela aplicação, sem estimativas arbitrárias de tokenizer ou backend cache.

### C. Integração e Versionamento no Executor ([`scripts/benchmarks/multicase-codex.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs))
- **Preservação de v1 (L69-L92, L230-L233)**: Manifestos `codex-multicase-plan-1` continuam usando `promptFor` canônico. O hash do plano v1 (`95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5`) e o prompt v1 (`b6577fb4f106b15f56b95c02ce34676728827d6bb1786f323cc5b6e054435227`) permanecem inalterados e reproduzíveis.
- **Vinculação estrita de v2**: `codex-multicase-plan-2` exige `prompt_layout === STABLE_LAYOUT`. Qualquer divergência ou adulteração invalida a validação. A autorização operacional de v1 não autoriza planos v2.
- **Entrega real ao stdin**: O teste com transporte fake confirmou que o prompt gerado com layout v2 chega diretamente ao `child.stdin`.

### D. Documentação ([`docs/benchmarks/v03/cache-aware-prompts.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/cache-aware-prompts.md))
- Cita a documentação oficial da OpenAI (`https://developers.openai.com/api/docs/guides/prompt-caching`, 2026-10-27).
- Separa com clareza recursos de API vs limitações do CLI Codex local. Não inventa flags de CLI nem assume thresholds universais ou ganhos garantidos para prompts curtos.
- Esclarece requisitos para comparações futuras justas (mesmas configurações, casos, ordem e limites; consideração de cache ambiente quente sem garantias de cold start).

---

## 3. Diagnóstico Factual dos Dados da Task89

O diagnóstico factual da evidência real da Task89 confirmou com exatidão:
- **Posição 1** (orçamento completo): input 14.931 | cache 12.032 | uncached 2.899 | output 174 | total 15.105 | ratio 80,5840%
- **Posição 2** (orçamento Mimir): input 14.736 | cache 12.032 | uncached 2.704 | output 176 | total 14.912 | ratio 81,6504%
- **Posição 3** (p95 Mimir): input 14.383 | cache 12.032 | uncached 2.351 | output 145 | total 14.528 | ratio 83,6543%
- **Posição 4** (p95 completo): input 15.078 | cache 12.032 | uncached 3.046 | output 151 | total 15.229 | ratio 79,7984%
- **Somas descritivas**: input 59.128 | cache 48.128 | uncached 11.000 | output 646 | total 59.774.
- `cache_attribution`, `cost` e `ttft` permanecem corretamente marcados como `"unavailable"`.

---

## 4. Conclusão e Próximos Passos

A entrega cumpre integralmente os requisitos funcionais, de segurança, compatibilidade retroativa e rigor metodológico:
1. `actual_model_calls=0` verificado;
2. Bundle offline permanece `executable: false` e manifesto `proposed`;
3. Nenhuma alteração em core, dependências globais, configurações ou credenciais;
4. Nenhuma reivindicação precipitada de economia ou desempenho.

Recomenda-se aprovação final da Task91. Qualquer execução piloto real com v2 dependerá de autorização operacional prévia e manifestos explicitamente aprovados.
