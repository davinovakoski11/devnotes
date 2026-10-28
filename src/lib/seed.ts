import type { Note } from "./notes";
export const initialNotes: Note[] = [
  {
    id: "vue-computed-watch",
    title: "Computed ou watch: quando usar cada um?",
    tags: ["Vue.js", "Front-end"],
    favorite: true,
    updatedAt: "2026-10-24T12:00:00.000Z",
    content:
      "# Menos estado duplicado, mais clareza\n\nNo Vue, `computed` descreve um valor derivado de outros valores reativos. O `watch` acompanha mudanças para executar um efeito, como uma chamada de rede.\n\n## Um valor calculado\n\nSe a lista de tarefas muda, o total de tarefas concluídas pode ser calculado a partir dela. Não precisamos manter dois estados sincronizados.\n\n```ts\nconst completed = computed(() =>\n  tasks.value.filter(task => task.done).length\n)\n```\n\n## Quando observar uma mudança\n\nUse `watch` quando o objetivo for um efeito externo. Se a consulta muda, uma busca pode ser executada. Lembre-se de cancelar solicitações antigas para evitar respostas fora de ordem.\n\n## Meu checklist\n\n- Estou produzindo um valor? Começar com `computed`.\n- Estou disparando uma ação? Avaliar `watch`.\n- Posso derivar o dado em vez de duplicar estado? Preferir a derivação.\n\n> Um bom exercício: retirar um `watch` que só atualiza outra variável e substituí-lo por `computed`.\n\n[Referência: documentação do Vue](https://vuejs.org/guide/essentials/computed.html)",
  },
  {
    id: "laravel-validation",
    title: "Validação na entrada de uma API Laravel",
    tags: ["Laravel", "API"],
    favorite: true,
    updatedAt: "2026-10-23T12:00:00.000Z",
    content:
      "# A fronteira de entrada precisa de regras\n\nValidar o formulário no navegador melhora a experiência. A API também precisa validar os dados, pois uma requisição pode ser feita fora da interface.\n\n## Um exemplo pequeno\n\n```php\n$validated = $request->validate([\n    'title' => ['required', 'string', 'max:160'],\n    'status' => ['required', Rule::in(['open', 'done'])],\n]);\n```\n\nPara formulários maiores, um `FormRequest` mantém regras e autorização em um lugar dedicado.\n\n## O que conferir\n\n- Tipos, limites e campos obrigatórios.\n- Quem pode criar ou alterar o recurso.\n- Campos que podem ser preenchidos em massa.\n- Respostas de erro úteis para o front-end.\n\n[Referência: validação no Laravel](https://laravel.com/docs/13.x/validation)",
  },
  {
    id: "typescript-unions",
    title: "Estados de interface com TypeScript",
    tags: ["TypeScript", "Front-end"],
    favorite: false,
    updatedAt: "2026-10-22T12:00:00.000Z",
    content:
      "# Evitar combinações impossíveis\n\nUsar vários booleanos pode permitir que uma tela esteja carregando e com sucesso ao mesmo tempo. Uma união discriminada representa cada estado explicitamente.\n\n```ts\ntype RemoteData<T> =\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; message: string }\n```\n\nAo verificar `status`, o TypeScript identifica os outros campos disponíveis naquele caso.\n\n## Aplicação prática\n\n1. Modelar os estados antes de escrever a interface.\n2. Mostrar uma ação de recuperação em caso de erro.\n3. Tratar a lista vazia como sucesso com zero itens.\n\n[Referência: narrowing no TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)",
  },
  {
    id: "http-errors",
    title: "Erros HTTP que o front-end precisa tratar",
    tags: ["API", "Back-end"],
    favorite: false,
    updatedAt: "2026-10-21T12:00:00.000Z",
    content:
      "# Falhas também fazem parte do fluxo\n\nUma boa integração inclui o caminho de sucesso e as falhas esperadas.\n\n## Respostas comuns\n\n- **401:** autenticação necessária ou inválida.\n- **403:** o usuário não tem permissão para a operação.\n- **404:** o recurso não foi encontrado.\n- **422:** os dados não atendem às regras de validação.\n- **429:** muitas requisições em um intervalo.\n\n## Na interface\n\nPreserve o que a pessoa digitou, mostre uma mensagem compreensível e permita tentar novamente quando fizer sentido. Evite transformar qualquer erro em uma lista vazia.\n\n[Referência: status HTTP na MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)",
  },
  {
    id: "testing-ownership",
    title: "Um teste que protege os dados de cada usuário",
    tags: ["Laravel", "Testes"],
    favorite: false,
    updatedAt: "2026-10-20T12:00:00.000Z",
    content:
      "# Testar além do caminho feliz\n\nEm uma API com contas, um usuário não deve conseguir acessar o registro de outro apenas trocando um identificador na URL.\n\n## Cenário\n\n1. Criar o usuário A e uma candidatura dele.\n2. Autenticar como o usuário B.\n3. Tentar consultar e atualizar a candidatura de A.\n4. Conferir que a operação foi recusada e que os dados não mudaram.\n\nEste teste verifica uma fronteira de acesso real e continua útil mesmo quando a implementação interna muda.\n\n[Referência: testes HTTP no Laravel](https://laravel.com/docs/13.x/http-tests)",
  },
  {
    id: "project-presentation",
    title: "Como apresentar um projeto em uma entrevista",
    tags: ["Carreira"],
    favorite: false,
    updatedAt: "2026-10-19T12:00:00.000Z",
    content:
      "# Começar pelo problema\n\nUma apresentação curta pode mostrar tanto o funcionamento quanto as escolhas feitas no desenvolvimento.\n\n## Um roteiro de cinco minutos\n\n1. **Contexto:** para quem é o projeto e qual problema resolve.\n2. **Demonstração:** um fluxo completo, da entrada ao resultado.\n3. **Decisões:** por que escolhi a organização do código.\n4. **Validação:** quais comportamentos foram testados.\n5. **Limites:** o que ainda pode evoluir.\n\n## Para praticar\n\nEscolher uma funcionalidade, explicar o percurso dos dados e implementar uma pequena mudança sem depender de um roteiro pronto.\n\n> Projetos de portfólio são um ponto de partida para conversar sobre código, não apenas uma galeria de telas.",
  },
];
