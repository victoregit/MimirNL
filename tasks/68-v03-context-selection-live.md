# Task68 — Execução exploratória contexto completo vs seleção Mimir

Autorização usuário: "ok vamos nessa nova forma" após explicação de substituir contexto completo por seleção, sem duplicação. Somente depois de Task67 APPROVE da versão final de Task66. Raiz /mnt/d/Projects/MimirNL, dirty preservado, sem commit/push/merge.

Executar uma vez o runner revisado scripts/benchmarks/context-selection-probe.mjs --run com Node24 /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node. Seis chamadas máximas AB/BA/AB, gpt-6.1-sol solicitado reasoninglow, seis fontes gitpin166e3cf, sem retries/fallbacks, mesmos limites90s/global10min. Outputprivado novo /tmp indicado pelo runner. Se falhar, registrar posições/falhas; não reexecutar automaticamente.

Conferir plano, hashes/bytes dos contextos, relatórios por run, usage e cobertura, itens retornados pelo Mimir, tempo/model metadata. Não declarar redução de qualidade por silêncio nem sucesso por completed; obter revisão independente Task69 das seis respostas e métricas sem novas chamadas. Registrar coordenação tasks/68-v03-context-selection-live-result.md e apresentar ao usuário medianas/pares/qualidade/limitações e cleanup. Não comparar percentuais deste novo desenho ao controle de redundância Task64 como se fossem mesma intervenção.
