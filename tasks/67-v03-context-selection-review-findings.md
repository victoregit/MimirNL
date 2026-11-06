# Parecer de Revisão Independente — Task67

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Alvo:** Implementação da Task66 (Seleção de contexto sem duplicação de fontes)  
**Artefatos revisados:**

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/context-selection-probe.mjs`
- `/mnt/d/Projects/MimirNL/test/benchmark-context-selection.test.mjs`
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/selecao-contexto.md`
- `/mnt/d/Projects/MimirNL/tasks/66-v03-context-selection-result.md`
- Diff em `/mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs`

---

## 1. Checks Executados

1. **Testes automatizados offline (Node v24.22.1)**:
   - Execução: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/benchmark-context-selection.test.mjs test/benchmark-paired-probe.test.mjs test/benchmark-codex-usage.test.mjs`
   - Resultado: 20/20 testes passaram em 4,35 s (novo runner, runner anterior e coletor aprovado).
2. **Checagem de sintaxe**:
   - `node --check scripts/benchmarks/context-selection-probe.mjs scripts/benchmarks/paired-probe.mjs test/benchmark-context-selection.test.mjs` — aprovado sem erros.
3. **Checagem de estilo e formatação**:
   - `prettier --check` nos 5 arquivos tocados/criados — aprovado sem divergências.
4. **Higiene do repositório**:
   - `git diff --check` — sem conflitos de whitespace ou marcadores.
   - Preservação de arquivos não rastreados e `AGENTS.md`. Zero commits, pushes ou alterações em `src/`, `package.json` ou CI.
5. **Inspeção de rede e modelos**:
   - Nenhuma chamada real a provedores de LLM e nenhum tráfego de rede executado.

---

## 2. Conformidade com os Requisitos

- **Corpus e Pinning**: 6 módulos reais do commit `166e3cf047b2078952e43dc8e9171e053e99e2ce` extraídos via `git show`. Hashes SHA-256, tamanhos em bytes e contagem de linhas fixados antes das invocações. Teto de 32.000 caracteres por módulo respeitado.
- **Paridade e Deduplicação (Correção Task64/65)**: A condição A (`contexto_completo`) recebe os 6 arquivos exatamente uma vez. A condição B (`selecao_mimir`) recebe **exclusivamente** os trechos retornados pela busca real descartável via Mimir (1 a 3 unidades), sem incluir o contexto base e sem duplicar fontes no prompt.
- **Isolamento de Dados**: Cada posição B inicializa instâncias limpas de `Service` e `Storage` em diretório temporário sob `/tmp` com repositório Git sintético vazio. Unidades ingeridas como `origin: user` e `status: candidate`. Fechamento e remoção garantidos em bloco `finally`.
- **Prevenção de Oráculo/Gold**: `validateSelection` valida integridade, ausência de duplicatas e limites de contagem sem substituir fontes vazias ou filtrar com base em gabarito.
- **Snapshot e Plano**: `plan.json` é gravado antes de qualquer despacho com hashes SHA-256 e contagens de bytes de cada contexto e envelope. Bytes não são confundidos com tokens.
- **Pin de Modelo e Execução**: Solicitação explícita `-m gpt-6.1-sol` e `-c 'model_reasoning_effort="low"'` nas 6 posições (ordem AB/BA/AB). Bounded limits de stream (16 MiB stdout, 1 MiB linha/stderr, 64 KB resposta), timeout de 90 s por processo e teto global de 10 min. Rejeição estrita de invocação de ferramentas.
- **Métricas e Coletor**: `end_to_end_ms = wall_ms + retrieval_ms` (contado 1x para B, 0 para A; setup/close excluídos). Uso de tokens auditado pelo coletor Task59/60 inalterado. Cache não duplicado, null preservado, percentuais causais omitidos e qualidade declarada pendente.
- **Compatibilidade do Runner Anterior**: O diff em `scripts/benchmarks/paired-probe.mjs` limita-se a aceitar vetor de argumentos externo e cronometrar `first_agent_message_completed_ms`. Testes existentes continuam passando integralmente.

---

## 3. Achados, Limitações e Observações

- **Baixa Severidade / Operacional**:
  - `docs/benchmarks/v03/selecao-contexto.md:28` e `tasks/66-v03-context-selection-result.md:52`: O comando de execução futura requer diretório destino novo sob `/tmp`. O runner bloqueia destinos preexistentes (`wx`) e fora de `/tmp`.
  - **Limitação de Amostra**: Apenas 3 pares exploratórios. O runner documenta explicitamente que os resultados de tokens/tempo não constituem inferência causal nem garantia de economia.
  - **Disponibilidade do Modelo**: A execução autorizada (Task 68) exigirá a presença do modelo `gpt-6.1-sol` no runtime local do executor. O runner armazena divergência (`run.model_divergence`) sem falha silenciosa.

---

## 4. Conclusão

A entrega da Task 66 cumpre rigorosamente as especificações de metodologia, segurança, isolamento e integridade de métricas. Está aprovada para a etapa de execução ao vivo (Task 68), condicionada à autorização humana.
