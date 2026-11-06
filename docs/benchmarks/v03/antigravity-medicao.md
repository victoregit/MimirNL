# Adaptador Antigravity

Preparação Task76, pendente de revisão Task77. Exporta `MODEL` e `transport({prompt,scratch,timeoutMs,clock})` no contrato Task75. Importação pura; testes injetam spawn e nunca executam agy. Node absoluto: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`.

## Única calibração autorizada

Uma chamada nativa mínima, sem corpus, fontes ou benchmark; sem retry/fallback. Flags confirmadas pelo help local: modelo `gemini-3.8-flash-high`, effort high, sandbox, mode plan, disable-slash-commands, output-format json, print-timeout 60s, log-file novo, print. Diretório descartável privado fora do repo, sem associação explícita a projeto real. Não foi necessário criar projeto. Prazo externo 75s. Exit 0, sem timeout, duração externa 5982.10ms. Não houve nova execução usando o adaptador.

Schema observado: objeto com `conversation_id:string`, `status:string`, `response:string`, `duration_seconds:number`, `num_turns:number`, `usage:object`. Status observado `SUCCESS`. Contadores inteiros reportados: input_tokens=7588, output_tokens=114, thinking_tokens=113, cache_read_tokens=0, total_tokens=7702. Estes são contadores nativos, não comprovação de billing/backend ou semântica de token. Não inferimos subset de cache nem soma de total; `usage=null`, razão `native_counter_semantics_unconfirmed`. `provider_usage` retém apenas nomes permitidos e inteiros seguros não negativos, com fonte e semântica não confirmada. Campos ausentes/inválidos são omitidos, nunca convertidos para zero. Total explícito é preservado apenas como contador nativo, não métrica normalizada.

## Limites e privacidade

JSON final não oferece eventos de ferramentas: `tools_detected=null`, razão explícita. Não há prova de ausência de ferramentas. TTFT, custo e backend observado indisponíveis. `first_agent_message_completed_ms` observa o JSON completo no fechamento do processo, não primeiro token. Tempo monotônico inicia antes de spawn e termina em close. Status desconhecido permanece incomplete; saída malformada falha fechada. Exit/signal/timeout e contadores parciais de envelope válido são preservados, sem resposta em falhas.

Prompt limitado a 1MiB, stdout/stderr a 1MiB cada, resposta a 256KiB. Não há stdin; prompt segue como argumento sem shell. Timeout máximo 90s mata grupo do subprocesso com SIGKILL (fallback no filho), sem retries. Stderr é apenas contado e descartado; erros retornados são códigos fixos. Logs recebem caminho novo explícito no scratch. Caller deve fornecer scratch privado 0700, persistir resposta somente em arquivo privado 0600 e removê-la da metadata. Retenção interna de sessões/projetos/logs pelo CLI pode existir; isolamento absoluto não foi demonstrado. Nenhuma leitura de logs/config/auth preexistentes.

Evidência bruta própria da calibração permanece somente no scratch privado 0700, stdout/stderr 0600; não exportada para o repo. A calibração usou subprocess direto, antes de escrever o adaptador, como autorizado. Não repetir a chamada para verificar mudanças de código.

Próximos gates: revisão Task77 do código e semântica conservadora; Codex Task75 executado e revisado; somente depois autorização Task80 para eventual comparação de seis chamadas. Hosts/modelos diferentes exigem resultados separados. Nenhuma comparação ou economia foi medida nesta task.
