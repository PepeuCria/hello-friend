# Hello Friend

oi

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87065237-3394-413a-8ed2-7ed0bd340da4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Ativar a geração de exercícios por IA

A tela de estudo envia o ano escolar, o assunto digitado pelo aluno e o nível de dificuldade para a rota de servidor `/api/generate-exercises`. O servidor usa a API da OpenAI para criar cinco questões com alternativas, gabarito e explicação.

Configure `OPENAI_API_KEY` como variável de ambiente **secreta no ambiente que hospeda o site**. Opcionalmente, defina `OPENAI_MODEL` (padrão: `gpt-4.1-mini`). O arquivo `.env.example` mostra os nomes das variáveis, sem conter uma chave real. Nunca coloque a chave em variáveis `VITE_*`, no código do navegador ou em commits públicos.

Sem a chave configurada, a interface mostra uma mensagem explicando que a IA ainda precisa ser ativada. A geração exige acesso à API e pode gerar custos de uso.
