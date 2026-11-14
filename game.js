(function initialize(){
"use strict";

const START = 100000;
const CASE_TOTAL = 200000;
const SHOCK = -40;
const ALT = 30;
const FINAL_SHOCK = -35;

const ASSETS = [
  { id:"AAPL", name:"Apple", symbol:"A", sub:"Знакомый бренд, но одна компания", color:"#b9ff64" },
  { id:"MSFT", name:"Microsoft", symbol:"M", sub:"Облачные сервисы и программное обеспечение", color:"#44f2b7" },
  { id:"NVDA", name:"NVIDIA", symbol:"N", sub:"Чипы, вычисления и ожидания рынка", color:"#ffe18b" },
  { id:"TSLA", name:"Tesla", symbol:"T", sub:"Технологии и автомобили", color:"#83baf8" }
];
const NAMES = ["Контракт", "Досье", "Распределение", "Шок", "Разбор", "Перемотка", "Два будущих", "Экзамен", "Итог"];
const $ = id => document.getElementById(id);
const format = value => "$" + Math.round(value).toLocaleString("en-US");
const percent = value => (Math.round(value * 10)/10).toLocaleString("ru-RU", {maximumFractionDigits:1}) + "%";
const sanitize = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const empty = () => ({AAPL:0,MSFT:0,NVDA:0,TSLA:0});
const sum = alloc => ASSETS.reduce((total, asset) => total + alloc[asset.id], 0);
const cash = alloc => START - sum(alloc);
const scenario = (alloc, change) => ({delta:alloc.AAPL*change/100, after:START+alloc.AAPL*change/100});
const clone = obj => JSON.parse(JSON.stringify(obj));
const newState = () => ({
  screen:0, startedAt:new Date().toISOString(), initial:empty(), rationale:"",
  first:null, reflection:"", reviewed:false, rewind:null,
  upsideReason:"", upsideExplained:false,
  mission:{portfolioOpened:false, change:null, explanation:"", confidence:50, committed:false},
  events:[]
});
let state = newState();

function track(event, payload={}){
  state.events.push({time:new Date().toISOString(), screen:state.screen, event, ...payload});
}
function button(text, id, variant=""){
  return `<button type="button" class="btn ${variant}" id="${id}">${text}</button>`;
}
function stats(label,value,detail="",cls=""){
  return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-val ${cls}">${value}</div>${detail ? `<div class="stat-detail">${detail}</div>` : ""}</div>`;
}
function dialogue(who, words, ominous=true){
  return `<div class="dialog ${ominous ? "" : "subdued"}">
    <div class="portrait ${ominous ? "silhouette" : ""}" aria-hidden="true"></div>
    <div class="dialog-body"><div class="dialog-who">${who}</div><p class="dialog-text">${words}</p></div>
  </div>`;
}
function panelHeader(name,meta=""){
  return `<div class="panel-head"><strong>${name}</strong><span>${meta}</span></div>`;
}
function stage(label,title,lead){
  return `<section class="panel padded screen">
    <div class="section-label">${label}</div><h1 class="title">${title}</h1><p class="copy">${lead}</p>`;
}
function renderAllocation(alloc, showVisual=true){
  const rest=cash(alloc);
  const positions=[...ASSETS.map(x=>({label:x.name,value:alloc[x.id],color:x.color})),{label:"Резерв",value:rest,color:"#789890"}];
  return `<div class="split-bar" role="img" aria-label="Распределение учебных денег: ${positions.map(x=>x.label+" "+percent(x.value/START*100)).join(", ")}">${positions.map(x=>`<i style="width:${x.value/START*100}%;background:${x.color}"></i>`).join("")}</div>
    <div class="legend">${positions.map(x=>`<span><b style="background:${x.color}"></b>${x.label} ${percent(x.value/START*100)}</span>`).join("")}</div>
    ${showVisual ? `<div class="fine" style="margin-top:13px">Свободный остаток: <strong class="mint">${format(rest)}</strong></div>` : ""}`;
}
function renderSliders(alloc){
 return `<div class="ledger">${ASSETS.map(asset=>`<div class="position">
  <div class="pos-head"><span class="pos-name">${asset.name} <span class="pos-ticker">${asset.id}</span></span><span class="pos-amount" id="amount-${asset.id}">${format(alloc[asset.id])}</span></div>
  <input type="range" class="alloc-range" min="0" max="100000" step="1000" data-asset="${asset.id}" value="${alloc[asset.id]}" aria-label="Сумма в ${asset.name}">
  </div>`).join("")}</div>
  <div class="message"><strong>Резерв: <span id="cash-value">${format(cash(alloc))}</span></strong><div class="fine">Перемещай ползунки. Общая сумма никогда не превышает ${format(START)}. Чтобы вложить больше в одну компанию, сначала уменьши другую.</div></div>
  <div class="keyboard"><button type="button" id="preset-apple">ВСЁ В APPLE</button><button type="button" id="preset-split">ПО 25K В КАЖДУЮ</button><button type="button" id="preset-reset">СБРОС</button></div>`;
}
function error(text){
  const el=$("error");
  if(el){el.textContent=text;el.scrollIntoView({block:"nearest",behavior:"smooth"});}
}
function screen0(){
  return `<section class="screen">
   <div class="retromain">
    <div class="retrogrid"></div>
    <div class="city">${Array.from({length:9},()=>'<div class="building"></div>').join("")}</div>
    <div class="hero-content">
      <div class="stamp">PRIVATE DESK // 23:47</div>
      <div class="section-label">FREEDOM GAME BANK // RETRO STORY MODE</div>
      <h1 class="title">ONE <em>BAD</em><br>BET<span class="aqua">.</span></h1>
      <p>Всю ночь на столе телефон. В телефоне — люди, которые ненавидят слово «убыток». Ты — брокер. И сейчас тебе доверят чужие деньги.</p>
      <div class="buttons">${button("ПРИНЯТЬ ЗВОНОК ↗","go-1")}</div>
    </div>
   </div>
   <div class="box-grid three" style="margin-top:18px">
    ${stats("Учебный счёт",format(START),"Только виртуальные деньги")}
    ${stats("Твой риск","РЕПУТАЦИЯ","Ты отвечаешь за решение")}
    ${stats("Продолжительность","≈ 6 MIN","9 сцен • 2 дела")}
   </div>
   <div class="message warn"><b>Сценарий вымышленный.</b> Названия Apple, Microsoft, NVIDIA и Tesla используются для узнаваемости. Все движения цен придуманы для игры и не относятся к настоящим событиям рынка.</div>
  </section>`;
}
function screen1(){
  return stage("01 / PRIVATE CLIENT","ЧУЖИЕ <em>ДЕНЬГИ</em>","Первая ночь в закрытом брокерском отделе. Ты ещё не успела снять пиджак, а красный телефон уже звонит.")
  + dialogue("МИСТЕР БЛЭК // ЗАКРЫТАЯ ЛИНИЯ","У тебя $100 000. Мне нужны хорошие новости. Мои партнёры — люди старой школы. Они не любят, когда их деньги исчезают.")
  + dialogue("АНАЛИТИК МАЙЯ // ВНУТРЕННЯЯ ЛИНИЯ","Клиент давит на тебя. Но решение всё равно за тобой. Известная компания — не страховка от плохой новости.",false)
  + `<div class="section-label" style="margin-top:25px">НА ТВОЁМ ЭКРАНЕ — ЗНАКОМЫЕ КОМПАНИИ</div>
     <div class="asset-list">${ASSETS.map(x=>`<div class="asset"><span class="asset-logo">${x.symbol}</span><h3>${x.name}</h3><div class="symbol">${x.id}</div><p>${x.sub}</p></div>`).join("")}</div>
     <div class="message warn">Тебе не показывают, что будет с ценами завтра. Это решение нужно принять <b>до</b> новости.</div>
     <div class="buttons">${button("ОТКРЫТЬ ТОРГОВЫЙ ТЕРМИНАЛ →","go-2")}</div></section>`;
}
function screen2(){
  return stage("02 / ORDER DESK","ПЕРВАЯ <em>СТАВКА</em>","Перед тобой $100 000 клиента. Выбери, сколько отправить в Apple, Microsoft, NVIDIA и Tesla. Остальное останется резервом.")
   + dialogue("МИСТЕР БЛЭК // СООБЩЕНИЕ","Все говорят об Apple. Может, не будем мелочиться? Мне платят не за осторожность.",true)
   + renderSliders(state.initial)
   + `<div id="allocation-view">${renderAllocation(state.initial)}</div>
      <div class="field"><label for="first-reason">ТВОЁ ОБОСНОВАНИЕ — ПОЧЕМУ ИМЕННО ТАК?</label><textarea id="first-reason" placeholder="Напиши свой план для клиента...">${sanitize(state.rationale)}</textarea><div class="field-help">Решение зафиксируется до раскрытия новости. Минимум 15 символов.</div></div>
      <div id="error" class="error" role="alert"></div>
      <div class="buttons">${button("ПОДПИСАТЬ ПОРУЧЕНИЕ →","commit-first")}</div></section>`;
}
function screen3(){
  const first=state.first.alloc, result=scenario(first,SHOCK), loss=-result.delta, exposure=first.AAPL/START*100;
  let client;
  if(loss>=30000){client="ЧТО ТЫ СДЕЛАЛ?! На одной бумаге держал почти всё? Я жду объяснений, пока мои партнёры ещё разговаривают по телефону.";}
  else if(loss>0){client="Я вижу минус на счёте. Объясни, почему новость одной компании затронула мои деньги.";}
  else{client="На этом событии ты не потерял деньги. Но я хочу знать, это было обдуманное решение или просто удачный поворот?";}
  return stage("03 / MARKET BREAKING","КРАСНЫЙ <em>ЭКРАН</em>","23:58. На терминале срабатывает тревожная лента. В комнате слышно только гудение мониторов.")
   + `<div class="news alert-pulse"><div class="news-title">⚠ BREAKING // FICTIONAL MARKET EVENT</div><h2>APPLE: ${SHOCK}% ЗА СЕССИЮ</h2><p>В игровом сюжете Apple теряет важный контракт, её цена падает. Цены других активов в этом изолированном опыте остаются прежними.</p></div>
      <div class="box-grid three">
      ${stats("До события",format(START),"Исходный капитал")}
      ${stats("После события",format(result.after),"Учебный счёт")}
      ${stats("Потеря",format(loss),percent(loss/START*100)+" от капитала","red")}
      </div>
      ${dialogue("МИСТЕР БЛЭК // ВХОДЯЩИЙ",client)}
      <div class="message alert">В Apple было вложено <b>${format(first.AAPL)}</b> — ${percent(exposure)} портфеля. Падение на 40% обошлось в <b>${format(loss)}</b>. <span class="fine">Если Apple было 0%, прямой ущерб от этой конкретной новости равен нулю.</span></div>
      <div class="buttons">${button("ОБЪЯСНИТЬ, ЧТО ПРОИЗОШЛО →","go-4")}</div>
  </section>`;
}
function screen4(){
 const first=state.first.alloc;
 const loss=-scenario(first,SHOCK).delta;
 if(state.reviewed){
  return stage("04 / POST MORTEM","НАЙДИ <em>ПРИЧИНУ</em>","Ты зафиксировала объяснение. Сверь его с механикой этого опыта.")
   + `<div class="case-file"><div class="section-label">ТВОЙ ОТВЕТ</div><p>${sanitize(state.reflection)}</p></div>
      <div class="box-grid">
      ${stats("Доля Apple до шока",percent(first.AAPL/START*100),"Часть всех доверенных денег")}
      ${stats("Потеря в портфеле",format(loss),"Apple × 40%","red")}
      </div>
      <div class="message good"><b>Главная причина:</b> чем больше доля одной компании, тем сильнее её собственная плохая новость влияет на весь капитал. В этом эксперименте остальные вложения не менялись — в реальном рынке они тоже могут падать.</div>
      ${dialogue("МАЙЯ // АНАЛИТИК","У тебя есть один шанс вернуться назад и изменить только распределение денег. Новость останется той же.",false)}
      <div class="buttons">${button("ПЕРЕМОТАТЬ ВРЕМЯ ↶","begin-rewind")}</div></section>`;
 }
 return stage("04 / POST MORTEM","ЧТО ПОШЛО <em>НЕ ТАК?</em>","На другом конце линии требуют объяснение. Попробуй сформулировать причину до подсказки аналитика.")
 + `<div class="panel-head"><strong>РАЗБОР ПРОТОКОЛА</strong><span>НАПИШИ СВОИМИ СЛОВАМИ</span></div>
  <div class="field"><label for="reflection">ПОЧЕМУ НОВОСТЬ ОБ APPLE ТАК ПОВЛИЯЛА НА ВСЕ ДЕНЬГИ КЛИЕНТА?</label><textarea id="reflection" placeholder="Что в твоём распределении усилило или уменьшило последствия?">${sanitize(state.reflection)}</textarea></div>
  <div id="error" class="error" role="alert"></div>
  <div class="buttons">${button("СВЕРИТЬ ОБЪЯСНЕНИЕ →","review-response")}</div></section>`;
}
function screen5(){
 const old=scenario(state.first.alloc,SHOCK);
 const revision=scenario(state.initial,SHOCK);
 const oldLoss=-old.delta, newLoss=-revision.delta;
 const difference=oldLoss-newLoss;
 return stage("05 / TIME MACHINE","ЕЩЁ ОДИН <em>ШАНС</em>","Секунды откатились назад. Новость снова обрушит Apple на 40%. Но ты можешь по-другому распределить $100 000.")
  + renderSliders(state.initial)
  + `<div id="allocation-view">${renderAllocation(state.initial)}</div>
    <div id="compare-view">${renderComparison(oldLoss,newLoss,difference)}</div>
    ${dialogue("МАЙЯ // АНАЛИТИК","Проверяй гипотезу: меняется твой выбор — меняется величина ущерба. Но никаких гарантированных результатов на реальном рынке нет.",false)}
    <div class="buttons">${button("ЗАФИКСИРОВАТЬ ВТОРОЙ ВАРИАНТ →","commit-rewind")}</div>
  </section>`;
}
function renderComparison(oldLoss,newLoss,difference){
 return `<div class="comparison" style="margin-top:18px">
 <div class="compare-card red-card"><div class="stat-label">РЕШЕНИЕ № 1</div><strong class="red">−${format(oldLoss)}</strong><small>Потеря после Apple −40%</small></div>
 <div class="compare-card green-card"><div class="stat-label">ПОВТОРНЫЙ ВЫБОР</div><strong class="mint">−${format(newLoss)}</strong><small>Потеря при той же новости</small></div>
 </div><div class="message ${difference>0?"good":difference<0?"alert":"warn"}">${difference>0?`В этой модели новый вариант снизил потерю на <b>${format(difference)}</b>.`:difference<0?`В этом варианте ущерб увеличился на <b>${format(-difference)}</b>.`:"Ущерб не изменился. Попробуй изменить долю Apple, если хочешь увидеть разницу."}</div>`;
}
function screen6(){
 const a=state.rewind.alloc;
 const downside=scenario(a,SHOCK), upside=scenario(a,ALT);
 const downLoss=-downside.delta;
 return stage("06 / THE OTHER TIMELINE","ДВА <em>БУДУЩИХ</em>","Что если бы твоя первая новость оказалась ошибочной, и Apple, наоборот, выросла? Всё то же распределение, но другой исход.")
 + `<div class="comparison">
    <div class="compare-card red-card"><div class="stat-label">ВЕРСИЯ А: APPLE ${SHOCK}%</div><strong class="red">−${format(downLoss)}</strong><small>Портфель: ${format(downside.after)}</small></div>
    <div class="compare-card green-card"><div class="stat-label">ВЕРСИЯ Б: APPLE +${ALT}%</div><strong class="mint">+${format(upside.delta)}</strong><small>Портфель: ${format(upside.after)}</small></div>
   </div>
   ${dialogue("МИСТЕР БЛЭК // ГОЛОСОВОЕ","В другой реальности мы заработали. Значит ли это, что ставить всё на знакомую компанию было безопасно?")}
   <div class="field"><label for="upside-reason">ОТВЕТЬ КЛИЕНТУ БЕЗ ВАРИАНТОВ ОТВЕТА</label><textarea id="upside-reason" placeholder="Объясни разницу между удачным исходом и риском решения...">${sanitize(state.upsideReason)}</textarea></div>
   ${state.upsideExplained?`<div class="message good"><b>Запомни:</b> положительный исход не доказывает безопасность стратегии. Риск зависимости от одной компании существует <em>до</em> того, как мы узнаем, выросла она или упала.</div>`:""}
   <div id="error" class="error" role="alert"></div>
   <div class="buttons">${state.upsideExplained?button("НОВОЕ ДЕЛО • БЕЗ ПОДСКАЗОК →","go-7"):button("ОТКРЫТЬ РАЗБОР →","explain-upside")}</div></section>`;
}
function screen7(){
 const m=state.mission;
 return stage("07 / NO HINTS","ПОСЛЕДНИЙ <em>ЗВОНОК</em>","02:11. Тот же кабинет. Новый клиент. Другие цифры. Теперь никто не будет говорить тебе, какую информацию проверить и как поступить.")
  + dialogue("НОВЫЙ КЛИЕНТ // НОМЕР СКРЫТ","NVIDIA только что представила новый продукт. Добавь к ней ещё денег — у нас есть свободные $30 000. Или объясни, почему ты решил иначе.")
  + `<div class="box-grid">
     ${stats("Суммарный капитал",format(CASE_TOTAL),"Включая свободные деньги")}
     ${stats("Доступный остаток",format(30000),"Не требуется использовать весь")}
     </div>
     <div class="case-file">
     <div class="section-label">ДОСЬЕ КЛИЕНТА // 02</div>
     <p class="copy">В досье указан текущий состав портфеля. Открывать его или действовать без просмотра — твой выбор.</p>
     ${m.portfolioOpened?`<div id="portfolio-details">
       <div class="case-row"><span>NVIDIA (NVDA)</span><strong>${format(120000)}</strong></div>
       <div class="case-row"><span>Microsoft (MSFT)</span><strong>${format(50000)}</strong></div>
       <div class="case-row"><span>Свободный остаток</span><strong>${format(30000)}</strong></div>
       <div class="fine" style="margin-top:10px">Это учебные данные, не реальные счета и не котировки.</div></div>`:
       button("ОТКРЫТЬ СОСТАВ ПОРТФЕЛЯ","open-dossier","alt")}
     </div>
     <div class="field">
       <label for="case-change">ЧТО СДЕЛАЕШЬ С ПОЗИЦИЕЙ NVIDIA? ($)</label>
       <input id="case-change" class="mission-input" type="number" min="-120000" max="30000" step="1000" placeholder="Введи сумму" value="${m.change===null?"":m.change}" style="width:100%;padding:14px;background:#081b13;border:1px solid #4a7562;color:var(--text)" />
       <div class="field-help">Положительное число — докупить; отрицательное — сократить позицию; ноль — оставить как есть. Шаг $1 000. Никаких реальных операций.</div>
     </div>
     <div class="field"><label for="case-explanation">ТВОЁ РЕШЕНИЕ ДЛЯ КЛИЕНТА. ОБОСНУЙ ЕГО.</label>
       <textarea id="case-explanation" placeholder="Напиши, какую информацию ты учла и почему выбрала именно такое действие...">${sanitize(m.explanation)}</textarea></div>
     <div class="field"><label for="case-confidence">Насколько ты уверена в своём решении? <strong class="gold" id="confidence-val">${m.confidence}%</strong></label>
       <input id="case-confidence" class="mission-slider" type="range" min="0" max="100" step="10" value="${m.confidence}" aria-label="Уверенность в решении"></div>
     <div id="error" class="error" role="alert"></div>
     <div class="buttons">${button("ОТПРАВИТЬ КЛИЕНТУ И ЗАКРЫТЬ ДЕЛО →","commit-mission")}</div>
     <div class="fine" style="margin-top:17px">Это первая попытка. После отправки изменить её нельзя. На этом экране нет подсказок, оценок риска или заранее выделенного правильного действия.</div>
   </section>`;
}
function screen8(){
 const m=state.mission, nvidiaBefore=120000, afterPosition=nvidiaBefore+m.change;
 const previousShare= nvidiaBefore/CASE_TOTAL*100, afterShare=afterPosition/CASE_TOTAL*100;
 const decline=-afterPosition*FINAL_SHOCK/100, afterPortfolio=CASE_TOTAL-decline;
 const checked=m.portfolioOpened;
 const overconfidence=m.confidence>=80 && !checked;
 let action=m.change>0?`докупила ${format(m.change)}`:m.change<0?`сократила позицию на ${format(-m.change)}`:"оставила позицию без изменения";
 return stage("08 / CASE CLOSED","КЕЙС <em>ЗАКРЫТ</em>","Клиент получил твой ответ. Теперь можно раскрыть последствия нового, заранее не показанного события.")
 + `<div class="badge-art" role="img" aria-label="Учебная награда: закрытое дело">★</div>
    <h2 class="h2 result-title">ACHIEVEMENT: CASE FILE 02</h2>
    <p class="copy" style="text-align:center;max-width:none">Награда за прохождение учебного расследования — не за доходность и не за реальную сделку.</p>
    <div class="case-file">
      ${panelHeader("ПРОТОКОЛ РЕШЕНИЯ","ВАЖНА ПЕРВАЯ ПОПЫТКА")}
      <div class="case-row"><span>Твой выбор</span><strong>${action}</strong></div>
      <div class="case-row"><span>Состав портфеля просмотрен до решения</span><strong>${checked?"ДА":"НЕТ"}</strong></div>
      <div class="case-row"><span>Доля NVIDIA до решения</span><strong>${percent(previousShare)}</strong></div>
      <div class="case-row"><span>Доля NVIDIA после решения</span><strong>${percent(afterShare)}</strong></div>
      <div class="case-row"><span>Уверенность</span><strong>${m.confidence}%</strong></div>
      <div class="case-row"><span>Твоё обоснование</span><strong style="max-width:60%;text-align:right;white-space:pre-wrap">${sanitize(m.explanation)}</strong></div>
    </div>
    <div class="news" style="animation:none">
      <div class="news-title" style="animation:none">РЕЗУЛЬТАТ ВТОРОГО ТЕСТА // ВЫМЫШЛЕННОЕ СОБЫТИЕ</div>
      <h2>NVIDIA: ${FINAL_SHOCK}%</h2>
      <p>В этом отдельном учебном опыте цена NVIDIA падает на 35%; стоимость Microsoft и свободного остатка условно не изменяется.</p>
    </div>
    <div class="box-grid three">
      ${stats("Капитал до события",format(CASE_TOTAL))}
      ${stats("Потери",format(decline),"Из-за позиции NVIDIA","red")}
      ${stats("Капитал после события",format(afterPortfolio))}
    </div>
    <div class="message good"><b>Перенос навыка:</b> важно было самостоятельно проверить состав уже существующего портфеля и объяснить, что произойдёт при проблеме одной компании. Правильное действие не определяется одним магическим процентом.</div>
    ${overconfidence?`<div class="message alert"><b>Сигнал заградительной метрики:</b> высокая уверенность (${m.confidence}%) при решении без просмотра состава портфеля. Это не доказывает ошибку, но требует отдельной проверки в эксперименте.</div>`:""}
    <div class="rubric">
       <div class="rubric-item"><b>✓ Факт действия:</b> ${checked?"состав портфеля был открыт":"состав портфеля не открывался"}</div>
       <div class="rubric-item"><b>✓ Факт решения:</b> учтено изменение доли NVIDIA с ${percent(previousShare)} до ${percent(afterShare)}</div>
       <div class="rubric-item"><b>→ Оценка объяснения:</b> требует проверки по рубрике человеком; игра не объявляет любой ответ автоматически верным.</div>
       <div class="rubric-item"><b>→ Через 7 дней:</b> полезно дать ещё одну новую задачу без подсказок, чтобы измерить сохранение навыка.</div>
    </div>
    <div class="buttons">${button("СКАЧАТЬ ПРОТОКОЛ JSON ↓","download-report")}${button("НОВАЯ ИГРА ↻","restart","alt")}</div>
  </section>`;
}
function sidebar(){
 let title = "КОНТРОЛЬНЫЙ ТЕРМИНАЛ",meta="",account=START;
 if(state.screen===0)title="ДОСЬЕ // АРКАДА";
 if(state.screen>=3&&state.screen<=6)title="СЧЁТ № 001 / APPLE";
 if(state.screen>=7){title="СЧЁТ № 002 / NVIDIA";account=CASE_TOTAL;}
 const known=(state.screen>=3&&state.screen<=6)?state.first.alloc:(state.screen===2||state.screen===5?state.initial:null);
 let content=`<div class="side-hero-num mint">${format(account)}</div><div class="side-hero-label">ВИРТУАЛЬНЫЙ КАПИТАЛ</div>`;
 if(state.screen>=7){
 content += `<div class="side-line"><span>ДОСЬЕ</span><b>02 / ACTIVE</b></div>
 <div class="side-line"><span>СВОБОДНО</span><b>${format(30000)}</b></div>
 <div class="side-line"><span>ЛИНИЯ КЛИЕНТА</span><b class="gold">WAITING</b></div>`;
 if(state.screen===8)content += `<div class="side-line"><span>ИТОГ</span><b class="mint">COMPLETE</b></div>`;
 } else {
 content += `<div class="side-line"><span>АКТИВНОЕ ДЕЛО</span><b>#01 / ${NAMES[state.screen]}</b></div>
 <div class="side-line"><span>РЕЖИМ</span><b class="gold">SIMULATION</b></div>
 <div class="side-line"><span>КЛИЕНТ</span><b>MR. BLACK</b></div>`;
 if(known){
 content += `<div style="margin-top:17px"><div class="side-title">ТЕКУЩЕЕ РАСПРЕДЕЛЕНИЕ</div>${renderAllocation(known,false)}</div>`;
 }
 }
 return `<section class="panel"><div class="side-title">${title}</div>${content}</section>
 <section class="panel"><div class="side-title">PRIVATE PHONE / SECURE</div><div class="story-note">${state.screen===7?"Последнее решение принимается без учебных подсказок.":"Телефон может молчать, но последствия решения не исчезают."}</div><div class="side-line"><span>УРОВЕНЬ</span><b>${state.screen+1} / 9</b></div><div class="side-line"><span>ТИП СДЕЛОК</span><b>DEMO ONLY</b></div></section>`;
}
function render(){
 const screens=[screen0,screen1,screen2,screen3,screen4,screen5,screen6,screen7,screen8];
 $("game").innerHTML=screens[state.screen]();
 $("sidebar").innerHTML=sidebar();
 $("step-count").textContent=String(state.screen+1).padStart(2,"0")+" / 09";
 $("step-title").textContent=NAMES[state.screen];
 $("steps").innerHTML=NAMES.map((_,i)=>`<i class="${i<=state.screen?"done":""}" aria-hidden="true"></i>`).join("");
 bind();
}
function move(to){
 if(to<0||to>8)return;
 state.screen=to;
 track("screen_view",{stage:NAMES[to]});
 render();
 window.scrollTo({top:0,behavior:"auto"});
}
function setAllocation(id,requested){
 const others=sum(state.initial)-state.initial[id];
 const permitted=START-others;
 const adjusted=Math.max(0,Math.min(permitted,Math.round(requested/1000)*1000));
 state.initial[id]=adjusted;
}
function refreshAllocation(){
 ASSETS.forEach(asset=>{
   const range=document.querySelector(`.alloc-range[data-asset="${asset.id}"]`);
   if(range)range.value=state.initial[asset.id];
   const value=$("amount-"+asset.id);
   if(value)value.textContent=format(state.initial[asset.id]);
 });
 if($("cash-value"))$("cash-value").textContent=format(cash(state.initial));
 if($("allocation-view"))$("allocation-view").innerHTML=renderAllocation(state.initial);
 if(state.screen===5){
   const old=-scenario(state.first.alloc,SHOCK).delta;
   const newer=-scenario(state.initial,SHOCK).delta;
   $("compare-view").innerHTML=renderComparison(old,newer,old-newer);
 }
 $("sidebar").innerHTML=sidebar();
}
function download(){
 const mission=state.mission;
 const protocol={
   title:"FREEDOM GAME BANK / ONE BAD BET",
   disclaimer:"Hypothetical events and virtual capital; not investment advice.",
   version:"2.0",
   startedAt:state.startedAt,
   finishedAt:new Date().toISOString(),
   initialDecision:state.first,
   firstShockPercent:SHOCK,
   firstShockImpact:state.first?scenario(state.first.alloc,SHOCK):null,
   reflection:state.reflection,
   revisedDecision:state.rewind,
   hypotheticalGrowthPercent:ALT,
   upsideReflection:state.upsideReason,
   finalMission:{
     startingPortfolio:{NVDA:120000,MSFT:50000,CASH:30000},
     total:CASE_TOTAL,changeToNVDA:mission.change,
     openedPortfolioBeforeDecision:mission.portfolioOpened,
     explanation:mission.explanation,confidence:mission.confidence,
     hypotheticalNVDAShockPercent:FINAL_SHOCK,
     nvidiaShareBefore:60,
     nvidiaShareAfter:(120000+mission.change)/CASE_TOTAL*100
   },
   eventLog:state.events
 };
 const blob=new Blob([JSON.stringify(protocol,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="freedom-game-case-report.json";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 track("report_download");
}
function bind(){
 document.querySelectorAll("[id^='go-']").forEach(el=>el.addEventListener("click",()=>move(Number(el.id.substring(3)))));
 if(state.screen===2||state.screen===5){
   document.querySelectorAll(".alloc-range").forEach(input=>input.addEventListener("input",()=>{
     setAllocation(input.dataset.asset,Number(input.value));refreshAllocation();
   }));
   const presets={
     "preset-apple":{AAPL:100000,MSFT:0,NVDA:0,TSLA:0},
     "preset-split":{AAPL:25000,MSFT:25000,NVDA:25000,TSLA:25000},
     "preset-reset":empty()
   };
   Object.entries(presets).forEach(([id,value])=>$(id).addEventListener("click",()=>{
     state.initial={...value};track("preset_chosen",{preset:id,stage:state.screen});
     refreshAllocation();
   }));
 }
 if(state.screen===2){
   $("first-reason").addEventListener("input",e=>state.rationale=e.target.value);
   $("commit-first").onclick=()=>{
     if(state.rationale.trim().length<15){error("Сначала объясни своё решение хотя бы в одном предложении (15 символов).");return;}
     state.first={alloc:clone(state.initial),rationale:state.rationale.trim(),time:new Date().toISOString()};
     track("initial_decision",{alloc:clone(state.initial),cash:cash(state.initial),reason:state.rationale.trim()});
     move(3);
   };
 }
 if(state.screen===4){
   if(!state.reviewed){
     $("reflection").addEventListener("input",e=>state.reflection=e.target.value);
     $("review-response").onclick=()=>{
       if(state.reflection.trim().length<20){error("Напиши подробнее, как связаны доля Apple и последствия новости (минимум 20 символов).");return;}
       state.reviewed=true;track("postmortem_response",{text:state.reflection.trim()});render();
     };
   } else {
     $("begin-rewind").onclick=()=>{state.initial=clone(state.first.alloc);move(5);};
   }
 }
 if(state.screen===5){
   $("commit-rewind").onclick=()=>{
     state.rewind={alloc:clone(state.initial),cash:cash(state.initial),time:new Date().toISOString()};
     track("revised_decision",clone(state.rewind));move(6);
   };
 }
 if(state.screen===6){
   $("upside-reason").addEventListener("input",e=>state.upsideReason=e.target.value);
   if(!state.upsideExplained){
     $("explain-upside").onclick=()=>{
       if(state.upsideReason.trim().length<20){error("Объясни, почему удачный исход может не означать безопасное решение (минимум 20 символов).");return;}
       state.upsideExplained=true;track("upside_explanation",{text:state.upsideReason.trim()});render();
     };
   }
 }
 if(state.screen===7){
   const m=state.mission;
   if(!m.portfolioOpened){
     $("open-dossier").onclick=()=>{
       m.portfolioOpened=true;track("portfolio_opened_before_decision");
       render();
     };
   }
   $("case-change").addEventListener("input",e=>{m.change=e.target.value===""?null:Number(e.target.value);});
   $("case-explanation").addEventListener("input",e=>m.explanation=e.target.value);
   $("case-confidence").addEventListener("input",e=>{m.confidence=Number(e.target.value);$("confidence-val").textContent=m.confidence+"%";});
   $("commit-mission").onclick=()=>{
     if(m.change===null||!Number.isInteger(m.change)||m.change<-120000||m.change>30000||m.change%1000!==0){
       error("Введи сумму от −120 000 до +30 000 с шагом $1 000 (можно 0).");return;
     }
     if(m.explanation.trim().length<30){error("Напиши своё обоснование подробнее — не менее 30 символов.");return;}
     m.committed=true;track("final_mission_first_attempt",{
       portfolioOpened:m.portfolioOpened,positionChange:m.change,
       explanation:m.explanation.trim(),confidence:m.confidence
     });
     move(8);
   };
 }
 if(state.screen===8){
   $("restart").onclick=()=>{state=newState();track("session_started");render();window.scrollTo(0,0);};
   $("download-report").onclick=download;
 }
}
track("session_started");
render();
})();