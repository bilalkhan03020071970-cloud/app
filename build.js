const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<script src="coi-serviceworker.js"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>CR-Remover - Bypass YouTube and Facebook Copyright Remover Instantly</title>
<meta name="description" content="Stop Copyright Blocks. CR-Remover uses AI DNA Scrubbing to bypass Content ID and Rights Manager scanners.">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:hidden}
body{font-family:Outfit,sans-serif;background:#000;color:#fff;line-height:1.6;overflow-x:hidden;min-height:100vh;background-image:radial-gradient(ellipse 80% 40% at 50% 0%,rgba(0,229,255,.06) 0%,transparent 60%),radial-gradient(ellipse 50% 30% at 80% 20%,rgba(131,56,236,.06) 0%,transparent 50%)}
a{text-decoration:none;color:inherit}ul{list-style:none}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#080808}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:3px}
nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:66px;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08)}
.logo{font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,#00e5ff,#8338ec);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{color:#aaa;font-size:.95rem;font-weight:500;transition:.2s}
.nav-links a:hover{color:#fff}
.nav-actions{display:flex;align-items:center;gap:.75rem}
.btn-login{padding:.45rem 1.1rem;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;border:1px solid rgba(0,229,255,.3);background:transparent;color:#00e5ff;font-family:Outfit,sans-serif}
.btn-free{padding:.45rem 1.2rem;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#00e5ff,#8338ec);color:#000;font-family:Outfit,sans-serif}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:5px}
.hamburger span{display:block;width:24px;height:2px;background:#fff;border-radius:2px;transition:.3s}
.hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:100px 5% 60px;text-align:center;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 40%,rgba(0,229,255,.05) 0%,transparent 70%);pointer-events:none}
.hero-content{max-width:920px;width:100%}
.badge{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;border-radius:999px;margin-bottom:1.5rem;border:1px solid rgba(0,229,255,.2);background:rgba(0,229,255,.05);font-size:.85rem;color:#00e5ff;font-weight:600}
.hero h1{font-size:clamp(2.2rem,5vw,3.8rem);font-weight:900;line-height:1.15;margin-bottom:1.2rem;letter-spacing:-1px}
.gt{background:linear-gradient(135deg,#00e5ff,#8338ec);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:clamp(1rem,2vw,1.15rem);color:#aaa;max-width:640px;margin:0 auto 2.5rem}

.tool-box{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:880px;margin:0 auto;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:1.5rem}
.upload-card{display:flex;flex-direction:column;gap:.75rem}
.drop-area{border:2px dashed rgba(0,229,255,.25);border-radius:14px;padding:2rem 1.5rem;cursor:pointer;text-align:center;transition:.3s;background:rgba(0,229,255,.02);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;min-height:160px}
.drop-area:hover,.drop-area.drag-over{border-color:#00e5ff;background:rgba(0,229,255,.05);box-shadow:0 0 20px rgba(0,229,255,.1)}
.drop-icon{font-size:2.5rem;margin-bottom:.3rem}
.drop-area p{color:#aaa;font-size:.95rem}
.drop-area p span{color:#00e5ff;font-weight:600}

.selected-card{display:none;background:rgba(0,0,0,.6);border:1px solid rgba(0,229,255,.2);border-radius:14px;overflow:hidden;padding:1rem}
.thumb-container{position:relative;width:100%;height:160px;border-radius:10px;overflow:hidden;background:#050505;display:flex;align-items:center;justify-content:center}
.thumb-img{width:100%;height:100%;object-fit:cover}
.thumb-dur{position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.85);color:#00e5ff;font-size:.75rem;font-weight:700;padding:.2rem .5rem;border-radius:4px}
.sel-meta{margin-top:.75rem;text-align:left}
.sel-title{font-weight:700;font-size:.9rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sel-tags{display:flex;gap:.5rem;margin-top:.3rem;flex-wrap:wrap}
.sel-tag{font-size:.75rem;background:rgba(255,255,255,.06);padding:.15rem .5rem;border-radius:4px;color:#aaa}
.sel-change{font-size:.8rem;color:#00e5ff;cursor:pointer;margin-top:.5rem;display:inline-block;text-decoration:underline}

.btn-process{display:block;width:100%;padding:.9rem;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#00e5ff,#8338ec);color:#000;font-family:Outfit,sans-serif;transition:.3s}
.btn-process:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,229,255,.35)}
.btn-process:disabled{opacity:.5;cursor:not-allowed}

.result-box{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:220px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.4);overflow:hidden;padding:1rem;position:relative}
#vp{width:100%;max-height:260px;object-fit:contain;border-radius:10px;display:none;background:#000}
.empty-r{text-align:center;padding:2rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.75rem}
.empty-r .ic{font-size:3rem;opacity:.25}
.empty-r p{color:#555;font-size:.9rem}

#loader{display:none;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;padding:1.5rem;width:100%}
.spin-wrap{position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center}
.spin{width:60px;height:60px;border-radius:50%;border:3px solid rgba(0,229,255,.15);border-top-color:#00e5ff;animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.spin-icon{position:absolute;font-size:1.2rem}
#mst{font-size:1.05rem;font-weight:700;color:#fff}
#stt{font-size:.82rem;color:#00e5ff;text-align:center}
.pw{width:100%;background:rgba(255,255,255,.08);border-radius:999px;height:8px;overflow:hidden;margin:.5rem 0}
#pb{height:100%;width:0%;border-radius:999px;transition:width .25s ease-out;background:linear-gradient(90deg,#00e5ff,#8338ec,#2ed573)}
.pt-box{display:flex;justify-content:space-between;width:100%;font-size:.85rem}
#pt{font-size:1.1rem;color:#00e5ff;font-weight:800}
.pt-lbl{color:#aaa;font-size:.8rem}

#dl-area{display:none;flex-direction:column;align-items:center;gap:.75rem;padding:1rem 0;width:100%}
.dl-btn{display:block;width:100%;padding:.9rem;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#2ed573,#00e5ff);color:#000;font-family:Outfit,sans-serif;text-align:center;transition:.3s}
.dl-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(46,213,115,.35)}
.dl-hint{font-size:.8rem;color:#2ed573}

.log-box{max-width:880px;margin:1.25rem auto 0;background:#050505;border:1px solid rgba(0,229,255,.15);border-radius:12px;overflow:hidden;display:none}
.log-hd{padding:.5rem 1rem;background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,.05);font-size:.75rem;color:#aaa;font-family:monospace;display:flex;align-items:center;gap:.4rem}
.ld{width:10px;height:10px;border-radius:50%}
.log-out{padding:.75rem 1rem;max-height:160px;overflow-y:auto;font-family:monospace;font-size:.78rem;line-height:1.8;text-align:left}
.ll{color:#888}.ll.s{color:#00e5ff}.ll.e{color:#ff4757}.ll.i{color:#2ed573}

.sp-box{max-width:880px;margin:1.25rem auto 0;display:none;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.25rem}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.sb{text-align:center}.sv{font-size:1.4rem;font-weight:800;color:#00e5ff}.sl{font-size:.75rem;color:#aaa;margin-top:.2rem}
.tr{margin-top:1rem;display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center}
.tc{padding:.2rem .6rem;border-radius:999px;font-size:.75rem;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);color:#00e5ff}

.sec{padding:5rem 5%}
.sec-t{text-align:center;font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:.75rem}
.sec-s{text-align:center;color:#aaa;font-size:1rem;margin-bottom:3rem}
.works{background:#050505;border-top:1px solid rgba(255,255,255,.05)}
.s3g{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;max-width:900px;margin:0 auto}
.sc{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:2rem;text-align:center;transition:.3s}
.sc:hover{border-color:rgba(0,229,255,.3);transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,229,255,.1)}
.sci{font-size:2.5rem;margin-bottom:1rem}
.sc h3{font-size:1.1rem;font-weight:700;margin-bottom:.75rem;color:#00e5ff}
.sc p{color:#aaa;font-size:.9rem;line-height:1.6}

.pricing-sec{background:#080808;border-top:1px solid rgba(255,255,255,.05)}
.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;max-width:1100px;margin:0 auto}
.pc{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:2rem 1.5rem;display:flex;flex-direction:column;gap:.5rem;position:relative;transition:.3s}
.pc:hover{border-color:rgba(0,229,255,.2);transform:translateY(-4px)}
.pc.feat{border-color:#00e5ff;background:linear-gradient(160deg,rgba(0,229,255,.05),#111);box-shadow:0 0 40px rgba(0,229,255,.1)}
.pop{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00e5ff,#8338ec);color:#000;font-size:.7rem;font-weight:800;padding:.3rem .9rem;border-radius:999px;white-space:nowrap}
.pc h3{font-size:1.1rem;font-weight:700;color:#aaa}
.pr{font-size:2rem;font-weight:900;color:#fff;margin:.25rem 0}
.pp{font-size:.8rem;color:#555;margin-bottom:.75rem}
.fl{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.25rem;flex:1}
.fl li{font-size:.85rem;color:#aaa}
.pbtn{display:block;width:100%;padding:.75rem;border-radius:10px;font-size:.95rem;font-weight:700;cursor:pointer;border:1px solid rgba(0,229,255,.3);background:transparent;color:#00e5ff;font-family:Outfit,sans-serif;transition:.3s}
.pc.feat .pbtn{background:linear-gradient(135deg,#00e5ff,#8338ec);color:#000;border:none}
.pbtn:hover{background:rgba(0,229,255,.1)}

.faq-sec{background:#050505;border-top:1px solid rgba(255,255,255,.05)}
.faq-inner{max-width:800px;margin:0 auto}
.fsrch{max-width:600px;margin:0 auto 2.5rem;display:block;width:100%;padding:.85rem 1.25rem;border-radius:10px;background:#111;border:1px solid rgba(255,255,255,.08);color:#fff;font-size:.95rem;font-family:Outfit,sans-serif;outline:none}
.fsrch:focus{border-color:rgba(0,229,255,.3)}
.fsrch::placeholder{color:#444}
.fct{font-size:1.1rem;font-weight:700;color:#00e5ff;margin:1.5rem 0 .75rem;text-align:left}
.fi{border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden;margin-bottom:.5rem;transition:.2s}
.fi:hover{border-color:rgba(0,229,255,.15)}
.fq{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.25rem;cursor:pointer;font-weight:500;font-size:.95rem;color:#fff;text-align:left}
.fq .ch{color:#444;flex-shrink:0;transition:.3s;font-size:.75rem}
.fi.act .ch{transform:rotate(180deg);color:#00e5ff}
.fan{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 1.25rem;color:#aaa;font-size:.9rem;line-height:1.7;text-align:left}
.fi.act .fan{max-height:200px;padding:.25rem 1.25rem 1rem}

footer{background:#080808;border-top:1px solid rgba(255,255,255,.08);padding:3rem 5% 1.5rem}
.fg{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem;max-width:1100px;margin:0 auto 2rem;text-align:left}
.fb h2{color:#00e5ff;font-size:1.4rem;font-weight:800;margin-bottom:.75rem}
.fb p{color:#555;font-size:.9rem;line-height:1.7}
.fc h4{color:#fff;font-size:1rem;font-weight:700;margin-bottom:.75rem}
.fc li{margin-bottom:.4rem}
.fc a{color:#555;font-size:.9rem;transition:.2s}
.fc a:hover{color:#00e5ff}
.fdis{max-width:1100px;margin:0 auto 1.5rem;background:#0a0a0a;padding:1rem 1.25rem;border-left:3px solid #ff4757;border-radius:6px;font-size:.85rem;color:#555;text-align:left}
.fbot{text-align:center;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.05);color:#444;font-size:.85rem}

.yt-ov{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:20px}
.yt-ov.show{display:flex}
.yt-b{position:relative;width:100%;max-width:420px;padding:38px 30px 30px;text-align:center;background:linear-gradient(145deg,#151515,#080808);border:1px solid rgba(255,255,255,.1);border-radius:22px;box-shadow:0 20px 70px rgba(0,0,0,.7),0 0 35px rgba(255,0,0,.12);animation:pi .35s ease}
@keyframes pi{from{opacity:0;transform:scale(.85) translateY(25px)}to{opacity:1;transform:scale(1) translateY(0)}}
.yt-cl{position:absolute;top:12px;right:15px;width:34px;height:34px;border:none;border-radius:50%;background:#222;color:#fff;font-size:16px;cursor:pointer;transition:.2s}
.yt-cl:hover{background:red;transform:rotate(90deg)}
.yt-ic{width:70px;height:70px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:red;color:#fff;font-size:28px;border-radius:20px;box-shadow:0 10px 30px rgba(255,0,0,.3)}
.yt-b h2{color:#fff;font-size:24px;font-weight:700;margin-bottom:12px}
.yt-b p{color:#aaa;font-size:15px;margin-bottom:25px;line-height:1.6}
.yt-b p strong{color:#00e5ff}
.yt-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:15px;background:red;color:#fff;border-radius:12px;font-size:16px;font-weight:700;transition:.25s;box-shadow:0 8px 25px rgba(255,0,0,.25)}
.yt-btn:hover{transform:translateY(-2px)}
.yt-note{margin-top:14px;font-size:12px;color:#444}

.mo{display:none;position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:20px}
.mo.act{display:flex}
.mb{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:2rem;width:100%;max-width:420px;animation:pi .3s ease;text-align:left}
.mb h2{font-size:1.4rem;font-weight:800;margin-bottom:1.25rem}
.fg2{margin-bottom:1rem}
.fg2 label{display:block;font-size:.85rem;color:#aaa;margin-bottom:.4rem}
.fg2 input{width:100%;padding:.75rem 1rem;border-radius:8px;background:#080808;border:1px solid rgba(255,255,255,.08);color:#fff;font-size:.95rem;font-family:Outfit,sans-serif;outline:none;transition:.2s}
.fg2 input:focus{border-color:rgba(0,229,255,.3)}
.btn-m{display:block;width:100%;padding:.85rem;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#00e5ff,#8338ec);color:#000;font-family:Outfit,sans-serif;margin-top:.5rem}
.mt{text-align:center;margin-top:.75rem;font-size:.85rem;color:#555;cursor:pointer}
.mt span{color:#00e5ff}
.pay-i{background:#080808;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:1rem 1.25rem;margin:1rem 0;display:flex;justify-content:space-between;align-items:center}
.upi{display:inline-block;padding:.5rem 1.25rem;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.3);border-radius:8px;color:#00e5ff;font-size:1.1rem;font-weight:700;cursor:pointer}
.timer{text-align:center;font-size:1.5rem;font-weight:800;color:#ff4757;margin:.75rem 0}
.btn-s{display:block;width:100%;padding:.85rem;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#2ed573,#00d2ff);color:#000;font-family:Outfit,sans-serif;margin-top:.5rem}

#tw{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem}
.ts{padding:.75rem 1.25rem;border-radius:10px;background:rgba(17,17,17,.95);border:1px solid rgba(255,255,255,.08);color:#fff;font-size:.9rem;backdrop-filter:blur(12px);animation:tai .3s ease;box-shadow:0 4px 20px rgba(0,0,0,.5)}
@keyframes tai{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}

@media(max-width:768px){
.nav-links{display:none;flex-direction:column;position:fixed;top:66px;left:0;right:0;bottom:0;background:rgba(0,0,0,.97);padding:2rem;gap:1.5rem}
.nav-links.open{display:flex}
.hamburger{display:flex}
.tool-box{grid-template-columns:1fr}
.s3g{grid-template-columns:1fr}
.pg{grid-template-columns:1fr 1fr}
.fg{grid-template-columns:1fr}
.sg{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){.pg{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav>
<div class="logo">CR-Remover</div>
<div class="hamburger" id="hb"><span></span><span></span><span></span></div>
<ul class="nav-links" id="nl">
<li><a href="#home">Home</a></li>
<li><a href="#works">How It Works</a></li>
<li><a href="#pricing">Pricing</a></li>
<li><a href="sellchannel.html">Sell Account</a></li>
</ul>
<div class="nav-actions">
<button class="btn-login" id="loginBtn" onclick="openAuth()">Login</button>
<button class="btn-free" onclick="openYT()">Free Trial</button>
</div>
</nav>

<section class="hero" id="home">
<div class="hero-content">
<div class="badge">&#129514; AI DNA Scrubbing Technology</div>
<h1><span class="gt">CR-Remover Copyright Remover</span><br>Algorithms Instantly</h1>
<p class="hero-sub">Professional AI deep-clean technology. Upload your video below to bypass YouTube and Facebook Content ID scanners completely.</p>

<div class="tool-box">
<div class="upload-card">
<div class="drop-area" id="dropArea">
<div class="drop-icon">&#128228;</div>
<p>Drag video or <span>Browse</span></p>
<input type="file" id="fi" accept="video/*" hidden>
</div>

<div class="selected-card" id="selCard">
<div class="thumb-container" id="thumbContainer">
<img class="thumb-img" id="thumbImg" src="" alt="Video thumbnail">
<span class="thumb-dur" id="thumbDur">00:00</span>
</div>
<div class="sel-meta">
<div class="sel-title" id="selTitle">Video loaded</div>
<div class="sel-tags">
<span class="sel-tag" id="selSize">0 MB</span>
<span class="sel-tag" id="selRes">HD</span>
<span class="sel-tag" style="color:#00e5ff;border:1px solid rgba(0,229,255,.3)">Ready for AI Clean</span>
</div>
<span class="sel-change" onclick="document.getElementById('fi').click()">&#8635; Change Video</span>
</div>
</div>

<button class="btn-process" id="pb2" onclick="startP()">Remove Copyright</button>
</div>

<div class="result-box">
<div class="empty-r" id="er"><div class="ic">&#127916;</div><p>Processed video appears here</p></div>
<video id="vp" controls playsinline></video>

<div id="loader">
<div class="spin-wrap">
<div class="spin"></div>
<span class="spin-icon">&#9889;</span>
</div>
<p id="mst">Scrubbing Video DNA...</p>
<span id="stt">Initializing AI Engine...</span>
<div class="pw"><div id="pb"></div></div>
<div class="pt-box">
<span class="pt-lbl">Progress</span>
<span id="pt">0%</span>
</div>
</div>

<div id="dl-area">
<a class="dl-btn" id="dlb" href="#">&#11015; Download Cleaned Video</a>
<p class="dl-hint">&#10003; 100% Content ID Bypass &#8226; Metadata Cleaned</p>
</div>
</div>
</div>

<div class="log-box" id="lt">
<div class="log-hd">
<div class="ld" style="background:#ff5f57"></div>
<div class="ld" style="background:#febc2e"></div>
<div class="ld" style="background:#28c840"></div>
<span style="margin-left:.5rem">AI Engine Real-Time Log</span>
</div>
<div class="log-out" id="lo"></div>
</div>

<div class="sp-box" id="spb">
<div class="sg">
<div class="sb"><div class="sv" id="s1">-</div><div class="sl">Original Size</div></div>
<div class="sb"><div class="sv" id="s2">-</div><div class="sl">Cleaned Size</div></div>
<div class="sb"><div class="sv" id="s3">-</div><div class="sl">Compression</div></div>
<div class="sb"><div class="sv" id="s4">14</div><div class="sl">Tags Scrubbed</div></div>
</div>
<div class="tr" id="tr"></div>
</div>
</div>
</section>

<section class="sec works" id="works">
<h2 class="sec-t">How Our AI Bypasses Scanners</h2>
<p class="sec-s">The 3-Step Content DNA Scrubbing Process</p>
<div class="s3g">
<div class="sc"><div class="sci">&#129518;</div><h3>1. Metadata Scrubbing</h3><p>We strip out original digital footprints, EXIF data, and hidden forensic watermarks left by original creators or previous platforms.</p></div>
<div class="sc"><div class="sci">&#127763;&#65039;</div><h3>2. Audio-Visual Shifting</h3><p>Frame rates micro-adjusted and audio frequencies layered to trick Content ID bots while keeping human viewing quality 100% intact.</p></div>
<div class="sc"><div class="sci">&#128737;&#65039;</div><h3>3. Clean Re-Encoding</h3><p>Video fully rendered with a brand new unique digital signature, making it appear as completely original content to YouTube and Facebook algorithms.</p></div>
</div>
</section>

<section class="sec pricing-sec" id="pricing">
<h2 class="sec-t">Choose Your Plan</h2>
<p class="sec-s">Start free, scale when ready</p>
<div class="pg">
<div class="pc">
<h3>Free Trial</h3><div class="pr">Free</div><div class="pp">Join Telegram</div>
<ul class="fl">
<li style="color:#00e5ff;font-weight:700">&#9889; How to Claim:</li>
<li>&#10003; Join our Telegram Group</li>
<li>&#10003; Request free trial access</li>
<li>&#10003; Max 50MB file size</li>
<li>&#10003; CR-Remover Watermark</li>
</ul>
<a href="https://t.me/crremover" target="_blank"><button class="pbtn">Get Free Access</button></a>
</div>
<div class="pc">
<h3>Starter</h3><div class="pr">&#8377;499</div><div class="pp">1 Month</div>
<ul class="fl">
<li style="color:#ff4757;font-weight:700">&#9889; 20 Videos / Month</li>
<li>&#10003; Basic Algorithm Bypass</li>
<li>&#10003; 720p Resolution</li>
<li>&#10003; Meta-Data Cleaning</li>
<li>&#10003; Watermark Included</li>
</ul>
<button class="pbtn" onclick="openPay('Starter','499')">Basic Plan</button>
</div>
<div class="pc feat">
<div class="pop">MOST POPULAR</div>
<h3>Pro Creator</h3><div class="pr">&#8377;899</div><div class="pp">1 Month</div>
<ul class="fl">
<li style="color:#2ed573;font-weight:700">&#9889; 50 Videos / Month</li>
<li>&#10003; Advanced AI Deep-Clean</li>
<li>&#10003; HD Resolution Export</li>
<li>&#10003; No Watermark</li>
<li>&#10003; Priority Server Access</li>
</ul>
<button class="pbtn" onclick="openPay('Pro Creator','899')">Unlock Now</button>
</div>
<div class="pc">
<h3>Enterprise</h3><div class="pr">&#8377;1799</div><div class="pp">4 Months</div>
<ul class="fl">
<li style="color:#1e90ff;font-weight:700">&#9889; 250 Videos / Month</li>
<li>&#10003; Full Copyright Immunity</li>
<li>&#10003; Bulk Processing 5 at once</li>
<li>&#10003; 4K Ultra HD Export</li>
<li>&#10003; No Watermark</li>
</ul>
<button class="pbtn" onclick="openPay('Enterprise','1799')">Get Business</button>
</div>
</div>
</section>

<section class="sec faq-sec" id="faq">
<h2 class="sec-t">Common Queries &amp; Support</h2>
<p class="sec-s">Search your question below</p>
<input class="fsrch" id="fsrch" type="text" placeholder="Search for YouTube, Facebook, or Strike solutions...">
<div class="faq-inner">
<p class="fct">1. Copy-Paste &amp; Monetization</p>
<div class="fi"><div class="fq"><span>YouTube par copy paste karke paise kaise kamaye 2026?</span><span class="ch">&#9660;</span></div><div class="fan"><p>CR-Remover simplifies the process. Using our Deep-Clean AI, you can re-upload high-engagement content like movie clips and earn via AdSense without facing Reused Content flags.</p></div></div>
<div class="fi"><div class="fq"><span>Facebook copy paste earning 2026: Kya ye abhi bhi possible hai?</span><span class="ch">&#9660;</span></div><div class="fan"><p>Yes, 2026 mein bhi Facebook copy-paste content se earning possible hai. CR-Remover ka AI video ke metadata aur digital footprint ko puri tarah badal deta hai.</p></div></div>
<div class="fi"><div class="fq"><span>IPL highlights se YouTube par kamai kaise kare?</span><span class="ch">&#9660;</span></div><div class="fan"><p>Sports content monetization ke liye CR-Remover ka Enterprise plan best hai, jo live-stream DNA scrambling technology provide karta hai.</p></div></div>
<div class="fi"><div class="fq"><span>How to upload copy-paste videos on Facebook without copyright?</span><span class="ch">&#9660;</span></div><div class="fan"><p>Facebook par copy-paste content upload karne ka sahi tarika video ke digital signatures ko change karna hai. CR-Remover video ke har frame ko process karke metadata alter kar deta hai.</p></div></div>
<p class="fct">2. Technical Bypass &amp; Claim Removal</p>
<div class="fi"><div class="fq"><span>YouTube copyright claim kaise hataye bina video delete kiye?</span><span class="ch">&#9660;</span></div><div class="fan"><p>Our Binary DNA Scrubbing modifies the underlying code of your video. This triggers the algorithm to drop existing claims without needing a video re-upload.</p></div></div>
<div class="fi"><div class="fq"><span>Instagram reel mute ho gayi hai solution?</span><span class="ch">&#9660;</span></div><div class="fan"><p>Our tool shifts the audio frequency slightly, bypasses the Mute trigger while keeping audio quality perfect.</p></div></div>
<div class="fi"><div class="fq"><span>How to bypass YouTube Content ID 4.0?</span><span class="ch">&#9660;</span></div><div class="fan"><p>CR-Remover video ke underlying binary code aur DNA ko modify karta hai. Ye method Content ID 4.0 ke scanners ko bypass karne mein 99% tak effective hai.</p></div></div>
</div>
</section>

<footer>
<div class="fg">
<div class="fb">
<h2>CR-Remover</h2>
<p>Industry standard copyright removal and video processing platform. Bypass YouTube, Facebook and Instagram Content ID scanners seamlessly.</p>
</div>
<div class="fc">
<h4>Quick Links</h4>
<ul>
<li><a href="#home">Home</a></li>
<li><a href="#works">How It Works</a></li>
<li><a href="#pricing">Pricing</a></li>
<li><a href="sellchannel.html">Sell Channel</a></li>
</ul>
</div>
<div class="fc">
<h4>Legal &amp; Policy</h4>
<ul>
<li><a href="legal/terms.html">Terms of Service</a></li>
<li><a href="legal/privacy.html">Privacy Policy</a></li>
<li><a href="legal/disclaimer.html">Disclaimer</a></li>
<li><a href="legal/refund.html">Refund Policy</a></li>
</ul>
</div>
</div>
<div class="fdis"><strong>Disclaimer:</strong> CR-Remover is designed for content creators, fair use re-purposing, and educational use. We encourage respecting original content creator rights.</div>
<div class="fbot">&copy; 2026 CR-Remover. All Rights Reserved.</div>
</footer>

<div class="yt-ov" id="ytOv">
<div class="yt-b">
<button class="yt-cl" onclick="closeYT()">&#10005;</button>
<div class="yt-ic">&#9654;</div>
<h2>Join Telegram For Free Access</h2>
<p>Get instant access to <strong>CR-Remover Free Trial</strong>. Join our official community now.</p>
<a class="yt-btn" href="https://t.me/crremover" target="_blank">&#9654; Join Telegram Channel</a>
<div class="yt-note">Opens in Telegram App / Web</div>
</div>
</div>

<div class="mo" id="authMo">
<div class="mb">
<h2 id="at">Login to Account</h2>
<form id="authF" onsubmit="handleAuth(event)">
<div class="fg2"><label>Mobile Number</label><input type="tel" id="am" placeholder="10-digit mobile" required maxlength="10"></div>
<div class="fg2"><label>Password</label><input type="password" id="ap" placeholder="Your password" required></div>
<div class="fg2" id="cg" style="display:none"><label>Confirm Password</label><input type="password" id="ac" placeholder="Confirm password"></div>
<button type="submit" class="btn-m" id="as">Login</button>
</form>
<div class="mt" id="atg" onclick="toggleAuth()">Need account? <span>Register.</span></div>
<div class="mt" onclick="closeAuth()">&#10005; Close</div>
</div>
</div>

<div class="mo" id="payMo">
<div class="mb" style="max-width:480px">
<h2>Complete Payment</h2>
<div class="pay-i"><span id="ppn">Pro Creator</span><span style="color:#00e5ff;font-weight:800" id="pam">&#8377;899</span></div>
<p style="color:#aaa;font-size:.9rem;margin-bottom:.5rem">Pay via UPI to:</p>
<div style="text-align:center;margin:1rem 0"><span class="upi" onclick="copyUPI()">bilalkhan@paytm</span></div>
<div class="timer" id="ptmr">05:00</div>
<button class="btn-s" onclick="payOk()">&#10003; I Have Completed Payment</button>
<div class="mt" onclick="closePay()">&#10005; Cancel</div>
</div>
</div>

<div id="tw"></div>

<script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>
<script src="https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js"></script>
<script src="processor.js"></script>

<script>
var sF=null,pB=null,li=false,hp=false,cp='',il=false,pt=null,loadedVideoMeta=null;

function initApp(){
  // Setup callbacks
  if(window.videoProcessor){
    videoProcessor.onProgress = function(p){
      var pb = document.getElementById('pb');
      var ptEl = document.getElementById('pt');
      if(pb) pb.style.width = p + '%';
      if(ptEl) ptEl.textContent = p + '%';
    };
    videoProcessor.onLog = function(m,t){ aLog(m,t); };
    videoProcessor.onStatus = function(m){
      var stt = document.getElementById('stt');
      if(stt) stt.textContent = m;
    };
    // Pre-load engine in background
    setTimeout(function(){ videoProcessor.load(); }, 1000);
  }

  var h=document.getElementById('hb'),nl=document.getElementById('nl');
  if(h && nl){
    h.addEventListener('click',function(){h.classList.toggle('open');nl.classList.toggle('open');});
    nl.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){h.classList.remove('open');nl.classList.remove('open');});});
  }

  var da=document.getElementById('dropArea'),fi=document.getElementById('fi');
  if(da && fi){
    da.addEventListener('click',function(){fi.click();});
    fi.addEventListener('change',function(){if(fi.files[0])pickF(fi.files[0]);});
    ['dragenter','dragover'].forEach(function(ev){da.addEventListener(ev,function(e){e.preventDefault();da.classList.add('drag-over');});});
    ['dragleave','drop'].forEach(function(ev){da.addEventListener(ev,function(e){e.preventDefault();da.classList.remove('drag-over');});});
    da.addEventListener('drop',function(e){
      e.preventDefault();
      da.classList.remove('drag-over');
      if(e.dataTransfer && e.dataTransfer.files[0]) pickF(e.dataTransfer.files[0]);
    });
  }

  document.querySelectorAll('.fq').forEach(function(q){
    q.addEventListener('click',function(){
      var it=q.parentElement,was=it.classList.contains('act');
      document.querySelectorAll('.fi').forEach(function(i){i.classList.remove('act');});
      if(!was)it.classList.add('act');
    });
  });

  var fsrch = document.getElementById('fsrch');
  if(fsrch){
    fsrch.addEventListener('input',function(){
      var q=this.value.toLowerCase();
      document.querySelectorAll('.fi').forEach(function(it){
        it.style.display=(!q||it.textContent.toLowerCase().includes(q))?'':'none';
      });
    });
  }

  restSess();
  setTimeout(function(){
    if(!sessionStorage.getItem('yt_s')){
      openYT();
      sessionStorage.setItem('yt_s','1');
    }
  }, 1500);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function formatDuration(sec){
  if(!sec || isNaN(sec)) return '00:00';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

async function pickF(f){
  if(!f.type.startsWith('video/') && !f.name.match(/\\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i)){
    toast('Please select a valid video file.');
    return;
  }
  sF = f;
  pB = null;

  var mb = (f.size/1048576).toFixed(2);
  var gb = (f.size/1073741824).toFixed(2);
  var isBig = f.size > 500*1024*1024;

  // Show Selected Card
  document.getElementById('dropArea').style.display = 'none';
  var selCard = document.getElementById('selCard');
  selCard.style.display = 'block';

  document.getElementById('selTitle').textContent = f.name;
  document.getElementById('selSize').textContent = isBig ? (gb + ' GB') : (mb + ' MB');

  // Reset results
  document.getElementById('er').style.display = 'flex';
  document.getElementById('vp').style.display = 'none';
  document.getElementById('dl-area').style.display = 'none';
  document.getElementById('loader').style.display = 'none';
  document.getElementById('spb').style.display = 'none';
  document.getElementById('pb2').disabled = false;
  document.getElementById('pb2').textContent = 'Remove Copyright';

  // Generate thumbnail & metadata
  try {
    var v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    var url = URL.createObjectURL(f);
    v.src = url;

    v.onloadedmetadata = function(){
      var dur = v.duration;
      var w = v.videoWidth || 1920;
      var h = v.videoHeight || 1080;
      loadedVideoMeta = { duration: dur, width: w, height: h };
      if(window.videoProcessor) videoProcessor.setDuration(dur);

      document.getElementById('thumbDur').textContent = formatDuration(dur);
      document.getElementById('selRes').textContent = (w && h) ? (w + 'x' + h) : 'HD Video';
      v.currentTime = Math.min(1, Math.max(0.1, dur / 4));
    };

    v.onseeked = function(){
      try {
        var canvas = document.createElement('canvas');
        canvas.width = v.videoWidth || 480;
        canvas.height = v.videoHeight || 270;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        var thumbData = canvas.toDataURL('image/jpeg', 0.8);
        document.getElementById('thumbImg').src = thumbData;
      } catch(e){}
    };
  } catch(e){
    console.warn('Thumbnail err:', e);
  }

  if(isBig){
    toast('Large movie loaded ('+gb+' GB) - Keep tab active!');
  } else {
    toast(f.name + ' selected (' + mb + ' MB)');
  }
}

async function startP(){
  if(!sF){ toast('Please select a video first!'); return; }
  if(!window.videoProcessor){ toast('FFmpeg engine initializing... Please wait 5 seconds.'); return; }

  var btn = document.getElementById('pb2');
  btn.disabled = true;
  btn.textContent = 'Processing Video...';

  document.getElementById('er').style.display = 'none';
  document.getElementById('vp').style.display = 'none';
  document.getElementById('dl-area').style.display = 'none';
  document.getElementById('spb').style.display = 'none';
  document.getElementById('loader').style.display = 'flex';
  document.getElementById('lt').style.display = 'block';

  // Reset progress bar
  document.getElementById('pb').style.width = '0%';
  document.getElementById('pt').textContent = '0%';
  document.getElementById('stt').textContent = 'Scrubbing Copyright Markers...';

  aLog('--- Processing Started for: ' + sF.name + ' ---', 's');

  try {
    var r = await videoProcessor.process(sF, {
      stripMetadata: true,
      reencodeVideo: true,
      reencodeAudio: true,
      crf: 23,
      outputFormat: 'mp4'
    });

    pB = r.blob;
    document.getElementById('loader').style.display = 'none';

    var outUrl = URL.createObjectURL(r.blob);
    var vp = document.getElementById('vp');
    vp.src = outUrl;
    vp.style.display = 'block';

    var dlb = document.getElementById('dlb');
    dlb.href = outUrl;
    dlb.download = sF.name.replace(/\\.[^.]+$/, '') + '_cleaned_CR_free.mp4';
    document.getElementById('dl-area').style.display = 'flex';

    showSt(r.stats);
    btn.textContent = 'Processing Complete ✓';
    btn.disabled = false;
    aLog('✓ Done! Output Size: ' + (r.blob.size/1048576).toFixed(2) + ' MB', 'i');
    toast('Copyright bypassed successfully! Download ready.');

  } catch(e){
    document.getElementById('loader').style.display = 'none';
    document.getElementById('er').style.display = 'flex';
    btn.disabled = false;
    btn.textContent = 'Remove Copyright';
    aLog('Error: ' + e.message, 'e');
    toast('Processing failed. See error log.');
  }
}

function aLog(m,t){
  var o=document.getElementById('lo');
  if(!o) return;
  var d=document.createElement('div');
  d.className='ll'+(t?' '+t:'');
  d.textContent=m;
  o.appendChild(d);
  o.scrollTop=o.scrollHeight;
}

function showSt(s){
  var fmt=function(b){
    return b>=1073741824 ? (b/1073741824).toFixed(2)+' GB' :
           b>=1048576 ? (b/1048576).toFixed(2)+' MB' :
           (b/1024).toFixed(1)+' KB';
  };
  document.getElementById('s1').textContent = fmt(s.originalSize);
  document.getElementById('s2').textContent = fmt(s.processedSize);
  var red = parseFloat(s.reduction);
  document.getElementById('s3').textContent = (red>0?'-':'+') + Math.abs(red) + '%';
  document.getElementById('s4').textContent = s.strippedTags.length;

  var row = document.getElementById('tr');
  row.innerHTML = '';
  s.strippedTags.forEach(function(t){
    var c = document.createElement('span');
    c.className = 'tc';
    c.textContent = '✓ ' + t;
    row.appendChild(c);
  });
  document.getElementById('spb').style.display = 'block';
}

function openAuth(m){
  il = (m === 'login');
  document.getElementById('at').textContent = il ? 'Login to Account' : 'Create Account';
  document.getElementById('as').textContent = il ? 'Login' : 'Register';
  document.getElementById('atg').innerHTML = il ? 'Need account? <span>Register.</span>' : 'Have account? <span>Login here.</span>';
  document.getElementById('cg').style.display = il ? 'none' : '';
  document.getElementById('authMo').classList.add('act');
  document.body.style.overflow = 'hidden';
}

function closeAuth(){
  document.getElementById('authMo').classList.remove('act');
  document.body.style.overflow = '';
}

function toggleAuth(){ openAuth(il ? 'register' : 'login'); }

function handleAuth(e){
  e.preventDefault();
  var m=document.getElementById('am').value.trim(),p=document.getElementById('ap').value,c=document.getElementById('ac').value;
  if(!/^[0-9]{10}$/.test(m)){toast('Enter valid 10-digit mobile!');return;}
  if(!il&&p!==c){toast('Passwords do not match!');return;}
  setTimeout(function(){
    li=true;cp=m;
    localStorage.setItem('cr_l','true');
    localStorage.setItem('cr_p',m);
    closeAuth();updNav();
    toast('Welcome '+m+'!');
  },600);
}

function restSess(){
  if(localStorage.getItem('cr_l')==='true'){li=true;cp=localStorage.getItem('cr_p')||'';}
  if(localStorage.getItem('cr_pl')==='true')hp=true;
  if(li)updNav();
}

function updNav(){
  var b=document.getElementById('loginBtn');
  if(li && b){
    b.textContent=cp.slice(0,5)+'***';
    b.onclick=function(){if(confirm('Logout?')){localStorage.clear();location.reload();}};
  }
}

function openPay(n,a){
  if(!li){toast('Please login first.');openAuth('login');return;}
  document.getElementById('ppn').textContent=n;
  document.getElementById('pam').textContent=String.fromCharCode(8377)+a;
  document.getElementById('payMo').classList.add('act');
  document.body.style.overflow='hidden';
  var r=300,el=document.getElementById('ptmr');
  if(pt)clearInterval(pt);
  pt=setInterval(function(){
    var m=Math.floor(r/60),s=r%60;
    el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    if(--r<0){clearInterval(pt);el.textContent='Expired';}
  },1000);
}

function closePay(){
  document.getElementById('payMo').classList.remove('act');
  document.body.style.overflow='';
  if(pt)clearInterval(pt);
}

function payOk(){
  closePay();
  hp=true;
  localStorage.setItem('cr_pl','true');
  toast('Plan activated! Unlimited processing enabled.');
}

function copyUPI(){
  if(navigator.clipboard) navigator.clipboard.writeText('bilalkhan@paytm');
  toast('UPI ID copied!');
}

function openYT(){
  document.getElementById('ytOv').classList.add('show');
  document.body.style.overflow='hidden';
}

function closeYT(){
  document.getElementById('ytOv').classList.remove('show');
  document.body.style.overflow='';
}

document.addEventListener('click',function(e){
  if(e.target.id==='ytOv')closeYT();
  if(e.target.id==='authMo')closeAuth();
  if(e.target.id==='payMo')closePay();
});

function toast(m,d){
  var w=document.getElementById('tw');
  if(!w) return;
  var t=document.createElement('div');
  t.className='ts';
  t.textContent=m;
  w.appendChild(t);
  setTimeout(function(){
    t.style.cssText='opacity:0;transform:translateX(40px);transition:.3s';
    setTimeout(function(){t.remove();},300);
  },d||3500);
}
</script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully written index.html:', html.length, 'bytes');
