# Sistema Rifa

Sistema web para gerenciamento de rifas, criado para facilitar a organização, venda e acompanhamento dos números disponíveis, reservados e vendidos.

## Sobre o projeto

O objetivo do Sistema Rifa é permitir que o administrador controle os números de uma rifa de forma simples. A ideia é ter uma tela com todos os números da rifa e ir alterando o status de cada número aos poucos, conforme as vendas forem acontecendo.

Com isso, fica mais fácil saber:

- Quais números ainda estão disponíveis
- Quais números já foram vendidos
- Quem comprou cada número
- Quanto já foi arrecadado
- Quantos números ainda faltam vender

## Funcionalidades previstas

- Listagem dos números da rifa
- Marcação de números como disponíveis, reservados ou vendidos
- Cadastro do nome do comprador
- Controle do valor de cada número
- Acompanhamento do total arrecadado
- Visualização rápida dos números restantes
- Organização da rifa em uma interface simples e responsiva

## Tecnologias

Este projeto está sendo desenvolvido com:

- Next.js
- React
- TypeScript
- CSS
- Tailwind CSS

## Como rodar o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Depois, rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra o navegador em:

```text
http://localhost:3000
```

## Scripts disponíveis

```bash
npm run dev
```

Inicia o projeto em modo de desenvolvimento.

```bash
npm run build
```

Gera a versão de produção do projeto.

```bash
npm run start
```

Inicia a versão de produção após o build.

```bash
npm run lint
```

Executa a verificação de lint do projeto.

## Estrutura inicial

```text
app/
  layout.tsx
  page.tsx
  globals.css
  home.css

components/
  header/
    index.tsx
    header.css

public/
  imagens/
```

## Status do projeto

O projeto está em fase inicial de desenvolvimento. A base com Next.js já foi criada e as próximas etapas serão construir a tela principal da rifa, a listagem dos números e os controles para atualizar o status de cada número.

## Próximos passos

- Criar o layout principal da página da rifa
- Criar os cards ou botões dos números
- Adicionar estados para disponível, reservado e vendido
- Criar formulário para registrar comprador
- Salvar os dados da rifa
- Melhorar o visual para uso em celular e desktop
