# Parecer Independente — Task 126: Revisão Documental da Proposta Integrada de Evolução e Caching v0.3 (Task 125)

- **Data**: 2026-10-28
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Perfil e Modelo**: `gemini-3.8-flash-high` via provider `antigravity_cli` (atuando com exclusividade na função de Code Reviewer no CAO, sem delegação externa)
- **Documento de Entrada / Especificação da Revisão**: [`/mnt/d/Projects/MimirNL/tasks/126-v03-integrated-proposal-review.md`](file:///mnt/d/Projects/MimirNL/tasks/126-v03-integrated-proposal-review.md)
- **Documento Auditado**: [`/mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md`](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md)
- **Registros da Tarefa Auditada**: [`/mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal-result.md`](file:///mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal-result.md) e [`/mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal.md`](file:///mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal.md)
- **Fonte Única de Evidência sobre Implementação**: [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md) (lido integralmente perante restrição formal)
- **Veredito Final**: **`APPROVE`**
- **Novas Chamadas de Benchmark Realizadas**: **`0`** (zero chamadas a modelos LLM ou suites de benchmark; sem execução de piloto; sem alteração de código, dependências, runtime, testes ou configurações; sem commits, push ou publicação).

---

## 1. Sumário Executivo e Veredito

A revisão técnica independente da proposta documental entregue na Task 125 em [`/mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md`](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md) resultou em parecer conclusivo **`APPROVE`**.

O documento auditado cumpre com rigor técnico e fidelidade integral todas as diretrizes da especificação da Task 125 e da Task 126:

1. **Estrutura Completa e Ordenada**: Apresenta exatamente as 11 seções obrigatórias demandadas pela especificação, na sequência correta, incluindo uma subseção explícita e aprofundada dedicada à `Estratégia de Caching Recomendada` na Seção 5 ([Linhas 52–67](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L52-L67)).
2. **Respeito Absoluto à Fonte Única de Evidência**: O documento baseia todas as suas afirmações sobre a implementação exclusivamente em [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md). Todos os 13 links Markdown presentes no documento apontam direta e exclusivamente para seções e âncoras válidas do plano de eficiência. Nenhuma referência externa, arquivo de código, relatório secundário ou holdout confidencial foi indevidamente consultado ou citado como evidência empírica.
3. **Alinhamento e Não-Conflito com o Backlog EF-00 a EF-07**: Em vez de introduzir um catálogo concorrente ou desvinculado, a proposta estabelece um mapeamento estrito 1:1 entre seus identificadores de intervenção (`T125-01` a `T125-07`) e os itens do backlog operacional (`EF-01` a `EF-07`), preservando a consolidação documental de `EF-00` e a autoridade operacional de [`plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#backlog-ordenado).
4. **Disciplina Epistemológica Rigorosa**: O texto demarca expressamente os limites do conhecimento através de rótulos sistemáticos (`Confirmado pelo relatório`, `Inferência técnica` e `Hipótese para validação`), evitando tratar suposições como componentes existentes ou rotular funcionalidades não descritas como defeitos do core.
5. **Classificação Apropriada de Severidade (Sem P0 Falso)**: Não classifica nenhuma intervenção como vulnerabilidade ou defeito crítico (`P0`). Esclarece com precisão que o rótulo `P0` no plano operacional de eficiência reflete apenas urgência metodológica de diagnóstico ([Linhas 11 e 70](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L11-L70)).
6. **Exatidão Numérica e Neutralidade Comparativa**: As métricas históricas das Tasks 78–82, 95 e 104 foram transcritas com precisão matemática absoluta, mantendo a ênfase de que baselines, denominadores e unidades distintos impedem a caracterização de regressão entre versões. A estimativa informal de "10–30%" foi explicitamente rejeitada como evidência, previsão ou critério de aceitação ([Linhas 27 e 82](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L27-L82)).
7. **Estratégia de Caching Condicional e Segura**: Trata o caching com sobriedade técnica, determinando a **não adição de cache no estágio atual**. Estabelece que o MVP de cache exato local é condicional à demonstração empírica de repetição e custo, define invalidação conservadora fail-closed em caso de escopo ou versão indefinidos, sublinha que TTL limita residência mas não assegura frescor, exige delimitação de limites de RAM e separa a semântica nativa do Antigravity da do Codex.
8. **Viabilidade Operacional e Governança de Validação**: Preserva a escada de gastos com o patamar atual em exatamente zero chamadas de benchmark e mantém o teto estrito de até 6 chamadas sequenciais para um eventual piloto futuro, condicionando qualquer execução a autorização expressa do supervisor.

---

## 2. Verificação Estrutural e Conformidade de Escopo

A proposta em [`/mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md`](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md) contém 137 linhas e 24.158 caracteres. A auditoria confirmou a presença íntegra das 11 seções exigidas pela especificação da Task 125, dispostas na sequência estrita:

| Seção | Título no Documento | Linhas de Referência | Status Estrutural |
| :--- | :--- | :--- | :--- |
| **1** | `## 1. Resumo executivo` | [Linhas 5–12](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L5-L12) | **PASS** |
| **2** | `## 2. Pontos fortes da arquitetura atual` | [Linhas 13–18](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L13-L18) | **PASS** |
| **3** | `## 3. Problemas e limitações identificados` | [Linhas 19–28](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L19-L28) | **PASS** |
| **4** | `## 4. Oportunidades não exploradas` | [Linhas 29–40](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L29-L40) | **PASS** |
| **5** | `## 5. Comparação de alternativas` | [Linhas 41–51](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L41-L51) | **PASS** |
| **Subseção** | `### Estratégia de Caching Recomendada` | [Linhas 52–67](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L52-L67) | **PASS** (subseção explícita) |
| **6** | `## 6. Melhorias recomendadas` | [Linhas 68–83](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L68-L83) | **PASS** |
| **7** | `## 7. Estratégia de otimização` | [Linhas 84–91](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L84-L91) | **PASS** |
| **8** | `## 8. Roadmap de implementação` | [Linhas 92–103](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L92-L103) | **PASS** |
| **9** | `## 9. Plano de validação` | [Linhas 104–117](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L104-L117) | **PASS** |
| **10** | `## 10. Questões para o CAO` | [Linhas 118–130](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L118-L130) | **PASS** (8 perguntas objetivas) |
| **11** | `## 11. HANDOFF PARA CAO` | [Linhas 131–137](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L131-L137) | **PASS** (handoff acionável) |

---

## 3. Auditoria de Fidelidade à Fonte Única e Validação de Links/Âncoras

A especificação da Task 125 e da Task 126 definiu formalmente que [`/mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md) constitui a **fonte única de evidência de implementação**.

Foi realizada a extração programática e a conferência de todos os links Markdown em [`/mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md`](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md):

- **Total de Links**: 13 links.
- **Destino dos Links**: 100% dos links apontam para caminhos relativos de `docs/benchmarks/v03/plano-eficiencia.md`.
- **Verificação das Âncoras de Cabeçalho**:
  - `docs/benchmarks/v03/plano-eficiencia.md`: Arquivo existe e legível ([Linha 3](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L3)).
  - `#decisão-e-escopo`: Mapeia com exatidão para `## Decisão e escopo` de [`plano-eficiencia.md#L5`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L5) ([Linha 7](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L7)).
  - `#diagnóstico-a-resolver-primeiro`: Mapeia com exatidão para `## Diagnóstico a resolver primeiro` de [`plano-eficiencia.md#L24`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L24) ([Linhas 15, 54 e 90](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L15)).
  - `#comparação-futura-mesmo-problema-e-acesso-equivalente`: Mapeia para `## Comparação futura: mesmo problema e acesso equivalente` de [`plano-eficiencia.md#L47`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L47) ([Linhas 17, 90 e 114](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L17)).
  - `#matriz-de-evidências`: Mapeia para `## Matriz de evidências` de [`plano-eficiencia.md#L11`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L11) ([Linha 21](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21)).
  - `#backlog-ordenado`: Mapeia para `## Backlog ordenado` de [`plano-eficiencia.md#L32`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L32) ([Linhas 39, 54 e 82](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L39)).
  - `#escada-de-gasto-e-gates`: Mapeia para `## Escada de gasto e gates` de [`plano-eficiencia.md#L69`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L69) ([Linha 102](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L102)).
- **Ausência de Invenção de Arquitetura**: O autor não assumiu a presença de componentes inexistentes ou não descritos na fonte. Lacunas reais (como existência de cache interno, tokens efetivos do backend, custo financeiro e suporte multiprocesso) foram formalmente registradas como `desconhecidas` (unknown), em conformidade estrita com as orientações do projeto ([Linhas 17, 27, 54 e 137](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L17)).

---

## 4. Auditoria Epistemológica: Fatos, Inferências e Hipóteses

O documento implementa uma divisão epistemológica clara, auditada em suas seções-chave:

1. **Fatos Confirmados pelo Relatório**:
   - Status `technical_complete` do fechamento 105/120 com APPROVE111 e registro 122 ([Linha 7](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L7)).
   - Presença dos componentes de core já aprovados na Task 108: dedupe por hash antes de `limit`, proveniência de duplicatas, desempate por recência, política opcional `balanced-v1` com cobertura lexical, razões de abstenção, hard budget de bytes do envelope e formato `compact-v1` ([Linha 15](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L15)).
   - Resultados empíricos das medições históricas das Tasks 78, 80, 95 e 104 ([Linhas 21 e 25](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21-L25)).
   - Menção à existência de subset de cache no host, mas sem descrição de cache interno no Mimir ([Linha 54](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L54)).
2. **Inferências Técnicas**:
   - Menor envelope útil pode reduzir entrada quando substitui conteúdo enviado, mas depende do comportamento e da montagem do host ([Linha 11](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L11)).
   - Redundância no desenho aditivo da Task 104 é uma hipótese explicativa plausível para o acréscimo de +2,93%, não um defeito intrínseco do core ([Linha 23](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L23)).
   - Recuperação progressiva e hierárquica acarretam custos adicionais de busca e montagem que só se justificam se houver ganho comprovado de cobertura ([Linha 33](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L33)).
   - Eliminação de trabalho repetido pode produzir maior retorno do que adição de complexidade de cache ou novos índices ([Linha 88](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L88)).
3. **Hipóteses para Validação**:
   - Repetição de consultas e custo local podem justificar um cache exato pequeno, condicionado a medições prévias ([Linha 11](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L11)).
   - Dedupe exato contra a base pode remover repetição preservando proveniência ([Linha 35](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L35)).
   - Orçamento adaptativo por tarefa e resumos incrementais requerem avaliação empírica isolada ([Linha 35](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L35)).

---

## 5. Auditoria da Classificação de Severidade e Priorização

A especificação da Task 125 alertou expressamente para não confundir o rótulo `P0` do plano de eficiência (que designa urgência de diagnóstico metodológico nos itens EF-00, EF-01 e EF-02) com severidade de vulnerabilidade ou bug crítico (`P0`).

A proposta auditada atende a essa exigência com total precisão:
- **Linha 11**: Declara categoricamente: *"Não há P0 crítico comprovado nesta fonte; P0 no plano ordena diagnóstico, não indica vulnerabilidade."*
- **Linha 70**: Confirma formalmente na Seção 6: *"Nenhuma intervenção recebe P0 crítico nesta proposta."*
- **Tabela de Intervenções ([Linhas 72–81](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L72-L81))**:
  - Classifica as intervenções imediatas de diagnóstico e dedupe (`T125-01` a `T125-04`) como `P1` (alto retorno potencial).
  - Classifica intervenções estruturais (`T125-05` e `T125-06`) como `P2`.
  - Classifica investigação e tuning (`T125-07`) como `P3` (pesquisa).

---

## 6. Auditoria de Cifras, Comparabilidade e Rejeição do Chute 10–30%

Foi realizada a checagem numérica cruzada contra a fonte única ([`plano-eficiencia.md#L13-L20`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L13-L20)):

1. **Codex (Tasks 78/79/82)**:
   - Proposta ([Linha 21](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21)): redução de 30,33% na razão das medianas de total ao substituir 6 fontes integra por seleção (A=20.354, B=14.180).
   - Proposta ([Linha 25](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L25)): mediana dos deltas pareados é +62,83ms, evidenciando ausência de aceleração consistente.
   - **Conformidade**: 100% idêntico à fonte.
2. **Antigravity (Tasks 80/81/82)**:
   - Proposta ([Linha 21](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21)): redução de 39,58% no contador nativo explícito (A=17.030, B=10.290), semântica geral não confirmada.
   - Proposta ([Linha 25](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L25)): todos os pares B foram mais lentos (+4,76s na mediana do delta pareado).
   - **Conformidade**: 100% idêntico à fonte.
3. **Avaliação Bounded de 54 Chamadas (Tasks 104/110)**:
   - Proposta ([Linha 21](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21)): 54 chamadas, 18 blocos ABC, 12 casos; somas de input em 18 posições: A=261.437, B=269.101, acréscimo de +7.664 tokens (+2,93%).
   - Proposta ([Linha 25](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L25)): busca média de 21,58ms já incluída, sem ganho robusto de latência; subset de cache fixo em 216.576 por braço.
   - **Conformidade**: 100% idêntico à fonte.
4. **Layout v1 vs v2 (Tasks 95/96)**:
   - Proposta ([Linha 25](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L25)): 2 casos, 8 chamadas, layout v2 apresentou +1 input/uncached por par e zero cache adicional (12.032 em todos os slots), sem demonstrar benefício geral de cache.
   - **Conformidade**: 100% idêntico à fonte.
5. **Incomparabilidade das Métricas e Rejeição do Chute 10–30%**:
   - A proposta enfatiza nas [Linhas 21–23](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L21-L23) e na Seção 11 ([Linha 135](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L135)) que tais medições operam sobre unidades e baselines estruturalmente distintos, não demonstrando regressão entre versões do core.
   - Rejeição expressa do chute conversacional: *"Nenhuma porcentagem conversacional de 10–30% é evidência, meta ou previsão; a chance de ganho é desconhecida"* ([Linha 27](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L27)).
   - Fixação explícita de estimativas: *"Economia e ganho de latência de todas as intervenções: ainda não estimáveis"* ([Linha 82](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L82)).

---

## 7. Rastreabilidade com o Backlog EF-00 a EF-07

A proposta vincula perfeitamente todas as melhorias sugeridas ao plano existente, sem gerar qualquer backlog concorrente:

| Item na Proposta | Item no Plano EF | Alinhamento e Descrição | Status na Proposta |
| :--- | :--- | :--- | :--- |
| — | **EF-00** | Consolidação documental e matriz de evidências | Preservado como entrega documental; não reaberto ([Linha 82](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L82)) |
| **T125-01** | **EF-01** | Decomposição observável de fronteiras, bytes, relógios e usage bruto | P1, primeira ação recomendada ([Linha 74](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L74)) |
| **T125-02** | **EF-02** | Análise determinística offline de sobreposição com fontes-base | P1, dependente de EF-01 ([Linha 75](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L75)) |
| **T125-03** | **EF-03** | Redução de repetição contra a base, teste de `compact-v1` e dedupe | P1, condicional à confirmação de EF-02 ([Linha 76](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L76)) |
| **T125-04** | **EF-04** | Avaliação de gating com `balanced-v1` existente antes de novas regras | P1, dependente de EF-01/02 ([Linha 77](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L77)) |
| **T125-05** | **EF-05** | Ajuste isolado de orçamento adaptativo, ranking e chunking | P2, após validação de EF-03/04 ([Linha 78](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L78)) |
| **T125-06** | **EF-06** | Reutilização incremental e histórico genuíno com turnos progressivos | P2, condicionado a maturidade prévia ([Linha 79](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L79)) |
| **T125-07** | **EF-07** | Embeddings, busca híbrida, rerank seletivo e cache tuning | P3, mantido formalmente adiado sem evidência ([Linha 80](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L80)) |

---

## 8. Auditoria da Estratégia de Caching Condicional

A subseção dedicada de Caching ([Linhas 52–67](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L52-L67)) e o plano de validação ([Linhas 108–113](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L108-L113)) foram minuciosamente auditados contra os requisitos estritos da Task 126:

1. **Retrieval Cache Não Garante Redução de Input/Custo do Host**:
   - Explicitado na [Linha 11](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L11) e na [Linha 58](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L58): o cache de recuperação pode poupar trabalho computacional local, mas **não garante** economia de tokens nem menor latência do host.
2. **Prompt Caching — Dependência do Host e Ausência de Controle do Mimir**:
   - Destacado na [Linha 59](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L59): o Mimir controla a ordenação determinística de seu próprio envelope, mas **não controla a API do host**, layouts finais, elegibilidade de cache ou prefixos LLM; o layout v2 da Task 95 não demonstrou benefício; desaconselha categoricamente inflar prompts para forçar limiares de elegibilidade.
3. **Semantic Cache de Contexto Distinto de Respostas LLM**:
   - Diferenciado com clareza cirúrgica na [Linha 62](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L62): Semantic Cache de contexto devolve material recuperado para uma nova resposta gerada pelo modelo, enquanto cache de resposta final LLM reutilizaria a saída gerada e não faz parte da proposta.
4. **Composição Completa da Chave de Invalidação e Limitação do TTL**:
   - Exigido na [Linha 64](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L64): a chave de cache deve incorporar identidade, projeto, usuário, escopo de permissões, filtros, consulta, parâmetro `k`, budget de bytes, versão da política/formato e revisões dos dados.
   - Afirmado com precisão na [Linha 66](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L66): **TTL limita o tempo de residência, mas não garante frescor (freshness)**.
5. **Comportamento Fail-Closed e Concorrência**:
   - Definido na [Linha 66](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L66): cenários de concorrência multiprocesso e alterações externas são desconhecidos; em caso de escopo ou versão indefinidos, o sistema opera estritamente em **fail-closed (cache miss)**, direcionando a requisição para recuperação autorizada normal.
6. **Bounds de Memória RAM e Política de Descarte**:
   - Apontado na [Linha 66](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L66) e na [Linha 110](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L110): limites estritos de RAM e política LRU são requeridos condicionalmente à medição de pegada de memória.
7. **Isolamento da Semântica do Antigravity**:
   - Reafirmado nas [Linhas 16, 21 e 116](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L16): contadores do Antigravity permanecem segregados como métrica nativa, sem normalização forçada nem soma indevida de tokens de pensamento.

---

## 9. Análise do Roadmap, Validação, Rollback e Handoff

1. **Rollback Explícito para Cada Intervenção**:
   - A tabela da Seção 6 ([Linhas 74–80](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L74-L80)) documenta procedimentos detalhados e concretos de rollback para cada item `T125-01` a `T125-07` (desligar telemetria, restaurar envelopes anteriores, reverter políticas para legacy, descartar configurações instáveis e desabilitar flags de cache/reuse).
2. **Plano de Validação sem Matriz Excessiva**:
   - A Seção 9 ([Linhas 108–110](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L108-L110)) nomeia os braços específicos (`cache-A` a `cache-E`) para evitar colisão com o desenho do piloto A/B/D, proibindo a execução antecipada da matriz e exigindo a mensuração explícita de taxas de stale com numerador e denominador auditáveis.
3. **Escada de Gastos e Teto do Piloto**:
   - Reafirma na Seção 8 ([Linhas 96 e 102](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L96-L102)) que o gasto atual é de **zero chamadas** e que o piloto proposto permanece limitado a no máximo 6 chamadas totais (2 casos dev novos, 3 braços A/B/D, 1 repetição, máximo 90s por chamada e 12 minutos globais, retry 0, contexto até 32.000 bytes e resposta até 64.000 bytes), **sem autorização automática**.
4. **Handoff Pragmático e Questões ao CAO**:
   - A Seção 10 ([Linhas 118–130](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L118-L130)) formula 8 perguntas cirúrgicas para o supervisor sanar lacunas técnicas de fronteiras, autorização e custódia de dados.
   - A Seção 11 ([Linhas 131–137](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md#L131-L137)) sintetiza os próximos passos imediatos: submissão à revisão 126 e delimitação do diagnóstico offline EF-01/02 pelo supervisor.

---

## 10. Verificações Documentais Leves e Limitações

Em obediência estrita ao princípio de não executar testes pesados ou suítes de benchmark desnecessárias nesta fase de revisão documental:

1. **Git Diff Check**:
   - `git diff --check`: **PASS** (código de saída 0; nenhum erro de espaço em branco ou conflito).
2. **Script de Verificação Sintática Local (Python 3)**:
   - Verificação das 11 seções, subseção de caching, correspondência dos IDs `T125-01` a `T125-07`, contagem de links (13) e ausência de espaços finais: **PASS** (100% verde).
3. **Validação de Âncoras e Links Relativos**:
   - Todas as 12 âncoras internas mapeadas para `docs/benchmarks/v03/plano-eficiencia.md` foram inspecionadas e validadas contra os cabeçalhos reais da fonte: **PASS** (100% resolvidas).
4. **Preservação de Integridade**:
   - Nenhum arquivo rastreado ou dirty foi alterado pela revisão.
   - Nenhuma chamada de rede, benchmark ou LLM foi disparada.
   - Nenhuma credencial restrita (`~/.aws/credentials`, `~/.ssh/*`, `.env`, `*.pem`) foi acessada.

---

## 11. Conclusão e Próximos Passos Recomendados

A proposta entregue em [`/mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md`](file:///mnt/d/Projects/MimirNL/MIMIR_NL_CODEX_IMPROVEMENT_PROPOSAL.md) e seu registro em [`/mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal-result.md`](file:///mnt/d/Projects/MimirNL/tasks/125-v03-integrated-improvement-proposal-result.md) estão formalmente aprovados (**`APPROVE`**).

**Recomendações ao Supervisor do CAO**:
1. Homologar a entrega documental da Task 125 e arquivar o presente parecer da Task 126.
2. Proceder ao próximo tópico do roadmap de eficiência: **delimitar a especificação das tarefas de diagnóstico offline EF-01 e EF-02**, definindo formalmente o conjunto de fontes públicas autorizadas e os limites de instrumentação mínima observável.
3. Manter a diretriz de **não implementar mecanismos de caching neste momento** e assegurar que o piloto de 6 chamadas permaneça sob autorização expressa condicionada ao término bem-sucedido do diagnóstico offline.
