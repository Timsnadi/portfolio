document.addEventListener('DOMContentLoaded', function () {




    (function () {
        var preloader = document.getElementById('preloader');
        if (!preloader) return;

        document.body.style.overflow = 'hidden';

        function dismiss() {
            preloader.classList.add('done');
            document.body.style.overflow = '';
        }


        var start = Date.now();
        function onReady() {
            var elapsed = Date.now() - start;
            var remaining = Math.max(0, 3000 - elapsed);
            setTimeout(dismiss, remaining);
        }

        if (document.readyState === 'complete') {
            onReady();
        } else {
            window.addEventListener('load', onReady);

            setTimeout(dismiss, 4000);
        }
    })();


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

            function drawOrbs() {
                var orbs = [
                    { x:W*0.15+Math.sin(t*0.0007)*70, y:H*0.25+Math.cos(t*0.0009)*55, r:380, c:'239,68,68', o:0.06 },
                    { x:W*0.85+Math.cos(t*0.0006)*75, y:H*0.75+Math.sin(t*0.0008)*60, r:320, c:'107,114,128', o:0.06 },
                    { x:W*0.5 +Math.sin(t*0.0005)*90, y:H*0.45+Math.cos(t*0.0007)*45, r:240, c:'153,27,27', o:0.03 }
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
                ctx.strokeStyle = 'rgba(239,68,68,0.04)';
                ctx.lineWidth = 1;
                for (var x=0; x<W; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
                for (var y=0; y<H; y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
            }

            function drawMouseGlow() {
                if (mouse.x < 0 || isMobile) return;
                var gr   = mouse.down ? ATTRACT * 1.3 : ATTRACT;
                var col = mouse.down ? '55,65,81' : '239,68,68';
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
                    var col2 = d.burst ? '153,27,27' : '239,68,68';
                    ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
                    ctx.fillStyle = 'rgba('+col2+','+al+')'; ctx.fill();
                });
            }

            function drawLines() {
                for (var i=0; i<dots.length; i++) {
                    for (var j=i+1; j<dots.length; j++) {
                        var dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y;
                        var d=Math.sqrt(dx*dx+dy*dy);
                        if (d < CONNECT) {
                            ctx.strokeStyle='rgba(239,68,68,'+(1-d/CONNECT)*0.15+')';
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
    var progressPath = document.getElementById('progressPath');
    var pathLength = progressPath ? progressPath.getTotalLength() : 0;

    if (progressPath) {
        progressPath.style.strokeDasharray  = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
    }

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY;
        if (scrollY > 60) {
            if (nav) nav.classList.add('scrolled');
            if (btt) btt.classList.add('show');
        } else {
            if (nav) nav.classList.remove('scrolled');
            if (btt) btt.classList.remove('show');
        }

        if (progressPath) {
            var height   = document.documentElement.scrollHeight - window.innerHeight;
            var progress = pathLength - (scrollY * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
    });


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

});
