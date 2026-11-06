# Parecer Independente — Task 124: Revisão do Plano de Eficiência v0.3 (Task 123)

- **Data**: 2026-10-28
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Perfil e Modelo**: `gemini-3.8-flash-high` via provider `antigravity_cli` (modelo honrado integralmente, sem divergência; atuando com exclusividade na função de Code Reviewer no CAO, sem delegação)
- **Documento de Entrada / Especificação**: [`tasks/124-v03-efficiency-plan-review.md`](file:///mnt/d/Projects/MimirNL/tasks/124-v03-efficiency-plan-review.md)
- **Registro de Entrega Auditado**: [`tasks/123-v03-efficiency-program-result.md`](file:///mnt/d/Projects/MimirNL/tasks/123-v03-efficiency-program-result.md) e especificação [`tasks/123-v03-efficiency-program.md`](file:///mnt/d/Projects/MimirNL/tasks/123-v03-efficiency-program.md)
- **Documentos e Artefatos Auditados**:
  - Plano de Eficiência: [`docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md)
  - Roadmap Geral: [`ROADMAP_MIMIR_NL.md`](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md)
  - Fechamento v0.3: [`docs/benchmarks/v03/fechamento-0.3.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.3.md)
- **Fontes Históricas de Referência Confrontadas**:
  - Fluxo real em dois hosts: [`tasks/82-v03-two-host-closeout.md`](file:///mnt/d/Projects/MimirNL/tasks/82-v03-two-host-closeout.md), [`tasks/78-v03-codex-live-flow-result.md`](file:///mnt/d/Projects/MimirNL/tasks/78-v03-codex-live-flow-result.md), [`tasks/79-v03-codex-live-quality-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/79-v03-codex-live-quality-findings.md), [`tasks/80-v03-antigravity-live-flow-result.md`](file:///mnt/d/Projects/MimirNL/tasks/80-v03-antigravity-live-flow-result.md), [`tasks/81-v03-antigravity-live-quality-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/81-v03-antigravity-live-quality-findings.md)
  - Comparação de layout v1/v2: [`tasks/95-v03-layout-live-comparison-result.md`](file:///mnt/d/Projects/MimirNL/tasks/95-v03-layout-live-comparison-result.md), [`tasks/96-v03-layout-live-comparison-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/96-v03-layout-live-comparison-review-findings.md)
  - Avaliação limitada e qualidade de respostas: [`tasks/104-v03-bounded-evaluation-result.md`](file:///mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation-result.md), [`tasks/110-v03-answer-quality-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/110-v03-answer-quality-review-findings.md)
  - Revisão e fechamento técnico 105/120: [`tasks/111-v03-final-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/111-v03-final-review-findings.md), [`tasks/120-task105-portability-closeout-result.md`](file:///mnt/d/Projects/MimirNL/tasks/120-task105-portability-closeout-result.md), [`tasks/122-resume-technical-closeout.md`](file:///mnt/d/Projects/MimirNL/tasks/122-resume-technical-closeout.md)
  - Governança e Core 108: [`docs/benchmarks/v03/contrato-0.3.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.3.md), [`tasks/108-v03-core-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/108-v03-core-review-findings.md)
- **Veredito Final**: **`APPROVE`**
- **Novas Chamadas de Benchmark Realizadas**: **`0`** (zero chamadas de modelo ou benchmark; sem testes de modelo, sem execução de piloto, sem reavaliação de gold/privados, sem ingestão, sem commit/push/publicação).

---

## 1. Sumário Executivo e Veredito

A revisão técnica independente da entrega documental da Task 123 concluiu com parecer conclusivo **`APPROVE`**.

O documento entregue em [`docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md), acompanhado das atualizações em [`ROADMAP_MIMIR_NL.md`](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md) e [`docs/benchmarks/v03/fechamento-0.3.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.3.md):

1. **Estrutura e Governança Claras**: Estabelece de forma rigorosa que o fechamento das Tasks 105/120 permanece como `technical_complete` com aprovação independente em [`tasks/111-v03-final-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/111-v03-final-review-findings.md) e registro de coordenação em [`tasks/122-resume-technical-closeout.md`](file:///mnt/d/Projects/MimirNL/tasks/122-resume-technical-closeout.md), enquanto o objetivo amplo de eficiência e otimização de contexto da v0.3 permanece aberto.
2. **Fidelidade Criteriosa às Evidências Históricas**: Mapeia com exatidão matemática as métricas obtidas nas Tasks 82 (78/79/80/81), 95 (96), 104 e 110, explicitando que as ordens de grandeza observadas (+2,93% de input em 104 vs reduções de 30,33% no Codex e 39,58% no contador nativo do AG em 82) refletem baselines, denominadores e montagens de envelope estruturalmente distintos, sem configurar regressão comprovada entre versões.
3. **Backlog EF-00 a EF-07 com Sequenciamento Técnico Sólido**: Prioriza instrumentação offline observável (EF-01) e diagnóstico determinístico de sobreposição com fontes base (EF-02) antes de qualquer alteração de código ou política; subordina intervenções algorítmicas (EF-03 a EF-05) a dados empíricos observados e ao uso de componentes já homologados (ex.: `compact-v1` e `balanced-v1` de [`tasks/108-v03-core-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/108-v03-core-review-findings.md)); e mantém adiados sem evidência embeddings ou cache tuning (EF-07).
4. **Desenho Comparativo Isento e Justo**: Introduz um baseline forte determinístico (braço D: busca simples/manual), segrega o controle aditivo (braço E: base + busca) do efeito de substituição (braço B), e planeja histórico genuíno com turnos progressivos (braço H) em vez da degeneração `history=0` observada no cenário C da Task 104.
5. **Critérios de Qualidade Rígidos e Pré-fixados**: Define tolerância prévia estrita para qualquer avanço (zero perda de fatos essenciais ou citações válidas frente ao baseline forte, zero alucinação, zero abstenção indevida), sem redefinição de limites _post-hoc_.
6. **Escada de Gasto e Salvaguarda Operacional**: Fixa o gasto atual em exatamente 0 chamadas; delimita a proposta de piloto a um teto estrito de 6 chamadas (2 casos dev novos, 3 braços A/B/D, 1 repetição, 90s/chamada, 12 min globais, retry 0), estabelecendo expressamente que o piloto **não está autorizado** a executar nesta etapa nem automaticamente, dependendo de manifesto offline e autorização específica do supervisor.
7. **Preservação de Integridade e Isolamento de Segurança**: Todas as verificações documentais leves foram aprovadas (49 links relativos funcionais, Prettier 100% verde, `git diff --check` sem erros); nenhum arquivo restrito foi acessado; o Core 108 permaneceu intocado; e nenhuma chamada de LLM ou suite foi executada.

---

## 2. Auditoria das Evidências Históricas e Fidelidade Numérica

As fontes históricas citadas na especificação foram confrontadas diretamente contra os relatórios primários:

| Experimento Histórico / Documento         | Parâmetros e Baseline Auditados                                                                                                  | Métrica Observada Registrada no Plano                                                                              | Conferência com Fonte Primária                                                                                                                                                                                                                                                                                                                           |                                                           Avaliação do Revisor                                                            |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------: |
| **Task 82 (78/79)** Codex Live Flow       | 1 pergunta dev, 3 pares AB/BA/AB, 6 chamadas; A=contexto completo (6 módulos), B=apenas seleção Mimir (`optimization/index.ts`). | Redução de **30,33%** no total reportado (razão das medianas: A=20.354, B=14.180).                                 | Em [`tasks/82-v03-two-host-closeout.md:15-20`](file:///mnt/d/Projects/MimirNL/tasks/82-v03-two-host-closeout.md#L15-L20): `(1 - 14180/20354) = 30,33%`. 6/6 respostas corretas em Task 79. Mediana de deltas pareados: +62,83 ms.                                                                                                                        |                      **Fiel e Exato**. O plano reproduz os números e explicita a ausência de aceleração consistente.                      |
| **Task 82 (80/81)** Antigravity Live Flow | 1 pergunta dev, 3 pares AB/BA/AB, 6 chamadas; A=contexto completo, B=apenas seleção Mimir.                                       | Redução de **39,58%** no contador nativo `total_tokens` (razão das medianas: A=17.030, B=10.290).                  | Em [`tasks/82-v03-two-host-closeout.md:17-20`](file:///mnt/d/Projects/MimirNL/tasks/82-v03-two-host-closeout.md#L17-L20): `(1 - 10290/17030) = 39,58%`. 6/6 respostas corretas em Task 81. Todos os pares B mais lentos (mediana do delta +4,76 s).                                                                                                      | **Fiel e Exato**. Destaca a advertência de não normalizar os contadores do AG como se fossem Codex nem somar `thinking_tokens` novamente. |
| **Task 104 / 110** Avaliação Limitada     | 54 chamadas, 18 blocos ABC, 12 casos (9 dev rep 1, 3 eval rep 3). A=fontes-base, B=base + recuperação Mimir.                     | **+7.664 / 261.437 = +2,93%** de tokens de entrada em B frente a A. Cache subset=216.576 por cenário.              | Em [`tasks/104-v03-bounded-evaluation-result.md:63-68`](file:///mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation-result.md#L63-L68) e [`tasks/110-v03-answer-quality-review-findings.md:150-161`](file:///mnt/d/Projects/MimirNL/tasks/110-v03-answer-quality-review-findings.md#L150-L161): A=261.437, B=269.101. Delta B−A = +7.664 (+2,9315%). |       **Fiel e Exato**. O plano afirma claramente que B não economizou tokens em 104 e refuta classificá-lo como "economia de 2%".        |
| **Task 95 / 96** Comparação Layout v1/v2  | 2 casos, 1 repetição, 8 chamadas; 4 comparações de layout sob fontes e conteúdo equivalentes.                                    | Layout v2 apresentou **+1 token de entrada/uncached** por par e zero cache adicional (12.032 em todos os 8 slots). | Em [`tasks/95-v03-layout-live-comparison-result.md:24-31`](file:///mnt/d/Projects/MimirNL/tasks/95-v03-layout-live-comparison-result.md#L24-L31): deltas de input +1 em todos os 4 pares; cache read 12.032 constante. 8/8 respostas aprovadas na Task 96.                                                                                               |    **Fiel e Exato**. Evita inferir ganho geral de cache a partir da reordenação e adverte sobre a variabilidade residual de latência.     |

### Análise da Afirmação de Não-Regressão Comprovada

O plano trata com maturidade metodológica a aparente contradição entre as medições de 30–39% (Task 82) e de +2,93% (Task 104):

- Em 82, o braço B operou por **substituição**: o modelo recebeu apenas a memória recuperada em vez dos 6 módulos completos.
- Em 104, o braço B operou por **adição**: o envelope forneceu as fontes-base integrais (já suficientes para a resposta) e acrescentou 3 memórias recuperadas via FTS.
- Os denominadores diferem: razão de medianas de total reportado (82) vs razão de somas de tokens brutos de entrada (104).
- O plano registra corretamente que essas medições não comprovam regressão no core do Mimir, mas sim evidenciam que o modo de montagem de contexto aditivo gera redundância sem ganho quando a base já é completa.

---

## 3. Diagnóstico e Estrutura do Backlog EF-00 a EF-07

A ordem de ataque proposta no plano em [`docs/benchmarks/v03/plano-eficiencia.md:32-46`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md#L32-L46) atende integralmente aos princípios de engenharia de software e experimentação rigorosa:

1. **EF-00 (Consolidação Documental e Evidências — P0)**: Concluído na entrega atual (Task 123), consolidando dados e prevenindo comparações incompatíveis.
2. **EF-01 (Decomposição Observável de Bytes e Latências — P0, proposto offline)**:
   - _Mérito_: Foca em instrumentação transparente das fronteiras (instrução, base, histórico, recuperação, envelope final), discriminando o que a aplicação envia do que o host reporta.
   - _Salvaguarda_: Rejeita expressamente subtrair "pisos inferidos" para inventar ganhos contábeis fictícios.
   - _Governança_: Requer aprovação prévia do revisor independente antes de qualquer utilização prática.
3. **EF-02 (Análise Determinística de Sobreposição com a Base — P0, proposto offline)**:
   - _Mérito_: Investiga se o acréscimo de +2,93% decorre da repetição de trechos já presentes nas fontes-base, realizando comparações mecânicas de hashes/faixas em arquivos locais autorizados.
   - _Custo_: Zero chamadas de modelo e zero consumo de quota.
4. **EF-03 (Deduplicação contra Contexto Existente e Render Compacto — P1, proposto)**:
   - _Mérito_: Avalia o formato `compact-v1` já implementado no Core 108 antes de introduzir novas formatações e testa a eliminação de redundâncias entre o que foi recuperado e o que já está na base.
   - _Distinção_: Diferencia claramente esse mecanismo da deduplicação interna do FTS aprovada na Task 108 (que atua apenas entre memórias recuperadas antes do limite K).
5. **EF-04 (Gating de Relevância e Abstenção — P1, proposto)**:
   - _Mérito_: Evita injeção inútil de contexto em casos negativos ou de baixa relevância, priorizando a avaliação da política existente `balanced-v1` antes de cogitar novas heurísticas.
6. **EF-05 (Orçamento Adaptativo, Ranking e Chunking — P2, proposto)**:
   - _Mérito_: Ablação isolada de variáveis (uma de cada vez) estritamente restrita ao split de desenvolvimento.
7. **EF-06 (Reutilização Incremental e Histórico Genuíno — P2, adiado)**:
   - _Mérito_: Segrega o estudo de sequências progressivas multiturno para momento posterior à maturação da instrumentação e do gating.
8. **EF-07 (Embeddings ou Cache Tuning — P3, adiado sem evidência)**:
   - _Mérito_: Mantém despriorizado o uso de modelos neurais locais ou tuning de prefixo de cache, exigindo justificativa prévia baseada em falhas comprovadas da abordagem determinística/lexical.

---

## 4. Desenho Metodológico, Qualidade Pré-fixada e Holdout

O plano delineia salvaguardas essenciais para futuras comparações empíricas:

- **Baseline Forte (Braço D)**: O Mimir não será comparado apenas contra _dumps_ ingênuos de contexto integral. O braço D impõe busca simples determinística ou manual documentada sob o mesmo acesso e orçamento, impedindo favorecimento artificial da seleção automática.
- **Isolamento de Redundância (Braço E)**: O braço aditivo (base + busca) é formalmente separado do braço B (seleção que substitui), garantindo que os efeitos não sejam misturados.
- **Histórico Genuíno (Braço H)**: Supera a degeneração do cenário C da Task 104 (`history.bytes = 0`) definindo turnos progressivos reais (turnos 1, 3 e 6) nos quais fatos passados são genuinamente necessários para turnos subsequentes, com custos acumulados devidamente rastreados.
- **Separação Rigorosa de Splits e Custódia de Holdout**:
  - Reconhece que o holdout da Task 104 já foi consumido e não pode retornar intacto.
  - Propõe 6 casos dev novos e 3 casos evaluation novos, estes últimos custodiados por avaliador independente, sem exposição ao implementador.
  - Impõe o congelamento irrevogável da política e dos artefatos antes da execução da avaliação.
- **Gate de Qualidade Operacional Rígido**:
  - Fixa o critério de sucesso do piloto: **zero perda de fatos essenciais ou citações válidas frente ao baseline forte, zero alucinação factual e zero abstenção indevida**.
  - Proíbe categoricamente o relaxamento das margens de tolerância após a observação dos resultados.
- **Aritmética e Métricas Transparentes**:
  - Economia definida por `(1 - B/A) * 100` apenas para `A > 0`.
  - Cache tratado estritamente como subconjunto do input; total calculado como `input + output` apenas se respaldado pelo provedor, sem somar cache duplicado.
  - Delimitação clara de métricas indisponíveis (`unavailable`): custo financeiro, tarifas, TTFT e latência exclusiva de modelo, proibindo estimativas especulativas.

---

## 5. Escada de Gasto e Delimitação do Piloto

O plano adota salvaguardas impecáveis quanto ao consumo de quota e recursos:

1. **Estado Atual**: **Zero chamadas realizadas.** A entrega atual limitou-se à governança e documentação conceitual.
2. **Próxima Etapa**: Trabalho exclusivamente offline (EF-01 e EF-02), exigindo ciclo de especificação pelo supervisor, implementação pelo developer e revisão técnica independente antes de qualquer uso.
3. **Piloto Proposto**:
   - Casos: Apenas 2 casos dev novos (multiarquivo positivo e negativo).
   - Braços: 3 braços (A completo, B seleção Mimir, D baseline forte). Sem braços E ou H neste lote inicial.
   - Repetições: 1 repetição sequencial.
   - Teto Global: **Máximo absoluto de 6 chamadas de modelo**.
   - Deadlines: Máximo de 90s por chamada e 12 minutos globais (incluindo setup/recuperação).
   - Tolerância a falhas: `retry: 0`. Qualquer timeout consome a tentativa; parada imediata ao atingir o teto global.
   - Envelopes: Máximo de 32.000 bytes de contexto e 64.000 bytes de resposta.
   - **Condição Crítica**: O piloto **NÃO está autorizado** a executar nesta tarefa nem de forma automática. Exige manifesto prévio, validação offline e autorização explícita do supervisor/usuário.
   - Quota: Rejeita converter arbitrariamente porcentagens de quota em chamadas de modelo, reconhecendo a quota como variável externa.

---

## 6. Governança, Fechamento 0.3 e Roadmap

A atualização efetuada nos documentos de governança foi auditada:

1. **[`ROADMAP_MIMIR_NL.md`](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md)**:
   - A seção inicial reflete o status corrente de 2026-10-28 (Task 123), explicitando que Tasks 105/120 são `technical_complete` com [APPROVE 111](tasks/111-v03-final-review-findings.md) e [registro 122](tasks/122-resume-technical-closeout.md), com publicação adiada por decisão do usuário para priorizar eficiência.
   - A linha da v0.3.0 na tabela de marcos foi atualizada com precisão: `Technical105/120 approved111; efficiency program open`.
   - Na seção v0.3.0, os blocos históricos (Tasks 97–105) foram preservados intactos sob o cabeçalho explícito de planejamento histórico, evitando reescrita anacrônica de registros passados.
   - As próximas ações imediatas listam o review 124 do plano de eficiência e o posterior detalhamento offline de EF-01/02.
   - A nota histórica no final do arquivo referencia com exatidão o parecer 111 e o registro 122.
2. **[`docs/benchmarks/v03/fechamento-0.3.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.3.md)**:
   - Atualiza a menção ao status da Task 120, registrando formalmente a aprovação pela revisão independente 111 e o fechamento do supervisor 122.
   - Esclarece no parágrafo 9 que a pendência `pending_review111` constante nos relatórios históricos 105/120 foi superada pelo parecer 111 e registro 122, preservando a imutabilidade daqueles relatórios.
   - Vincula o objetivo amplo de eficiência ao novo [`plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md).
3. **Preservação de Escopo**:
   - Nenhuma linha de código em `src/`, `test/` ou `scripts/` foi alterada.
   - Nenhuma dependência foi adicionada em `package.json`.
   - Nenhuma alteração retroativa foi efetuada nos relatórios históricos 105 ou 120.

---

## 7. Verificações Técnicas e Rastreabilidade

Foram executadas checagens leves de consistência documental e integridade:

1. **Rastreabilidade de Links Relativos**:
   - Auditoria automatizada por script Python inspecionou todos os links locais nos 4 arquivos modificados/gerados na Task 123 ([`docs/benchmarks/v03/plano-eficiencia.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/plano-eficiencia.md), [`ROADMAP_MIMIR_NL.md`](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md), [`docs/benchmarks/v03/fechamento-0.3.md`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.3.md), [`tasks/123-v03-efficiency-program-result.md`](file:///mnt/d/Projects/MimirNL/tasks/123-v03-efficiency-program-result.md)):
   - **49 links relativos verificados, 0 links quebrados ou ausentes**.
2. **Conformidade de Estilo e Formatação (Prettier)**:
   - Executado `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node ./node_modules/prettier/bin/prettier.cjs --check docs/benchmarks/v03/plano-eficiencia.md docs/benchmarks/v03/fechamento-0.3.md`.
   - Código de saída **0** (todos os arquivos utilizam o padrão de código do Prettier).
3. **Higiene de Diff e Git**:
   - `git diff --check`: Código de saída **0** (zero conflitos de espaço em branco ou marcadores residuais).
   - `git status --porcelain`: Modificações estritamente limitadas aos arquivos documentais autorizados; nenhum arquivo de código ou teste foi tocado.
4. **Isolamento e Segurança Operacional**:
   - Nenhuma ferramenta externa (curl, wget, nc) utilizada.
   - Nenhuma credencial confidencial (`.env`, `~/.aws/credentials`, `~/.ssh/*`, `*.pem`) consultada.
   - Zero comandos destrutivos.
   - Zero suites pesadas, zero replays, zero modelos disparados.

---

## 8. Conclusão e Próximos Passos

O plano de eficiência v0.3 entregue pela Task 123 é exemplar em rigor metodológico, sobriedade analítica, respeito à governança histórica e proteção de recursos computacionais.

- **Veredito**: **`APPROVE`**
- **Próximos Passos Recomendados para a Supervisão**:
  1. Registrar a conclusão da Task 124 no histórico de coordenação.
  2. Abrir especificação para a etapa **EF-01 / EF-02** (decomposição observável e análise de sobreposição), mantendo-a estritamente offline, determinística e com zero chamadas a modelos.
  3. Manter o Core 108 congelado e o piloto de 6 chamadas sob condição de manifesto prévio e autorização expressa individual.
