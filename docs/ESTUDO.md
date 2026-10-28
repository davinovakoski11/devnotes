# Roteiro de estudo do DevNotes

## Entenda os limites de cada parte

1. `app/page.tsx` monta a página.
2. `Library.tsx` precisa do cliente porque usa estado, eventos e armazenamento do navegador.
3. `NoteEditor.tsx` mantém um rascunho separado até salvar.
4. `lib/notes.ts` contém regras que podem ser testadas sem renderizar a interface.

## Exercício 1: busca

Explique como “validacao laravel” encontra uma nota com “Validação”. Depois adicione uma opção de ordenar pelo título, com um teste que confira uma ordem conhecida.

## Exercício 2: backup

Exporte suas notas, altere um registro e importe uma versão mais antiga. Confira que a edição recente é preservada. Explique por que validar o arquivo precisa acontecer antes de alterar o estado atual.

## Exercício 3: uma evolução sua

Implemente detecção de rascunho alterado. O aviso de descarte deve aparecer apenas quando o conteúdo mudou. Adicione um indicador visual de “Alterações não salvas” e confira a navegação por teclado.

## Perguntas para praticar

- Por que o armazenamento local não é lido durante a renderização do servidor?
- Como impedir que uma importação inválida destrua a biblioteca?
- Qual é o critério de resolução de conflito entre notas?
- O que acontece quando o armazenamento do navegador fica sem espaço?
- Por que Markdown com HTML bruto está desabilitado?
- Como você acrescentaria autenticação e sincronização?

Descreva com clareza o apoio de IA. Revise o código, pratique uma alteração e registre suas próprias evoluções no Git conforme acontecerem.
