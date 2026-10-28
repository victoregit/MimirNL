# Transporte Codex multicaso — Task87

Preparação para revisão independente, validada somente offline. `actual_model_calls=0` nesta tarefa. A Task86 aprovou o executor offline; esta bridge precisa de revisão própria e autorização operacional antes de qualquer piloto. Os nove casos continuam development/pending, o bundle continua `executable=false` e nenhum gold ou aceite foi alterado. Antigravity fica para outra etapa.

## Proposta pública

[piloto-codex-proposto.json](piloto-codex-proposto.json) propõe dois casos revision 1: `expanded-budget-envelope` (síntese de múltiplas fontes) e `expanded-production-p95-absent` (pergunta negativa sem evidência de medição). A escolha cobre comportamentos diferentes previstos no corpus; não usa ganhos, respostas ou métricas anteriores. Uma repetição por caso, braços completo/Mimir, ordem AB/BA, quatro posições. Não há estimativa monetária ou teto em reais/dólares: preço e faturamento são desconhecidos.

Bundle público SHA-256: `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`.
Plano público SHA-256: `95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5`.

O hash usa somente campos públicos canonicalizados, excluindo apenas o próprio `sha256`. Vincula digest do bundle, IDs/revisões, braços, ordem/offset, repetições, transporte/configuração, executável absoluto em release específica, limites e destino exclusivo. Não autentica quem escreveu o plano nem representa autorização humana. Alterar qualquer campo exige novo hash, nova revisão e autorização para o novo plano. O status permanece `proposed`, mesmo após execução eventual: o programa não fabrica accepted/gold/approved.

## Runtime e isolamento

`scripts/benchmarks/multicase-codex.mjs` importa somente schema/I/O públicos, primitivas públicas de planejamento/prompt/fixture e transporte novo. Não importa `live-flow-probe`, `paired-probe`, `context-selection-probe` nem loaders privados. A auditoria encontrou pergunta/corpus/IDs fixos nesses runners legados; eles permanecem fora do caminho novo. A única alteração no runner offline é exportar a preparação de fixture já aprovada.

O transporte dedicado deriva do loop JSONL aprovado de `paired-probe`, usa o coletor nativo `codex-usage-cli`/`codex-usage` e replica os argumentos lean de `live-flow-probe`, sem importar seus casos. Não aceita binário, argv, shell, env ou comando arbitrário do manifesto. `HOST` fixa executável da release `0.164.0-x86_64-unknown-linux-musl`, modelo solicitado `gpt-6.1-sol`, esforço low, ignore-user-config, ephemeral, read-only, skip-git e apps/plugins/multi_agent desativados por invocação. Nenhuma configuração global é escrita. O ambiente do subprocesso contém apenas PATH de sistema e HOME necessário ao host; não encaminha variáveis de CAO, Git, instruções ou opções de modelos.

Cada processo começa em scratch próprio vazio, com nome ordinal opaco, sem histórico. Prompt contém somente instrução, pergunta, fontes públicas com proveniência e `history:[]`. IDs/classes/consulta/ordem/revisão do caso não entram em argv/cwd/prompt/seed. Identificadores de fontes permanecem para citação. O diretório de evidência deve estar fora do checkout e ser novo sob `/tmp`; é 0700, arquivos wx/0600, e não há overwrite. O host recebe somente scratch, não o caminho do manifesto/bundle. O validador recusa AGENTS.md/AGENTS.override.md nos ancestrais do scratch sem ler esses arquivos. A disponibilidade e integridade da instalação do host devem ser verificadas operacionalmente antes do piloto; o sandbox read-only não impede por si só leitura de todos os arquivos do host. O transporte rejeita qualquer evento de ferramenta conhecido ou desconhecido; essa verificação não prova ausência de capacidades internas que o host não publique.

A recebe todo o pool. B usa Storage/Service reais em fixture Git/DB própria e descartável, candidate/user, consulta pública congelada e validação dos retornos contra o pool. Não há oracle, fallback nem acesso ao DB default. Retorno vazio continua vazio. O teto compara o envelope inteiro em bytes (até 32000), sem truncar. `output_bytes=64000` limita resposta capturada e interrompe excesso; não é limite de tokens faturáveis nem garante limite interno de geração. A instrução pede até 120 palavras, sem presumir que o modelo obedecerá.

Timer monotônico contínuo de B começa antes da única busca e termina depois do transporte/coleta. Setup e cleanup ficam fora; a busca não é somada duas vezes. O orçamento total inclui setup, I/O e cleanup. Antes de cada processo, verifica chamadas e tempo restante; timeout é o menor entre 90000 ms e o restante do total de 600000 ms. Não há retry; primeira falha/interrupção interrompe a sequência, preservando posições seguintes `not_run`. Timeout encerra com SIGKILL o grupo POSIX próprio, incluindo descendentes. Fixtures fecham/removem em finally; evidência permanece. Setup/busca SQLite são locais e não têm cancelamento preemptivo: um excesso nessa fase impede o próximo spawn, mas pode ultrapassar o orçamento de parede.

## Uso e evidência

`plan.json` e `result.json`, contextos públicos e respostas finais ficam no destino privado, sem transcripts, reasoning, stderr ou avaliação privada. `attempted_calls`/`actual_model_calls` contam tentativas de invocação live (podem incluir falha de spawn, não provam requisição aceita no servidor); `completed_calls` só conta resposta não vazia válida, exit 0, coletor completed e ausência verificável de eventos de ferramenta. Falhas não viram sucesso ou tokens zero. A simulação por API exige subprocesso controlado declarado e conserva `actual_model_calls=0`, `completed_calls=0`, `simulated_attempts`, `simulated_status`, `not_execution_proof=true` e `usage_status=synthetic-test`. Não há CLI para transformar fake em evidência real.

O coletor calcula total=input+output; cache é subconjunto de input, nunca adicionado novamente. Uso ausente é null/unavailable; uso observado em uma tentativa falha pode permanecer registrado com status da falha. Modelo solicitado e identidade observada estão separados; sem metadata pública, identidade unavailable e divergência null. Metadados contraditórios falham. Não há custo, TTFT, score, média de qualidade ou inferência geral de economia. Streams artificiais não medem modelo.

## Comandos e gates

Pré-requisitos: Node 24, `dist` compilado, bundle exportado pelo processo privado revisado e instalação Codex na localização exata do manifesto. O runtime público não recebe corpus privado/protocolo/gold. Reprodução da exportação segue [executor-multicaso.md](executor-multicaso.md), escolhendo destino novo; a Task87 gerou `/tmp/mimir-task87-public/bundle.json`.

Validação sem spawn nem artefatos (executada nesta tarefa):

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-codex-proposto.json
```

Comando futuro exato, **não executado**; depende de revisão independente favorável, aceite/permissões operacionais explícitos do usuário para o plano/hash e orçamento, confirmação da instalação/isolation e destino ainda inexistente:

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --run --bundle /tmp/mimir-task87-public/bundle.json --manifest /mnt/d/Projects/MimirNL/docs/benchmarks/v03/piloto-codex-proposto.json --authorize-plan 95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5
```

`--authorize-plan` é confirmação operacional explícita para o plano exato, não opção genérica force/skip-gates, nem prova criptográfica de aprovação ou substituto da revisão externa. Sem ela, o runner recusa antes de criar saída. A presente autorização do usuário cobre somente preparação e validação offline. O manifesto proposto sozinho nunca lança processos. Saída já existente exige outro plano/destino e hash; não se apaga evidência para reutilizar o comando.

A revisão independente avaliará bridge/manifesto/testes e limitações de isolamento antes de o usuário decidir o piloto real. Este piloto mínimo é exploratório; não aprova gold e não constitui benchmark aceito dos nove casos.
