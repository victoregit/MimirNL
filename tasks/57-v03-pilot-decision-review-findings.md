# Relatório de Revisão Independente — Task57: Pacote de Decisão do Piloto v0.3

**Veredito**: **APPROVE**  
**Revisor**: Code Reviewer Agent (Gemini 3.8 Flash High)  
**Data**: 2026-10-27  
**Branch de trabalho**: `docs/v03-corpus-methodology`  
**Commit base verificado**: `166e3cf047b2078952e43dc8e9171e053e99e2ce` (`feat(benchmark): add offline metrics and paired comparisons`)  
**Alvo da revisão**: Pacote de decisão do piloto v0.3 entregue pela [Task56](file:///mnt/d/Projects/MimirNL/tasks/56-v03-pilot-decision-package.md) e registrado em [tasks/56-v03-pilot-decision-package-result.md](file:///mnt/d/Projects/MimirNL/tasks/56-v03-pilot-decision-package-result.md)  
**Artefatos analisados**:

- [docs/benchmarks/v03/piloto-decisao.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md)
- [docs/benchmarks/v03/contrato.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md)
- [docs/benchmarks/v03/metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md)
- [tasks/56-v03-pilot-decision-package-result.md](file:///mnt/d/Projects/MimirNL/tasks/56-v03-pilot-decision-package-result.md)
- [docs/benchmarks/v03/casos.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md)
- [tasks/55-v03-corpus-review-findings.md](file:///mnt/d/Projects/MimirNL/tasks/55-v03-corpus-review-findings.md)
- [scripts/benchmarks/preflight.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs)
- [scripts/benchmarks/metrics.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs)

---

## 1. Resumo Executivo

A entrega documental da Task56 foi submetida a rigorosa auditoria e verificação técnica independente por este revisor, abrangendo a consistência matemática das matrizes e tetos propostos, a integridade dos limites operacionais, o isolamento dos dados e do gold, a clareza dos gates decisórios e a governança do repositório:

1. **Consistência Matemática Estrita (100% exata)**:
   - A matriz proposta contempla 3 casos (`pilot-approval`, `pilot-budget`, `pilot-failure`), 3 repetições pareadas e 3 cenários (`sem_memoria`, `com_mimir`, `historico_completo`), resultando em exatamente **27 observações potenciais** (9 por cenário; 0 observações produzidas).
   - A contagem de chamadas está matematicamente fechada: no máximo 1 chamada ao modelo por run (total de 27 chamadas ao modelo) e no máximo 1 recuperação local Mimir por run exclusivamente no cenário B (total de 9 chamadas locais), perfazendo o teto agregado de **36 chamadas totais**.
   - Os tetos temporais e de tokens são coesos e devidamente aninhados:
     - Limite por chamada ao modelo: 60 s; limite por recuperação local: 5 s; ambos aninhados no limite por run de 90 s.
     - Tempo de parede para as 27 runs: $27 \times 90\text{ s} = 2.430\text{ s}$ (40 min 30 s).
     - Orçamento operacional global (preparação, checagens, exportação e teardown): $2.430\text{ s} + 570\text{ s} = 3.000\text{ s}$ (50 minutos de parede). Avaliação humana posterior fica expressamente fora deste teto.
     - Tetos nominais de tokens: $27 \times 4.096 = 110.592$ tokens de entrada e $27 \times 1.024 = 27.648$ tokens de saída (total nominal de 138.240 tokens), condicionados à validação por tokenizer formal e sem equivalência financeira presumida.
2. **Separação Rígida entre Proposta Documental e Decisão Humana**:
   - O pacote distingue inequivocamente limites propostos de limites acordados. Todos os tetos são explicitamente rotulados como propostos e sujeitos a deliberação.
   - Nenhuma decisão humana foi fabricada ou antecipada; não há registros de aceite simulados.
   - O texto modelo para resposta humana fornecido ao final é estritamente um formulário parametrizado com placeholders, acompanhado de advertência enfática de que silêncio, placeholders ou aprovação puramente documental não autorizam execuções externas.
3. **Não Transferência do Modelo Revisor ao Benchmark**:
   - A escolha de Gemini 3.8 Flash High foi documentada com precisão como autorização restrita à revisão independente do agente, sendo explicitamente vedada a sua inferência automática como modelo padrão do benchmark.
4. **Gates de Execução, Custo e Manifesto Congelado**:
   - A tabela consolidada de decisões isola claramente as 7 dimensões pendentes: caminho de continuidade (offline vs externo), contrato/corpus, desenho, modelo/parâmetros, dados/operações permitidos, tetos técnicos e custo financeiro.
   - Exige-se que qualquer execução futura dependa de reserva prévia de custo por chamada/run/piloto; custo desconhecido bloqueia a execução.
   - O pacote detalha os requisitos para o futuro manifesto congelado e veda qualquer execução antes de implementação em tarefa própria com suite de testes e revisão independente separada.
5. **Isolamento de Gold, Histórico de Zero Bytes e Split Development**:
   - A fronteira de allowlist veda qualquer exposição da fixture privada (`evaluation_private`, respostas esperadas, rubricas e notas anteriores) ao prompt ou contexto do modelo.
   - O histórico de zero bytes no cenário C é transparente e formalmente declarado como controle pareado equivalente a `sem_memoria`, sem pretensão de aferir histórico longo ou compressão.
   - O split permanece categorizado exclusivamente como `development`, reiterando a ausência de holdout e a impossibilidade de alegar eficácia ampla ou economia real neste estágio.
6. **Reconciliação de Esquemas e Convenção de Sinais**:
   - O pacote documenta com clareza a necessidade de reconciliar antes da coleta a divergência de sinal na fórmula de variação percentual entre o adaptador de métricas (`(Mimir - baseline) / baseline * 100`) e o contrato (`(baseline - Mimir) / baseline * 100` para economia), preservando o rigor técnico sem alterar indevidamente os artefatos existentes.

Nenhum defeito bloqueante foi identificado. O relatório emite veredito **APPROVE** para o pacote de decisão do piloto v0.3 entregue pela Task56.

---

## 2. Análise Detalhada por Critério

### 2.1 Coerência Matemática e Aninhamento de Tetos

A formulação matemática contida em [docs/benchmarks/v03/piloto-decisao.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md) é precisa e consistente em todos os seus níveis:

- **Espaço Amostral de Observações**:
  $$\text{Total de Observações} = 3\text{ casos} \times 3\text{ cenários} \times 3\text{ repetições} = 27\text{ observações potenciais}$$
  - Por cenário: $3 \times 3 = 9$ observações potenciais em cada (`sem_memoria`, `com_mimir`, `historico_completo`).
  - Observações produzidas: **0** (corretamente destacado no texto).
  - Teto de Precision@3: como cada caso possui exatamente 1 unidade relevante (`code-approval/behavior`, `code-budget/behavior`, `code-failure/behavior`), o denominador fixo $k=3$ estabelece teto matemático de $1/3$ (33,3%), prevenindo interpretações incorretas de métricas.
- **Chamadas de Operação por Tipo**:
  - Cenário A (`sem_memoria`): 1 chamada ao modelo, 0 chamadas Mimir $\rightarrow 9$ chamadas ao modelo.
  - Cenário B (`com_mimir`): 1 chamada ao modelo, 1 chamada local Mimir $\rightarrow 9$ chamadas ao modelo $+ 9$ chamadas locais Mimir.
  - Cenário C (`historico_completo`): 1 chamada ao modelo, 0 chamadas Mimir $\rightarrow 9$ chamadas ao modelo.
  - **Total de Chamadas**: $27\text{ chamadas ao modelo} + 9\text{ recuperações locais Mimir} = 36\text{ chamadas totais}$.
  - Subtetos por run: $max\_calls = 2$ comum, com subtetos por ferramenta impedindo que baselines utilizem a vaga livre de recuperação para disparar uma segunda chamada ao modelo.
- **Aninhamento Temporal**:
  - Por chamada: timeout de 60 s para o modelo e 5 s para recuperação local.
  - Por run: limite estrito de 90 s, contendo folga para preparação local, serialização, transporte de rede, inferência e encerramento ($60\text{ s} + 5\text{ s} \le 90\text{ s}$).
  - Runs somadas: $27 \times 90\text{ s} = 2.430\text{ s}$ (40 min 30 s).
  - Limite global de parede do piloto: $2.430\text{ s} + 570\text{ s (9 min 30 s para setup/export/cleanup)} = 3.000\text{ s}$ (50 minutos).
  - Exclusão explícita: avaliação humana offline fica devidamente apartada deste relógio de parede.
- **Tetos Nominais de Tokens**:
  - Entrada: $27 \times 4.096 = 110.592$ tokens.
  - Saída: $27 \times 1.024 = 27.648$ tokens.
  - Janela de contexto mínima requerida: 5.120 tokens.
  - O texto alerta expressamente que a contagem em bytes UTF-8 não equivale a tokens e exige verificação com o tokenizer do modelo que vier a ser aprovado.

### 2.2 Governança dos Gates Decisórios e Ausência de Autoaprovação

1. **Tabela Única de Decisões**:
   - Localizada nas linhas 48–57 de [piloto-decisao.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md), a tabela estrutura os requisitos necessários para 7 tópicos centrais sem preencher nenhum deles como aprovado:
     - _Caminho de continuidade_: alternativa offline documental vs piloto externo.
     - _Contrato e corpus_: acordo formal das regras e casos com base nas evidências da Task55.
     - _Desenho do piloto_: confirmação do escopo restrito de 27 observações.
     - _Modelo e parâmetros_: seleção deliberada de provedor, modelo e tokenizer.
     - _Dados e operações_: autorização de envio por allowlist e caminhos absolutos.
     - _Tetos técnicos_: validação dos limites de chamadas, timeouts e concorrência 1.
     - _Custo_: definição de moeda, tarifas e limites financeiros.
2. **Desacoplamento do Modelo Revisor**:
   - O documento formaliza que a seleção de `Gemini 3.8 Flash High` aplica-se única e exclusivamente às revisões independentes conduzidas pelos agentes (Tasks 55 e 57), sendo vedada sua transposição como escolha padrão para o benchmark.
3. **Formulário de Resposta com Placeholders**:
   - O texto sugerido para deliberação humana (linhas 70–74) utiliza placeholders explícitos (`[RESPONSÁVEL]`, `[DATA]`, `[OPERAÇÕES E DADOS/FONTES]`), garantindo que nenhuma concessão implícita ou aprovação por inércia seja inferida.

### 2.3 Isolamento Técnico, Allowlist e Mitigação de Vazamento do Gold

1. **Construção do Envelope via Allowlist**:
   - O prompt enviado ao modelo é estritamente limitado à instrução fixa versionada, à tarefa literal do caso (`model_context.task`) e aos trechos autorizados identificados em `allowed_source_ids`.
   - Veda expressamente a inclusão de histórico da sessão do agente, diretórios da máquina, saídas prévias ou dados do repositório fora dos intervalos validados no commit `166e3cf047b2078952e43dc8e9171e053e99e2ce`.
2. **Confinamento Local do Avaliador**:
   - Todo o bloco `evaluation_private` (`expected_answer`, critérios de sucesso, rubricas e notas) permanece em processo isolado local, fora do alcance de prompts, logs públicos ou ferramentas de LLM.
3. **Proposta de `tools=[]` para o Modelo**:
   - O modelo não recebe permissão para acionar ferramentas de execução (shell, leitura de disco, MCP, rede ou API do Mimir). No cenário B, o próprio orquestrador local executa a recuperação antes da invocação do LLM e injeta o resultado no envelope, minimizando imprevisibilidade e consumo não orçado.

### 2.4 Alinhamento com Preflight e Adaptador de Métricas

1. **Preflight**:
   - A ordenação lexicográfica e a rotação determinística (ABC / BCA / CAB com deslocamento por caso) reproduzem com exatidão a lógica de `planCases` em [scripts/benchmarks/preflight.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs#L280-L300).
   - O status `pending` e as referências nulas dos casos foram mantidos, preservando o bloqueio de planejamento do preflight (`Planning requires nonillustrative accepted cases with validated gold and complete references`).
2. **Adaptador de Métricas e Reconciliação de Sinais**:
   - O pacote reconhece que [scripts/benchmarks/metrics.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs) opera em escopo offline experimental (sem suporte a custos, tokens ou source accuracy).
   - Registra com precisão que a fórmula percentual do adaptador calcula `(Mimir - baseline) / baseline * 100`, enquanto o contrato adota `(baseline - Mimir) / baseline * 100` para mensurar economia. O pacote instrui a reconciliar formalmente esses esquemas antes da implementação da coleta.

### 2.5 Atualizações Incrementais em `contrato.md` e `metodologia.md`

- **[docs/benchmarks/v03/contrato.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md#L7)**:
  - Atualização pontual registrando a autorização pela qual a equipe assumiu corpus/metodologia na Task54, o veredito APPROVE da revisão independente Task55 e a adição de link para o pacote de decisão do piloto, reiterando que o contrato continua aguardando aceite formal.
- **[docs/benchmarks/v03/metodologia.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md#L3)**:
  - Atualização pontual registrando que a proposta documental foi aprovada na Task55 com conferência de hashes e fontes, mantendo o status de contrato e corpus como pendentes de aceite humano e vinculando o pacote de decisão.
- Ambas as alterações são cirúrgicas, não desfazem nenhuma garantia anterior e preservam a rastreabilidade histórica.

---

## 3. Registro de Verificações Independentes

| Verificação                       | Procedimento Realizado                                                                      | Resultado                                                                 |
| :-------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| **Integridade dos Links**         | Script Node.js varrendo todos os links dos 4 artefatos                                      | 100% dos links locais e relativos válidos e existentes (22 links)         |
| **Âncora do Roadmap**             | Auditoria do slug `#v030--useful-context-not-just-more-context-p0` em `ROADMAP_MIMIR_NL.md` | Slug válido e correspondente à seção v0.3.0 do Roadmap                    |
| **Formatação de Código**          | Prettier check nos 4 artefatos da Task56                                                    | Aprovado em conformidade (código 0, sem desvios)                          |
| **Quebras e Espaços Git**         | `git diff --check` e verificação de CRLF / trailing spaces                                  | 100% limpo (código 0, sem erros de formatação ou caracteres nulos)        |
| **Validação Preflight dos Casos** | Execução de `validateCases` com bloco JSON de `casos.md`                                    | `status: 'structurally_valid'`, 3 casos, proveniência caller não confiada |
| **Bloqueio de Planejamento**      | Execução de `planCases` com os casos em `pending`                                           | Bloqueado conforme esperado com exceção determinística                    |
| **Cálculo dos Tetos**             | Auditoria manual e cruzamento das equações de tempo e tokens                                | 100% exato e aninhado (27 runs, 36 calls, 3.000 s de parede, 138k tokens) |
| **Preservação de Dirty State**    | Inspeção de `git status --short`                                                            | Modificações e untracked preexistentes integralmente preservados          |

---

## 4. Tabela de Achados

| ID         | Severidade  | Artefato e Linha                                                                                 | Descrição                                                                                                                                                                 | Resolução / Status                                                                                                                                                                             |
| :--------- | :---------- | :----------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F57-01** | Informativo | [piloto-decisao.md:68](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md#L68) | Identificação da convenção divergente de sinal percentual entre o adaptador de métricas (`(Mimir - baseline) / baseline`) e o contrato (`(baseline - Mimir) / baseline`). | Documentado de forma proativa no próprio pacote como item de reconciliação mandatória antes da coleta real, sem alterar prematuramente o código do adaptador. Sem ação necessária nesta etapa. |
| **F57-02** | Informativo | [piloto-decisao.md:37](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md#L37) | Tetos de tokens nominais (4.096 / 1.024) não equivalem a bytes UTF-8 e dependem da verificação de tokenizer específico do modelo a ser escolhido.                         | Ressalva técnica expressamente inserida no texto do pacote, alertando para não usar `estimateTokens` como tokenizador real. Sem ação necessária.                                               |
| **F57-03** | Informativo | [piloto-decisao.md:31](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-decisao.md#L31) | Proposição de `tools=[]` para o modelo mitiga custos e chamadas autônomas, transferindo a recuperação ao orquestrador de benchmark local.                                 | Desenho experimental robusto e aderente ao contrato; documentado com transparência técnica. Sem ação necessária.                                                                               |

Nenhum achado de severidade Alta ou Média. Não há correções necessárias nos artefatos entregues pela Task56.

---

## 5. Conclusão e Veredito

O pacote de decisão do piloto v0.3 entregue pela Task56 atende plenamente aos critérios de rigor técnico, coerência matemática, isolamento de dados, segurança operacional e governança documental.

- **Veredito**: **APPROVE**
- **Observações Finais**:
  - A aprovação deste pacote valida sua suficiência técnica e solidez documental para subsidiar a deliberação humana.
  - Não constitui aceite humano do contrato ou do corpus, nem autoriza chamadas externas, modelos, consumo orçamentário ou alteração de branches/commits.
  - A próxima etapa requer a submissão deste pacote ao mantenedor para deliberação explícita sobre os 7 itens pendentes antes de qualquer implementação de executor.
