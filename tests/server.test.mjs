import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp,sourceJobs,validateAIInput,validateSuggestions} from '../server.mjs';

test('Greenhouse adapter preserves posting evidence and does not infer eligibility',async()=>{
  const jobs=await sourceJobs('greenhouse','example',async url=>{assert.match(url,/boards-api.greenhouse.io/);return {ok:true,json:async()=>({jobs:[{id:1,title:'Data Intern',content:'<p>Python preferred</p>',absolute_url:'https://example.com/job',location:{name:'Remote'}}]})};});
  assert.equal(jobs[0].undergraduate,'unknown');assert.equal(jobs[0].verified,false);assert.deepEqual(jobs[0].skills,['Python']);assert.match(jobs[0].description,/Python preferred/);
});
test('source URL cannot point at user-supplied hosts',async()=>{
  await assert.rejects(()=>sourceJobs('lever','https://internal.invalid'));await assert.rejects(()=>sourceJobs('other','company'));
});
test('Lever adapter fetches all pages before returning',async()=>{
  let calls=0;const jobs=await sourceJobs('lever','example',async()=>({ok:true,json:async()=>{calls++;return calls===1?Array.from({length:100},(_,i)=>({id:i+1,text:'Intern',descriptionPlain:'SQL'})):[{id:101,text:'Intern',descriptionPlain:'Excel'}];}}));
  assert.equal(calls,2);assert.equal(jobs.length,101);
});
test('AI strips contact fields, rejects new metrics and unknown experience IDs',()=>{
  const input=validateAIInput({job:{title:'Intern',description:'test'},email:'private',experiences:[{id:'e',title:'Project',description:'Reviewed 5 sources.',email:'private'}]});
  assert.equal(input.email,undefined);assert.equal(input.experiences[0].email,undefined);
  assert.throws(()=>validateSuggestions({suggestions:[{experienceId:'e',description:'Reviewed 50 sources.',reason:'test'}]},input.experiences));
  assert.throws(()=>validateSuggestions({suggestions:[{experienceId:'missing',description:'Reviewed sources.',reason:'test'}]},input.experiences));
});
test('server serves app, never serves env files, and blocks cross-origin API access',async()=>{
  const server=createApp({env:{}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{const base='http://127.0.0.1:'+server.address().port;
    assert.equal((await fetch(base+'/')).status,200);
    assert.equal((await fetch(base+'/.env')).status,404);
    assert.equal((await fetch(base+'/server.mjs')).status,404);
    assert.equal((await fetch(base+'/api/health',{headers:{Origin:'https://evil.example'}})).status,403);
    assert.deepEqual(await (await fetch(base+'/api/health')).json(),{service:'internship-fit',ai:false});
    assert.equal((await fetch(base+'/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,503);
  }finally{await new Promise(r=>server.close(r));}
});
test('configured AI endpoint uses server credentials and returns validated suggestions',async()=>{
  let calls=0;const server=createApp({env:{AI_BASE_URL:'https://model.example/v1',AI_MODEL:'custom',AI_API_KEY:'test-only'},fetcher:async(url,opts)=>{calls++;assert.equal(url,'https://model.example/v1/chat/completions');assert.equal(opts.headers.Authorization,'Bearer test-only');return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({suggestions:[{experienceId:'e',description:'Reviewed sources.',reason:'Relevant research experience.'}]})}}]})};}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{const res=await fetch('http://127.0.0.1:'+server.address().port+'/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job:{title:'Research Intern',description:'Research'},experiences:[{id:'e',title:'Project',description:'Reviewed sources.'}]})});assert.equal(res.status,200);assert.equal((await res.json()).suggestions[0].experienceId,'e');assert.equal(calls,1);}finally{await new Promise(r=>server.close(r));}
});
