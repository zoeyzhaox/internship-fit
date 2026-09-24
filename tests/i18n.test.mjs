import test from 'node:test';
import assert from 'node:assert/strict';
import {getLanguage,setLanguage,tr,translateMessage} from '../public/i18n.mjs';
import {assess,DEFAULT_CONFIG} from '../public/engine.mjs';
import {DEMO_JOBS,DEMO_PROFILE} from '../public/fixtures.mjs';

test('English is the default and Chinese rewrites use natural navigation copy',()=>{
 assert.equal(getLanguage(),'en');assert.equal(tr('岗位工作台'),'Find internships');
 setLanguage('zh');assert.equal(tr('岗位工作台'),'找实习');assert.equal(tr('定制工具'),'个性化设置');
 setLanguage('invalid');assert.equal(getLanguage(),'en');
});
test('changing interface language preserves matching decisions and source evidence',()=>{
 setLanguage('en');const en=assess(DEMO_JOBS[2],DEMO_PROFILE,DEFAULT_CONFIG);
 setLanguage('zh');const zh=assess(DEMO_JOBS[2],DEMO_PROFILE,DEFAULT_CONFIG);
 assert.equal(en.score,zh.score);assert.equal(en.blocked,zh.blocked);
 assert.deepEqual(en.checks.map(x=>x.status),zh.checks.map(x=>x.status));
 assert.deepEqual(en.checks.map(x=>x.evidence),zh.checks.map(x=>x.evidence));
 assert.notEqual(en.checks[0].field,zh.checks[0].field);
 setLanguage('en');
});
test('server errors localize without rewriting unknown or user-authored text',()=>{
 setLanguage('en');const english=tr('个人档案格式错误。');
 setLanguage('zh');assert.equal(translateMessage(english),tr('个人档案格式错误。'));
 assert.equal(translateMessage('我的项目 / My project'),'我的项目 / My project');setLanguage('en');
});
