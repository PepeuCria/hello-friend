import { createFileRoute } from "@tanstack/react-router";

const allowedGrades = new Set(["4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1º ano EM", "2º ano EM", "3º ano EM"]);

export const Route = createFileRoute("/api/ask-doubt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as { grade?: string; question?: string; images?: unknown };
          const grade = typeof body.grade === "string" ? body.grade : "";
          const question = typeof body.question === "string" ? body.question.trim().slice(0, 4000) : "";
          const images = Array.isArray(body.images) ? body.images : [];
          if (!allowedGrades.has(grade)) return Response.json({ error: "Selecione um ano escolar válido." }, { status: 400 });
          if (!question && images.length === 0) return Response.json({ error: "Escreva sua dúvida ou envie pelo menos um print." }, { status: 400 });
          if (images.length > 3 || images.some((image) => typeof image !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,/.test(image) || image.length > 7_000_000)) return Response.json({ error: "Envie até 3 imagens PNG, JPG, WEBP ou GIF, de até 5 MB cada." }, { status: 400 });
          const apiKey = process.env["LOVABLE_API_KEY"];
          if (!apiKey) return Response.json({ error: "A IA ainda não está ativada neste site. O administrador precisa ativar a IA do projeto." }, { status: 503 });
          const systemPrompt = [
            "Você é o Xplica, um tutor de matemática acolhedor e rigoroso para estudantes brasileiros do " + grade + ".",
            "Responda em português brasileiro e com linguagem adequada ao ano escolar. Analise imagens, enunciados, símbolos, tabelas e diagramas. Se algo estiver cortado ou ilegível, explique o que não conseguiu ler e peça uma imagem mais nítida; nunca invente dados.",
            "Resolva questões passo a passo e explique por que cada etapa funciona. Se o aluno pedir apenas uma dica, não entregue logo a solução completa. Se houver várias questões, pergunte qual quer trabalhar ou comece pela mais claramente indicada.",
            "Confira os cálculos, não julgue o aluno e não afirme ter lido algo que não está visível."
          ].join("\n");
          const userContent = [{ type: "text", text: question || "Analise os prints enviados e me ajude a entender e resolver a questão matemática." }, ...images.map((image) => ({ type: "image_url", image_url: { url: image as string } }))];
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST", headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "google/gemini-3-flash-preview", temperature: 0.3, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }] })
          });
          if (!response.ok) {
            const details = await response.text(); console.error("AI doubt solving failed", response.status, details.slice(0, 500));
            return Response.json({ error: response.status === 429 ? "A IA está recebendo muitas solicitações. Tente novamente em instantes." : response.status === 402 ? "Os créditos de IA acabaram. O administrador precisa adicionar créditos." : "Não foi possível analisar a dúvida agora. Tente novamente em instantes." }, { status: 502 });
          }
          const data = await response.json() as { choices?: { message?: { content?: string | { text?: string }[] } }[] };
          const content = data.choices?.[0]?.message?.content;
          const answer = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => part.text || "").join("\n") : "";
          if (!answer.trim()) return Response.json({ error: "A IA não retornou uma explicação. Tente novamente." }, { status: 502 });
          return Response.json({ answer });
        } catch (error) {
          console.error("Ask doubt route error", error);
          return Response.json({ error: "Ocorreu um erro ao analisar sua dúvida. Tente novamente." }, { status: 500 });
        }
      }
    }
  }
});
