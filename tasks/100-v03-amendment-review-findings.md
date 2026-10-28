# Task100 — Parecer de Revisão Independente da Emenda Contratual v0.3

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Alvo:** Entrega documental da [Task 99](file:///mnt/d/Projects/MimirNL/tasks/99-v03-contract-amendment-result.md) ([contrato-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md), [fechamento-0.2.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.2.md), atualizações documentais e especificações das Tasks 101–105).  
**Status da auditoria:** actual_model_calls = 0; revisão analítica documental e arquitetural offline estrita.

---

## 1. Integridade de Governança e Preservação Histórica

A entrega da Task 99 cumpriu com exatidão as salvaguardas de versionamento e governança:
- **Versionamento Explícito:** A [emenda 0.2](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md) foi estabelecida em arquivo separado, sem apagar nem alterar o teor normativo da proposta histórica [contrato 0.1](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md). Os documentos legados receberam apenas notas informativas de contextualização.
- **Autorização Real:** A instrução do usuário ("continuar até finalização da 0.3", mantendo Mimir+cache) está registrada com exatidão factual, sem fabricação de assinaturas, identidades humanas ou termos fictícios.
- **Separação de Perfis:** O novo perfil `technical_reviewed-v1` isola a conformidade técnica verificável de aceites humanos formais (`human_acceptance_ref: null`), sem contaminação das tags legadas `accepted`/`validated`. Os validadores 0.1 permanecem preservados e incompatíveis por design com o formato 0.2.

---

## 2. Rigor Metodológico e Desenho Experimental ABC

O desenho formulado para a avaliação experimental elimina riscos de viés metodológico:
- **Paridade de Cenários:** Os três cenários contratuais compartilham instruções básicas, modelo solicitado, ausência de ferramentas de modelo (`tools: []`), limite de 120 palavras e orçamentos operacionais. O braço A (`sem_memoria`) e o braço C (`historico_completo`, com artefato vazio de 0 bytes e hash SHA-256 fixado) servem como controles equivalentes, afastando qualquer pretensão não comprovada de avaliar histórico longo nesta fase. O braço B (`com_mimir`) executa uma busca local autêntica no snapshot congelado, com deduplicação declarada e sem subtração de fontes básicas nos baselines.
- **Isolamento de Dados e Gold:** Os snapshots e seeds contêm unicamente fontes públicas do repositório e suas proveniências, eliminando metadados de casos, perguntas, rubricas ou respostas do runtime. Cada execução usará banco SQLite descartável com verificação de hashes inicial/final.
- **Divisão Dev/Eval:** O conjunto de 12 casos separa rigidamente 9 casos de development (destinados ao tuning do core e ablação) de 3 casos de evaluation (holdout intocado), prevenindo overfitting e deixando claro que 12 casos não garantem representatividade estatística ampla para produção.

---

## 3. Limites Operacionais e Honestidade de Métricas

A emenda corrige premissas obsoletas por restrições operacionais verificáveis:
- **Orçamento de Execução da Fase 104:** Delimitado a no máximo 54 tentativas sequenciais no Codex (27 dev + 27 eval), com concorrência unitária, sem retries, sem warmup e com 0 chamadas novas para Antigravity (aproveitando as evidências consolidadas das Tasks 80 e 81).
- **Envelopes e Timeouts:** Adota limites verificáveis de 32.000 bytes UTF-8 para o contexto de aplicação e 64.000 bytes para a captura da resposta (alinhados aos ~14–15k tokens reais observados na CLI), com timeouts de 90s por chamada, 120s por run e 120 minutos globais.
- **Transparência de Métricas:** Custo financeiro faturável, TTFT e modelo efetivo são tratados como `unavailable` na ausência de telemetria da CLI, sem atribuição de valores nulos arbitrários a zero. O cache de ambiente é mantido sob observação real, sem simulação artificial de cold reset.
- **Métricas Algorítmicas:** Denominadores fixos para Precision@3, tratamento explícito de Recall com $R=0$ como `N_A`, mensuração de source accuracy ligando afirmações fáticas às fontes citadas e tratamento formal de memórias stale/unknown.

---

## 4. Estrutura do Plano Finita e Critérios do Roadmap

- **Sequência de Implementação (Tasks 101–105):** As especificações preparadas estabelecem dependências sequenciais claras e portões de revisão independente antes de cada transição executável.
- **Roadmap Íntegro:** A seção [v0.3 do ROADMAP](file:///mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md#v030--useful-context-not-just-more-context-p0) mantém todos os seus 7 checkboxes abertos (`[ ]`), refletindo com honestidade que a versão permanece incompleta.
- **Distinção de Fechamento:** Separa formalmente `technical_complete` (conclusão técnica dos testes e evidências após Task 105) de `publish_pending` (publicação de release e commit/push, que dependem estritamente de decisão e autorização específica do mantenedor).
- **Consistência de Documentação:** Teste automatizado confirmou a integridade de todos os links relativos entre documentos, e a formatação atende integralmente ao `git diff --check`.

---

## 5. Conclusão e Próximo Passo Autorizado

A entrega da Task 99 reconcilia integralmente a documentação normativa com os objetivos experimentais delimitados da v0.3, preservando a verdade factual e a segurança do repositório.

- **Veredito:** **APPROVE**
- **Próxima tarefa autorizada:** [Task 101 — Corpus e métricas 0.2](file:///mnt/d/Projects/MimirNL/tasks/101-v03-corpus-metrics.md).
