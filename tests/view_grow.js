const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const r = await p.evaluate(() => {
    SETTINGS.dist = 0; View.radius = 10; View.growAt = 0;
    const steps = [];
    // simule 40 mesures à 60 fps
    for (let i = 0; i < 40; i++) { View.adapt(60); View.growAt = 0; steps.push(View.radius); }
    const fast = { radius: View.radius, draw: View.draw };
    // machine qui rame
    View.adapt(20); const slow = View.radius;
    // retour à une portée classique
    SETTINGS.dist = 6;
    return { fast, slow, normal: { draw: View.draw, infinite: View.infinite } };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
