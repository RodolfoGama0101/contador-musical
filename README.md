# Contador Musical

PWA mobile-first para registrar a quantidade de músicos presentes em ensaios da Congregação Cristã no Brasil. Os dados ficam somente no navegador, sem banco de dados ou envio para servidores.

## Recursos

- Contagem rápida por instrumento, com subtotais de Cordas, Madeiras e Metais.
- Ilustrações vetoriais para os instrumentos e logo institucional da CCB no cabeçalho.
- Saxofones incluídos diretamente em Madeiras.
- Registro separado de organistas que tocaram e que não tocaram.
- Identificação do ensaio e cálculo automático dos totais.
- Persistência do ensaio atual em `localStorage`.
- Instalação como PWA e uso offline após o primeiro acesso.
- Relatório PDF A4 resumido em uma página, com compartilhamento nativo ou download.

O catálogo local utiliza exclusivamente os instrumentos presentes no [MOO Digital](https://moo.congregacao.org.br/).

## Interface

A aplicação combina Tailwind CSS com componentes React reutilizáveis para campos, seletores e botões. A identidade mantém as cores institucionais e usa uma cópia local da logo disponibilizada em uma propriedade oficial da CCB, permitindo a exibição offline.

Os pictogramas de instrumentos são fornecidos por [Qlementine Icons](https://icon-sets.iconify.design/qlementine-icons/) e [Game Icons](https://game-icons.net/), distribuídos no aplicativo por meio do Iconify. Game Icons é utilizado sob a licença CC BY 3.0.

## Desenvolvimento

Requer Node.js 20.9 ou mais recente.

```bash
npm install
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Verificações

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
```

Para conferir a instalação e o funcionamento offline, use uma compilação de produção:

```bash
npm run build
npm start
```

O service worker é desabilitado durante `npm run dev` para não interferir na atualização dos arquivos.

## Armazenamento

O ensaio em andamento é salvo na chave `contador-musical:ensaio-atual:v1`. A opção **Novo ensaio** substitui esse registro após confirmação; o PDF é o registro permanente.
