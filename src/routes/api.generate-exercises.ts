import { createFileRoute } from "@tanstack/react-router";

const allowedGrades = new Set(["4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1º ano EM", "2º ano EM", "3º ano EM"]);
const allowedDifficulties = new Set(["Quero o básico", "No meu ritmo", "Pode desafiar"]);

type GeneratedExercise = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  steps: string[];
};

function isExercise(value: unknown): value is GeneratedExercise {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.question === "string" && item.question.trim().length > 0
    && Array.isArray(item.options) && item.options.length === 4
    && item.options.every((option) => typeof option === "string" && option.trim().length > 0)
    && new Set((item.options as string[]).map((option) => option.trim().toLocaleLowerCase("pt-BR"))).size === 4
    && Number.isInteger(item.answerIndex) && (item.answerIndex as number) >= 0 && (item.answerIndex as number) <= 3
    && typeof item.explanation === "string" && item.explanation.trim().length > 0
    && Array.isArray(item.steps) && item.steps.length >= 2
    && item.steps.every((step) => typeof step === "string" && step.trim().length > 0);
}

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

          // Keep the Lovable AI gateway: this is the credential used by the current project.
          const apiKey = process.env["LOVABLE_API_KEY"];
          if (!apiKey) return Response.json({ error: "A IA ainda não está ativada neste site. O administrador precisa ativar a IA do projeto." }, { status: 503 });

          const difficultyGuidance: Record<string, string> = {
            "Quero o básico": "Comece pelos pré-requisitos e conceitos fundamentais. Use números acessíveis, uma ideia principal por questão e progressão suave. Não simplifique a ponto de tornar a questão trivial.",
            "No meu ritmo": "Use dificuldade intermediária para o ano escolar, com variedade entre aplicação direta, interpretação e raciocínio. Aumente gradualmente a exigência ao longo das cinco questões.",
            "Pode desafiar": "Crie desafios exigentes, mas justos para o ano escolar: exija perceber uma propriedade, escolher uma estratégia, conectar conceitos ou justificar uma conclusão. A dificuldade deve vir do raciocínio, não de números enormes, pegadinhas de linguagem ou conteúdo fora da série."
          };

          const instructions = [
            "Você é um especialista em ensino de matemática brasileira, elaboração de avaliações e resolução rigorosa de problemas.",
            "TAREFA: produzir exatamente 5 questões matemáticas originais, com múltipla escolha, gabarito e resolução verificável. Crie problemas novos; não reproduza nem parafraseie questões conhecidas, olimpíadas ou materiais protegidos.",
            "CONTEXTO DO ALUNO: ano escolar " + grade + "; assunto solicitado: " + topic + "; nível escolhido: " + difficulty + ".",
            "NÍVEL DE DIFICULDADE: " + difficultyGuidance[difficulty],
            "ALINHAMENTO CURRICULAR: respeite conhecimentos normalmente disponíveis no ano informado. Para 4º–5º anos, priorize sentido numérico, operações, frações, medidas e problemas concretos. Para 6º–7º, inclua divisibilidade, frações, razão, porcentagem, geometria e padrões adequados. Para 8º–9º, use álgebra, equações, proporcionalidade, funções introdutórias, geometria e probabilidade conforme o assunto. No Ensino Médio, use álgebra, funções, geometria, trigonometria, estatística, probabilidade, combinatória e teoria dos números quando relevantes.",
            "RACIOCÍNIO E VARIEDADE: as cinco questões devem testar aspectos diferentes do tópico sempre que possível. Misture cálculo, interpretação, aplicação e raciocínio conceitual. Em questões desafiadoras, procure uma sacada matemática legítima ou uma conexão entre ideias; não torne difícil apenas usando contas longas.",
            "ORIGINALIDADE E ESCOPO: use apenas o assunto pedido e pré-requisitos pertinentes. Se o tópico for amplo, selecione subtemas complementares. Não alegue ter pesquisado na internet ou consultado fontes. Se o pedido não for matemática ou não puder ser interpretado como matemática, retorne exercises como array vazio e explique brevemente em error.",
            "GABARITO: resolva cada questão antes de responder. Confirme a resposta por um segundo método ou substituição quando viável. Deve existir exatamente uma alternativa correta. As quatro alternativas devem ser distintas, plausíveis e compatíveis com a pergunta; distratores podem refletir erros comuns, mas nunca podem também ser corretos sob uma interpretação razoável.",
            "EXPLICAÇÃO: escreva uma explicação didática em português brasileiro, adequada ao ano escolar, e steps com pelo menos dois passos ordenados. Explique por que o método funciona; não salte a etapa central. Evite dizer apenas 'é a alternativa B'. Use LaTeX entre delimitadores $...$ quando necessário, sem exagerar.",
            "FORMATO: retorne somente JSON válido, sem Markdown ou texto externo, no formato {\"exercises\":[{\"question\":\"...\",\"options\":[\"...\",\"...\",\"...\",\"...\"],\"answerIndex\":0,\"explanation\":\"...\",\"steps\":[\"...\",\"...\"]}],\"error\":null}. answerIndex é baseado em zero.",
            "REVISÃO FINAL: confira consistência dos dados, cálculos, unidades, alternativas, índice da resposta correta e correspondência entre explicação e gabarito. Não inclua questões sem solução única."
          ].join("\n");

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              temperature: 0.45,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: instructions },
                { role: "user", content: "Gere as cinco questões agora. Faça uma revisão matemática independente de cada questão e do gabarito antes de devolver o JSON." }
              ]
            })
          });

          if (!response.ok) {
            const details = await response.text();
            console.error("AI exercise generation failed", response.status, details.slice(0, 500));
            return Response.json({
              error: response.status === 429
                ? "Muitas pessoas estão usando a IA agora. Tente novamente em instantes."
                : response.status === 402
                  ? "Os créditos de IA acabaram. O administrador precisa adicionar créditos."
                  : "Não foi possível gerar os exercícios agora. Tente novamente em instantes."
            }, { status: 502 });
          }

          const data = await response.json() as { choices?: { message?: { content?: string } }[] };
          const content = data.choices?.[0]?.message?.content;
          if (!content) return Response.json({ error: "A IA não retornou exercícios. Tente novamente." }, { status: 502 });

          const parsed = JSON.parse(content) as { exercises?: unknown; error?: string | null };
          if (parsed.error) return Response.json({ error: parsed.error }, { status: 422 });
          if (!Array.isArray(parsed.exercises) || parsed.exercises.length !== 5 || !parsed.exercises.every(isExercise)) {
            console.error("AI returned invalid exercise structure");
            return Response.json({ error: "A IA não conseguiu preparar cinco questões válidas desta vez. Tente gerar novamente." }, { status: 502 });
          }

          return Response.json({ exercises: parsed.exercises });
        } catch (error) {
          console.error("Exercise generation route error", error);
          return Response.json({ error: "Ocorreu um erro ao preparar os exercícios. Tente novamente." }, { status: 500 });
        }
      }
    }
  }
});
