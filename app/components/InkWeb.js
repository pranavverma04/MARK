import * as THREE from "three";
/**
 * The ink web behind the MARK title. One drop of ink blooms into a wireframe globe of
 * points and threads, breathes and turns, folds back into the drop, and blooms again.
 * Ported from the Weblyy opening scene; recoloured for paper and ink, no pointer input.
 */
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const CAM = [[0, 2.4], [0.16, 3.6], [0.4, 11.5], [0.56, 7.5], [0.66, 0.6], [0.8, 10], [1, 10.4]];
function camZ(p) {
    for (let i = 1; i < CAM.length; i++) {
        if (p <= CAM[i][0]) {
            const [p0, z0] = CAM[i - 1];
            const [p1, z1] = CAM[i];
            return lerp(z0, z1, easeInOut((p - p0) / (p1 - p0)));
        }
    }
    return CAM[CAM.length - 1][1];
}
function glowTexture(size, flare = false) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = flare ? size / 8 : size;
    const g = c.getContext("2d");
    if (flare) {
        const grad = g.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, "rgba(28,37,65,0)");
        grad.addColorStop(0.35, "rgba(28,37,65,0.06)");
        grad.addColorStop(0.5, "rgba(28,37,65,0.5)");
        grad.addColorStop(0.65, "rgba(28,37,65,0.06)");
        grad.addColorStop(1, "rgba(28,37,65,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size / 8);
        const v = g.createLinearGradient(0, 0, 0, size / 8);
        v.addColorStop(0, "rgba(0,0,0,1)");
        v.addColorStop(0.5, "rgba(0,0,0,0)");
        v.addColorStop(1, "rgba(0,0,0,1)");
        g.globalCompositeOperation = "destination-out";
        g.fillStyle = v;
        g.fillRect(0, 0, size, size / 8);
    }
    else {
        const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, "rgba(28,37,65,1)");
        grad.addColorStop(0.06, "rgba(28,37,65,0.95)");
        grad.addColorStop(0.12, "rgba(28,37,65,0.12)");
        grad.addColorStop(0.35, "rgba(47,69,196,0.04)");
        grad.addColorStop(1, "rgba(47,69,196,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}
const POINT_VS = `
attribute float aAlpha; attribute float aSize; attribute vec3 aColor;
uniform float uPixel; varying float vAlpha; varying vec3 vColor;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixel / max(0.35, -mv.z); vAlpha = aAlpha; vColor = aColor; }`;
const POINT_FS = `
varying float vAlpha; varying vec3 vColor;
void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a = a * a * vAlpha; if (a < 0.003) discard; gl_FragColor = vec4(vColor, min(1.0, a * 1.2)); }`;
const LINE_VS = `
attribute float aAlpha; attribute float aT; attribute float aSeed; varying float vAlpha; varying float vT; varying float vSeed;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vAlpha = aAlpha; vT = aT; vSeed = aSeed; }`;
const LINE_FS = `
uniform float uTime; uniform vec3 uColor; uniform vec3 uPulseColor; uniform float uPulse; varying float vAlpha; varying float vT; varying float vSeed;
void main() { float carrier = step(0.84, vSeed); float head = fract(uTime * (0.25 + vSeed * 0.35) + vSeed * 13.0); float pulse = exp(-pow((vT - head) * 5.0, 2.0)) * uPulse * carrier; vec3 col = mix(uColor, uPulseColor, min(1.0, pulse)); float a = min(1.0, vAlpha * (1.0 + pulse * 2.2)); gl_FragColor = vec4(col, a); }`;
export class InkWeb {
    scene = new THREE.Scene();
    renderer;
    camera;
    opts;
    n;
    innerRange;
    spark;
    web;
    seed;
    radius;
    cur;
    webPairs;
    spokePairs = [];
    spokeIdx = [];
    pts;
    webLines;
    spokes;
    dust;
    sparkSprite;
    flare;
    lineMats = [];
    raf = 0;
    running = false;
    progress = 0;
    target = 0;
    t0 = performance.now();
    constructor(opts) {
        this.opts = opts;
        const { canvas, mobile } = opts;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: "high-performance" });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
        this.renderer.setClearColor(0x000000, 0);
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
        this.camera.position.set(0, 0, 2.4);
        const outer = mobile ? { lat: 12, lon: 22, r: 4.2 } : { lat: 15, lon: 30, r: 4.4 };
        const inner = mobile ? { lat: 7, lon: 12, r: 2.2 } : { lat: 9, lon: 18, r: 2.3 };
        const scatter = mobile ? 150 : 300;
        const nOuter = outer.lat * outer.lon, nInner = inner.lat * inner.lon;
        const n = (this.n = nOuter + nInner + scatter);
        this.innerRange = [nOuter, nOuter + nInner];
        this.spark = new Float32Array(n * 3);
        this.web = new Float32Array(n * 3);
        this.seed = new Float32Array(n);
        this.radius = new Float32Array(n);
        this.cur = new Float32Array(n * 3);
        const maxR = outer.r * 1.2;
        const put = (i, x, y, z) => { this.web[i * 3] = x; this.web[i * 3 + 1] = y; this.web[i * 3 + 2] = z; this.radius[i] = Math.hypot(x, y, z) / maxR; };
        const globe = (start, g, twist) => {
            for (let a = 0; a < g.lat; a++) {
                const phi = ((a + 1) / (g.lat + 1)) * Math.PI;
                for (let o = 0; o < g.lon; o++) {
                    const th = (o / g.lon) * Math.PI * 2 + twist * a;
                    const r = g.r * (1 + (Math.random() - 0.5) * 0.03);
                    put(start + a * g.lon + o, r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
                }
            }
        };
        globe(0, outer, 0);
        globe(nOuter, inner, 0.18);
        for (let k = 0; k < scatter; k++) {
            const i = nOuter + nInner + k;
            const u = Math.random() * 2 - 1;
            const th = Math.random() * Math.PI * 2;
            const r = inner.r + Math.random() * (outer.r * 1.35 - inner.r);
            const sq = Math.sqrt(1 - u * u);
            put(i, r * sq * Math.cos(th), r * u, r * sq * Math.sin(th));
        }
        for (let i = 0; i < n; i++) {
            this.spark[i * 3] = (Math.random() - 0.5) * 0.05;
            this.spark[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
            this.spark[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
            this.seed[i] = Math.random();
        }
        const pairs = [];
        const wire = (start, g) => { for (let a = 0; a < g.lat; a++)
            for (let o = 0; o < g.lon; o++) {
                const i = start + a * g.lon + o;
                pairs.push(i, start + a * g.lon + ((o + 1) % g.lon));
                if (a + 1 < g.lat)
                    pairs.push(i, start + (a + 1) * g.lon + o);
            } };
        wire(0, outer);
        wire(nOuter, inner);
        for (let k = 0; k < (mobile ? 24 : 48); k++)
            pairs.push(nOuter + Math.floor(Math.random() * nInner), Math.floor(Math.random() * nOuter));
        this.webPairs = pairs;
        for (let i = 0; i < nInner && this.spokeIdx.length < 36; i += Math.max(1, Math.floor(nInner / 36)))
            this.spokeIdx.push(nOuter + i);
        const pg = new THREE.BufferGeometry();
        pg.setAttribute("position", new THREE.BufferAttribute(this.cur, 3).setUsage(THREE.DynamicDrawUsage));
        pg.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage));
        const sizes = new Float32Array(n), colors = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            sizes[i] = (this.seed[i] > 0.95 ? 0.3 : 0.12 + this.seed[i] * 0.07) * (mobile ? 1.15 : 1);
            // ink points; one in twelve carries the official blue
            const blue = this.seed[i] > 0.92;
            colors[i * 3] = blue ? 0.18 : 0.11;
            colors[i * 3 + 1] = blue ? 0.27 : 0.145;
            colors[i * 3 + 2] = blue ? 0.77 : 0.25;
        }
        pg.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        pg.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
        this.pts = new THREE.Points(pg, new THREE.ShaderMaterial({ vertexShader: POINT_VS, fragmentShader: POINT_FS, uniforms: { uPixel: { value: 300 } }, transparent: true, depthWrite: false, blending: THREE.NormalBlending }));
        this.pts.frustumCulled = false;
        this.scene.add(this.pts);
        this.webLines = this.makeLines(this.webPairs, new THREE.Color(0.25, 0.29, 0.42), 1);
        this.spokeIdx.forEach((i) => this.spokePairs.push(-1, i));
        this.spokes = this.makeLines(this.spokePairs, new THREE.Color(0.18, 0.23, 0.4), 1.4);
        const dn = mobile ? 350 : 700;
        const dpos = new Float32Array(dn * 3);
        for (let i = 0; i < dn; i++) {
            dpos[i * 3] = (Math.random() - 0.5) * 60;
            dpos[i * 3 + 1] = (Math.random() - 0.5) * 36;
            dpos[i * 3 + 2] = -8 - Math.random() * 40;
        }
        const dg = new THREE.BufferGeometry();
        dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
        dg.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(dn).fill(0.14), 1));
        dg.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(dn).map(() => 0.25 + Math.random() * 0.35), 1));
        dg.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(dn * 3).fill(0.4), 3));
        this.dust = new THREE.Points(dg, this.pts.material);
        this.dust.frustumCulled = false;
        this.scene.add(this.dust);
        this.sparkSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(256), blending: THREE.NormalBlending, depthWrite: false, transparent: true }));
        this.flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(1024, true), blending: THREE.NormalBlending, depthWrite: false, transparent: true }));
        this.scene.add(this.sparkSprite, this.flare);
        this.resize();
    }
    makeLines(pairs, color, pulse) {
        const segs = pairs.length / 2;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs * 6), 3).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(segs * 2), 1).setUsage(THREE.DynamicDrawUsage));
        const t = new Float32Array(segs * 2), s = new Float32Array(segs * 2);
        for (let i = 0; i < segs; i++) {
            t[i * 2 + 1] = 1;
            const r = Math.random();
            s[i * 2] = r;
            s[i * 2 + 1] = r;
        }
        g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
        g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
        const mat = new THREE.ShaderMaterial({ vertexShader: LINE_VS, fragmentShader: LINE_FS, uniforms: { uTime: { value: 0 }, uColor: { value: color }, uPulseColor: { value: new THREE.Color(0.18, 0.27, 0.77) }, uPulse: { value: pulse } }, transparent: true, depthWrite: false, blending: THREE.NormalBlending });
        this.lineMats.push(mat);
        const l = new THREE.LineSegments(g, mat);
        l.frustumCulled = false;
        this.scene.add(l);
        return l;
    }
    resize() {
        const c = this.opts.canvas;
        const w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.pts.material.uniforms.uPixel.value = h * this.renderer.getPixelRatio() * 0.5;
        this.draw();
    }
    loopTarget(time) {
        const L = 17, t = time % L, top = 0.37;
        if (t < 4.5)
            return 0.015 + (top - 0.015) * smooth(0, 4.5, t);
        if (t < 12.5)
            return top + 0.02 * Math.sin(((t - 4.5) / 8) * Math.PI * 2);
        if (t < 15.5)
            return top - (top - 0.015) * smooth(12.5, 15.5, t);
        return 0.015;
    }
    start() { if (this.running)
        return; this.running = true; this.t0 = performance.now(); const loop = () => { if (!this.running)
        return; this.draw(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); }
    stop() { this.running = false; cancelAnimationFrame(this.raf); }
    still(p) { this.progress = this.target = p; this.draw(true); }
    draw(frozen = false) {
        const time = frozen ? 8 : (performance.now() - this.t0) / 1000;
        if (!frozen) {
            this.target = this.loopTarget(time);
            this.progress += (this.target - this.progress) * 0.06;
        }
        const p = this.progress;
        const ignite = frozen ? 1 : smooth(0.1, 1.4, time);
        const bloom = smooth(0.07, 0.42, p);
        const spin = p * 2.2 + time * 0.04;
        const cs = Math.cos(spin), sn = Math.sin(spin), csi = Math.cos(-spin * 1.4), sni = Math.sin(-spin * 1.4);
        const tilt = 0.18 * Math.sin(p * Math.PI);
        const n = this.n, cur = this.cur;
        const alpha = this.pts.geometry.getAttribute("aAlpha");
        const al = alpha.array;
        for (let i = 0; i < n; i++) {
            const i3 = i * 3, sd = this.seed[i];
            const b = smooth(this.radius[i] * 0.8, this.radius[i] * 0.8 + 0.3, bloom * 1.15);
            const br = 1 + Math.sin(time * 0.7 + this.radius[i] * 9) * 0.012;
            let wx = this.web[i3] * br + Math.sin(time * 0.6 + sd * 20) * 0.02;
            let wy = this.web[i3 + 1] * br + Math.cos(time * 0.5 + sd * 17) * 0.02;
            let wz = this.web[i3 + 2] * br;
            const inInner = i >= this.innerRange[0] && i < this.innerRange[1];
            const c2 = inInner ? csi : cs, s2 = inInner ? sni : sn;
            const rx = wx * c2 + wz * s2, rz = -wx * s2 + wz * c2;
            wx = rx;
            wz = rz;
            const ty = wy * Math.cos(tilt) - wz * Math.sin(tilt);
            wz = wy * Math.sin(tilt) + wz * Math.cos(tilt);
            wy = ty;
            cur[i3] = lerp(this.spark[i3], wx, b);
            cur[i3 + 1] = lerp(this.spark[i3 + 1], wy, b);
            cur[i3 + 2] = lerp(this.spark[i3 + 2], wz, b);
            const twinkle = 0.72 + 0.28 * Math.sin(time * 2.1 + sd * 50);
            al[i] = b * 0.95 * twinkle;
        }
        this.pts.geometry.getAttribute("position").needsUpdate = true;
        alpha.needsUpdate = true;
        this.fillLines(this.webLines, this.webPairs, (i, j) => Math.min(smooth(this.radius[i] * 0.8 + 0.1, this.radius[i] * 0.8 + 0.4, bloom * 1.15), smooth(this.radius[j] * 0.8 + 0.1, this.radius[j] * 0.8 + 0.4, bloom * 1.15)) * 0.55);
        const spokeA = smooth(0.05, 0.2, p) * (1 - smooth(0.4, 0.58, p)) * (1 - smooth(0.22, 0.33, p));
        this.fillLines(this.spokes, this.spokePairs, () => spokeA * 0.9);
        for (const m of this.lineMats)
            m.uniforms.uTime.value = time;
        const sparkI = ignite * (0.85 + 0.15 * Math.sin(time * 3));
        const sparkS = lerp(0.5, 0.35, bloom) * (1 + 0.06 * Math.sin(time * 2.2));
        this.sparkSprite.scale.set(sparkS, sparkS, 1);
        this.sparkSprite.material.opacity = sparkI;
        this.flare.scale.set(lerp(7, 4, bloom) * ignite, lerp(0.25, 0.15, bloom) * ignite, 1);
        this.flare.material.opacity = sparkI * lerp(0.35, 0.12, bloom);
        let z = camZ(p);
        if (this.camera.aspect < 1)
            z *= Math.min(1.6, 0.72 / this.camera.aspect);
        this.camera.position.set(Math.sin(time * 0.2) * 0.08, Math.cos(time * 0.17) * 0.05, z);
        this.camera.lookAt(0, 0, 0);
        this.dust.position.y = p * 3;
        this.renderer.render(this.scene, this.camera);
    }
    fillLines(obj, pairs, alphaOf) {
        const pos = obj.geometry.getAttribute("position"), al = obj.geometry.getAttribute("aAlpha");
        const pa = pos.array, aa = al.array, cur = this.cur;
        let any = false;
        for (let s = 0; s < pairs.length / 2; s++) {
            const i = pairs[s * 2], j = pairs[s * 2 + 1];
            const a = alphaOf(Math.max(i, 0), j);
            aa[s * 2] = a;
            aa[s * 2 + 1] = a;
            if (a > 0.002)
                any = true;
            if (i < 0) {
                pa[s * 6] = pa[s * 6 + 1] = pa[s * 6 + 2] = 0;
            }
            else {
                pa[s * 6] = cur[i * 3];
                pa[s * 6 + 1] = cur[i * 3 + 1];
                pa[s * 6 + 2] = cur[i * 3 + 2];
            }
            pa[s * 6 + 3] = cur[j * 3];
            pa[s * 6 + 4] = cur[j * 3 + 1];
            pa[s * 6 + 5] = cur[j * 3 + 2];
        }
        obj.visible = any;
        pos.needsUpdate = true;
        al.needsUpdate = true;
    }
    dispose() {
        this.stop();
        this.scene.traverse((o) => { const m = o; m.geometry?.dispose?.(); m.material?.dispose?.(); });
        this.renderer.dispose();
    }
}
