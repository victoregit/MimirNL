# Task104 — Avaliação limitada Codex

Raiz: /mnt/d/Projects/MimirNL. Dependências: Todos os pareceres101–103 APPROVE e manifesto congelado conforme emenda0.2. [Emenda0.2](../docs/benchmarks/v03/contrato-0.2.md), [plano](../docs/benchmarks/v03/fechamento-0.2.md). Tarefa preparada, não executada pela Task99. Preservar dirty/histórico e não acessar credenciais/.env/SSH/PEM/banco pessoal. Sem subagentes por esta especificação.

## Escopo

Executar somente o protocolo revisado: até54tentativas Codex,9dev×3×1 e3eval×3×3, concorrência1; AG0. Não ampliar/repetir falhas, trocar host ou fazer warmup.

## Artefatos e revisão

Evidências sanitizadas de cada tentativa/status/contexto/retorno/uso/cache/tempos/bytes, avaliação independente das respostas com ligação afirmação→fonte; relatório104 por split. Revisão deve ser feita por revisor diferente do autor, com referências reais, APPROVE/CHANGES_REQUESTED e correções concretas; nenhum teste substitui aceite humano. Parecer pendente bloqueia etapa dependente.

## Checklist de aceite

- [ ] Dependências e hashes/revisões conferidos.
- [ ] 90s/chamada,120s/run,5s/busca,120min global,32000bytes contexto e64000bytes captura; registrar excedentes locais não preemptíveis, falhas e not_run. Custo/TTFT/modelo efetivo unavailable se não expostos. Separar cache subset; preservar sinais negativos e cobertura; tuning só dev antes eval. Nenhuma chamada fora dos gates.
- [ ] Relatório com arquivos absolutos, diff, testes/checks pertinentes, limitações e actual_model_calls.
- [ ] Revisão independente registrada e pendências resolvidas antes da próxima fase.
- [ ] Nenhum commit/push/publicação fora da autorização específica.

## Execução coordenada pelo supervisor

Somente após Task109APPROVE de código/manifesto final103 e conferência gates106/107/108 e inventárioshash. Usuário autorizou sustentadamente até0.3; não pedir nova aprovação genérica. Orçamento fase104 até54tentativas modelo/18buscas locais,90scall/120srun/5sretrieval/120minglobal,concorrência1 e zero retry/warmup/troca host/coldreset. Uma única invocação/manifesto conforme103/review109 congelado; não transformar fake em live sem novo hash/revisão. Regra de parada aprovada deve ser obedecida; falhas consomem tentativas e remanescentes not_run,sem reexecução para completar54. Violação qualitativa de palavras não é falha de transporte, registrar outcome externo; não retunar core após abrir evaluation.

Preflight readonly: destino exclusivo novo, NodeLinux24.22.1 suportado/dist/codefreeze/corepolicyhash/engine/executorhashreviewed/fontes/history0bytes/sourcebundlehash/recibo real/autorizaçãosessão intactos. Runtime público só tarefa/fontes/config pública/bookkeeping fora envelope, nenhum gold/parecerprivado/instruçãoambientalextra. Sem tools autorizadas, instrução notools e auditoriaeventos; capabilitiesCLIlimitadas conforme103. Qualquer ferramenta observada invalida e interrompe, sem alegar isolamento total. Sem leitura de credenciais/env/chaves/config ou DBpessoal.

Feedback≤60s baseado em arquivo/saída/counters. Não relatar conclusão por status sozinho nem interromper jobs legítimos por ausência de stdout; ler metadados, nunca raw reasoning. Não deixar auxiliares completed após uso. Evidências0700/0600, sem apagar para reusar. Capturar transcripts/stderr/rawreasoning proibido. Preservar contextos/respostas finais e result/plano/retrieval/status/limites/usocache/tempos/hashes sanitizados.

Relatório /mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation-result.md com tentativas/status/cobertura por split/cenário/repetição, identidade solicitada/observada/ausente, tempo Mimir incluído1x/setupseparado,custoTTFTunavailable. Sem alegar qualidade/economia aprovada antes110. Diagnóstico cache apenas no schema correspondente, sem conversão silenciosa para schemaantigo.

Revisão110 de todas respostas e falhas/exclusões: rubricas/citações/claims-sourceaccuracy/retrieval/staleunknown e métricas privadas, arquivo avaliação strict compatívelmetrics-v02. Nenhum benchmarkextra. Julgamento do revisor de orquestração separado das chamadas54 e não funcionalidade auxiliar do Mimir. Fase105 consolida evidência durável/checksWindows/format e revisãofinal111. Sem publicação/commitpush automáticos.
