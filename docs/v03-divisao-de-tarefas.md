# v0.3 — Divisão de tarefas

> Atualização Task99: o texto abaixo é histórico. A sequência vigente proposta para novo trabalho está no [plano0.2](benchmarks/v03/fechamento-0.2.md), com [emenda explícita](benchmarks/v03/contrato-0.2.md) e revisão Task100 pendente. Continuidade autorizada não equivale a aceite humano ou publicação. Exploração A/B já ocorreu; executor ABC e fechamento experimental continuam abertos.

Este registro não verifica publicação da v0.2.0; sua evidência histórica permanece no roadmap. A v0.3 tem preflight e métricas offline implementados e revisados, com corpus/metodologia em proposta. O objetivo é medir quando a memória ajuda ou atrapalha, conforme a [seção v0.3 do roadmap](../ROADMAP_MIMIR_NL.md#v030--useful-context-not-just-more-context-p0). Ainda não há ganho real demonstrado. Este plano não inicia benchmarks, ingestão ou chamadas a modelos.

## Responsabilidades e sequência

| Etapa                        | Responsável                                                      | Entrega e dependência                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Contrato comum            | Equipe principal/Codex, com revisão independente e aceite humano | Proposta versionada dos campos dos casos, resultados, métricas e permissões. Acordar antes de produzir o corpus final ou implementar o executor.                                                  |
| 2. Corpus e metodologia      | Equipe principal/Codex                                           | Proposta pequena de 3–5 casos no próprio MimirNL, fontes e critérios verificáveis; desenho dos três cenários. Depende do contrato acordado.                                                       |
| 3. Conferência das respostas | Pessoa diferente do autor, com apoio de Codex                    | Conferir cada resposta esperada diretamente nas fontes fixadas; registrar revisor, divergências e decisão. Depende da proposta de casos.                                                          |
| 4. Executor e métricas       | Equipe principal/Codex                                           | Executor reproduzível, isolamento dos cenários, coleta local e relatório comparativo. Depende do contrato e de casos aceitos; executar dentro da autorização e dos limites definidos no contrato. |
| 5. Melhorias do motor        | Equipe principal/Codex                                           | Propostas separadas para ranking, deduplicação, recência, proveniência, fallback e orçamento de contexto. Dependem de baseline registrado e comparação posterior com o mesmo conjunto.            |

O autor não aprova a própria entrega. A equipe principal assume também corpus e metodologia por autorização do usuário (Task54); conferência das fontes e revisão independente continuam obrigatórias.

## Contrato a acordar

Não há novo formato implementado por este plano. Antes das frentes dependentes, definir um contrato comum com:

- **Por caso:** ID estável, tarefa, versão/commit da fonte, arquivos/trechos relevantes, resposta esperada fundamentada, critérios de sucesso verificáveis e permissões de leitura, execução e eventual envio ao provedor.
- **Revisão:** autor, pessoa que conferiu as fontes, revisão Codex, decisão humana e justificativa para exclusões ou ambiguidades. Uma saída do modelo não serve como verdade de referência.
- **Por execução:** ID do caso e cenário, revisão do corpus e do executor, modelo/provedor/versão quando aplicável, parâmetros, contexto fornecido, estado inicial de memória, repetições e evidências necessárias para reproduzir o resultado.
- **Por resultado:** sucesso da tarefa e evidências, fontes recuperadas, métricas e unidades, falhas, dados ausentes e limitações. Valores indisponíveis ficam marcados como indisponíveis, nunca como zero ou ganho estimado sem identificação.

O contrato registra uma vez a autorização e os limites das execuções; execuções já autorizadas dentro desse escopo não exigem nova aprovação. Mudanças de escopo exigem nova decisão do usuário.

Dúvidas nas fontes bloqueiam a aceitação do caso até resolução por pessoa diferente do autor. O conjunto de avaliação deve ser fixado antes das otimizações; alterações posteriores precisam de versão e justificativa.

## Método de comparação

Comparar **sem memória**, **com memória** e **contexto de histórico completo** com os mesmos casos, fontes fixadas, modelo/parâmetros e critérios de sucesso. Definir previamente o histórico permitido, a preparação da memória, os limites de contexto, o número de repetições e a ordem dos cenários. Reiniciar o estado entre execuções para evitar contaminação; resposta esperada fica fora do contexto entregue ao modelo. Registrar truncamentos e cenários inviáveis, sem compará-los como execuções equivalentes.

O contrato deve definir k, conjuntos de fontes relevantes e regra de agregação para Precision@k/Recall@k; também precisão das fontes citadas, taxa de memória obsoleta, latência de recuperação e resultado da tarefa. Medir tokens reais de entrada/saída pelo tokenizer ou uso reportado do modelo, identificando o método. Separar estimativas de custo de medições, com provedor, preço e data quando disponíveis. Registrar tempo total e variação entre repetições, incluindo casos em que a memória piora o resultado.

Métricas serão locais e opt-in, sem upload de telemetria por padrão. O relatório deve explicar limites do piloto e permitir reprodução; resultados sintéticos anteriores não comprovam economia em tarefas reais.

## Áreas propostas e limites

Estado atual em `166e3cf047b2078952e43dc8e9171e053e99e2ce`: contrato, preflight e métricas estão commitados; revisões independentes [Task51](../tasks/51-v03-preflight-review-findings.md) e [Task53](../tasks/53-v03-benchmark-metrics-review-findings.md) registram APPROVE dos componentes offline. Isso não aprova contrato, corpus ou execução. A Task54 propõe [casos](benchmarks/v03/casos.md) e [metodologia](benchmarks/v03/metodologia.md), ainda sem aceite; executor real continua pendente. A branch local desta entrega parte desse HEAD, sem commit/push.

| Frente          | Área proposta                                                         | Limite                                                                          |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Contrato        | `docs/benchmarks/v03/contrato.md`                                     | Equipe principal; acordo antes das dependências.                                |
| Corpus/método   | `docs/benchmarks/v03/casos.md` e `docs/benchmarks/v03/metodologia.md` | Somente proposta documental de casos, fontes e método.                          |
| Executor/coleta | `scripts/benchmarks/` e `test/benchmarks/`                            | Equipe principal; implementação em tarefas próprias.                            |
| Relatório       | `docs/benchmarks/v03/resultados.md`                                   | Evidências, comparação dos três cenários e limitações após execução autorizada. |
| Motor           | `src/`                                                                | Equipe principal, depois do baseline, em PR separado.                           |

Esta frente documental não altera core, segurança, banco/migrações, package/dependências, CI, configurações ou credenciais, nem realiza ingestão real. Começar apenas com proposta sobre fontes do próprio MimirNL: outros repositórios, dados pessoais, bancos existentes, ingestão e chamadas a modelos precisam de autorização específica. Acesso ao repositório não autoriza enviar seu conteúdo a um provedor.

## Issues, branches e aceite

Abrir uma issue por entrega, com responsável, caminhos permitidos, dependências e critérios de aceite. Para futuras integrações, usar branches curtas a partir da branch existente `develop`, por exemplo `docs/v03-contrato` e `docs/v03-casos-piloto`, e PRs pequenos destinados a `develop`. Exceção delimitada da Task54: branch local `docs/v03-corpus-methodology` a partir do HEAD `166e3cf`, preservando alterações existentes.

Sem merge direto. Toda contribuição produzida com Antigravity passa por revisão independente em Codex, conferência humana das fontes/respostas e checks pertinentes ao diff. Esses são requisitos do processo proposto; não se presume que proteções de branch estejam configuradas. Nossa automação não faz commit/push sem decisão do usuário. O mantenedor controla a integração e o release. Não publicar no npm nem alterar roadmap sem pedido.

Checklist para cada entrega:

- [ ] Issue, responsável, escopo de arquivos e dependências registrados.
- [ ] Contrato acordado antes das entregas dependentes; casos pequenos e fontes fixadas.
- [ ] Cada resposta esperada conferida nas fontes por pessoa diferente do autor.
- [ ] Permissões explícitas e ausência de dados/execuções fora do escopo.
- [ ] Três cenários comparáveis, métricas definidas e limitações documentadas.
- [ ] Diff restrito à entrega; formatação focada e `git diff --check` aprovados.
- [ ] Para futuro código, testes e checks pertinentes ao comportamento alterado registrados.
- [ ] Revisão independente por revisor diferente do autor, pendências resolvidas e aceite humano registrados antes de integrar.
- [ ] Sem alegações de ganho sem medição; automação respeita a decisão do usuário sobre commit/push e mantenedor controla integração/release.

## Atualização Task120 — fechamento105 sob revisão111

A avaliação limitada104 e a revisão110 estão consolidadas no [fechamento corrente](benchmarks/v03/fechamento-0.3.md). Snapshot histórico preservado antes da portabilidade/formatação; código corrente segue revisão independente111 antes do fechamento definitivo105. Zero chamadas novas, 54 históricas. Qualidade igual nos três cenários, B com +2,93% de tokens de entrada; cache ambiente, histórico C vazio e modelo/custo/TTFT indisponíveis impedem alegar economia ou ganho de qualidade. Sem commit, push ou publicação; histórico anterior preservado.
