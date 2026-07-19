import { chromium } from 'playwright';
const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1680,height:950}});
const errs=[]; pg.on('pageerror',e=>errs.push(String(e).slice(0,140)));
try{
  await pg.goto('http://77.237.241.242:8080/',{waitUntil:'domcontentloaded',timeout:25000});
  await pg.waitForTimeout(3000);
  async function type(t){ const x=pg.locator('input').last(); await x.click(); await x.fill(t); await pg.keyboard.press('Enter'); }
  await type('старт'); await pg.waitForTimeout(2500);
  await type('салон, клиенты в директе, не успеваю'); await pg.waitForTimeout(20000);
  await type('и то и другое'); await pg.waitForTimeout(22000);
  await type('да собираем'); await pg.waitForTimeout(22000); // LLM + первые шаги билда до паузы
  await pg.screenshot({path:'/tmp/cmp/step.png'});
  console.log('Начинаю собирать:', await pg.locator('text=/Начинаю собирать/').count(), '| пауза интеграции:', await pg.locator('text=/Подключим сейчас или позже/').count(), '| errs:', errs.join('|')||'none');
}catch(e){console.log('ERR',String(e).slice(0,120),'| errs:',errs.join('|'));}
await b.close();
