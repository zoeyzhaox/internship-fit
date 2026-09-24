import {tr} from './i18n.mjs';
export const SKILLS = ['Python','SQL','Excel','R','JavaScript','TypeScript','React','Figma','Tableau','Power BI','Statistics','Research','Writing','Communication','Project management'];
export const DEFAULT_CONFIG = {
  version:1, name:'Internship Fit', accent:'#2b54ed', target:tr("第一次找实习的本科生"),
  weights:{skills:55,interests:30,location:15}, paidOnly:false,remoteOnly:false,hideBlocked:false,strictUnknown:false,
  preferredLocation:'', interests:'', template:'classic', sections:['education','experience','skills'],
  sources:[], prompt:'Select the most relevant real experiences. Explain relevance with exact job evidence. Never invent skills, numbers, achievements or qualifications.'
};
export const EMPTY_PROFILE={name:'',email:'',phone:'',links:'',school:'',major:'',graduation:'',skills:'',location:'',availability:'',experiences:[]};
export const splitSkills=s=>String(s||'').split(/[,，;；\n]/).map(x=>x.trim()).filter(Boolean);
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function containsSkill(text,skill){
  const t=String(text||'').toLowerCase(), k=String(skill||'').toLowerCase().trim();
  if(!k)return false;
  if(/^[a-z0-9 +.#-]+$/.test(k)){const esc=k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^a-z0-9])'+esc+'(?=$|[^a-z0-9])','i').test(t);}
  return t.includes(k);
}
export function draftJob(text){
  return {title:'',company:'',description:text,url:'',location:'',remote:'unknown',paid:'unknown',status:'unknown',
    skills:SKILLS.filter(s=>containsSkill(text,s)),requiredSkills:[],majorTerms:'',gradMin:'',gradMax:'',
    undergraduate:'unknown',workAuthNote:'',evidence:'',verified:false,source:'manual',demo:false};
}
export function validateConfig(raw){
  if(!raw||typeof raw!=='object'||raw.version!==1)throw Error(tr("配置版本应为 1。"));
  const c=structuredClone(DEFAULT_CONFIG);
  for(const k of ['name','target','preferredLocation','interests','prompt']) if(raw[k]!==undefined){if(typeof raw[k]!=='string'||raw[k].length>4000)throw Error(tr("配置文字无效：")+k);c[k]=raw[k];}
  if(raw.accent!==undefined){if(!/^#[0-9a-f]{6}$/i.test(raw.accent))throw Error(tr("主题色应为六位十六进制颜色。"));c.accent=raw.accent;}
  for(const k of ['paidOnly','remoteOnly','hideBlocked','strictUnknown'])if(raw[k]!==undefined){if(typeof raw[k]!=='boolean')throw Error(tr("筛选条件格式错误。"));c[k]=raw[k];}
  if(raw.weights){for(const k of ['skills','interests','location']){const n=Number(raw.weights[k]);if(!Number.isFinite(n)||n<0||n>100)throw Error(tr("权重必须在 0–100 之间。"));c.weights[k]=n;}if(Object.values(c.weights).every(n=>n===0))throw Error(tr("至少设置一个大于 0 的权重。"));}
  if(raw.template!==undefined){if(!['classic','compact'].includes(raw.template))throw Error(tr("未知简历模板。"));c.template=raw.template;}
  if(raw.sections!==undefined){if(!Array.isArray(raw.sections)||raw.sections.length!==3||new Set(raw.sections).size!==3||raw.sections.some(s=>!['education','experience','skills'].includes(s)))throw Error(tr("简历栏目必须包含教育、经历、技能，且不重复。"));c.sections=[...raw.sections];}
  if(raw.sources!==undefined){if(!Array.isArray(raw.sources)||raw.sources.length>20)throw Error(tr("最多配置 20 个岗位来源。"));c.sources=raw.sources.map(s=>{if(!['greenhouse','lever'].includes(s.type)||!/^[a-zA-Z0-9_-]{1,80}$/.test(s.board))throw Error(tr("岗位来源类型或公司标识无效。"));return {type:s.type,board:s.board,label:String(s.label||s.board).slice(0,100)};});}
  return c;
}
export function assess(job,p,c){
  const checks=[];
  const add=(field,status,detail,evidence='')=>checks.push({field,status,detail,evidence});
  const confirmed=job.verified===true;
  if(!confirmed)add(tr("岗位条件"),'unknown',tr("导入内容尚未由你核对，结构化条件不作硬性结论。"));
  add(tr("本科资格"),confirmed&&job.undergraduate==='yes'?'pass':confirmed&&job.undergraduate==='no'?'fail':'unknown',confirmed&&job.undergraduate==='yes'?tr("你确认岗位接受本科生"):confirmed&&job.undergraduate==='no'?tr("你确认岗位不接受本科生"):tr("未确认是否接受本科生"),job.evidence);
  if(confirmed&&(job.gradMin||job.gradMax)){
    const year=Number(String(p.graduation).slice(0,4));
    add(tr("毕业年份"),!year?'unknown':((job.gradMin&&year<Number(job.gradMin))||(job.gradMax&&year>Number(job.gradMax)))?'fail':'pass',!year?tr("请补充预计毕业年份"):`${tr("你的年份：")}${year}${tr("；岗位范围：")}${job.gradMin||tr("不限下限")}–${job.gradMax||tr("不限上限")}`,job.evidence);
  }else add(tr("毕业年份"),'unknown',tr("未确认毕业年份限制"));
  const majors=splitSkills(job.majorTerms);
  if(confirmed&&majors.length)add(tr("专业"),!p.major?'unknown':majors.some(m=>String(p.major).toLowerCase().includes(m.toLowerCase()))?'pass':'unknown',tr("关键词匹配只供参考；未匹配到不代表不具资格。"),job.evidence);
  else add(tr("专业"),'unknown',tr("未确认专业限制"));
  const profileSkills=splitSkills(p.skills);
  const missing=(job.requiredSkills||[]).filter(s=>!profileSkills.some(x=>x.toLowerCase()===s.toLowerCase()));
  if(confirmed&&job.requiredSkills?.length)add(tr("必需技能"),missing.length?'gap':'pass',missing.length?tr("个人档案尚未列出：")+missing.join(', '):tr("档案包含所有已确认的必需技能"),job.evidence);
  else add(tr("必需技能"),'unknown',tr("未确认哪些技能为必需条件"));
  add(tr("工作授权"),'unknown',job.workAuthNote||tr("岗位未说明或尚未核对，需向招聘方确认"),job.workAuthNote);
  add(tr("时间安排"),'unknown',p.availability?`${tr("你的可工作时间：")}${p.availability}${tr("；请与岗位时间逐项核对")}`:tr("请补充可工作时间并核对岗位安排"));
  if(job.status==='closed')add(tr("招聘状态"),'fail',tr("此岗位已标记为关闭"));
  else add(tr("招聘状态"),job.demo?'unknown':job.source==='manual'?'unknown':'pass',job.demo?tr("虚构教学案例，不是在招岗位"):job.source==='manual'?tr("手动导入，不保证仍在招聘"):`${tr("公开岗位接口曾返回此岗位（")}${job.checkedAt?.slice(0,10)||tr("时间未知")}${tr("）；投递前仍需核对")}`);
  const matched=(job.skills||[]).filter(s=>profileSkills.some(x=>x.toLowerCase()===s.toLowerCase()));
  const allText=[job.title,job.description].join(' ');
  const interests=splitSkills(c.interests);
  const interestHits=interests.filter(s=>containsSkill(allText,s));
  const locationKnown=Boolean(job.location&&c.preferredLocation);
  const factors={skills:(job.skills||[]).length?matched.length/job.skills.length:null,interests:interests.length?interestHits.length/interests.length:null,location:locationKnown?(job.location.toLowerCase().includes(c.preferredLocation.toLowerCase())?1:0):null};
  let total=0,weight=0;
  for(const k of Object.keys(factors))if(factors[k]!==null){weight+=c.weights[k];total+=factors[k]*c.weights[k];}
  const reasons=[];
  if(c.paidOnly&&job.paid==='no')reasons.push(tr("不符合带薪偏好"));
  if(c.remoteOnly&&job.remote==='no')reasons.push(tr("不符合远程偏好"));
  if(c.strictUnknown&&((c.paidOnly&&job.paid==='unknown')||(c.remoteOnly&&job.remote==='unknown')))reasons.push(tr("未确认筛选条件"));
  const blocked=checks.some(x=>x.status==='fail');
  if(c.hideBlocked&&blocked)reasons.push(tr("存在硬性冲突"));
  return {checks,blocked,matched,missing,interestHits,factors,score:weight?Math.round(total/weight*100):null,excluded:reasons.length>0,reasons,unknown:checks.filter(x=>x.status==='unknown').length};
}
export function relevantExperiences(job,p){return [...p.experiences].map(e=>({...e,relevance:(job.skills||[]).filter(s=>containsSkill([e.title,e.description,e.skills].join(' '),s)).length})).sort((a,b)=>b.relevance-a.relevance);}
export function resumeHTML(p,exps,c){
  const esc=escapeHTML;
  const blocks={education:`<section><h2>Education</h2><div class="line"><b>${esc(p.school)}</b><span>${esc(p.graduation)}</span></div><p>${esc(p.major)}</p></section>`,experience:`<section><h2>Experience & Projects</h2>${exps.map(e=>`<article><div class="line"><b>${esc(e.title)}</b><span>${esc(e.dates)}</span></div>${e.organization?`<p>${esc(e.organization)}</p>`:''}<ul>${String(e.description||'').split('\n').filter(Boolean).map(s=>`<li>${esc(s.replace(/^[-•]\s*/,''))}</li>`).join('')}</ul></article>`).join('')}</section>`,skills:`<section><h2>Skills</h2><p>${esc(p.skills)}</p></section>`};
  return `<div class="resume-sheet ${c.template}"><h1>${esc(p.name||'Your name')}</h1><p class="contact">${[p.email,p.phone,p.links].filter(Boolean).map(esc).join(' · ')}</p>${c.sections.map(k=>blocks[k]).join('')}</div>`;
}
export function normalizeJob(raw){
  if(!raw||typeof raw!=='object'||typeof raw.title!=='string'||!raw.title.trim()||typeof raw.description!=='string')throw Error(tr("岗位需要 title 和 description 文字字段。"));
  const j=draftJob(raw.description.slice(0,30000));
  for(const k of ['title','company','location','majorTerms','workAuthNote','evidence'])if(raw[k]!==undefined)j[k]=String(raw[k]).slice(0,10000);
  j.id=typeof raw.id==='string'?raw.id.slice(0,150):crypto.randomUUID();
  if(!j.id||[tr("__proto__"),tr("constructor"),'prototype'].includes(j.id))throw Error(tr("岗位 ID 无效。"));
  j.url=safeURL(raw.url);j.verified=raw.verified===true;j.demo=raw.demo===true;
  for(const k of ['paid','remote','undergraduate'])if(['yes','no','unknown'].includes(raw[k]))j[k]=raw[k];
  for(const k of ['gradMin','gradMax'])if(raw[k]!==undefined&&raw[k]!==''){if(!/^20\d{2}$/.test(String(raw[k])))throw Error(tr("毕业年份应为 2000–2099。"));j[k]=String(raw[k]);}
  if(j.gradMin&&j.gradMax&&Number(j.gradMin)>Number(j.gradMax))throw Error(tr("毕业年份下限不能大于上限。"));
  for(const k of ['skills','requiredSkills'])if(raw[k]!==undefined){if(!Array.isArray(raw[k])||raw[k].some(x=>typeof x!=='string'))throw Error(tr("技能必须是文字数组。"));j[k]=raw[k].slice(0,60).map(s=>s.slice(0,100));}
  j.source=typeof raw.source==='string'?raw.source.slice(0,100):'manual';j.status=raw.status==='closed'?'closed':'unknown';j.checkedAt=typeof raw.checkedAt==='string'?raw.checkedAt:'';
  return j;
}
export function normalizeProfile(raw){
  if(!raw||typeof raw!=='object')throw Error(tr("个人档案格式错误。"));
  const p=structuredClone(EMPTY_PROFILE);
  for(const k of Object.keys(p).filter(k=>k!=='experiences')){if(raw[k]!==undefined&&typeof raw[k]!=='string')throw Error(tr("个人档案字段必须是文字。"));p[k]=(raw[k]||'').slice(0,5000);}
  if(!Array.isArray(raw.experiences)||raw.experiences.length>100)throw Error(tr("经历列表格式错误或超过 100 条。"));
  p.experiences=raw.experiences.map(e=>{if(!e||typeof e!=='object')throw Error(tr("经历格式错误。"));const o={};for(const k of ['id','title','organization','dates','description','skills'])o[k]=String(e[k]||'').slice(0,10000);if(!o.id)o.id=crypto.randomUUID();return o;});
  if(new Set(p.experiences.map(e=>e.id)).size!==p.experiences.length)throw Error(tr("经历 ID 重复。"));
  return p;
}
