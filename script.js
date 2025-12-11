const slideshowImages = [
'Sunny cornfield.png',
'image1.jpg',
'image2.jpg',
'image3.jpg',
'image4.jpg'
];
const SLIDE_INTERVAL_MS = 5000; 
(function setupSlideshow(){
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');
let idx = 0;
let showingFirst = true;
function setBg(el, url){
el.style.backgroundImage = `url("${url}")`;
}
if(!bg1 || !bg2) return;
if(slideshowImages.length === 0){
setBg(bg1, 'Sunny cornfield.png');
bg1.classList.add('show');
return;
}
setBg(bg1, slideshowImages[0]);
bg1.classList.add('show');
setBg(bg2, slideshowImages.length > 1 ? slideshowImages[1] : slideshowImages[0]);
idx = 1;
setInterval(()=>{
const nextIndex = (idx + 1) % slideshowImages.length;
if(showingFirst){
setBg(bg2, slideshowImages[idx]);
bg2.classList.add('show');
bg1.classList.remove('show');
} else {
setBg(bg1, slideshowImages[idx]);
bg1.classList.add('show');
bg2.classList.remove('show');
}
showingFirst = !showingFirst;
idx = nextIndex;
}, SLIDE_INTERVAL_MS);
})();
//OOP Classes & Storage
// StorageManager: abstraction for localStorage
class StorageManager {
// ABSTRACTION PILLAR
static save(key, value){
localStorage.setItem(key, JSON.stringify(value));
}
static load(key){
const raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : null;
}
static delete(key){
localStorage.removeItem(key);
}
}
// User class (encapsulation)
class User {
// ENCAPSULATION PILLAR: 
#username;
#email;
#phone;
#password;
constructor(username, email, phone, password){
this.#username = username;
this.#email = email;
this.#phone = phone;
this.#password = password;
}
// Controlled access to private data (Encapsulation/Abstraction).
get username(){ return this.#username; }
get email(){ return this.#email; }
get phone(){ return this.#phone; }
validatePassword(pw){ return this.#password === pw; }
toJSON(){ return { username: this.#username, email: this.#email, phone: this.#phone, password: this.#password }; }
static fromJSON(obj){ return new User(obj.username, obj.email, obj.phone, obj.password); }
}
// Base Record class (encapsulation)
class Record {
// ENCAPSULATION PILLAR: Private fields protect the core record data.
#crop;
#qty;
#date;
#lat;
#lng;
constructor(crop, qty, date, lat, lng){
this.#crop = crop;
this.#qty = qty;
this.#date = date;
this.#lat = lat;
this.#lng = lng;
}
// Controlled access to private data.
get crop(){ return this.#crop; }
get qty(){ return this.#qty; }
get date(){ return this.#date; }
get lat(){ return this.#lat; }
get lng(){ return this.#lng; }
toJSON(){ return { crop: this.#crop, qty: this.#qty, date: this.#date, lat: this.#lat, lng: this.#lng }; }
static fromJSON(obj){ return new Record(obj.crop, obj.qty, obj.date, obj.lat, obj.lng); }
}
// INHERITANCE PILLAR
class MapRecordMarker extends Record {
constructor(crop, qty, date, lat, lng){
super(crop, qty, date, lat, lng); // Calls the parent (Record) constructor
this.marker = null;
}
// POLYMORPHISM PILLAR: 
popupHtml(){
const dateText = this.date ? (new Date(this.date)).toLocaleDateString() : 'N/A';
return `<div style="min-width:200px;font-size:14px">
<strong>${escapeHtml(this.crop)}</strong> &nbsp; (<em>${escapeHtml(String(this.qty))}</em>)<br/>
<small>Planted: ${escapeHtml(dateText)}</small><br/>
<small>Location: ${escapeHtml(String(this.lat))}, ${escapeHtml(String(this.lng))}</small>
</div>`;
}

addToMap(map){
if(!map) return;
const marker = L.marker([this.lat, this.lng]).addTo(map).bindPopup(this.popupHtml());
this.marker = marker;
return marker;
}

removeFromMap(map){
if(this.marker && map){
try{ map.removeLayer(this.marker); } catch(e){}
this.marker = null;
}
}
toJSON(){
// keep same shape as base but allow easy reconstruction
return { crop: this.crop, qty: this.qty, date: this.date, lat: this.lat, lng: this.lng };
}
static fromJSON(obj){
return new MapRecordMarker(obj.crop, obj.qty, obj.date, obj.lat, obj.lng);
}
}

const API_KEY="5071a911a3c45022cb808bac524236b1";
function $(id){ return document.getElementById(id); }
let records = []; 
let users = [];   
let signupMode = false;
let map = null, mainMarker = null, chart = null;
let smallMap = null, smallTempMarker = null;
let selectedLocation = null; 
let mainMapMarkers = [];
/* Load stored users & records on start (convert to class instances) */
(function bootstrapData(){
const rawUsers = StorageManager.load('farm_users') || [];
users = rawUsers.map(u => User.fromJSON(u));
const rawRecords = StorageManager.load('farm_records') || [];
records = rawRecords.map(r => MapRecordMarker.fromJSON(r));
})();
/* uses User class + StorageManager*/
function showError(msg){ const el=$('loginErr'); el.style.display='block'; el.textContent=msg; }
$('signupToggleBtn').addEventListener('click', ()=>{
signupMode = !signupMode;
if(signupMode){
$('loginModeText').textContent='Create a new account';
$('loginBtn').textContent='Sign Up';
$('email').style.display='block';
$('phone').style.display='block';
$('signupToggleBtn').textContent='Back to Login';
$('loginErr').style.display='none';
} else {
$('loginModeText').textContent='Please sign in to access the app';
$('loginBtn').textContent='Login';
$('email').style.display='none';
$('phone').style.display='none';
$('signupToggleBtn').textContent='Sign Up';
$('loginErr').style.display='none';
}
});
$('loginBtn').addEventListener('click', ()=>{
const u = $('user').value.trim();
const p = $('pass').value;
const e = $('email').value.trim();
const ph = $('phone').value.trim();
if(!u || !p){ showError('Fill username and password'); return; }
if(signupMode){
if(!e || !ph){ showError('Fill email & phone'); return; }
if(users.find(x => x.username === u)){ showError('Username exists'); return; }
const newUser = new User(u, e, ph, p);
users.push(newUser);
StorageManager.save('farm_users', users.map(x => x.toJSON()));
alert('Account created! Login now.');
signupMode = false;
$('signupToggleBtn').click();
} else {
const usr = users.find(x => x.username === u && x.validatePassword(p));
if(!usr){ showError('Invalid credentials'); return; }
// set session
StorageManager.save('sessionUser', usr.toJSON());
$('loginWrap').style.display='none';
$('appUI').style.display='block';
initApp(usr);
}
});
/* NAVIGATION */
document.querySelectorAll('nav button').forEach(btn=>{
btn.addEventListener('click', ()=>{
document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
$(btn.dataset.target).style.display='block';
if(btn.dataset.target==='map'){
initMap();
setTimeout(()=>{ if(map) map.invalidateSize(); }, 260);
}
if(btn.dataset.target==='records'){
initSmallMap();
setTimeout(()=>{ if(smallMap) smallMap.invalidateSize(); }, 260);
}
if(btn.dataset.target==='dashboard'){ updateChart(); }
if(btn.dataset.target==='profile'){ updateProfile(); }
});
});
/* LOGOUT  */
function doLogout(){
StorageManager.delete('sessionUser');
$('appUI').style.display='none'; $('loginWrap').style.display='flex';
}
/*Records rendering / CRUD*/
function saveRecords(){
StorageManager.save('farm_records', records.map(r => r.toJSON()));
}
function renderRecords(){
const list = $('list'); list.innerHTML = '';
records.forEach((r, i) => {
const dateText = r.date ? (new Date(r.date)).toLocaleDateString() : '';
const tr = document.createElement('tr');
tr.innerHTML = `<td>${escapeHtml(r.crop)}</td>
<td>${escapeHtml(String(r.qty))}</td>
<td>${escapeHtml(dateText)}</td>
<td>${escapeHtml('plants')}</td>
<td>${escapeHtml(String(r.lat || ''))}</td>
<td>${escapeHtml(String(r.lng || ''))}</td>
<td>
<button onclick="deleteRecord(${i})" style="padding:4px 6px; margin-right:6px;">Delete</button>
<button onclick="editRecord(${i})" style="padding:4px 6px;">Edit</button>
</td>`;
list.appendChild(tr);
});
$('totalRecords').textContent = records.length;
if(document.getElementById('profile').style.display !== 'none'){
updateProfile();
}
updateChart();
}
/* DELETE RECORD (Exposed to global scope for inline onclick="deleteRecord()") */
function deleteRecord(idx){
const rec = records[idx];
if(!rec) return;
// remove marker if exists
rec.removeFromMap(map);
// remove from array
records.splice(idx, 1);
saveRecords();
renderRecords();
// re-init map markers to keep consistent ids
if(map) initMap();
}
// Simple Edit (in-place) - opens fields to edit record (Exposed to global scope for inline onclick="editRecord()")
function editRecord(idx){
const rec = records[idx];
if(!rec) return;
const crop = prompt('Crop', rec.crop) || rec.crop;
const qty = parseFloat(prompt('Quantity', String(rec.qty)) || rec.qty);
const date = prompt('Date (YYYY-MM-DD)', rec.date || '') || rec.date;

// update record - because fields are private, recreate new instance
const newRec = new MapRecordMarker(crop, qty, date, rec.lat, rec.lng);
// replace
rec.removeFromMap(map);
records[idx] = newRec;
saveRecords();
renderRecords();
if(map) initMap();
}
/* Add record event */
$('addRec').addEventListener('click', ()=>{
const c = $('crop').value;
const q = parseFloat($('qty').value);
const u = $('unit').value;
const d = $('datePlanted').value;
if(!c || !q || !u){ alert('Fill all fields'); return; }
if(!selectedLocation){ alert('Please select a location on the small map first'); return; }
const rec = new MapRecordMarker(c, q, d || null, Number(selectedLocation.lat.toFixed(6)), Number(selectedLocation.lng.toFixed(6)));
records.push(rec);
saveRecords();
renderRecords();
if(map){
rec.addToMap(map);
try {
const latlngs = records.map(r=>[r.lat, r.lng]);
if(latlngs.length) { map.fitBounds(latlngs, { padding:[40,40], maxZoom:16 }); }
} catch(e){}
}
if(smallTempMarker){ smallMap.removeLayer(smallTempMarker); smallTempMarker = null; }
selectedLocation = null;
$('smallCoords').textContent = 'No location selected. Click on the map to choose where to plant.';
$('qty').value=''; $('crop').value=''; $('datePlanted').value='';
$('addRec').disabled = true;
});
/*Chart*/
function updateChart(){
const ctx = $('myChart').getContext('2d');
const data = {};
records.forEach(r => { data[r.crop] = (data[r.crop] || 0) + Number(r.qty); });
const labels = Object.keys(data);
const values = Object.values(data);
if(chart) chart.destroy();
chart = new Chart(ctx, {
type:'bar',
data:{ labels: labels, datasets: [{ label:'Quantity', data: values, backgroundColor:'#2e7d32' }] },
options:{ responsive:true, plugins:{ legend:{ display:false } } }
});
}
/*Map functions */
function initMap(){
if(map){
try{ map.remove(); } catch(e){}
map = null; mainMarker = null; mainMapMarkers = [];
}
map = L.map('map').setView([8.3540066, 124.8502529],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
mainMapMarkers = [];
const latlngs = [];
// add markers from records and set their marker property
records.forEach((r, idx) => {
if(r.lat != null && r.lng != null){
try {
const marker = r.addToMap(map); 
if(marker) mainMapMarkers.push(marker);
latlngs.push([r.lat, r.lng]);
} catch(e){}
}
});
mainMarker = L.marker([8.3540066,124.8502529],{draggable:true}).addTo(map);
mainMarker.on('dragend',()=>{ $('coords').textContent=`Lat: ${mainMarker.getLatLng().lat.toFixed(4)}, Lng: ${mainMarker.getLatLng().lng.toFixed(4)}`; });
$('coords').textContent=`Lat: ${mainMarker.getLatLng().lat.toFixed(4)}, Lng: ${mainMarker.getLatLng().lng.toFixed(4)}`;
try {
if(latlngs.length === 1){ map.setView(latlngs[0], 15); }
else if(latlngs.length > 1){ map.fitBounds(latlngs, { padding:[40,40] }); }
} catch(e){ }
setTimeout(()=>{ if(map) map.invalidateSize(); }, 260);
}
/* Small map for selecting record location */
function initSmallMap(){
if(smallMap){
try{ smallMap.remove(); } catch(e){}
smallMap = null; smallTempMarker = null;
}
smallMap = L.map('smallMap', { zoomControl: false }).setView([8.3540066,124.8502529],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(smallMap);
smallMap.on('click', function(e){
selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
if(smallTempMarker) smallMap.removeLayer(smallTempMarker);
smallTempMarker = L.marker(e.latlng).addTo(smallMap);
$('smallCoords').textContent = `Selected: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
$('addRec').disabled = false;
});
setTimeout(()=>{ if(smallMap) smallMap.invalidateSize(); }, 260);
}
document.querySelector('button[data-target="records"]').addEventListener('click', ()=>{ setTimeout(initSmallMap,200); });
if(document.getElementById('records').style.display !== 'none'){ setTimeout(initSmallMap,200); }
/*Init App */
function initApp(user){
renderRecords();
updateChart();
// initialize maps after a short timeout to make sure UI has been laid out
setTimeout(()=>{ initSmallMap(); initMap(); },200);
}
/*Weather (API) */
$('getWeatherBtn').addEventListener('click', ()=>{
const city = $('city').value.trim(); if(!city){ alert('Enter city'); return;}
fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
.then(res=>res.json()).then(data=>{
if(data.cod!='200'){ alert('City not found'); return;}
const list = data.list.filter((_,i)=>i%8===0);
const container = $('forecast'); container.innerHTML='';
list.forEach(d=>{
const div = document.createElement('div'); div.className='forecast-day';
div.innerHTML = `<strong>${new Date(d.dt*1000).toLocaleDateString('en-us',{weekday:'short'})}</strong>
<img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="">
<div>${d.main.temp.toFixed(1)}°C</div>
<div class="small">${d.weather[0].main}</div>`;
container.appendChild(div);
});
}).catch(()=>{ alert('Weather API error'); });
});
/*Profile*/
function updateProfile(){
const session = StorageManager.load('sessionUser');
if(!session) return;
const usr = User.fromJSON(session);
if(!usr) return;
$('profileUsername').value = usr.username;
$('profileEmail').value = usr.email;
$('profilePhone').value = usr.phone;
$('profileTotalRecords').textContent = records.length;
if(records.length > 0){
const cropCount = {};
records.forEach(r => { cropCount[r.crop] = (cropCount[r.crop]||0) + Number(r.qty); });
const maxCrop = Object.entries(cropCount).sort((a,b)=>b[1]-a[1])[0][0];
$('profileFavoriteCrop').textContent = `Most Sale Crop: ${maxCrop}`;
} else {
$('profileFavoriteCrop').textContent = 'Most Sale Crop: None';
}
}

function escapeHtml(s){
return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
/* On Load: check session */
(function boot(){
const session = StorageManager.load('sessionUser');
if(session){
// ensure user exists in memory
const u = User.fromJSON(session);
if(!users.find(x=>x.username===u.username)){
users.push(u);
StorageManager.save('farm_users', users.map(x=>x.toJSON()));
}
$('loginWrap').style.display='none';
$('appUI').style.display='block';
initApp(u);
} else {
$('loginWrap').style.display='flex';
$('appUI').style.display='none';
}
})();
/* default disable add button until location selected */
$('addRec').disabled = true;