# To-Do List

Aplicação web para organizar tarefas do dia a dia. O projeto usa JavaScript no navegador e LocalStorage para persistir os dados, sem servidor ou banco de dados externo.

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-estrutura-E34F26?style=flat&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-estilos-1572B6?style=flat&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-lógica-F7DF1E?style=flat&logo=javascript&logoColor=111111">
  <img alt="Poppins" src="https://img.shields.io/badge/fonte-Poppins-6A2BDB?style=flat&logo=googlefonts&logoColor=white">
  <img alt="Font Awesome Free" src="https://img.shields.io/badge/ícones-Font_Awesome_CDN-528DD7?style=flat&logo=fontawesome&logoColor=white">
  <img alt="Armazenamento" src="https://img.shields.io/badge/armazenamento-LocalStorage-0F766E?style=flat">
  <img alt="Status do projeto" src="https://img.shields.io/badge/status-em_desenvolvimento-F5873B?style=flat">
</p>

## Sobre o projeto

A aplicação permite cadastrar e consultar tarefas, marcar tarefas como concluídas, editar e excluir registros, filtrar por status e pesquisar pelo título ou descrição. A interface já está integrada à lógica das tarefas, com layout responsivo para celular, tablet e notebook.

## Tecnologias

- HTML5 para a estrutura semântica.
- CSS3 para estilos, responsividade e tokens visuais.
- JavaScript com módulos nativos para as regras da aplicação.
- LocalStorage para persistência no navegador.
- Font Awesome Free para ícones.
- Git e GitHub para controle de versão e colaboração.

## Estrutura do projeto

```text
ToDo_List/
├── index.html
├── style.css
├── main.js                  # Integração entre as telas e o backend
├── favicon.png              # Ícone da aba do navegador
├── app.js                   # Gerado por `npm run build` (não editar à mão)
├── build.mjs                # Gera o app.js a partir do main.js e de js/
├── package.json            # Comandos de teste e build
├── js/
│   ├── taskService.js       # Regras e operações das tarefas
│   └── taskStorage.js       # Acesso ao armazenamento local
├── tests/
│   ├── taskService.test.js  # Testes das regras das tarefas
│   └── taskStorage.test.js  # Testes do armazenamento
└── README.md
```

Cada arquivo tem uma responsabilidade definida. `taskService.js` contém as regras e operações; `taskStorage.js` centraliza a leitura e gravação no LocalStorage. `main.js` é o ponto de integração com as telas.

O `index.html` é uma única página: a listagem e o estado vazio compartilham a tela inicial, e o formulário é reutilizado para adicionar e editar tarefas.

O `app.js` é a mesma aplicação em um arquivo só, sem `import`, para que o `index.html` também abra com duplo clique (navegadores bloqueiam módulos em `file://`). Ele é gerado automaticamente; quem edita o código deve alterar o `main.js` e os arquivos de `js/`.

## Lógica de tarefas

O serviço exporta operações independentes da interface. Os nomes e os campos da API estão em português para facilitar a colaboração:

- `criarTarefa(dados)` valida e salva uma tarefa nova, gerando o identificador automaticamente; o status inicial é opcional e fica pendente por padrão.
- `listarTarefas({ filtro, consulta })` retorna tarefas filtradas e pesquisadas.
- `obterTarefa(id)` localiza uma tarefa ou retorna `null`.
- `atualizarTarefa(id, dados)` atualiza título, descrição e data limite.
- `definirStatusTarefa(id, status)` altera o status da tarefa.
- `excluirTarefa(id)` remove e retorna a tarefa excluída.
- `obterResumoTarefas()` calcula os totais geral e por status.

Exemplo de uso em um módulo JavaScript da interface:

```js
import { criarTarefa, listarTarefas, FILTRO_TAREFA } from './js/taskService.js'

criarTarefa({
  titulo: 'Estudar para a prova',
  descricao: 'Revisar os exercícios',
  dataLimite: '2026-11-12',
  status: 'em_andamento'
})

const tarefasPendentes = listarTarefas({ filtro: FILTRO_TAREFA.PENDENTE })
```

Cada tarefa possui `id`, `titulo`, `descricao`, `dataLimite`, `status`, `criadoEm` e `atualizadoEm`. Os status são `pendente`, `em_andamento` e `finalizado`. O armazenamento persiste as tarefas na chave `todo-list.tarefas.v1`.

## Testes do backend

Os testes usam o executor nativo do Node.js e um armazenamento em memória, sem precisar abrir o navegador ou instalar dependências:

```sh
npm test
```

Eles cobrem criação e validação, edição, os três status, filtros, pesquisa, resumo, exclusão e persistência.

## Como executar

**Opção 1: Live Server (recomendada para desenvolver)**

1. Instale a extensão **Live Server** no VS Code.
2. Abra `index.html` com **Open with Live Server**.

**Opção 2: duplo clique no `index.html`**

A página abre direto no navegador usando o `app.js`. Depois de alterar o `main.js` ou os arquivos de `js/`, gere o `app.js` de novo:

```sh
npm run build
```

As tarefas ficam salvas no LocalStorage do navegador, separadas por endereço: `127.0.0.1:5500`, `localhost:5500` e a página aberta por duplo clique mostram listas diferentes.

A fonte Poppins e os ícones do Font Awesome são carregados pela internet.

## Boas práticas

- Manter HTML, CSS e JavaScript separados.
- Usar nomes claros e consistentes para variáveis e funções.
- Separar as regras das tarefas do acesso ao armazenamento.
- Validar os dados dos formulários antes de salvá-los.
- Comentar apenas quando o código precisar de contexto adicional.
- Usar branches e commits pequenos para colaborar pelo Git.

## Capturas de tela

### Desktop

https://github.com/user-attachments/assets/032a6098-4381-4202-97fe-b544363b1c14



### Mobile


https://github.com/user-attachments/assets/ffd66c2b-78fc-40de-b6eb-64ac7c885d45







## Status e pendências

### Backend

- [x] Implementar operações de criação, consulta, edição, alteração de status e exclusão de tarefas.
- [x] Validar título, descrição e data limite opcional; gerar identificadores automaticamente.
- [x] Implementar os status `pendente`, `em_andamento` e `finalizado`, com filtros e resumo por status.
- [x] Persistir e validar tarefas no LocalStorage.
- [x] Adicionar testes locais para as regras e o armazenamento (`npm test`).

### Frontend e integração

- [x] Implementar as telas e os estilos da aplicação.
- [x] Integrar a interface ao backend pelas operações documentadas acima.
- [x] Definir os estados visuais e de interação: lista vazia, validação, mensagens de erro, foco por teclado e confirmação de exclusão.
- [x] Confirmar no desenho final, a apresentação da data limite opcional.
- [x] Validar paleta de cores e responsividade em desktop e mobile.
- [x] Definir e adicionar o favicon.
- [x] Adicionar capturas de tela após a implementação visual.

### Sobre a entrega

- [ ] Realizar testes de integração
- [ ] Documentação do projeto
- [ ] Apresentação em PDF

## Licença

Projeto acadêmico. A licença será definida pelo grupo na entrega final.
