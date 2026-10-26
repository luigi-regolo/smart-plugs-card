/**
 * Smart Plugs Card — Home Assistant dashboard card.
 * Copyright (c) 2026 luigi-regolo. SPDX-License-Identifier: GPL-3.0-only.
 * No remote dependencies, telemetry, or background polling.
 */
const SP_TAG = 'smart-plugs-card';
const SP_EDITOR_TAG = 'smart-plugs-card-editor';
const SP_TYPE = 'custom:smart-plugs-card';
const SP_DEFAULTS = Object.freeze({
  title: 'Prese elettriche', eyebrow: 'SMART PLUGS CARD',
  show_title: true, show_eyebrow: true,
  theme_mode: 'auto', layout: 'grid',
  show_power: true, show_energy: false,
  active_sensor: '', controls_enabled: false, plugs: [],
});
const SP_DOMAINS = Object.freeze({entity: 'switch', power_entity: 'sensor', energy_entity: 'sensor'});
const SP_CLASSES = Object.freeze({power_entity: 'power', energy_entity: 'energy'});
const SP_ICONS = Object.freeze([
  ['mdi:power-socket-eu', 'Presa elettrica'],
  ['mdi:washing-machine', 'Lavatrice'],
  ['mdi:television', 'Televisore'],
  ['mdi:coffee-maker', 'Macchina del caffè'],
  ['mdi:desk-lamp', 'Lampada da tavolo'],
  ['mdi:lightbulb-outline', 'Lampadina'],
  ['mdi:power-plug', 'Spina elettrica'],
  ['mdi:fan', 'Ventilatore'],
  ['mdi:air-conditioner', 'Climatizzatore'],
  ['mdi:desktop-tower-monitor', 'Computer'],
]);
function spText(value, limit=100) { return String(value ?? '').trim().slice(0, limit); }
function spEsc(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function spEntity(value, domain) {
  const id=spText(value, 180);
  return id.startsWith(domain+'.') && /^[a-z0-9_]+\.[a-z0-9_]+$/.test(id) ? id : '';
}
function spIcon(value) { const icon=spText(value, 80); return /^mdi:[a-z0-9-]+$/.test(icon) ? icon : 'mdi:power-socket-eu'; }
function spPlug(raw={}) {
  const r=raw && typeof raw==='object' && !Array.isArray(raw) ? raw : {};
  return {
    name: spText(r.name,60), room: spText(r.room,60),
    icon: spIcon(r.icon),
    entity: spEntity(r.entity,'switch'),
    power_entity: spEntity(r.power_entity,'sensor'),
    energy_entity: spEntity(r.energy_entity,'sensor'),
  };
}
function spConfig(raw={}) {
  const r=raw && typeof raw==='object' && !Array.isArray(raw) ? raw : {};
  const unique=new Set(); const plugs=[];
  for(const value of Array.isArray(r.plugs)?r.plugs:[]) {
    const p=spPlug(value);
    if(p.entity && unique.has(p.entity)) continue;
    plugs.push(p); if(p.entity) unique.add(p.entity);
  }
  return {
    ...r, type: SP_TYPE,
    title:spText(r.title??SP_DEFAULTS.title,60),
    eyebrow:spText(r.eyebrow??SP_DEFAULTS.eyebrow,60),
    show_title:r.show_title!==false, show_eyebrow:r.show_eyebrow!==false,
    theme_mode:['auto','light','dark'].includes(r.theme_mode)?r.theme_mode:'auto',
    layout:['grid','list'].includes(r.layout)?r.layout:'grid',
    show_power:r.show_power!==false, show_energy:r.show_energy===true,
    active_sensor:spEntity(r.active_sensor,'sensor'),
    controls_enabled:r.controls_enabled===true,
    plugs,
  };
}
function spState(entity) {
  if(!entity || entity.state==='unknown' || entity.state==='unavailable' || entity.state==='') return null;
  return entity.state==='on'?true:entity.state==='off'?false:null;
}
function spReading(entity, kind) {
  if(!entity || ['unknown','unavailable',''].includes(entity.state)) return null;
  const attrs=entity.attributes||{};
  if(attrs.device_class && attrs.device_class !== kind) return null;
  const unit=spText(attrs.unit_of_measurement,15);
  const validUnits=kind==='power'?['W','kW']:['Wh','kWh','MWh'];
  if(!validUnits.includes(unit)) return null;
  const value=Number(entity.state);
  if(!Number.isFinite(value) || value<0) return null;
  const converted=kind==='power' ? value*(unit==='kW'?1000:1) : value*(unit==='Wh'?.001:unit==='MWh'?1000:1);
  if(!Number.isFinite(converted)) return null;
  return {value:converted,unit:kind==='power'?'W':'kWh'};
}
function spCount(plugs, states) {
  let on=0,off=0,other=0;
  for(const plug of plugs.filter(p=>p.entity)){const state=spState(states?.[plug.entity]); if(state===true)on++; else if(state===false)off++; else other++;}
  return {on,off,other,total:plugs.filter(p=>p.entity).length};
}
function spExternalCount(entity) {
  if(!entity || ['unknown','unavailable',''].includes(entity.state))return null;
  const n=Number(entity.state);
  return Number.isSafeInteger(n)&&n>=0?n:null;
}
function spMdi(name) {return `<ha-icon icon="${spEsc(name)}" aria-hidden="true"></ha-icon>`;}
const SP_CSS=`
:host{display:block;box-sizing:border-box;width:100%;max-width:100%;min-width:0;font-family:var(--ha-font-family-body,Roboto,Arial,sans-serif);font-size:var(--ha-font-size-m,14px)}
*,*:before,*:after{box-sizing:border-box}button{font:inherit;cursor:pointer}button:disabled{cursor:not-allowed}
ha-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;--mdc-icon-size:21px;width:21px;height:21px;flex:none}
.sp-root{--sp-bg:#fafbf9;--sp-tile:#f1f3ef;--sp-surface:#f0f2ef;--sp-line:#dfe5de;--sp-fg:#17261e;--sp-muted:#647569;--sp-accent:#096e53;--sp-on-bg:#edf7f0;--sp-on-line:#c8e5d3;--sp-on-soft:#dbf1e5;--sp-track:#d7e0d8;--sp-off:#e5e9e4;--sp-warn:#b67a2b;--sp-danger:#bc4444;background:var(--sp-bg);color:var(--sp-fg);border-radius:25px;border:1px solid var(--sp-line);padding:18px;min-width:0;container:sp-card/inline-size}
.sp-root.sp-dark{--sp-bg:#101311;--sp-tile:#1a201c;--sp-surface:#1b211d;--sp-line:#303c33;--sp-fg:#f1f7f3;--sp-muted:#afbfb3;--sp-accent:#26b98b;--sp-on-bg:#172a20;--sp-on-line:#285641;--sp-on-soft:#1d4a35;--sp-track:#434d45;--sp-off:#333d35;--sp-warn:#e6b66c;--sp-danger:#ff8888}
.sp-head{margin:2px 4px 17px}.sp-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:750;color:var(--sp-muted);margin-bottom:7px}.sp-title{font-size:25px;line-height:1.14;font-weight:780;letter-spacing:-.7px;overflow-wrap:anywhere}.sp-title span{color:var(--sp-accent);font-weight:800}
.sp-summary{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:8px;margin-bottom:11px}
.sp-summary-cell{min-width:0;background:var(--sp-surface);border:1px solid var(--sp-line);border-radius:15px;padding:13px 9px}
.sp-summary-cell.major{background:var(--sp-on-bg);border-color:var(--sp-on-line)}
.sp-summary-cell strong{display:block;font-size:29px;letter-spacing:-.7px;font-weight:650;line-height:1.15;font-variant-numeric:tabular-nums}.sp-summary-cell.major strong{color:var(--sp-accent)}
.sp-summary-cell span{display:block;font-size:11.5px;line-height:1.4;color:var(--sp-muted);font-weight:400;margin-top:5px;overflow-wrap:break-word}
.sp-sensorline{color:var(--sp-muted);margin:0 2px 14px;font-size:11.5px;line-height:1.4;display:flex;align-items:center;gap:5px;min-width:0}.sp-sensorline ha-icon{width:14px;height:14px;--mdc-icon-size:14px}.sp-sensorline span{min-width:0;overflow-wrap:anywhere}
.sp-grid-host{container:sp-grid/inline-size;min-width:0}
.sp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.sp-plug{min-width:0;border:1px solid var(--sp-line);background:var(--sp-tile);border-radius:17px;min-height:153px;padding:13px 12px;display:flex;flex-direction:column}
.sp-plug.on{background:var(--sp-on-bg);border-color:var(--sp-on-line)}.sp-plug.unknown{border-style:dashed}
.sp-plug-head{display:flex;align-items:center;gap:9px;min-width:0}.sp-orb{width:39px;height:39px;flex:none;display:grid;place-items:center;background:var(--sp-bg);color:var(--sp-fg);border-radius:50%}.sp-plug.on .sp-orb{background:var(--sp-on-soft);color:var(--sp-accent)}
.sp-names{min-width:0;flex:1}.sp-names strong{display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sp-names small{display:block;color:var(--sp-muted);font-size:11.5px;line-height:1.4;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-plug-bottom{display:flex;align-items:end;justify-content:space-between;gap:8px;margin-top:auto;padding-top:14px}.sp-data{min-width:0}.sp-state{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:5px 8px;background:var(--sp-off);color:var(--sp-muted);font-size:11px;font-weight:600;line-height:1.2}
.sp-dot{width:6px;height:6px;border-radius:50%;background:#88998c}.sp-plug.on .sp-state{background:var(--sp-on-soft);color:var(--sp-accent)}.sp-plug.on .sp-dot{background:var(--sp-accent)}.sp-plug.unknown .sp-state{color:var(--sp-warn)}.sp-plug.unknown .sp-dot{background:var(--sp-warn)}
.sp-reading{display:flex;align-items:baseline;gap:4px;margin-top:9px;min-height:23px}.sp-reading strong{font-weight:600;font-size:21px;letter-spacing:0;line-height:1.15;font-variant-numeric:tabular-nums}.sp-reading span{font-size:11.5px;color:var(--sp-muted);font-weight:400}.sp-energy{font-size:11.5px;color:var(--sp-muted);margin-top:4px;line-height:1.4}
.sp-toggle{background:var(--sp-track);height:40px;width:60px;flex:none;border-radius:100px;border:1px solid var(--sp-line);padding:3px;display:flex;align-items:center;justify-content:flex-start}.sp-toggle[aria-checked=true]{background:var(--sp-accent);border-color:var(--sp-accent);justify-content:flex-end}.sp-toggle:disabled{opacity:.40}
.sp-thumb{width:32px;height:32px;display:grid;place-items:center;background:#fff;color:#657b68;border-radius:50%;box-shadow:0 1px 4px #0002}.sp-thumb ha-icon{width:15px;height:15px;--mdc-icon-size:15px}
.sp-list{grid-template-columns:1fr;gap:8px}.sp-list .sp-plug{min-height:85px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 12px;align-items:center}.sp-list .sp-plug-head{grid-column:1;grid-row:1}.sp-list .sp-plug-bottom{grid-column:2;grid-row:1;margin:0;padding:0;gap:10px;align-items:center}.sp-list .sp-data{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.sp-list .sp-reading{margin:0;min-height:0}.sp-list .sp-reading strong{font-size:17px}.sp-list .sp-energy{display:none}
.sp-empty{padding:22px 12px;border:1px dashed var(--sp-line);border-radius:14px;font-size:12px;color:var(--sp-muted);text-align:center}.sp-warning{font-size:11px;color:var(--sp-danger);margin:10px 3px 0;line-height:1.45;overflow-wrap:anywhere}.sp-note{font-size:10px;color:var(--sp-muted);margin:9px 3px 0}
.sp-toggle:focus-visible{outline:2px solid var(--sp-accent);outline-offset:3px}
@container sp-grid (max-width:340px){.sp-grid:not(.sp-list){grid-template-columns:1fr}.sp-grid:not(.sp-list) .sp-plug{min-height:126px}.sp-list .sp-plug{grid-template-columns:1fr}.sp-list .sp-plug-head{grid-column:1;grid-row:1}.sp-list .sp-plug-bottom{grid-column:1;grid-row:2;width:100%;justify-content:space-between}.sp-list .sp-data{justify-content:flex-start}}
@container sp-card (max-width:300px){.sp-root{padding:12px}.sp-summary-cell{padding:10px 7px}.sp-summary-cell strong{font-size:25px}.sp-summary-cell span{font-size:10.5px}}
@media(max-width:420px){.sp-title{font-size:23px}.sp-summary-cell strong{font-size:25px}}
@container sp-card (max-width:380px){.sp-title{font-size:23px}.sp-summary-cell strong{font-size:25px}}
@container sp-card (max-width:310px){.sp-title{font-size:21px}.sp-eyebrow{font-size:9px}}
@media(prefers-reduced-motion:reduce){.sp-toggle,.sp-thumb{transition:none!important}}
`;
class SmartPlugsCard extends HTMLElement {
  static getStubConfig() {const {type,...config}=spConfig({});return config;}
  static getConfigElement() {return document.createElement(SP_EDITOR_TAG);}
  constructor() {
    super();this.attachShadow({mode:'open'});this._config=spConfig();this._hass=null;
    this._busy=new Set();this._error='';this._signature='';
    this.shadowRoot.addEventListener('click', e=>this._onClick(e));
    this._onTheme=()=>this._render(true);
    this._media=typeof window!=='undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  }
  connectedCallback(){this._media?.addEventListener?.('change',this._onTheme);this._render(true);}
  disconnectedCallback(){this._media?.removeEventListener?.('change',this._onTheme);}
  setConfig(raw){this._config=spConfig(raw);this._error='';this._render(true);}
  set hass(hass){this._hass=hass;this._render();}
  getCardSize(){return Math.max(2,Math.ceil(this._config.plugs.filter(p=>p.entity).length/(this._config.layout==='list'?1:2))*2+2);}
  _entity(id){return id?this._hass?.states?.[id]:null;}
  _dark(){return this._config.theme_mode==='dark'||(this._config.theme_mode==='auto'&&(this._hass?.themes?.darkMode===true ||(!this._hass?.themes&&this._media?.matches)));}
  _row(p,index){
    const state=spState(this._entity(p.entity)),on=state===true;
    const entity=this._entity(p.entity);
    const name=p.name||spText(entity?.attributes?.friendly_name,60)||`Presa ${index+1}`;
    const icon=p.icon || spIcon(entity?.attributes?.icon);
    const watt=spReading(this._entity(p.power_entity),'power');
    const energy=spReading(this._entity(p.energy_entity),'energy');
    const watts=this._config.show_power ? `<div class="sp-reading"><strong>${watt===null?'—':spEsc(new Intl.NumberFormat('it-IT',{maximumFractionDigits:1}).format(watt.value))}</strong><span>W</span></div>` : '';
    const kwh=this._config.show_energy && p.energy_entity ? `<div class="sp-energy">Energia · ${energy===null?'Non disponibile':spEsc(new Intl.NumberFormat('it-IT',{maximumFractionDigits:2}).format(energy.value))+' kWh'}</div>` : '';
    const label=state===null?'Non disponibile':on?'Accesa':'Spenta';
    const disabled=!this._config.controls_enabled || state===null || this._busy.has(p.entity) || typeof this._hass?.callService!=='function';
    return `<article class="sp-plug ${state===null?'unknown':on?'on':'off'}"><div class="sp-plug-head"><span class="sp-orb">${spMdi(icon)}</span><span class="sp-names"><strong title="${spEsc(name)}">${spEsc(name)}</strong><small title="${spEsc(p.room)}">${spEsc(p.room||'Presa elettrica')}</small></span></div><div class="sp-plug-bottom"><div class="sp-data"><span class="sp-state"><span class="sp-dot"></span>${label}</span>${watts}${kwh}</div><button type="button" class="sp-toggle" role="switch" aria-checked="${on}" data-switch="${spEsc(p.entity)}" aria-label="${spEsc(on?'Spegni':'Accendi')} ${spEsc(name)}" ${disabled?'disabled':''} title="${this._config.controls_enabled?'Comando presa':'Abilita i comandi nella configurazione'}"><span class="sp-thumb">${spMdi('mdi:power')}</span></button></div></article>`;
  }
  _makeSignature(){
    const c=this._config, ids=new Set([c.active_sensor]);
    c.plugs.forEach(p=>{ids.add(p.entity);ids.add(p.power_entity);ids.add(p.energy_entity);});
    const relevant=[...ids].filter(Boolean).map(id=>{const obj=this._entity(id);return [id,obj?.state,obj?.attributes?.unit_of_measurement,obj?.attributes?.device_class,obj?.attributes?.friendly_name,obj?.attributes?.icon];});
    return JSON.stringify([c,relevant,this._dark(),[...this._busy],this._error]);
  }
  _render(force=false){
    if(!this.isConnected) return;
    const signature=this._makeSignature();if(!force&&signature===this._signature)return;this._signature=signature;
    const c=this._config, availablePlugs=c.plugs.filter(p=>p.entity), count=spCount(availablePlugs,this._hass?.states),external=c.active_sensor?spExternalCount(this._entity(c.active_sensor)):null;
    const heading=c.show_eyebrow&&c.eyebrow?`<div class="sp-eyebrow">${spEsc(c.eyebrow)}</div>`:'';
    const title=c.show_title&&c.title?`<div class="sp-title">${spEsc(c.title)}<span>.</span></div>`:'';
    const lastFocus=this.shadowRoot.activeElement?.getAttribute?.('data-switch');
    this.shadowRoot.innerHTML=`<style>${SP_CSS}</style><div class="sp-root ${this._dark()?'sp-dark':''}">${heading||title?`<header class="sp-head">${heading}${title}</header>`:''}<div class="sp-summary"><div class="sp-summary-cell major"><strong>${count.on}</strong><span>Prese attive</span></div><div class="sp-summary-cell"><strong>${count.off}</strong><span>Spente</span></div><div class="sp-summary-cell"><strong>${count.total}</strong><span>Configurate</span></div></div>${c.active_sensor?`<div class="sp-sensorline">${spMdi('mdi:counter')}<span>Riepilogo sensore ${spEsc(c.active_sensor)}: ${external===null?'Non disponibile':spEsc(external)}</span></div>`:''}<div class="sp-grid-host">${availablePlugs.length?`<div class="sp-grid ${c.layout==='list'?'sp-list':''}">${availablePlugs.map((p,i)=>this._row(p,i)).join('')}</div>`:'<div class="sp-empty">Aggiungi una presa dall’editor visuale della card.</div>'}</div>${count.other?`<div class="sp-note">${count.other} ${count.other===1?'presa senza stato attendibile':'prese senza stato attendibile'}.</div>`:''}${this._error?`<div class="sp-warning" role="alert">${spEsc(this._error)}</div>`:''}</div>`;
    if(lastFocus){const btn=[...this.shadowRoot.querySelectorAll('[data-switch]')].find(x=>x.dataset.switch===lastFocus);btn?.focus({preventScroll:true});}
  }
  async _onClick(event){
    const button=event.target.closest('button[data-switch]');if(!button || button.disabled)return;
    const id=button.dataset.switch;if(!this._config.controls_enabled || this._busy.has(id))return;
    if(!this._config.plugs.some(p=>p.entity===id))return;
    const state=spState(this._entity(id));if(state===null)return;
    const action=state?'turn_off':'turn_on';this._busy.add(id);this._error='';this._render(true);
    try{await this._hass.callService('switch',action,{entity_id:id});}
    catch(err){this._error=`Comando non riuscito per ${id}: ${err?.message||'errore di Home Assistant'}`;}
    finally{this._busy.delete(id);this._render(true);}
  }
}
const SP_EDITOR_CSS=`
:host{display:block;font-family:var(--ha-font-family-body,Roboto,Arial,sans-serif);font-size:var(--ha-font-size-m,14px);color:var(--primary-text-color,#19231c)}*{box-sizing:border-box}button,input,select{font:inherit}
.sp-editor{min-width:0}.sp-tabs{display:flex;gap:3px;overflow:auto;border-bottom:1px solid var(--divider-color,#dfe5df);margin:0 0 17px}.sp-tab{border:0;background:none;padding:12px 9px;color:var(--secondary-text-color,#657466);font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap}.sp-tab.active{color:var(--primary-color,#096e53);border-bottom:2px solid var(--primary-color,#096e53)}
.sp-heading{font-size:15px;font-weight:750;margin:0 0 8px}.sp-desc,.sp-help{font-size:12px;color:var(--secondary-text-color,#68776d);line-height:1.5}.sp-field{margin:13px 0;min-width:0}.sp-label{font-size:12px;font-weight:690;margin:0 0 7px;display:block}.sp-input{display:block;min-height:42px;width:100%;border:1px solid var(--divider-color,#cad6ca);background:var(--card-background-color,var(--secondary-background-color,#f7faf7));color:var(--primary-text-color,#19231c);border-radius:11px;padding:10px 12px}
.sp-controlrow{display:flex;align-items:center;gap:8px;min-width:0}.sp-grow{flex:1;min-width:0}.sp-controls{display:flex;gap:5px;flex:none}.sp-btn{border:1px solid var(--divider-color,#cad6ca);background:var(--secondary-background-color,#eff3ef);color:var(--primary-text-color,#1a231d);padding:9px 12px;border-radius:12px;cursor:pointer}.sp-btn:disabled{opacity:.4}.sp-btn.primary{background:var(--primary-color,#0b7659);color:#fff;border-color:transparent}.sp-btn.iconbtn{padding:8px;display:grid;place-items:center;min-width:37px;height:37px}.sp-btn ha-icon{--mdc-icon-size:17px;width:17px;height:17px}
.sp-entry{border:1px solid var(--divider-color,#dee6de);padding:11px 10px;border-radius:14px;margin:9px 0}.sp-entry-head{display:flex;align-items:center;gap:10px}.sp-entry-head span{flex:1;min-width:0;font-weight:680;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:12px}.sp-entry-head small{color:var(--secondary-text-color,#697b70);font-weight:400;font-size:10px;display:block;margin-top:3px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.sp-selectors{padding:9px 3px 0}.sp-selectors ha-selector{display:block;width:100%;--mdc-theme-primary:var(--primary-color,#0b7355)}.sp-tip{padding:11px;border-radius:13px;background:var(--secondary-background-color,#edf2ed);font-size:12px;line-height:1.45;color:var(--secondary-text-color,#667469);margin:14px 0}.sp-cbrow{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--divider-color,#e0e8df);padding:12px 2px}.sp-cbrow strong{display:block;font-size:13px;font-weight:670}.sp-cbrow small{display:block;font-size:11px;color:var(--secondary-text-color,#647265);margin-top:4px}.sp-cbrow input{height:20px;width:20px;accent-color:var(--primary-color,#096e53);flex:none}.sp-error{color:var(--error-color,#bf3c3c);font-size:12px;margin-top:9px}
.sp-editor button:focus-visible,.sp-editor input:focus-visible,.sp-editor select:focus-visible{outline:2px solid var(--primary-color,#0b7355);outline-offset:2px}
`;
class SmartPlugsCardEditor extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=spConfig();this._hass=null;this._tab='plugs';this._selected=0;this._nativeRequested=false;this._error='';
    this.shadowRoot.addEventListener('click',e=>this._click(e));
    this.shadowRoot.addEventListener('change',e=>this._change(e));
  }
  connectedCallback(){this._render();this._ensureSelectors();}
  set hass(hass){this._hass=hass;if(!customElements.get('ha-selector'))this._render();else this.shadowRoot.querySelectorAll('ha-selector').forEach(el=>el.hass=hass);}
  setConfig(raw){const next=spConfig(raw);if(JSON.stringify(next)===JSON.stringify(this._config)&&this.shadowRoot.querySelector('.sp-editor'))return;this._config=next;this._selected=Math.min(this._selected,Math.max(0,next.plugs.length-1));this._render();}
  async _ensureSelectors(){
    if(this._nativeRequested)return;this._nativeRequested=true;
    if(!customElements.get('ha-selector')){
      try{const helpers=await window.loadCardHelpers?.();await helpers?.importSelector?.();}
      catch { /* UI fallback uses Home Assistant entity list below. */ }
    }
    this._render();
  }
  _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));}
  _update(patch){this._config=spConfig({...this._config,...patch});this._error='';this._emit();this._render();}
  _updatePlug(index,patch){if(index<0||index>=this._config.plugs.length)return;const plugs=this._config.plugs.map((p,i)=>i===index?{...p,...patch}:p);this._update({plugs});}
  _field(label,content,help=''){return `<div class="sp-field"><label class="sp-label">${spEsc(label)}</label>${content}${help?`<p class="sp-help">${spEsc(help)}</p>`:''}</div>`;}
  _input(key,label,value,index='global'){return this._field(label,`<input class="sp-input" data-index="${index}" data-key="${key}" type="text" maxlength="80" value="${spEsc(value)}"/>`);}
  _select(key,label,value,options){return this._field(label,`<select class="sp-input" data-index="global" data-key="${key}">${options.map(([v,t])=>`<option value="${spEsc(v)}" ${v===value?'selected':''}>${spEsc(t)}</option>`).join('')}</select>`);}
  _check(key,label,help){return `<label class="sp-cbrow"><span><strong>${spEsc(label)}</strong><small>${spEsc(help)}</small></span><input type="checkbox" data-index="global" data-key="${key}" ${this._config[key]?'checked':''}/></label>`;}
  _selector(index,key,label,help=''){
    const c=index==='global'?this._config:this._config.plugs[Number(index)];const value=c?.[key]||'';
    return this._field(label,`<div class="sp-controlrow"><div class="sp-grow" data-slot="${index}:${key}"></div>${value?`<button type="button" class="sp-btn iconbtn" data-clear="${index}:${key}" title="Rimuovi" aria-label="Rimuovi ${spEsc(label)}">${spMdi('mdi:close')}</button>`:''}</div>`,help);
  }
  _plugs(){
    const c=this._config;
    let content='<div class="sp-heading">Prese elettriche</div><div class="sp-desc">Seleziona la presa da comandare, quindi i sensori facoltativi. I dati sono letti direttamente da Home Assistant.</div>';
    if(c.plugs.length){
      content+=`<div class="sp-field"><label class="sp-label" for="sp-chosen">Presa da configurare</label><select id="sp-chosen" class="sp-input" data-special="selected">${c.plugs.map((p,i)=>`<option value="${i}" ${i===this._selected?'selected':''}>${spEsc(p.name||p.entity||`Presa ${i+1}`)}</option>`).join('')}</select></div>`;
      const p=c.plugs[this._selected];
      if(p){content+=`<section class="sp-entry">${this._input('name','Nome visualizzato',p.name,this._selected)}${this._input('room','Ambiente',p.room,this._selected)}${this._selector(this._selected,'entity','Presa da comandare (switch.*)','Ricerca limitata alle entità switch.*. Ad esempio switch.macchina_presa_esempio.')}${this._selector(this._selected,'power_entity','Potenza istantanea (sensor.*)','Solo sensori classificati power; W o kW.')}${this._selector(this._selected,'energy_entity','Energia consumata (sensor.*)','Solo sensori classificati energy; Wh, kWh o MWh.')}${this._selector(this._selected,'icon','Icona Home Assistant (MDI)')}<div class="sp-controls"><button type="button" class="sp-btn iconbtn" data-move="-1" ${this._selected===0?'disabled':''} title="Sposta su">${spMdi('mdi:arrow-up')}</button><button type="button" class="sp-btn iconbtn" data-move="1" ${this._selected===c.plugs.length-1?'disabled':''} title="Sposta giù">${spMdi('mdi:arrow-down')}</button><button type="button" class="sp-btn" data-delete="1">Rimuovi presa</button></div></section>`;}
    }
    content+='<button type="button" class="sp-btn primary" data-add="1">+ Aggiungi presa</button>';
    content+=this._selector('global','active_sensor','Sensore riepilogo opzionale (sensor.*)','Visualizzato separatamente: potrebbe contare prese esterne alla card.');
    if(this._error)content+=`<div class="sp-error" role="alert">${spEsc(this._error)}</div>`;
    return content;
  }
  _appearance(){const c=this._config;return '<div class="sp-heading">Aspetto Edera</div>'+
    this._check('show_eyebrow','Mostra etichetta superiore','Nasconde o mostra SMART PLUGS CARD, senza cancellarne il testo.')+
    this._input('eyebrow','Etichetta superiore',c.eyebrow)+
    this._check('show_title','Mostra titolo principale','Nasconde o mostra Prese elettriche, senza cancellarne il testo.')+
    this._input('title','Titolo principale',c.title)+
    this._select('theme_mode','Tema',c.theme_mode,[['auto','Automatico (Home Assistant)'],['light','Edera Light'],['dark','Graphite Dark']])+
    this._select('layout','Disposizione',c.layout,[['grid','Griglia'],['list','Elenco compatto']])+
    this._check('show_power','Mostra potenza (W)','Richiede un sensore di potenza configurato per ogni presa.')+
    this._check('show_energy','Mostra energia (kWh)','Facoltativo: compare solo quando configurato un sensore di energia.');}
  _advanced(){return '<div class="sp-heading">Controlli delle prese</div><div class="sp-desc">Inizialmente la card mostra gli stati senza permettere azioni reali.</div>'+
    this._check('controls_enabled','Abilita comandi ON/OFF','Attiva le chiamate switch.turn_on / switch.turn_off sulle prese configurate.')+
    '<div class="sp-tip">Non utilizzare queste prese per controllare dispositivi con rischi di sicurezza (es. apparecchi che non devono riavviarsi automaticamente). La card non sostituisce i permessi di Home Assistant.</div>'+
    '<div class="sp-tip">Nessun popup né blocco dello scorrimento della pagina. Le condizioni non disponibili non vengono considerate come prese spente.</div>';}
  _render(){
    if(!this.isConnected)return;
    const tabs=[['plugs','Prese'],['appearance','Aspetto'],['advanced','Avanzate']];
    this.shadowRoot.innerHTML=`<style>${SP_EDITOR_CSS}</style><div class="sp-editor"><nav class="sp-tabs" aria-label="Configurazione Smart Plugs Card">${tabs.map(([id,label])=>`<button type="button" class="sp-tab ${this._tab===id?'active':''}" data-tab="${id}">${label}</button>`).join('')}</nav>${this._tab==='plugs'?this._plugs():this._tab==='appearance'?this._appearance():this._advanced()}</div>`;
    this._mountSelectors();
  }
  _nativeOptions(index,key){
    const entityKey=key==='entity'||key==='power_entity'||key==='energy_entity'||key==='active_sensor';
    if(key==='icon')return {icon:{}};
    if(!entityKey)return null;
    const domain=SP_DOMAINS[key]||'sensor';
    const filter={domain}; if(SP_CLASSES[key])filter.device_class=SP_CLASSES[key];
    return {entity:{filter}};
  }
  _mountSelectors(){
    for(const slot of this.shadowRoot.querySelectorAll('[data-slot]')){
      const [idx,key]=slot.dataset.slot.split(':'); const cfg=idx==='global'?this._config:this._config.plugs[Number(idx)];
      const value=cfg?.[key]||'';
      const selectorOptions=this._nativeOptions(idx,key);
      if(customElements.get('ha-selector') && selectorOptions){
        const native=document.createElement('ha-selector');native.hass=this._hass;native.selector=selectorOptions;native.value=value;
        native.addEventListener('value-changed',e=>{
          e.stopPropagation();if(!native.isConnected || !e.detail || !('value' in e.detail))return;
          this._entityChanged(idx,key,e.detail.value);
        });slot.appendChild(native);
      }else if(key==='icon'){
        const select=document.createElement('select');select.className='sp-input';
        for(const [id,label] of SP_ICONS){const opt=document.createElement('option');opt.value=id;opt.textContent=`${label} (${id})`;select.appendChild(opt);}
        select.value=SP_ICONS.some(x=>x[0]===value)?value:SP_ICONS[0][0];
        select.addEventListener('change',()=>this._entityChanged(idx,key,select.value));slot.appendChild(select);
      }else{
        const select=document.createElement('select');select.className='sp-input';
        const blank=document.createElement('option');blank.value='';blank.textContent=key==='entity'?'Seleziona la presa':'Nessun sensore';select.appendChild(blank);
        const options=Object.entries(this._hass?.states||{}).filter(([id,entity])=>{
          const domain=SP_DOMAINS[key]||'sensor';return id.startsWith(domain+'.')&&(!SP_CLASSES[key]||entity.attributes?.device_class===SP_CLASSES[key]);
        }).sort((a,b)=>a[0].localeCompare(b[0]));
        for(const [id,entity] of options){const opt=document.createElement('option');opt.value=id;opt.textContent=`${entity.attributes?.friendly_name||id} (${id})`;select.appendChild(opt);}
        // Unknown existing entity is kept visible until user changes it.
        if(value&&!options.some(([id])=>id===value)){const option=document.createElement('option');option.value=value;option.textContent=value+' (non trovato)';select.appendChild(option);}
        select.value=value;select.addEventListener('change',()=>this._entityChanged(idx,key,select.value));slot.appendChild(select);
      }
    }
  }
  _entityChanged(idx,key,value){
    if(key==='icon')value=spIcon(value);
    else value=spEntity(value,SP_DOMAINS[key]||'sensor');
    if(idx==='global'){if(this._config[key]===value)return;this._update({[key]:value});return;}
    const index=Number(idx); if(!this._config.plugs[index])return;
    if(this._config.plugs[index][key]===value)return;
    if(key==='entity'&&value&&this._config.plugs.some((p,i)=>i!==index&&p.entity===value)){
      this._error='La presa selezionata è già configurata.';this._render();return;
    }
    this._updatePlug(index,{[key]:value});
  }
  _click(event){
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.dataset.tab){this._tab=btn.dataset.tab;this._error='';this._render();return;}
    if(btn.dataset.add){this._selected=this._config.plugs.length;this._update({plugs:[...this._config.plugs,{entity:'',name:'',room:'',icon:'mdi:power-socket-eu'}]});return;}
    if(btn.dataset.delete){const removing=this._selected;this._selected=Math.max(0,Math.min(removing,this._config.plugs.length-2));this._update({plugs:this._config.plugs.filter((_,i)=>i!==removing)});return;}
    if(btn.dataset.move){const to=this._selected+Number(btn.dataset.move);if(to<0||to>=this._config.plugs.length)return;const plugs=[...this._config.plugs];[plugs[this._selected],plugs[to]]=[plugs[to],plugs[this._selected]];this._selected=to;this._update({plugs});return;}
    if(btn.dataset.clear){const [idx,key]=btn.dataset.clear.split(':');this._entityChanged(idx,key,'');}
  }
  _change(event){
    const el=event.target;
    if(el.dataset.special==='selected'){this._selected=Number(el.value);this._render();return;}
    const idx=el.dataset.index, key=el.dataset.key;if(!key||idx===undefined)return;
    const value=el.type==='checkbox'?el.checked:el.value;
    if(idx==='global')this._update({[key]:value});
    else this._updatePlug(Number(idx),{[key]:value});
  }
}
if(typeof customElements!=='undefined'){
  if(!customElements.get(SP_TAG))customElements.define(SP_TAG,SmartPlugsCard);
  if(!customElements.get(SP_EDITOR_TAG))customElements.define(SP_EDITOR_TAG,SmartPlugsCardEditor);
}
if(typeof window!=='undefined'){
  window.customCards=window.customCards||[];
  if(!window.customCards.some(x=>x.type===SP_TAG))window.customCards.push({type:SP_TAG,name:'Smart Plugs Card',description:'Edera Smart Plugs: controlli ON/OFF, potenza e stato delle prese.',preview:true});
}
export {spConfig,spPlug,spState,spCount,spReading,spExternalCount};
