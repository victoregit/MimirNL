# Task105 — Evidência durável e fechamento

Raiz: /mnt/d/Projects/MimirNL. Dependências: 104 e avaliações/revisões disponíveis. [Emenda0.2](../docs/benchmarks/v03/contrato-0.2.md), [plano](../docs/benchmarks/v03/fechamento-0.2.md). Tarefa preparada, não executada pela Task99. Preservar dirty/histórico e não acessar credenciais/.env/SSH/PEM/banco pessoal. Sem subagentes por esta especificação.

## Escopo

Preparar pacote sanitizado durável docs/benchmarks/v03/evidencias, replay offline e relatório final; obter revisão final independente sem autoaprovar release.

## Artefatos e revisão

Manifestos/hashes, contextos/respostas públicas permitidas, avaliações separadas, métricas e script replay; relatório105 e parecer final independente; pacote concreto de publicação. Revisão deve ser feita por revisor diferente do autor, com referências reais, APPROVE/CHANGES_REQUESTED e correções concretas; nenhum teste substitui aceite humano. Parecer pendente bloqueia etapa dependente.

## Checklist de aceite

- [ ] Dependências e hashes/revisões conferidos.
- [ ] Verificar integridade/reprodução/sanitização sem reasoning/transcripts/configuração privada; checks Linux/Windows pertinentes no código final, sem alegar CI ausente. Separar technical_complete de publish_pending; representatividade ampla/long-history/multicasoAG não demonstrados. Publicação e commit/push só com autorização específica; sem published fictício.
- [ ] Relatório com arquivos absolutos, diff, testes/checks pertinentes, limitações e actual_model_calls.
- [ ] Revisão independente registrada e pendências resolvidas antes da próxima fase.
- [ ] Nenhum commit/push/publicação fora da autorização específica.
