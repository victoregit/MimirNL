# Mimir NL — Relatório de implementação do núcleo v0.1

**Data:** 24 de outubro de 2026  
**Repositório do núcleo:** `/mnt/d/Projects/MimirNL`  
**Website separado:** `/mnt/d/Projects/Mimir-web`

## 1. Resultado da intervenção

Foi criada a primeira implementação persistente e testável do núcleo do Mimir NL. O sistema permite armazenar, recuperar e organizar memórias por projeto, importar projetos Git locais mediante autorização explícita e registrar aprendizado por observações e feedback determinístico.

A implementação é local-first e não exige modelos, chaves de API, embeddings ou serviços externos para funcionar. Persistência, recuperação, ingestão, otimização de contexto e aprendizado têm responsabilidades separadas.

As etapas A–E foram implementadas e os cenários automatizados de aceitação passaram. A revisão independente de código permanece pendente: o serviço do revisor retornou **“Individual quota reached”** antes de executar a análise. Os resultados automatizados não constituem aprovação de revisão.

## 2. Separação entre website e cérebro

Antes da implementação do núcleo, o website foi transferido do `MimirNL` para o repositório separado `Mimir-web`, incluindo código Next.js, configurações, testes, dependências e arquivos gerados. Os READMEs foram ajustados para explicar a função de cada repositório e seus históricos Git foram preservados.

Durante a implementação do núcleo, o `Mimir-web` não foi alterado. Não foram realizados commits, pushes, publicação no GitHub, publicação no npm ou implantação de serviços. As configurações dos aplicativos Codex e Antigravity não foram modificadas.

## 3. Stack e arquitetura

| Componente              | Escolha implementada                                        |
| ----------------------- | ----------------------------------------------------------- |
| Linguagem               | TypeScript com verificações estritas                        |
| Runtime suportado       | Node.js `>=24.22.1 <25`                                     |
| Runtime validado no WSL | Node.js 24.22.1, npm 11.19.1                                |
| Banco validado          | SQLite 3.53.4 via `node:sqlite`                             |
| Persistência            | WAL, migrações transacionais, índices e chaves estrangeiras |
| Recuperação textual     | SQLite FTS5 com ranking BM25                                |
| Validação de entradas   | Zod 4.6.7                                                   |
| MCP                     | SDK oficial v2, servidor e cliente 2.4.0                    |
| Compilador              | TypeScript 5.9.3                                            |
| Formatação              | Prettier 3.6.2                                              |

CLI e MCP utilizam os mesmos serviços internos e podem acessar o mesmo banco persistente. O servidor MCP utiliza transporte stdio; Streamable HTTP não foi implementado nesta versão.

O banco fica, por padrão, no diretório de dados do usuário, separado dos repositórios analisados. Há configuração de caminho explícito, controle de permissões POSIX e prevenção de localização do banco dentro de um projeto registrado. No Windows, as ACLs precisam ser configuradas pelo usuário.

O plano incremental e as decisões arquiteturais estão registrados em [docs/implementation-plan.md](docs/implementation-plan.md) e [docs/architecture.md](docs/architecture.md).

## 4. Funcionalidades entregues

### Etapa A — Fundação e persistência

- Pacote `mimir-nl` v0.1.0, biblioteca pública e executável `mimir`.
- Memórias com tipos explícitos, escopo, identidade estável, conteúdo, origem, fontes, datas, hash e versão.
- Estados `candidate`, `verified`, `deprecated` e `rejected`.
- Histórico de versões, relações e feedback.
- Deduplicação por escopo/projeto e operações transacionais.
- Persistência após reinício e coordenação de escritores concorrentes.
- Recusa de versões futuras de esquema sem aplicar migrações indevidas.

### Etapa B — Recuperação e contexto

- Busca textual FTS5/BM25 e recuperação por ID.
- Filtros por projeto, tipo, estado e escopo.
- Isolamento entre projetos, inclusive em consultas por ID, histórico, estatísticas e relações.
- Inclusão de conhecimento global somente mediante opção explícita e regras de compartilhamento.
- Limites de resultados, deduplicação e orçamento de contexto incluindo formatação e proveniência.
- Resposta vazia quando não há correspondência relevante.
- Registro de uso, fontes utilizadas, tempo de consulta e estimativa conservadora do contexto retornado.
- Interfaces de extensão para recuperação futura, sem dependência obrigatória de embeddings.

O orçamento utiliza um limite conservador baseado em bytes UTF-8. Não é uma contagem exata de tokens de um modelo específico.

### Etapa C — CLI e MCP

- Comandos de inicialização, diagnóstico, registro de projeto, ingestão, busca e estatísticas.
- Operações de armazenamento, consulta, edição, feedback e exclusão confirmada.
- Ferramentas MCP `memory_search`, `memory_get`, `memory_store`, `memory_feedback`, `project_register`, `project_ingest` e `memory_stats`, além de operações complementares documentadas.
- Entradas validadas, erros estruturados e stdout reservado ao JSON-RPC no modo MCP.
- Comunicação real com o cliente oficial MCP v2, incluindo dois clientes simultâneos e compartilhamento de memórias com a CLI.
- Pacote empacotado e instalado isoladamente para verificar o executável fora do fluxo de desenvolvimento.

Os parâmetros, respostas, permissões e erros estão em [docs/mcp.md](docs/mcp.md); os schemas gerados estão em [docs/mcp-schemas.json](docs/mcp-schemas.json).

### Etapa D — Importação histórica Git

- Adaptador inicial para repositórios Git locais registrados e autorizados.
- Importação somente de leitura, sem executar scripts ou testes do projeto importado.
- Processamento incremental com detecção de alterações e prevenção de duplicatas.
- Tratamento de arquivos alterados e fontes removidas, com rastreabilidade e histórico.
- Extração limitada de arquivos textuais, documentação, configurações, tecnologias identificáveis e metadados de commits.
- Limites de arquivos, bytes, histórico, saída e duração de comandos Git.
- Respeito a exclusões e regras de ignore; filtros para dependências, builds, binários, links simbólicos, caminhos sensíveis e conteúdo potencialmente secreto.

Conteúdo importado é tratado como dado não confiável. Um commit comprova a existência de uma alteração, não a correção do código. Conhecimento importado começa como candidato privado do projeto.

### Etapa E — Aprendizado inicial

- Registro de observações, contexto de tarefa, solução tentada e resultado observado.
- Deduplicação de experiências, relações entre memórias e histórico de qualidade/uso.
- Feedback determinístico para aprovação, rejeição, depreciação e compartilhamento controlado.
- Edições preservam identidade e histórico e invalidam a verificação anterior do conteúdo.
- Compartilhamento global exige conhecimento verificado e aprovação explícita para compartilhamento.
- Exclusão de registros locais com confirmação, preservando o repositório de origem.

Não foi implementado treinamento automático de modelos nem alteração de pesos.

## 5. Correções encontradas durante a validação

1. **Ciclo de vida de memória global:** a depreciação era aplicada, mas a consulta usada para montar a resposta falhava após a mudança de estado. O caminho foi corrigido e coberto por regressão.
2. **Exclusão de projeto pela CLI:** `project-delete <id> --confirm` não consumia corretamente o ID posicional. O comando foi corrigido e validado também no pacote instalado.
3. **SQLite com falha de concorrência em WAL:** o runtime Linux inicial, Node 24.10.0, incluía SQLite 3.50.4, afetado pela falha upstream WAL-reset. A validação final passou a usar Node 24.22.1 com SQLite 3.53.4. A inicialização agora recusa SQLite sem a correção antes de criar diretórios, abrir o banco, configurar WAL ou executar migrações.

A proteção aceita SQLite a partir de 3.51.3 e os backports corrigidos 3.50.7/3.44.6. A recusa real do runtime antigo foi testada sem criar banco ou diretório. A referência upstream está na [documentação oficial do SQLite](https://www.sqlite.org/wal.html#walreset).

## 6. Testes e verificações executados

A validação final utilizou Node 24.22.1 e SQLite 3.53.4 no WSL/Linux.

| Verificação                                 | Resultado                                            |
| ------------------------------------------- | ---------------------------------------------------- |
| Instalação limpa com `npm ci`               | Aprovada                                             |
| Build                                       | Aprovado                                             |
| Verificação estrita de tipos                | Aprovada                                             |
| Suíte automatizada                          | 17 testes aprovados; zero falhas ou testes ignorados |
| Geração dos schemas MCP                     | Aprovada                                             |
| Verificação de formatação                   | Aprovada                                             |
| `git diff --check`                          | Aprovado                                             |
| Benchmark reproduzível                      | Executado                                            |
| Instalação isolada do pacote e comandos CLI | Aprovada                                             |
| Revisão independente de código              | Não executada: cota do serviço esgotada              |

Os testes cobrem persistência após reinício, rollback, deduplicação entre processos, isolamento, filtros, orçamento de contexto, ingestão Git incremental, exclusões de segurança, feedback, versões, exclusão confirmada e verificação da versão do SQLite.

A integração MCP foi validada com subprocessos reais: inicialização, listagem de ferramentas, chamadas, clientes simultâneos e leituras/escritas compartilhadas com a CLI. Não foram usados transportes simulados para representar essa integração.

O fluxo do pacote instalado incluiu inicialização, diagnóstico, registro, ingestão repetida, armazenamento, edição, consulta, busca, aprovação, estatísticas e exclusão de memória/projeto. Os diretórios de origem foram preservados.

Evidências: [validação detalhada](docs/validation.md), [saída dos testes](docs/test-results.txt), [pacote instalado](docs/package-smoke.txt), [runtime e checksum](docs/runtime-download.json) e [recusa do SQLite antigo](docs/sqlite-runtime-rejection.txt).

## 7. Métricas disponíveis

O benchmark utiliza 100 memórias sintéticas, das quais oito são relevantes para a consulta `Renderer buffer architecture`.

| Modo                  | Memórias retornadas | Contexto em bytes UTF-8 |        Tempo local | Precisão | Recall |
| --------------------- | ------------------: | ----------------------: | -----------------: | -------: | -----: |
| Sem memória fornecida |                   0 |                       0 | 0 ms, sem consulta |        0 |      0 |
| Corpus completo       |                 100 |                  52.065 |           8,833 ms |     0,08 |   1,00 |
| Recuperação seletiva  |                   8 |                   4.317 |           2,799 ms |     1,00 |   1,00 |

Esses números representam uma execução sintética de recuperação por palavras-chave. Os tempos podem variar; o caminho seletivo inclui gravação de métricas, enquanto o corpus completo não inclui essa gravação. A linha sem memória representa ausência de contexto fornecido, não uma avaliação de um modelo de IA.

Os valores em bytes também servem como limite conservador estimado de tokens. Não demonstram economia real de tokens, qualidade de respostas de modelos ou ganho geral de desempenho em tarefas reais.

Resultados reproduzíveis: [docs/benchmark-results.json](docs/benchmark-results.json). Comando: `npm run benchmark`.

## 8. Instalação e execução

Com Node `>=24.22.1 <25`, npm e Git disponíveis no PATH, execute na raiz do repositório:

```bash
npm ci
npm run build
npm link
mimir init
mimir doctor
```

Para usar um projeto autorizado:

```bash
mimir project add /caminho/do/projeto --authorize-ingestion
mimir ingest <project-id>
mimir search "consulta relevante" --project <project-id>
mimir stats --project <project-id>
```

Substitua os marcadores pelos caminhos e IDs reais. O registro retorna o ID do projeto. Nenhum repositório real do usuário foi importado durante a implementação; os testes usaram fixtures temporárias.

Para iniciar o servidor MCP com um banco explícito:

```bash
mimir --db /caminho/privado/memory.sqlite mcp stdio
```

No Windows PowerShell, os exemplos completos usam `npm.cmd` e `mimir.cmd`. No WSL, use Node Linux e caminhos Linux; não reutilize a instalação de dependências do Windows.

O runtime Linux usado nesta sessão está temporariamente em `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin`. Para uso permanente, instale uma versão suportada do Node no ambiente escolhido.

## 9. Integrações com agentes

Foram documentadas configurações para:

- Codex: entrada `mcp_servers.mimir`, com `command` e `args` para iniciar o processo stdio.
- Google Antigravity: entrada `mcpServers.mimir`, também com `command` e `args`.

Ambos devem apontar para o runtime/build apropriado e para o mesmo banco quando o compartilhamento local for desejado. Os exemplos e cuidados com caminhos Windows/WSL estão em [docs/integrations.md](docs/integrations.md).

**Os aplicativos Codex e Antigravity não foram configurados nem testados como hosts do Mimir nesta intervenção.** A integração testada foi com o cliente oficial MCP v2.

## 10. Principais arquivos

| Caminho                         | Responsabilidade                                          |
| ------------------------------- | --------------------------------------------------------- |
| `src/core/schemas.ts`           | Contratos e validação de entradas                         |
| `src/core/service.ts`           | Serviços e operações compartilhadas                       |
| `src/storage/index.ts`          | Banco, migrações, transações e proteção do runtime SQLite |
| `src/retrieval/index.ts`        | Recuperação textual e interfaces de extensão              |
| `src/optimization/index.ts`     | Composição e orçamento de contexto                        |
| `src/learning/index.ts`         | Regras determinísticas de aprendizado                     |
| `src/ingestion/adapters/git.ts` | Importação Git autorizada e incremental                   |
| `src/security/index.ts`         | Filtros e verificações de segurança                       |
| `src/mcp/index.ts`              | Servidor MCP stdio                                        |
| `src/cli/index.ts`              | Executável CLI                                            |
| `test/core.test.mjs`            | Testes automatizados                                      |
| `test/benchmark.mjs`            | Benchmark reproduzível                                    |
| `docs/`                         | Arquitetura, contratos, integrações e evidências          |

## 11. Limitações e pendências reais

- Revisão independente de código/segurança pendente por esgotamento de cota do revisor.
- Aceitação nos hosts reais Codex e Antigravity ainda não validada.
- Houve smoke test nativo do banco no Windows com Node 24.21.0/SQLite 3.53.4; ele não substitui a validação final no runtime suportado. Git nativo não estava disponível, portanto a suíte completa e a ingestão Windows não foram verificadas.
- Detecção de segredos é heurística e não garante identificação de todo conteúdo sensível.
- Banco sem criptografia; exclusão de registros é lógica, sem garantia de apagamento seguro dos dados físicos.
- SQLite WAL requer armazenamento local apropriado; compartilhamento entre runtimes Windows/WSL e sistemas de arquivos de rede deve ser evitado.
- Worktrees vinculados, submódulos e object stores externos não são suportados pelo adaptador inicial.
- Aprovações dependem de um host local confiável que encaminhe decisões humanas reais.
- Sem embeddings, busca híbrida operacional, treinamento de modelos ou transporte HTTP nesta versão.
- Licença permanece indefinida; o pacote está marcado como `UNLICENSED`, sem concessão de licença open source.

## 12. Próximas prioridades

1. Concluir revisão independente de código e segurança assim que o serviço estiver disponível.
2. Validar Codex e Antigravity com projetos descartáveis e permissões controladas.
3. Executar a suíte e os fluxos Git/MCP em Windows nativo com runtime suportado.
4. Definir a licença do projeto antes de apresentá-lo como software open source licenciado.
5. Ampliar os benchmarks para tarefas reais antes de declarar economia de tokens ou melhoria de qualidade.

Este documento registra o que foi implementado e verificado na intervenção; não substitui revisão independente nem promete os mecanismos ainda não entregues.
