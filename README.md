# To-Do List

Aplicação web para organizar tarefas do dia a dia. O projeto está na etapa de setup; os requisitos e o visual das telas serão desenvolvidos em conjunto pelo grupo.

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

A aplicação permitirá cadastrar e consultar tarefas, marcar tarefas como concluídas, editar e excluir registros e filtrar tarefas por status. Os dados serão armazenados no navegador com LocalStorage, sem banco de dados externo.

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
├── main.js
├── js/
│   ├── taskService.js       # Regras e operações de tarefas
│   └── taskStorage.js       # Acesso ao LocalStorage
└── README.md
```

Cada arquivo tem uma responsabilidade definida. Os módulos JavaScript começam como pontos de extensão, sem funcionalidades implementadas, para que a lógica seja acrescentada durante o desenvolvimento.

O `index.html` será uma única página: a listagem e o estado vazio compartilham a tela inicial, e o formulário será reutilizado para adicionar e editar tarefas. O `main.js` controlará a transição entre esses estados.

## Como executar

1. Instale a extensão **Live Server** no VS Code.
2. Abra `index.html` com **Open with Live Server**.

A fonte Poppins e os ícones do Font Awesome são carregados pela internet.

## Boas práticas

- Manter HTML, CSS e JavaScript separados.
- Usar nomes claros e consistentes para variáveis e funções.
- Separar as regras das tarefas do acesso ao armazenamento.
- Validar os dados dos formulários antes de salvá-los.
- Comentar apenas quando o código precisar de contexto adicional.
- Usar branches e commits pequenos para colaborar pelo Git.

## Capturas de tela

As imagens das telas serão adicionadas após a definição visual da interface.

### Desktop

<!-- Adicionar aqui as capturas da versão desktop. -->

### Mobile

<!-- Adicionar aqui as capturas da versão mobile. -->

## Pendências de definição

- [ ] Definir o favicon da página e adicionar o arquivo ao projeto.
- [ ] Confirmar se a tarefa terá data limite opcional, como no desenho inicial.
- [ ] Fechar os estados de validação e interação: campos obrigatórios, mensagens de erro, foco por teclado e confirmação de exclusão.
- [ ] Validar a paleta final e os pontos de quebra para desktop e mobile com quem fará o visual.

## Licença

Projeto acadêmico. A licença será definida pelo grupo na entrega final.
