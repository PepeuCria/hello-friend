import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronRight, CircleCheck, Compass, Leaf, LockKeyhole, Waves } from "lucide-react";

export const Route = createFileRoute("/")({ component: PreDiveGuide });

const topics = [
  { number: "01", tag: "VIDA MARINHA", title: "O equilíbrio da vida no oceano", summary: "Cada espécie tem um papel. Quando uma população diminui ou desaparece, todo o ecossistema pode sentir os efeitos.", detail: "Peixes, corais, algas e pequenos organismos formam uma rede de relações. Proteger a biodiversidade é proteger o equilíbrio que torna o mergulho possível.", icon: "◌" },
  { number: "02", tag: "RESÍDUOS", title: "Plástico não pertence ao mar", summary: "Sacolas, embalagens e microplásticos podem ser confundidos com alimento e prejudicar animais marinhos.", detail: "O lixo pode permanecer no ambiente por muito tempo, ferir animais e se fragmentar em partículas difíceis de remover. O melhor resíduo é aquele que não chega à água.", icon: "⌁" },
  { number: "03", tag: "RECIFES", title: "Recifes são vivos e frágeis", summary: "Corais podem ser danificados por contato, pisadas, equipamentos e sedimentos levantados sem cuidado.", detail: "Mantenha flutuabilidade neutra, observe sem tocar e tenha atenção à posição das nadadeiras. Um pequeno contato pode causar danos que levam muito tempo para se recuperar.", icon: "✳" },
  { number: "04", tag: "POLUIÇÃO", title: "O que vai para a água não desaparece", summary: "Óleo, produtos químicos e esgoto podem degradar a qualidade da água e afetar a saúde dos ecossistemas.", detail: "A poluição pode reduzir a qualidade do habitat e afetar diferentes organismos. Respeitar as regras locais e evitar qualquer descarte é parte de uma prática responsável.", icon: "≈" },
  { number: "05", tag: "CONDUTA", title: "Mergulhar sem deixar marcas", summary: "Alimentar animais, perseguir a vida marinha ou retirar objetos altera o ambiente e pode colocar seres vivos em risco.", detail: "Observe à distância, não alimente os animais e não retire nada do fundo. Siga as orientações do guia e mantenha uma atitude calma e consciente durante todo o mergulho.", icon: "◎" },
];

const questions = [
  { q: "Por que a biodiversidade é importante para o oceano?", options: ["Porque todas as espécies fazem exatamente a mesma coisa", "Porque as espécies participam de uma rede de relações ecológicas", "Porque impede que o oceano tenha correntes", "Porque elimina a necessidade de conservação"], answer: 1, explanation: "As espécies estão conectadas e contribuem para o equilíbrio dos ecossistemas." },
  { q: "Qual é uma consequência possível do plástico no mar?", options: ["Ele sempre se dissolve sem deixar resíduos", "Ele melhora a alimentação dos peixes", "Animais podem ingeri-lo ou ficar presos nele", "Ele transforma água salgada em água doce"], answer: 2, explanation: "Resíduos podem ser ingeridos ou causar ferimentos e emaranhamento." },
  { q: "Qual atitude ajuda a proteger os recifes durante o mergulho?", options: ["Apoiar a mão no coral para tirar uma foto", "Manter boa flutuabilidade e não tocar", "Agitar as nadadeiras perto do fundo", "Levar um fragmento como lembrança"], answer: 1, explanation: "Boa flutuabilidade e distância segura reduzem o risco de danos físicos." },
  { q: "Por que não devemos descartar óleo ou produtos químicos na água?", options: ["Porque podem contaminar a água e afetar organismos", "Porque deixam a água mais transparente", "Porque só afetam objetos sem vida", "Porque desaparecem instantaneamente"], answer: 0, explanation: "Poluentes podem comprometer a qualidade da água e os habitats." },
  { q: "Qual comportamento é mais responsável ao encontrar um animal marinho?", options: ["Persegui-lo para conseguir uma foto", "Oferecer alimento para atraí-lo", "Observar à distância sem interferir", "Tocá-lo para verificar se está saudável"], answer: 2, explanation: "Observar sem perseguir, tocar ou alimentar reduz o estresse e a interferência." },
  { q: "O que fazer se sua nadadeira estiver muito perto de um coral?", options: ["Bater mais forte para se afastar rápido", "Parar, recuperar o controle e ajustar a posição com cuidado", "Apoiar-se no coral para estabilizar", "Arrancar o coral que estiver no caminho"], answer: 1, explanation: "Movimentos controlados e boa flutuabilidade ajudam a evitar contato." },
  { q: "Qual é a melhor forma de lidar com o próprio lixo antes de um passeio?", options: ["Deixá-lo no barco para alguém encontrar no mar", "Enterrá-lo na areia", "Guardá-lo e descartá-lo corretamente em terra", "Jogá-lo longe da costa"], answer: 2, explanation: "Todo resíduo deve ser mantido sob controle e destinado corretamente." },
  { q: "Por que não se deve alimentar animais marinhos?", options: ["Porque pode alterar seu comportamento e sua alimentação", "Porque todos os animais marinhos não precisam de energia", "Porque isso torna a água mais salgada", "Porque só é proibido à noite"], answer: 0, explanation: "Alimentar animais pode mudar comportamentos naturais e criar riscos." },
  { q: "O que significa observar a vida marinha de forma responsável?", options: ["Chegar o mais perto possível a qualquer custo", "Retirar organismos para identificá-los em casa", "Respeitar a distância e não interferir no ambiente", "Usar o flash encostando nos animais"], answer: 2, explanation: "A observação responsável prioriza a segurança e a mínima interferência." },
  { q: "Se perceber alguém danificando o ambiente, qual é a atitude mais adequada?", options: ["Imitar a pessoa para não ficar de fora", "Ignorar sempre, mesmo havendo risco", "Agir com segurança e avisar o guia ou responsável", "Discutir debaixo d'água sem sinalizar"], answer: 2, explanation: "Siga os procedimentos do grupo e comunique o guia de forma segura." },
];

function PreDiveGuide() {
  const [stage, setStage] = useState<"intro" | "reading" | "quiz" | "result">("intro");
  const [read, setRead] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [name, setName] = useState("");
  const quizQuestions = useMemo(() => questions, []);

  function markRead(i: number) { setRead((current) => current.includes(i) ? current : [...current, i]); }
  function startQuiz() { setAnswers({}); setQuestionIndex(0); setStage("quiz"); }
  function finishQuiz() {
    const total = quizQuestions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
    setScore(total); setPassed(total >= 8); setStage("result");
  }
  function restartQuiz() { setAnswers({}); setQuestionIndex(0); setStage("quiz"); }

  return (
    <main className="ocean-site">
      <header className="nav">
        <a className="brand" href="#top" aria-label="Mar Sem Marcas, início"><span className="brand-mark"><Waves size={21} /></span><span>MAR SEM <b>MARCAS.</b></span></a>
        <div className="nav-label"><span className="status-dot" /> GUIA DE CONSCIÊNCIA MARINHA</div>
        <a className="nav-help" href="#sobre">Sobre o guia <ArrowRight size={15} /></a>
      </header>

      <section className="hero-ocean" id="top">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="kicker"><span /> UMA EXPERIÊNCIA DE MERGULHO MAIS CONSCIENTE</div>
          <h1>O oceano não é<br />apenas um lugar.<br /><em>É um compromisso.</em></h1>
          <p>Antes de mergulhar, conheça o mundo que veio visitar. Pequenas atitudes na superfície fazem uma diferença enorme lá embaixo.</p>
          <button className="button-light" onClick={() => setStage("reading")}>Começar preparação <ArrowDown size={17} /></button>
          <div className="hero-note"><LockKeyhole size={15} /><span>Leitura + avaliação de conhecimento antes do mergulho</span></div>
        </div>
        <div className="hero-bottom"><span>GUIA PRÉ-MERGULHO · PROTÓTIPO 01</span><span>01 — 05 <Waves size={17} /></span></div>
      </section>

      {stage === "intro" && <section className="intro-strip"><div className="intro-icon"><Compass size={22} /></div><div><strong>Um mergulho começa antes de entrar na água.</strong><p>Leia os cinco temas e, ao final, responda a um quiz de 10 perguntas. É necessário acertar pelo menos 8 para concluir esta etapa educativa.</p></div><button className="text-button" onClick={() => setStage("reading")}>Entendi <ArrowRight size={16} /></button></section>}

      {stage === "reading" && <section className="guide-section" id="guia">
        <div className="section-top"><div><div className="kicker dark-kicker">ANTES DE ENTRAR NA ÁGUA</div><h2>Conhecer para<br /><em>preservar.</em></h2></div><div className="reading-counter"><span>{read.length.toString().padStart(2, "0")}</span> / 05 temas lidos<div className="progress-track"><i style={{ width: `${read.length * 20}%` }} /></div></div></div>
        <div className="topic-list">{topics.map((topic, i) => <article className={read.includes(i) ? "topic-card topic-read" : "topic-card"} key={topic.number}>
          <div className="topic-number">{topic.number}</div><div className="topic-body"><div className="topic-tag">{topic.tag}</div><h3>{topic.title}</h3><p className="topic-summary">{topic.summary}</p><details><summary>Ler mais <ChevronRight size={15} /></summary><p>{topic.detail}</p></details></div><div className="topic-symbol">{topic.icon}</div>
          <button className={read.includes(i) ? "read-button is-read" : "read-button"} onClick={() => markRead(i)}>{read.includes(i) ? <><Check size={15} /> Lido</> : "Marcar como lido"}</button>
        </article>)}</div>
        <div className="quiz-gate"><div><span className="gate-icon"><Leaf size={20} /></span><div><strong>Pronto para testar o que aprendeu?</strong><p>{read.length < 5 ? `Marque os ${5 - read.length} tema(s) restante(s) como lidos para liberar a avaliação.` : "Todos os temas foram lidos. A avaliação está liberada."}</p></div></div><button disabled={read.length < 5} className="button-dark" onClick={startQuiz}>Iniciar quiz <ArrowRight size={16} /></button></div>
      </section>}

      {stage === "quiz" && <section className="quiz-section"><div className="quiz-heading"><div className="kicker dark-kicker">AVALIAÇÃO PRÉ-MERGULHO</div><h2>Conhecimento é<br /><em>proteção.</em></h2><p>Responda com atenção. Você precisa de 8 acertos em 10 para concluir.</p><div className="quiz-progress"><span>PERGUNTA {String(questionIndex + 1).padStart(2, "0")} / 10</span><div className="progress-track"><i style={{ width: `${(questionIndex + 1) * 10}%` }} /></div></div></div>
        <div className="quiz-card"><div className="quiz-card-top"><span>QUESTÃO {String(questionIndex + 1).padStart(2, "0")}</span><span><Waves size={15} /> CONSCIÊNCIA OCEÂNICA</span></div><h3>{quizQuestions[questionIndex].q}</h3><div className="answer-list">{quizQuestions[questionIndex].options.map((option, i) => <button key={option} className={answers[questionIndex] === i ? "answer-option chosen" : "answer-option"} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: i }))}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span>{answers[questionIndex] === i && <Check size={17} />}</button>)}</div><div className="quiz-card-footer"><button className="back-button" onClick={() => questionIndex === 0 ? setStage("reading") : setQuestionIndex(questionIndex - 1)}><ArrowLeft size={16} /> Anterior</button><span>{Object.keys(answers).length} de 10 respondidas</span>{questionIndex < 9 ? <button className="button-dark" disabled={answers[questionIndex] === undefined} onClick={() => setQuestionIndex(questionIndex + 1)}>Próxima <ArrowRight size={16} /></button> : <button className="button-dark" disabled={Object.keys(answers).length !== 10} onClick={finishQuiz}>Ver resultado <Check size={16} /></button>}</div></div>
      </section>}

      {stage === "result" && <section className="result-section"><div className={passed ? "result-icon passed" : "result-icon"}>{passed ? <CircleCheck size={36} /> : <Waves size={36} />}</div><div className="kicker dark-kicker">RESULTADO DA AVALIAÇÃO</div><h2>{passed ? "Você está no caminho
certo." : "Vamos reforçar
esse conhecimento."}</h2><div className="score-line"><strong>{score}<span>/10</span></strong><div><b>{passed ? "Meta atingida" : "Ainda não atingiu a meta"}</b><p>{passed ? "Você alcançou a pontuação mínima deste guia educativo." : "Você precisa de pelo menos 8 acertos. Revise os temas e tente novamente."}</p></div></div><div className={passed ? "result-status passed-status" : "result-status"}>{passed ? <><Check size={17} /> ETAPA EDUCATIVA CONCLUÍDA</> : <><LockKeyhole size={17} /> ETAPA EDUCATIVA NÃO CONCLUÍDA</>}</div><p className="result-disclaimer">Este resultado confirma apenas a conclusão do guia educativo. Ele não substitui a instrução de segurança, a avaliação do instrutor ou os requisitos operacionais da empresa de mergulho.</p><div className="result-actions"><button className="button-dark" onClick={() => { setStage("reading"); setRead([]); }}>Revisar os temas <ArrowLeft size={16} /></button>{!passed && <button className="button-outline" onClick={restartQuiz}>Tentar quiz novamente <ArrowRight size={16} /></button>}</div></section>}

      <section className="about-section" id="sobre"><div className="about-mark"><Waves size={26} /></div><div><div className="kicker">PARA QUEM CUIDA DO MAR</div><h2>Uma boa experiência<br />também protege <em>o oceano.</em></h2></div><p>Um guia digital pensado para centros de mergulho prepararem seus visitantes com informação clara, uma experiência simples e uma cultura de respeito ao ambiente marinho.</p></section>
      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Waves size={18} /></span><span>MAR SEM <b>MARCAS.</b></span></a><span>PROTÓTIPO 01 · CONTEÚDO TEMPORÁRIO</span><span>Explore com respeito. Deixe apenas bolhas.</span></footer>
    </main>
  );
}
