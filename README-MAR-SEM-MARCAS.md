# Mar Sem Marcas — Guia pré-mergulho (Protótipo 01)

Protótipo inicial de um guia digital de conscientização ambiental para centros e empresas de mergulho.

## Fluxo do protótipo
1. Página de apresentação do guia.
2. Cinco temas provisórios sobre biodiversidade, resíduos plásticos, recifes, poluição e conduta responsável.
3. O participante marca cada tema como lido.
4. O quiz contém 10 perguntas de múltipla escolha.
5. A pontuação mínima demonstrativa é 8/10. O resultado indica apenas a conclusão da etapa educativa e não substitui instruções de segurança nem a avaliação do instrutor.

## Importante sobre esta versão
- Os cinco temas e as dez perguntas são conteúdo demonstrativo, aguardando os problemas e materiais que serão fornecidos pelo responsável pelo projeto.
- O quiz atual funciona no navegador com perguntas de exemplo. A integração com IA ainda precisa ser implementada no servidor antes de chamar esta versão de um quiz gerado por IA.
- Não existe ainda autenticação, painel para empresas, relatórios de participantes, persistência de resultados ou integração com sistemas de agendamento.
- A aprovação do quiz não deve ser tratada como autorização de segurança real para mergulhar. Os procedimentos operacionais da empresa e a decisão do instrutor continuam essenciais.

## Desenvolvimento
Este projeto usa React, TypeScript, TanStack Start/Router, Vite e Tailwind CSS. Instale dependências com `npm install` e execute `npm run dev`.

## Próximos passos sugeridos
- Substituir os cinco temas provisórios pelos conteúdos fornecidos.
- Criar uma rota de servidor segura para gerar perguntas com IA com base apenas no conteúdo apresentado ao participante.
- Validar o formato das 10 perguntas e calcular a nota no servidor.
- Adicionar painel da empresa, identificador de sessão e relatório de conclusão.
- Configurar hospedagem e testar o fluxo em dispositivos móveis.
