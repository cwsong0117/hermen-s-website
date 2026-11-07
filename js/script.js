(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasObserver = 'IntersectionObserver' in window;

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let background = null;

    /* ---------- Toast ---------- */
    const toastEl = $('#toast');
    let toastTimer;

    function toast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    /* ---------- Theme (dark / light) ---------- */
    const themeBtn = $('#theme-toggle');

    function setTheme(theme, save = true) {
        root.setAttribute('data-theme', theme);
        if (themeBtn) {
            themeBtn.firstElementChild.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        }
        if (save) {
            try {
                localStorage.setItem('theme', theme);
            } catch (e) { /* storage blocked: the theme just won't be remembered */ }
        }
        if (background) background.refreshColors();
    }

    function toggleTheme() {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
        return next;
    }

    /* ---------- Header: mobile menu, scroll progress, active link ---------- */
    function initHeader() {
        const header = $('header');
        const nav = $('#site-nav');
        const navToggle = $('#nav-toggle');

        function closeNav() {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
        }

        navToggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
        nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeNav();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('header')) closeNav();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNav();
        });

        let ticking = false;
        function updateProgress() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const max = root.scrollHeight - window.innerHeight;
                header.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
                ticking = false;
            });
        }
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();

        if (!hasObserver) return;
        const links = $$('nav a');
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((link) => {
                    const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
                    link.classList.toggle('active', isCurrent);
                    if (isCurrent) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('main section[id]').forEach((section) => spy.observe(section));
    }

    /* ---------- Scroll reveal + count-up numbers ---------- */
    function countUp(el) {
        const target = Number(el.dataset.count);
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased).toLocaleString();
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function initReveal() {
        const items = $$('[data-reveal]');
        const counters = $$('[data-count]');

        if (reduceMotion || !hasObserver) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        items.forEach((el) => revealObserver.observe(el));

        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                countObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => countObserver.observe(el));
    }

    /* ---------- Hero typing effect ---------- */
    function initTyped() {
        const el = $('[data-typed]');
        if (!el) return;
        const phrases = el.dataset.typed.split('|').map((text) => Array.from(text));
        if (reduceMotion) {
            el.textContent = phrases[0].join('');
            return;
        }

        let phrase = 0;
        let length = 0;
        let deleting = false;

        function tick() {
            length += deleting ? -1 : 1;
            el.textContent = phrases[phrase].slice(0, length).join('');

            let delay = deleting ? 28 : 55;
            if (!deleting && length === phrases[phrase].length) {
                deleting = true;
                delay = 1700;
            } else if (deleting && length === 0) {
                deleting = false;
                phrase = (phrase + 1) % phrases.length;
                delay = 400;
            }
            setTimeout(tick, delay);
        }

        el.textContent = '';
        setTimeout(tick, 900);
    }

    /* ---------- Floating code glyphs in the background ---------- */
    function initGlyphs() {
        const box = $('#glyphs');
        if (!box || reduceMotion) return;

        const glyphs = ['{ }', '</>', ';', '=>', '404', '0101', 'sudo', '[]', '&&', '!=', '🐛', '☕', '🦆', 'git push', 'NaN', 'null'];
        const count = window.innerWidth < 700 ? 8 : 16;

        for (let i = 0; i < count; i++) {
            const glyph = document.createElement('span');
            glyph.textContent = pick(glyphs);
            glyph.style.left = (Math.random() * 100).toFixed(1) + '%';
            glyph.style.fontSize = (14 + Math.random() * 16).toFixed(0) + 'px';
            glyph.style.setProperty('--o', (0.06 + Math.random() * 0.12).toFixed(2));
            glyph.style.setProperty('--dur', (22 + Math.random() * 28).toFixed(0) + 's');
            glyph.style.setProperty('--delay', '-' + (Math.random() * 40).toFixed(0) + 's');
            glyph.style.setProperty('--drift', (Math.random() * 120 - 60).toFixed(0) + 'px');
            glyph.style.setProperty('--rot', (Math.random() * 60 - 30).toFixed(0) + 'deg');
            box.appendChild(glyph);
        }
    }

    /* ---------- Background canvas: network of dots (and a matrix mode) ---------- */
    function initBackground() {
        const canvas = $('#bg-canvas');
        if (!canvas || !canvas.getContext) return null;

        const ctx = canvas.getContext('2d');
        const mouse = { x: -9999, y: -9999 };
        const LINK = 130;
        const MOUSE_LINK = 170;
        const FONT = 16;
        const SYMBOLS = '01{}[]<>/;=+*$#'.split('');

        let width = 0;
        let height = 0;
        let nodes = [];
        let drops = [];
        let mode = 'network';
        let frame = 0;
        let colors = readColors();

        function readColors() {
            const style = getComputedStyle(root);
            const get = (name) => style.getPropertyValue(name).trim();
            return { a: get('--accent'), b: get('--accent-2'), good: get('--good'), bg: get('--bg') };
        }

        function resize(force) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // mobile address bars resize the window constantly: ignore small height changes
            if (!force && Math.abs(w - width) < 1 && Math.abs(h - height) < 120) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = w;
            height = h;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(90, Math.max(24, Math.floor((w * h) / 17000)));
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: 1 + Math.random() * 1.6
            }));
            drops = Array.from({ length: Math.ceil(w / FONT) }, () => Math.random() * -50);

            if (reduceMotion) drawNetwork(false);
        }

        function drawNetwork(move = true) {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = colors.a;
            ctx.lineWidth = 1;

            for (const node of nodes) {
                if (move) {
                    node.x += node.vx;
                    node.y += node.vy;
                    if (node.x < 0 || node.x > width) node.vx *= -1;
                    if (node.y < 0 || node.y > height) node.vy *= -1;
                }
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < LINK * LINK) {
                        ctx.globalAlpha = (1 - Math.sqrt(distSq) / LINK) * 0.35;
                        ctx.strokeStyle = colors.a;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                const mx = a.x - mouse.x;
                const my = a.y - mouse.y;
                const mouseDistSq = mx * mx + my * my;
                if (mouseDistSq < MOUSE_LINK * MOUSE_LINK) {
                    ctx.globalAlpha = (1 - Math.sqrt(mouseDistSq) / MOUSE_LINK) * 0.6;
                    ctx.strokeStyle = colors.b;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawMatrix() {
            // a faint wash of the page colour leaves the fading trails behind each glyph
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = colors.bg;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = colors.good;
            ctx.font = FONT + 'px monospace';
            drops.forEach((row, i) => {
                ctx.fillText(pick(SYMBOLS), i * FONT, row * FONT);
                drops[i] = row * FONT > height && Math.random() > 0.975 ? 0 : row + 1;
            });
            ctx.globalAlpha = 1;
        }

        function loop() {
            frame++;
            if (mode === 'matrix') {
                if (frame % 3 === 0) drawMatrix();
            } else {
                drawNetwork();
            }
            requestAnimationFrame(loop);
        }

        resize(true);
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => resize(false), 150);
        });

        if (canHover) {
            window.addEventListener('pointermove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            }, { passive: true });
            document.addEventListener('pointerleave', () => {
                mouse.x = -9999;
                mouse.y = -9999;
            });
        }

        if (!reduceMotion) requestAnimationFrame(loop);

        return {
            setMode(next) {
                mode = next;
                ctx.clearRect(0, 0, width, height);
            },
            refreshColors() {
                colors = readColors();
                if (reduceMotion) drawNetwork(false);
            }
        };
    }

    /* ---------- Cursor glow, card spotlight and tilt ---------- */
    function initPointerEffects() {
        const glow = $('#cursor-glow');
        if (glow && canHover && !reduceMotion) {
            window.addEventListener('pointermove', (e) => {
                glow.style.transform = 'translate3d(' + (e.clientX - 240) + 'px, ' + (e.clientY - 240) + 'px, 0)';
                glow.classList.add('on');
            }, { passive: true });
            document.addEventListener('pointerleave', () => glow.classList.remove('on'));
        }

        $$('[data-spotlight]').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');

                if (card.hasAttribute('data-tilt') && !reduceMotion && e.pointerType === 'mouse') {
                    card.style.setProperty('--ry', ((x / rect.width - 0.5) * 8).toFixed(2) + 'deg');
                    card.style.setProperty('--rx', ((0.5 - y / rect.height) * 8).toFixed(2) + 'deg');
                }
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ---------- Copy email ---------- */
    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            const box = document.createElement('textarea');
            box.value = text;
            box.style.position = 'fixed';
            box.style.opacity = '0';
            document.body.appendChild(box);
            box.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (err) {
                ok = false;
            }
            box.remove();
            return ok;
        }
    }

    function initCopy() {
        $$('[data-copy-from]').forEach((button) => {
            button.addEventListener('click', async () => {
                const source = $(button.dataset.copyFrom);
                if (!source) return;
                const ok = await copyText(source.textContent.trim());
                toast(ok ? 'Copied! 📋' : 'Could not copy. Please copy it by hand.');
            });
        });
    }

    /* ---------- Party mode (confetti), shake, duck ---------- */
    function confetti() {
        if (reduceMotion) return;
        const palette = ['#22d3ee', '#a78bfa', '#fbbf24', '#4ade80', '#f472b6'];
        const layer = document.createElement('div');
        layer.className = 'confetti-layer';
        layer.setAttribute('aria-hidden', 'true');

        for (let i = 0; i < 80; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti';
            piece.style.left = (Math.random() * 100).toFixed(1) + '%';
            piece.style.setProperty('--c', pick(palette));
            piece.style.setProperty('--s', (6 + Math.random() * 8).toFixed(0) + 'px');
            piece.style.setProperty('--t', (2.6 + Math.random() * 2).toFixed(1) + 's');
            piece.style.setProperty('--dl', (Math.random() * 0.6).toFixed(2) + 's');
            piece.style.setProperty('--dx', (Math.random() * 240 - 120).toFixed(0) + 'px');
            piece.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg');
            layer.appendChild(piece);
        }
        document.body.appendChild(layer);
        setTimeout(() => layer.remove(), 5500);
    }

    function partyMode() {
        toast('🎉 Party mode unlocked!');
        confetti();
        if (reduceMotion) return;
        root.classList.add('party');
        setTimeout(() => root.classList.remove('party'), 6000);
    }

    function shake() {
        const main = $('main');
        if (reduceMotion || !main) return;
        main.classList.add('shake');
        setTimeout(() => main.classList.remove('shake'), 600);
    }

    function initKonami() {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let index = 0;

        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea')) return;
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key === code[index]) index++;
            else index = key === code[0] ? 1 : 0;

            if (index === code.length) {
                index = 0;
                partyMode();
            }
        });
    }

    function initDuck() {
        const duck = $('#duck');
        const bubble = $('#duck-bubble');
        if (!duck || !bubble) return;

        const tips = [ // TODO(content): optional, edit or add the rubber duck's tips
            'Explain your bug to me. I will nod wisely. Quack.',
            'Have you tried turning it off and on again?',
            'It is always the semicolon. Or the cache.',
            'Did you save the file? (Be honest.)',
            'console.log("here") is a time-honoured debugger.',
            'Take a break. The bug will still be there. Quack.',
            '*aggressive quacking*',
            'Works on your machine? Ship it. (Please do not.)'
        ];
        let timer;

        duck.addEventListener('click', () => {
            bubble.textContent = pick(tips);
            bubble.classList.add('show');
            clearTimeout(timer);
            timer = setTimeout(() => bubble.classList.remove('show'), 4200);
        });
    }

    /* ---------- Interactive terminal ---------- */
    function initTerminal() {
        const out = $('#term-out');
        const form = $('#term-form');
        const input = $('#term-input');
        if (!out || !form || !input) return;

        const PROMPT = 'visitor@web:~$';
        const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];
        const jokes = [
            'Why do programmers prefer dark mode? Because light attracts bugs.',
            "There are 10 kinds of people: those who understand binary and those who don't.",
            "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
            "I'd tell you a UDP joke, but you might not get it.",
            "It's not a bug, it's an undocumented feature.",
            'Debugging: being the detective in a crime movie where you are also the culprit.'
        ];
        const cup = [
            '    ( (',
            '     ) )',
            '  ........',
            '  |      |]',
            '  \\      /',
            "   `----'"
        ];
        const history = [];
        let historyIndex = 0;

        function scrollDown() {
            out.scrollTop = out.scrollHeight;
        }

        function print(text = '', kind = '') {
            const line = document.createElement('div');
            line.className = 'line' + (kind ? ' line--' + kind : '');
            line.textContent = text;
            out.appendChild(line);
            scrollDown();
        }

        function printLink(label, text, href) {
            const line = document.createElement('div');
            line.className = 'line';
            const link = document.createElement('a');
            link.textContent = text;
            link.href = href;
            if (/^https?:/.test(href)) {
                link.target = '_blank';
                link.rel = 'noopener';
            }
            line.append(label.padEnd(10), link);
            out.appendChild(line);
            scrollDown();
        }

        function printCommand(text) {
            const line = document.createElement('div');
            line.className = 'line line--cmd';
            const prompt = document.createElement('span');
            prompt.className = 'p';
            prompt.textContent = PROMPT + ' ';
            line.append(prompt, document.createTextNode(text));
            out.appendChild(line);
            scrollDown();
        }

        const commands = {
            help() {
                print('Available commands:', 'dim');
                [
                    ['whoami', 'who is this person?'],
                    ['skills', 'what can they do?'],
                    ['projects', 'what have they built?'],
                    ['contact', 'how to reach them'],
                    ['cd <section>', 'jump to a section'],
                    ['coffee', 'brew something'],
                    ['joke', 'a dev joke (sorry)'],
                    ['theme', 'toggle dark / light'],
                    ['matrix', 'wake up, visitor...'],
                    ['party', 'celebrate good times'],
                    ['clear', 'clean the screen']
                ].forEach(([name, description]) => print('  ' + name.padEnd(14) + description));
                print('Psst... a few commands are hidden. Try sudo.', 'dim');
            },
            whoami() {
                print('hermen: final-year Software Engineering student, professional bug creator, full-time coffee enthusiast.'); // TODO(content): describe yourself in one line
            },
            pwd() {
                print('/home/visitor/hermen-portfolio');
            },
            ls() {
                print('about/  skills/  projects/  contact/  secrets.txt');
            },
            cat(args) {
                const file = args[0];
                if (!file) print('cat: missing file (try: cat secrets.txt)', 'err');
                else if (file === 'secrets.txt') print('Permission denied. Nice try though 🕵️', 'err');
                else print('cat: ' + file + ': No such file or directory', 'err');
            },
            cd(args) {
                const target = (args[0] || '').replace(/\/$/, '');
                if (target === '..') {
                    print("You can't escape the portfolio that easily 😏", 'err');
                } else if (SECTIONS.includes(target)) {
                    print('Teleporting to ' + target + '...', 'ok');
                    document.getElementById(target).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
                } else {
                    print('cd: ' + (target || '(nothing)') + ': no such section. Try: about, skills, projects, contact', 'err');
                }
            },
            skills() {
                const names = $$('.skill__name').map((el) => el.textContent.trim());
                print(names.length ? names.join('  •  ') : 'Still learning...');
            },
            projects() {
                $$('.project h3').forEach((title, i) => print((i + 1) + '. ' + title.textContent.trim()));
                print('Scroll up to see the details.', 'dim');
            },
            contact() {
                $$('[data-contact]').forEach((link) => {
                    printLink(link.dataset.contact, link.textContent.trim(), link.getAttribute('href'));
                });
            },
            async coffee() {
                print('Grinding beans...', 'dim');
                await sleep(450);
                print('Brewing...', 'dim');
                await sleep(550);
                cup.forEach((row) => print(row));
                print('Productivity +42%. Sleep -1 night. Worth it.', 'ok');
            },
            joke() {
                print(pick(jokes));
            },
            theme() {
                print('Theme switched to ' + toggleTheme() + ' mode.', 'ok');
            },
            matrix() {
                if (reduceMotion || !background) {
                    print('Matrix mode is off because your system prefers reduced motion.', 'dim');
                    return;
                }
                print('Wake up, visitor... the site has you.', 'ok');
                background.setMode('matrix');
                setTimeout(() => background.setMode('network'), 7000);
            },
            party() {
                print('🎉 Woohoo!', 'ok');
                partyMode();
            },
            sudo(args) {
                const rest = args.join(' ');
                if (/^hire\b/.test(rest)) {
                    print('[sudo] password for visitor: ********', 'dim');
                    print('Access granted. 🎉 Offer letter incoming... (or just use the email link, the HR-friendly version.)', 'ok');
                    partyMode();
                } else if (/^rm\s+-rf\s+\/\*?$/.test(rest)) {
                    print('Nice try. Deleting your sanity... 100%', 'err');
                    print('Just kidding, this is a static website. Nothing to delete but my dignity.', 'dim');
                    shake();
                } else {
                    print('visitor is not in the sudoers file. This incident will be reported (to the rubber duck 🦆).', 'err');
                }
            },
            echo(args) {
                print(args.join(' '));
            },
            konami() {
                print('↑ ↑ ↓ ↓ ← → ← → B A  (press them outside the terminal)', 'dim');
            },
            exit() {
                print('There is no escape. Scroll up instead 🚪', 'err');
            },
            clear() {
                out.textContent = '';
            }
        };

        function run(raw) {
            const line = raw.trim();
            if (!line) return;
            printCommand(line);
            history.push(line);
            historyIndex = history.length;

            const [name, ...args] = line.split(/\s+/);
            const key = name.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(commands, key)) commands[key](args);
            else print('command not found: ' + name + ". Try 'help'.", 'err');
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            run(input.value);
            input.value = '';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) input.value = history[--historyIndex];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                historyIndex = Math.min(historyIndex + 1, history.length);
                input.value = history[historyIndex] || '';
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const typed = input.value.trim().toLowerCase();
                if (!typed) return;
                const matches = Object.keys(commands).filter((name) => name.startsWith(typed));
                if (matches.length === 1) input.value = matches[0] + ' ';
                else if (matches.length > 1) print(matches.join('  '), 'dim');
            }
        });

        $$('[data-cmd]').forEach((button) => {
            button.addEventListener('click', () => run(button.dataset.cmd));
        });

        out.addEventListener('click', () => {
            if (!window.getSelection().toString()) input.focus({ preventScroll: true });
        });

        print('HermenOS 1.0 (totally a real operating system)', 'dim');
        print('Type "help", or tap a command below.', 'dim');
    }

    /* ---------- Start everything ---------- */
    background = initBackground();
    setTheme(root.getAttribute('data-theme') || 'dark', false);
    themeBtn.addEventListener('click', toggleTheme);

    initHeader();
    initReveal();
    initTyped();
    initGlyphs();
    initPointerEffects();
    initCopy();
    initKonami();
    initDuck();
    initTerminal();

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    console.log('%cHey, fellow human 👋', 'font: 700 18px monospace; color: #22d3ee;');
    console.log('Poking around in DevTools? Respect. The source is here: https://github.com/cwsong0117/hermen-s-website');
})();
