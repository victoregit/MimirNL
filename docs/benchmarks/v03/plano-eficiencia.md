# Programa de eficiência v0.3

Data: 2026-10-28. Estado: entrega documental Task123, pendente de revisão124. Nenhuma implementação ou nova medição executada.

## Decisão e escopo

O usuário decidiu continuar a v0.3 antes da publicação, priorizando eficiência e medições melhores. O fechamento105/120 está **technical_complete**, com [APPROVE111](../../../tasks/111-v03-final-review-findings.md) e [registro122](../../../tasks/122-resume-technical-closeout.md). Isso encerra aquele escopo técnico, sem encerrar o objetivo amplo da v0.3. Publicação está adiada por essa prioridade; commit, push, aceite humano e CI remoto continuam pendentes. Não há promessa de porcentagem de economia.

Este programa organiza diagnóstico, intervenções e gates. Não altera core congelado, dependências, runtime, contratos ou resultados históricos; não autoriza benchmark, ingestão, retuning ou acesso a gold, coordenador e avaliação privada. A [transição0.3](contrato-0.3.md) distingue bytes executados historicamente do checkout corrente: experimento futuro terá nova identidade, sem reatribuir a execução104 aos bytes atuais.

## Matriz de evidências

| Evidência e baseline                                                                                                                                                                                                          | Unidade e denominador                                                                                                                                          | Resultado observado                                                                                         | Qualidade e limites                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [78](../../../tasks/78-v03-codex-live-flow-result.md)/[79](../../../tasks/79-v03-codex-live-quality-findings.md), [82](../../../tasks/82-v03-two-host-closeout.md): A seis fontes integrais, B somente seleção do mesmo pool  | Codex; uma pergunta development, três pares AB/BA/AB, seis chamadas; razão das medianas de total reportado, A=20.354 e B=14.180                                | Redução **30,33% de total**, sem inferência financeira. Cache12.032 incluído no input de cada chamada       | 6/6 respostas aprovadas nos critérios factuais/citação. Diferença das medianas de tempo favorece B, mas mediana dos deltas pareados é +62,83ms: sem aceleração consistente |
| [80](../../../tasks/80-v03-antigravity-live-flow-result.md)/[81](../../../tasks/81-v03-antigravity-live-quality-findings.md), [82](../../../tasks/82-v03-two-host-closeout.md): substituição do contexto completo por seleção | Antigravity; uma pergunta, três pares, seis chamadas; razão das medianas do contador **nativo explícito** total, A=17.030 e B=10.290                           | Redução **39,58% no contador nativo**; usage normalizado null, semântica geral não confirmada               | 6/6 respostas aprovadas. Todos os pares B mais lentos; mediana do delta +4,76s. Não normalizar AG como Codex nem somar thinking novamente                                  |
| [104](../../../tasks/104-v03-bounded-evaluation-result.md)/[parecer público110](../../../tasks/110-v03-answer-quality-review-findings.md): A fontes-base, B mantém base e adiciona recuperação                                | 54 chamadas, 18 blocos ABC; 12 casos distintos (9dev uma repetição, 3evaluation três repetições). Somas de input de18 posições por braço: A=261.437, B=269.101 | **+7.664 / 261.437 = +2,93% de input**. Não é economia de2%. Cache subset=216.576 por braço; sem cache frio | Sucesso e acurácia de fontes54/54, delta B−A zero. Busca média21,58ms incluída no tempo; sem ganho robusto de latência. C tem history0 e envelope A=C nos18 blocos         |
| [95](../../../tasks/95-v03-layout-live-comparison-result.md)/[96](../../../tasks/96-v03-layout-live-comparison-review-findings.md): layout v2 contra v1 dentro de cada caso/braço                                             | Dois casos, uma repetição, oito chamadas; quatro comparações de layout com fontes/ordem/conteúdo equivalentes                                                  | v2 **+1 input/uncached** por par e cache extra zero (12.032 em todos os slots)                              | 8/8 respostas aprovadas. Sem benefício geral de cache demonstrado; diferenças pequenas de total incluem variação de output. Latência variável, causa não identificada      |

São unidades, baselines e denominadores diferentes: razão de medianas de total, contador nativo AG e razão de somas de input não medem o mesmo efeito. Não comprovam regressão entre versões. Repetições de três casos de evaluation não viram nove casos independentes. Amostras limitadas, sem prova de representatividade ou poder estatístico. Modelo solicitado não comprova backend efetivo; custo, TTFT e latência exclusiva do modelo permanecem desconhecidos quando não observados.

Os relatórios78–82/95 citam evidências em diretórios temporários que podem não existir após reboot. Usar registros duráveis disponíveis com essa limitação, sem reconstruir respostas, contadores ou precisão fictícia. Não abrir dados privados para preencher lacunas. O pacote público104 e o snapshot histórico permanecem preservados.

## Diagnóstico a resolver primeiro

Seleção pode substituir conteúdo enviado integralmente, como78/80, ou acrescentar conteúdo a uma base suficiente, como104. A segunda forma pode gerar redundância e custo sem ganho factual; o resultado110 sustenta investigar essa hipótese, sem demonstrar bug no core. O C atual é controle redundante de histórico vazio, não teste de histórico longo.

O volume aparentemente fixo de entrada do host é um sinal a investigar. Registrar separadamente o que a aplicação envia e o que o host expõe, com fronteiras e campos desconhecidos. Não subtrair piso inferido dos tokens reportados nem vender o resíduo como custo real. Cache observado não identifica quais trechos foram reutilizados. Bytes UTF-8 e estimateTokens não são tokens do modelo. Tokenizer apropriado ausente implica tokenização local unknown; eventual estimativa diagnóstica fica separada do usage real.

[Core108](../../../tasks/108-v03-core-review-findings.md) já aprovou dedupe por hash **entre memórias recuperadas antes de limit**, proveniência de duplicatas, desempate de recência controlado, política opcional balanced-v1 com cobertura lexical, razões de abstenção, hard budget de bytes do envelope e compact-v1 preservando conteúdo/proveniência. Legacy permanece padrão; telemetria é local opt-in. Isso não demonstra dedupe entre recuperação e conteúdo já enviado pelo host, nem orçamento adaptativo por tarefa. Compact-v1 já existe: avaliar seu uso e custo residual antes de inventar outro formato. O trade-off de iterar matches FTS sem LIMIT precisa medição, sem declarar defeito por hipótese. Nenhum desses comportamentos será modificado nesta tarefa.

## Backlog ordenado

Todos os itens são **propostos**, salvo EF-00 em entrega documental. Prioridade ordena investigação; não autoriza implementar tudo. Cada intervenção exige comparação isolada e decisão registrada.

| ID / prioridade / estado                   | Hipótese e intervenção delimitada                                     | Medida necessária                                                                                                           | Sucesso ou descarte                                                                                           | Dependência e responsável                                            |
| ------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| EF-00 / P0 / entregue, revisão124 pendente | Consolidar evidências e evitar comparações incompatíveis              | Matriz, fontes e lacunas                                                                                                    | Revisor124 confirma consistência ou solicita ajuste                                                           | Developer documental; supervisor encaminha revisão                   |
| EF-01 / P0 / proposto                      | Decomposição observável revela onde entram bytes e tempo              | Captura de instrução/base/histórico/recuperação/envelope, hashes, bytes antes/depois, usage bruto e relógios por etapa      | Aceitar se fronteiras e unknowns auditáveis sem dupla contagem; descartar atribuição de piso não observável   | Após124; developer instrumenta offline, reviewer aprova antes de uso |
| EF-02 / P0 / proposto                      | Sobreposição com a base explica parte do acréscimo104                 | Análise determinística offline de fontes públicas autorizadas, hashes/faixas sobrepostas e cobertura necessária em dev novo | Avançar se redundância removível preservar fatos/proveniência; se ausente, rejeitar hipótese                  | EF-01; developer e revisão offline; zero chamadas                    |
| EF-03 / P1 / proposto                      | Dedupe contra conteúdo já presente e render compacto reduzem envelope | Comparar dedupe e compact-v1 separadamente; bytes, proveniência, cobertura; depois usage/qualidade                          | Aceitar só com menor entrada observada e gate de qualidade; descartar se perde fato/citação ou não reduz alvo | EF-02; developer/reviewer; distinto do dedupe108                     |
| EF-04 / P1 / proposto                      | Gating evita recuperação irrelevante e abstenção indevida             | Positivos/negativos dev novos, falsa inclusão, falsa abstenção, recall e bytes                                              | Aceitar se poupa contexto sem violar tolerância prévia; descartar se perde fatos necessários                  | EF-01/02; avaliar balanced-v1 existente antes de regra nova          |
| EF-05 / P2 / proposto                      | Orçamento adaptativo/ranking/chunk melhora cobertura por byte         | Ablação de uma variável por vez em dev novo; custo de busca e cobertura/citações                                            | Congelar só candidato que passe qualidade e alvo; descartar ajuste sem ganho ou instável                      | Após EF-03/04; tuning só dev; developer/reviewer                     |
| EF-06 / P2 / adiado                        | Reutilização incremental e histórico genuíno evitam recomputação      | Sequências progressivas, invalidação/stale/conflito, custo acumulado/amortização                                            | Aceitar só se preserva atualização/qualidade no custo acumulado; descartar reuse incorreto                    | Instrumentação madura e gates anteriores; nova especificação         |
| EF-07 / P3 / adiado sem evidência          | Embeddings ou cache tuning podem ajudar gargalo demonstrado           | Falha lexical ou cache atribuível, custo/dependências e alternativa determinística                                          | Abrir implementação somente se diagnóstico justificar; senão manter adiado                                    | Supervisor decide nova tarefa; sem prioridade automática             |

## Comparação futura: mesmo problema e acesso equivalente

Selecionar tarefas/fontes explicitamente autorizadas e versionadas, com pools idênticos acessíveis aos braços e mesmo problema. Não importar repositório real automaticamente. Proposta operacional offline: **seis casos dev novos**, cobrindo multiarquivo, negativo, stale, conflito, sem benefício e histórico progressivo; casos podem combinar categorias. Reservar **três casos novos independentes de evaluation**, definidos e custodiados por avaliador distinto, sem exposição ao implementador. Tamanhos organizam trabalho/orçamento, sem demonstrar representatividade ou significância. Holdout antigo já foi consumido e não retorna intacto.

Definir os braços antes de gerar prompts:

- **A completo:** pool da tarefa integral, uma vez por unidade, dentro do orçamento comum realista. Não aumentar documentos irrelevantes só para favorecer B.
- **B seleção Mimir:** instrução/pergunta comuns e apenas seleção do mesmo pool, substituindo envio integral. Sem acesso privilegiado às respostas esperadas.
- **D baseline forte:** recuperação manual documentada ou busca simples determinística, com mesmo acesso e orçamento. Seleção manual não pode usar gold nem custo humano gratuito oculto: registrar esforço/tempo ou unknown. Comparar também B com D, evitando validar apenas contra dump.
- **E controle aditivo:** base comum mais recuperação, separado de B para isolar redundância. Não agregar ao efeito de substituição; execução fora do primeiro piloto, com orçamento próprio.
- **H histórico genuíno:** sequência de turnos em que decisões/fatos anteriores são necessários depois. Proposta offline de pontos nos turnos1,3 e6, limite acumulado comparável e mesma informação necessária disponível aos métodos. Baseline mantém histórico real até orçamento com descarte declarado; Mimir seleciona/reutiliza sob limite equivalente. Registrar todos os turnos, custo acumulado e cobertura. Não fabricar histórico por repetição inútil, negar fatos assimetricamente ou chamar history0 de H.

Truncamento/inviabilidade e limites de resposta/contexto devem ser comuns e congelados; falhas permanecem no denominador. Recuperação e montagem entram uma vez no end-to-end, de antes da recuperação até resposta/coleta. Ingestão, indexação, setup e cleanup são medidos separadamente; publicar também custo total com setup e amortização explícita por N tarefas reais, sem supor reuse infinito. Baseline simples também paga recuperação; não somar retrieval novamente ao end-to-end.

Congelar fontes/commits/hashes, perguntas, política, query, k, formato, budget, configuração, modelo solicitado, versão do host e ordem antes de evaluation. Registrar modelo observado ou unknown, cache ambiente/cold apenas se realmente controlado, processos/sessões, permissões de ferramentas, divergências e falhas. Balancear AB/BA entre casos quando houver pares; para três braços alternar posições e declarar balanceamento incompleto. Não trocar modelo/configuração após observar resultados. Reportar por host/modelo e semântica; AG permanece nativo separado até validação independente da normalização.

Avaliador independente predefine sucesso factual, cobertura dos fatos necessários, citações válidas, resolução de stale/conflitos e abstenção correta, incluindo falsa abstenção em positivos. Proposta de gate do piloto: **zero perda de fatos obrigatórios ou citações válidas frente ao baseline forte, zero fato inventado e zero abstenção indevida**; limite verbal comum congelado no manifesto. Tolerância estrita operacional, sem conclusão estatística. Se inviável, ajustar desenho em dev antes do freeze, nunca relaxar margem depois de ver evaluation. Ganhos de recursos são condicionados a esse gate; completed não substitui qualidade.

Por posição/agregado registrar raw usage permitido, input/output/cache/total, end-to-end, retrieval, context_bytes e bytes por componente, setup, falhas/timeouts/not_run, cobertura operacional/factual, precisão/recall quando houver referência, stale conhecido ou unknown e qualidade das citações. Null/unknown não é zero. Custo financeiro, tarifa, TTFT e tempo exclusivo do modelo ficam unknown se não expostos; sem inferência de preço por quota.

Para mesma métrica/unidade, economia = **(1 − B/A) × 100**, somente A>0; A=0 implica percentual N_A, preservando absolutos. Cache é subconjunto do input; total=input+output apenas se confirmado pelo contrato do host, sem somar cache novamente. Preservar contadores nativos de semântica não confirmada. Publicar deltas pareados B−A/distribuição/cobertura separados da razão de medianas ou somas; diferença de medianas não é mediana dos deltas. Repetições medem variabilidade, sem aumentar casos distintos. Agregados não escondem falhas ou ausências.

## Escada de gasto e gates

1. **Agora: zero chamadas.** Revisão124 do plano. Próxima tarefa offline pode inventariar componentes/sobreposições das fontes públicas dev autorizadas, sem acessar holdout privado ou executar launcher. Métodos determinísticos, hashes e diff quando bastarem.
2. **Instrumentação offline:** supervisor abre EF-01/02 delimitados; developer implementa captura mínima sem dependência nova desnecessária; reviewer verifica segurança, fronteiras, aritmética e testes sintéticos apropriados antes de uso real. Este documento não implementa a etapa. Tokenizer ausente continua unknown, bytes separados.
3. **Piloto proposto, não autorizado nem automático:** dois casos dev novos (multiarquivo positivo e negativo), três braços A/B/D, uma repetição: **máximo seis chamadas totais**, um host/modelo fixado, sequenciais. Máximo90s por chamada e12min globais incluindo preparação/recuperação; retry0, sem warmup pago, fallback ou chamadas de descoberta/calibração. Timeout/falha consome tentativa; parar no teto global e registrar restantes not_run. Contexto máximo32.000 bytes e resposta máxima64.000 bytes por tentativa, limite verbal comum congelado. Sem E/H neste lote. Manifesto demonstra viabilidade offline antes de solicitar autorização específica ao supervisor/usuário.
4. **Após piloto:** avaliador independente aplica gate prévio; developer apresenta decomposição, falhas e decisão. Ampliar apenas após diagnóstico respondido e qualidade preservada. Evaluation nova, histórico progressivo e outros hosts exigem planos/tetos próprios revisados, política congelada e autorização específica. Não repetir54 chamadas agora.

Quota disponível é desconhecida. Seis é teto operacional proposto, sem garantia de cabimento na quota. Não converter percentual de quota em chamadas. Supervisor verifica disponibilidade/autorização antes do piloto; se não couber, adia sem alterar desenho silenciosamente. Código/instrumentação novos requerem developer e reviewer antes de uso; revisão124 não aprova código futuro nem libera execução.

## Registro preenchível de experimento

Copiar para novo documento por experimento; resultado permanece vazio até etapa autorizada. Um fator muda por comparação; registrar também descarte e resultado negativo.

```markdown
# Experimento EF-\_\_ — título

- Estado: proposto / revisado / autorizado / executado / revisado resultado / descartado
- Responsáveis: developer **; reviewer **; supervisor **; avaliador independente **
- Hipótese e intervenção única: \_\_
- Baseline forte, demais braços e problema comum: \_\_
- Commit e hash do diff dirty/inventário dos arquivos usados: \_\_
- Fontes autorizadas, hashes, pool e proveniência: \_\_
- Split dev novo / evaluation nova independente; custodiante: \_\_
- Modelo solicitado/observado, host/versões/configuração/permissões: \_\_
- Política/query/k/chunk/formato e hash do freeze: \_\_
- Ordem/cache/sessões e fatores não controlados: \_\_
- Budget bytes/tokens observados, máximo chamadas/tempo, retry0: \_\_
- Setup/ingestão, amortização por N e custo de recuperação: \_\_
- Métrica alvo e sucesso/descarte congelados: \_\_
- Qualidade, cobertura, citações, abstenção e tolerância prévia: \_\_
- Revisões, autorização e destino de evidência sanitizada: \_\_
- Planejadas/concluídas/falhas/timeouts/not_run e exclusões por métrica: \_\_
- Raw usage; input/output/cache/total; bytes/componentes; retrieval/end-to-end: \_\_
- Qualidade/cobertura/citações/stale e unknowns: \_\_
- Resultados absolutos, deltas pareados e razões identificadas: \_\_
- Custo/TTFT/modelo efetivo desconhecidos e limitações: \_\_
- Decisão: aceitar / rejeitar hipótese / inconclusivo; motivo: \_\_
- Parecer independente do resultado: \_\_
- Próxima ação e gate: \_\_
```

## Ações imediatas

Developer entrega plano e correções delimitadas de status. Supervisor encaminha revisão124; revisor valida comparabilidade, ordem e limites sem disparar benchmark. Depois de124, supervisor pode especificar EF-01/02 como trabalho offline; developer apresenta instrumentação concreta para reviewer. Só após esse gate será preparado manifesto do piloto para autorização específica. Eficiência permanece aberta: plano não é implementação, implementação não é medição e aprovação técnica não é ganho demonstrado.
