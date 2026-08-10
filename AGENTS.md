<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contador Musical - regras do projeto

## Fluxo de trabalho

- Faça um commit após cada modificação relevante e funcionalmente completa.
- Antes de cada commit, execute verificações proporcionais à mudança e mantenha o repositório sem alterações não relacionadas.
- Não misture correções independentes no mesmo commit; use mensagens objetivas nos padrões `feat:`, `fix:`, `test:` ou `docs:`.
- Preserve alterações existentes do usuário e nunca reverta arquivos fora do escopo da tarefa.

## Interface e identidade visual

- A aplicação é mobile-first. Valide obrigatoriamente em 360x640 e 390x844; para regressões de layout intermediário, valide também em 632x844.
- Nunca desenhe ícones de instrumentos manualmente. Use somente pacotes de ícones consolidados e licenciados, instalados no projeto e empacotados para funcionamento offline.
- Para instrumentos sem pictograma específico, use o ícone profissional mais próximo da mesma família; não improvise caminhos SVG.
- Reutilize os componentes em `src/components/ui/` para inputs, selects e botões. Controles críticos devem continuar organizados mesmo durante atualização do cache da PWA.
- Preserve a proporção da logo da CCB e não a redesenhe. Use o arquivo oficial armazenado localmente.
- Mantenha áreas de toque com pelo menos 48 px, foco visível, contraste adequado e contadores sem rolagem horizontal.

## Regras de domínio

- O catálogo deve conter exclusivamente os instrumentos atualmente listados no MOO Digital.
- Todos os saxofones pertencem diretamente a Madeiras; não crie uma família ou subtotal separado para saxofones.
- Órgão Eletrônico contabiliza organistas que tocaram e que não tocaram, com total calculado automaticamente.
- Não adicione banco de dados, histórico de ensaios ou armazenamento de nomes individuais sem solicitação explícita.
- O ensaio atual deve continuar persistido em `localStorage` na chave `contador-musical:ensaio-atual:v1`.

## PWA e PDF

- A aplicação deve permanecer instalável e utilizável offline depois do primeiro acesso.
- Mudanças em CSS, JavaScript ou assets devem considerar atualização do service worker e impedir combinações entre recursos de builds diferentes.
- O PDF deve permanecer em uma única página A4, conter todas as contagens inclusive zero, subtotais, total da orquestra e total geral.
- Depois de alterar o PDF, gere uma amostra completa, confirme que possui exatamente uma página e inspecione sua renderização visual.

## Verificação mínima

- Execute `npm run lint`, `npm test` e `npx tsc --noEmit` após mudanças de código.
- Execute `npm run build` para alterações em configuração, dependências, PWA, Tailwind ou geração do PDF.
- Para alterações visuais, faça inspeção real no navegador nos tamanhos definidos acima; testes unitários não substituem essa revisão.
