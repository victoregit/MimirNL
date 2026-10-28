# Fluxo contínuo por host

O runner `scripts/benchmarks/live-flow-probe.mjs` implementa seis posições
AB/BA/AB por host, com o corpus de seis fontes do commit
`166e3cf047b2078952e43dc8e9171e053e99e2ce`, pergunta, instrução e query da
Task66. A inclui as seis fontes uma vez. Cada B cria banco e projeto Git
próprios, registra seis memórias candidate/user sem ingestão e executa uma
busca real. Nenhuma seleção é pré-calculada, substituída por gold ou filtrada
por relevância esperada. Todos os resultados passam pela validação de
integridade; retorno vazio é mantido e ausências são registradas.

Setup e seed precedem t0. Para B, t0 vem antes de memory_search; para A,
antes da serialização das seis fontes. t1 vem após o retorno do transporte,
que inclui fechamento do processo e coletor. `end_to_end_ms = t1 - t0`
inclui busca, validação, serialização, gravação do contexto efetivo e transporte.
`retrieval_ms` é uma medição separada, nunca somada ao total. Fechamento do
Service e remoção da fixture ocorrem depois de t1. Setup/close são registrados
separadamente. O primeiro agent_message completo não representa TTFT.

O plano local precede todas as chamadas e fixa corpus/query/modelo solicitado,
ordem e limites. Os hashes efetivos e prompts de cada posição são gravados em
`run-context-N.json` imediatamente antes de sua chamada. O plano não afirma
conhecer seleções futuras. O limite global inclui setup e limpeza; uma posição
que esgote o prazo antes do transporte permanece not_run. Não há retry ou
fallback; são no máximo seis chamadas, 90 segundos por processo e dez minutos
globais, com o tempo restante passado ao transporte.

Codex usa o transporte aprovado paired-probe/coletor Task59–60, com modelo
solicitado gpt-6.1-sol, reasoning low e flags por invocação que desativam apps,
plugins e multi_agent. Mantém sandbox read-only e os demais controles. Não há
alteração de configuração global. Antigravity carrega dinamicamente o adaptador
Task76, exige MODEL gemini-3.8-flash-high e delega parsing/argumentos ao adaptador
revisado. Adaptador ausente falha antes de corpus/output/bancos/modelos. A API
`runFlow({host, out, transportImpl, clock, corpus, prepare, loadAdapter})` permite
injeções offline; `argsCodex(scratch)` exporta os argumentos lean.

A saída deve ser diretório novo sob /tmp (pais resolvidos contra symlinks).
Diretórios são privados 0700; arquivos exclusivos wx/0600. Corpus, plano,
contextos e respostas finais ficam apenas ali; response é removida antes de
persistir metadados. Não se grava raw transcript, stderr ou reasoning. Os
limites de bytes/linha/resposta e o kill do Codex são os do transporte existente.
Scratch e fixtures são removidos em finally. Evidências ficam para revisão de
qualidade e precisam ser removidas pelo operador após essa revisão.

Summary fornece n/min/max/mediana por condição, cobertura/exclusões por métrica
e pares elegíveis para B-A. Usage ausente e campos desconhecidos permanecem
null/unavailable; zero é preservado quando reportado. Não soma cache a input,
não deriva total a partir de contadores do AG, nem afirma semântica de subset
sem normalização comprovada pelo adaptador. Counters/provider_usage e razões de
ausência do adaptador são preservados. Não há percentuais, preços, custo ou
TTFT fabricados. Status de erro, timeout, ferramentas e incompletude vêm do
transporte. Modelo solicitado e identidade observada permanecem separados.
Qualidade fica pending independent review; diferenças de modelo/ambiente
impedem tratar os dois hosts como o mesmo modelo ou inferir causalidade geral.

Import e help são offline. Após revisão independente, o supervisor pode executar:

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/live-flow-probe.mjs --run --host codex --out /tmp/mimir-flow-codex-NOVO
```

O comando equivalente com `--host antigravity` só entra no fluxo após Codex e
seus gates de revisão. A implementação Task75 não executou nenhum modelo.
