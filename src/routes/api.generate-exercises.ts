import { createFileRoute } from "@tanstack/react-router";

const allowedGrades = new Set(["4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1º ano EM", "2º ano EM", "3º ano EM"]);
const allowedDifficulties = new Set(["Quero o básico", "No meu ritmo", "Pode desafiar"]);

export const Route = createFileRoute("/api/generate-exercises")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as { grade?: string; topic?: string; difficulty?: string };
          const grade = typeof body.grade === "string" ? body.grade : "";
          const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 180) : "";
          const difficulty = typeof body.difficulty === "string" ? body.difficulty : "No meu ritmo";
          if (!allowedGrades.has(grade)) return Response.json({ error: "Selecione um ano escolar válido." }, { status: 400 });
          if (!topic) return Response.json({ error: "Escreva a matéria ou o assunto que deseja estudar." }, { status: 400 });
          if (!allowedDifficulties.has(difficulty)) return Response.json({ error: "Selecione um nível de dificuldade válido." }, { status: 400 });

          const apiKey = process.env["LOVABLE_API_KEY"];
          if (!apiKey) return Response.json({ error: "A IA ainda não está ativada neste site. O administrador precisa ativar a IA do projeto." }, { status: 503 });

          const instructions = [
            "Você é um professor de matemática paciente e excelente em adaptar a explicação ao ano escolar brasileiro.",
            "Crie exatamente 5 exercícios originais sobre o assunto pedido pelo aluno. Interprete o texto livre como matéria, tópico ou habilidade matemática; se houver ambiguidade, escolha a interpretação mais provável.",
            "Ano escolar: " + grade + ". Assunto: " + topic + ". Nível: " + difficulty + ".",
            "Adapte vocabulário, complexidade, números e métodos ao ano escolar.",
            "4º e 5º anos: linguagem concreta, situações cotidianas e operações adequadas à idade.",
            "6º e 7º anos: conceitos fundamentais e resolução gradual.",
            "8º e 9º anos: notação algébrica e técnicas escolares adequadas ao conteúdo.",
            "Ensino Médio: fórmulas, técnicas formais e raciocínio mais avançado quando pertinentes.",
            "Não afirme que pesquisou na internet. Se o assunto não for matemática, retorne exercises como array vazio e explique isso no campo error.",
            "Cada exercício deve ter quatro alternativas, apenas uma correta, answerIndex de 0 a 3, explicação clara e passos de resolução.",
            'Responda somente JSON válido neste formato: {"exercises":[{"question":"...","options":["...","...","...","..."],"answerIndex":0,"explanation":"...","steps":["...","..."]}],"error":null}'
          ].join("\n");

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              temperature: 0.6,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: instructions },
                { role: "user", content: "Gere os 5 exercícios agora. Confira cada resposta e o gabarito antes de responder." }
              ]
            })
          });
          if (!response.ok) {
            const details = await response.text();
            console.error("AI exercise generation failed", response.status, details.slice(0, 500));
            return Response.json({ error: response.status === 429 ? "Muitas pessoas usando agora. Tente novamente em instantes." : response.status === 402 ? "Os créditos de IA acabaram. O administrador precisa adicionar créditos." : "Não foi possível gerar os exercícios agora. Tente novamente em instantes." }, { status: 502 });
          }
          const data = await response.json() as { choices?: { message?: { content?: string } }[] };
          const content = data.choices?.[0]?.message?.content;
          if (!content) return Response.json({ error: "A IA não retornou exercícios. Tente novamente." }, { status: 502 });
          const parsed = JSON.parse(content) as { exercises?: unknown; error?: string | null };
          if (parsed.error) return Response.json({ error: parsed.error }, { status: 422 });
          if (!Array.isArray(parsed.exercises) || parsed.exercises.length !== 5) throw new Error("Invalid exercise response");
          const exercises = parsed.exercises.map((item: any) => {
            if (typeof item.question !== "string" || !Array.isArray(item.options) || item.options.length !== 4 || !item.options.every((option: unknown) => typeof option === "string") || !Number.isInteger(item.answerIndex) || item.answerIndex < 0 || item.answerIndex > 3 || typeof item.explanation !== "string" || !Array.isArray(item.steps) || !item.steps.every((step: unknown) => typeof step === "string")) throw new Error("Invalid exercise schema");
            return { question: item.question, options: item.options, answerIndex: item.answerIndex, explanation: item.explanation, steps: item.steps };
          });
          return Response.json({ exercises });
        } catch (error) {
          console.error("Exercise generation route error", error);
          return Response.json({ error: "Ocorreu um erro ao preparar os exercícios. Tente novamente." }, { status: 500 });
        }
      }
    }
  }
});
