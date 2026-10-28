# Diagnóstico de cache e layout opcional

Task91 implementa análise offline, sem habilitar qualquer opção de cache no CLI.
A [documentação oficial de prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), consultada pelo supervisor em 2026-10-27, descreve reutilização de prefixos coincidentes e condições que variam por modelo e roteamento. Parâmetros documentados para API não são presumidos disponíveis no Codex CLI. Não há threshold universal adotado, padding, warmup pago ou cache local de respostas.

O leitor público explícito não importa casos privados. Exemplo offline:

```bash
node scripts/benchmarks/cache-diagnostic.mjs --result /tmp/mimir-task87-pilot-proposed/result.json --out /tmp/NOVO-DIRETORIO
```

Sem --out, imprime JSON com campos numéricos permitidos. Diretórios novos são 0700, arquivos 0600, sem overwrite ou symlinks. Import/help não leem evidência. Schema de entrada codex-multicase-result-1; saída cache-diagnostic-1. Erros estruturais recusam o documento; ausências/inconsistências de uso ficam por posição. Uso bruto numérico fica preservado mesmo em falhas. Cache é subset: uncached=input-cache, total=input+output, ratio=cache/input. Input zero mantém zeros e razão zero_input; ratio null. Uso inválido resulta em derivados null. Comparações exigem sucesso, exit0, ausência de ferramentas detectadas/divergência e uso válido. Synthetic nunca é medição. Cobertura parcial mantém aggregate=null, sem somar faltantes silenciosamente.

O manifesto codex-multicase-plan-1 e promptFor permanecem congelados. O schema opcional codex-multicase-plan-2 exige prompt_layout exatamente igual a STABLE_LAYOUT exportado por stable-prompt.mjs e novo SHA do plano. O executor escolhe efetivamente o layout pelo schema validado. Não há override independente do manifesto. Confirmação operacional continua vinculada ao hash exato, sem autoaprovação.

V2 serializa instrução fixa, histórico vazio, fontes públicas na ordem selecionada e pergunta por último. A projeção pública/proveniência é a mesma de v1. O prefixo estável contém apenas instrução e histórico; métricas são bytes UTF-8 e SHA256 do que a aplicação envia, sem estimar tokenizer nem conteúdo interno do host. A instrução fica no primeiro campo; não há IDs, classes, queries, timestamps ou status no prefixo.

Task89 já reporta hit: 12032 tokens em cada slot. A origem específica desses tokens, overhead fixo, custo, TTFT e identidade efetiva permanecem unavailable. Uma reorganização curta pode não aumentar cache.

A evidência v2 em /tmp/mimir-task91-stable-offline é somente synthetic, manifesto proposed e bundle executable=false. Não autoriza execução. Comparação futura requer autorização e revisão Task92, mesmos modelo solicitado/configuração, casos, fontes/queries/seleção, ordem, repetições e limites; versões e hashes explícitos. Registrar ordem e condições ambientais: cache pode estar quente, sem reset ou cold garantido. Nenhum ganho de tokens, latência ou custo é alegado antes de medição.
