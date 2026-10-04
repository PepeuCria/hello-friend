import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ClipboardEvent, type ChangeEvent } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, GraduationCap, ImagePlus, Lightbulb, MessageCircle, RefreshCw, Sparkles, Target, Upload, X } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

const grades = ["4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1º ano EM", "2º ano EM", "3º ano EM"];




declare global {
  interface Window { katex?: { renderToString: (math: string, options?: Record<string, unknown>) => string } }
}

function MathText({ text, className = "" }: { text: string; className?: string }) {
  const [ready, setReady] = useState(() => typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-katex="true"]');
    const script = existing ?? document.createElement("script");
    const finish = () => setReady(!!window.katex);
    if (!existing) {
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js";
      script.async = true;
      script.dataset.katex = "true";
      script.onload = finish;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", finish, { once: true });
    }
    const css = document.querySelector('link[data-katex-css="true"]') ?? document.createElement("link");
    if (!css.parentNode) {
      css.rel = "stylesheet";
      css.href = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css";
      css.dataset.katexCss = "true";
      document.head.appendChild(css);
    }
    return () => { script.removeEventListener("load", finish); };
  }, []);
  const renderParts = () => {
    const parts: { value: string; math: boolean; display: boolean }[] = [];
    const pattern = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > last) parts.push({ value: text.slice(last, index), math: false, display: false });
      const raw = match[0];
      const display = raw.startsWith("\\[") || raw.startsWith("$$");
      const value = raw.startsWith("$") && !raw.startsWith("$$") ? raw.slice(1, -1) : raw.slice(2, -2);
      parts.push({ value, math: true, display });
      last = index + raw.length;
    }
    if (last < text.length || parts.length === 0) parts.push({ value: text.slice(last), math: false, display: false });
    return parts;
  };
  if (!ready || !window.katex) return <span className={className}>{text}</span>;
  return <div className={`math-text ${className}`}>{renderParts().map((part, i) => part.math ? <span key={i} className={part.display ? "math-display" : "math-inline"} dangerouslySetInnerHTML={{ __html: window.katex!.renderToString(part.value, { displayMode: part.display, throwOnError: false, strict: "ignore" }) }} /> : <span key={i}>{part.value}</span>)}</div>;
}


function ChatMessage({ text }: { text: string }) {
  // Normalize escaped Markdown sometimes returned by the model, then render each paragraph/list item separately.
  const normalized = text.replace(/\\r\\n?/g, "\n").replace(/\\\\([*#_~`>-])/g, "$1").replace(/\\\\n/g, "\n").trim();
  const lines = normalized.split("\n");
  const inline = (value: string) => value.split(/(\\*\\*[^*]+\\*\\*|\\*[^*]+\\*|\x60[^\x60]+\x60)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return <MathText key={i} text={part} />;
  });
  return <div className="chat-message">{lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div className="chat-spacer" key={i} />;
    if (/^---+$/.test(trimmed)) return <hr key={i} />;
    if (/^#{1,3}\\s+/.test(trimmed)) return <h3 key={i}>{inline(trimmed.replace(/^#{1,3}\\s+/, ""))}</h3>;
    if (/^[-*•]\\s+/.test(trimmed)) return <div className="chat-list-item" key={i}><span>•</span><div>{inline(trimmed.replace(/^[-*•]\\s+/, ""))}</div></div>;
    if (/^\\d+[.)]\\s+/.test(trimmed)) return <div className="chat-list-item numbered" key={i}><span>{trimmed.match(/^\\d+/)?.[0]}.</span><div>{inline(trimmed.replace(/^\\d+[.)]\\s+/, ""))}</div></div>;
    return <p key={i}>{inline(trimmed)}</p>;
  })}</div>;
}
function Index() {
  const [grade, setGrade] = useState("9º ano");
  const [topic, setTopic] = useState("Equação do 2º grau");
  const [generatedExercises, setGeneratedExercises] = useState<{question:string; options:string[]; answerIndex:number; explanation:string; steps:string[]}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});
  const [revealedExercises, setRevealedExercises] = useState<Record<number, boolean>>({});
  const [difficulty, setDifficulty] = useState("No meu ritmo");
  const [mode, setMode] = useState<"practice" | "doubt" | null>(null);
  const [doubt, setDoubt] = useState("");
  const [chat, setChat] = useState<{from: string; text: string}[]>([]);
  const [screenshots, setScreenshots] = useState<{name: string; dataUrl: string}[]>([]);
  const [isSendingDoubt, setIsSendingDoubt] = useState(false);
  const [doubtError, setDoubtError] = useState("");
  const screenshotInput = useRef<HTMLInputElement>(null);
  async function addScreenshotFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const remaining = Math.max(0, 3 - screenshots.length);
    if (files.length > remaining) setGenerationError("Você pode adicionar no máximo 3 prints.");
    const accepted = files.slice(0, remaining);
    const loaded = await Promise.all(accepted.map((file) => new Promise<{name:string;dataUrl:string}|null>((resolve) => {
      if (file.size > 5 * 1024 * 1024) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? {name:file.name || "print",dataUrl:reader.result} : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    })));
    const valid = loaded.filter((item): item is {name:string;dataUrl:string} => item !== null);
    setScreenshots((current) => [...current, ...valid].slice(0,3));
    if (valid.length < accepted.length) setGenerationError("Algum print passou de 5 MB ou não pôde ser lido. Use imagens menores.");
    else setGenerationError("");
  }
  function handleScreenshotPaste(event: ClipboardEvent<HTMLElement>) {
    const files = Array.from(event.clipboardData.items).filter((item)=>item.type.startsWith("image/")).map((item)=>item.getAsFile()).filter((file):file is File=>file!==null);
    if(files.length){event.preventDefault();void addScreenshotFiles(files);}
  }
  function handleScreenshotSelect(event: ChangeEvent<HTMLInputElement>) {
    if(event.target.files) void addScreenshotFiles(event.target.files);
    event.target.value="";
  }

  function chooseGrade(value: string) {
    setGrade(value);
    setGeneratedExercises([]);
    setGenerationError("");
  }
  async function generateExercises() {
    if (!topic.trim()) { setGenerationError("Escreva a matéria ou o assunto que quer estudar."); setMode("practice"); return; }
    setMode("practice"); setIsGenerating(true); setGenerationError(""); setGeneratedExercises([]); setExerciseAnswers({}); setRevealedExercises({});
    try {
      const response = await fetch("/api/generate-exercises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, topic: topic.trim(), difficulty, images: screenshots.map((item) => item.dataUrl) }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível gerar os exercícios agora.");
      setGeneratedExercises(payload.exercises);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Erro ao gerar exercícios. Tente novamente.");
    } finally { setIsGenerating(false); }
  }
  async function sendDoubt() {
    const text=doubt.trim();
    if((!text && screenshots.length===0)||isSendingDoubt)return;
    setChat(items=>[...items,{from:"you",text:text||"Pode me explicar a questão dos prints?"}]);
    setDoubt("");setDoubtError("");setIsSendingDoubt(true);
    try {
      const response=await fetch("/api/ask-doubt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grade,question:text,images:screenshots.map(item=>item.dataUrl)})});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Não foi possível responder agora.");
      setChat(items=>[...items,{from:"friend",text:payload.answer}]);
    } catch(error) {setDoubtError(error instanceof Error?error.message:"Erro ao enviar a dúvida. Tente novamente.");}
    finally {setIsSendingDoubt(false);}
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Xplica, início"><img src="/xplica-logo.svg" alt="Xplica — matemática do seu jeito" /></a>
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
        <div className="start-panel" onPaste={handleScreenshotPaste}>
          <div className="panel-head"><div className="panel-icon"><GraduationCap size={21} /></div><div><h3>Monte seu momento de estudo</h3><p>Do seu jeito, no seu tempo.</p></div><span className="panel-step">01 — 02</span></div>
          <div className="field-grid"><label className="field-label">QUAL É O SEU ANO?<span className="select-wrap"><select value={grade} onChange={(e) => chooseGrade(e.target.value)}>{grades.map((g) => <option key={g}>{g}</option>)}</select><ChevronDown size={17} /></span></label><label className="field-label">QUAL MATÉRIA OU ASSUNTO?<span className="topic-input-wrap"><input className="topic-input" value={topic} onChange={(e) => { setTopic(e.target.value); setGeneratedExercises([]); }} placeholder="Ex.: equação do 2º grau, frações..." /><small>Escreva com suas palavras. A IA interpreta o tema.</small></span></label></div>
          <div className="screenshot-area"><div className="screenshot-heading"><ImagePlus size={18}/><div><strong>Tem uma questão em print?</strong><small>Cole com Ctrl+V ou selecione até 3 imagens (PNG, JPG ou WEBP, até 5 MB cada).</small></div></div><input ref={screenshotInput} className="screenshot-file-input" type="file" accept="image/*" multiple onChange={handleScreenshotSelect}/><button type="button" className="screenshot-add" onClick={()=>screenshotInput.current?.click()} disabled={screenshots.length>=3}><Upload size={15}/> Adicionar prints ({screenshots.length}/3)</button>{screenshots.length>0&&<div className="screenshot-list">{screenshots.map((item,i)=><div className="screenshot-thumb" key={item.dataUrl}><img src={item.dataUrl} alt={item.name}/><span>Print {i+1}</span><button type="button" onClick={()=>setScreenshots(current=>current.filter((_,j)=>j!==i))} aria-label={`Remover print ${i+1}`}><X size={14}/></button></div>)}</div>}{generationError&&!isGenerating&&<p className="screenshot-error">{generationError}</p>}</div><div className="difficulty-row"><span className="field-label">QUAL É O CLIMA DE HOJE?</span><div className="difficulty-options">{["Quero o básico", "No meu ritmo", "Pode desafiar"].map((d) => <button key={d} className={difficulty === d ? "difficulty-option active" : "difficulty-option"} onClick={() => setDifficulty(d)}>{d === "Quero o básico" ? "🌱" : d === "No meu ritmo" ? "🌿" : "🚀"} {d}</button>)}</div></div>
          <div className="mode-actions"><button className="mode-button primary-mode" onClick={generateExercises}><span className="mode-symbol"><Target size={19} /></span><span><strong>Quero praticar</strong><small>A IA cria exercícios para o seu ano</small></span><ArrowRight size={18} /></button><button className="mode-button" onClick={() => setMode("doubt")}><span className="mode-symbol question-symbol"><CircleHelp size={19} /></span><span><strong>Tenho uma dúvida</strong><small>Vamos pensar juntos</small></span><ArrowRight size={18} /></button></div>
          {mode === "practice" && <div className="demo-panel"><div className="demo-top"><span className="demo-tag">EXERCÍCIOS PERSONALIZADOS COM IA</span><button className="close-demo" onClick={() => setMode(null)} aria-label="Fechar"><X size={17} /></button></div><p className="demo-meta">{grade} · {topic} · {difficulty}</p>{isGenerating ? <div className="ai-loading"><Sparkles size={22} /><h3>Preparando seus exercícios...</h3><p>A IA está interpretando o assunto e adaptando a explicação ao seu ano escolar.</p></div> : generationError ? <div className="ai-error"><p>{generationError}</p><button className="ai-retry" onClick={generateExercises}>Tentar novamente <RefreshCw size={15} /></button></div> : generatedExercises.length > 0 ? <><p className="ai-intro">Criamos {generatedExercises.length} questões sobre <strong>{topic}</strong>, com linguagem e dificuldade adequadas ao {grade}.</p>{generatedExercises.map((exercise, index) => <article className="generated-exercise" key={index}><div className="exercise-count">QUESTÃO {index + 1} DE {generatedExercises.length}</div><MathText text={exercise.question} className="exercise-question" /><div className="answer-options">{exercise.options.map((option, optionIndex) => <button key={optionIndex} onClick={() => setExerciseAnswers(prev => ({...prev, [index]: optionIndex}))} className={exerciseAnswers[index] === optionIndex ? "answer-option selected" : "answer-option"}><span>{String.fromCharCode(65 + optionIndex)}</span><MathText text={option} className="option-math" />{revealedExercises[index] && optionIndex === exercise.answerIndex && <Check size={17} />}</button>)}</div>{exerciseAnswers[index] !== undefined && <button className="reveal-answer" onClick={() => setRevealedExercises(prev => ({...prev, [index]: true}))}>{revealedExercises[index] ? "Explicação exibida" : "Ver resposta e explicação"} <ArrowRight size={15} /></button>}{revealedExercises[index] && <div className={exerciseAnswers[index] === exercise.answerIndex ? "feedback correct" : "feedback incorrect"}><strong>{exerciseAnswers[index] === exercise.answerIndex ? "Boa! Você acertou." : "Vamos aprender com essa tentativa."}</strong><p><strong>Resposta:</strong> {exercise.options[exercise.answerIndex]}</p><MathText text={exercise.explanation} className="feedback-math" />{exercise.steps?.length > 0 && <ol>{exercise.steps.map((step, stepIndex) => <li key={stepIndex}><MathText text={step} /></li>)}</ol>}</div>}</article>)}<button className="ai-retry" onClick={generateExercises}>Gerar novos exercícios <RefreshCw size={15} /></button></> : <p>Peça para gerar os exercícios para começar.</p>}</div>}
          {mode === "doubt" && <div className="demo-panel"><div className="demo-top"><span className="demo-tag">ESPAÇO DE DÚVIDAS</span><button className="close-demo" onClick={() => setMode(null)} aria-label="Fechar"><X size={17} /></button></div><h3>O que está pegando?</h3><p className="doubt-intro">Escreva sua dúvida ou envie prints da questão. Você pode colar imagens com Ctrl+V na área de estudo ou usar o botão acima.</p><div className="chat-history">{chat.map((item, i) => <div key={i} className={item.from === "you" ? "chat-bubble user-bubble" : "chat-bubble friend-bubble"}><ChatMessage text={item.text} /></div>)}</div>{doubtError&&<p className="screenshot-error">{doubtError}</p>}{isSendingDoubt&&<p className="ai-loading">Analisando sua dúvida e os prints...</p>}<form className="doubt-form" onSubmit={e=>{e.preventDefault();void sendDoubt();}}><input value={doubt} onChange={e=>setDoubt(e.target.value)} placeholder="Escreva sua dúvida..."/><button type="submit" aria-label="Enviar dúvida" disabled={isSendingDoubt||(!doubt.trim()&&screenshots.length===0)}><ArrowRight size={18}/></button></form></div>}
          <p className="panel-footnote"><Lightbulb size={15} /> Sem pressão: você pode mudar de ideia quando quiser.</p>
        </div>
      </section>

      <section className="topics-section section-pad" id="conteudos"><div className="topics-head"><div><div className="eyebrow">UM UNIVERSO DE IDEIAS</div><h2>Tem matemática<br /><span>pra todo mundo.</span></h2></div><p>Do primeiro contato com frações aos desafios do ENEM, seu próximo passo começa aqui.</p></div><div className="topic-chips">{["➗ Operações", "½ Frações", "x Equações", "△ Geometria", "% Porcentagem", "π Funções", "↗ Estatística", "√ Raízes"].map((t) => <span key={t}>{t}</span>)}</div><div className="topics-bottom"><span>4º ANO — 3º ANO DO ENSINO MÉDIO</span><span>APRENDER É UM CAMINHO <span className="pixel-heart">♥</span></span></div></section>

      <footer className="footer"><a className="brand" href="#inicio"><img src="/xplica-logo.svg" alt="Xplica" /></a><p>Feito pra aprender junto. <span>✳</span></p><a href="#inicio" className="back-top">Voltar ao topo ↑</a></footer>
    </main>
  );
}
