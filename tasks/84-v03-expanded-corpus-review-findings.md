# Relatório de Revisão Independente — Task84: Corpus Ampliado Task83

**Veredito**: **APPROVE**  
**Revisor**: Code Reviewer Agent (Gemini 3.8 Flash High)  
**Data**: 2026-10-27  
**Commit base verificado**: `166e3cf047b2078952e43dc8e9171e053e99e2ce`  
**Alvo da revisão**: Entregas da [Task83](file:///mnt/d/Projects/MimirNL/tasks/83-v03-expanded-corpus-result.md)  
**Artefatos analisados**:

- [docs/benchmarks/v03/corpus-ampliado.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/corpus-ampliado.json)
- [docs/benchmarks/v03/casos-ampliados.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos-ampliados.md)
- [docs/benchmarks/v03/casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md#L83-L86)
- [docs/benchmarks/v03/metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md#L44-L46)
- [tasks/83-v03-expanded-corpus-result.md](file:///mnt/d/Projects/MimirNL/tasks/83-v03-expanded-corpus-result.md)
- [tasks/84-v03-expanded-corpus-review.md](file:///mnt/d/Projects/MimirNL/tasks/84-v03-expanded-corpus-review.md)

---

## 1. Matriz dos 6 Casos Propostos

| Caso                              | Categoria                   | Pool Declarado (`sources[]`)                                            | Relevantes ($R$)                                    | Rubrica / Pesos      |
| :-------------------------------- | :-------------------------- | :---------------------------------------------------------------------- | :-------------------------------------------------- | :------------------- |
| `expanded-budget-envelope`        | Síntese multifonte          | `search-schema`, `optimizer`, `search-service`, `stats-service`         | 3 unidades (exclui distrator `stats-service`)       | 4 itens (2, 1, 1, 1) |
| `expanded-sharing-eligibility`    | Síntese multifonte          | `feedback-service`, `learning`, `retriever`, `search-schema`, `failure` | 4 unidades (exclui distrator `failure`)             | 4 itens (2, 1, 1, 1) |
| `expanded-project-path-boundary`  | Síntese multifonte          | `register-service`, `ingest-path`, `retriever`, `embedding-interface`   | 3 unidades (exclui distrator `embedding-interface`) | 4 itens (2, 1, 1, 1) |
| `expanded-production-p95-absent`  | Abstenção (métrica ausente) | `search-service`, `stats-service`, `retriever`, `optimizer`             | $\emptyset$ (pool insuficiente para p95)            | 3 itens (2, 1, 1)    |
| `expanded-runtime-config-absent`  | Abstenção (runtime ausente) | `embedding-interface`, `optimizer`, `search-schema`, `package-version`  | $\emptyset$ (pool insuficiente para Alfa)           | 3 itens (2, 1, 1)    |
| `expanded-apparent-version-scope` | Conflito aparente           | `readme-status`, `package-version`, `embedding-interface`               | 2 unidades (exclui distrator `embedding-interface`) | 3 itens (2, 1, 1)    |

---

## 2. Verificações Técnicas Independentes

1. **Fontes, Trechos e Hashes Git (`166e3cf047b2078952e43dc8e9171e053e99e2ce`)**:
   - Auditoria via `git show <commit>:<path>` para todas as 13 unidades canônicas únicas (27 ocorrências totais no JSON).
   - 100% de correspondência exata nos intervalos de linha, bytes UTF-8 e SHA-256 (incluindo quebras finais originais e CRLF preservados).
2. **Preflight e Bloqueio de Planejamento**:
   - `validateCases` em [scripts/benchmarks/preflight.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs) retornou `structurally_valid` para os 6 novos casos e para os 9 combinados (3 originais + 6 novos).
   - `planCases(cases, 3)` rejeitou determinística e corretamente ambos os conjuntos, preservando o bloqueio por pendência de revisão/aceite humano (`review.decision: "pending"`, `gold_status: "pending"`, referências `null`).
3. **Integridade de Pools e Compatibilidade com [scripts/benchmarks/metrics.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L136-L140)**:
   - Em todos os casos, `model_context.allowed_source_ids` coincide rigorosamente com `sources[].source_id`.
   - Distratores reais (`stats-service`, `failure`, `embedding-interface`) constam obrigatoriamente do pool declarado de cada caso, garantindo que execuções futuras não falhem na asserção de fontes permitidas do adaptador.
   - $R$ isola apenas as unidades estritamente necessárias; para os casos negativos, $R = \emptyset$.
4. **Formatação e Links**:
   - `prettier --check` validou os arquivos envolvidos com estilo de código consistente.
   - `git diff --check` sem erros de formatação ou whitespace.
   - Todos os 20 links em [casos-ampliados.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos-ampliados.md) e links editoriais em [casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md) e [metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md) são relativos e válidos.

---

## 3. Avaliação Qualitativa dos Casos

- **Sínteses Multifonte**: As três tarefas demandam integração semântica real entre múltiplos componentes (ex.: `schemas.ts` + `service.ts` + `optimizer/index.ts`). Nenhum caso pode ser resolvido com uma única unidade ou apenas assinaturas.
- **Abstenções Justificadas**: Em `expanded-production-p95-absent` e `expanded-runtime-config-absent`, a ausência é estrita ao pool fornecido. O código contém termos próximos (`elapsed_ms`, `avg`, `tokenBudget`, `EmbeddingProvider`), permitindo avaliar falsos positivos lexicais sem inventar métricas ou configurações. As rubricas exigem abstenção útil e penalizam fabricação de dados.
- **Conflito Aparente vs. Stale**: `expanded-apparent-version-scope` distingue corretamente escopos (`Core v0.1` vs `package 0.2.0 candidate/unreleased`) sem presumir documento stale ou versão publicada. O guia registra com precisão a limitação de commit único do schema.
- **Operação e Limitações**: O guia operacional documenta explicitamente que o runner atual (1 pergunta / 6 posições) não executa multicasos automaticamente, exigindo tarefas e manifestos próprios futuros.

---

## 4. Conclusão e Veredito

A entrega da Task83 atende integralmente a todas as exigências técnicas, metodológicas e de segurança estabelecidas na especificação, sem violar isolamento ou introduzir alterações no core/CI.

**Veredito**: **APPROVE**
