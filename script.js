const DEMO_EMAIL = "explorer@example.com";
const DEMO_PASSWORD = "Dora123!";
const STORE_KEY = "findingCommunityDemo_v1";
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const todayISO = () => new Date().toISOString().slice(0,10);
const escapeHtml = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initialItems = [
 {id:"sample-1",type:"Lost",title:"Blue water bottle",description:"Reusable bottle with a silver lid. Last seen after a study session.",category:"Personal items",date:todayISO(),location:"Main library",locationType:"Campus",emoji:"🧴",tone:"tone-sky",contact:""},
 {id:"sample-2",type:"Found",title:"Black wallet",description:"Slim black wallet found near the food court. Owner can verify a detail.",category:"Accessories",date:todayISO(),location:"Cafeteria / food court",locationType:"Mall",emoji:"👛",tone:"tone-lavender",contact:""},
 {id:"sample-3",type:"Lost",title:"College ID card",description:"Student ID card misplaced around a classroom building.",category:"Documents",date:todayISO(),location:"Classroom block B",locationType:"Campus",emoji:"🪪",tone:"tone-peach",contact:""},
 {id:"sample-4",type:"Found",title:"Pink notebook",description:"Pink spiral notebook left on a bench. Please describe the cover to claim it.",category:"Personal items",date:todayISO(),location:"Garden seating area",locationType:"Community",emoji:"📒",tone:"tone-rose",contact:""},
 {id:"sample-5",type:"Found",title:"Wireless earbuds case",description:"Small white earbuds case handed in to the reception desk.",category:"Electronics",date:todayISO(),location:"Main reception",locationType:"Hospital",emoji:"🎧",tone:"tone-mint",contact:""},
 {id:"sample-6",type:"Lost",title:"Silver key ring",description:"Two keys on a plain silver ring, possibly near the parking entrance.",category:"Accessories",date:todayISO(),location:"North parking entrance",locationType:"Mall",emoji:"🔑",tone:"tone-sky",contact:""}
];
const initialMessages = {
 support:[
  {from:"them",name:"Site coordinator",text:"Welcome to Finding! If you have a question about an item report, feel free to message here.",time:"9:40 AM"},
  {from:"me",name:"Jordan Davis",text:"Thanks. I’m checking how to report a found item.",time:"9:42 AM"},
  {from:"them",name:"Site coordinator",text:"Choose “Report an item”, select “I found an item”, and add the location and date. You’re all set.",time:"9:43 AM"}
 ],
 member:[
  {from:"them",name:"Alex Morgan",text:"Hi, I saw your report. Could you share a little more detail about where it was last seen?",time:"Yesterday"},
  {from:"me",name:"Jordan Davis",text:"It was near the main entrance, close to reception.",time:"Yesterday"},
  {from:"them",name:"Alex Morgan",text:"Thanks for the update.",time:"Yesterday"}
 ]
};
let state = loadState();
let activeConversation = "support";
let toastTimer;
function loadState(){
 try{
  const raw=localStorage.getItem(STORE_KEY);
  if(raw){const parsed=JSON.parse(raw);return {items:parsed.items||structuredClone(initialItems),saved:parsed.saved||[],messages:parsed.messages||structuredClone(initialMessages),dark:!!parsed.dark,showDate:parsed.showDate!==false};}
 }catch(e){}
 return {items:structuredClone(initialItems),saved:[],messages:structuredClone(initialMessages),dark:false,showDate:true};
}
function saveState(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){}}
function applyTheme(){
 document.body.classList.toggle("dark",state.dark);
 $("#settingsThemeToggle").checked=state.dark;
 $("#dateToggle").checked=state.showDate;
 $("#currentDate").parentElement.classList.toggle("hidden",!state.showDate);
}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
function showApp(){ $("#loginScreen").classList.add("hidden");$("#app").classList.remove("hidden");applyTheme();renderAll();setDate(); }
function showLogin(){ $("#app").classList.add("hidden");$("#loginScreen").classList.remove("hidden");$("#loginPassword").value=""; }
function setDate(){const d=new Date();$("#currentDate").textContent=d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});$("#itemDate").max=todayISO();if(!$("#itemDate").value)$("#itemDate").value=todayISO();}
function navigate(view){
 $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
 $$(".nav-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 const labels={home:"Overview",items:"Lost & found",post:"Report an item",saved:"Saved items",messages:"Messages",settings:"Preferences"};
 $("#breadcrumbCurrent").textContent=labels[view]||"Overview";
 $("#sidebar").classList.remove("open");
 if(view==="items")renderItems();
 if(view==="saved")renderSaved();
 if(view==="messages")renderMessages();
 window.scrollTo({top:0,behavior:"smooth"});
}
function itemEmoji(category,title){
 const t=(title+" "+category).toLowerCase();
 if(/bottle/.test(t))return "🧴";if(/wallet/.test(t))return "👛";if(/id card|card|document/.test(t))return "🪪";if(/notebook|book/.test(t))return "📒";if(/earbud|phone|laptop|electronic/.test(t))return "🎧";if(/key/.test(t))return "🔑";if(/bag|backpack/.test(t))return "🎒";if(/watch/.test(t))return "⌚";if(/umbrella/.test(t))return "☂️";if(/clothing|jacket|shirt/.test(t))return "🧥";return "📦";
}
function toneFor(id){return ["tone-sky","tone-lavender","tone-peach","tone-mint","tone-rose"][String(id).split("").reduce((a,c)=>a+c.charCodeAt(0),0)%5];}
function formatDate(date){if(!date)return "Date not set";const d=new Date(date+"T12:00:00");return Number.isNaN(d.getTime())?date:d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function itemCard(item){
 const saved=state.saved.includes(item.id);
 return `<article class="item-card"><div class="item-visual ${escapeHtml(item.tone||toneFor(item.id))}"><span class="type-badge ${item.type==="Lost"?"lost":""}">${item.type==="Lost"?"Lost item":"Found item"}</span><span class="item-emoji">${escapeHtml(item.emoji||itemEmoji(item.category,item.title))}</span><button class="bookmark-button ${saved?"saved":""}" data-save="${escapeHtml(item.id)}" aria-label="${saved?"Remove saved item":"Save item"}">${saved?"♥":"♡"}</button></div><div class="item-card-body"><div class="item-card-title"><div><h3>${escapeHtml(item.title)}</h3><span class="category-label">${escapeHtml(item.category)} · ${escapeHtml(item.locationType||"Community")}</span></div></div><p class="item-desc">${escapeHtml(item.description)}</p><div class="item-meta"><span class="item-location">⌖ ${escapeHtml(item.location)}</span><button class="item-open" data-detail="${escapeHtml(item.id)}">Details →</button></div></div></article>`;
}
function renderItems(){
 const q=$("#searchInput").value.trim().toLowerCase(),type=$("#typeFilter").value,cat=$("#categoryFilter").value,loc=$("#locationFilter").value,sort=$("#sortFilter").value;
 let items=state.items.filter(i=>(type==="all"||i.type===type)&&(cat==="all"||i.category===cat)&&(loc==="all"||i.locationType===loc)&&(!q||[i.title,i.description,i.location,i.category,i.locationType].join(" ").toLowerCase().includes(q)));
 items.sort((a,b)=>sort==="az"?a.title.localeCompare(b.title):sort==="oldest"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
 $("#allItems").innerHTML=items.map(itemCard).join("");$("#resultsCount").textContent=`Showing ${items.length} ${items.length===1?"report":"reports"}`;$("#emptyState").classList.toggle("hidden",items.length!==0);
}
function renderHome(){
 const recent=[...state.items].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
 $("#recentItems").innerHTML=recent.map(itemCard).join("");
 const lost=state.items.filter(i=>i.type==="Lost").length,found=state.items.filter(i=>i.type==="Found").length;
 $("#statLost").textContent=lost;$("#statFound").textContent=found;$("#statOpen").textContent=state.items.length;$("#savedCount").textContent=state.saved.length;
}
function renderSaved(){
 const items=state.items.filter(i=>state.saved.includes(i.id));
 $("#savedItems").innerHTML=items.map(itemCard).join("");$("#savedEmpty").classList.toggle("hidden",items.length>0);
}
function renderAll(){renderHome();renderItems();renderSaved();renderMessages();}
function openItem(id){
 const item=state.items.find(i=>i.id===id);if(!item)return;
 $("#modalContent").innerHTML=`<div class="modal-hero ${escapeHtml(item.tone||toneFor(item.id))}">${escapeHtml(item.emoji||itemEmoji(item.category,item.title))}</div><span class="type-badge ${item.type==="Lost"?"lost":""}">${item.type==="Lost"?"Lost item":"Found item"}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><div class="modal-meta"><div><small>Category</small><b>${escapeHtml(item.category)}</b></div><div><small>Reported date</small><b>${escapeHtml(formatDate(item.date))}</b></div><div><small>Location type</small><b>${escapeHtml(item.locationType||"Community")}</b></div><div><small>Last known location</small><b>${escapeHtml(item.location)}</b></div></div><p><b>Next step</b><br>${item.type==="Lost"?"If you recognize this item, use the messaging area to contact the reporter.":"If this may be yours, message the reporter and be ready to verify a private identifying detail."}</p><div class="form-actions"><button class="secondary-button" data-close-modal>Close</button><button class="primary-button" id="messageAboutItem">Open messages →</button></div>`;
 $("#itemModal").classList.remove("hidden");
 $("#messageAboutItem").addEventListener("click",()=>{$("#itemModal").classList.add("hidden");navigate("messages");toast("Open a demo conversation to continue.");});
}
function renderMessages(){
 const msgs=state.messages[activeConversation]||[];
 $("#messageHistory").innerHTML=`<div class="chat-day">Conversation history · Demo session</div>`+msgs.map(m=>`<div class="message-row ${m.from==="me"?"mine":""}"><div class="message-avatar">${m.from==="me"?"JD":activeConversation==="support"?"SC":"AM"}</div><div class="message-bubble">${escapeHtml(m.text)}<small>${escapeHtml(m.time||"Just now")}</small></div></div>`).join("");
 $("#messageHistory").scrollTop=$("#messageHistory").scrollHeight;
 $("#activeChatName").textContent=activeConversation==="support"?"Site coordinator":"Alex Morgan";
 $("#activeChatAvatar").textContent=activeConversation==="support"?"SC":"AM";
 $("#activeChatAvatar").className="avatar "+(activeConversation==="support"?"avatar-support":"avatar-member");
 const last=msgs[msgs.length-1];if(activeConversation==="support"&&last)$("#lastMessage").textContent=last.text;
}
function currentTime(){return new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});}
function addMessage(text,from="me"){
 const msg={from,name:from==="me"?"Jordan Davis":activeConversation==="support"?"Site coordinator":"Alex Morgan",text,time:currentTime()};
 state.messages[activeConversation].push(msg);saveState();renderMessages();
}
function assistantReply(question){
 const q=question.toLowerCase();
 if(/report|post|add|submit|found an item|lost an item/.test(q))return "To report an item, choose “Report an item” in the left menu. Select Lost or Found, add a title, category, date and location, then publish your report.";
 if(/search|find|look|filter|browse/.test(q))return "Open “Lost & found” to search by item name, location or keyword. You can narrow results with the Lost/Found, category and location filters.";
 if(/message|contact|chat|owner|person/.test(q))return "Open Messages from the left menu to view the demo conversations. For a real service, connect verified user accounts and a backend so messages can reach the right person.";
 if(/save|bookmark|favorite/.test(q))return "Select the heart icon on an item card to save it. Your saved reports appear under “Saved items” in the navigation.";
 if(/dark|light|theme|date/.test(q))return "Open Preferences to switch dark mode on or off and choose whether today's date appears in the top bar. You can also use the ◐ button in the header.";
 if(/login|password|account|demo/.test(q))return "Use the sample login shown on the sign-in screen: explorer@example.com and Dora123! These credentials are for this local demo only, not a real account.";
 if(/hospital|mall|campus|location|organization|multiple|site/.test(q))return "Finding is designed as a flexible community lost-and-found concept for campuses, hospitals, malls and shared spaces. To share reports across real users and locations, connect a backend and add organization-level permissions.";
 if(/hello|hi|hey/.test(q))return "Hello! I'm the Finding demo assistant. I can explain how to search reports, post an item, save a listing, or use messages. What would you like to do?";
 return "I can help with searching lost-and-found reports, creating a report, saving items, messaging, and preferences. This is a predefined-response demo, not a live AI service. What would you like to do?";
}
function appendAssistant(text,who="assistant"){
 const wrap=document.createElement("div");wrap.className="assistant-message";
 if(who==="assistant"){wrap.innerHTML=`<div class="assistant-avatar small">F<span>✦</span></div><div class="assistant-bubble"><small>Finding assistant</small><p>${escapeHtml(text)}</p></div>`;}
 else{wrap.innerHTML=`<div class="assistant-bubble" style="margin-left:auto;background:#e8f1fd"><small>You</small><p>${escapeHtml(text)}</p></div>`;}
 $("#assistantChat").appendChild(wrap);$("#assistantChat").scrollTop=$("#assistantChat").scrollHeight;
}
function sendAssistant(text){
 const q=text.trim();if(!q)return;appendAssistant(q,"user");$("#assistantInput").value="";
 setTimeout(()=>appendAssistant(assistantReply(q)),180);
}
function toggleAssistant(force){
 const open=typeof force==="boolean"?force:!$("#assistantPanel").classList.contains("open");
 $("#assistantPanel").classList.toggle("open",open);
 $("#assistantFab").classList.toggle("hidden",open);
}
function resetDemo(){
 state={items:structuredClone(initialItems),saved:[],messages:structuredClone(initialMessages),dark:false,showDate:true};saveState();applyTheme();renderAll();toast("Demo data restored.");
}
$("#loginForm").addEventListener("submit",e=>{
 e.preventDefault();const email=$("#loginEmail").value.trim().toLowerCase(),password=$("#loginPassword").value;
 if(email===DEMO_EMAIL&&password===DEMO_PASSWORD){$("#loginError").textContent="";showApp();}
 else{$("#loginError").textContent="Those details don't match the sample credentials. Please try again."; }
});
$("#togglePassword").addEventListener("click",()=>{const input=$("#loginPassword");input.type=input.type==="password"?"text":"password";$("#togglePassword").textContent=input.type==="password"?"Show":"Hide";});
$("#loginThemeToggle").addEventListener("click",()=>{state.dark=!state.dark;saveState();applyTheme();});
$("#demoInfoLink").addEventListener("click",e=>{e.preventDefault();$("#loginEmail").value=DEMO_EMAIL;$("#loginPassword").value=DEMO_PASSWORD;toast("Sample credentials filled in. Select Sign in to continue.");});
$("#logoutBtn").addEventListener("click",()=>{showLogin();toast("You have signed out of the demo.");});
$("#themeToggle").addEventListener("click",()=>{state.dark=!state.dark;saveState();applyTheme();});
$("#settingsThemeToggle").addEventListener("change",e=>{state.dark=e.target.checked;saveState();applyTheme();});
$("#dateToggle").addEventListener("change",e=>{state.showDate=e.target.checked;saveState();applyTheme();});
$("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$$(".nav-link[data-view]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.view)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.go)));
$("#helpChatBtn").addEventListener("click",()=>toggleAssistant(true));
$("#assistantFab").addEventListener("click",()=>toggleAssistant(true));
$("#assistantClose").addEventListener("click",()=>toggleAssistant(false));
$("#assistantForm").addEventListener("submit",e=>{e.preventDefault();sendAssistant($("#assistantInput").value);});
$$(".suggestion-chips button").forEach(btn=>btn.addEventListener("click",()=>sendAssistant(btn.textContent)));
$("#searchInput").addEventListener("input",renderItems);
["typeFilter","categoryFilter","locationFilter","sortFilter"].forEach(id=>$("#"+id).addEventListener("change",renderItems));
$("#clearFilters").addEventListener("click",()=>{$("#searchInput").value="";$("#typeFilter").value="all";$("#categoryFilter").value="all";$("#locationFilter").value="all";$("#sortFilter").value="newest";renderItems();});
document.addEventListener("click",e=>{
 const saveBtn=e.target.closest("[data-save]");if(saveBtn){const id=saveBtn.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];saveState();renderAll();toast(state.saved.includes(id)?"Item saved to your list.":"Item removed from saved items.");return;}
 const detailBtn=e.target.closest("[data-detail]");if(detailBtn){openItem(detailBtn.dataset.detail);return;}
 if(e.target.closest("[data-close-modal]"))$("#itemModal").classList.add("hidden");
});
$("#itemForm").addEventListener("submit",e=>{
 e.preventDefault();
 const item={id:"item-"+Date.now(),type:$("#itemType").value,category:$("#itemCategory").value,title:$("#itemTitle").value.trim(),description:$("#itemDescription").value.trim(),date:$("#itemDate").value,location:$("#itemLocation").value.trim(),locationType:$("#itemLocationType").value,contact:$("#itemContact").value.trim(),emoji:itemEmoji($("#itemCategory").value,$("#itemTitle").value),tone:toneFor(Date.now())};
 state.items.unshift(item);saveState();e.target.reset();$("#itemDate").value=todayISO();renderAll();navigate("items");toast("Your item report has been published in this browser.");
});
$$("[data-conversation]").forEach(btn=>btn.addEventListener("click",()=>{activeConversation=btn.dataset.conversation;$$("[data-conversation]").forEach(b=>b.classList.toggle("active",b===btn));renderMessages();}));
$("#messageForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#messageInput"),text=input.value.trim();if(!text)return;addMessage(text);input.value="";setTimeout(()=>{const reply=activeConversation==="support"?"Thanks for the message. This is a demo conversation, so no real person will receive it.":"Thanks for the details. This is a fictional demo profile.";state.messages[activeConversation].push({from:"them",name:activeConversation==="support"?"Site coordinator":"Alex Morgan",text:reply,time:currentTime()});saveState();renderMessages();},500);});
$("#resetDemoBtn").addEventListener("click",resetDemo);
$("#clearDataBtn").addEventListener("click",()=>{if(confirm("Clear local reports, saved items and messages? This cannot be undone.")){localStorage.removeItem(STORE_KEY);state={items:[],saved:[],messages:{support:[],member:[]},dark:false,showDate:true};saveState();applyTheme();renderAll();toast("Local demo data cleared.");}});
setDate();applyTheme();
