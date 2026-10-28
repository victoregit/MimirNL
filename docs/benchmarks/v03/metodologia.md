# Metodologia v0.3 — proposta revisão 1

> Atualização Task99 (2026-10-27): conteúdo abaixo preserva a proposta/perfil histórico 0.1. Para novo trabalho, consultar a [emenda0.2](contrato-0.2.md) e o [plano de fechamento](fechamento-0.2.md), pendentes de revisão Task100. Autorizações e tetos antigos não substituem a continuidade delimitada da sessão; accepted/validated legados não serão fabricados. Há execução exploratória A/B posterior nas [Tasks82](../../../tasks/82-v03-two-host-closeout.md), [90](../../../tasks/90-v03-multicase-codex-pilot-review-findings.md) e [96](../../../tasks/96-v03-layout-live-comparison-review-findings.md); ABC novo permanece pendente.

**Não acordada, não executada.** Depende do [contrato 0.1](contrato.md), dos [casos candidatos](casos.md), do aceite humano. A [Task55 aprovou a proposta documental](../../../tasks/55-v03-corpus-review-findings.md), após conferência independente das fontes, hashes e respostas candidatas; contrato e corpus continuam aguardando aceite. O [pacote de decisão](piloto-decisao.md) consolida escolhas e limites propostos. Esta entrega assume corpus/metodologia conforme Task54; não autoriza modelos, ingestão, banco, rede ou executor real.

## Escopo e validade

Base atual commitada: `166e3cf047b2078952e43dc8e9171e053e99e2ce`. Piloto com três tarefas pequenas de compreensão de código, todas development. Não há holdout: fontes e respostas foram inspecionadas pelo autor e estão documentadas. Não usar esse conjunto para alegar generalização, segurança ampla, economia real ou eficácia de memória. Antes de avaliação confirmatória, outra pessoa deve selecionar novo conjunto evaluation com gold restrito; ajustes no piloto não devem consumir esse holdout. Nenhuma melhoria do motor integra esta tarefa.

## Defaults propostos, sujeitos a acordo

- Usar os três casos, revisão 1, três repetições por caso e três cenários (27 observações potenciais, nenhuma produzida). Fixar IDs em ordem lexicográfica: pilot-approval, pilot-budget, pilot-failure. Seguir exatamente rotação e deslocamento por caso do [preflight](preflight.md): ABC/BCA/CAB, A sem_memoria, B com_mimir, C historico_completo. A rotação reduz efeito de posição; não é aleatorização.
- Fixar k=3 no manifesto. Cada caso propõe uma unidade relevante; Precision@3 terá teto 1/3 se apenas ela for retornada. Isso é denominador fixo, não defeito ou qualidade comprovada. Futuro corpus com distratores versionados exigirá revisão dos casos antes de medir discriminação de ranking.
- Contexto básico idêntico: pergunta e acesso apenas aos trechos autorizados para aquele caso, preservando IDs/commit/hash. Todos podem consultar as mesmas fontes de trabalho, sob mesmas ferramentas e orçamento. O piloto mede eventual redundância/sobrecarga do contexto; não cria vantagem artificial ocultando fontes dos baselines.
- Propor histórico vazio explícito, com artefato UTF-8 de zero bytes (hash a calcular no congelamento), sem conversas inventadas. Assim historico_completo é controle equivalente a sem_memoria neste piloto, não teste de histórico longo. Para testar histórico útil, construir e revisar histórico sanitizado anterior às tarefas e revisar corpus/manifesto; nunca inserir respostas preparadas.
- Propor seed Mimir exclusivamente com os trechos fixados, sem gold, perguntas, rubricas, notas ou resultados. Preparação, segmentação e mapeamento para unidades canônicas serão versionados e conferidos. Não há seed nem snapshot criados agora.
- Propor cache frio e processo/sessão novos em cada cenário/repetição. Registrar cache efetivamente observado; cache do provedor não controlável deve ser declarado, sem presumir equivalência perfeita.

Esses valores são propostas, não decisões acordadas. Modelo/provedor/versão/parâmetros/seed suportada, tokenizer, ferramentas, orçamento total de contexto/saída/chamadas/tempo/custo e moeda ficam **pendentes**, sem defaults monetários ou autorização implícita.

## Gates antes de execução

1. Acordar contrato e defaults ou registrar suas substituições. A conferência independente de fontes/respostas foi concluída na Task55; vincular sua evidência e obter aceite humano referenciado, sem autoaprovação. Alterações posteriores de conteúdo exigem nova conferência.
2. Registrar autorização com responsável, operações, caminhos absolutos, dados permitidos de saída, destino/provedor, limites e validade. Autorização existente para documentação não autoriza envio de fontes. Não acessar banco pessoal.
3. Congelar manifesto completo do contrato: revisões/hashes de corpus, engine/executor, ambiente, raízes locais, histórico, seed, política de cache/truncamento, ordem, k, modelo, ferramentas, orçamento e preço/data ou indisponibilidade justificada. Um plano preflight não substitui manifesto e continua não executável.
4. Implementar e revisar executor em tarefa separada. Preparar cópias descartáveis isoladas, reset antes de cada cenário/repetição; baselines sem estado Mimir. Verificar hashes iniciais/finais e ausência de acesso ao gold/resultados anteriores. Reset nunca atua em banco real.
5. Preparar contexto por allowlist em processo separado do avaliador. Não entregar `casos.md` inteiro ou fixture privada ao modelo; somente tarefa e fontes autorizadas e intervenção de cenário. Memória de uma rodada não alimenta outra. Registrar bytes/contexto efetivamente enviados e ferramentas/retornos permitidos.

## Observações e avaliação

Preservar um registro por manifesto/caso/revisão/cenário/repetição, status e evidências locais de contexto, resposta, recuperação ordenada, citações, trace, horários e uso por chamada. Não confundir completed com sucesso. Falha, timeout, denied, infeasible e not_run permanecem explícitos; desconhecido não vira zero. Truncamento registra regra, bytes/tokens omitidos e hashes antes/depois; estrato truncado fica fora da comparação equivalente. Histórico que não caiba sem alterar a definição acordada é infeasible.

Avaliador independente aplica os dois itens binários e pesos dos casos às respostas e citações; justificar cada nota nas fontes, registrar identidade e evidência e resolver divergências com mantenedor. Uma resposta de modelo não vira gold. Conjunto relevante e rótulos current/stale/unknown exigem conferência; idade ou commit diferente isoladamente não prova obsolescência. Este corpus fixa uma revisão e não contém exemplo obsoleto: não demonstra detecção de stale.

Seguir denominadores do contrato. Precisão/recall exigem relevância validada; precisão de fonte exige afirmação e citação sustentadas. Medir latência de recuperação e duração total separadamente, sem somá-las. Tokens reais devem vir do uso por chamada ou tokenizer identificado, incluindo entrada/saída, contexto, ferramentas e cache observado; o estimador de bytes do motor não é tokenizador. Custo estimado exige tarifas, origem/data/versão/moeda/unidade; indisponível fica marcado. Nada disso foi medido nesta entrega.

O [adaptador offline de métricas](metricas.md) é parcial: requer casos accepted/validated, rejeita splits mistos e só aceita recuperação de unidades declaradas no caso. Não calcula precisão de afirmações/citações, tokens, custos, nem agregação macro/micro de retrieval. Não forçar o corpus a simular essas capacidades. Novas unidades/distratores ou métricas exigem extensão versionada e revisão separada; nunca fabricar aceites para alimentar o adaptador.

## Relatório futuro e pendências

Reportar os três cenários, cobertura, todas as falhas e exclusões, sucessos/insucessos, latências e uso disponíveis; comparar pares completos não truncados por caso/revisão/repetição. Mostrar diferenças absolutas Mimir menos baseline e percentuais só com baseline positivo; mediana, mínimo, máximo e n. Separar development/evaluation e estratos truncados. Se calcular retrieval macro (casos com peso igual) ou micro (somas dos numeradores/denominadores), definir e implementar antes da execução, sem atribuir isso ao adaptador atual. Não ocultar casos em que Mimir piora.

Pendentes: acordo do contrato/defaults; vinculação da conferência independente concluída na Task55; aceite humano; novo holdout; histórico representativo se desejado; seed/manifesto/artefatos congelados; modelo/orçamento/permissões; executor e coleta revisados; execuções e relatório. Sem resultado real, sem afirmação de release/publicação e sem autorização de commit/push/merge.

## Proposta de ampliação offline — Task83

Seis casos development adicionais em [casos-ampliados.md](casos-ampliados.md) e [corpus-ampliado.json](corpus-ampliado.json), total proposto nove. Revisão independente Task84 e aceite pendentes; esta ampliação não altera os três casos originais nem autoriza execução.
