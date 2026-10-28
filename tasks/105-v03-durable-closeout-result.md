# Task105 — Evidência durável e fechamento técnico

Data: 2026-10-27. Estado: **technical_complete pending_review111 / publish_pending**. A revisão independente111 de todo código alterado é obrigatória antes do fechamento definitivo; não há autoaprovação de release. `actual_model_calls: 0` na consolidação120/105; **54 chamadas históricas104**, sem nova execução live, epoch ou retuning.

## Pacote entregue

Implementação, diff, inventários, logs e limitações completos em [resultado120](120-task105-portability-closeout-result.md). Caminhos absolutos principais:

- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103-executed-snapshot.tar` e `.sha256`: snapshot público préalterações,350 membros verificados,318/318 baseline118 e27/27 arquivos dos dois manifestos históricos. SHA256 do tar `f37365350929052e21eee560f9de13d35e93ff563e819a19579b90efb1abec80`.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task104/executed-results.tar`: results+54positions originais byteidênticos, SHA256 `11ac0ae6536f6471c939f3ade5e01d490db3ee0f53775d97a4b49c28a66693f7`; inventário histórico `SHA256.json`. JSONs correntes formatados equivalentes e `formatted-SHA256.json` separados dos bytes executados.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task104/README.md`: reprodução offline pelo snapshot, sem novos modos live. `metrics-summary.json`: resumo público atribuído ao parecer110; inputs de avaliação permanecem privados.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.3.md` e `fechamento-0.3.md`: transição corrente/histórica. Roadmap e divisão de tarefas atualizados sem apagar histórico.
- `/mnt/d/Projects/MimirNL/tasks/120-checks/`: comandos, resultados iniciais/finais, diff contra snapshot e hashes de arquivos absolutos.

Execução104 associada ao snapshot histórico com manifesto canônico `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`, não ao checkout corrigido. Launcher113 original arquivado, sem execução nesta consolidação. Código corrente diverge legitimamente do inventário histórico; não foram recalculados hashes antigos para atribuir execução a bytes novos. Nenhum parecer histórico ou dependência congelada foi reescrito.

## Validação e integridade

Replay extraído: **54 sintéticas /18buscas /0calls /stopped=false**, manifesto offline histórico, sem holdout real. Tars auditados e verificados membro a membro;57JSONs103 e55JSONs104 canonicamente equivalentes às visões correntes. Não publicados autorização, coordenador, gold, rubricas, reasoning, transcripts, stderr ou paths privados no pacote104. Modos de arquivo no mount WSL não constituem garantia de privacidade/imutabilidade; hashes e política de preservação identificam os bytes arquivados.

Node24.22.1 nativo em ambas as plataformas, cópias isoladas118 e Git portátil Windows com PATH por processo. Typecheck, lint, build, schemas e Prettier global: **exit0 Linux e Windows**. Suítes completas finais: Linux146 reportados,145pass/0fail/1skip; Windows155 reportados,145pass/0fail/10skip. Windows executou suítes antes abortadas; nove skips limitados a criação symlink EPERM e um teste exclusivo POSIX. Linux preserva negativas reais de symlink e tem um skip exclusivo Windows. Core1086/6 nas duas plataformas. Todos os arquivos src/dist, package/lock, AGENTS e CI permanecem byteidênticos à baseline; policy `b834e4f4...` congelada. Sem ignores novos, skips amplos, alterações de gold/pools/query/tuning ou dependências novas. Logs negativos iniciais preservados; sem alegação de CI remoto ou novo aceite host.

## Resultados e limites

[Execução104](104-v03-bounded-evaluation-result.md) e [parecer110](110-v03-answer-quality-review-findings.md) permanecem referências históricas. Sucesso/source_accuracy54/54 igualmente em A/B/C: delta de qualidade B−A0. **B consumiu +7.664 tokens de entrada (+2,93%)**, sem economia demonstrada. Cache ambiente positivo54/54, sem cold subset e sem atribuição causal. Busca B média21,58ms, sem redução robusta de latência total. HistoryC0 e A=C18 envelopes impedem concluir sobre histórico longo/multiturno. Modelo efetivo, custo, TTFT e latência exclusiva do modelo unavailable. Repetições evaluation não equivalem a casos independentes; representatividade ampla/generalização não demonstradas.

Dados privados110 não foram reabertos ou reconstruídos. Aprovação técnica110 e plano119 não representam aceite humano do release. O próximo gate é **review111** sobre o diff inteiro. Nenhum commit, push, publicação, delegação ou modelo real foi realizado nesta consolidação; publicação continua pendente de autorização específica.
