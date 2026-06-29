import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from "recharts";

// ── Theme colours ────────────────────────────────────────
const T = {
  bg:        "#0F0F1A",   // deep dark background
  bg2:       "#1A1A2E",   // card background
  bg3:       "#16213E",   // slightly lighter surface
  border:    "#2A2A4A",   // subtle border
  border2:   "#3A3A5C",   // brighter border
  text:      "#E2E8F0",   // primary text
  muted:     "#8892A4",   // muted text
  dim:       "#4A5568",   // very dim text
  accent:    "#7C3AED",   // purple accent
  accentLt:  "#A78BFA",   // light purple
  teal:      "#06B6D4",   // cyan teal
  tealLt:    "#67E8F9",   // light teal
  green:     "#10B981",   // green
  amber:     "#F59E0B",   // amber/gold for stars
  red:       "#EF4444",
  orange:    "#F97316",
};

// meal colours adapted for dark theme
const MEAL_COLORS = { breakfast:"#F59E0B", lunch:"#10B981", dinner:"#8B5CF6", snacks:"#F97316" };
const MEAL_LABELS = { breakfast:"Breakfast", lunch:"Lunch", dinner:"Dinner", snacks:"Snacks" };
const DAYS        = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOSTELS     = ["Hostel A","Hostel B","Hostel C","Hostel D"];
const BRANCHES    = ["CSE","ECE","ME","Civil","IT","EEE","Data Science","AI & ML"];
const YEARS       = ["1st Year","2nd Year","3rd Year","4th Year"];

const MENU_ITEMS = [
  { id:1,  name:"Idli Sambar",          meal:"breakfast", category:"veg",     emoji:"🍱" },
  { id:2,  name:"Poha",                 meal:"breakfast", category:"veg",     emoji:"🫕" },
  { id:3, name:"Masala Dosa",           meal:"dinner",    category:"veg",     emoji:"🧇" },
  { id:4,  name:"Bread Omelette",       meal:"breakfast", category:"non-veg", emoji:"🍳" },
  { id:5,  name:"Dal Rice",             meal:"lunch",     category:"veg",     emoji:"🍛" },
  { id:6,  name:"Rajma Chawal",         meal:"lunch",     category:"veg",     emoji:"🫘" },
  { id:7,  name:"Chicken Curry",        meal:"lunch",     category:"non-veg", emoji:"🍗" },
  { id:8,  name:"Roti Sabzi",           meal:"lunch",     category:"veg",     emoji:"🫓" },
  { id:9,  name:"Samosa",               meal:"snacks",    category:"veg",     emoji:"🥟" },
  { id:10,name:"Masala Chai",          meal:"snacks",    category:"veg",     emoji:"☕" },
  { id:11,name:"Dal Tadka",            meal:"dinner",    category:"veg",     emoji:"🍲" },
  { id:12,name:"Paneer Butter Masala", meal:"dinner",    category:"veg",     emoji:"🧀" },
  { id:13,name:"Egg Curry",            meal:"dinner",    category:"non-veg", emoji:"🥚" },
  { id:14, name:"Jeera Rice",           meal:"dinner",    category:"veg",     emoji:"🍚" },
  
];

const COMMENTS = {
  5:["Absolutely delicious!","Perfect seasoning, very fresh.","Outstanding quality!","Loved it today!"],
  4:["Pretty good today.","Tasty as usual.","Good portion and taste.","Enjoyed it!"],
  3:["Average today.","Okay, nothing special.","Edible but not the best.","Mediocre."],
  2:["Too salty today.","Slightly undercooked.","Not fresh enough.","Disappointing."],
  1:["Very disappointed.","Not acceptable.","Worst meal this month."],
};
const DEMO_NAMES = ["Rahul K.","Priya S.","Amit P.","Sneha R.","Vikram M.","Ananya T.","Rohan G.","Divya N."];

function seedRatings() {
  const BIAS = {1:[5,5,4,4,3],2:[5,4,4,3,3],3:[4,4,3,3,2],4:[5,5,5,4,4],5:[5,4,4,4,3],6:[4,4,3,3,2],7:[5,5,4,4,3],8:[5,5,5,4,4],9:[5,5,4,4,3],10:[4,4,3,3,2],11:[5,5,5,4,4],12:[4,4,3,3,2],13:[4,4,3,2,2]};
  const out=[]; let id=1;
  MENU_ITEMS.forEach(item=>{
    for(let i=0;i<Math.floor(Math.random()*10)+8;i++){
      const pool=BIAS[item.id]||[4,3,3,2];
      const r=pool[Math.floor(Math.random()*pool.length)];
      const di=Math.floor(Math.random()*7);
      out.push({id:id++,itemId:item.id,rating:r,comment:COMMENTS[r][Math.floor(Math.random()*COMMENTS[r].length)],student:DEMO_NAMES[Math.floor(Math.random()*DEMO_NAMES.length)],day:DAYS[di],timestamp:new Date(Date.now()-Math.random()*7*86400000)});
    }
  });
  return out;
}

const simpleHash = s=>[...s].reduce((h,c)=>(Math.imul(31,h)+c.charCodeAt(0))|0,0).toString(16);
const today      = ()=>new Date().toDateString();

// ── Dark card style ──────────────────────────────────────
const card = {
  background: T.bg2,
  borderRadius: 14,
  border: `1px solid ${T.border}`,
  padding: "16px 18px",
};

// ── Input style ──────────────────────────────────────────
const inp = (extra={}) => ({
  width:"100%", padding:"10px 14px", borderRadius:8,
  border:`1px solid ${T.border2}`, fontSize:14,
  fontFamily:"inherit", background:T.bg3,
  color:T.text, boxSizing:"border-box", outline:"none", ...extra
});

// ── Helpers ──────────────────────────────────────────────
function Stars({ rating, size=14 }) {
  return <span style={{display:"inline-flex",gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:size,color:s<=Math.round(rating)?T.amber:T.dim}}>★</span>)}</span>;
}
function Badge({ r }) {
  const m = r>=4.5?{bg:"#064E3B",c:"#6EE7B7",t:"Excellent"}:r>=3.5?{bg:"#451A03",c:"#FCD34D",t:"Good"}:r>=2.5?{bg:"#431407",c:"#FDBA74",t:"Average"}:{bg:"#450A0A",c:"#FCA5A5",t:"Poor"};
  return <span style={{fontSize:10,background:m.bg,color:m.c,padding:"2px 8px",borderRadius:10,border:`1px solid ${m.c}30`}}>{m.t}</span>;
}

const USERS_DB = {};

// ════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════
export default function App() {
  const [user,     setUser]    = useState(null);
  const [authView, setAuthView]= useState("login");

  if(!user) return authView==="login"
    ? <Login   onLogin={setUser}  switchToSignup={()=>setAuthView("signup")}/>
    : <Signup  onSignup={setUser} switchToLogin={()=>setAuthView("login")}/>;
  return <MessApp user={user} onLogout={()=>setUser(null)}/>;
}

// ════════════════════════════════════════════════════════
// AUTH SHELL
// ════════════════════════════════════════════════════════
function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,sans-serif",
      backgroundImage:"radial-gradient(ellipse at 20% 50%, #1a0533 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #0a1628 0%, transparent 50%)"}}>
      <div style={{background:T.bg2,borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:430,
        border:`1px solid ${T.border}`,
        boxShadow:"0 0 0 1px rgba(124,58,237,0.1), 0 25px 50px rgba(0,0,0,0.5)"}}>

        {/* Glow accent top */}
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:200,height:2,background:"linear-gradient(90deg,transparent,#7C3AED,transparent)",borderRadius:2}}/>

        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{fontSize:48,marginBottom:10}}>🍽️</div>
          <h1 style={{fontSize:22,fontWeight:700,color:T.text,margin:0}}>{title}</h1>
          <p style={{fontSize:13,color:T.muted,margin:"6px 0 0"}}>{subtitle}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</label>
      {children}
    </div>
  );
}
function ErrBox({ msg }) {
  return <div style={{background:"#450A0A",color:"#FCA5A5",padding:"10px 14px",borderRadius:8,fontSize:13,border:"1px solid #7f1d1d"}}>⚠️ {msg}</div>;
}
function AuthBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{width:"100%",padding:"13px 0",borderRadius:10,fontSize:15,fontWeight:700,
      background:"linear-gradient(135deg,#7C3AED,#06B6D4)",
      color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",marginTop:4,
      boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════
// SIGNUP
// ════════════════════════════════════════════════════════
function Signup({ onSignup, switchToLogin }) {
  const [f,setF]=useState({name:"",roll:"",password:"",confirm:"",hostel:"",branch:"",year:""});
  const [err,setErr]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [showCon,setShowCon]=useState(false);
  const upd=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  function submit(){
    setErr("");
    if(!f.name.trim())    return setErr("Enter your name.");
    if(!f.roll.trim())    return setErr("Enter your roll number.");
    if(!/^[A-Za-z0-9]+$/.test(f.roll)) return setErr("Roll number: letters & numbers only.");
    if(USERS_DB[f.roll.toUpperCase()]) return setErr("Roll number already registered. Please login.");
    if(f.password.length<6) return setErr("Password must be at least 6 characters.");
    if(f.password!==f.confirm) return setErr("Passwords do not match.");
    if(!f.hostel) return setErr("Select your hostel.");
    if(!f.branch) return setErr("Select your branch.");
    if(!f.year)   return setErr("Select your year.");
    const u={name:f.name.trim(),roll:f.roll.trim().toUpperCase(),hostel:f.hostel,branch:f.branch,year:f.year,hashedPw:simpleHash(f.password)};
    USERS_DB[u.roll]=u; onSignup(u);
  }

  return (
    <AuthShell title="Create Account" subtitle="Join the mess rating system">
      <Field label="Full Name"><input style={inp()} placeholder="e.g. Rahul Kumar" value={f.name} onChange={upd("name")}/></Field>
      <Field label="Roll Number"><input style={inp()} placeholder="e.g. 21CS001" value={f.roll} onChange={upd("roll")}/></Field>
      <Field label="Password">
        <div style={{position:"relative"}}>
          <input style={inp({paddingRight:40})} type={showPw?"text":"password"} placeholder="Min 6 characters" value={f.password} onChange={upd("password")}/>
          <span onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16}}>{showPw?"🙈":"👁️"}</span>
        </div>
      </Field>
      <Field label="Confirm Password">
        <div style={{position:"relative"}}>
          <input style={inp({paddingRight:40})} type={showCon?"text":"password"} placeholder="Re-enter password" value={f.confirm} onChange={upd("confirm")} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <span onClick={()=>setShowCon(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16}}>{showCon?"🙈":"👁️"}</span>
        </div>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Hostel"><select style={inp({cursor:"pointer"})} value={f.hostel} onChange={upd("hostel")}><option value="">Select</option>{HOSTELS.map(h=><option key={h}>{h}</option>)}</select></Field>
        <Field label="Branch"><select style={inp({cursor:"pointer"})} value={f.branch} onChange={upd("branch")}><option value="">Select</option>{BRANCHES.map(b=><option key={b}>{b}</option>)}</select></Field>
      </div>
      <Field label="Year of Study"><select style={inp({cursor:"pointer"})} value={f.year} onChange={upd("year")}><option value="">Select year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select></Field>
      {err&&<ErrBox msg={err}/>}
      <AuthBtn onClick={submit}>Create Account →</AuthBtn>
      <p style={{textAlign:"center",fontSize:13,color:T.muted,marginTop:8}}>Already have an account? <span onClick={switchToLogin} style={{color:T.accentLt,cursor:"pointer",fontWeight:600}}>Login</span></p>
    </AuthShell>
  );
}

// ════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════
function Login({ onLogin, switchToSignup }) {
  const [roll,setRoll]=useState("");
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");

  function submit(){
    setErr("");
    if(!roll.trim()) return setErr("Enter your roll number.");
    if(!pw.trim())   return setErr("Enter your password.");
    const stored=USERS_DB[roll.trim().toUpperCase()];
    if(!stored)      return setErr("Roll number not found. Please sign up first.");
    if(stored.hashedPw!==simpleHash(pw)) return setErr("Incorrect password. Try again.");
    onLogin(stored);
  }

  return (
    <AuthShell title="Welcome Back 👋" subtitle="Login to rate today's mess food">
      <Field label="Roll Number"><input style={inp()} placeholder="e.g. 21CS001" value={roll} onChange={e=>setRoll(e.target.value)}/></Field>
      <Field label="Password">
        <div style={{position:"relative"}}>
          <input style={inp({paddingRight:40})} type={showPw?"text":"password"} placeholder="Your password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <span onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16}}>{showPw?"🙈":"👁️"}</span>
        </div>
      </Field>
      {err&&<ErrBox msg={err}/>}
      <AuthBtn onClick={submit}>Login →</AuthBtn>
      <div style={{background:"#1a1a3e",border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 14px",marginTop:4}}>
        <p style={{fontSize:12,color:T.tealLt,margin:0,fontWeight:600}}>💡 First time here?</p>
        <p style={{fontSize:12,color:T.muted,margin:"4px 0 0"}}>Click "Sign Up" below to create your account with your roll number.</p>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:T.muted,marginTop:8}}>New student? <span onClick={switchToSignup} style={{color:T.accentLt,cursor:"pointer",fontWeight:600}}>Sign Up</span></p>
    </AuthShell>
  );
}

// ════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════
function MessApp({ user, onLogout }) {
  const [tab,        setTab]      = useState("dashboard");
  const [ratings,    setRatings]  = useState(seedRatings);
  const [mealFilter, setMealFil]  = useState("all");
  const [hover,      setHover]    = useState({});
  const [newRating,  setNewRat]   = useState({});
  const [newComment, setNewCom]   = useState({});
  const [submitted,  setSubmitted]= useState(new Set());
  const [rvFilter,   setRvFilter] = useState("all");

  function ratedToday(itemId){
    return ratings.some(r=>r.itemId===itemId&&r.student===user.name&&new Date(r.timestamp).toDateString()===today());
  }

  const totalReviews = ratings.length;
  const avgRating    = (ratings.reduce((a,r)=>a+r.rating,0)/totalReviews).toFixed(1);

  const itemStats = useMemo(()=>
    MENU_ITEMS.map(item=>{
      const rs=ratings.filter(r=>r.itemId===item.id);
      const avg=rs.length?rs.reduce((a,r)=>a+r.rating,0)/rs.length:0;
      return {...item,avgRating:avg,count:rs.length};
    }).sort((a,b)=>b.avgRating-a.avgRating)
  ,[ratings]);

  const weeklyTrend = useMemo(()=>DAYS.map(day=>{
    const rs=ratings.filter(r=>r.day===day);
    return {day,avg:rs.length?parseFloat((rs.reduce((a,r)=>a+r.rating,0)/rs.length).toFixed(2)):0};
  }),[ratings]);

  const mealStats = useMemo(()=>["breakfast","lunch","dinner","snacks"].map(meal=>{
    const ids=MENU_ITEMS.filter(i=>i.meal===meal).map(i=>i.id);
    const rs=ratings.filter(r=>ids.includes(r.itemId));
    const avg=rs.length?rs.reduce((a,r)=>a+r.rating,0)/rs.length:0;
    return {meal:MEAL_LABELS[meal],avg:parseFloat(avg.toFixed(2)),color:MEAL_COLORS[meal]};
  }),[ratings]);

  const ratingDist = useMemo(()=>[5,4,3,2,1].map(star=>({
    star,count:ratings.filter(r=>r.rating===star).length,
    pct:Math.round(ratings.filter(r=>r.rating===star).length/totalReviews*100)
  })),[ratings]);

  const topItems   = itemStats.slice(0,3);
  const worstItems = [...itemStats].sort((a,b)=>a.avgRating-b.avgRating).slice(0,3);
  const recentRevs = useMemo(()=>[...ratings].sort((a,b)=>b.timestamp-a.timestamp).slice(0,5).map(r=>({...r,item:MENU_ITEMS.find(i=>i.id===r.itemId)})),[ratings]);
  const filtRevs   = useMemo(()=>{
    let f=[...ratings].sort((a,b)=>b.timestamp-a.timestamp);
    if(rvFilter!=="all") f=f.filter(r=>r.itemId===parseInt(rvFilter));
    return f.map(r=>({...r,item:MENU_ITEMS.find(i=>i.id===r.itemId)}));
  },[ratings,rvFilter]);

  const menuShow = mealFilter==="all"?MENU_ITEMS:MENU_ITEMS.filter(i=>i.meal===mealFilter);

  function handleSubmit(itemId){
    if(!newRating[itemId]||ratedToday(itemId)) return;
    setRatings(prev=>[...prev,{id:prev.length+1,itemId,rating:newRating[itemId],comment:newComment[itemId]||"",student:user.name,day:DAYS[new Date().getDay()===0?6:new Date().getDay()-1],timestamp:new Date()}]);
    setSubmitted(prev=>new Set([...prev,itemId]));
  }

  const NAV=[{key:"dashboard",label:"📊 Dashboard"},{key:"rate",label:"⭐ Rate Today"},{key:"analytics",label:"📈 Analytics"},{key:"reviews",label:"💬 Reviews"}];

  // custom tooltip for charts
  const DarkTooltip = ({ active, payload, label }) => {
    if(!active||!payload?.length) return null;
    return (
      <div style={{background:T.bg3,border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.text}}>
        <p style={{margin:0,color:T.muted}}>{label}</p>
        <p style={{margin:0,fontWeight:700,color:T.accentLt}}>{payload[0]?.value?.toFixed?payload[0].value.toFixed(2):payload[0]?.value}</p>
      </div>
    );
  };

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:T.bg,minHeight:"100vh",paddingBottom:48,
      backgroundImage:"radial-gradient(ellipse at 0% 0%, #1a0533 0%, transparent 40%), radial-gradient(ellipse at 100% 100%, #0a1628 0%, transparent 40%)"}}>

      {/* ── Header ── */}
      <div style={{background:T.bg2,borderBottom:`1px solid ${T.border}`,padding:"14px 24px 0",
        boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{background:"linear-gradient(135deg,#7C3AED,#06B6D4)",borderRadius:12,padding:"7px 9px",fontSize:20}}>🍽️</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:"-0.3px"}}>Campus Mess</div>
            <div style={{fontSize:11,color:T.muted}}>Food Rating & Analytics</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg3,border:`1px solid ${T.border2}`,padding:"5px 12px 5px 6px",borderRadius:20}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#06B6D4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T.accentLt,lineHeight:1.2}}>{user.name}</div>
                <div style={{fontSize:10,color:T.muted}}>{user.roll} · {user.branch}</div>
              </div>
            </div>
            <button onClick={onLogout} style={{fontSize:11,padding:"5px 12px",borderRadius:20,border:`1px solid ${T.border2}`,background:"transparent",color:T.muted,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
          </div>
        </div>
        {/* Nav */}
        <div style={{display:"flex",gap:2}}>
          {NAV.map(({key,label})=>(
            <button key={key} onClick={()=>setTab(key)} style={{
              padding:"7px 16px",fontSize:12,cursor:"pointer",borderRadius:"8px 8px 0 0",
              background:tab===key?T.bg:"transparent",
              color:tab===key?T.accentLt:T.muted,
              border:tab===key?`1px solid ${T.border}`:"1px solid transparent",
              borderBottom:tab===key?`1px solid ${T.bg}`:"1px solid transparent",
              fontWeight:tab===key?700:400,marginBottom:tab===key?-1:0,
              transition:"all 0.15s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 24px"}}>

        {/* ════ DASHBOARD ════ */}
        {tab==="dashboard"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
            {[
              {label:"Avg Rating",   value:avgRating,        sub:"out of 5.0",  icon:"⭐",glow:"#F59E0B"},
              {label:"Total Reviews",value:totalReviews,      sub:"this week",   icon:"💬",glow:"#7C3AED"},
              {label:"Menu Items",   value:MENU_ITEMS.length, sub:"on menu",     icon:"🍴",glow:"#06B6D4"},
              {label:"Your Hostel",  value:user.hostel,       sub:user.branch,   icon:"🏠",glow:"#F97316"},
            ].map(({label,value,sub,icon,glow})=>(
              <div key={label} style={{...card,boxShadow:`0 0 20px ${glow}15`,border:`1px solid ${glow}30`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</span>
                  <span style={{fontSize:18}}>{icon}</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:T.text,lineHeight:1}}>{value}</div>
                <div style={{fontSize:11,color:T.dim,marginTop:4}}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:T.text}}>🏆 Top Rated This Week</div>
              {topItems.map((item,i)=>(
                <div key={item.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<2?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:22}}>{item.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{item.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                      <Stars rating={item.avgRating}/><span style={{fontSize:11,color:T.muted}}>{item.avgRating.toFixed(1)} · {item.count} reviews</span>
                    </div>
                  </div>
                  <span style={{fontSize:11,background:"#064E3B",color:"#6EE7B7",padding:"2px 9px",borderRadius:12,border:"1px solid #065F3630"}}>#{i+1}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:T.text}}>⚠️ Needs Improvement</div>
              {worstItems.map((item,i)=>(
                <div key={item.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<2?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:22}}>{item.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{item.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                      <Stars rating={item.avgRating}/><span style={{fontSize:11,color:T.muted}}>{item.avgRating.toFixed(1)} · {item.count} reviews</span>
                    </div>
                  </div>
                  <span style={{fontSize:11,background:"#450A0A",color:"#FCA5A5",padding:"2px 9px",borderRadius:12}}>Low</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14}}>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:T.text}}>📈 Rating Trend — This Week</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:T.muted}} axisLine={{stroke:T.border}} tickLine={false}/>
                  <YAxis domain={[1,5]} tick={{fontSize:10,fill:T.muted}} width={22} axisLine={false} tickLine={false}/>
                  <Tooltip content={<DarkTooltip/>}/>
                  <Line type="monotone" dataKey="avg" stroke={T.accentLt} strokeWidth={2.5} dot={{fill:T.accentLt,r:3}} activeDot={{r:5,fill:T.teal}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:T.text}}>💬 Latest Feedback</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {recentRevs.map(r=>(
                  <div key={r.id} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 10px",background:T.bg3,borderRadius:8,border:`1px solid ${T.border}`}}>
                    <span style={{fontSize:16}}>{r.item?.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{r.item?.name}</span>
                        <Badge r={r.rating}/>
                      </div>
                      <span style={{fontSize:11,color:T.muted}}>{r.student} · {r.day}</span>
                    </div>
                    <Stars rating={r.rating} size={11}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>}

        {/* ════ RATE TODAY ════ */}
        {tab==="rate"&&<>
          <div style={{background:"#1a1a3e",border:`1px solid ${T.border2}`,borderRadius:10,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>👋</span>
            <div>
              <span style={{fontSize:13,fontWeight:700,color:T.accentLt}}>Hi {user.name}!</span>
              <span style={{fontSize:12,color:T.muted,marginLeft:8}}>Rate today's meals. Each item can be rated once per day.</span>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
            {[["all","🍽️ All"],["breakfast","🌅 Breakfast"],["lunch","☀️ Lunch"],["snacks","🌤️ Snacks"],["dinner","🌙 Dinner"]].map(([val,label])=>(
              <button key={val} onClick={()=>setMealFil(val)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,cursor:"pointer",background:mealFilter===val?(MEAL_COLORS[val]||T.accent):T.bg3,color:mealFilter===val?"#fff":T.muted,border:`1px solid ${mealFilter===val?(MEAL_COLORS[val]||T.accent):T.border}`,fontWeight:mealFilter===val?700:400,transition:"all 0.15s"}}>{label}</button>
            ))}
          </div>
          {["breakfast","lunch","snacks","dinner"].filter(m=>mealFilter==="all"||mealFilter===m).map(meal=>{
            const items=menuShow.filter(i=>i.meal===meal);
            if(!items.length) return null;
            return (
              <div key={meal} style={{marginBottom:24}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:MEAL_COLORS[meal],boxShadow:`0 0 8px ${MEAL_COLORS[meal]}`}}/>
                  <span style={{fontSize:15,fontWeight:700,color:T.text}}>{MEAL_LABELS[meal]}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {items.map(item=>{
                    const stats=itemStats.find(i=>i.id===item.id);
                    const done=submitted.has(item.id)||ratedToday(item.id);
                    const cur=newRating[item.id]||0;
                    const hov=hover[item.id]||0;
                    return (
                      <div key={item.id} style={{...card,border:done?`1px solid ${T.green}40`:`1px solid ${T.border}`,transition:"border 0.2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{fontSize:28}}>{item.emoji}</span>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:item.category==="veg"?"#064E3B":"#450A0A",color:item.category==="veg"?"#6EE7B7":"#FCA5A5"}}>{item.category}</span>
                        </div>
                        <div style={{fontWeight:700,fontSize:14,marginBottom:2,color:T.text}}>{item.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}>
                          <Stars rating={stats?.avgRating||0} size={11}/>
                          <span style={{fontSize:11,color:T.muted}}>{(stats?.avgRating||0).toFixed(1)} avg</span>
                        </div>
                        {!done?(
                          <>
                            <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:8}}>
                              <span style={{fontSize:11,color:T.muted}}>Rate:</span>
                              {[1,2,3,4,5].map(s=>(
                                <span key={s} style={{fontSize:22,cursor:"pointer",color:s<=(hov||cur)?T.amber:T.dim,transition:"color 0.1s,transform 0.1s",display:"inline-block",transform:s<=(hov||cur)?"scale(1.15)":"scale(1)"}}
                                  onMouseEnter={()=>setHover(p=>({...p,[item.id]:s}))}
                                  onMouseLeave={()=>setHover(p=>({...p,[item.id]:0}))}
                                  onClick={()=>setNewRat(p=>({...p,[item.id]:s}))}>★</span>
                              ))}
                            </div>
                            <textarea placeholder="Comment (optional)…" value={newComment[item.id]||""} onChange={e=>setNewCom(p=>({...p,[item.id]:e.target.value}))}
                              style={{width:"100%",height:44,fontSize:12,padding:"5px 8px",borderRadius:6,border:`1px solid ${T.border2}`,resize:"none",fontFamily:"inherit",boxSizing:"border-box",background:T.bg3,color:T.text}}/>
                            <button onClick={()=>handleSubmit(item.id)} disabled={!cur} style={{marginTop:8,width:"100%",padding:"8px 0",borderRadius:6,fontSize:12,cursor:cur?"pointer":"not-allowed",background:cur?"linear-gradient(135deg,#7C3AED,#06B6D4)":"transparent",color:cur?T.text:T.dim,border:cur?"none":`1px solid ${T.border}`,fontWeight:cur?700:400,fontFamily:"inherit",transition:"all 0.2s"}}>
                              Submit Rating
                            </button>
                          </>
                        ):(
                          <div style={{display:"flex",alignItems:"center",gap:6,padding:"9px 12px",background:"#064E3B30",borderRadius:8,border:`1px solid ${T.green}40`}}>
                            <span>✅</span><span style={{fontSize:12,color:"#6EE7B7"}}>Already rated today!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>}

        {/* ════ ANALYTICS ════ */}
        {tab==="analytics"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:T.text}}>📈 Weekly Trend</div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[1,5]} tick={{fontSize:10,fill:T.muted}} width={22} axisLine={false} tickLine={false}/>
                  <Tooltip content={<DarkTooltip/>}/>
                  <Line type="monotone" dataKey="avg" stroke={T.accentLt} strokeWidth={2.5} dot={{fill:T.accentLt,r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:T.text}}>🎯 Meal Quality Radar</div>
              <ResponsiveContainer width="100%" height={190}>
                <RadarChart data={mealStats}>
                  <PolarGrid stroke={T.border}/>
                  <PolarAngleAxis dataKey="meal" tick={{fontSize:11,fill:T.muted}}/>
                  <Radar dataKey="avg" stroke={T.accentLt} fill={T.accent} fillOpacity={0.3}/>
                  <Tooltip content={<DarkTooltip/>}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{...card,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:T.text}}>⭐ Rating Distribution</div>
            {ratingDist.map(({star,count,pct})=>(
              <div key={star} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                <span style={{fontSize:12,color:T.muted,width:28}}>{star}★</span>
                <div style={{flex:1,height:12,background:T.bg3,borderRadius:7,overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{height:"100%",width:`${pct}%`,background:star>=4?"linear-gradient(90deg,#7C3AED,#06B6D4)":star===3?"#F59E0B":"#EF4444",borderRadius:7,transition:"width 0.5s ease"}}/>
                </div>
                <span style={{fontSize:11,color:T.muted,width:80,textAlign:"right"}}>{pct}% ({count})</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:T.text}}>🏆 Food Leaderboard</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={itemStats} layout="vertical" barSize={13} margin={{left:10,right:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false}/>
                <XAxis type="number" domain={[0,5]} tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:T.muted}} width={130} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="avgRating" radius={[0,5,5,0]}>
                  {itemStats.map((e,i)=><Cell key={i} fill={MEAL_COLORS[e.meal]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {/* ════ REVIEWS ════ */}
        {tab==="reviews"&&<>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span>🔍</span>
            <select value={rvFilter} onChange={e=>setRvFilter(e.target.value)} style={{padding:"5px 12px",borderRadius:6,fontSize:12,border:`1px solid ${T.border2}`,background:T.bg2,color:T.text,cursor:"pointer"}}>
              <option value="all">All Items</option>
              {MENU_ITEMS.map(i=><option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
            </select>
            <span style={{fontSize:12,color:T.muted}}>{filtRevs.length} reviews</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {filtRevs.map(r=>{
              const isOwn=r.student===user.name;
              return (
                <div key={r.id} style={{...card,display:"flex",gap:12,alignItems:"flex-start",border:isOwn?`1px solid ${T.accent}50`:`1px solid ${T.border}`}}>
                  <span style={{fontSize:22}}>{r.item?.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:T.text}}>{r.item?.name}</span>
                      <Stars rating={r.rating} size={12}/>
                      <Badge r={r.rating}/>
                      {isOwn&&<span style={{fontSize:10,background:"#1e1b4b",color:T.accentLt,padding:"1px 8px",borderRadius:10,border:`1px solid ${T.accent}50`}}>You</span>}
                    </div>
                    {r.comment&&<p style={{margin:"0 0 4px",fontSize:12,color:T.muted,fontStyle:"italic"}}>"{r.comment}"</p>}
                    <span style={{fontSize:11,color:T.dim}}>— {r.student} · {r.day}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>}
      </div>
    </div>
  );
}
