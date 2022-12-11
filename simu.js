const dt = 0.1;
const nearpos = 8
const tooNear = nearpos / 2;
const farpos = 20;
const tooFar = farpos * 1.5;

const setPos = (o) => {
    o.e.setAttribute("cx", o.p.x);
    o.e.setAttribute("cy", o.p.y);
};
const cori = (env) => {
    for (const o of env.objs) {
        vx = o.v.x;
        vy = o.v.y;
        o.v.x += vy * env.cori * dt;
        o.v.y -= vx * env.cori * dt;
    }
};

const friction = (env) => {
    for (const o of env.objs) {
        o.v.x *= env.friction;
        o.v.y *= env.friction;
    }
};


const interact = (env) => {
    for (let ia = 1; ia < env.objs.length; ia++) {
        const a = env.objs[ia];
        for (let ib = 0; ib < ia; ib++) {
            const b = env.objs[ib];
            const abx = a.p.x - b.p.x;
            const aby = a.p.y - b.p.y;
            const t = Math.atan2(aby, abx);
            const d2 = abx ** 2 + aby ** 2;
            const accdt = env.repel * dt / (d2 + 1e-9);
            const dvx = Math.cos(t) * accdt;
            const dvy = Math.sin(t) * accdt;
            a.v.x += dvx;
            a.v.y += dvy;
            b.v.x -= dvx;
            b.v.y -= dvy;
        }
    }
};

const remove = (o) => {
    const g = document.getElementById("g");
    g.removeChild(o.e);
};

const update = (env) => {
    let objs = [];
    const n = env.objs.length;
    for (const o of env.objs) {
        const r = (o.p.x ** 2 + o.p.y ** 2) ** 0.5;
        if (r < tooNear || tooFar < r) {
            remove(o);
            continue;
        }
        const t = Math.atan2(o.p.y, o.p.x)
        const a = env.attract(r);
        o.v.x += a * Math.cos(t) * dt;
        o.v.y += a * Math.sin(t) * dt;
        o.p.x += o.v.x * dt;
        o.p.y += o.v.y * dt;
        objs.push(o);
    }
    env.objs = objs;
    while (env.objs.length < n) {
        const t = Math.random() * Math.PI * 2;
        const r = farpos + Math.random() - 0.5;
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        env.objs.push(createObj({ x: x, y: y }));
    }

};

const run = (env) => {
    const t0 = performance.now() + 1000 / 60 / 2;
    while (performance.now() < t0) {
        cori(env);
        friction(env);
        interact(env);
        update(env)
    }
    for (const o of env.objs) {
        setPos(o);
    }
};

let globalTimerId = null;

const createObj = (p) => {
    const g = document.getElementById("g");
    const svgNS = "http://www.w3.org/2000/svg";
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("r", 0.1);
    const o = {
        p: p,
        v: { x: 0, y: 0 },
        e: circle,
    };
    setPos(o);
    g.appendChild(circle);
    return o;
};
const clearCircles = () => {
    const g = document.getElementById("g");
    for (; ;) {
        const c = g.firstChild;
        if (!c) {
            return;
        }
        g.removeChild(c);
    }
};
const formNum = (id) => {
    const e = document.getElementById(id);
    return parseFloat(e.value);
}
const start = () => {
    if (globalTimerId != null) {
        clearInterval(globalTimerId);
    }
    clearCircles();
    const objs = [];
    const parcount = formNum("parcount");
    const dist = (farpos - nearpos) / parcount;
    for (let r = nearpos; r < farpos; r += dist) {
        const c = Math.round(r * Math.PI * 2 / dist);
        const tbase = Math.random()
        for (let t0 = 0; t0 < c; t0++) {
            const t = t0 + tbase;
            const rv = r + Math.random() - 0.5;
            let x = rv * Math.cos(t);
            let y = rv * Math.sin(t);
            objs.push(createObj({ x: x, y: y }));
        }
    }
    const attract = formNum("attract");
    const env = {
        attract: (r) => { return -attract / (1e-9 + r * r); },
        cori: formNum("cori"),
        friction: 1 - formNum("friction"),
        repel: formNum("repel"),
        objs: objs,
    };
    console.log("start!");
    globalTimerId = setInterval(() => { run(env) }, 1000 / 60);
};