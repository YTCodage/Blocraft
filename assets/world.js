(() => {
  'use strict';
  const canvas = document.getElementById('voxel-world');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = {grass:['#89ad55','#655338','#473b2a'], dirt:['#786043','#665039','#4c3e2e'], stone:['#818776','#60695c','#424f45'], leaf:['#638c43','#456b32','#304d2a'], leafLight:['#7d9e4e','#587b37','#3c5b2f'], wood:['#9a774b','#795733','#5e452c'], sand:['#d7c18a','#ac9769','#8f7c56'], water:['#659b9b','#3f7478','#325d65'], obsidian:['#61536e','#3c354a','#282937'], portal:['#d2a3f3','#a775cf','#79579f'], crystal:['#bd9bcf','#9278ab','#695b86']};
  let blocks=[], width=600,height=480, yaw=0;
  const noise=(x,z)=>{const n=Math.sin(x*173.3+z*91.7)*43758.5453;return n-Math.floor(n);};
  const add=(x,z,y,type)=>blocks.push({x,z,y,type});
  // Voxel sculpture, deterministic and rendered locally without external assets.
  for(let x=-6;x<=6;x++)for(let z=-5;z<=5;z++){
    const r=(x*x/44+z*z/34);
    if(r>1.04+noise(x,z)*.15)continue;
    const top=(x<-1&&z<2?1:0)+(x<-3&&z<-1?1:0);
    const depth=Math.max(1,Math.floor((1-r)*4+noise(x,z)*2));
    for(let y=-depth;y<=top;y++)add(x,z,y,y===top?(x>2&&z>0?'sand':x>1&&z<1?'water':'grass'):y<-2?'stone':'dirt');
  }
  const tree=(x,z,y,tall)=>{
    for(let h=1;h<=tall;h++)add(x,z,y+h,'wood');
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
      add(x+dx,z+dz,y+tall,noise(dx+x,dz+z)>.5?'leaf':'leafLight');
      if(Math.abs(dx)+Math.abs(dz)<2)add(x+dx,z+dz,y+tall+1,'leafLight');
    }
    add(x,z,y+tall+2,'leafLight');
  };
  tree(-4,-2,2,3);tree(-1,-3,1,3);tree(-4,2,1,2);tree(1,-2,0,2);
  // Ancient illuminated portal on the island's far edge.
  for(let x=1;x<=4;x++){add(x,-4,1,'obsidian');add(x,-4,5,'obsidian');}
  for(let y=2;y<=4;y++){add(1,-4,y,'obsidian');add(4,-4,y,'obsidian');add(2,-4,y,'portal');add(3,-4,y,'portal');}
  [[5,1,-3],[4,3,-5],[-6,3,-3]].forEach(([x,z,y])=>{add(x,z,y,'stone');add(x,z,y+1,'grass');});
  blocks.sort((a,b)=>(a.x+a.z)-(b.x+b.z)||a.y-b.y);
  const polygon=(points,color)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
  function draw(){
    const dpr=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.scale(dpr,dpr);
    const s=Math.min(width/22,height/18.5), hh=s*.49, vy=s*.97;
    const project=(x,z,y)=>[width*.5+(x-z)*s+ yaw,height*.57+(x+z)*hh-y*vy];
    ctx.save();ctx.translate(width*.5,height*.86);ctx.scale(1,.24);const shadow=ctx.createRadialGradient(0,0,0,0,0,width*.38);shadow.addColorStop(0,'#00000065');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(-width/2,-width/2,width,width);ctx.restore();
    blocks.forEach(b=>{
      const [x,y]=project(b.x,b.z,b.y),c=colors[b.type];
      polygon([[x,y],[x+s,y+hh],[x,y+hh*2],[x-s,y+hh]],c[0]);
      polygon([[x-s,y+hh],[x,y+hh*2],[x,y+hh*2+vy],[x-s,y+hh+vy]],c[1]);
      polygon([[x,y+hh*2],[x+s,y+hh],[x+s,y+hh+vy],[x,y+hh*2+vy]],c[2]);
      if(b.type==='grass'){
        polygon([[x-s,y+hh],[x,y+hh*2],[x,y+hh*2+vy*.22],[x-s,y+hh+vy*.22]],'#638c44');
        polygon([[x,y+hh*2],[x+s,y+hh],[x+s,y+hh+vy*.22],[x,y+hh*2+vy*.22]],'#4c723a');
        if(noise(b.x,b.z)>.65){ctx.fillStyle='#bbcc79';ctx.fillRect(x-s*.3,y+hh*.7,s*.17,s*.08);}
      }
      if(b.type==='portal'){
        ctx.save();ctx.shadowColor='#c392ec';ctx.shadowBlur=15;ctx.fillStyle='#debbf8';ctx.fillRect(x+s*.25,y+hh+vy*.2,2,3);ctx.restore();
      }
      if(b.type==='water'){ctx.strokeStyle='#a3c3b9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-s*.3,y+hh);ctx.lineTo(x+s*.3,y+hh*.7);ctx.stroke();}
    });
    // Tiny light motes around the portal.
    for(let i=0;i<12;i++){const [x,y]=project(2+noise(i,3)*3,-4+noise(i,8)*2,2+noise(i,5)*4);ctx.fillStyle='#d0a9e7';ctx.globalAlpha=.3+noise(i,9)*.6;ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;draw();});}
  new ResizeObserver(schedule).observe(canvas);
  if(!reduced&&matchMedia('(pointer:fine)').matches){canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();yaw=((e.clientX-r.left)/r.width-.5)*12;schedule();});canvas.addEventListener('pointerleave',()=>{yaw=0;schedule();});}
  draw();
})();
