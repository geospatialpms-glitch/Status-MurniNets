/* SUO Selangor - MURNInets. Tiada backend diperlukan; sesuai untuk GitHub Pages. */
(() => {
  'use strict';
  const ds = window.MURNINETS_DATA;
  const $ = (id) => document.getElementById(id);
  if (!ds || !Array.isArray(ds.pbt)) { document.body.insertAdjacentHTML('afterbegin','<p>Ralat: data.js tidak dijumpai.</p>'); return; }
  const pbt = ds.pbt;
  const indicators = ds.indicators;
  const dimensions = [...new Set(indicators.map(x => x.dimension))];
  const byCode = Object.fromEntries(indicators.map(i => [i.code,i]));
  const avg = a => a.length ? a.reduce((s,n) => s+n,0)/a.length : 0;
  const pct = v => `${v.toFixed(1)}%`;
  const score = (ratings) => avg(ratings)/3*100;
  const keyScore = (p,code) => p.ratings[code] / 3 * 100;
  const status = v => v >= 80 ? 'Cemerlang' : v >= 60 ? 'Baik' : v >= 40 ? 'Sederhana' : 'Perlu Tindakan';
  const dimScore = (items,dim) => score(items.flatMap(p => indicators.filter(i => i.dimension === dim).map(i => p.ratings[i.code])));
  const color = v => v >= 96 ? '#00704d' : v >= 95 ? '#0b9c8b' : v >= 93 ? '#20a8cb' : '#438dea';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const state = {selected:null,term:'',rankingChart:null,dimensionChart:null,statusChart:null};
  const matching = () => pbt.filter(p => p.name.toLocaleLowerCase('ms').includes(state.term));
  const group = () => state.selected ? [state.selected] : matching().length ? matching() : pbt;
  const visibleName = () => state.selected ? state.selected.name : (state.term ? 'PBT hasil carian' : 'Semua PBT • Selangor');
  const shortLabels={
    'IT1-P1':'Penggunaan air domestik setahun', 'KT2-P5':'Nisbah rumah / penduduk',
    'KT2-P6':'Nisbah unit rumah di kawasan PBT', 'ET1-P1':'Tenaga buruh umur 15–64 tahun',
    'KT2-P2':'Bilangan katil hospital', 'KT2-P4':'Data penduduk',
    'KT3-P1':'Aduan kacau ganggu awam', 'ST1-P1':'Kualiti air sungai'
  };
  Chart.defaults.font.family='Inter,Arial,sans-serif';
  Chart.defaults.color='#607c98';
  Chart.defaults.plugins.legend.display=false;
  Chart.defaults.plugins.tooltip.backgroundColor='#102e50';

  function updateOverview(){
    const list=$('overviewList');
    const rows=matching();
    const overall=rows.length ? avg(rows.map(p=>p.score)) : 0;
    $('overviewAverage').textContent=rows.length ? pct(overall) : '—';
    $('overviewHighest').textContent=rows.length ? pct(Math.max(...rows.map(p=>p.score))) : '—';
    list.innerHTML=rows.map((p)=>{
      const rank=pbt.findIndex(x=>x.name===p.name)+1;
      const selected=state.selected?.name===p.name;
      const w=Math.max(0,Math.min(100,p.score));
      return `<button type="button" class="overview-item ${selected?'is-selected':''}" data-pbt="${escapeHtml(p.name)}" aria-pressed="${selected?'true':'false'}"><span class="overview-rank">${rank}</span><span class="overview-name">${escapeHtml(p.name)}</span><span class="overview-score">${pct(p.score)}</span><span class="overview-track"><span class="overview-fill" style="width:${w}%;background:${color(p.score)}"></span></span></button>`;
    }).join('')||'<p class="overview-empty">Tiada PBT sepadan dengan carian.</p>';
    list.querySelectorAll('[data-pbt]').forEach(btn=>btn.addEventListener('click',()=>selectPbt(btn.dataset.pbt)));
  }
  function initCharts(){
    const ranking=$('rankingChart').getContext('2d');
    state.rankingChart=new Chart(ranking,{
      type:'bar',data:{labels:[],datasets:[{label:'Indeks (%)',data:[],borderWidth:0,borderRadius:5,backgroundColor:[]}]},
      options:{responsive:true,maintainAspectRatio:false,onClick:(_,els)=>{if(els.length)selectPbt(matching()[els[0].index]?.name);},
        scales:{x:{ticks:{font:{size:9},maxRotation:50,minRotation:35},grid:{display:false}},y:{min:0,max:100,ticks:{callback:v=>v+'%',stepSize:20,font:{size:9}},grid:{color:'#eaf0f7'}}},
        plugins:{tooltip:{callbacks:{label:ctx=>`Indeks: ${pct(ctx.parsed.y)}`}}}
      }
    });
    state.statusChart=new Chart($('statusChart').getContext('2d'),{
      type:'doughnut',data:{labels:['Cemerlang','Baik','Sederhana','Perlu Tindakan'],datasets:[{data:[0,0,0,0],backgroundColor:['#12a774','#75b85b','#efb030','#e45149'],borderWidth:3,borderColor:'#fff',hoverOffset:5}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'73%'}
    });
    state.dimensionChart=new Chart($('dimensionChart').getContext('2d'),{
      type:'radar',data:{labels:['Ekonomi','Persekitaran','Komuniti','Guna Tanah','Infrastruktur','Tadbir Urus'],datasets:[{
        label:'Indeks (%)',data:[],backgroundColor:'rgba(39,119,220,.15)',borderColor:'#2677d4',pointBackgroundColor:'#2677d4',pointRadius:3,borderWidth:2
      }]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{min:0,max:100,ticks:{display:false,stepSize:25},pointLabels:{font:{size:9}},grid:{color:'#dfe9f4'},angleLines:{color:'#e3edf6'}}}}
    });
    $('chartMode').addEventListener('change',e=>{
      const mode=e.target.value;
      state.rankingChart.config.type='bar';
      state.rankingChart.options.indexAxis=mode==='horizontal'?'y':'x';
      state.rankingChart.options.scales.x=mode==='horizontal'?{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:'#eaf0f7'}}:{ticks:{font:{size:9},maxRotation:50,minRotation:35},grid:{display:false}};
      state.rankingChart.options.scales.y=mode==='horizontal'?{ticks:{font:{size:9}},grid:{display:false}}:{min:0,max:100,ticks:{callback:v=>v+'%',stepSize:20,font:{size:9}},grid:{color:'#eaf0f7'}};
      state.rankingChart.options.plugins.tooltip.callbacks.label=ctx=>`Indeks: ${pct(mode==='horizontal'?ctx.parsed.x:ctx.parsed.y)}`;
      updateRanking();
    });
  }
  function updateRanking(){
    const rows=matching();
    const chart=state.rankingChart;
    chart.data.labels=rows.map(p=>p.short);
    chart.data.datasets[0].data=rows.map(p=>p.score);
    chart.data.datasets[0].backgroundColor=rows.map(p=>state.selected&&state.selected.name!==p.name?'#c7d9e9':color(p.score));
    chart.options.onClick=(_,els)=>{if(els.length)selectPbt(rows[els[0].index]?.name);};
    chart.update();
  }
  function updateStatus(){
    const rows=group();
    const ct=[0,0,0,0];const labels=['Cemerlang','Baik','Sederhana','Perlu Tindakan'];
    rows.forEach(p=>ct[labels.indexOf(status(p.score))]++);
    state.statusChart.data.datasets[0].data=ct;
    state.statusChart.update();
    $('donutCount').textContent=rows.length;
    const colors=['#12a774','#75b85b','#efb030','#e45149'];
    $('statusLegend').innerHTML=labels.map((l,i)=>`<div><span class="dot" style="background:${colors[i]}"></span><span><b>${l}</b>${ct[i]} (${pct(ct[i]/rows.length*100)})</span></div>`).join('');
  }
  function updateDimensions(){
    const rows=group();
    const dimensionValues=dimensions.map(d=>dimScore(rows,d));
    state.dimensionChart.data.datasets[0].data=dimensionValues;
    state.dimensionChart.update();
    $('dimensionList').innerHTML=dimensions.map((d,i)=>`<div class="dim-entry"><span>${escapeHtml(d)}</span><b>${pct(dimensionValues[i])}</b></div>`).join('');
    $('selectedDimensions').innerHTML=dimensions.map((d,i)=>`<div><div class="progress-label"><span>${escapeHtml(d)}</span><b>${pct(dimensionValues[i])}</b></div><div class="progress-bg"><div class="progress-fill" style="width:${dimensionValues[i]}%"></div></div></div>`).join('');
  }
  function updateLowIndicators(){
    const rows=group();
    const low=indicators.map(i=>({code:i.code,label:shortLabels[i.code]||i.label,value:avg(rows.map(p=>keyScore(p,i.code)))})).sort((a,b)=>a.value-b.value||a.code.localeCompare(b.code)).slice(0,5);
    $('lowIndicators').innerHTML=low.map((x)=>`<tr title="${escapeHtml(byCode[x.code].label)}"><td><strong>${escapeHtml(x.code)}</strong></td><td>${escapeHtml(x.label)}</td><td class="right alert-value">${pct(x.value)}</td></tr>`).join('');
  }
  function updateTable(){
    const rows=matching().slice(0,5);
    $('pbtRows').innerHTML=rows.map(p=>{
      const ranking=pbt.findIndex(x=>x.name===p.name)+1;
      const selected=state.selected?.name===p.name;
      return `<tr data-pbt="${escapeHtml(p.name)}" class="${selected?'selected-row':''}"><td><span class="rank rank-${ranking}">${ranking}</span></td><td>${escapeHtml(p.name)}</td><td class="right"><strong>${pct(p.score)}</strong></td><td><span class="status-pill">${status(p.score)}</span></td><td>›</td></tr>`;
    }).join('')||'<tr><td colspan="5">Tiada PBT sepadan dengan carian.</td></tr>';
    $('pbtRows').querySelectorAll('tr[data-pbt]').forEach(tr=>tr.addEventListener('click',()=>selectPbt(tr.dataset.pbt)));
  }
  function updateSelection(){
    const rows=group();
    $('selectedTitle').textContent=visibleName();
    $('selectedScore').textContent=pct(avg(rows.map(p=>p.score)));
    $('selectedIndicators').textContent=indicators.length;
  }
  function refresh(){updateRanking();updateStatus();updateDimensions();updateLowIndicators();updateTable();updateSelection();updateOverview();}
  function selectPbt(name){
    const found=pbt.find(p=>p.name===name);
    if(!found)return;
    state.selected=state.selected?.name===name?null:found;
    refresh();
  }
  function downloadCSV(){
    const hdr=['Kedudukan','PBT','Indeks (%)','Status Paparan',...indicators.map(i=>i.code)];
    const rows=matching().map(p=>[pbt.indexOf(p)+1,p.name,p.score.toFixed(1),status(p.score),...indicators.map(i=>p.ratings[i.code])]);
    const csv=[hdr,...rows].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='SUO_MURNInets_Selangor_2026.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init(){
    if(typeof Chart==='undefined'){document.body.insertAdjacentHTML('afterbegin','<p style="padding:14px;background:#fdf2cf">Carta memerlukan sambungan Internet untuk memuat Chart.js.</p>');return;}
    $('kpiPbt').textContent=pbt.length;
    $('kpiIndicators').textContent=indicators.length;
    $('kpiAverage').textContent=pct(avg(pbt.map(p=>p.score)));
    $('kpiTop').textContent=pct(pbt[0].score);
    $('kpiTopName').textContent=pbt.filter(p=>p.score===pbt[0].score).map(p=>p.short).join(' & ');
    $('kpiStatus').textContent=status(avg(pbt.map(p=>p.score)));
    if ($('kpiExcellent')) $('kpiExcellent').textContent=`${pbt.filter(p=>status(p.score)==='Cemerlang').length}/${pbt.length}`;
    $('search').addEventListener('input',e=>{state.term=e.target.value.trim().toLocaleLowerCase('ms');state.selected=null;refresh();});
    $('reset').addEventListener('click',()=>{state.term='';state.selected=null;$('search').value='';refresh();});
    $('clearSelect').addEventListener('click',()=>{state.selected=null;refresh();});
    $('exportCsv').addEventListener('click',downloadCSV);
    document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));a.classList.add('active');}));
    initCharts();refresh();
  }
  init();
})();
