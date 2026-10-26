# Task50 — Fundação offline do executor v0.3

## Autorização e escopo

Usuário perguntou 'ok podemos avançar?' após divisão/contrato. Implementar uma primeira entrega pequena e revisável: validação local de casos e planejamento da matriz, não executor real nem integração com modelos. Branch feat/v03-benchmark-preflight a partir93959dd, AGENTS.mdpreexistente preservado. Contrato continua proposta: implementação é protótipo offline, não aprova corpus/decisões pendentes nem roda avaliações. Não editar casos.md/metodologia.md do amigo ou motor/core/DB/CI/versão/dependências. Não commit/push/model calls/hosts/config/real ingestion/network datasets.

## Ler

/mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md
/mnt/d/Projects/MimirNL/docs/v03-divisao-de-tarefas.md
/mnt/d/Projects/MimirNL/test/benchmark.mjs e organização testes, package.json. Runtime já instalado Node24.22.1. Nenhum preço/API novo precisa ser pesquisado, usar Nodebuiltins.

## Entrega mínima

Criar módulo(s) em /mnt/d/Projects/MimirNL/scripts/benchmarks/ e testes /mnt/d/Projects/MimirNL/test/benchmark-preflight.test.mjs, documentação curta /mnt/d/Projects/MimirNL/docs/benchmarks/v03/preflight.md. Não ampliar contrato/schemasistema. CLI manual Node para validar um arquivoJSONlocal de casos ou preparar plano offline com destino JSONexplicitamente dado (novo/exclusivo, sem sobrescrever), ajuda/erros legíveis e exitnãozero para inválidos. Pode expor funções importáveis para testar. Só ler arquivos explicitamente fornecidos, sem varrer repo/outrosdiretórios nem emitir conteúdo privado em diagnósticos.

Validação de CASOS baseada contrato0.1: campos/tipos/enum obrigatórios, contract_version suportada, SHA40/hash64, refs de sources/units únicas+consistentes, relativepaths multiplataforma sem absolutos/drive/UNC/backslashescape/../NUL, intervalos positivos/ordenados, hashUTF8exato do excerpt. Model_context só task+allowed_source_ids, referências existentes/únicas; separar evaluation_private. Referênciaouro/reviewaccepted requer revisor diferenteauthor, revisãoCodex/aceite refs/permission não nulas, conjuntosrel relevantesexistentes, rubricIDsunique/pesospositivos. Rejeitar valores adicionais em objetos de caso com potencialleak (unknownkeys estritamente). Distinguir validação estrutural de execução elegível; modo validate pode aceitar pending/illustrative conformeestrutura (exemplo contrato deve validar); plano só casos nonillustrative/accepted/goldvalidated e refs completos, mas nunca afirma que hashes/fontes/permission de fato verificados por ferramenta (callerprovenance apenas). Não ler Git/source files nesta etapa. IDsduplicados/revisões ambiguous no batch rejeitar.

Planner deterministicamente produz 3cenáriossem_memoria/com_mimir/historico_completo por caso e repetição, ordemABC/BCA/CAB balanceada, mesmoindicepareado e fontesfixadas. Opção repsinteiro1..100com bound total (ex1000runs) e rejeitar inválidos. Não escolher modelo/k/budget parausuário; plano inclui status planned/not_run, decisõespendentes/model/budgetnull, 'executable=false' e razões claras de que ainda requer manifestoaprovado/casosverificados/adapters, sem mascarar como benchmark. Não preparar contextos/gold/seed/historico nem abrir/criarDB nesta entrega. Plano público gerado por allowlist sóIDs/caserevision/scenario/repetition/sourcecommit/ordem, sem expected_answer/rubric/notes/source.excerpt/modeltask/humanrefs/rawpaths/content. Casoarquivooriginal permaneceprivado, não copiarouro a saída/stdout. Read-only por default e escrita JSONnewonly explícita do plano. Module import sem sideeffects.

## Testes e limites

Fixtures sintéticas no teste, não reutilizar ouro real do amigo. Testes significado: exemploJSONcontrato validaestrutura mas não pode planejar; casoacceptedfictionalfixture gera matriz+balance/IDsrevisõespareados, ausência de ouro/camposnãoallowlisted; entradasmalformadas/refsunknown/duplicadas/unknownkeys/path escapes/hasherrado/NaN∞funcional/separaçãoacceptedref faltante; repsbound/limitetotal; CLI actual temporaryJSONvalid/invalid exit+privacy/newoutputcollision keeps bytes/nooverwrite. Sem afirmar fontes reais ou execução factual.

Corrigir SOMENTE bugeditorial no contrato: tabela métricas tem barras| literais semescape quebrando Markdown; usar cardinalidade plain count()/texto equivalente sem alterarfórmulas/semântica. Documentar esta alteração e não declararcontratoaprovado.

Checks: testesfocused+fullnpmtestseadequado implementação nova, node--check, pinnedPrettierfocused, gitdiffcheck. Não repetirLinuxWindowsmatrizes/hostacceptance nestaentrega offline; CIposterior cobreplataformas. Não schemascheck/packagebenchmark irrelevant unless appchanges. Escrever resultado /mnt/d/Projects/MimirNL/tasks/50-v03-offline-benchmark-preflight-result.md com exatosarquivos/comandos/outcomes/limitações. Código novo deve ser revisto independentemente antesconclusão; não selfapproval. Callback supervisor.
