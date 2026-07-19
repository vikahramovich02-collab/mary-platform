import { chromium } from 'playwright';
const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1600,height:950}});
try{
  await pg.goto('http://77.237.241.242:8080/',{waitUntil:'domcontentloaded',timeout:25000});
  await pg.waitForTimeout(3000);
  async function type(t){ const x=pg.locator('input').last(); await x.click(); await x.fill(t); await pg.keyboard.press('Enter'); }
  await type('старт'); await pg.waitForTimeout(2500);
  await type('салон красоты, клиенты пишут в директ, не успеваю отвечать'); await pg.waitForTimeout(20000);
  await type('и то и другое — цены и запись'); await pg.waitForTimeout(22000); // ждём предложение (фаза1)
  await type('да, собираем'); await pg.waitForTimeout(20000); // фаза2 + анимация
  await pg.screenshot({path:'/tmp/cmp/wfbuild.png'});
  console.log('собираю/собран:', await pg.locator('text=/Собираю отдел|собран/').count(), '| Понять запрос:', await pg.locator('text=Понять запрос').count(), '| НОВО:', await pg.locator('text=НОВО').count());
}catch(e){console.log('ERR',String(e).slice(0,120));}
await b.close();
