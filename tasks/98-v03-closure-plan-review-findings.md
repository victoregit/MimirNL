# Task98 — Parecer de Revisão Independente do Plano de Fechamento v0.3

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Alvo:** [Task97 — Auditoria e plano de fechamento v0.3](file:///mnt/d/Projects/MimirNL/tasks/97-v03-closure-gap-audit-result.md)  
**Status da auditoria:** actual_model_calls = 0; análise documental e arquitetural offline estrita.

---

## 1. Avaliação de Conformidade e Critérios do Roadmap

O relatório da [Task97](file:///mnt/d/Projects/MimirNL/tasks/97-v03-closure-gap-audit-result.md) mapeia com precisão cada um dos sete critérios de saída da [v0.3 do ROADMAP](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md#v030--useful-context-not-just-more-context-p0), confrontando a evidência acumulada (Tasks 50–96) com as lacunas reais do código e da documentação.

1. **Corpus e Holdout:** Distingue corretamente o corpus exploratório/development (9 casos) de um conjunto de evaluation separado (3 casos holdout). Não reivindica representatividade ampla de produção indevidamente.
2. **Métricas e Denominadores:** Exige denominadores matematicamente corretos em Precision/Recall@k, tratamento formal para ausência de gold (`sem_gold`) e baselines sem retrieval (`N_A`), além de rastreamento explícito de citações e memórias stale/unknown.
3. **Três Cenários Contratuais:** Reconhece que os testes A/B exploratórios anteriores não cumprem a comparação de três cenários (`sem_memoria`, `com_mimir`, `historico_completo`). O plano resolve isso tratando o histórico vazio como controle equivalente sem inventar claims de histórico longo.
4. **Tokens e Custos:** Mantém honestidade operacional: dados indisponíveis via CLI (custo financeiro faturável, TTFT, identidade de modelo) são rotulados como `unavailable`, sem fabricação de tarifas ou reservas monetárias fictícias.
5. **Melhorias de Core:** Identifica deficiências reais em [`service.ts`](file:///mnt/d/Projects/MimirNL/src/core/service.ts) (deduplicação após limit em vez de antes) e [`retrieval`](file:///mnt/d/Projects/MimirNL/src/retrieval/index.ts) (falta de recência e formato compacto com proveniência).
6. **Fallback e Hard Budget:** Planeja a introdução de corte por baixa relevância e respeito a limites rígidos em bytes UTF-8 (alinhado aos ~14–15k tokens reais da CLI), superando a premissa obsoleta de 4096 tokens.
7. **Métricas Locais Opt-in:** Planeja desativação por padrão para telemetria opcional, preservando métricas estritamente locais sem upload.
8. **Reprodutibilidade e Publicação:** Substitui dependências voláteis de `/tmp` por repositório durável sob `docs/benchmarks/v03/evidencias`, sem autoaprovação de publicação.

---

## 2. Reconciliação Contratual e Governança da Autorização

A abordagem de reconciliação proposta está plenamente alinhada com as diretrizes do projeto:
- **Autorização do Usuário:** A instrução de "continuar até finalização da 0.3" é interpretada com rigor: autoriza a cadeia técnica estruturada (Tasks 99–105) sem paralisar o trabalho por travas de propostas preliminares, mas **não** é distorcida como permissão para fabricar aceite humano formal, forçar status `accepted`/`validated` ou publicar artefatos externamente.
- **Emenda Documental (Task 99):** Impede a corrupção do histórico original de [contrato.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md), estabelecendo formalmente a distinção entre revisão técnica independente (`technical_reviewed`) e aceite formal do mantenedor.

---

## 3. Avaliação da Sequência de Execução (Tasks 99–105)

A sequência de 7 etapas finitas é lógica, desacoplada e segura:
- **Task 99 (Emenda):** Formaliza os parâmetros atualizados antes de tocar no código ou nos dados.
- **Task 100 (Congelamento de Casos):** Assegura snapshot sanitizado, sem contaminação de gold em tempo de execução.
- **Task 101 (Métricas Versionadas):** Valida a matemática de avaliação com testes sintéticos antes do live runner.
- **Task 102 (Refatoração do Core):** Implementa deduplicação anterior ao corte, recência, fallback e opt-in com regressão offline no split development.
- **Task 103 (Executor ABC):** Introduz bancos descartáveis com reset e isolamento comprovado, execução sequencial sem retries automáticos.
- **Task 104 (Avaliação Live):** Orçamento prudente e delimitado a 54 chamadas Codex (27 dev + 27 eval), timeouts estritos e reaproveitamento justificado das evidências de Antigravity (0 chamadas novas), evitando desperdício de chamadas.
- **Task 105 (Evidência Durável e Fechamento):** Sanitização, reprodução offline, checagens de integridade e parecer final independente.

---

## 4. Recomendações e Ressalvas Operacionais

1. **Revisões Intermediárias:** Cada etapa com impacto estrutural (Tasks 99, 100, 101, 102, 103) deve manter revisão independente antes de autorizar a fase subsequente.
2. **Preservação de Estado:** Manter o working directory limpo de arquivos desnecessários e respeitar arquivos modificados/untracked preexistentes.
3. **Não Antecipar Fechamento:** A v0.3 permanece incompleta e só poderá ser considerada concluída após a aprovação da Task 105.

---

## 5. Conclusão e Próximo Passo

O plano da [Task97](file:///mnt/d/Projects/MimirNL/tasks/97-v03-closure-gap-audit-result.md) é sólido, rastreável e atende integralmente às exigências técnicas e éticas do projeto.

- **Veredito:** **APPROVE**
- **Próxima tarefa autorizada:** **Task 99** (Emenda documental, matriz de autorização e formalização de parâmetros operacionais da v0.3).
