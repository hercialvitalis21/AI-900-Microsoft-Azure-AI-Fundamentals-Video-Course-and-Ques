import { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  mktCap: string;
  sector: string;
  pe: number;
  high52: number;
  low52: number;
  watched: boolean;
}
interface ChatMsg { role: "user" | "ai"; text: string; time: string; }
type Tab = "dash" | "screener" | "watchlist" | "chart" | "chat";
type SortKey = "changePct" | "price" | "volume" | "pe";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const f2 = (n: number) => n.toFixed(2);
const fVol = (n: number) => n >= 1e9 ? `${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n);
const tNow = () => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});

// ─── Seed stocks ───────────────────────────────────────────────────────────────
const SEEDS: Stock[] = [
  {symbol:"AAPL",name:"Apple Inc.",price:193.42,change:2.18,changePct:1.14,volume:58300000,mktCap:"$2.97T",sector:"Technology",pe:31.2,high52:199.62,low52:143.90,watched:true},
  {symbol:"MSFT",name:"Microsoft Corp.",price:415.68,change:-1.32,changePct:-0.32,volume:22100000,mktCap:"$3.09T",sector:"Technology",pe:36.8,high52:430.82,low52:309.45,watched:true},
  {symbol:"NVDA",name:"NVIDIA Corp.",price:875.40,change:24.60,changePct:2.89,volume:41700000,mktCap:"$2.16T",sector:"Technology",pe:71.4,high52:974.00,low52:403.32,watched:true},
  {symbol:"TSLA",name:"Tesla Inc.",price:247.15,change:-5.83,changePct:-2.30,volume:89400000,mktCap:"$789B",sector:"Consumer Disc.",pe:60.1,high52:299.29,low52:138.80,watched:false},
  {symbol:"AMZN",name:"Amazon.com Inc.",price:189.75,change:3.45,changePct:1.85,volume:35200000,mktCap:"$1.97T",sector:"Consumer Disc.",pe:44.7,high52:201.20,low52:118.35,watched:true},
  {symbol:"GOOGL",name:"Alphabet Inc.",price:176.30,change:0.98,changePct:0.56,volume:25800000,mktCap:"$2.19T",sector:"Communication",pe:22.8,high52:191.75,low52:120.21,watched:false},
  {symbol:"META",name:"Meta Platforms",price:512.45,change:8.90,changePct:1.77,volume:18600000,mktCap:"$1.30T",sector:"Communication",pe:28.9,high52:531.49,low52:279.40,watched:true},
  {symbol:"JPM",name:"JPMorgan Chase",price:204.38,change:-0.62,changePct:-0.30,volume:12400000,mktCap:"$591B",sector:"Financials",pe:11.9,high52:220.00,low52:146.49,watched:false},
  {symbol:"JNJ",name:"Johnson & Johnson",price:152.10,change:1.20,changePct:0.80,volume:8100000,mktCap:"$365B",sector:"Healthcare",pe:15.3,high52:175.97,low52:143.13,watched:false},
  {symbol:"XOM",name:"ExxonMobil Corp.",price:118.55,change:-2.10,changePct:-1.74,volume:21300000,mktCap:"$472B",sector:"Energy",pe:14.2,high52:126.34,low52:95.77,watched:false},
  {symbol:"V",name:"Visa Inc.",price:279.60,change:1.85,changePct:0.67,volume:7900000,mktCap:"$571B",sector:"Financials",pe:29.6,high52:290.96,low52:215.25,watched:false},
  {symbol:"AMD",name:"Advanced Micro Devices",price:168.90,change:5.30,changePct:3.24,volume:53200000,mktCap:"$273B",sector:"Technology",pe:44.1,high52:197.79,low52:95.40,watched:true},
  {symbol:"NFLX",name:"Netflix Inc.",price:648.75,change:-3.15,changePct:-0.48,volume:5300000,mktCap:"$282B",sector:"Communication",pe:46.2,high52:700.99,low52:385.00,watched:false},
  {symbol:"BA",name:"Boeing Co.",price:188.40,change:-4.20,changePct:-2.18,volume:9800000,mktCap:"$116B",sector:"Industrials",pe:-1,high52:267.54,low52:159.70,watched:false},
  {symbol:"WMT",name:"Walmart Inc.",price:68.42,change:0.37,changePct:0.54,volume:14500000,mktCap:"$551B",sector:"Consumer Staples",pe:27.4,high52:71.94,low52:48.65,watched:false},
];

function genHistory(base: number, pts = 39): number[] {
  const out = [base * 0.96];
  for (let i = 1; i < pts; i++) out.push(out[i-1] * (1 + (Math.random()-0.49)*0.018));
  return out;
}

const INTRADAY = Array.from({length:39},(_,i)=>{
  const m = 9*60+30+i*10;
  return `${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`;
});

// ─── AI ────────────────────────────────────────────────────────────────────────
const KB: [string[],string][] = [
  [["aapl","apple"],"AAPL is trading ~$193, up 1.14% today. P/E 31.2, approaching 52-week high of $199.62. Catalysts: iPhone cycle, Vision Pro, iOS AI. $190 near-term support, $200 next resistance."],
  [["nvda","nvidia"],"NVDA up 2.89% at $875. AI data-center demand drives the stock — Blackwell ramp beats estimates. P/E 71.4, elevated but earnings growth has justified it. Watch $900 resistance."],
  [["tsla","tesla"],"TSLA down 2.30% at $247. Margin compression and inventory headwinds. FSD and energy segment are bright spots. Support at $230; break below targets $210."],
  [["amd"],"AMD up 3.24% — one of today's top performers. MI300 data-center ramp exceeding estimates. P/E 44.1 backed by strong forward revenue."],
  [["meta"],"META up 1.77% at $512. Ad-revenue recovery, Reels monetization, AI-powered Advantage+ compounding. Approaching 52-week high — resistance ~$530."],
  [["buy","long","entry"],"Stocks to investigate for longs: NVDA (AI momentum), AMD (data-center), META (ad rebound), AMZN (AWS re-acceleration). All carry high P/Es — size positions with risk in mind."],
  [["sell","exit","short"],"Weakness: TSLA (margins), BA (production halt risk), XOM (oil headwind). Consider trimming if above target allocation."],
  [["portfolio","allocat"],"Balanced growth: AAPL 15%, MSFT 15%, NVDA 10%, AMZN 10%, GOOGL 10%, META 10%, 30% split across Healthcare, Financials, Energy. Adjust for time horizon."],
  [["market","today","overview"],"Today: Tech leads — NVDA +2.89%, AMD +3.24%. Energy lags: XOM -1.74%. Breadth slightly positive. S&P 500 near ATH. Next catalyst: Fed rate decision."],
  [["sector","rotation"],"Current rotation: Tech & Communication leading. Energy & Industrials lagging. Defensives flat. Classic risk-on environment."],
  [["help","what can"],"I can analyze any stock (just mention a ticker), give market overviews, buy/sell ideas, or portfolio strategy. Try 'Analyze NVDA' or 'Market overview'."],
];
function aiReply(msg: string): string {
  const l = msg.toLowerCase();
  for (const [keys,resp] of KB) if (keys.some(k=>l.includes(k))) return resp;
  return `Good question about "${msg}". I'd check the 52-week range, P/E vs sector peers, and recent volume. A move on above-average volume is more meaningful. Want a specific ticker analyzed?`;
}

// ─── Chart components ──────────────────────────────────────────────────────────
function Sparkline({data,pos,w=80,h=32}:{data:number[];pos:boolean;w?:number;h?:number}) {
  const min=Math.min(...data), max=Math.max(...data), rng=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/rng)*h}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={pos?"#10b981":"#f87171"} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

function LineChartSVG({data,labels}:{data:number[];labels:string[]}) {
  const W=600,H=180,PL=48,PR=12,PT=12,PB=28;
  const min=Math.min(...data), max=Math.max(...data), rng=max-min||1;
  const sx=(i:number)=>PL+(i/(data.length-1))*(W-PL-PR);
  const sy=(v:number)=>PT+((max-v)/rng)*(H-PT-PB);
  const pts=data.map((_,i)=>`${sx(i)},${sy(data[i])}`).join(" ");
  const area=`M${sx(0)},${H-PB} L${data.map((_,i)=>`${sx(i)},${sy(data[i])}`).join(" L")} L${sx(data.length-1)},${H-PB} Z`;
  const isUp=data[data.length-1]>=data[0];
  const col=isUp?"#10b981":"#f87171";
  const ticks=[0,Math.floor(data.length/4),Math.floor(data.length/2),Math.floor(3*data.length/4),data.length-1];
  const yTicks=[0,0.25,0.5,0.75,1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {yTicks.map(f=>(
        <line key={f} x1={PL} y1={PT+f*(H-PT-PB)} x2={W-PR} y2={PT+f*(H-PT-PB)} stroke="#1e293b" strokeWidth="0.75"/>
      ))}
      <path d={area} fill="url(#lg)"/>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round"/>
      {yTicks.map(f=>(
        <text key={f} x={PL-4} y={PT+f*(H-PT-PB)+4} textAnchor="end" fontSize="10" fill="#64748b">
          {f2(max-f*rng)}
        </text>
      ))}
      {ticks.map(i=>(
        <text key={i} x={sx(i)} y={H-PB+16} textAnchor="middle" fontSize="9" fill="#64748b">{labels[i]}</text>
      ))}
    </svg>
  );
}

function BarChartSVG({categories,values}:{categories:string[];values:number[]}) {
  const W=320,H=200,PL=72,PR=48,PT=8,PB=8;
  const maxAbs=Math.max(...values.map(Math.abs))||1;
  const bh=Math.max(10,(H-PT-PB)/values.length-4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#1e293b" strokeWidth="1"/>
      {values.map((v,i)=>{
        const bw=(Math.abs(v)/maxAbs)*(W-PL-PR);
        const x=v>=0?PL:PL-bw;
        const y=PT+i*(bh+4);
        const col=v>=0?"#10b981":"#f87171";
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={col} rx="2" opacity="0.85"/>
            <text x={PL-4} y={y+bh/2+1} textAnchor="end" fontSize="9" fill="#94a3b8" dominantBaseline="middle">
              {categories[i].length>9?categories[i].slice(0,9):categories[i]}
            </text>
            <text x={x+bw+(v>=0?4:-4)} y={y+bh/2+1} textAnchor={v>=0?"start":"end"} fontSize="9" fill={col} dominantBaseline="middle">
              {v>=0?"+":""}{v.toFixed(2)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutSVG({data}:{data:{label:string;value:number}[]}) {
  const total=data.reduce((s,d)=>s+d.value,0);
  const COLORS=["#6366f1","#10b981","#f59e0b","#f87171","#3b82f6","#8b5cf6"];
  let angle=-90;
  const cx=80,cy=80,R=65,r=42;
  return (
    <svg viewBox="0 0 200 160" style={{width:"100%",height:160}}>
      {data.map((d,i)=>{
        const deg=(d.value/total)*360;
        const s=(Math.PI/180)*angle, e=(Math.PI/180)*(angle+deg);
        const x1=cx+R*Math.cos(s),y1=cy+R*Math.sin(s);
        const x2=cx+R*Math.cos(e),y2=cy+R*Math.sin(e);
        const ix1=cx+r*Math.cos(e),iy1=cy+r*Math.sin(e);
        const ix2=cx+r*Math.cos(s),iy2=cy+r*Math.sin(s);
        const large=deg>180?1:0;
        const path=`M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${r},${r} 0 ${large},0 ${ix2},${iy2} Z`;
        angle+=deg;
        return <path key={i} d={path} fill={COLORS[i%COLORS.length]} stroke="#0a0f1e" strokeWidth="1.5" opacity="0.9"/>;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="9" fill="#94a3b8">Volume</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="8" fill="#64748b">by Sector</text>
      {data.slice(0,5).map((d,i)=>(
        <g key={i}>
          <rect x={164} y={20+i*22} width={8} height={8} fill={["#6366f1","#10b981","#f59e0b","#f87171","#3b82f6"][i]} rx="1"/>
          <text x={174} y={28+i*22} fontSize="8" fill="#94a3b8">{d.label.slice(0,11)}</text>
        </g>
      ))}
    </svg>
  );
}

function RangeBar({low,high,cur}:{low:number;high:number;cur:number}) {
  const pct=Math.max(0,Math.min(100,((cur-low)/(high-low))*100));
  return (
    <div style={{marginTop:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:4}}>
        <span>52W Low: ${f2(low)}</span>
        <span style={{color:"#f1f5f9",fontWeight:600}}>Current: ${f2(cur)}</span>
        <span>52W High: ${f2(high)}</span>
      </div>
      <div style={{height:6,background:"#1e293b",borderRadius:3,position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${pct}%`,background:"#6366f1",borderRadius:3}}/>
        <div style={{position:"absolute",top:-4,left:`${pct}%`,transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:"#6366f1",border:"2px solid #0a0f1e"}}/>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(SEEDS);
  const [tab, setTab] = useState<Tab>("dash");
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [sortCol, setSortCol] = useState<SortKey>("changePct");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [chartSym, setChartSym] = useState("AAPL");
  const [history] = useState<Record<string,number[]>>(()=>Object.fromEntries(SEEDS.map(s=>[s.symbol,genHistory(s.price)])));
  const [msgs, setMsgs] = useState<ChatMsg[]>([{role:"ai",text:aiReply("help"),time:tNow()}]);
  const [chatIn, setChatIn] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Live price simulation
  useEffect(()=>{
    const id=setInterval(()=>{
      setStocks(p=>p.map(s=>{
        const d=s.price*(Math.random()-0.498)*0.001;
        const p2=Math.max(s.price+d,1);
        return {...s,price:p2,change:s.change+d,changePct:((s.change+d)/(p2-s.change-d))*100};
      }));
    },2000);
    return ()=>clearInterval(id);
  },[]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs,aiTyping]);

  const sectors = useMemo(()=>["All",...Array.from(new Set(SEEDS.map(s=>s.sector)))],[]);

  const filtered = useMemo(()=>{
    const q=search.toLowerCase();
    return [...stocks]
      .filter(s=>(s.symbol.toLowerCase().includes(q)||s.name.toLowerCase().includes(q))&&(sector==="All"||s.sector===sector))
      .sort((a,b)=>{
        const av=a[sortCol],bv=b[sortCol];
        return sortDir==="desc"?bv-av:av-bv;
      });
  },[stocks,search,sector,sortCol,sortDir]);

  const watchlist=useMemo(()=>stocks.filter(s=>s.watched),[stocks]);
  const gainers=useMemo(()=>[...stocks].sort((a,b)=>b.changePct-a.changePct).slice(0,5),[stocks]);
  const losers=useMemo(()=>[...stocks].sort((a,b)=>a.changePct-b.changePct).slice(0,5),[stocks]);
  const posCount=stocks.filter(s=>s.changePct>=0).length;
  const sel=stocks.find(s=>s.symbol===chartSym)??stocks[0];

  const toggleWatch=(sym:string)=>setStocks(p=>p.map(s=>s.symbol===sym?{...s,watched:!s.watched}:s));
  const handleSort=(col:SortKey)=>{
    if(sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortCol(col);setSortDir("desc");}
  };

  const sendChat=()=>{
    if(!chatIn.trim()||aiTyping) return;
    const q=chatIn.trim();
    setMsgs(p=>[...p,{role:"user",text:q,time:tNow()}]);
    setChatIn("");
    setAiTyping(true);
    setTimeout(()=>{
      setMsgs(p=>[...p,{role:"ai",text:aiReply(q),time:tNow()}]);
      setAiTyping(false);
    },800+Math.random()*500);
  };

  // Sector chart data
  const sMap:Record<string,{sum:number;cnt:number}>={};
  stocks.forEach(s=>{if(!sMap[s.sector])sMap[s.sector]={sum:0,cnt:0};sMap[s.sector].sum+=s.changePct;sMap[s.sector].cnt++;});
  const sData=Object.entries(sMap).map(([k,v])=>({name:k.replace("Consumer ","Con."),avg:parseFloat((v.sum/v.cnt).toFixed(2))})).sort((a,b)=>b.avg-a.avg);

  // Volume donut
  const vMap:Record<string,number>={};
  stocks.forEach(s=>{vMap[s.sector]=(vMap[s.sector]||0)+s.volume;});
  const pieData=Object.entries(vMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label:label.replace("Consumer ","Con."),value}));

  const pct=(n:number)=><span style={{color:n>=0?"#10b981":"#f87171",fontWeight:700}}>{n>=0?"+":""}{f2(n)}%</span>;
  const col=(n:number)=>n>=0?"#10b981":"#f87171";

  const TABS:Array<{id:Tab;label:string}> = [
    {id:"dash",label:"Dashboard"},
    {id:"screener",label:"Screener"},
    {id:"watchlist",label:"Watchlist"},
    {id:"chart",label:"Chart"},
    {id:"chat",label:"AI Chat"},
  ];

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0f1e",color:"#e2e8f0",minHeight:"100vh"}}>

      {/* ── Header ── */}
      <header style={{background:"#0d1424",borderBottom:"1px solid #1e293b",padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:8,background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",letterSpacing:"-0.5px"}}>HV</div>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:"#f1f5f9",lineHeight:"1.1"}}>HV Markets</div>
            <div style={{fontSize:9,color:"#818cf8",letterSpacing:"0.1em"}}>TRADING DESK</div>
          </div>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",gap:16,alignItems:"center"}}>
          {stocks.slice(0,7).map(s=>(
            <div key={s.symbol} style={{display:"flex",gap:5,whiteSpace:"nowrap",fontSize:12}}>
              <span style={{fontWeight:700,color:"#f1f5f9"}}>{s.symbol}</span>
              <span>${f2(s.price)}</span>
              <span style={{color:col(s.changePct)}}>{s.changePct>=0?"+":""}{f2(s.changePct)}%</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,flexShrink:0}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#10b981"}}/>
          <span style={{color:"#10b981",fontWeight:700}}>MARKET OPEN</span>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav style={{background:"#0d1424",borderBottom:"1px solid #1e293b",padding:"0 20px",display:"flex",gap:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
              color:tab===t.id?"#818cf8":"#64748b",borderBottom:tab===t.id?"2px solid #6366f1":"2px solid transparent",transition:"color 0.15s"}}>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{padding:20,maxWidth:1400,margin:"0 auto"}}>

        {/* ══════ DASHBOARD ══════ */}
        {tab==="dash"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#f1f5f9"}}>Market Overview</h1>
              <span style={{fontSize:12,color:"#64748b"}}>Nov 6, 2026 · Live prices (sample data)</span>
            </div>

            {/* Index cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[{l:"S&P 500",v:"5,735.62",d:"+0.43%",up:true},{l:"NASDAQ",v:"18,281.40",d:"+0.71%",up:true},{l:"Dow Jones",v:"42,196.52",d:"-0.22%",up:false},{l:"VIX",v:"14.82",d:"-1.31%",up:true}].map(c=>(
                <div key={c.l} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{c.l}</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#f1f5f9"}}>{c.v}</div>
                  <div style={{fontSize:12,color:c.up?"#10b981":"#f87171",fontWeight:700}}>{c.d}</div>
                </div>
              ))}
            </div>

            {/* Breadth */}
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:12,color:"#10b981",fontWeight:600}}>▲ {posCount} Advancing</span>
                <div style={{flex:1,height:8,borderRadius:4,background:"#1e293b",overflow:"hidden"}}>
                  <div style={{width:`${(posCount/stocks.length)*100}%`,height:"100%",background:"#10b981",transition:"width 0.5s"}}/>
                </div>
                <span style={{fontSize:12,color:"#f87171",fontWeight:600}}>{stocks.length-posCount} Declining ▼</span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
              {/* Watchlist preview */}
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontWeight:700,fontSize:14,color:"#f1f5f9"}}>★ Watchlist</span>
                  <button onClick={()=>setTab("watchlist")} style={{background:"none",border:"none",color:"#818cf8",fontSize:12,cursor:"pointer"}}>View All →</button>
                </div>
                {watchlist.map(s=>(
                  <div key={s.symbol} onClick={()=>{setChartSym(s.symbol);setTab("chart");}}
                    style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1e293b",cursor:"pointer",gap:10}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#1e293b")}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{width:34,height:34,borderRadius:8,background:"#1e293b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#818cf8"}}>{s.symbol.slice(0,2)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#f1f5f9"}}>{s.symbol}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{s.name.slice(0,22)}</div>
                    </div>
                    <Sparkline data={history[s.symbol]} pos={s.changePct>=0}/>
                    <div style={{textAlign:"right",minWidth:64}}>
                      <div style={{fontWeight:700,fontSize:13}}>${f2(s.price)}</div>
                      <div style={{fontSize:11,color:col(s.changePct),fontWeight:700}}>{pct(s.changePct)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sector bar */}
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9",marginBottom:10}}>Sector Performance</div>
                <BarChartSVG categories={sData.map(d=>d.name)} values={sData.map(d=>d.avg)}/>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              {/* Gainers */}
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#10b981",marginBottom:10}}>▲ Top Gainers</div>
                {gainers.map(s=>(
                  <div key={s.symbol} onClick={()=>{setChartSym(s.symbol);setTab("chart");}}
                    style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1e293b",cursor:"pointer"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:12}}>{s.symbol}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{s.sector}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,fontWeight:700}}>${f2(s.price)}</div>
                      <div style={{fontSize:11,color:"#10b981",fontWeight:700}}>+{f2(s.changePct)}%</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Losers */}
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f87171",marginBottom:10}}>▼ Top Losers</div>
                {losers.map(s=>(
                  <div key={s.symbol} onClick={()=>{setChartSym(s.symbol);setTab("chart");}}
                    style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1e293b",cursor:"pointer"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:12}}>{s.symbol}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{s.sector}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,fontWeight:700}}>${f2(s.price)}</div>
                      <div style={{fontSize:11,color:"#f87171",fontWeight:700}}>{f2(s.changePct)}%</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Donut */}
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9",marginBottom:10}}>Volume by Sector</div>
                <DonutSVG data={pieData}/>
              </div>
            </div>
          </div>
        )}

        {/* ══════ SCREENER ══════ */}
        {tab==="screener"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#f1f5f9"}}>Stock Screener</h1>

            {/* Filters */}
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:14,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbol or company..."
                style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#f1f5f9",fontSize:13,width:220,outline:"none"}}/>
              <select value={sector} onChange={e=>setSector(e.target.value)}
                style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#f1f5f9",fontSize:13,outline:"none"}}>
                {sectors.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {sectors.slice(1).map(s=>(
                  <button key={s} onClick={()=>setSector(s)}
                    style={{padding:"4px 10px",borderRadius:20,background:sector===s?"#6366f1":"#1e293b",border:"1px solid",borderColor:sector===s?"#6366f1":"#334155",color:sector===s?"#fff":"#94a3b8",fontSize:11,cursor:"pointer"}}>
                    {s}
                  </button>
                ))}
              </div>
              <span style={{fontSize:12,color:"#64748b",marginLeft:"auto"}}>{filtered.length} results</span>
              <button onClick={()=>{setSearch("");setSector("All");}} style={{background:"none",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#94a3b8",fontSize:12,cursor:"pointer"}}>Reset</button>
            </div>

            {/* Table */}
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#1e293b"}}>
                    {(["symbol","name","price","changePct","volume","sector","pe","mktCap"] as const).map(col=>(
                      <th key={col} onClick={()=>["price","changePct","volume","pe"].includes(col)&&handleSort(col as SortKey)}
                        style={{padding:"10px 12px",textAlign:col==="name"||col==="sector"||col==="symbol"?"left":"right",color:"#64748b",fontWeight:600,fontSize:11,cursor:["price","changePct","volume","pe"].includes(col)?"pointer":"default",userSelect:"none",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>
                        {col==="changePct"?"Change %":col==="pe"?"P/E":col==="mktCap"?"Mkt Cap":col.charAt(0).toUpperCase()+col.slice(1)}
                        {["price","changePct","volume","pe"].includes(col)&&sortCol===col&&(sortDir==="desc"?" ↓":" ↑")}
                      </th>
                    ))}
                    <th style={{padding:"10px 12px",color:"#64748b",fontSize:11}}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s,i)=>(
                    <tr key={s.symbol}
                      style={{borderBottom:"1px solid #1a2540",background:i%2===0?"transparent":"#0d1628"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="#1e293b")}
                      onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?"transparent":"#0d1628")}>
                      <td style={{padding:"10px 12px"}}><button onClick={()=>{setChartSym(s.symbol);setTab("chart");}} style={{background:"none",border:"none",cursor:"pointer",color:"#818cf8",fontWeight:800,fontSize:13,padding:0}}>{s.symbol}</button></td>
                      <td style={{padding:"10px 12px",color:"#94a3b8",fontSize:12}}>{s.name}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700}}>${f2(s.price)}</td>
                      <td style={{padding:"10px 12px",textAlign:"right"}}>{pct(s.changePct)}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",color:"#94a3b8",fontSize:12}}>{fVol(s.volume)}</td>
                      <td style={{padding:"10px 12px",color:"#64748b",fontSize:11}}>{s.sector}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",color:s.pe>0?"#94a3b8":"#f87171"}}>{s.pe>0?s.pe.toFixed(1):"N/A"}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",color:"#64748b"}}>{s.mktCap}</td>
                      <td style={{padding:"10px 12px",textAlign:"center"}}>
                        <button onClick={()=>toggleWatch(s.symbol)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:s.watched?"#f59e0b":"#334155"}}>{s.watched?"★":"☆"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════ WATCHLIST ══════ */}
        {tab==="watchlist"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#f1f5f9"}}>Watchlist</h1>
              <span style={{fontSize:13,color:"#64748b"}}>({watchlist.length} stocks)</span>
            </div>
            {watchlist.length===0&&(
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:32,textAlign:"center",color:"#475569"}}>
                No stocks in watchlist. Go to Screener and click ☆ to add stocks here.
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {watchlist.map(s=>(
                <div key={s.symbol} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:16,transition:"border-color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="#6366f1")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor="#1e293b")}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:20,color:"#818cf8"}}>{s.symbol}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{s.name}</div>
                      <div style={{fontSize:10,background:"#1e293b",color:"#94a3b8",padding:"2px 8px",borderRadius:6,display:"inline-block",marginTop:4}}>{s.sector}</div>
                    </div>
                    <button onClick={()=>toggleWatch(s.symbol)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#f59e0b"}}>★</button>
                  </div>
                  <div style={{margin:"12px 0"}}>
                    <Sparkline data={history[s.symbol]} pos={s.changePct>=0} w={200} h={48}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:26,fontWeight:800}}>${f2(s.price)}</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontWeight:700,color:col(s.changePct)}}>{s.changePct>=0?"▲":"▼"} {Math.abs(s.changePct).toFixed(2)}%</div>
                      <div style={{fontSize:12,color:col(s.change)}}>{s.change>=0?"+":""}{f2(s.change)}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
                    {[{l:"Volume",v:fVol(s.volume)},{l:"P/E",v:s.pe>0?s.pe.toFixed(1):"N/A"},{l:"52W High",v:`$${f2(s.high52)}`},{l:"52W Low",v:`$${f2(s.low52)}`}].map(m=>(
                      <div key={m.l} style={{background:"#1e293b",borderRadius:8,padding:"7px 10px"}}>
                        <div style={{fontSize:10,color:"#64748b"}}>{m.l}</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#94a3b8"}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setChartSym(s.symbol);setTab("chart");}} style={{marginTop:10,width:"100%",padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",fontSize:12,cursor:"pointer"}}>View Chart →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ CHART ══════ */}
        {tab==="chart"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#f1f5f9"}}>Chart View</h1>
            </div>

            {/* Symbol picker */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {stocks.map(s=>(
                <button key={s.symbol} onClick={()=>setChartSym(s.symbol)}
                  style={{padding:"5px 11px",borderRadius:8,border:"1px solid",borderColor:chartSym===s.symbol?"#6366f1":"#1e293b",background:chartSym===s.symbol?"#6366f120":"transparent",color:chartSym===s.symbol?"#818cf8":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                  {s.symbol}
                </button>
              ))}
            </div>

            {/* Main chart card */}
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                    <span style={{fontSize:28,fontWeight:800,color:"#f1f5f9"}}>{sel.symbol}</span>
                    <span style={{fontSize:13,color:"#64748b"}}>{sel.name}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:12,marginTop:4}}>
                    <span style={{fontSize:36,fontWeight:900}}>${f2(sel.price)}</span>
                    <span style={{fontSize:16,fontWeight:700,color:col(sel.changePct)}}>{sel.changePct>=0?"▲":"▼"} {Math.abs(sel.changePct).toFixed(2)}%</span>
                    <span style={{fontSize:13,color:col(sel.change)}}>{sel.change>=0?"+":""}{f2(sel.change)} today</span>
                  </div>
                </div>
                <button onClick={()=>toggleWatch(sel.symbol)}
                  style={{padding:"8px 16px",borderRadius:10,border:"1px solid",borderColor:sel.watched?"#f59e0b":"#334155",background:sel.watched?"#f59e0b20":"transparent",color:sel.watched?"#f59e0b":"#475569",cursor:"pointer",fontSize:13,fontWeight:600}}>
                  {sel.watched?"★ Watching":"☆ Add to Watchlist"}
                </button>
              </div>

              <LineChartSVG data={history[sel.symbol]??[sel.price]} labels={INTRADAY}/>

              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginTop:14}}>
                {[{l:"Open",v:`$${f2(sel.price*0.99)}`},{l:"Volume",v:fVol(sel.volume)},{l:"Mkt Cap",v:sel.mktCap},{l:"P/E",v:sel.pe>0?sel.pe.toFixed(1):"N/A"},{l:"Sector",v:sel.sector},{l:"52W High",v:`$${f2(sel.high52)}`}].map(m=>(
                  <div key={m.l} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:"#64748b"}}>{m.l}</div>
                    <div style={{fontSize:13,fontWeight:700}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <RangeBar low={sel.low52} high={sel.high52} cur={sel.price}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9",marginBottom:10}}>Sector Performance</div>
                <BarChartSVG categories={sData.map(d=>d.name)} values={sData.map(d=>d.avg)}/>
              </div>
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:16}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9",marginBottom:10}}>Volume by Sector</div>
                <DonutSVG data={pieData}/>
              </div>
            </div>
          </div>
        )}

        {/* ══════ AI CHAT ══════ */}
        {tab==="chat"&&(
          <div style={{maxWidth:720,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
            <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#f1f5f9"}}>AI Trading Assistant</h1>
            <div style={{background:"#0d1f3c",border:"1px solid #1e3a5f",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#93c5fd"}}>
              Powered by HV Markets Intelligence · Ask about any stock, sector, or market condition.
            </div>

            {/* Quick prompts */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Market overview","Analyze NVDA","Buy ideas?","Portfolio advice","TSLA outlook","Sector rotation"].map(q=>(
                <button key={q} onClick={()=>setChatIn(q)}
                  style={{padding:"5px 12px",borderRadius:20,background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",fontSize:12,cursor:"pointer"}}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div style={{background:"#080d1a",border:"1px solid #1e293b",borderRadius:12,padding:"14px 16px",height:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:m.role==="ai"?"#4f46e5":"#1e293b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:m.role==="ai"?"#fff":"#f1f5f9"}}>
                    {m.role==="ai"?"AI":"ME"}
                  </div>
                  <div style={{maxWidth:"75%",background:m.role==="ai"?"#0f172a":"#1e293b",border:m.role==="ai"?"1px solid #1e293b":"none",borderRadius:m.role==="ai"?"4px 12px 12px 12px":"12px 4px 12px 12px",padding:"10px 14px"}}>
                    <div style={{fontSize:13,lineHeight:1.55,color:"#e2e8f0"}}>{m.text}</div>
                    <div style={{fontSize:10,color:"#475569",marginTop:4}}>{m.time}</div>
                  </div>
                </div>
              ))}
              {aiTyping&&(
                <div style={{display:"flex",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:8,background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff"}}>AI</div>
                  <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:"4px 12px 12px 12px",padding:"10px 16px",color:"#64748b",fontSize:13}}>Analyzing...</div>
                </div>
              )}
              <div ref={chatEnd}/>
            </div>

            {/* Input */}
            <div style={{display:"flex",gap:10}}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()}
                placeholder="Ask about any stock, market, or trading strategy..."
                style={{flex:1,background:"#0f172a",border:"1px solid #334155",borderRadius:10,padding:"11px 14px",color:"#f1f5f9",fontSize:13,outline:"none"}}/>
              <button onClick={sendChat} disabled={!chatIn.trim()||aiTyping}
                style={{padding:"11px 20px",borderRadius:10,background:!chatIn.trim()||aiTyping?"#1e293b":"#4f46e5",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:!chatIn.trim()||aiTyping?0.5:1}}>
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
