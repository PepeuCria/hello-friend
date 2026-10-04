import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Brain, Check, ChevronDown, CircleHelp, GraduationCap, Lightbulb, MessageCircle, RefreshCw, Sparkles, Target, X } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

const grades = ["4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1º ano EM", "2º ano EM", "3º ano EM"];
const topicsByGrade: Record<string, string[]> = {
  "4º ano": ["As quatro operações", "Frações", "Medidas", "Geometria básica"],
  "5º ano": ["Frações e decimais", "Múltiplos e divisores", "Área e perímetro", "Porcentagem"],
  "6º ano": ["Números inteiros", "Frações", "Expressões numéricas", "Ângulos e polígonos"],
  "7º ano": ["Números racionais", "Equações do 1º grau", "Razão e proporção", "Porcentagem"],
  "8º ano": ["Potenciação e raízes", "Sistemas de equações", "Produtos notáveis", "Geometria"],
  "9º ano": ["Equação do 2º grau", "Teorema de Pitágoras", "Semelhança de triângulos", "Funções"],
  "1º ano EM": ["Funções", "Progressões", "Trigonometria", "Geometria analítica"],
  "2º ano EM": ["Logaritmos", "Análise combinatória", "Probabilidade", "Geometria espacial"],
  "3º ano EM": ["Matemática financeira", "Estatística", "Probabilidade", "Revisão ENEM"],
};
const questions = [
  { q: "Quanto vale 3x + 5 = 20?", options: ["x = 3", "x = 5", "x = 8", "x = 15"], answer: 1, explanation: "Subtraia 5 dos dois lados: 3x = 15. Depois divida por 3. Então, x = 5." },
  { q: "Qual é a raiz quadrada de 144?", options: ["10", "11", "12", "14"], answer: 2, explanation: "Como 12 × 12 = 144, a raiz quadrada de 144 é 12." },
  { q: "Um triângulo tem ângulos de 50° e 60°. Qual é o terceiro?", options: ["60°", "70°", "80°", "90°"], answer: 1, explanation: "A soma dos ângulos internos é 180°. Então 180° − 50° − 60° = 70°." },
];

function PixelMark() {
  return <span className="pixel-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>;
}

function Index() {
  const [grade, setGrade] = useState("9º ano");
  const [topic, setTopic] = useState("Equação do 2º grau");
  const [difficulty, setDifficulty] = useState("No meu ritmo");
  const [mode, setMode] = useState<"practice" | "doubt" | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [chat, setChat] = useState<{from: string; text: string}[]>([]);
  const topics = useMemo(() => topicsByGrade[grade] ?? topicsByGrade["9º ano"], [grade]);
  const question = questions[questionIndex % questions.length];

  function chooseGrade(value: string) {
    setGrade(value);
    setTopic((topicsByGrade[value] ?? topicsByGrade["9º ano"])[0]);
  }
  function nextQuestion() {
    setQuestionIndex((n) => n + 1);
    setSelected(null);
    setShowExplanation(false);
  }
  function sendDoubt() {
    const text = doubt.trim();
    if (!text) return;
    setChat((items) => [...items, { from: "you", text }, { from: "friend", text: "Boa pergunta! Para resolver, vamos por partes: identifique o que o exercício está pedindo, separe os dados importantes e escolha a regra matemática que conecta essas informações. Se você enviar o enunciado completo, posso ajudar a analisar cada etapa. (Esta é uma resposta demonstrativa; a IA ainda precisa ser conectada.)" }]);
    setDoubt("");
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Hello Friend, início"><PixelMark /><span>hello friend<span className="brand-dot">.</span></span></a>
        <nav className="desktop-nav"><a href="#como-funciona">Como funciona</a><a href="#experiencias">O que você pode fazer</a><a href="#conteudos">Conteúdos</a></nav>
        <a className="top-cta" href="#comecar">Bora estudar <ArrowRight size={16} /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> MATEMÁTICA DO SEU JEITO</div>
          <h1>Matemática fica<br />mais fácil com um<br /><span>amigo do lado.</span></h1>
          <p className="hero-description">Aprenda no seu ritmo, pratique sem medo e tire suas dúvidas. Um passo de cada vez — você consegue.</p>
          <div className="hero-actions"><a className="button-primary" href="#comecar">Vamos nessa <ArrowRight size={17} /></a><a className="text-link" href="#como-funciona">Conheça a ideia <span>↓</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>✦</span><span>∑</span><span>π</span></div><p><strong>Do 4º ano ao Ensino Médio</strong><br />Feito para aprender de verdade.</p></div>
        </div>
        <div className="hero-art-wrap">
          <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
          <div className="math-card card-back"><span className="mini-label">DESAFIO DO DIA</span><div className="mini-equation">x + 7 = 12</div><div className="mini-answer">x = 5 <Check size={13} /></div></div>
          <div className="pixel-scene">
            <div className="scene-sun" />
            <div className="scene-cloud cloud-a" /><div className="scene-cloud cloud-b" />
            <div className="scene-hill hill-a" /><div className="scene-hill hill-b" />
            <div className="pixel-person"><div className="person-hair" /><div className="person-head" /><div className="person-body" /><div className="person-arm" /><div className="person-leg leg-a" /><div className="person-leg leg-b" /></div>
            <div className="pixel-book"><div /><div /><div /></div>
            <div className="scene-ground" />
          </div>
          <div className="floating-note"><span className="note-icon"><Sparkles size={17} /></span><div><strong>Você tá evoluindo!</strong><small>Cada exercício conta ✨</small></div></div>
          <div className="hero-caption">PEQUENOS PASSOS, GRANDES DESCOBERTAS <span>↗</span></div>
        </div>
      </section>

      <section className="ticker" aria-label="Nosso jeito de aprender"><div>SEM PRESSA <span>✳</span> SEM JULGAMENTO <span>✳</span> NO SEU RITMO <span>✳</span> CURIOSIDADE SEMPRE <span>✳</span> SEM PRESSA <span>✳</span> SEM JULGAMENTO <span>✳</span> NO SEU RITMO <span>✳</span></div></section>

      <section className="experience-section section-pad" id="experiencias">
        <div className="section-heading"><div><div className="eyebrow">UM JEITO MAIS LEVE</div><h2>Por onde vamos<br /><span>começar?</span></h2></div><p>Não existe um único jeito de aprender. Escolha o que faz sentido pra você hoje.</p></div>
        <div className="experience-grid">
          <article className="experience-card learn-card"><div className="card-topline"><span className="card-number">01 / APRENDER</span><span className="card-icon"><BookOpen size={20} /></span></div><div className="doodle doodle-book">▤</div><h3>Quero entender<br />melhor.</h3><p>Explicações claras, exemplos do dia a dia e conceitos que finalmente fazem sentido.</p><a href="#comecar" onClick={() => setMode("practice")}>Aprender um assunto <ArrowRight size={16} /></a></article>
          <article className="experience-card practice-card"><div className="card-topline"><span className="card-number">02 / PRATICAR</span><span className="card-icon"><Target size={20} /></span></div><div className="doodle doodle-target">✳</div><h3>Quero colocar<br />em prática.</h3><p>Exercícios no seu nível, com dicas e explicações para cada resposta.</p><a href="#comecar" onClick={() => setMode("practice")}>Montar exercícios <ArrowRight size={16} /></a></article>
          <article className="experience-card doubt-card"><div className="card-topline"><span className="card-number">03 / PERGUNTAR</span><span className="card-icon"><MessageCircle size={20} /></span></div><div className="doodle doodle-question">?</div><h3>Travei numa<br />questão.</h3><p>Pode perguntar. A gente divide o problema em passos menores, sem julgamento.</p><a href="#comecar" onClick={() => setMode("doubt")}>Tirar uma dúvida <ArrowRight size={16} /></a></article>
        </div>
      </section>

      <section className="how-section section-pad" id="como-funciona">
        <div className="how-illustration"><div className="how-sticker sticker-top">PASSO A PASSO <span>↘</span></div><div className="big-pixel-star">✳</div><div className="how-equation"><span>2x</span><b>+</b><span>4</span><b>=</b><span className="equation-highlight">10</span></div><div className="how-check"><Check size={20} /></div><div className="how-sticker sticker-bottom">OPA, ACERTOU! ✦</div></div>
        <div className="how-copy"><div className="eyebrow">AQUI, ERRAR FAZ PARTE</div><h2>Não precisa<br />saber tudo.<br /><span>Só começar.</span></h2><p>A ideia é trocar aquela sensação de “não entendo nada” por “ahhh, agora entendi!”. Com exercícios do seu ano escolar e explicações sem complicação.</p><div className="how-points"><div><span>01</span><p><strong>Você escolhe</strong><br />Seu ano e o assunto que quer estudar.</p></div><div><span>02</span><p><strong>A gente pratica junto</strong><br />Uma questão por vez, com calma.</p></div><div><span>03</span><p><strong>Você ganha confiança</strong><br />Entendendo o porquê, não só decorando.</p></div></div></div>
      </section>

      <section className="start-section section-pad" id="comecar">
        <div className="start-heading"><div className="eyebrow"><span className="eyebrow-dot" /> SUA PRÓXIMA DESCOBERTA</div><h2>Tá, vamos de<br /><span>matemática?</span></h2><p>Escolha um caminho e a gente começa.</p></div>
        <div className="start-panel">
          <div className="panel-head"><div className="panel-icon"><GraduationCap size={21} /></div><div><h3>Monte seu momento de estudo</h3><p>Do seu jeito, no seu tempo.</p></div><span className="panel-step">01 — 02</span></div>
          <div className="field-grid"><label className="field-label">QUAL É O SEU ANO?<span className="select-wrap"><select value={grade} onChange={(e) => chooseGrade(e.target.value)}>{grades.map((g) => <option key={g}>{g}</option>)}</select><ChevronDown size={17} /></span></label><label className="field-label">O QUE VAMOS ESTUDAR?<span className="select-wrap"><select value={topic} onChange={(e) => setTopic(e.target.value)}>{topics.map((t) => <option key={t}>{t}</option>)}</select><ChevronDown size={17} /></span></label></div>
          <div className="difficulty-row"><span className="field-label">QUAL É O CLIMA DE HOJE?</span><div className="difficulty-options">{["Quero o básico", "No meu ritmo", "Pode desafiar"].map((d) => <button key={d} className={difficulty === d ? "difficulty-option active" : "difficulty-option"} onClick={() => setDifficulty(d)}>{d === "Quero o básico" ? "🌱" : d === "No meu ritmo" ? "🌿" : "🚀"} {d}</button>)}</div></div>
          <div className="mode-actions"><button className="mode-button primary-mode" onClick={() => { setMode("practice"); setSelected(null); setShowExplanation(false); }}><span className="mode-symbol"><Target size={19} /></span><span><strong>Quero praticar</strong><small>Exercícios sobre {topic.toLowerCase()}</small></span><ArrowRight size={18} /></button><button className="mode-button" onClick={() => setMode("doubt")}><span className="mode-symbol question-symbol"><CircleHelp size={19} /></span><span><strong>Tenho uma dúvida</strong><small>Vamos pensar juntos</small></span><ArrowRight size={18} /></button></div>
          {mode === "practice" && <div className="demo-panel"><div className="demo-top"><span className="demo-tag">EXERCÍCIO DEMONSTRATIVO</span><button className="close-demo" onClick={() => setMode(null)} aria-label="Fechar"><X size={17} /></button></div><p className="demo-meta">{grade} · {topic} · {difficulty}</p><h3>{question.q}</h3><div className="answer-options">{question.options.map((option, i) => <button key={option} onClick={() => { setSelected(i); setShowExplanation(false); }} className={selected === i ? "answer-option selected" : "answer-option"}><span>{String.fromCharCode(65 + i)}</span>{option}{showExplanation && i === question.answer && <Check size={17} />}</button>)}</div>{selected !== null && <div className={showExplanation ? (selected === question.answer ? "feedback correct" : "feedback incorrect") : "feedback"}>{showExplanation ? <><strong>{selected === question.answer ? "Boa! Você acertou." : "Quase! Vamos entender."}</strong><p>{question.explanation}</p><small>Questões exibidas aqui são exemplos locais. A geração por IA será conectada ao backend.</small><button onClick={nextQuestion}>Próxima questão <ArrowRight size={15} /></button></> : <button onClick={() => setShowExplanation(true)}>Conferir resposta <ArrowRight size={15} /></button>}</div>}</div>}
          {mode === "doubt" && <div className="demo-panel"><div className="demo-top"><span className="demo-tag">ESPAÇO DE DÚVIDAS</span><button className="close-demo" onClick={() => setMode(null)} aria-label="Fechar"><X size={17} /></button></div><h3>O que está pegando?</h3><p className="doubt-intro">Escreva sua dúvida ou cole o enunciado da questão. Este chat ainda está em modo demonstrativo.</p><div className="chat-history">{chat.map((item, i) => <div key={i} className={item.from === "you" ? "chat-bubble user-bubble" : "chat-bubble friend-bubble"}>{item.text}</div>)}</div><form className="doubt-form" onSubmit={(e) => { e.preventDefault(); sendDoubt(); }}><input value={doubt} onChange={(e) => setDoubt(e.target.value)} placeholder="Ex.: como resolvo 2x + 4 = 10?" /><button type="submit" aria-label="Enviar dúvida"><ArrowRight size={18} /></button></form></div>}
          <p className="panel-footnote"><Lightbulb size={15} /> Sem pressão: você pode mudar de ideia quando quiser.</p>
        </div>
      </section>

      <section className="topics-section section-pad" id="conteudos"><div className="topics-head"><div><div className="eyebrow">UM UNIVERSO DE IDEIAS</div><h2>Tem matemática<br /><span>pra todo mundo.</span></h2></div><p>Do primeiro contato com frações aos desafios do ENEM, seu próximo passo começa aqui.</p></div><div className="topic-chips">{["➗ Operações", "½ Frações", "x Equações", "△ Geometria", "% Porcentagem", "π Funções", "↗ Estatística", "√ Raízes"].map((t) => <span key={t}>{t}</span>)}</div><div className="topics-bottom"><span>4º ANO — 3º ANO DO ENSINO MÉDIO</span><span>APRENDER É UM CAMINHO <span className="pixel-heart">♥</span></span></div></section>

      <footer className="footer"><a className="brand" href="#inicio"><PixelMark /><span>hello friend<span className="brand-dot">.</span></span></a><p>Feito pra aprender junto. <span>✳</span></p><a href="#inicio" className="back-top">Voltar ao topo ↑</a></footer>
    </main>
  );
}
