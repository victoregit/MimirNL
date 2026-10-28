# Task54 — Entrega de corpus e metodologia

Estado: proposta pronta para revisão independente; sem autoaprovação, aceite ou execução real.

Base commitada: `166e3cf047b2078952e43dc8e9171e053e99e2ce`. Branch local criada: `docs/v03-corpus-methodology`. A alteração preexistente de `/mnt/d/Projects/MimirNL/AGENTS.md` e a tarefa não rastreada foram preservadas. Sem commit/push/merge/release.

## Artefatos absolutos

- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/casos.md`: três casos development reais de código fixado, intervalos inclusivos, SHA-256, perguntas, respostas candidatas, relevância e rubricas; array JSON documental compatível com validação estrutural. Revisão/gold pending, referências de revisores/aceite/permissões null.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/metodologia.md`: defaults propostos, comparação pareada, isolamento futuro, separação de gold, avaliação manual, métricas, limites e decisões pendentes.
- `/mnt/d/Projects/MimirNL/docs/v03-divisao-de-tarefas.md`: equipe principal assume corpus/metodologia; mantém conferência por outro revisor e aceite humano; corrige estado atual commitado sem reescrever relatórios históricos.
- `/mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md`: somente estado v0.3 e próximos passos pertinentes; evidência histórica v0.2 preservada e critérios reais abertos.
- `/mnt/d/Projects/MimirNL/tasks/54-v03-corpus-methodology-result.md`: este registro.

## Checks realizados

Runtime local já existente: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. `node` não estava no PATH inicial; nenhuma instalação/download necessário.

- JSON extraído do bloco de casos: parse e `validateCases` aprovados para os três casos.
- `planCases(cases, 3)`: rejeição esperada dos casos pendentes, sem fabricar aceite para gerar plano.
- Conferência local dos três trechos contra `git show SHA:caminho`: bytes exatos, intervalos e SHA-256 iguais aos declarados. É check do autor, não revisão independente.
- Links locais dos quatro documentos conferidos quanto à existência dos destinos; âncora do roadmap corrigida para o título com P0.
- Prettier local: write/check focados nos cinco artefatos entregues; `git diff --check` aprovado.
- Diff do roadmap inspecionado: somente linha de status v0.3, parágrafo v0.3 e próximo passo v0.3. Sem suíte ampla, pois não há mudanças executáveis.

## Limitações e retorno para revisão

Todos os casos são development e já expõem respostas documentais; não há holdout. Gold “privado” indica separação do avaliador, não ACL ou sigilo no repositório. Não enviar documento completo ao modelo. Histórico vazio proposto equivale ao baseline sem memória; não testa histórico longo. Uma unidade relevante por caso e k=3 proposto limitam Precision@3 a 1/3; corpus não inclui stale/distratores e não prova discriminação de ranking. O adaptador de métricas permanece parcial.

Próximo passo: revisor diferente do autor confere cada fonte/resposta/rubrica e a metodologia; resolver divergências antes de aceite humano. Contrato, defaults, permissões/modelo/orçamento, holdout, manifesto/seed/histórico e executor real continuam pendentes. Nenhuma chamada a modelo, rede, ingestão ou DB foi realizada nesta entrega; nenhum ganho medido ou publicação alegada.
