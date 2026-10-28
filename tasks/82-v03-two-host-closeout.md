# Fluxo real Mimir — Codex e Antigravity

Data: 2026-10-27. Execuções autorizadas pelo usuário, na ordem Codex e depois Antigravity. São dois experimentos exploratórios por host, não uma comparação entre modelos equivalentes.

## O que foi executado

Em cada host: uma pergunta factual, três pares AB/BA/AB, seis processos novos e sequenciais, sem retries. A recebe os seis módulos documentais completos. B faz uma consulta real ao serviço do Mimir sobre um banco descartável contendo o mesmo conjunto e envia somente o resultado, sem repetir o contexto completo. A busca retornou `src/optimization/index.ts` em todas as posições B. Fontes fixadas no commit `166e3cf047b2078952e43dc8e9171e053e99e2ce`, sem respostas esperadas ou rubricas nos prompts.

Em ambos, o tempo contínuo começa antes da busca/serialização e termina depois do fechamento do transporte do modelo e coleta. A criação e o preenchimento do banco ficam separados, como preparação. Não é replay nem soma de latências antigas. Não houve acesso a banco pessoal, ingestão de repositório real, configuração global ou publicação.

## Medianas observadas

| Host e modelo solicitado           | Condição           |   n | Total reportado | Tempo contínuo | Busca local |
| ---------------------------------- | ------------------ | --: | --------------: | -------------: | ----------: |
| Codex enxuto, gpt-6.1-sol low      | Contexto completo  |   3 |          20.354 |         9,48 s |         N_A |
| Codex enxuto, gpt-6.1-sol low      | Seleção real Mimir |   3 |          14.180 |         8,99 s |     0,52 ms |
| Antigravity, gemini-3.8-flash-high | Contexto completo  |   3 |   17.030 nativo |        17,92 s |         N_A |
| Antigravity, gemini-3.8-flash-high | Seleção real Mimir |   3 |   10.290 nativo |        22,68 s |     0,55 ms |

Codex: redução da razão entre medianas de tokens totais de 30,33%. Antigravity: redução da razão entre medianas do contador nativo explícito `total_tokens` de 39,58%. Os totais AG estão em `provider_usage.counters`, não nas métricas normalizadas: `usage=null` porque a semântica de cache e pensamento ainda não foi confirmada. Nenhum total AG foi reconstruído por soma; os valores são os que o host reportou. Não equivalem a preços, faturamento ou uso normalizado comparável ao Codex.

O cache Codex foi mantido como subconjunto do input, sem soma adicional. AG reportou `cache_read_tokens=0` nas seis chamadas, preservado como contador nativo, sem generalizar sua semântica. `thinking_tokens` também não foi somado novamente ao total. Custos e TTFT permanecem indisponíveis.

## Interpretação e qualidade

A redução de contexto diminuiu os totais reportados nos dois experimentos. Isso não comprova economia geral em tarefas reais, relevância ampla, detecção de stale ou significância: há apenas uma pergunta conhecida e três pares por host.

Latência: no Codex, a diferença entre medianas foi menor com Mimir, mas a mediana dos deltas pareados foi +62,83 ms (dois pares ligeiramente mais lentos e um mais rápido). No AG, os três pares foram mais lentos com Mimir, mediana do delta +4,76 s. Não há demonstração de aceleração consistente nem causa específica para a diferença. A busca local levou menos de 3 ms em todas as posições B.

Codex: Task79 APPROVE confirmou seis respostas corretas nos três critérios factuais/citação e no limite de 120 palavras. A qualidade AG aguarda conferência do parecer Task81 no fechamento abaixo. O JSON AG não permite comprovar ausência de ferramentas; o teste usou sandbox, modo plan e instrução sem ferramentas. Não se afirma isolamento absoluto de configurações, sessões internas ou backend/snapshot dos hosts.

## Evidências e implementação

- Código e adaptador: Task77 APPROVE, 31 testes offline aprovados; nenhum código alterado após essa revisão.
- Codex: `/tmp/mimir-live-codex-task78-20261027`, relatório `tasks/78-v03-codex-live-flow-result.md` e revisão `tasks/79-v03-codex-live-quality-findings.md`.
- Antigravity: `/tmp/mimir-live-antigravity-task80-20261027`, relatório `tasks/80-v03-antigravity-live-flow-result.md` e revisão `tasks/81-v03-antigravity-live-quality-findings.md`.
- Diretórios de evidência 0700 e arquivos 0600. Respostas finais privadas, sem transcript bruto, stderr ou reasoning exportados. Bancos, repositórios sintéticos e scratches próprios foram removidos; a retenção interna de sessões do AG não foi certificada.
- Uma calibração mínima AG foi feita antes da implementação do adaptador. As tentativas de retomada do revisor não dispararam novos benchmarks. Sem commit, push ou merge.

## Fechamento das entregas

Task81 APPROVE concluiu a pendência AG: seis respostas corretas nos três critérios factuais/citação e no limite de 120 palavras. Junto à Task79, são 12/12 respostas aprovadas, 3/3 por condição em cada host. Nenhum código foi alterado depois da aprovação Task77. As medições foram mantidas mesmo quando o tempo piorou; não houve repetição para favorecer resultado.

A sessão CAO foi conferida no encerramento e não tem operadores auxiliares ativos ou em completed. As fixtures próprias de banco/repositório e scratches foram removidas; evidências privadas foram preservadas para reprodução. Isso não afirma remoção de histórico interno dos hosts. Nenhum commit, push, merge ou release foi realizado.

Resultado desta etapa: fluxo real por host implementado e revisado; redução observada dos totais reportados com qualidade preservada nesta única pergunta; latência sem ganho consistente. Corpus ampliado, casos de irrelevância/múltiplas fontes e avaliação confirmatória continuam como trabalho futuro, sem declarar a v0.3 completa.
