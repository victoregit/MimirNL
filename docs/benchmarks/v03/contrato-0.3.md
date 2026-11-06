# Transição documental 0.3 — evidência histórica e checkout corrente

Esta transição, aprovada na [Task119](../../../tasks/119-task105-remediation-plan-review-findings.md), preserva o contrato semântico 0.2 e a política Core108 `b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`. Não cria versão de pacote, novo epoch, autorização live ou alteração de casos, pools, consultas, parâmetros ou avaliações privadas.

Os manifestos históricos em `evidencias/task103/public-plan` se referem aos bytes preservados em [task103-executed-snapshot.tar](evidencias/task103-executed-snapshot.tar), com [inventário por membro](evidencias/task103-executed-snapshot.sha256). O tar contém 350 arquivos públicos regulares: os 318 da baseline118, LICENSE e especificações/pareceres necessários. Seu SHA256 é `f37365350929052e21eee560f9de13d35e93ff563e819a19579b90efb1abec80`. Inclui o launcher113 original `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38` apenas como evidência; não execute o launcher arquivado.

O checkout corrente contém correções de portabilidade e formatação. Não corresponde ao inventário de código executado104. A validação dos manifestos históricos deve usar o snapshot extraído; não recalcular seus code hashes para atribuir execução aos novos bytes. JSONs correntes conservam o conteúdo canônico; hashes de bytes históricos continuam associados aos membros do tar e aos pareceres originais. Dependências documentadas no snapshot permanecem históricas. Nenhum parecer anterior foi reescrito.

A implementação corrente permite caminhos locais nativos nos utilitários offline, mantendo estrita a gramática de paths portáteis de repositório e a recusa de traversal, componentes sensíveis e symlinks. O transporte real mantém a exigência de host Linux; a cobertura Windows usa apenas injeção sintética. Modos POSIX não demonstram proteção por ACL no Windows nem no mount WSL.

Estado de fechamento e limitações: [fechamento corrente](fechamento-0.3.md). Todo código alterado segue pendente da revisão independente111.
