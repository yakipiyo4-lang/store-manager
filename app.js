const STORES=['上池台','用賀','マチノマ大森','碑文谷','自由が丘','グランデュオ蒲田'];
const STORAGE_KEY='jonan_ooda_v1';
const state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{"weeks":{},"months":{}}');

const $=id=>document.getElementById(id);
function isoWeekNow(){
  const d=new Date(); const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-day);
  const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));
  const w=Math.ceil((((t-y)/86400000)+1)/7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2,'0')}`;
}
function monthNow(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function ensureWeek(w){if(!state.weeks[w])state.weeks[w]={}; STORES.forEach(s=>{if(!state.weeks[w][s])state.weeks[w][s]=blankStore()})}
function blankStore(){return {virtualOrders:0,planRatio:100,prevRank:0,weeklyTheme:'',observeScore:0,orientScore:0,decideScore:0,actScore:0,trainingScore:0,ideaScore:0,commitScore:0,lastAct:'',resultText:'',goodText:'',issueText:'',trainingText:'',commitText:'',ideaText:'',actionTaken:'',ideaResult:'',amComment:''}}
function calc(r){
  const perf=Math.max(0,Math.min(50,(Number(r.planRatio)||0)/100*50));
  const ooda=Math.max(0,Math.min(20,(Number(r.observeScore)||0)+(Number(r.orientScore)||0)+(Number(r.decideScore)||0)+(Number(r.actScore)||0)));
  return {perf,ooda,total:perf+ooda+(Number(r.trainingScore)||0)+(Number(r.ideaScore)||0)+(Number(r.commitScore)||0)};
}
function yen(n){return new Intl.NumberFormat('ja-JP').format(Number(n)||0)+'円'}
function populateSelect(sel){sel.innerHTML=STORES.map(s=>`<option>${s}</option>`).join('')}

function seed(w){
  const sample=[
    ['上池台',12800000,106,3,'個人フォーカス強化',5,4,4,5,8,8,9],
    ['用賀',11300000,109,4,'情報×通信融合',5,5,4,5,9,10,9],
    ['マチノマ大森',15600000,102,1,'PC買替需要創出',4,4,4,4,8,7,8],
    ['碑文谷',9800000,97,6,'プロセス改善',3,3,3,4,6,6,6],
    ['自由が丘',12100000,104,5,'CS改善',4,4,5,4,8,8,8],
    ['グランデュオ蒲田',16800000,108,2,'通信人材育成',5,5,5,5,10,9,10]
  ];
  ensureWeek(w);
  sample.forEach(([s,v,p,pr,t,o,or,d,a,tr,i,c],idx)=>Object.assign(state.weeks[w][s],{
    virtualOrders:v,planRatio:p,prevRank:pr,weeklyTheme:t,observeScore:o,orientScore:or,decideScore:d,actScore:a,trainingScore:tr,ideaScore:i,commitScore:c,
    lastAct:['Aさんのアプローチ1日5件','PC担当2名の機種変更独立','スマホ商談時にPC利用年数確認','売場全体で声掛け強化','待ち時間の多い時間帯を確認','PC担当2名が機種変更を各1件'][idx],
    resultText:['25件→料金案内8件→契約2件','2名とも機種変更を単独完結','PC買替見込5件、成約2件','前年97%、個人別結果が曖昧','待ち時間指摘が前週比改善','MNP同席4件、1名が単独完結'][idx],
    goodText:['個人まで落とした行動ができた','料金ツール活用が定着','スマホからPC需要を発掘','アプローチ数は増加','配置変更をすぐ実行','育成対象を明確にできた'][idx],
    issueText:['クロージング精度','MNP経験不足','買替見込の追客','プロセス分析が浅い','ピーク前準備','もう1名の独り立ち'][idx],
    trainingText:['比較検討客への切り返し','MNP契約完結','見込客管理と再アプローチ','数字→個人→工程の深掘り','リーダーへの配置判断移譲','MNPを教えられる状態'][idx],
    commitText:['Aさん単独契約3件','MNP単独1件','PC買替見込8件','個人1名を特定し工程改善','待ち時間指摘さらに削減','2名をMNP単独対応へ'][idx],
    ideaText:['料金案内後に必ず次の一手を確認','料金ツールのロープレ10分','スマホ接客でPC年数を必ず質問','時間帯別に声掛け担当固定','13:45に配置リセット','PC担当を通信バディ制に'][idx],
    actionTaken:['店長同席3件＋ロープレ','開店前ロープレ実施','全対象者で質問実施','夕方に担当固定','配置変更を毎日実施','通信担当とペア接客'][idx],
    ideaResult:['契約率改善','料金説明時間短縮','PC見込5件創出','声掛け増も成約は横ばい','待ち時間改善','1名独り立ち'][idx],
    amComment:'次週も結果ではなく個人・プロセスまで掘り下げる。'
  }));
  save();
}

function renderRanking(){
  const w=$('weekInput').value; ensureWeek(w);
  const rows=STORES.map(s=>({store:s,r:state.weeks[w][s],...calc(state.weeks[w][s])})).sort((a,b)=>b.total-a.total);
  $('rankingBody').innerHTML=rows.map((x,i)=>{
    const cur=i+1, prev=Number(x.r.prevRank)||cur, diff=prev-cur; const trend=diff>0?`<span class="trend-up">↑${diff}</span>`:diff<0?`<span class="trend-down">↓${Math.abs(diff)}</span>`:`<span class="trend-flat">→</span>`;
    return `<tr><td class="rank">${cur}</td><td><button class="link-store" data-store="${x.store}">${x.store}</button></td><td>${prev}位 ${trend}</td><td>${yen(x.r.virtualOrders)}</td><td>${Number(x.r.planRatio||0).toFixed(1)}%</td><td>${x.ooda.toFixed(0)}/20</td><td>${x.r.trainingScore}/10</td><td>${x.r.ideaScore}/10</td><td>${x.r.commitScore}/10</td><td class="score">${x.total.toFixed(1)}</td></tr>`
  }).join('');
  const avg=rows.reduce((s,x)=>s+(Number(x.r.planRatio)||0),0)/rows.length;
  const totalV=rows.reduce((s,x)=>s+(Number(x.r.virtualOrders)||0),0);
  const top=rows[0];
  $('summaryCards').innerHTML=`<div class="metric"><div class="label">今週1位</div><div class="value">${top.store}</div><div class="sub">総合 ${top.total.toFixed(1)}pt</div></div><div class="metric"><div class="label">6店舗 仮想受注</div><div class="value">${(totalV/10000).toFixed(0)}万</div><div class="sub">週間合計</div></div><div class="metric"><div class="label">平均計画比</div><div class="value">${avg.toFixed(1)}%</div><div class="sub">6店舗平均</div></div><div class="metric"><div class="label">アイデア最高点</div><div class="value">${Math.max(...rows.map(x=>Number(x.r.ideaScore)||0))}/10</div><div class="sub">実行・検証を評価</div></div>`;
  const bestIdea=[...rows].sort((a,b)=>b.r.ideaScore-a.r.ideaScore)[0], bestOoda=[...rows].sort((a,b)=>b.ooda-a.ooda)[0], bestGrowth=[...rows].sort((a,b)=>(Number(b.r.prevRank)||7)-(rows.indexOf(b)+1)-((Number(a.r.prevRank)||7)-(rows.indexOf(a)+1)))[0];
  $('weeklyHighlights').innerHTML=`<div class="highlight"><div class="tag">💡 BEST IDEA</div><h3>${bestIdea.store}</h3><p>${bestIdea.r.ideaText||'未入力'}</p></div><div class="highlight"><div class="tag">🧭 BEST OODA</div><h3>${bestOoda.store}</h3><p>OODA ${bestOoda.ooda.toFixed(0)}/20｜${bestOoda.r.trainingText||'育成テーマ未入力'}</p></div><div class="highlight"><div class="tag">🔥 今週の行動</div><h3>${top.store}</h3><p>${top.r.actionTaken||top.r.commitText||'未入力'}</p></div>`;
  document.querySelectorAll('.link-store').forEach(b=>b.addEventListener('click',()=>{ $('storeSelect').value=b.dataset.store;$('storeWeekInput').value=w;loadStore();switchView('store')}));
}

const storeFields=['virtualOrders','planRatio','prevRank','weeklyTheme','observeScore','orientScore','decideScore','actScore','trainingScore','ideaScore','commitScore','lastAct','resultText','goodText','issueText','trainingText','commitText','ideaText','actionTaken','ideaResult','amComment'];
function loadStore(){const w=$('storeWeekInput').value,s=$('storeSelect').value;ensureWeek(w);const r=state.weeks[w][s];storeFields.forEach(f=>$(f).value=r[f]??'');$('saveMessage').textContent='';$('dailyOutput').value=''}
function saveStore(){const w=$('storeWeekInput').value,s=$('storeSelect').value;ensureWeek(w);const r=state.weeks[w][s];storeFields.forEach(f=>r[f]=$(f).type==='number'?Number($(f).value||0):$(f).value.trim());save();$('saveMessage').textContent='保存しました。';renderRanking();renderIdeas()}
function dailySummary(){const w=$('storeWeekInput').value,s=$('storeSelect').value;ensureWeek(w);const r=state.weeks[w][s];return `${s}｜${w}\n実績：仮想受注${yen(r.virtualOrders)}・計画比${r.planRatio}%\n良かった：${r.goodText}\n課題：${r.issueText}\n育成：${r.trainingText}\n先週ACT→結果：${r.lastAct} → ${r.resultText}\n今週コミット：${r.commitText}\nアイデア：${r.ideaText}\n取組：${r.actionTaken}\n結果：${r.ideaResult}\nAM：${r.amComment}`}
function renderIdeas(){const w=$('ideaWeekInput').value;ensureWeek(w);$('ideaList').innerHTML=STORES.map(s=>{const r=state.weeks[w][s];return `<article class="idea-card"><h3>${s}</h3><div class="idea-meta"><span class="pill">アイデア ${r.ideaScore}/10</span><span class="pill">${r.weeklyTheme||'テーマ未設定'}</span></div><dl><dt>アイデア</dt><dd>${r.ideaText||'未入力'}</dd><dt>実施</dt><dd>${r.actionTaken||'未入力'}</dd><dt>結果</dt><dd>${r.ideaResult||'未入力'}</dd><dt>次の育成</dt><dd>${r.trainingText||'未入力'}</dd></dl></article>`}).join('')}

function ensureMonth(m,s){if(!state.months[m])state.months[m]={};if(!state.months[m][s])state.months[m][s]={good:'',issue:'',training:'',result:'',commit:'',idea:'',checks:[false,false,false,false,false,false]}}
function loadMonth(){const m=$('monthInput').value,s=$('monthStoreSelect').value;ensureMonth(m,s);const r=state.months[m][s];$('monthGood').value=r.good;$('monthIssue').value=r.issue;$('monthTraining').value=r.training;$('monthResult').value=r.result;$('monthCommit').value=r.commit;$('monthIdea').value=r.idea;r.checks.forEach((v,i)=>$('m'+(i+1)).checked=v);
 const weeks=Object.keys(state.weeks).filter(w=>w.startsWith(m.slice(0,4)+'-W')).map(w=>state.weeks[w][s]).filter(Boolean); const ratios=weeks.map(x=>Number(x.planRatio)||0); const avg=ratios.length?ratios.reduce((a,b)=>a+b,0)/ratios.length:0; const total=weeks.reduce((a,b)=>a+(Number(b.virtualOrders)||0),0); const ooda=weeks.length?weeks.reduce((a,b)=>a+calc(b).ooda,0)/weeks.length:0; $('monthCards').innerHTML=`<div class="metric"><div class="label">月間仮想受注</div><div class="value">${(total/10000).toFixed(0)}万</div></div><div class="metric"><div class="label">平均計画比</div><div class="value">${avg.toFixed(1)}%</div></div><div class="metric"><div class="label">平均OODA</div><div class="value">${ooda.toFixed(1)}/20</div></div><div class="metric"><div class="label">記録週数</div><div class="value">${weeks.length}週</div></div>`}
function saveMonth(){const m=$('monthInput').value,s=$('monthStoreSelect').value;ensureMonth(m,s);state.months[m][s]={good:$('monthGood').value.trim(),issue:$('monthIssue').value.trim(),training:$('monthTraining').value.trim(),result:$('monthResult').value.trim(),commit:$('monthCommit').value.trim(),idea:$('monthIdea').value.trim(),checks:[1,2,3,4,5,6].map(i=>$('m'+i).checked)};save();$('monthMessage').textContent='月次振り返りを保存しました。'}

function exportCSV(){const out=[['週','店舗','仮想受注','計画比','O','O2','D','A','育成','アイデア','コミット','総合','良かった','課題','育成内容','アイデア内容','取組','結果']];Object.keys(state.weeks).sort().forEach(w=>STORES.forEach(s=>{const r=state.weeks[w][s];if(!r)return;out.push([w,s,r.virtualOrders,r.planRatio,r.observeScore,r.orientScore,r.decideScore,r.actScore,r.trainingScore,r.ideaScore,r.commitScore,calc(r).total.toFixed(1),r.goodText,r.issueText,r.trainingText,r.ideaText,r.actionTaken,r.ideaResult])}));const csv='\ufeff'+out.map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='城南OODA週間データ.csv';a.click();URL.revokeObjectURL(a.href)}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id)); if(id==='ideas')renderIdeas();if(id==='monthly')loadMonth()}

populateSelect($('storeSelect'));populateSelect($('monthStoreSelect'));
const week=isoWeekNow();$('weekInput').value=week;$('storeWeekInput').value=week;$('ideaWeekInput').value=week;$('monthInput').value=monthNow();ensureWeek(week);if(STORES.every(s=>state.weeks[week][s].virtualOrders===0))seed(week);
renderRanking();loadStore();renderIdeas();loadMonth();

document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>switchView(t.dataset.view)));
$('weekInput').addEventListener('change',()=>{ensureWeek($('weekInput').value);renderRanking()});
$('seedWeekBtn').addEventListener('click',()=>{seed($('weekInput').value);renderRanking();renderIdeas();if($('storeWeekInput').value===$('weekInput').value)loadStore()});
$('storeSelect').addEventListener('change',loadStore);$('storeWeekInput').addEventListener('change',loadStore);$('saveStoreBtn').addEventListener('click',saveStore);$('copyDailyBtn').addEventListener('click',()=>{$('dailyOutput').value=dailySummary()});$('ideaWeekInput').addEventListener('change',renderIdeas);$('monthInput').addEventListener('change',loadMonth);$('monthStoreSelect').addEventListener('change',loadMonth);$('saveMonthBtn').addEventListener('click',saveMonth);$('exportBtn').addEventListener('click',exportCSV);
