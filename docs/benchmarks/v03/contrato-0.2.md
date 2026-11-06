# Contrato v0.3 — emenda 0.2

Data: 2026-10-27. Estado: emenda documental entregue, revisão independente Task100 pendente. Não é manifesto executável nem aprovação de dados. O [contrato 0.1](contrato.md) permanece histórico, com validadores e perfis legados preservados. Esta emenda define o novo trabalho após revisão; não declara acordo retroativo. Base: [auditoria Task97](../../../tasks/97-v03-closure-gap-audit-result.md), [APPROVE Task98](../../../tasks/98-v03-closure-plan-review-findings.md) e [plano de fechamento](fechamento-0.2.md).

## Autorização e escopo

Origem real: instrução do usuário nesta sessão, registrada no contexto fornecido à Task99: “continuar até finalização da0.3”, mantendo Mimir+cache; e handoff “Somente emenda e controle documental, sem modelos/novocódigo/goldaceito”. Referência documental: [Task99](../../../tasks/99-v03-contract-amendment.md). Não há nome, assinatura ou aceite humano formal de gold registrado. A autorização sustentada permite a cadeia técnica delimitada, sujeita às revisões; esta entrega executa apenas documentação. Validade: cadeia finita 99–105 desta sessão, dentro dos limites abaixo; mudança de escopo exige autorização específica.

| Escopo                                                                                                    | Autorização real e limite                                                                                                                      | Critério de aceite                                                      |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Documentação em /mnt/d/Projects/MimirNL/docs e /mnt/d/Projects/MimirNL/tasks; seção atual v0.3 do roadmap | Task99, agora; preservar dirty/histórico                                                                                                       | Task100 independente e links íntegros                                   |
| Corpus, métricas, core e executor em /mnt/d/Projects/MimirNL                                              | Continuidade técnica autorizada; tarefas101–103 após gates, sem banco pessoal/configuração                                                     | Testes pertinentes e revisões independentes de cada artefato            |
| Fontes públicas do próprio projeto previamente permitidas                                                 | Snapshot allowlisted, revisão/hashes por fonte antes do envio; nenhuma nova fonte externa implícita                                            | Conferência independente, licença/proveniência e restrições registradas |
| Codex CLI na fase104                                                                                      | Até54 tentativas após todos os gates; somente tarefa e fontes públicas sanitizadas para destino Codex configurado, sem transferir configuração | Manifesto e transporte revisados, limites verificáveis                  |
| Antigravity                                                                                               | Zero chamadas novas; Tasks80/81 somente evidência histórica limitada                                                                           | Sem claim multicaso AG                                                  |
| Aceite humano, integração, commit/push/publicação                                                         | Não concedidos por revisão técnica ou continuidade                                                                                             | Autorização específica real antes de cada operação fora deste escopo    |

Proibidos: banco pessoal/real, credenciais, .env, SSH/PEM, conversas atuais, candidatos privados, reasoning/transcript/configuração privada no pacote. A emenda não autoaprova fontes, dados, resultados ou representatividade.

## Perfil proposto e manifesto

Novo perfil explícito `technical_reviewed-v1`, `contract_version=0.2`: revisão de fontes e referências técnicas separadas do aceite humano. Propor `technical_review={status: pending|technical_reviewed|rejected, author_ref, reviewer_ref, evidence_ref, artifacts_sha256}`; reviewer diferente do autor, parecer real e hashes conferidos são obrigatórios antes de elegibilidade. Relevância/resposta candidata têm revisão técnica com evidência nas fontes; não são gold humano accepted/validated. Ausência de relevância revisada é `sem_gold`, nunca aprovação implícita. `human_acceptance_ref=null` permanece honesto. Estes campos são especificação para implementação versionada, ainda inexistente. Não converter flags legadas ou afrouxar seus validadores; entrada 0.2 em parser legado deve falhar explicitamente.

Manifesto privado e exportação pública separados: registrar versão/perfil, IDs/revisões/splits, commits e hashes de corpus/engine/executor e diff sujo quando houver, ambiente/runtime/host/SO, raízes locais, autorização, ferramentas/parâmetros suportados, ordem/repetições, k, pool e fontes básicas, políticas de retrieval/dedup/budgets/cache, histórico/seed, revisões e limites. Manifesto não equivale a aceite nem prova de execução. Campos indisponíveis têm valor null, estado unavailable e motivo; campos de gate ausentes bloqueiam. Manifesto público não contém gold/rubricas/notas; contexto runtime não contém nem caseID/split/metadados de avaliação. Identidade de fonte/unidade e proveniência permanecem permitidas.

## Desenho congelado antes do live

Nove casos development existentes, revisados novamente contra snapshots, e três novos evaluation selecionados/revisados separadamente. Tuning e ablação só development. Congelar parâmetros antes de abrir evaluation; inspeção para tuning consome holdout e exige nova versão, sem substituir resultados silenciosamente. Doze casos restritos não representam workloads amplos.

| Cenário                | Contexto e intervenção                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A `sem_memoria`        | Instrução, tarefa e fontes básicas públicas allowlisted; sem retrieval ou histórico                                                     |
| B `com_mimir`          | Exatamente a mesma base, mais uma busca real local Mimir no pool público congelado; acrescentar as unidades retornadas com proveniência |
| C `historico_completo` | Mesma base mais arquivo de histórico autorizado de zero bytes; sem retrieval                                                            |

Modelo solicitado, parâmetros suportados, tools do modelo `[]`, instruções de citação e até120 palavras e limites iguais. Executor faz a busca B; não simular seleção pré-fabricada nem ocultar fontes dos baselines. k=3. Registrar sobreposição com fontes básicas; preservar duplicações contra a base no tratamento principal, cobrando seus bytes. Dedup canônica dentro do retorno antes de k; qualquer dedup contra a base é outra intervenção, declarada e revisada antes, comum a todos os casos, sem customização para favorecer B.

Histórico C: artefato real 0bytes e SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; criar/conferir em101, não afirmar criado agora. C equivale a A como controle, sem claim long-history. Snapshot/seed contêm somente fontes públicas fixadas e proveniência, nunca perguntas, caseID, rubricas, respostas preparadas ou históricos atuais. Cada run usa diretório e DB novos/descartáveis, hash inicial/final e reset independente; baselines vazios, sem resultados anteriores. Allowlist pública isolada fisicamente do avaliador privado, sem acesso a arquivos adicionais pelo modelo.

Ordem determinística: casos por ID, rotação ABC/BCA/CAB com deslocamento por caso e repetição; registrar lista exata no manifesto. Dev:9×3×1=27; eval:3×3×3=27. Não misturar pares com Tasks78–96 ou versões anteriores do core.

## Limites da fase104

Concorrência1; até54 tentativas Codex, no máximo uma por run; até18 buscas locais B (9dev+9eval). `max_calls=2` por run com subtetos modelo1/retrieval1 em B, retrieval0 A/C; vagas não são transferíveis. Sem retry, warmup, troca de host ou chamada fora da fase104/gates. Falhas consomem tentativas; remanescentes not_run. Se transporte não permite contar tentativas reais ou impede controle verificável, bloquear live.

90s/chamada, 120s/run incluindo busca/preparo/serialização/transporte/encerramento, 5s/retrieval local, 120min globais do início ao término do executor incluindo setup/export/limpeza; relógio monotônico e cancelamento. Tetos individuais não ampliam o global. Operações locais síncronas podem não ser preemptíveis: medir excedente e parar antes da próxima operação, declarar essa limitação. Cancelamento local não garante interrupção no provedor.

Contexto da aplicação até32000 bytes UTF-8, incluindo envelope/fontes/retorno; captura de resposta até64000 bytes. Não são teto de tokens/faturamento nem contexto interno completo da CLI. Recusar contexto inviável sem corte silencioso; registrar captura truncada, hash/bytes e excluir pares não equivalentes. Até120 palavras é instrução; avaliar violação como outcome. Preparação101–103, avaliação e revisão105 ficam fora do orçamento de execução104; suas contas/calls são separadas, sem chamadas de benchmark extras.

Tokens input/output nativos observados; cached é subconjunto do input, nunca somado. Tokenizer CLI observado não identificado; estimativa por bytes do core nunca vira tokens reais. Custo/preço/TTFT/modelo efetivo unavailable quando não expostos, com motivo, sem zero ou tarifa inventada. Registrar modelo solicitado separado. Mimir+cache mantido; cache ambiente observado, sem API cache inventada ou cold reset garantido. Sem promessa de economia ou teto financeiro não verificável.

## Métricas pré-especificadas

Precision@3=hits únicos relevantes nos top3/3; Recall@3=hits/R quando R>0, R=0 N_A; sem relevância técnica revisada sem_gold/unavailable. A/C retrieval N_A. Source accuracy=afirmações avaliáveis sustentadas por fonte citada/total de afirmações avaliáveis; afirmação factual sem citação não é sustentada. Zero avaliáveis N_A; avaliação ausente unavailable. Registrar ligação afirmação→citação→trecho e evidência de revisão, separada do runtime.

Stale exige comparação do estado da fonte com referência atual fixada e conferida; idade não prova stale. Contar current/stale/unknown por unidade única; taxa stale/total somente quando total>0 e unknown=0; unknown explícito torna taxa unavailable, mantendo contagens. Ausência de stale confirmado é limitação, nunca êxito de detecção.

Latência retrieval e total separadas (retrieval já incluída no total). Outcome por rubrica revisada, limites de palavras/citações/abstenção; completed não significa sucesso. Cobertura tentativas/planejadas, todos os status e exclusões. B−A e B−C por caso/revisão/repetição, pares completed não truncados com métrica disponível; percentuais100×delta/baseline só baseline>0. Menor latência/tokens tem delta negativo; não chamar todo delta de ganho. Separar splits, n/mediana/min/max, falhas, dados ausentes e sinais negativos. Retrieval por run; qualquer macro/micro novo precisa especificação/testes antes do live, sem agregação inventada.

Hard budget, fallback baixa relevância, recência controlada, dedup antes de limit, formato compacto com proveniência e telemetria local opt-in desativada por padrão exigem implementação/testes/revisões101–103. Não atribuir essas capacidades aos adaptadores atuais. Testes e referência técnica não são aceite humano.
