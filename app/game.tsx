"use client";
import { useEffect, useRef, useState } from "react";
import { CheckinButton } from "./checkin-button";

const GRAVITY = 0.5, JUMP = -9, PIPE_SPEED = 3, PIPE_GAP = 160, PIPE_WIDTH = 60, BIRD_SIZE = 30;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<"menu"|"game"|"over">("menu");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const g = useRef({ bird: { y: 250, vy: 0 }, pipes: [] as any[], score: 0, frame: 0 });

  const jump = () => {
    if (screen === "game") g.current.bird.vy = JUMP;
    if (screen === "menu") startGame();
    if (screen === "over") setScreen("menu");
  };

  const startGame = () => {
    g.current = { bird: { y: 250, vy: 0 }, pipes: [], score: 0, frame: 0 };
    setScore(0); setScreen("game");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space") jump(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const loop = () => {
      const W = canvas.width, H = canvas.height, state = g.current;
      state.bird.vy += GRAVITY; state.bird.y += state.bird.vy; state.frame++;
      if (state.frame % 90 === 0) state.pipes.push({ x: W, top: 60 + Math.random() * (H - PIPE_GAP - 120) });
      state.pipes.forEach(p => p.x -= PIPE_SPEED);
      state.pipes = state.pipes.filter(p => p.x > -PIPE_WIDTH);
      state.pipes.forEach(p => { if (p.x < 80 && p.x > 20 && !p.scored) { p.scored = true; state.score++; setScore(state.score); } });
      const bx = 60, by = state.bird.y;
      const dead = by < 0 || by > H || state.pipes.some(p => bx + BIRD_SIZE/2 > p.x && bx - BIRD_SIZE/2 < p.x + PIPE_WIDTH && (by - BIRD_SIZE/2 < p.top || by + BIRD_SIZE/2 > p.top + PIPE_GAP));
      if (dead) { setBest(b => Math.max(b, state.score)); setScreen("over"); return; }
      ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0052ff";
      state.pipes.forEach(p => { ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top); ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_WIDTH, H); });
      ctx.fillStyle = "#FFD700"; ctx.beginPath(); ctx.arc(bx, by, BIRD_SIZE/2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px sans-serif"; ctx.textAlign = "center"; ctx.fillText(`${state.score}`, W/2, 40);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const s = { wrap: { display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#1a1a2e", color:"#fff", fontFamily:"sans-serif", cursor:"pointer" }, title: { fontSize:48, fontWeight:"bold", color:"#FFD700", marginBottom:16 }, sub: { color:"#aaa", marginBottom:32 }, btn: { padding:"12px 32px", background:"#0052ff", color:"#fff", border:"none", borderRadius:24, fontSize:18, fontWeight:"bold", cursor:"pointer", margin:8 }, score: { fontSize:28, marginBottom:8 } };

  return (
    <div style={s.wrap} onClick={jump}>
      {screen === "menu" && (<div style={{textAlign:"center"}}><div style={s.title}>🏃 Base Runner</div><div style={s.sub}>Tap or press Space to fly</div><button style={s.btn} onClick={e=>{e.stopPropagation();startGame()}}>Play</button><CheckinButton /></div>)}
      {screen === "game" && <canvas ref={canvasRef} width={390} height={600} style={{borderRadius:16,boxShadow:"0 0 40px #0052ff55"}} />}
      {screen === "over" && (<div style={{textAlign:"center"}}><div style={{...s.title,color:"#ff4444"}}>Game Over</div><div style={s.score}>Score: <span style={{color:"#FFD700"}}>{score}</span></div><div style={{color:"#aaa",marginBottom:24}}>Best: {best}</div><button style={s.btn} onClick={e=>{e.stopPropagation();startGame()}}>Retry</button><button style={{...s.btn,background:"#333"}} onClick={e=>{e.stopPropagation();setScreen("menu")}}>Menu</button><CheckinButton /></div>)}
    </div>
  );
}
