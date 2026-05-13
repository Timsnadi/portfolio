document.addEventListener('DOMContentLoaded', function () {




    /* ─── PRELOADER ─────────────────────────────────────────── */
    (function () {
        var el        = document.getElementById('preloader');
        if (!el) return;

        var counter   = document.getElementById('preCounter');
        var ringFill  = document.getElementById('preRingFill');
        var ringDot   = document.getElementById('preRingDot');
        var enterBtn  = document.getElementById('enterBtn');
        var tagline   = document.getElementById('preTagline');
        var statusTxt = document.getElementById('preStatusText');
        var bars      = el.querySelectorAll('.pre-bar');
        var inner     = el.querySelector('.pre-inner');
        var cvs       = document.getElementById('preCanvas');

        document.body.style.overflow = 'hidden';

        /* ── Canvas particle field ── */
        if (cvs) {
            var ctx2 = cvs.getContext('2d');
            var PW, PH;
            var particles = [];
            var PCOUNT = 55;

            function resizeCvs() {
                PW = cvs.width  = cvs.offsetWidth;
                PH = cvs.height = cvs.offsetHeight;
            }
            resizeCvs();
            window.addEventListener('resize', resizeCvs);

            function makeP() {
                var a = Math.random() * Math.PI * 2;
                var s = Math.random() * 0.3 + 0.05;
                return {
                    x: Math.random() * PW, y: Math.random() * PH,
                    vx: Math.cos(a) * s,   vy: Math.sin(a) * s,
                    r: Math.random() * 1.2 + 0.4,
                    alpha: Math.random() * 0.4 + 0.1,
                    phase: Math.random() * Math.PI * 2
                };
            }
            for (var p = 0; p < PCOUNT; p++) particles.push(makeP());

            var pmx = -999, pmy = -999, pT = 0;
            el.addEventListener('mousemove', function (e) { pmx = e.clientX; pmy = e.clientY; });

            function animCvs() {
                if (el.style.display === 'none') return;
                pT++;
                ctx2.clearRect(0, 0, PW, PH);

                /* faint grid */
                ctx2.strokeStyle = 'rgba(239,68,68,0.025)';
                ctx2.lineWidth = 1;
                for (var gx = 0; gx < PW; gx += 80) { ctx2.beginPath(); ctx2.moveTo(gx,0); ctx2.lineTo(gx,PH); ctx2.stroke(); }
                for (var gy = 0; gy < PH; gy += 80) { ctx2.beginPath(); ctx2.moveTo(0,gy); ctx2.lineTo(PW,gy); ctx2.stroke(); }

                /* ambient glow orb */
                var ox = PW * 0.5 + Math.sin(pT * 0.006) * 100;
                var oy = PH * 0.45 + Math.cos(pT * 0.008) * 60;
                var og = ctx2.createRadialGradient(ox, oy, 0, ox, oy, 300);
                og.addColorStop(0, 'rgba(239,68,68,0.07)');
                og.addColorStop(1, 'rgba(239,68,68,0)');
                ctx2.fillStyle = og; ctx2.beginPath(); ctx2.arc(ox, oy, 300, 0, Math.PI*2); ctx2.fill();

                /* particles */
                particles.forEach(function (p) {
                    var dx = p.x - pmx, dy = p.y - pmy;
                    var d  = Math.sqrt(dx*dx + dy*dy) || 1;
                    if (d < 100) { p.vx += (dx/d)*0.4; p.vy += (dy/d)*0.4; }
                    var sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
                    if (sp > 1.8) { p.vx *= 0.9; p.vy *= 0.9; }
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0) p.x = PW; if (p.x > PW) p.x = 0;
                    if (p.y < 0) p.y = PH; if (p.y > PH) p.y = 0;
                    var al = p.alpha * (0.5 + 0.5 * Math.sin(pT * 0.025 + p.phase));
                    ctx2.beginPath(); ctx2.arc(p.x, p.y, p.r, 0, Math.PI*2);
                    ctx2.fillStyle = 'rgba(239,68,68,' + al + ')'; ctx2.fill();
                });

                /* connection lines */
                for (var i = 0; i < particles.length; i++) {
                    for (var j = i+1; j < particles.length; j++) {
                        var ddx = particles[i].x - particles[j].x;
                        var ddy = particles[i].y - particles[j].y;
                        var dd  = Math.sqrt(ddx*ddx + ddy*ddy);
                        if (dd < 110) {
                            ctx2.strokeStyle = 'rgba(239,68,68,' + (0.12 * (1 - dd/110)) + ')';
                            ctx2.lineWidth = 0.6;
                            ctx2.beginPath(); ctx2.moveTo(particles[i].x, particles[i].y);
                            ctx2.lineTo(particles[j].x, particles[j].y); ctx2.stroke();
                        }
                    }
                }
                requestAnimationFrame(animCvs);
            }
            animCvs();
        }

        /* ── Typewriter tagline ── */
        var tagPhrases = ['Building something great.', 'Frontend. Backend. AI.', 'Fintech developer in Nairobi.'];
        var tpIdx = 0, tpChar = 0, tpDel = false;
        var cursor = tagline ? tagline.querySelector('.pre-tagline-cursor') : null;

        function typeLine() {
            if (!tagline) return;
            var phrase = tagPhrases[tpIdx];
            if (!tpDel) {
                tpChar++;
                tagline.textContent = phrase.slice(0, tpChar);
                if (cursor) tagline.appendChild(cursor);
                if (tpChar === phrase.length) { tpDel = true; setTimeout(typeLine, 1800); return; }
                setTimeout(typeLine, 65);
            } else {
                tpChar--;
                tagline.textContent = phrase.slice(0, tpChar);
                if (cursor) tagline.appendChild(cursor);
                if (tpChar === 0) { tpDel = false; tpIdx = (tpIdx + 1) % tagPhrases.length; setTimeout(typeLine, 400); return; }
                setTimeout(typeLine, 38);
            }
        }
        setTimeout(typeLine, 600);

        /* ── Progress ring + counter ── */
        var count = 0;
        var CIRC  = 2 * Math.PI * 54; /* 339.3 */
        if (ringFill) ringFill.style.strokeDashoffset = CIRC;

        var statusMsgs = ['LOADING ASSETS', 'FETCHING MODULES', 'BUILDING PIPELINE', 'ALMOST READY'];

        var tick = setInterval(function () {
            var step = Math.floor(Math.random() * 2) + 1;
            count = Math.min(count + step, 100);

            /* counter */
            if (counter) counter.textContent = count;

            /* ring stroke */
            if (ringFill) ringFill.style.strokeDashoffset = CIRC * (1 - count / 100);

            /* ring dot — rotate around the circle */
            if (ringDot) {
                var ang = (count / 100) * 2 * Math.PI - Math.PI / 2;
                var cx = 60 + 54 * Math.cos(ang);
                var cy = 60 + 54 * Math.sin(ang);
                ringDot.setAttribute('cx', cx);
                ringDot.setAttribute('cy', cy);
            }

            /* status text */
            var sIdx = Math.min(Math.floor(count / 26), statusMsgs.length - 1);
            if (statusTxt) statusTxt.textContent = statusMsgs[sIdx];

            if (count >= 100) {
                clearInterval(tick);
                setTimeout(onReady, 300);
            }
        }, 38);

        /* Bars — mouse interaction */
        el.addEventListener('mousemove', function (e) {
            var mx = e.clientX, my = e.clientY;
            /* parallax */
            var px = (mx - window.innerWidth  / 2) / 30;
            var py = (my - window.innerHeight / 2) / 30;
            if (inner) inner.style.transform = 'translate(' + px + 'px,' + py + 'px)';
            /* bars */
            bars.forEach(function (b) {
                var r  = b.getBoundingClientRect();
                var bx = r.left + r.width / 2;
                var by = r.top  + r.height / 2;
                var d  = Math.sqrt((mx-bx)*(mx-bx) + (my-by)*(my-by));
                if (d < 160) {
                    var scale = 1 + (160 - d) / 160 * 2.2;
                    b.style.transform = 'scaleY(' + scale + ')';
                    b.style.filter    = 'brightness(' + (1.3 + (160-d)/160) + ') drop-shadow(0 0 6px #ef4444)';
                } else {
                    b.style.transform = '';
                    b.style.filter    = '';
                }
            });
        });

        /* ── Ready state ── */
        function onReady() {
            if (statusTxt) statusTxt.textContent = 'READY';
            if (enterBtn)  enterBtn.classList.add('show');
        }

        /* ── Dismiss — slat wipe ── */
        function dismiss() {
            el.classList.add('done');
            document.body.style.overflow = '';
            setTimeout(function () { el.style.display = 'none'; }, 1600);
        }

        if (enterBtn) enterBtn.addEventListener('click', dismiss);

        /* fail-safe after 6s */
        setTimeout(function () {
            if (count < 100) { clearInterval(tick); count = 100; onReady(); }
        }, 6000);
    })();
    /* ─────────────────────────────────────────────────────── */



    try {
        var canvas = document.getElementById('heroBg');
        if (canvas) {
            var ctx = canvas.getContext('2d');
            var W, H, t = 0;
            var mouse = { x: -9999, y: -9999, down: false };
            var dots = [];
            var REPEL = 120, ATTRACT = 200, CONNECT = 140, DOTS = 70;
            var isMobile = window.innerWidth < 768;

            function resize() {
                W = canvas.width  = canvas.offsetWidth;
                H = canvas.height = canvas.offsetHeight;
                isMobile = window.innerWidth < 768;
                DOTS = isMobile ? 30 : 70;
                if (dots.length > DOTS) dots = dots.slice(0, DOTS);
                while (dots.length < DOTS) dots.push(makeDot());
            }

            function makeDot() {
                var angle = Math.random() * Math.PI * 2;
                var spd   = Math.random() * 0.35 + 0.08;
                return {
                    x: Math.random() * W, y: Math.random() * H,
                    vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                    base: spd, r: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.35 + 0.15,
                    phase: Math.random() * Math.PI * 2
                };
            }

            resize();
            for (var i = 0; i < DOTS; i++) dots.push(makeDot());
            window.addEventListener('resize', resize);

            window.addEventListener('mousemove', function(e) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });
            window.addEventListener('mouseleave', function() { mouse.x = -9999; mouse.y = -9999; });
            window.addEventListener('mousedown',  function() { mouse.down = true; });
            window.addEventListener('mouseup',    function() { mouse.down = false; });
            window.addEventListener('click', function(e) {
                var cx = e.clientX, cy = e.clientY;
                for (var b = 0; b < 14; b++) {
                    var a = Math.random() * Math.PI * 2, s = Math.random() * 4 + 2;
                    dots.push({ x:cx, y:cy, vx:Math.cos(a)*s, vy:Math.sin(a)*s,
                        base:s, r:Math.random()*2+1, alpha:0.9, phase:0, burst:true, life:1.0 });
                }
            });

            function getAccentRgb() {
                return getComputedStyle(document.body).getPropertyValue('--accent-rgb').trim() || '239,68,68';
            }
            function getWarmRgb() {
                return getComputedStyle(document.body).getPropertyValue('--accent-warm-rgb').trim() || '255,156,42';
            }

            function drawOrbs() {
                var accent = getAccentRgb();
                var warm   = getWarmRgb();
                var orbs = [
                    { x:W*0.15+Math.sin(t*0.0007)*70, y:H*0.25+Math.cos(t*0.0009)*55, r:380, c:accent, o:0.06 },
                    { x:W*0.85+Math.cos(t*0.0006)*75, y:H*0.75+Math.sin(t*0.0008)*60, r:320, c:warm, o:0.06 },
                    { x:W*0.5 +Math.sin(t*0.0005)*90, y:H*0.45+Math.cos(t*0.0007)*45, r:240, c:accent, o:0.03 }
                ];
                orbs.forEach(function(o) {
                    var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
                    g.addColorStop(0,'rgba('+o.c+','+o.o+')');
                    g.addColorStop(1,'rgba('+o.c+',0)');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
                });
            }

            function drawGrid() {
                var accent = getAccentRgb();
                ctx.strokeStyle = 'rgba('+accent+',0.04)';
                ctx.lineWidth = 1;
                for (var x=0; x<W; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
                for (var y=0; y<H; y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
            }

            function drawMouseGlow() {
                if (mouse.x < 0 || isMobile) return;
                var gr   = mouse.down ? ATTRACT * 1.3 : ATTRACT;
                var col  = getAccentRgb();
                var g = ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,gr);
                g.addColorStop(0,'rgba('+col+',0.07)');
                g.addColorStop(1,'rgba('+col+',0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(mouse.x,mouse.y,gr,0,Math.PI*2); ctx.fill();
            }

            function updateAndDrawDots() {
                dots = dots.filter(function(d) { return !(d.burst && d.life <= 0); });
                dots.forEach(function(d) {
                    var dx = d.x - mouse.x, dy = d.y - mouse.y;
                    var dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    if (!isMobile && dist < REPEL) {
                        var f = (REPEL - dist) / REPEL * 0.7;
                        d.vx += (dx/dist)*f; d.vy += (dy/dist)*f;
                    } else if (mouse.down && dist < ATTRACT) {
                        var f2 = (ATTRACT - dist) / ATTRACT * 0.25;
                        d.vx -= (dx/dist)*f2; d.vy -= (dy/dist)*f2;
                    }
                    var spd = Math.sqrt(d.vx*d.vx + d.vy*d.vy);
                    if (spd > d.base*7) { d.vx*=0.88; d.vy*=0.88; }
                    if (!d.burst && spd < d.base*0.4 && spd>0) { d.vx+=d.vx/spd*0.02; d.vy+=d.vy/spd*0.02; }
                    d.x += d.vx; d.y += d.vy;
                    if (d.x < -8) d.x=W+8; if (d.x>W+8) d.x=-8;
                    if (d.y < -8) d.y=H+8; if (d.y>H+8) d.y=-8;
                    if (d.burst) { d.life-=0.022; d.alpha=d.life; d.vx*=0.96; d.vy*=0.96; }
                    var al  = d.burst ? d.alpha : d.alpha*(0.6+0.4*Math.sin(t*0.002+d.phase));
                    var col2 = d.burst ? getWarmRgb() : getAccentRgb();
                    ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
                    ctx.fillStyle = 'rgba('+col2+','+al+')'; ctx.fill();
                });
            }

            function drawLines() {
                var accent = getAccentRgb();
                for (var i=0; i<dots.length; i++) {
                    for (var j=i+1; j<dots.length; j++) {
                        var dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y;
                        var d=Math.sqrt(dx*dx+dy*dy);
                        if (d < CONNECT) {
                            ctx.strokeStyle='rgba('+accent+','+(1-d/CONNECT)*0.15+')';
                            ctx.lineWidth=0.7;
                            ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y);
                            ctx.lineTo(dots[j].x,dots[j].y); ctx.stroke();
                        }
                    }
                }
            }

            function animate() {
                t++;
                ctx.clearRect(0,0,W,H);
                drawGrid(); drawOrbs(); drawMouseGlow();
                drawLines(); updateAndDrawDots();
                requestAnimationFrame(animate);
            }
            animate();
        }
    } catch(e) { console.warn('Canvas error:', e); }


    try {
        var cursor = document.getElementById('cursor');
        var ring   = document.getElementById('cursorRing');
        var mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', function(e) {
            mx = e.clientX; my = e.clientY;
            if (cursor) { cursor.style.left = mx+'px'; cursor.style.top = my+'px'; }
        });
        (function animRing() {
            rx += (mx-rx)/8; ry += (my-ry)/8;
            if (ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
            requestAnimationFrame(animRing);
        })();
        document.querySelectorAll('a, button, .proj-card, .svc-card, .stat-card, input, textarea').forEach(function(el) {
            el.addEventListener('mouseenter', function() { if(ring) ring.classList.add('hovered'); });
            el.addEventListener('mouseleave', function() { if(ring) ring.classList.remove('hovered'); });
        });

        document.addEventListener('mousedown', function() { if(ring) ring.classList.add('clicked'); });
        document.addEventListener('mouseup', function() { if(ring) ring.classList.remove('clicked'); });

        window.addEventListener('scroll', function() {
            if (ring) {
                ring.classList.add('scrolling');
                clearTimeout(ring.scrollTimeout);
                ring.scrollTimeout = setTimeout(function() {
                    ring.classList.remove('scrolling');
                }, 150);
            }
        });
    } catch(e) { console.warn('Cursor error:', e); }


var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }


    var nav = document.getElementById('navbar');
    var btt = document.getElementById('backToTop');
    var scrollBar = document.getElementById('scrollProgress');
    var progressPath = document.getElementById('progressPath');
    var pathLength = progressPath ? progressPath.getTotalLength() : 0;

    if (progressPath) {
        progressPath.style.strokeDasharray  = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
    }

    function updateScrollUi() {
        var scrollY = window.scrollY;
        var height = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollY > 60) {
            if (nav) nav.classList.add('scrolled');
            if (btt) btt.classList.add('show');
        } else {
            if (nav) nav.classList.remove('scrolled');
            if (btt) btt.classList.remove('show');
        }

        if (progressPath) {
            var progress = pathLength - (scrollY * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }

        if (scrollBar) scrollBar.style.width = (height > 0 ? (scrollY / height) * 100 : 0) + '%';
    }

    var scrollTicking = false;
    window.addEventListener('scroll', function() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function() {
            updateScrollUi();
            scrollTicking = false;
        });
    }, { passive: true });
    updateScrollUi();


    var ro = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function(el) { ro.observe(el); });


    var tw = document.getElementById('typewriter');
    if (tw) {
        var phrases = ['Frontend Developer.', 'Backend Developer.', 'API Integration Expert.', 'AI Solutions Builder.', 'Fintech Developer.'];
        var pi=0, ci=0, del=false, spd=110;
        function type() {
            var p = phrases[pi];
            tw.textContent = del ? p.slice(0,--ci) : p.slice(0,++ci);
            spd = del ? 55 : 110;
            if (!del && ci===p.length) { del=true; spd=2200; }
            if (del && ci===0) { del=false; pi=(pi+1)%phrases.length; spd=400; }
            setTimeout(type, spd);
        }
        setTimeout(type, 800);
    }


    var sg = document.querySelector('.stats-grid');
    var counted = false;
    if (sg) {
        new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting && !counted) {
                counted = true;
                document.querySelectorAll('.stat-num').forEach(function(el) {
                    var target = +el.getAttribute('data-count'), inc = target/(1600/16), cur=0;
                    (function tick() {
                        cur += inc;
                        el.textContent = cur < target ? Math.ceil(cur) : target;
                        if (cur < target) requestAnimationFrame(tick);
                    })();
                });
            }
        }, { threshold: 0.3 }).observe(sg);
    }


    var EMAILJS_PUBLIC_KEY  = '14bVtDjA-ow8yrNNI';
    var EMAILJS_SERVICE_ID  = 'service_t1i4bf5';
    var EMAILJS_TEMPLATE_ID = 'template_ozf35bb';

    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    var form      = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');

    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var name    = form.querySelector('[name="from_name"]').value.trim();
            var email   = form.querySelector('[name="reply_to"]').value.trim();
            var message = form.querySelector('[name="message"]').value.trim();
            if (!name || !email || !message) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.style.opacity = '0.8';

            if (typeof emailjs === 'undefined') {
                setTimeout(function() {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                    submitBtn.style.opacity = '1';
                    submitBtn.disabled = false;
                }, 2000);
                return;
            }

            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
                .then(function() {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                    submitBtn.style.opacity = '1';
                    form.reset();
                    setTimeout(function() {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 4000);
                })
                .catch(function(err) {
                    console.error('EmailJS error:', err);
                    submitBtn.innerHTML = '<i class="fas fa-times"></i> Failed — try again';
                    submitBtn.style.background = 'linear-gradient(135deg,#f87171,#ef4444)';
                    submitBtn.style.opacity = '1';
                    setTimeout(function() {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 4000);
                });
        });
    }


    var modal     = document.getElementById('projectModal');
    var modalClose = document.getElementById('modalClose');
    var projectCards = document.querySelectorAll('.proj-card');

    var projectData = {
        "Finsense Africa Dashboard": {
            desc: "A comprehensive fintech dashboard designed for the African market. It features real-time expense tracking, automated budgeting, and financial health insights. Built with a focus on performance and data security.",
            tags: ["React", "Node.js", "PostgreSQL", "Recharts"],
            image: "linear-gradient(135deg,#ef4444,#991b1b)",
            live: "#",
            code: "#"
        },
        "AI-Powered Chat Assistant": {
            desc: "An advanced AI assistant integrated into a customer support workflow. Uses OpenAI's GPT-4 to provide contextual answers, summarize long documents, and handle repetitive queries, reducing support tickets by 40%.",
            tags: ["Next.js", "OpenAI API", "TailwindCSS", "Node.js"],
            image: "linear-gradient(135deg,#374151,#111827)",
            live: "#",
            code: "#"
        },
        "Payment Gateway Integration": {
            desc: "A unified API layer that connects multiple African payment providers (M-Pesa, Airtel Money, Flutterwave) and international gateways (Stripe, PayPal) into a single, easy-to-use interface for merchants.",
            tags: ["Node.js", "M-Pesa API", "Stripe API", "Redis"],
            image: "linear-gradient(135deg,#ef4444,#374151)",
            live: "#",
            code: "#"
        }
    };

    if (modal && modalClose) {
        projectCards.forEach(function(card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) {
                if (e.target.closest('.proj-links')) return;

                var title = card.querySelector('h3').textContent;
                var data  = projectData[title];

                if (data) {
                    document.getElementById('modalTitle').textContent = title;
                    document.getElementById('modalDesc').textContent  = data.desc;
                    document.getElementById('modalImage').style.background = data.image;
                    document.getElementById('modalLive').href = data.live;
                    document.getElementById('modalCode').href = data.code;

                    var tagsContainer = document.getElementById('modalTags');
                    tagsContainer.innerHTML = '';
                    data.tags.forEach(function(t) {
                        var s = document.createElement('span');
                        s.textContent = t;
                        tagsContainer.appendChild(s);
                    });

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ══════════════════════════════════════════════
       ENHANCEMENTS
    ══════════════════════════════════════════════ */

    /* ── Active nav link via IntersectionObserver ── */
    (function () {
        var sections   = document.querySelectorAll('section[id]');
        var navLinks   = document.querySelectorAll('.nav-link');
        if (!sections.length || !navLinks.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    navLinks.forEach(function (l) {
                        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(function (s) { observer.observe(s); });
    })();

    /* ── Skills tabs ── */
    (function () {
        var tabs   = document.querySelectorAll('.skill-tab');
        var panels = document.querySelectorAll('.skills-panel');
        if (!tabs.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                panels.forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                var panel = document.getElementById('tab-' + tab.dataset.tab);
                if (panel) {
                    panel.classList.add('active');
                    animateBarsInPanel(panel);
                }
            });
        });

        /* Animate bars when section scrolls into view */
        var skillsSection = document.getElementById('skills');
        if (skillsSection) {
            var barObserver = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    var activePanel = document.querySelector('.skills-panel.active');
                    if (activePanel) animateBarsInPanel(activePanel);
                    barObserver.disconnect();
                }
            }, { threshold: 0.2 });
            barObserver.observe(skillsSection);
        }

        function animateBarsInPanel(panel) {
            panel.querySelectorAll('.sb-fill').forEach(function (fill) {
                fill.style.width = fill.dataset.w + '%';
            });
        }
    })();

    /* ── Project card 3D tilt ── */
    (function () {
        var projCards = document.querySelectorAll('.proj-card');
        projCards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r   = card.getBoundingClientRect();
                var x   = (e.clientX - r.left) / r.width  - 0.5;
                var y   = (e.clientY - r.top)  / r.height - 0.5;
                card.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-8px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    })();

    /* ── Toast helper ── */
    function showToast(msg, type) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        var icon = type === 'success' ? '✅' : '❌';
        toast.innerHTML = '<span class="toast-icon">' + icon + '</span>' + msg;
        toast.className = 'toast ' + (type || '') + ' show';
        setTimeout(function () { toast.classList.remove('show'); }, 4000);
    }

    /* ── Intercept form submit to use toast ── */
    (function () {
        var form = document.getElementById('contactForm');
        if (!form) return;
        /* Wait for any existing submit listener to be replaced */
        form.addEventListener('submit', function formEnhance(e) {
            /* The existing listener fires first; we hook into its completion via a MutationObserver on the button */
            var btn = document.getElementById('submitBtn');
            if (!btn) return;
            /* Watch for the button text to change back to "Send Message" (success) or display error */
            var mo = new MutationObserver(function () {
                if (btn.textContent.includes('Sent')) {
                    showToast('Message sent! I\'ll be in touch soon.', 'success');
                    mo.disconnect();
                } else if (btn.textContent.includes('Error')) {
                    showToast('Something went wrong. Please try again.', 'error');
                    mo.disconnect();
                }
            });
            mo.observe(btn, { childList: true, subtree: true, characterData: true });
        });
    })();

    /* ── Reality Warp: Theme Switcher ── */
    (function () {
        var core  = document.getElementById('themeCore');
        var wipe  = document.getElementById('themeWipe');
        if (!core || !wipe) return;

        var storedTheme = localStorage.getItem('portfolio-theme') || 'theme-void';
        if (storedTheme === 'void') storedTheme = 'theme-void';
        if (storedTheme === 'solar') storedTheme = 'theme-solar';
        function setThemeClass(themeName) {
            document.body.classList.remove('theme-void', 'theme-solar');
            document.body.classList.add(themeName);
        }

        setThemeClass(storedTheme);

        core.addEventListener('click', function () {
            if (wipe.classList.contains('active')) return;

            var isDark = document.body.classList.contains('theme-void');
            var nextTheme = isDark ? 'theme-solar' : 'theme-void';

            var coreRect = core.getBoundingClientRect();
            var wipeX = coreRect.left + coreRect.width / 2;
            var wipeY = coreRect.top + coreRect.height / 2;
            wipe.style.setProperty('--wipe-x', wipeX + 'px');
            wipe.style.setProperty('--wipe-y', wipeY + 'px');

            /* Prepare the wipe: set its color to the TARGET theme's background */
            wipe.style.background = isDark ? '#fcfcfd' : '#0a0b0f';
            wipe.classList.remove('fade-out');
            document.body.classList.add('theme-transitioning');

            /* Start the wipe */
            requestAnimationFrame(function () {
                wipe.classList.add('active');
            });

            /* Swap theme at peak wipe coverage */
            setTimeout(function () {
                setThemeClass(nextTheme);
                localStorage.setItem('portfolio-theme', nextTheme);
            }, 420);

            /* Fade wipe out and then cleanup classes */
            setTimeout(function () {
                wipe.classList.add('fade-out');
            }, 620);

            setTimeout(function () {
                wipe.classList.remove('active');
                wipe.classList.remove('fade-out');
                document.body.classList.remove('theme-transitioning');
            }, 980);
        });
    })();

});
