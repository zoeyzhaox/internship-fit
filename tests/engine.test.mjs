import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,DEFAULT_CONFIG,containsSkill,draftJob,normalizeJob,normalizeProfile,validateConfig,resumeHTML,safeURL} from '../public/engine.mjs';
import {DEMO_JOBS,DEMO_PROFILE} from '../public/fixtures.mjs';

test('unknown qualifications never become passes; unverified fields do not block',()=>{
  const j={...DEMO_JOBS[2],verified:false};const a=assess(j,DEMO_PROFILE,DEFAULT_CONFIG);
  assert.equal(a.blocked,false);assert.equal(a.checks.find(x=>x.field==='Graduation year').status,'unknown');
  assert.equal(a.checks.find(x=>x.field==='Work authorization').status,'unknown');
});
test('confirmed graduation conflict stays blocked despite a perfect skill match',()=>{
  const a=assess(DEMO_JOBS[2],{...DEMO_PROFILE,skills:'Figma, Communication'},DEFAULT_CONFIG);
  assert.equal(a.blocked,true);assert.equal(a.score,100);
  assert.equal(assess(DEMO_JOBS[2],DEMO_PROFILE,{...DEFAULT_CONFIG,hideBlocked:true}).excluded,true);
});
test('filters retain unknown by default and strict mode removes it',()=>{
  const c={...DEFAULT_CONFIG,paidOnly:true};assert.equal(assess(DEMO_JOBS[3],DEMO_PROFILE,c).excluded,false);
  assert.equal(assess(DEMO_JOBS[3],DEMO_PROFILE,{...c,strictUnknown:true}).excluded,true);
});
test('skills use token boundaries instead of matching R everywhere',()=>{
  assert.equal(containsSkill('research internship','R'),false);assert.equal(containsSkill('R, Python','R'),true);
  assert.equal(containsSkill('React','R'),false);assert.equal(containsSkill('JavaScript','Java'),false);
});
test('changing priorities changes ordering without altering evidence',()=>{
  const c={...DEFAULT_CONFIG,interests:'policy',weights:{skills:0,interests:100,location:0}};
  assert.ok(assess(DEMO_JOBS[1],DEMO_PROFILE,c).score>assess(DEMO_JOBS[0],DEMO_PROFILE,c).score);
});
test('empty scoring inputs produce null, not a fake score',()=>{
  assert.equal(assess({...DEMO_JOBS[0],skills:[]},DEMO_PROFILE,DEFAULT_CONFIG).score,null);
});
test('resume escapes untrusted content and preserves original experience facts',()=>{
  const html=resumeHTML({...DEMO_PROFILE,name:'<script>alert(1)</script>'},DEMO_PROFILE.experiences.slice(0,1),DEFAULT_CONFIG);
  assert.ok(!html.includes('<script>'));assert.ok(html.includes('Cleaned and visualized'));assert.ok(!html.includes('increased revenue'));
});
test('config rejects zero weights, duplicates, unsafe colors, unknown sources',()=>{
  assert.throws(()=>validateConfig({...DEFAULT_CONFIG,weights:{skills:0,interests:0,location:0}}));
  assert.throws(()=>validateConfig({...DEFAULT_CONFIG,sections:['skills','skills','education']}));
  assert.throws(()=>validateConfig({...DEFAULT_CONFIG,accent:'red;display:none'}));
  assert.throws(()=>validateConfig({...DEFAULT_CONFIG,sources:[{type:'lever',board:'../../secret'}]}));
});
test('job import rejects invalid years and invalid skill types',()=>{
  assert.throws(()=>normalizeJob({title:'Intern',description:'test',gradMin:'2029',gradMax:'2027'}));
  assert.throws(()=>normalizeJob({title:'Intern',description:'test',skills:'Python'}));
  assert.equal(safeURL('javascript:alert(1)'), '');assert.equal(draftJob('Use SQL and Python').verified,false);
});
test('profile ignores unrecognized fields and validates experience list',()=>{
  assert.equal(normalizeProfile({...DEMO_PROFILE,gender:'x'}).gender,undefined);
  assert.throws(()=>normalizeProfile({...DEMO_PROFILE,experiences:'not an array'}));
});
