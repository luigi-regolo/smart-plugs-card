/**
 * Smart Plugs Card — Home Assistant dashboard card.
 * Copyright (c) 2026 luigi-regolo. SPDX-License-Identifier: GPL-3.0-only.
 * No remote dependencies, telemetry, or background polling.
 */
const SP_TAG = 'smart-plugs-card';
const SP_EDITOR_TAG = 'smart-plugs-card-editor';
const SP_TYPE = 'custom:smart-plugs-card';
const SP_DEFAULTS = Object.freeze({
  title: null, language: 'auto', eyebrow: 'SMART PLUGS CARD',
  show_title: true, show_eyebrow: true,
  theme_mode: 'auto', layout: 'grid',
  show_power: true,
  controls_enabled: false, plugs: [],
});
const SP_DOMAINS = Object.freeze({entity: 'switch', power_entity: 'sensor'});
const SP_CLASSES = Object.freeze({power_entity: 'power'});
const SP_ICONS = Object.freeze([
  ['mdi:power-socket-eu', 'icSocket'],
  ['mdi:washing-machine', 'icWasher'],
  ['mdi:television', 'icTv'],
  ['mdi:coffee-maker', 'icCoffee'],
  ['mdi:desk-lamp', 'icDesk'],
  ['mdi:lightbulb-outline', 'icBulb'],
  ['mdi:power-plug', 'icPlug'],
  ['mdi:fan', 'icFan'],
  ['mdi:air-conditioner', 'icAc'],
  ['mdi:desktop-tower-monitor', 'icPc'],
]);
// Languages: Italian, English, German and French. The language follows the Home Assistant user; English is the fallback.
const SP_LANGS = Object.freeze([['it', 'Italiano'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français']]);
const SP_TR = {
  it: {
    defTitle: 'Prese elettriche', on: 'Prese attive', off: 'Spente', na: 'Non disp.',
    stOn: 'Accesa', stOff: 'Spenta', stNa: 'Non disponibile', plugN: 'Presa {n}',
    turnOn: 'Accendi', turnOff: 'Spegni', ctlOn: 'Comando presa', ctlOff: 'Abilita i comandi nella configurazione',
    empty: 'Aggiungi una presa dall’editor visuale della card.',
    errCmd: 'Comando non riuscito per {id}: {msg}', errHA: 'errore di Home Assistant',
    secs: 'Configurazione Smart Plugs Card', tPlugs: 'Prese', tLook: 'Aspetto', tAdv: 'Avanzate',
    plugsH: 'Prese elettriche', plugsD: 'Seleziona la presa da comandare, quindi i sensori facoltativi. I dati sono letti direttamente da Home Assistant.',
    chosen: 'Presa da configurare', fName: 'Nome visualizzato', fRoom: 'Ambiente',
    fEntity: 'Presa da comandare (switch.*)', fEntityH: 'Ricerca limitata alle entità switch.*. Ad esempio switch.macchina_presa_esempio.',
    fPower: 'Potenza istantanea (sensor.*)', fPowerH: 'Solo sensori classificati power; W o kW.',
    fIcon: 'Icona Home Assistant (MDI)', mvUp: 'Sposta su', mvDown: 'Sposta giù', rmPlug: 'Rimuovi presa', add: '+ Aggiungi presa',
    remove: 'Rimuovi', removeX: 'Rimuovi {x}',
    lookH: 'Aspetto Edera',
    ckEye: 'Mostra etichetta superiore', ckEyeH: 'Nasconde o mostra l’etichetta superiore, senza cancellarne il testo.', fEye: 'Etichetta superiore',
    ckTitle: 'Mostra titolo principale', ckTitleH: 'Nasconde o mostra il titolo principale, senza cancellarne il testo.', fTitle: 'Titolo principale',
    fTheme: 'Tema', thAuto: 'Automatico (Home Assistant)', thLight: 'Edera Light', thDark: 'Graphite Dark',
    fLayout: 'Disposizione', layGrid: 'Griglia', layList: 'Elenco compatto',
    ckPower: 'Mostra potenza (W)', ckPowerH: 'Richiede un sensore di potenza configurato per ogni presa.',
    lang: 'Lingua', langAuto: 'Automatica (Home Assistant)', langH: 'Automatica segue la lingua dell’utente in Home Assistant. Se la lingua non è disponibile si usa l’inglese.',
    advH: 'Controlli delle prese', advD: 'Inizialmente la card mostra gli stati senza permettere azioni reali.',
    ckCmd: 'Abilita comandi ON/OFF', ckCmdH: 'Attiva le chiamate switch.turn_on / switch.turn_off sulle prese configurate.',
    tip1: 'Non utilizzare queste prese per controllare dispositivi con rischi di sicurezza (es. apparecchi che non devono riavviarsi automaticamente). La card non sostituisce i permessi di Home Assistant.',
    tip2: 'Nessun popup né blocco dello scorrimento della pagina. Le condizioni non disponibili non vengono considerate come prese spente.',
    selPlug: 'Seleziona la presa', noSensor: 'Nessun sensore', notFound: 'non trovato',
    errDup: 'La presa selezionata è già configurata.',
    icSocket: 'Presa elettrica', icWasher: 'Lavatrice', icTv: 'Televisore', icCoffee: 'Macchina del caffè', icDesk: 'Lampada da tavolo',
    icBulb: 'Lampadina', icPlug: 'Spina elettrica', icFan: 'Ventilatore', icAc: 'Climatizzatore', icPc: 'Computer'
  },
  en: {
    defTitle: 'Smart plugs', on: 'Active plugs', off: 'Off', na: 'Unavail.',
    stOn: 'On', stOff: 'Off', stNa: 'Unavailable', plugN: 'Plug {n}',
    turnOn: 'Turn on', turnOff: 'Turn off', ctlOn: 'Plug control', ctlOff: 'Enable the controls in the configuration',
    empty: 'Add a plug from the card’s visual editor.',
    errCmd: 'Command failed for {id}: {msg}', errHA: 'Home Assistant error',
    secs: 'Smart Plugs Card settings', tPlugs: 'Plugs', tLook: 'Appearance', tAdv: 'Advanced',
    plugsH: 'Smart plugs', plugsD: 'Select the plug to control, then the optional sensors. Data is read directly from Home Assistant.',
    chosen: 'Plug to configure', fName: 'Display name', fRoom: 'Room',
    fEntity: 'Plug to control (switch.*)', fEntityH: 'Search is limited to switch.* entities. For example switch.example_washing_machine.',
    fPower: 'Instantaneous power (sensor.*)', fPowerH: 'Only sensors with the power device class; W or kW.',
    fIcon: 'Home Assistant icon (MDI)', mvUp: 'Move up', mvDown: 'Move down', rmPlug: 'Remove plug', add: '+ Add plug',
    remove: 'Remove', removeX: 'Remove {x}',
    lookH: 'Edera appearance',
    ckEye: 'Show upper label', ckEyeH: 'Shows or hides the upper label without deleting its text.', fEye: 'Upper label',
    ckTitle: 'Show main title', ckTitleH: 'Shows or hides the main title without deleting its text.', fTitle: 'Main title',
    fTheme: 'Theme', thAuto: 'Automatic (Home Assistant)', thLight: 'Edera Light', thDark: 'Graphite Dark',
    fLayout: 'Layout', layGrid: 'Grid', layList: 'Compact list',
    ckPower: 'Show power (W)', ckPowerH: 'Requires a power sensor configured for each plug.',
    lang: 'Language', langAuto: 'Automatic (Home Assistant)', langH: 'Automatic follows the user’s language in Home Assistant. If the language is not available, English is used.',
    advH: 'Plug controls', advD: 'At first the card shows states without allowing real actions.',
    ckCmd: 'Enable ON/OFF commands', ckCmdH: 'Enables switch.turn_on / switch.turn_off calls on the configured plugs.',
    tip1: 'Do not use these plugs to control devices with safety risks (e.g. appliances that must not restart automatically). The card does not replace Home Assistant permissions.',
    tip2: 'No popup and no page scroll lock. Unavailable states are not treated as plugs that are off.',
    selPlug: 'Select the plug', noSensor: 'No sensor', notFound: 'not found',
    errDup: 'The selected plug is already configured.',
    icSocket: 'Power socket', icWasher: 'Washing machine', icTv: 'Television', icCoffee: 'Coffee maker', icDesk: 'Desk lamp',
    icBulb: 'Light bulb', icPlug: 'Power plug', icFan: 'Fan', icAc: 'Air conditioner', icPc: 'Computer'
  },
  de: {
    defTitle: 'Steckdosen', on: 'Aktive Steckdosen', off: 'Aus', na: 'Nicht verf.',
    stOn: 'An', stOff: 'Aus', stNa: 'Nicht verfügbar', plugN: 'Steckdose {n}',
    turnOn: 'Einschalten', turnOff: 'Ausschalten', ctlOn: 'Steckdosensteuerung', ctlOff: 'Steuerung in der Konfiguration aktivieren',
    empty: 'Fügen Sie im visuellen Editor der Karte eine Steckdose hinzu.',
    errCmd: 'Befehl für {id} fehlgeschlagen: {msg}', errHA: 'Home-Assistant-Fehler',
    secs: 'Einstellungen der Smart Plugs Card', tPlugs: 'Steckdosen', tLook: 'Darstellung', tAdv: 'Erweitert',
    plugsH: 'Smarte Steckdosen', plugsD: 'Wählen Sie die zu steuernde Steckdose und anschließend die optionalen Sensoren. Die Daten werden direkt aus Home Assistant gelesen.',
    chosen: 'Zu konfigurierende Steckdose', fName: 'Angezeigter Name', fRoom: 'Raum',
    fEntity: 'Zu steuernde Steckdose (switch.*)', fEntityH: 'Die Suche ist auf switch.*-Entitäten beschränkt. Zum Beispiel switch.beispiel_waschmaschine.',
    fPower: 'Momentane Leistung (sensor.*)', fPowerH: 'Nur Sensoren mit der Geräteklasse power; W oder kW.',
    fIcon: 'Home-Assistant-Symbol (MDI)', mvUp: 'Nach oben', mvDown: 'Nach unten', rmPlug: 'Steckdose entfernen', add: '+ Steckdose hinzufügen',
    remove: 'Entfernen', removeX: '{x} entfernen',
    lookH: 'Edera-Darstellung',
    ckEye: 'Obere Beschriftung anzeigen', ckEyeH: 'Blendet die obere Beschriftung ein oder aus, ohne den Text zu löschen.', fEye: 'Obere Beschriftung',
    ckTitle: 'Haupttitel anzeigen', ckTitleH: 'Blendet den Haupttitel ein oder aus, ohne den Text zu löschen.', fTitle: 'Haupttitel',
    fTheme: 'Design', thAuto: 'Automatisch (Home Assistant)', thLight: 'Edera Light', thDark: 'Graphite Dark',
    fLayout: 'Anordnung', layGrid: 'Raster', layList: 'Kompakte Liste',
    ckPower: 'Leistung anzeigen (W)', ckPowerH: 'Erfordert einen konfigurierten Leistungssensor für jede Steckdose.',
    lang: 'Sprache', langAuto: 'Automatisch (Home Assistant)', langH: 'Automatisch folgt der Sprache des Benutzers in Home Assistant. Ist die Sprache nicht verfügbar, wird Englisch verwendet.',
    advH: 'Steckdosensteuerung', advD: 'Zunächst zeigt die Karte nur Zustände an und erlaubt keine echten Aktionen.',
    ckCmd: 'EIN/AUS-Befehle aktivieren', ckCmdH: 'Aktiviert switch.turn_on / switch.turn_off auf den konfigurierten Steckdosen.',
    tip1: 'Verwenden Sie diese Steckdosen nicht zur Steuerung von Geräten mit Sicherheitsrisiken (z. B. Geräte, die nicht automatisch neu starten dürfen). Die Karte ersetzt nicht die Berechtigungen von Home Assistant.',
    tip2: 'Kein Popup und keine Sperre des Seitenscrollens. Nicht verfügbare Zustände gelten nicht als ausgeschaltete Steckdosen.',
    selPlug: 'Steckdose auswählen', noSensor: 'Kein Sensor', notFound: 'nicht gefunden',
    errDup: 'Die ausgewählte Steckdose ist bereits konfiguriert.',
    icSocket: 'Steckdose', icWasher: 'Waschmaschine', icTv: 'Fernseher', icCoffee: 'Kaffeemaschine', icDesk: 'Schreibtischlampe',
    icBulb: 'Glühbirne', icPlug: 'Netzstecker', icFan: 'Ventilator', icAc: 'Klimaanlage', icPc: 'Computer'
  },
  fr: {
    defTitle: 'Prises connectées', on: 'Prises actives', off: 'Éteintes', na: 'Indispo.',
    stOn: 'Allumée', stOff: 'Éteinte', stNa: 'Indisponible', plugN: 'Prise {n}',
    turnOn: 'Allumer', turnOff: 'Éteindre', ctlOn: 'Commande de la prise', ctlOff: 'Activez les commandes dans la configuration',
    empty: 'Ajoutez une prise depuis l’éditeur visuel de la carte.',
    errCmd: 'Échec de la commande pour {id} : {msg}', errHA: 'erreur de Home Assistant',
    secs: 'Paramètres de la Smart Plugs Card', tPlugs: 'Prises', tLook: 'Apparence', tAdv: 'Avancé',
    plugsH: 'Prises connectées', plugsD: 'Sélectionnez la prise à commander, puis les capteurs facultatifs. Les données sont lues directement depuis Home Assistant.',
    chosen: 'Prise à configurer', fName: 'Nom affiché', fRoom: 'Pièce',
    fEntity: 'Prise à commander (switch.*)', fEntityH: 'La recherche est limitée aux entités switch.*. Par exemple switch.exemple_lave_linge.',
    fPower: 'Puissance instantanée (sensor.*)', fPowerH: 'Uniquement les capteurs de classe power ; W ou kW.',
    fIcon: 'Icône Home Assistant (MDI)', mvUp: 'Monter', mvDown: 'Descendre', rmPlug: 'Supprimer la prise', add: '+ Ajouter une prise',
    remove: 'Supprimer', removeX: 'Supprimer {x}',
    lookH: 'Apparence Edera',
    ckEye: 'Afficher l’étiquette supérieure', ckEyeH: 'Affiche ou masque l’étiquette supérieure sans effacer son texte.', fEye: 'Étiquette supérieure',
    ckTitle: 'Afficher le titre principal', ckTitleH: 'Affiche ou masque le titre principal sans effacer son texte.', fTitle: 'Titre principal',
    fTheme: 'Thème', thAuto: 'Automatique (Home Assistant)', thLight: 'Edera Light', thDark: 'Graphite Dark',
    fLayout: 'Disposition', layGrid: 'Grille', layList: 'Liste compacte',
    ckPower: 'Afficher la puissance (W)', ckPowerH: 'Nécessite un capteur de puissance configuré pour chaque prise.',
    lang: 'Langue', langAuto: 'Automatique (Home Assistant)', langH: 'Automatique suit la langue de l’utilisateur dans Home Assistant. Si la langue n’est pas disponible, l’anglais est utilisé.',
    advH: 'Commandes des prises', advD: 'Au départ, la carte affiche les états sans permettre d’actions réelles.',
    ckCmd: 'Activer les commandes ON/OFF', ckCmdH: 'Active les appels switch.turn_on / switch.turn_off sur les prises configurées.',
    tip1: 'N’utilisez pas ces prises pour commander des appareils présentant des risques de sécurité (par ex. des appareils qui ne doivent pas redémarrer automatiquement). La carte ne remplace pas les autorisations de Home Assistant.',
    tip2: 'Aucune fenêtre contextuelle et aucun blocage du défilement de la page. Les états indisponibles ne sont pas considérés comme des prises éteintes.',
    selPlug: 'Sélectionner la prise', noSensor: 'Aucun capteur', notFound: 'introuvable',
    errDup: 'La prise sélectionnée est déjà configurée.',
    icSocket: 'Prise électrique', icWasher: 'Lave-linge', icTv: 'Téléviseur', icCoffee: 'Machine à café', icDesk: 'Lampe de bureau',
    icBulb: 'Ampoule', icPlug: 'Fiche électrique', icFan: 'Ventilateur', icAc: 'Climatiseur', icPc: 'Ordinateur'
  }
};
function spT(lang, key, vars) {
  let t = SP_TR[lang]?.[key];
  if (t == null) t = SP_TR.en[key];
  if (t == null) return key;
  return vars ? t.replace(/\{(\w+)\}/g, (m, x) => (vars[x] != null ? vars[x] : m)) : t;
}
function spBaseLang(hass) {
  const l = hass && ((hass.locale && hass.locale.language) || hass.language);
  return typeof l === 'string' ? l.toLowerCase().split(/[-_]/)[0] : 'en';
}
function spPickLang(cfgLang, hass) {
  const l = cfgLang && cfgLang !== 'auto' ? cfgLang : spBaseLang(hass);
  return SP_TR[l] ? l : 'en';
}
// Config without the optional title when it is only the translated default.
function spOut(config) { const o = { ...config }; if (o.title === null) delete o.title; return o; }
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
  };
}
function spConfig(raw={}) {
  const r=raw && typeof raw==='object' && !Array.isArray(raw) ? raw : {};
  const {active_sensor:_removed,...legacyless}=r; // legacy option dropped: ignored and cleaned on the next save
  const unique=new Set(); const plugs=[];
  for(const value of Array.isArray(r.plugs)?r.plugs:[]) {
    const p=spPlug(value);
    if(p.entity && unique.has(p.entity)) continue;
    plugs.push(p); if(p.entity) unique.add(p.entity);
  }
  return {
    ...legacyless, type: SP_TYPE,
    title:r.title==null?null:spText(r.title,60),
    eyebrow:spText(r.eyebrow??SP_DEFAULTS.eyebrow,60),
    show_title:r.show_title!==false, show_eyebrow:r.show_eyebrow!==false,
    theme_mode:['auto','light','dark'].includes(r.theme_mode)?r.theme_mode:'auto',
    layout:['grid','list'].includes(r.layout)?r.layout:'grid',
    language:SP_LANGS.some(l=>l[0]===r.language)?r.language:'auto',
    show_power:r.show_power!==false,
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
function spMdi(name) {return `<ha-icon icon="${spEsc(name)}" aria-hidden="true"></ha-icon>`;}
const SP_CSS=`
:host{display:block;box-sizing:border-box;width:100%;max-width:100%;min-width:0;font-family:var(--ha-font-family-body,Roboto,Arial,sans-serif);font-size:var(--ha-font-size-m,14px)}
*,*:before,*:after{box-sizing:border-box}button{font:inherit;cursor:pointer}button:disabled{cursor:not-allowed}
ha-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;--mdc-icon-size:21px;width:21px;height:21px;flex:none}
.sp-root{--sp-bg:#fafbf9;--sp-tile:#f1f3ef;--sp-surface:#f0f2ef;--sp-line:#dfe5de;--sp-fg:#17261e;--sp-muted:#647569;--sp-accent:#096e53;--sp-on-bg:#edf7f0;--sp-on-line:#c8e5d3;--sp-on-soft:#dbf1e5;--sp-track:#d7e0d8;--sp-off:#e5e9e4;--sp-warn:#b67a2b;--sp-danger:#bc4444;background:var(--sp-bg);color:var(--sp-fg);border-radius:25px;border:1px solid var(--sp-line);padding:18px;min-width:0;container:sp-card/inline-size}
.sp-root.sp-dark{--sp-bg:#101211;--sp-tile:#191c1a;--sp-surface:#191c1a;--sp-line:#2b302c;--sp-fg:#f5f7f4;--sp-muted:#bbc5bd;--sp-accent:#0e795d;--sp-on-bg:#172a20;--sp-on-line:#285641;--sp-on-soft:#1d4a35;--sp-track:#434d45;--sp-off:#282b29;--sp-warn:#e6b66c;--sp-danger:#ff8888}
.sp-dark .sp-orb{background:#282b29}.sp-dark .sp-plug.off{background:#191c1a}
.sp-head{margin:2px 4px 17px}.sp-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:750;color:var(--sp-muted);margin-bottom:7px}.sp-title{font-size:25px;line-height:1.14;font-weight:780;letter-spacing:-.7px;overflow-wrap:anywhere}.sp-title span{color:var(--sp-accent);font-weight:800}
/* Summary tiles: unchanged look. The third tile ("Non disp.") is always present, so the row never changes size. */
.sp-summary{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:8px;margin-bottom:11px}
.sp-summary-cell{min-width:0;background:var(--sp-surface);border:1px solid var(--sp-line);border-radius:15px;padding:13px 9px}
.sp-summary-cell.major{background:var(--sp-on-bg);border-color:var(--sp-on-line)}.sp-summary-cell.warn{border-style:dashed}
.sp-summary-cell strong{display:block;font-size:29px;letter-spacing:-.7px;font-weight:650;line-height:1.15;font-variant-numeric:tabular-nums}.sp-summary-cell.major strong{color:var(--sp-accent)}.sp-summary-cell.warn strong{color:var(--sp-warn)}
.sp-summary-cell span{display:block;font-size:11.5px;line-height:1.4;color:var(--sp-muted);font-weight:400;margin-top:5px;overflow-wrap:break-word}
.sp-grid-host{container:sp-grid/inline-size;min-width:0}
.sp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
/* Plug tile: icon + switch on the first row, full-width name below, state + reading pinned to the bottom. */
.sp-plug{min-width:0;border:1px solid var(--sp-line);background:var(--sp-tile);border-radius:17px;min-height:112px;padding:11px 11px 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto 1fr;grid-template-areas:"orb toggle" "names names" "meta meta";gap:8px 6px;align-items:start}
.sp-plug.on{background:var(--sp-on-bg);border-color:var(--sp-on-line)}.sp-plug.unknown{border-style:dashed}
/* Edera Graphite Dark: active tiles remain neutral; only their switches turn green.
   Edera Light intentionally retains its approved green active-tile wash. */
.sp-root.sp-dark .sp-plug.on{background:var(--sp-tile);border-color:var(--sp-line)}
.sp-root.sp-dark .sp-plug.on .sp-orb{background:var(--sp-off);color:var(--sp-fg)}
.sp-root.sp-dark .sp-plug.on .sp-state{background:var(--sp-off);color:var(--sp-muted)}
.sp-root.sp-dark .sp-plug.on .sp-dot{background:#88998c}
.sp-root.sp-dark .sp-summary-cell.major{background:var(--sp-surface);border-color:var(--sp-line)}
.sp-root.sp-dark .sp-summary-cell.major strong{color:var(--sp-fg)}

.sp-orb{grid-area:orb;justify-self:start;width:36px;height:36px;display:grid;place-items:center;background:var(--sp-bg);color:var(--sp-fg);border-radius:50%}.sp-plug.on .sp-orb{background:var(--sp-on-soft);color:var(--sp-accent)}
.sp-names{grid-area:names;min-width:0}.sp-names strong{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sp-names small{display:block;color:var(--sp-muted);font-size:11.5px;line-height:1.4;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-meta{grid-area:meta;align-self:end;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 8px;min-width:0}
.sp-state{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:4px 8px;background:var(--sp-off);color:var(--sp-muted);font-size:10.5px;font-weight:600;line-height:1.2}
.sp-dot{width:6px;height:6px;border-radius:50%;background:#88998c}.sp-plug.on .sp-state{background:var(--sp-on-soft);color:var(--sp-accent)}.sp-plug.on .sp-dot{background:var(--sp-accent)}.sp-plug.unknown .sp-state{color:var(--sp-warn)}.sp-plug.unknown .sp-dot{background:var(--sp-warn)}
.sp-reading{display:flex;align-items:baseline;gap:3px;min-height:0}.sp-reading strong{font-weight:600;font-size:18px;line-height:1.1;font-variant-numeric:tabular-nums}.sp-reading span{font-size:11px;color:var(--sp-muted);font-weight:400}
/* Standard switch (compact): 44x26 visible, no icon; touch area extended to 44px with a pseudo-element. */
.sp-toggle{grid-area:toggle;position:relative;background:var(--sp-track);height:26px;width:44px;flex:none;border-radius:100px;border:1px solid var(--sp-line);padding:2px;display:flex;align-items:center;justify-content:flex-start}
.sp-toggle:before{content:"";position:absolute;inset:-9px -4px}
.sp-toggle[aria-checked=true]{background:var(--sp-accent);border-color:var(--sp-accent)}.sp-toggle:disabled,.sp-toggle[aria-disabled=true]{opacity:.40}
.sp-thumb{width:20px;height:20px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0003;transition:transform .18s ease}.sp-toggle[aria-checked=true] .sp-thumb{transform:translateX(18px)}
.sp-list{grid-template-columns:1fr;gap:8px}.sp-list .sp-plug{min-height:62px;grid-template-columns:auto minmax(0,1fr) auto auto;grid-template-rows:auto;grid-template-areas:"orb names meta toggle";gap:10px;align-items:center;padding:10px 12px}.sp-list .sp-meta{align-self:center;justify-content:flex-end;flex-wrap:nowrap;gap:10px}.sp-list .sp-reading strong{font-size:16px}
.sp-note[hidden],.sp-warning[hidden]{display:none}.sp-empty{padding:22px 12px;border:1px dashed var(--sp-line);border-radius:14px;font-size:12px;color:var(--sp-muted);text-align:center}.sp-warning{font-size:11px;color:var(--sp-danger);margin:10px 3px 0;line-height:1.45;overflow-wrap:anywhere}.sp-note{font-size:10px;color:var(--sp-muted);margin:9px 3px 0}
.sp-toggle:focus-visible{outline:2px solid var(--sp-accent);outline-offset:3px}
/* Tablet / desktop: more columns when the card is wide (the width of the card matters, not the screen). */
@container sp-grid (min-width:560px){.sp-grid:not(.sp-list){grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.sp-plug{min-height:118px;padding:12px 13px 13px}}
@container sp-grid (min-width:820px){.sp-grid:not(.sp-list){grid-template-columns:repeat(4,minmax(0,1fr))}.sp-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container sp-card (min-width:560px){.sp-summary{max-width:620px}}
/* Smartphones */
@container sp-grid (max-width:360px){.sp-plug{padding:10px 10px 11px;gap:7px 5px;min-height:104px}.sp-orb{width:32px;height:32px}.sp-orb ha-icon{--mdc-icon-size:18px;width:18px;height:18px}.sp-names strong{font-size:12px}.sp-names small{font-size:10.5px}.sp-state{font-size:10px;padding:4px 7px}.sp-reading strong{font-size:17px}.sp-list .sp-plug{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"orb names toggle" "meta meta meta";gap:8px 10px}.sp-list .sp-meta{justify-content:flex-start}}
/* Very narrow phones (320-360 px cards): state and reading always stack, so every tile keeps the same height. */
@container sp-grid (max-width:330px){.sp-meta{flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:5px}.sp-list .sp-meta{flex-direction:row;align-items:center;justify-content:flex-start;gap:10px}}
@container sp-card (max-width:300px){.sp-root{padding:12px}.sp-summary-cell{padding:10px 7px}.sp-summary-cell strong{font-size:25px}.sp-summary-cell span{font-size:10.5px}}
@media(max-width:420px){.sp-title{font-size:23px}.sp-summary-cell strong{font-size:25px}}
@container sp-card (max-width:380px){.sp-title{font-size:23px}.sp-summary-cell strong{font-size:25px}}
@container sp-card (max-width:310px){.sp-title{font-size:21px}.sp-eyebrow{font-size:9px}}
@media(prefers-reduced-motion:reduce){.sp-toggle,.sp-thumb{transition:none!important}}
`;
class SmartPlugsCard extends HTMLElement {
  static getStubConfig() {const {type,...config}=spOut(spConfig({}));return config;}
  static getConfigElement() {return document.createElement(SP_EDITOR_TAG);}
  constructor() {
    super();this.attachShadow({mode:'open'});this._config=spConfig();this._hass=null;
    this._busy=new Set();this._error='';this._structureSignature='';
    this.shadowRoot.addEventListener('click', e=>this._onClick(e));
    this._onTheme=()=>this._render(true);
    this._media=typeof window!=='undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  }
  connectedCallback(){this._media?.addEventListener?.('change',this._onTheme);this._render(true);}
  disconnectedCallback(){this._media?.removeEventListener?.('change',this._onTheme);}
  setConfig(raw){this._config=spConfig(raw);this._error='';this._structureSignature='';this._render(true);}
  set hass(hass){this._hass=hass;this._render();}
  getCardSize(){return Math.max(2,Math.ceil(this._config.plugs.filter(p=>p.entity).length/(this._config.layout==='list'?1:2))*2+2);}
  _entity(id){return id?this._hass?.states?.[id]:null;}
  _lang(){return spPickLang(this._config.language,this._hass);}
  _t(k,v){return spT(this._lang(),k,v);}
  _num(){return new Intl.NumberFormat(this._lang(),{maximumFractionDigits:1});}
  _dark(){return this._config.theme_mode==='dark'||(this._config.theme_mode==='auto'&&(this._hass?.themes?.darkMode===true ||(!this._hass?.themes&&this._media?.matches)));}
  _row(p,index){
    const state=spState(this._entity(p.entity)),on=state===true;
    const entity=this._entity(p.entity);
    const name=p.name||spText(entity?.attributes?.friendly_name,60)||this._t('plugN',{n:index+1});
    const icon=p.icon || spIcon(entity?.attributes?.icon);
    const watt=spReading(this._entity(p.power_entity),'power');
    const watts=this._config.show_power ? `<div class="sp-reading"><strong data-watt>${watt===null?'—':spEsc(this._num().format(watt.value))}</strong><span>W</span></div>` : '';
    const label=this._t(state===null?'stNa':on?'stOn':'stOff');
    const disabled=!this._config.controls_enabled || state===null || typeof this._hass?.callService!=='function';
    const pending=this._busy.has(p.entity);
    return `<article class="sp-plug ${state===null?'unknown':on?'on':'off'}" data-plug-id="${spEsc(p.entity)}"><span class="sp-orb">${spMdi(icon)}</span><span class="sp-names"><strong class="sp-name" title="${spEsc(name)}">${spEsc(name)}</strong>${p.room?`<small title="${spEsc(p.room)}">${spEsc(p.room)}</small>`:''}</span><button type="button" class="sp-toggle" role="switch" aria-checked="${on}" aria-disabled="${disabled||pending}" data-switch="${spEsc(p.entity)}" aria-label="${spEsc(this._t(on?'turnOff':'turnOn'))} ${spEsc(name)}" ${disabled?'disabled':''} title="${spEsc(this._t(this._config.controls_enabled?'ctlOn':'ctlOff'))}"><span class="sp-thumb"></span></button><div class="sp-meta"><span class="sp-state"><span class="sp-dot"></span><span data-state-text>${label}</span></span>${watts}</div></article>`;
  }
  // Changes to configuration or theme require a structural render.
  // Entity updates and switch actions update existing nodes without replacing
  // Shadow DOM, preserving scroll position, touch focus and element geometry.
  _structureKey(){return JSON.stringify([this._config,this._dark(),this._lang()]);}
  _refreshLive(){
    const root=this.shadowRoot.querySelector('.sp-root');if(!root)return;
    const c=this._config, plugs=c.plugs.filter(p=>p.entity);
    const count=spCount(plugs,this._hass?.states);
    for(const [key,value] of Object.entries({on:count.on,off:count.off,other:count.other})){
      const el=root.querySelector(`[data-count="${key}"]`);if(el && el.textContent!==String(value))el.textContent=String(value);
    }
    const otherCell=root.querySelector('[data-cell="other"]');if(otherCell)otherCell.classList.toggle('warn',count.other>0);
    const rowMap=new Map([...root.querySelectorAll('[data-plug-id]')].map(el=>[el.dataset.plugId,el]));
    for(const [index,p] of plugs.entries()){
      const row=rowMap.get(p.entity);
      if(!row)continue;
      const state=spState(this._entity(p.entity)),on=state===true;
      row.classList.toggle('on',on);row.classList.toggle('off',state===false);row.classList.toggle('unknown',state===null);
      const status=row.querySelector('[data-state-text]');if(status)status.textContent=this._t(state===null?'stNa':on?'stOn':'stOff');
      const name=p.name||spText(this._entity(p.entity)?.attributes?.friendly_name,60)||this._t('plugN',{n:index+1});
      const nameEl=row.querySelector('.sp-name');if(nameEl){nameEl.textContent=name;nameEl.title=name;}
      const wattEl=row.querySelector('[data-watt]');if(wattEl){const data=spReading(this._entity(p.power_entity),'power');wattEl.textContent=data===null?'—':this._num().format(data.value);}
      const btn=row.querySelector('[data-switch]');if(btn){
        const blocked=!c.controls_enabled||state===null||typeof this._hass?.callService!=='function';
        btn.disabled=blocked;btn.setAttribute('aria-disabled',String(blocked||this._busy.has(p.entity)));
        btn.setAttribute('aria-checked',String(on));btn.setAttribute('aria-label',`${this._t(on?'turnOff':'turnOn')} ${name}`);
      }
    }
    const warning=root.querySelector('[data-error-note]');
    if(warning){warning.hidden=!this._error;warning.textContent=this._error;}
  }
  _render(force=false){
    if(!this.isConnected)return;
    const structureKey=this._structureKey();
    if(!force && this._structureSignature===structureKey && this.shadowRoot.querySelector('.sp-root')){
      this._refreshLive();return;
    }
    const c=this._config,availablePlugs=c.plugs.filter(p=>p.entity),count=spCount(availablePlugs,this._hass?.states);
    const heading=c.show_eyebrow&&c.eyebrow?`<div class="sp-eyebrow">${spEsc(c.eyebrow)}</div>`:'';
    const titleText=c.title==null?this._t('defTitle'):c.title;
    const title=c.show_title&&titleText?`<div class="sp-title">${spEsc(titleText)}<span>.</span></div>`:'';
    this.shadowRoot.innerHTML=`<style>${SP_CSS}</style><div class="sp-root ${this._dark()?'sp-dark':''}">${heading||title?`<header class="sp-head">${heading}${title}</header>`:''}<div class="sp-summary"><div class="sp-summary-cell major"><strong data-count="on">${count.on}</strong><span>${spEsc(this._t('on'))}</span></div><div class="sp-summary-cell"><strong data-count="off">${count.off}</strong><span>${spEsc(this._t('off'))}</span></div><div class="sp-summary-cell${count.other?' warn':''}" data-cell="other"><strong data-count="other">${count.other}</strong><span>${spEsc(this._t('na'))}</span></div></div><div class="sp-grid-host">${availablePlugs.length?`<div class="sp-grid ${c.layout==='list'?'sp-list':''}">${availablePlugs.map((p,i)=>this._row(p,i)).join('')}</div>`:`<div class="sp-empty">${spEsc(this._t('empty'))}</div>`}</div><div class="sp-warning" data-error-note role="alert" hidden></div></div>`;
    this._structureSignature=structureKey;
    this._refreshLive();
  }
  async _onClick(event){
    const button=event.target.closest('button[data-switch]');if(!button||button.disabled)return;
    const id=button.dataset.switch;if(!this._config.controls_enabled||this._busy.has(id))return;
    if(!this._config.plugs.some(p=>p.entity===id))return;
    const state=spState(this._entity(id));if(state===null)return;
    if(typeof this._hass?.callService!=='function')return;
    const action=state?'turn_off':'turn_on';this._busy.add(id);this._error='';this._refreshLive();
    try{await this._hass.callService('switch',action,{entity_id:id});}
    catch(err){this._error=this._t('errCmd',{id,msg:err?.message||this._t('errHA')});}
    finally{this._busy.delete(id);this._refreshLive();}
  }
}
const SP_EDITOR_CSS=`
:host{display:block;font-family:var(--ha-font-family-body,Roboto,Arial,sans-serif);font-size:var(--ha-font-size-m,14px);color:var(--primary-text-color,#19231c)}*{box-sizing:border-box}button,input,select{font:inherit}
.sp-editor{min-width:0}.sp-tabs{display:flex;gap:3px;overflow:auto;border-bottom:1px solid var(--divider-color,#dfe5df);margin:0 0 17px}.sp-tab{border:0;background:none;padding:12px 9px;color:var(--secondary-text-color,#657466);font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap}.sp-tab.active{color:var(--primary-color,#096e53);border-bottom:2px solid var(--primary-color,#096e53)}
.sp-heading{font-size:15px;font-weight:750;margin:0 0 8px}.sp-desc,.sp-help{font-size:12px;color:var(--secondary-text-color,#68776d);line-height:1.5}.sp-field{margin:13px 0;min-width:0}.sp-label{font-size:12px;font-weight:690;margin:0 0 7px;display:block}.sp-input{display:block;min-height:42px;width:100%;border:1px solid var(--divider-color,#cad6ca);background:var(--card-background-color,var(--secondary-background-color,#f7faf7));color:var(--primary-text-color,#19231c);border-radius:11px;padding:10px 12px}
.sp-controlrow{display:flex;align-items:center;gap:8px;min-width:0}.sp-grow{flex:1;min-width:0}.sp-controls{display:flex;gap:5px;flex:none}.sp-btn{border:1px solid var(--divider-color,#cad6ca);background:var(--secondary-background-color,#eff3ef);color:var(--primary-text-color,#1a231d);padding:9px 12px;border-radius:12px;cursor:pointer}.sp-btn:disabled{opacity:.4}.sp-btn.primary{background:var(--primary-color,#0b7659);color:#fff;border-color:transparent}.sp-btn.iconbtn{padding:8px;display:grid;place-items:center;min-width:37px;height:37px}.sp-btn ha-icon{--mdc-icon-size:17px;width:17px;height:17px}
.sp-entry{border:1px solid var(--divider-color,#dee6de);padding:11px 10px;border-radius:14px;margin:9px 0}.sp-entry-head{display:flex;align-items:center;gap:10px}.sp-entry-head span{flex:1;min-width:0;font-weight:680;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:12px}.sp-entry-head small{color:var(--secondary-text-color,#697b70);font-weight:400;font-size:10px;display:block;margin-top:3px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.sp-selectors{padding:9px 3px 0}.sp-selectors ha-selector{display:block;width:100%;--mdc-theme-primary:var(--primary-color,#0b7355)}.sp-tip{padding:11px;border-radius:13px;background:var(--secondary-background-color,#edf2ed);font-size:12px;line-height:1.45;color:var(--secondary-text-color,#667469);margin:14px 0}.sp-cbrow{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--divider-color,#e0e8df);padding:12px 2px}.sp-cbrow strong{display:block;font-size:13px;font-weight:670}.sp-cbrow small{display:block;font-size:11px;color:var(--secondary-text-color,#647265);margin-top:4px}.sp-cbrow input[type=checkbox]{appearance:none;-webkit-appearance:none;position:relative;flex:none;width:44px;height:26px;margin:0;border-radius:100px;border:1px solid var(--divider-color,#cfd8cf);background:var(--secondary-background-color,#d7e0d8);cursor:pointer;transition:background .18s}.sp-cbrow input[type=checkbox]:before{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:transform .18s}.sp-cbrow input[type=checkbox]:checked{background:var(--primary-color,#096e53);border-color:var(--primary-color,#096e53)}.sp-cbrow input[type=checkbox]:checked:before{transform:translateX(18px)}.sp-input:disabled{opacity:.5;cursor:not-allowed}@media(prefers-reduced-motion:reduce){.sp-cbrow input[type=checkbox],.sp-cbrow input[type=checkbox]:before{transition:none}}.sp-error{color:var(--error-color,#bf3c3c);font-size:12px;margin-top:9px}
.sp-editor button:focus-visible,.sp-editor input:focus-visible,.sp-editor select:focus-visible{outline:2px solid var(--primary-color,#0b7355);outline-offset:2px}
`;
class SmartPlugsCardEditor extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=spConfig();this._hass=null;this._tab='plugs';this._selected=0;this._nativeRequested=false;this._error='';
    this.shadowRoot.addEventListener('click',e=>this._click(e));
    this.shadowRoot.addEventListener('change',e=>this._change(e));
  }
  connectedCallback(){this._render();this._ensureSelectors();}
  _lang(){return spPickLang(this._config.language,this._hass);}
  _t(k,v){return spT(this._lang(),k,v);}
  // The first Home Assistant object tells which language the user speaks: redraw once with the right texts.
  set hass(hass){this._hass=hass;if(!customElements.get('ha-selector')||this._renderedLang!==this._lang())this._render();else this.shadowRoot.querySelectorAll('ha-selector').forEach(el=>el.hass=hass);}
  setConfig(raw){const next=spConfig(raw);if(JSON.stringify(next)===JSON.stringify(this._config)&&this.shadowRoot.querySelector('.sp-editor'))return;this._config=next;this._selected=Math.min(this._selected,Math.max(0,next.plugs.length-1));this._render();}
  async _ensureSelectors(){
    if(this._nativeRequested)return;this._nativeRequested=true;
    if(!customElements.get('ha-selector')){
      try{const helpers=await window.loadCardHelpers?.();await helpers?.importSelector?.();}
      catch { /* UI fallback uses Home Assistant entity list below. */ }
    }
    this._render();
  }
  _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:spOut(this._config)},bubbles:true,composed:true}));}
  _update(patch){this._config=spConfig({...this._config,...patch});this._error='';this._emit();this._render();}
  _updatePlug(index,patch){if(index<0||index>=this._config.plugs.length)return;const plugs=this._config.plugs.map((p,i)=>i===index?{...p,...patch}:p);this._update({plugs});}
  _field(label,content,help=''){return `<div class="sp-field"><label class="sp-label">${spEsc(label)}</label>${content}${help?`<p class="sp-help">${spEsc(help)}</p>`:''}</div>`;}
  _input(key,label,value,index='global',disabled=false){return this._field(label,`<input class="sp-input" data-index="${index}" data-key="${key}" type="text" maxlength="80" value="${spEsc(value)}" ${disabled?'disabled':''}/>`);}
  _select(key,label,value,options,help=''){return this._field(label,`<select class="sp-input" data-index="global" data-key="${key}">${options.map(([v,t])=>`<option value="${spEsc(v)}" ${v===value?'selected':''}>${spEsc(t)}</option>`).join('')}</select>`,help);}
  _check(key,label,help){return `<label class="sp-cbrow"><span><strong>${spEsc(label)}</strong><small>${spEsc(help)}</small></span><input type="checkbox" data-index="global" data-key="${key}" ${this._config[key]?'checked':''}/></label>`;}
  _selector(index,key,label,help=''){
    const c=index==='global'?this._config:this._config.plugs[Number(index)];const value=c?.[key]||'';
    return this._field(label,`<div class="sp-controlrow"><div class="sp-grow" data-slot="${index}:${key}"></div>${value?`<button type="button" class="sp-btn iconbtn" data-clear="${index}:${key}" title="${spEsc(this._t('remove'))}" aria-label="${spEsc(this._t('removeX',{x:label}))}">${spMdi('mdi:close')}</button>`:''}</div>`,help);
  }
  _plugs(){
    const c=this._config,t=(k,v)=>this._t(k,v);
    let content=`<div class="sp-heading">${spEsc(t('plugsH'))}</div><div class="sp-desc">${spEsc(t('plugsD'))}</div>`;
    if(c.plugs.length){
      content+=`<div class="sp-field"><label class="sp-label" for="sp-chosen">${spEsc(t('chosen'))}</label><select id="sp-chosen" class="sp-input" data-special="selected">${c.plugs.map((p,i)=>`<option value="${i}" ${i===this._selected?'selected':''}>${spEsc(p.name||p.entity||t('plugN',{n:i+1}))}</option>`).join('')}</select></div>`;
      const p=c.plugs[this._selected];
      if(p){content+=`<section class="sp-entry">${this._input('name',t('fName'),p.name,this._selected)}${this._input('room',t('fRoom'),p.room,this._selected)}${this._selector(this._selected,'entity',t('fEntity'),t('fEntityH'))}${this._selector(this._selected,'power_entity',t('fPower'),t('fPowerH'))}${this._selector(this._selected,'icon',t('fIcon'))}<div class="sp-controls"><button type="button" class="sp-btn iconbtn" data-move="-1" ${this._selected===0?'disabled':''} title="${spEsc(t('mvUp'))}">${spMdi('mdi:arrow-up')}</button><button type="button" class="sp-btn iconbtn" data-move="1" ${this._selected===c.plugs.length-1?'disabled':''} title="${spEsc(t('mvDown'))}">${spMdi('mdi:arrow-down')}</button><button type="button" class="sp-btn" data-delete="1">${spEsc(t('rmPlug'))}</button></div></section>`;}
    }
    content+=`<button type="button" class="sp-btn primary" data-add="1">${spEsc(t('add'))}</button>`;
    if(this._error)content+=`<div class="sp-error" role="alert">${spEsc(this._error)}</div>`;
    return content;
  }
  _appearance(){const c=this._config,t=(k,v)=>this._t(k,v);return `<div class="sp-heading">${spEsc(t('lookH'))}</div>`+
    this._check('show_eyebrow',t('ckEye'),t('ckEyeH'))+
    this._input('eyebrow',t('fEye'),c.eyebrow,'global',!c.show_eyebrow)+
    this._check('show_title',t('ckTitle'),t('ckTitleH'))+
    this._input('title',t('fTitle'),c.title==null?t('defTitle'):c.title,'global',!c.show_title)+
    this._select('theme_mode',t('fTheme'),c.theme_mode,[['auto',t('thAuto')],['light',t('thLight')],['dark',t('thDark')]])+
    this._select('layout',t('fLayout'),c.layout,[['grid',t('layGrid')],['list',t('layList')]])+
    this._check('show_power',t('ckPower'),t('ckPowerH'))+
    this._select('language',t('lang'),c.language,[['auto',t('langAuto')],...SP_LANGS],t('langH'));}
  _advanced(){const t=(k,v)=>this._t(k,v);return `<div class="sp-heading">${spEsc(t('advH'))}</div><div class="sp-desc">${spEsc(t('advD'))}</div>`+
    this._check('controls_enabled',t('ckCmd'),t('ckCmdH'))+
    `<div class="sp-tip">${spEsc(t('tip1'))}</div>`+
    `<div class="sp-tip">${spEsc(t('tip2'))}</div>`;}
  _render(){
    if(!this.isConnected)return;
    this._renderedLang=this._lang();
    const tabs=[['plugs',this._t('tPlugs')],['appearance',this._t('tLook')],['advanced',this._t('tAdv')]];
    this.shadowRoot.innerHTML=`<style>${SP_EDITOR_CSS}</style><div class="sp-editor"><nav class="sp-tabs" aria-label="${spEsc(this._t('secs'))}">${tabs.map(([id,label])=>`<button type="button" class="sp-tab ${this._tab===id?'active':''}" data-tab="${id}">${spEsc(label)}</button>`).join('')}</nav>${this._tab==='plugs'?this._plugs():this._tab==='appearance'?this._appearance():this._advanced()}</div>`;
    this._mountSelectors();
  }
  _nativeOptions(index,key){
    const entityKey=key==='entity'||key==='power_entity';
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
        for(const [id,labelKey] of SP_ICONS){const opt=document.createElement('option');opt.value=id;opt.textContent=`${this._t(labelKey)} (${id})`;select.appendChild(opt);}
        select.value=SP_ICONS.some(x=>x[0]===value)?value:SP_ICONS[0][0];
        select.addEventListener('change',()=>this._entityChanged(idx,key,select.value));slot.appendChild(select);
      }else{
        const select=document.createElement('select');select.className='sp-input';
        const blank=document.createElement('option');blank.value='';blank.textContent=this._t(key==='entity'?'selPlug':'noSensor');select.appendChild(blank);
        const options=Object.entries(this._hass?.states||{}).filter(([id,entity])=>{
          const domain=SP_DOMAINS[key]||'sensor';return id.startsWith(domain+'.')&&(!SP_CLASSES[key]||entity.attributes?.device_class===SP_CLASSES[key]);
        }).sort((a,b)=>a[0].localeCompare(b[0]));
        for(const [id,entity] of options){const opt=document.createElement('option');opt.value=id;opt.textContent=`${entity.attributes?.friendly_name||id} (${id})`;select.appendChild(opt);}
        // Unknown existing entity is kept visible until user changes it.
        if(value&&!options.some(([id])=>id===value)){const option=document.createElement('option');option.value=value;option.textContent=`${value} (${this._t('notFound')})`;select.appendChild(option);}
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
      this._error=this._t('errDup');this._render();return;
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
  if(!window.customCards.some(x=>x.type===SP_TAG))window.customCards.push({type:SP_TAG,name:'Smart Plugs Card',description:'Edera smart plugs card with ON/OFF controls, power readings and status.',preview:true});
}
export {spConfig,spPlug,spState,spCount,spReading};