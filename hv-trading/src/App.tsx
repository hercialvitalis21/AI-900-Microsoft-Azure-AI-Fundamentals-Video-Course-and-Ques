import { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";

// ─── Portfolio Holdings (Account P6F001044 · VITALISHER · as of 11/05/2026) ──
interface Holding {
  s: string;   // symbol
  d: string;   // description
  ac: string;  // asset class
  q: number;   // quantity
  p: number;   // price
  cp: number;  // change %
  mv: number;  // market value
  mc: number;  // market value change $
  mk: string;  // market/exchange
}

const PORTFOLIO_HOLDINGS: Holding[] = [{"s":"AAPL","d":"APPLE INC COM","ac":"Equities","q":2,"p":345.25,"cp":-1.22,"mv":690.5,"mc":-8.52,"mk":"NASDAQ"},{"s":"ABBV","d":"ABBVIE INC COM","ac":"Equities","q":2,"p":293.745,"cp":-0.37,"mv":587.49,"mc":-2.17,"mk":"NYSE"},{"s":"ABT","d":"ABBOTT LABS COM","ac":"Equities","q":5,"p":113.62,"cp":-1.64,"mv":568.1,"mc":-9.45,"mk":"NYSE"},{"s":"AMD","d":"ADVANCED MICRO DEVICES INC COM","ac":"Equities","q":4,"p":421.88,"cp":-13.69,"mv":1687.52,"mc":-267.6,"mk":"NASDAQ"},{"s":"AMGN","d":"AMGEN INC COM","ac":"Equities","q":2,"p":468.62,"cp":-2.06,"mv":937.24,"mc":-19.72,"mk":"NASDAQ"},{"s":"AMZN","d":"AMAZON COM INC COM","ac":"Equities","q":28,"p":261.81,"cp":-1.59,"mv":7330.68,"mc":-118.16,"mk":"NASDAQ"},{"s":"ASND","d":"ASCENDIS PHARMA BEARER SHS","ac":"Equities","q":3,"p":254.91,"cp":-1.17,"mv":764.73,"mc":-9.06,"mk":"NASDAQ"},{"s":"AZN","d":"ASTRAZENECA PLC SHS","ac":"Equities","q":5,"p":188.95,"cp":-0.03,"mv":944.75,"mc":0.3,"mk":"NYSE"},{"s":"B","d":"BARRICK MINING CORP","ac":"Equities","q":12,"p":40.38,"cp":0.62,"mv":484.56,"mc":2.34,"mk":"NYSE"},{"s":"BGT","d":"BLACKROCK FLOATING RATE INCOME TR COM","ac":"Investment Funds","q":1054,"p":9.84,"cp":-1.3,"mv":10371.36,"mc":-137.02,"mk":"NYSE"},{"s":"BIIB","d":"BIOGEN INC COM","ac":"Equities","q":2,"p":248.905,"cp":-2.18,"mv":497.81,"mc":-11.11,"mk":"NASDAQ"},{"s":"BNS","d":"BANK OF NOVA SCOTIA HALIFAX COM SHS","ac":"Equities","q":7,"p":94.1,"cp":-2.42,"mv":658.7,"mc":-16.31,"mk":"NYSE"},{"s":"BWXT","d":"BWX TECHNOLOGIES INC COM","ac":"Equities","q":1,"p":115.535,"cp":-4.91,"mv":115.54,"mc":-5.96,"mk":"NYSE"},{"s":"C","d":"CITIGROUP INC COM NEW","ac":"Equities","q":2,"p":118.505,"cp":-5.0,"mv":237.01,"mc":-12.47,"mk":"NYSE"},{"s":"CARR","d":"CARRIER GLOBAL CORP COM","ac":"Equities","q":2,"p":54.21,"cp":-2.61,"mv":108.42,"mc":-2.9,"mk":"NYSE"},{"s":"CHRYY","d":"CHORUS LTD SPONS ADR","ac":"Equities","q":2,"p":22.79,"cp":0,"mv":45.58,"mc":0,"mk":"OTC"},{"s":"COP","d":"CONOCOPHILLIPS COM","ac":"Equities","q":3,"p":138.05,"cp":0.81,"mv":414.15,"mc":3.33,"mk":"NYSE"},{"s":"CRCL","d":"CIRCLE INTERNET GROUP INC CL A","ac":"Equities","q":5,"p":67.36,"cp":-11.51,"mv":336.8,"mc":-43.8,"mk":"NYSE"},{"s":"CRM","d":"SALESFORCE INC COM","ac":"Equities","q":2,"p":223.56,"cp":-1.56,"mv":447.12,"mc":-7.1,"mk":"NYSE"},{"s":"CRWD","d":"CROWDSTRIKE HLDGS INC CL A","ac":"Equities","q":1,"p":219.76,"cp":-8.81,"mv":219.76,"mc":-21.24,"mk":"NASDAQ"},{"s":"CSCO","d":"CISCO SYS INC COM","ac":"Equities","q":20,"p":97.26,"cp":-6.13,"mv":1945.2,"mc":-127.0,"mk":"NASDAQ"},{"s":"CTSH","d":"COGNIZANT TECHNOLOGY SOLUTIONS CORP CL A","ac":"Equities","q":4,"p":66.75,"cp":1.47,"mv":267.0,"mc":3.88,"mk":"NASDAQ"},{"s":"DE","d":"DEERE & CO COM","ac":"Equities","q":1,"p":671.42,"cp":-0.75,"mv":671.42,"mc":-5.08,"mk":"NYSE"},{"s":"DELL","d":"DELL TECHNOLOGIES INC CL C","ac":"Equities","q":2,"p":331.76,"cp":-10.9,"mv":663.52,"mc":-81.2,"mk":"NYSE"},{"s":"DLTR","d":"DOLLAR TREE INC COM","ac":"Equities","q":4,"p":140.325,"cp":-4.54,"mv":561.3,"mc":-26.7,"mk":"NASDAQ"},{"s":"DPZ","d":"DOMINOS PIZZA INC COM","ac":"Equities","q":2,"p":334.91,"cp":-1.7,"mv":669.82,"mc":-11.56,"mk":"NASDAQ"},{"s":"DUK","d":"DUKE ENERGY CORP NEW COM NEW","ac":"Equities","q":3,"p":130.815,"cp":0.95,"mv":392.45,"mc":3.68,"mk":"NYSE"},{"s":"EL","d":"LAUDER ESTEE COS INC CL A","ac":"Equities","q":1,"p":109.22,"cp":-2.52,"mv":109.22,"mc":-2.82,"mk":"NYSE"},{"s":"EXPE","d":"EXPEDIA GROUP INC COM NEW","ac":"Equities","q":3,"p":275.175,"cp":-12.89,"mv":825.53,"mc":-122.11,"mk":"NASDAQ"},{"s":"F","d":"FORD MTR CO DEL COM","ac":"Equities","q":6,"p":12.5,"cp":-1.34,"mv":75.0,"mc":-1.02,"mk":"NYSE"},{"s":"FDXF","d":"FEDEX FGHT HLDG CO INC COM","ac":"Equities","q":1,"p":126.445,"cp":-2.31,"mv":126.45,"mc":-2.98,"mk":"NYSE"},{"s":"FISV","d":"FISERV INC COM","ac":"Equities","q":2,"p":62.34,"cp":0.47,"mv":124.68,"mc":0.58,"mk":"NASDAQ"},{"s":"FIX","d":"COMFORT SYS USA INC COM","ac":"Equities","q":1,"p":983.4,"cp":-9.89,"mv":983.4,"mc":-107.91,"mk":"NYSE"},{"s":"FRO","d":"FRONTLINE PLC REGISTERED SHS","ac":"Equities","q":2,"p":46.6,"cp":-3.88,"mv":93.2,"mc":-3.76,"mk":"NYSE"},{"s":"FSLR","d":"FIRST SOLAR INC COM","ac":"Equities","q":4,"p":193.17,"cp":-0.69,"mv":772.68,"mc":-5.36,"mk":"NASDAQ"},{"s":"FTRE","d":"FORTREA HLDGS INC COM","ac":"Equities","q":8,"p":20.42,"cp":-1.97,"mv":163.36,"mc":-3.28,"mk":"NASDAQ"},{"s":"GE","d":"GENERAL ELEC CO COM NEW","ac":"Equities","q":2,"p":317.105,"cp":-3.75,"mv":634.21,"mc":-24.69,"mk":"NYSE"},{"s":"GLAXF","d":"GSK PLC REGISTERED SHS","ac":"Equities","q":7,"p":25.07,"cp":0,"mv":175.49,"mc":-2.7,"mk":"OTC"},{"s":"GOOG","d":"ALPHABET INC CAP STK CL C","ac":"Equities","q":20,"p":282.905,"cp":-1.53,"mv":5658.1,"mc":-87.9,"mk":"NASDAQ"},{"s":"GPC","d":"GENUINE PARTS CO COM","ac":"Equities","q":20,"p":124.94,"cp":-1.16,"mv":2498.8,"mc":-29.2,"mk":"NYSE"},{"s":"HAL","d":"HALLIBURTON CO COM","ac":"Equities","q":4,"p":32.61,"cp":-1.18,"mv":130.44,"mc":-1.56,"mk":"NYSE"},{"s":"HAS","d":"HASBRO INC COM","ac":"Equities","q":2,"p":119.95,"cp":-1.34,"mv":239.9,"mc":-3.26,"mk":"NASDAQ"},{"s":"HD","d":"HOME DEPOT INC COM","ac":"Equities","q":8,"p":351.355,"cp":-1.15,"mv":2810.84,"mc":-32.68,"mk":"NYSE"},{"s":"HSY","d":"HERSHEY CO COM","ac":"Equities","q":2,"p":173.805,"cp":-0.4,"mv":347.61,"mc":-1.39,"mk":"NYSE"},{"s":"INTC","d":"INTEL CORP COM","ac":"Equities","q":5,"p":55.45,"cp":-4.84,"mv":277.25,"mc":-14.1,"mk":"NASDAQ"},{"s":"JPM","d":"JPMORGAN CHASE & CO COM","ac":"Equities","q":11,"p":340.95,"cp":-3.17,"mv":3750.45,"mc":-122.76,"mk":"NYSE"},{"s":"KDP","d":"KEURIG DR PEPPER INC COM","ac":"Equities","q":3,"p":37.34,"cp":1.49,"mv":112.02,"mc":1.65,"mk":"NASDAQ"},{"s":"KHC","d":"KRAFT HEINZ CO COM","ac":"Equities","q":1,"p":25.105,"cp":-1.32,"mv":25.11,"mc":-0.33,"mk":"NYSE"},{"s":"KO","d":"COCA COLA CO COM","ac":"Equities","q":12,"p":96.1,"cp":0.31,"mv":1153.2,"mc":3.6,"mk":"NYSE"},{"s":"KR","d":"KROGER CO COM","ac":"Equities","q":8,"p":69.545,"cp":0.83,"mv":556.36,"mc":4.6,"mk":"NYSE"},{"s":"KTB","d":"KONTOOR BRANDS INC COM","ac":"Equities","q":2,"p":80.43,"cp":-1.87,"mv":160.86,"mc":-3.06,"mk":"NYSE"},{"s":"LBTYA","d":"LIBERTY GLOBAL LTD REGISTERED SHS -A-","ac":"Equities","q":2,"p":9.565,"cp":-0.16,"mv":19.13,"mc":-0.03,"mk":"NASDAQ"},{"s":"LLY","d":"LILLY ELI & CO COM","ac":"Equities","q":1,"p":1394.06,"cp":-1.69,"mv":1394.06,"mc":-23.93,"mk":"NYSE"},{"s":"LNG","d":"CHENIERE ENERGY INC COM NEW","ac":"Equities","q":1,"p":287.155,"cp":-1.67,"mv":287.16,"mc":-4.86,"mk":"NYSE"},{"s":"M","d":"MACYS INC COM","ac":"Equities","q":3,"p":24.705,"cp":-3.87,"mv":74.12,"mc":-2.98,"mk":"NYSE"},{"s":"MA","d":"MASTERCARD INC CL A","ac":"Equities","q":3,"p":663.49,"cp":-1.37,"mv":1990.47,"mc":-27.57,"mk":"NYSE"},{"s":"MCK","d":"MCKESSON CORP COM","ac":"Equities","q":3,"p":1094.36,"cp":2.33,"mv":3283.08,"mc":74.76,"mk":"NYSE"},{"s":"META","d":"META PLATFORMS INC CL A","ac":"Equities","q":9,"p":608.37,"cp":-3.43,"mv":5475.33,"mc":-194.67,"mk":"NASDAQ"},{"s":"MICC","d":"THE MAGNUM ICE CREAM COMPANY B V","ac":"Equities","q":1,"p":20.115,"cp":-0.12,"mv":20.12,"mc":-0.11,"mk":"NYSE"},{"s":"MITT","d":"AG MTG INVT TR INC COM NEW","ac":"Equities","q":1,"p":4.9961,"cp":-9.49,"mv":5.0,"mc":-0.52,"mk":"NYSE"},{"s":"MRNA","d":"MODERNA INC COM","ac":"Equities","q":5,"p":243.32,"cp":-5.83,"mv":1216.6,"mc":-75.3,"mk":"NASDAQ"},{"s":"MSFT","d":"MICROSOFT CORP COM","ac":"Equities","q":3,"p":542.89,"cp":-2.32,"mv":1628.67,"mc":-38.73,"mk":"NASDAQ"},{"s":"MTD","d":"METTLER-TOLEDO INTL INC COM","ac":"Equities","q":2,"p":1695.66,"cp":-1.6,"mv":3391.32,"mc":-55.16,"mk":"NYSE"},{"s":"MU","d":"MICRON TECHNOLOGY INC COM","ac":"Equities","q":1,"p":699.63,"cp":-12.02,"mv":699.63,"mc":-95.6,"mk":"NASDAQ"},{"s":"MUA","d":"BLACKROCK MUNIASSETS FD INC COM","ac":"Investment Funds","q":50,"p":9.78,"cp":-0.31,"mv":489.0,"mc":-1.5,"mk":"NYSE"},{"s":"NFLX","d":"NETFLIX INC COM","ac":"Equities","q":40,"p":65.63,"cp":-1.14,"mv":2625.2,"mc":-30.4,"mk":"NASDAQ"},{"s":"NOC","d":"NORTHROP GRUMMAN CORP COM","ac":"Equities","q":2,"p":526.15,"cp":0.15,"mv":1052.3,"mc":1.6,"mk":"NYSE"},{"s":"NOW","d":"SERVICENOW INC COM","ac":"Equities","q":5,"p":104.905,"cp":-3.59,"mv":524.53,"mc":-19.52,"mk":"NYSE"},{"s":"NTTYY","d":"NTT INC SPONSORED ADR","ac":"Equities","q":10,"p":26.197,"cp":0.22,"mv":261.97,"mc":0.57,"mk":"OTC"},{"s":"NVDA","d":"NVIDIA CORP COM","ac":"Equities","q":36,"p":186.58,"cp":-6.77,"mv":6716.88,"mc":-487.8,"mk":"NASDAQ"},{"s":"NVS","d":"NOVARTIS AG SPONSORED ADR","ac":"Equities","q":2,"p":164.025,"cp":-0.58,"mv":328.05,"mc":-1.91,"mk":"NYSE"},{"s":"OCDGF","d":"OCADO GROUP PLC HATFIELD SHS","ac":"Equities","q":15,"p":4.5256,"cp":0,"mv":67.88,"mc":0,"mk":"OTC"},{"s":"OLN","d":"OLIN CORP COM PAR $1","ac":"Equities","q":10,"p":17.99,"cp":-0.5,"mv":179.9,"mc":-0.9,"mk":"NYSE"},{"s":"ORCL","d":"ORACLE CORP COM","ac":"Equities","q":2,"p":115.01,"cp":-7.05,"mv":230.02,"mc":-17.44,"mk":"NYSE"},{"s":"OTIS","d":"OTIS WORLDWIDE CORP COM","ac":"Equities","q":1,"p":79.385,"cp":-0.51,"mv":79.39,"mc":-0.4,"mk":"NYSE"},{"s":"OXY","d":"OCCIDENTAL PETE CORP COM","ac":"Equities","q":3,"p":57.61,"cp":0.49,"mv":172.83,"mc":0.84,"mk":"NYSE"},{"s":"PAYX","d":"PAYCHEX INC COM","ac":"Equities","q":1,"p":119.815,"cp":0.93,"mv":119.82,"mc":1.11,"mk":"NASDAQ"},{"s":"PEP","d":"PEPSICO INC COM","ac":"Equities","q":2,"p":143.0,"cp":0.41,"mv":286.0,"mc":1.16,"mk":"NASDAQ"},{"s":"PFE","d":"PFIZER INC COM","ac":"Equities","q":17,"p":30.515,"cp":-0.89,"mv":518.76,"mc":-4.67,"mk":"NYSE"},{"s":"PLTR","d":"PALANTIR TECHNOLOGIES INC CL A","ac":"Equities","q":50,"p":155.92,"cp":-9.19,"mv":7796.0,"mc":-789.0,"mk":"NASDAQ"},{"s":"PLUG","d":"PLUG PWR INC COM NEW","ac":"Equities","q":5,"p":1.35,"cp":-7.53,"mv":6.75,"mc":-0.55,"mk":"NASDAQ"},{"s":"PSMT","d":"PRICESMART INC COM","ac":"Equities","q":1,"p":162.1,"cp":-1.88,"mv":162.1,"mc":-3.1,"mk":"NASDAQ"},{"s":"PSX","d":"PHILLIPS 66 COM","ac":"Equities","q":2,"p":255.165,"cp":-1.72,"mv":510.33,"mc":-8.93,"mk":"NYSE"},{"s":"PYPL","d":"PAYPAL HLDGS INC COM","ac":"Equities","q":2,"p":59.0,"cp":-1.99,"mv":118.0,"mc":-2.4,"mk":"NASDAQ"},{"s":"RIG","d":"TRANSOCEAN LTD REG SHS","ac":"Equities","q":2,"p":5.235,"cp":-3.94,"mv":10.47,"mc":-0.43,"mk":"NYSE"},{"s":"RIOT","d":"RIOT PLATFORMS INC COM","ac":"Equities","q":10,"p":14.045,"cp":-8.62,"mv":140.45,"mc":-13.25,"mk":"NASDAQ"},{"s":"ROK","d":"ROCKWELL AUTOMATION INC COM","ac":"Equities","q":1,"p":399.38,"cp":-10.03,"mv":399.38,"mc":-44.5,"mk":"NYSE"},{"s":"ROKU","d":"ROKU INC COM CL A","ac":"Equities","q":2,"p":161.17,"cp":-0.98,"mv":322.34,"mc":-3.2,"mk":"NASDAQ"},{"s":"RTX","d":"RTX CORP COM","ac":"Equities","q":2,"p":194.91,"cp":-1.77,"mv":389.82,"mc":-7.04,"mk":"NYSE"},{"s":"SBUX","d":"STARBUCKS CORP COM","ac":"Equities","q":2,"p":107.835,"cp":-1.7,"mv":215.67,"mc":-3.73,"mk":"NASDAQ"},{"s":"SEB","d":"SEABOARD CORP DEL COM","ac":"Equities","q":1,"p":3440.98,"cp":-0.05,"mv":3440.98,"mc":-1.77,"mk":"AMEX"},{"s":"SGCFF","d":"SAGICOR FINANCIAL COMPANY LTD","ac":"Equities","q":92,"p":5.9782,"cp":0,"mv":549.99,"mc":0.09,"mk":"OTC"},{"s":"SGOV","d":"ISHARES 0-3 MNTH TREAS BD ETF","ac":"Investment Funds","q":20,"p":100.46,"cp":0.01,"mv":2009.2,"mc":0.2,"mk":"NYSE"},{"s":"SKHY","d":"SK HYNIX INC SPONSORED ADS","ac":"Equities","q":11,"p":128.45,"cp":-10.22,"mv":1412.95,"mc":-160.82,"mk":"NASDAQ"},{"s":"SNDK","d":"SANDISK CORP COM","ac":"Equities","q":1,"p":866.47,"cp":-16.48,"mv":866.47,"mc":-170.93,"mk":"NASDAQ"},{"s":"SNY","d":"SANOFI SPONS ADR","ac":"Equities","q":4,"p":47.075,"cp":-0.83,"mv":188.3,"mc":-1.58,"mk":"NASDAQ"},{"s":"SPCX","d":"SPACE EXPL TECHNOLOGIES CORP CL A","ac":"Equities","q":3,"p":124.86,"cp":-8.14,"mv":374.58,"mc":-33.18,"mk":"NASDAQ"},{"s":"T","d":"AT&T INC COM","ac":"Equities","q":10,"p":21.82,"cp":-0.05,"mv":218.2,"mc":-0.1,"mk":"NYSE"},{"s":"TEVA","d":"TEVA PHARMACEUTICAL INDS LTD SHS","ac":"Equities","q":5,"p":41.6463,"cp":-0.49,"mv":208.23,"mc":-1.02,"mk":"NYSE"},{"s":"TGT","d":"TARGET CORP COM","ac":"Equities","q":3,"p":158.225,"cp":-2.99,"mv":474.68,"mc":-14.62,"mk":"NYSE"},{"s":"TSM","d":"TAIWAN SEMICONDUCTOR MFG CO ADR","ac":"Equities","q":3,"p":362.56,"cp":-8.39,"mv":1087.68,"mc":-99.57,"mk":"NYSE"},{"s":"TTE","d":"TOTALENERGIES SE SHS","ac":"Equities","q":2,"p":90.465,"cp":0.01,"mv":180.93,"mc":-2.33,"mk":"NYSE"},{"s":"UAA","d":"UNDER ARMOUR INC CL A","ac":"Equities","q":3,"p":5.4202,"cp":-6.06,"mv":16.26,"mc":-1.05,"mk":"NYSE"},{"s":"UPS","d":"UNITED PARCEL SVC INC CL B","ac":"Equities","q":3,"p":112.49,"cp":-1.59,"mv":337.47,"mc":-5.46,"mk":"NYSE"},{"s":"USD999997","d":"U.S. DOLLARS CURRENCY","ac":"Cash","q":208.39,"p":1.0,"cp":0,"mv":208.39,"mc":0,"mk":"OTC"},{"s":"VFC","d":"V F CORP COM","ac":"Equities","q":16,"p":20.615,"cp":-1.51,"mv":329.84,"mc":-5.04,"mk":"NYSE"},{"s":"VTRS","d":"VIATRIS INC COM","ac":"Equities","q":2,"p":18.955,"cp":-1.38,"mv":37.91,"mc":-0.53,"mk":"NASDAQ"},{"s":"WDC","d":"WESTERN DIGITAL CORP COM","ac":"Equities","q":3,"p":272.83,"cp":-15.75,"mv":818.49,"mc":-153.0,"mk":"NASDAQ"},{"s":"WHR","d":"WHIRLPOOL CORP COM","ac":"Equities","q":1,"p":31.05,"cp":-4.9,"mv":31.05,"mc":-1.6,"mk":"NYSE"}];

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
type Tab = "dash" | "screener" | "watchlist" | "chart" | "chat" | "portfolio";
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

// ─── Portfolio Page ────────────────────────────────────────────────────────────
function PortfolioPage() {
  const [search, setSearch] = useState("");
  const [acFilter, setAcFilter] = useState("All");
  const [sortCol, setSortCol] = useState<"mv"|"cp"|"mc"|"p"|"q">("mv");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");

  type PSortKey = "mv"|"cp"|"mc"|"p"|"q";
  const handleSort = (col: PSortKey) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const assetClasses = ["All", "Equities", "Investment Funds", "Cash"];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...PORTFOLIO_HOLDINGS]
      .filter(h =>
        (h.s.toLowerCase().includes(q) || h.d.toLowerCase().includes(q)) &&
        (acFilter === "All" || h.ac === acFilter || (acFilter === "Cash" && h.ac.startsWith("Cash")))
      )
      .sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        return sortDir === "desc" ? bv - av : av - bv;
      });
  }, [search, acFilter, sortCol, sortDir]);

  const totalMV = PORTFOLIO_HOLDINGS.reduce((s, h) => s + h.mv, 0);
  const equitiesMV = PORTFOLIO_HOLDINGS.filter(h => h.ac === "Equities").reduce((s, h) => s + h.mv, 0);
  const fundsMV = PORTFOLIO_HOLDINGS.filter(h => h.ac === "Investment Funds").reduce((s, h) => s + h.mv, 0);
  const cashMV = PORTFOLIO_HOLDINGS.filter(h => h.ac.startsWith("Cash")).reduce((s, h) => s + h.mv, 0);
  const totalDayChg = PORTFOLIO_HOLDINGS.reduce((s, h) => s + h.mc, 0);
  const gainCount = PORTFOLIO_HOLDINGS.filter(h => h.mc > 0).length;
  const lossCount = PORTFOLIO_HOLDINGS.filter(h => h.mc < 0).length;

  const fDollar = (n: number) => `$${Math.abs(n).toLocaleString("en-US", {minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const pct2 = (n: number) => <span style={{color:n>=0?"#10b981":"#f87171",fontWeight:700}}>{n>=0?"+":""}{n.toFixed(2)}%</span>;
  const chgCell = (n: number) => <span style={{color:n>=0?"#10b981":"#f87171",fontWeight:600}}>{n>=0?"+":""}{n>=0?"$"+n.toFixed(2):"-$"+Math.abs(n).toFixed(2)}</span>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* Account header */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:2}}>My Portfolio</div>
            <div style={{fontSize:12,color:"#64748b",display:"flex",gap:16,flexWrap:"wrap"}}>
              <span><span style={{color:"#94a3b8"}}>Account:</span> P6F001044</span>
              <span><span style={{color:"#94a3b8"}}>IBD:</span> P6F</span>
              <span><span style={{color:"#94a3b8"}}>Custodian:</span> Pershing LLC</span>
              <span><span style={{color:"#94a3b8"}}>Holdings as of:</span> 11/05/2026</span>
              <span><span style={{color:"#94a3b8"}}>Currency:</span> USD</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:32,fontWeight:900,color:"#f1f5f9"}}>${totalMV.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
            <div style={{fontSize:13,color:totalDayChg>=0?"#10b981":"#f87171",fontWeight:700}}>
              {totalDayChg>=0?"▲ +":"▼ "}{totalDayChg.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} today
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {[
          {l:"Total Market Value",v:`$${totalMV.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,col:"#818cf8"},
          {l:"Equities",v:`$${equitiesMV.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,col:"#10b981"},
          {l:"Investment Funds",v:`$${fundsMV.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,col:"#f59e0b"},
          {l:"Cash & Bank Deposits",v:`$${cashMV.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,col:"#94a3b8"},
          {l:"Day Change",v:(totalDayChg>=0?"+":"")+`$${totalDayChg.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,col:totalDayChg>=0?"#10b981":"#f87171"},
        ].map(c=>(
          <div key={c.l} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"13px 15px"}}>
            <div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>{c.l}</div>
            <div style={{fontSize:18,fontWeight:800,color:c.col}}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Portfolio Allocation</div>
        <div style={{display:"flex",height:14,borderRadius:7,overflow:"hidden",gap:1}}>
          <div style={{width:`${(equitiesMV/totalMV)*100}%`,background:"#10b981"}} title={`Equities ${((equitiesMV/totalMV)*100).toFixed(1)}%`}/>
          <div style={{width:`${(fundsMV/totalMV)*100}%`,background:"#f59e0b"}} title={`Funds ${((fundsMV/totalMV)*100).toFixed(1)}%`}/>
          <div style={{width:`${(cashMV/totalMV)*100}%`,background:"#64748b"}} title={`Cash ${((cashMV/totalMV)*100).toFixed(1)}%`}/>
        </div>
        <div style={{display:"flex",gap:20,marginTop:8,fontSize:11,color:"#94a3b8"}}>
          <span><span style={{color:"#10b981"}}>■</span> Equities {((equitiesMV/totalMV)*100).toFixed(1)}%</span>
          <span><span style={{color:"#f59e0b"}}>■</span> Investment Funds {((fundsMV/totalMV)*100).toFixed(1)}%</span>
          <span><span style={{color:"#64748b"}}>■</span> Cash {((cashMV/totalMV)*100).toFixed(1)}%</span>
          <span style={{marginLeft:"auto"}}><span style={{color:"#10b981"}}>▲ {gainCount} Up</span> · <span style={{color:"#f87171"}}>▼ {lossCount} Down</span> · {PORTFOLIO_HOLDINGS.length} total positions</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"12px 14px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbol or description..."
          style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#f1f5f9",fontSize:13,width:220,outline:"none"}}/>
        <div style={{display:"flex",gap:6}}>
          {assetClasses.map(ac=>(
            <button key={ac} onClick={()=>setAcFilter(ac)}
              style={{padding:"5px 12px",borderRadius:20,background:acFilter===ac?"#6366f1":"#1e293b",border:"1px solid",borderColor:acFilter===ac?"#6366f1":"#334155",color:acFilter===ac?"#fff":"#94a3b8",fontSize:11,cursor:"pointer"}}>
              {ac}
            </button>
          ))}
        </div>
        <span style={{fontSize:12,color:"#64748b",marginLeft:"auto"}}>{filtered.length} of {PORTFOLIO_HOLDINGS.length} positions</span>
      </div>

      {/* Holdings table */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#1e293b"}}>
              <th style={{padding:"10px 12px",textAlign:"left",color:"#64748b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Symbol</th>
              <th style={{padding:"10px 12px",textAlign:"left",color:"#64748b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Description</th>
              <th style={{padding:"10px 12px",textAlign:"center",color:"#64748b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Asset Class</th>
              <th style={{padding:"10px 12px",textAlign:"right",color:"#64748b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Exchange</th>
              {(["q","p","mv","mc","cp"] as const).map(col=>(
                <th key={col} onClick={()=>handleSort(col)} style={{padding:"10px 12px",textAlign:"right",color:"#64748b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
                  {col==="q"?"Qty":col==="p"?"Price":col==="mv"?"Mkt Value":col==="mc"?"Day Chg $":"Day Chg %"}
                  {sortCol===col&&(sortDir==="desc"?" ↓":" ↑")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h,i)=>(
              <tr key={h.s} style={{borderBottom:"1px solid #1a2540",background:i%2===0?"transparent":"#0d1628"}}
                onMouseEnter={e=>(e.currentTarget.style.background="#1e293b")}
                onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?"transparent":"#0d1628")}>
                <td style={{padding:"9px 12px",fontWeight:800,color:"#818cf8",whiteSpace:"nowrap"}}>{h.s}</td>
                <td style={{padding:"9px 12px",color:"#94a3b8",fontSize:11,maxWidth:220}}>{h.d}</td>
                <td style={{padding:"9px 12px",textAlign:"center"}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:h.ac==="Equities"?"#052e16":h.ac==="Investment Funds"?"#1c1003":"#0f172a",color:h.ac==="Equities"?"#10b981":h.ac==="Investment Funds"?"#f59e0b":"#94a3b8",fontWeight:600}}>
                    {h.ac.replace("Cash, Money Funds and Bank Deposits","Cash")}
                  </span>
                </td>
                <td style={{padding:"9px 12px",textAlign:"right",color:"#64748b",fontSize:11}}>{h.mk}</td>
                <td style={{padding:"9px 12px",textAlign:"right",color:"#f1f5f9"}}>{h.q % 1 === 0 ? h.q : h.q.toFixed(2)}</td>
                <td style={{padding:"9px 12px",textAlign:"right",fontWeight:700}}>{h.p>0?`$${h.p.toFixed(2)}`:"—"}</td>
                <td style={{padding:"9px 12px",textAlign:"right",fontWeight:700,color:"#f1f5f9"}}>{fDollar(h.mv)}</td>
                <td style={{padding:"9px 12px",textAlign:"right"}}>{h.mc!==0?chgCell(h.mc):"—"}</td>
                <td style={{padding:"9px 12px",textAlign:"right"}}>{h.cp!==0?pct2(h.cp):"—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"#1e293b",borderTop:"2px solid #334155"}}>
              <td colSpan={6} style={{padding:"10px 12px",fontWeight:700,color:"#f1f5f9",fontSize:13}}>TOTAL ({filtered.length} positions)</td>
              <td style={{padding:"10px 12px",textAlign:"right",fontWeight:800,color:"#818cf8",fontSize:14}}>
                ${filtered.reduce((s,h)=>s+h.mv,0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
              </td>
              <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700}}>
                {chgCell(filtered.reduce((s,h)=>s+h.mc,0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
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
    {id:"portfolio",label:"My Portfolio"},
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

        {/* ══════ MY PORTFOLIO ══════ */}
        {tab==="portfolio"&&<PortfolioPage/>}

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
