/*
-----------------------------------------Changelog-----------------------------------------
02/11/2023
 • created gravity physics
 • imported functions
- Tom Qiu

08/11/2023
 • added inner solar system
- Tom Qiu

-------------------------------------------------------------------------------------------
*/

var mousepos = {x: 0, y: 0};
var display = {x:window.innerWidth, y:window.innerHeight};
var keyboard = {};
window.onkeyup = function(e) {
    keyboard[e.key.toLowerCase()] = false; 
};
window.onkeydown = function(e) {
    keyboard[e.key.toLowerCase()] = true; 
    e.preventDefault();
};
document.addEventListener('mousedown', function(event) {
    if (event.button === 0) { // Check if left mouse button was clicked
        keyboard.click = true;
    }
});
document.addEventListener('mouseup', function(event) {
    if (event.button === 0) { // Check if left mouse button was released
        keyboard.click = false;
    }
});
window.addEventListener("resize", function () {
    if (t > 0) {
        display = {x:window.innerWidth,y:window.innerHeight};
        replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas><canvas id="canvasOverlay" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 2;"></canvas>`);
    }
});
function tellPos(p){
    mousepos = {x: p.pageX, y:p.pageY};
};
window.addEventListener('mousemove', tellPos, false);

async function load() {
    console.log('Startin the game...');
    replacehtml(`<canvas id="main" width="${display.x}" height="${display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas>`);
    await sleep(100);
    game();
};

function randchoice(list, remove=false) { // chose 1 from a list and update list
    let length = list.length;
    let choice = randint(0, length-1);
    if (remove) {
        let chosen = list.splice(choice, 1);
        return [chosen, list];
    }
    return list[choice];
};

function randint(min, max, notequalto=false) { // Randint returns random interger between min and max (both included)
    if (max - min <= 1) {
        return min;
    }
    var gen = Math.floor(Math.random() * (max - min + 1)) + min;
    var i = 0;
    while (gen != min && gen != max && notequalto && i < 100) { // loop max 100 times
        gen = Math.floor(Math.random() * (max - min + 1)) + min;
        i += 1;
        console.log('calculating...');
    }
    if (i >= 100) {
        console.log('ERROR: could not generate suitable number');
    }
    return gen;
};

function replacehtml(text) {
    document.getElementById("game").innerHTML = text;
};

function clearCanvas(canvas) {
    var c = document.getElementById(canvas);
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, display.x, display.y);
    ctx.restore();
};

function drawLine(canvas, pos, r, length, relative, style) {
    var c = document.getElementById(canvas);
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (style) {
        ctx.strokeStyle = style.colour;
        ctx.lineWidth = style.width;
    }
    ctx.beginPath();
    ctx.moveTo(pos.x+relative.x, -pos.y+relative.y);
    ctx.lineTo(pos.x+relative.x + length * Math.cos(r), -pos.y+relative.y + length * Math.sin(r));
    ctx.stroke();
    ctx.restore();
};

function getDist(sPos, tPos) { 
    // Mathematics METHods
    var dx = tPos.x - sPos.x;
    var dy = tPos.y - sPos.y;
    var dist = Math.sqrt(dx*dx+dy*dy);
    return dist;
};

function correctAngle(a) {
    a = a%(Math.PI*2);
    if (a < 0) {
        a += Math.PI*2;
    }
    return a;
};

function adjustAngle(a) {
    if (a > Math.PI) {
        a -= 2*Math.PI;
    }
    return a;
};

function rotateAngle(r, rTarget, increment) {
    if (Math.abs(r) > Math.PI*4 || Math.abs(rTarget) > Math.PI*4) {
        throw "Error: You f*cked up the angle thing again...";
    }
    if (r == rTarget) {
        return correctAngle(r);
    }else if (rTarget - r <= Math.PI && rTarget - r > 0) {
        if (rTarget - r < increment) {
            r = rTarget;
        } else {
            r += increment;
        }
        return r;
    } else if (r - rTarget < Math.PI && r - rTarget > 0) {
        if (r - rTarget < increment) {
            r = rTarget;
        } else {
            r -= increment;
        }
        return correctAngle(r);
    } else {
        if (r < rTarget) {
            r += Math.PI*2;
        } else {
            rTarget += Math.PI*2;
        }
        return correctAngle(rotateAngle(r, rTarget, increment));
    }
};

function aim(initial, final) {
    if (initial == final) { 
        return 0;
    }
    let diff = {x: final.x - initial.x, y: final.y - initial.y};
    if (diff.x == 0) {
        if (diff.y > 0) {
            return Math.PI/2;
        } else {
            return 3*Math.PI/2;
        }
    } else if (diff.y == 0) {
        if (diff.x > 0) {
            return 0;
        } else {
            return Math.PI;
        }
    }
    let angle = Math.atan(Math.abs(diff.y / diff.x));
    if (diff.x > 0 && diff.y > 0) {
        return angle;
    } else if (diff.x < 0 && diff.y > 0) {
        return Math.PI - angle;
    } else if (diff.x < 0 && diff.y < 0) {
        return Math.PI + angle;
    } else if (diff.x > 0 && diff.y < 0) {
        return Math.PI*2 - angle;
    }
    throw `You f*cked up again (aim): ${angle}`;
};

function toComponent(m, r) {
    return {x: m * Math.cos(r), y: m * Math.sin(r)};
};

function toPol(i, j) {
    return {m: Math.sqrt(i**2+j**2), r: aim({x: 0, y: 0}, {x: i, y: j})};
};

function roman(number) {
    if (number <= 0 || number >= 4000) {
        var symbols = ['0','1','2','3','4','5','6','7','8','9','¡','£','¢','∞','§','¶','œ','ß','∂','∫','∆','√','µ','†','¥','ø'];
        return `${randchoice(symbols)}${randchoice(symbols)}${randchoice(symbols)}`;
    }
    
    const romanNumerals = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    
    let romanNumeral = '';
    
    for (let key in romanNumerals) {
        while (number >= romanNumerals[key]) {
            romanNumeral += key;
            number -= romanNumerals[key];
        }
    }
    return romanNumeral;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function toColour(colour) {
    return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
};

function drawCircle(canvas, x, y, radius, fill, stroke, strokeWidth, relative) { // draw a circle
    var canvas = document.getElementById(canvas);
    var ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.beginPath();
    ctx.arc(x+relative.x, -y+relative.y, radius, 0, 2 * Math.PI, false);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
};

function displaytxt(canvas, txt, pos, relative) {
    var canvas = document.getElementById(canvas);
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Set the font and text color
    ctx.font = "20px Verdana";
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    // Display the points on the canvas
    ctx.fillText(txt, pos.x+relative.x, -pos.y-relative.y);
    ctx.stroke();
    ctx.restore();
};

function grid(canvas, spacing, relative, lineStyle) {
    for (let i = 0; i >= -display.x/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: i, y: display.y/2 + spacing}, Math.PI/2, (display.y + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i <= display.x/2 + spacing ; i += spacing) {
        drawLine(canvas, {x: i, y: display.y/2 + spacing}, Math.PI/2, (display.y + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i >= -display.y/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: -display.x/2 - spacing, y: i}, 0, (display.x + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i <= display.y/2 + spacing; i += spacing) {
        drawLine(canvas, {x: -display.x/2 - spacing, y: i}, 0, (display.x + spacing*2), relative, lineStyle);
    }
};

function normalDistribution(mean, sDiv) {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); 
    while (v === 0) v = Math.random(); 
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sDiv;
};

function sphereVolume(r) { // volume of a sphere
    return 4/3*Math.PI*r**3;
};

function vMath(v1, v2, mode) {
    switch (mode) {
        case '||':
        case 'magnitude':
            return Math.sqrt(v1.x**2+v1.y**2);
        case '+': 
        case 'addition':
        case 'add':
            return {x: v1.x+v2.x, y: v1.y+v2.y};
        case '-': 
        case 'subtraction':
        case 'subtract':
            return {x: v1.x-v2.x, y: v1.y-v2.y};
        case '*': 
        case 'x': 
        case 'scalar multiplication':
        case 'multiplication':
        case 'multiply': // v2 is now a scalar
            return {x: v1.x*v2, y: v1.y*v2};
        case '/': 
        case 'division':
        case 'divide': // v2 is now a scalar
            return {x: v1.x/v2, y: v1.y/v2};
        case '•': 
        case '.': 
        case 'dot product': 
            return v1.x * v2.x + v1.y * v2.y;
        case 'cross product': // chat gpt, I believe in you (I doubt this is correct)
            return v1.x * v2.y - v1.y * v2.x;
        case 'projection':
        case 'vector resolute':
        return vMath(v2, vMath(v1, v2, '.')/vMath(v2, null, '||')**2, 'x');
        default:
            throw 'what are you trying to do to to that poor vector?';
    }
};

function toDeg(rad) {
    return rad * 180 / Math.PI;
};

function toRad(deg) {
    return deg / 180 * Math.PI;
};

function mass(p) {
    return sphereVolume(p.r*data.constants.scale)*p.p;
};

const data = {
    constants: {
        mass: 'kg',
        length: 'm',
        edgeMode: 'none',
        scale: 1000000000,   // 1 px = x m
        upSize: 400,         // display particles as x times larger to make them more visible
        timeDilation: 100,   // 1 second irl = x seconds ig
        zoom: 2,             // zoom factor
        g: 0.00000000006674, // gravitation constant, source: https://en.wikipedia.org/wiki/Gravitational_constant
        collisionDampening: 1.25,
    },
    particlePhysics: {
        x: 0,     // x coordinate
        y: 0,     // y coordinate
        vx: 0,    // x component of velocity
        vy: 0,    // y component of velocity
        ax: 0,    // x component of acceleration
        ay: 0,    // y component of acceleration
        maxV: 100,// terminal velocity (25pixels/tick)
        r: 10,    // radius
        p: 1,     // density
        style: {  // appearance on screen
            fill: {r: 255, g: 255, b: 255, a: 1},
            stroke: {colour: {r: 255, g: 255, b: 255, a: 1}, width: 4},
        },
        intermolecularForces: {
            gravity: true,
        },
        noClip: false,
    },
};

var particles = [];
var gravityField = [];

function gravityGrid(spacing, particle, offScreen) {
    let gravityField = [];
    for (let i = 0; i >= -display.x/2 - spacing*offScreen; i -= spacing) {
        for (let j = 0; j >= -display.y/2 - spacing*offScreen; j -= spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
        for (let j = 0+spacing; j <= display.y/2 + spacing*(offScreen-1); j += spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
    }
    for (let i = 0+spacing; i <= display.x/2 + spacing*(offScreen-1) ; i += spacing) {
        for (let j = 0; j >= -display.y/2 - spacing*offScreen; j -= spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
        for (let j = 0+spacing; j <= display.y/2 + spacing*(offScreen-1); j += spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
    }
    return gravityField;
};

function handleGravityField(particles) {
    for (let i = 0; i < particles.length; i++) {
        // This is not intended to simulate motion
        // It is ment to show the magnitude of the force of gravity
        //console.log(particles[i].ax, particles[i].ay);
        //particles[i].x = particles[i].ax*data.constants.scale;
        //particles[i].y = particles[i].ay*data.constants.scale;
        //console.log(`dist: ${getDist({x: 0, y: 0}, particles[i])}, sf: ${sf}`);
        //console.log(particles[i].ax * data.constants.scale**2, particles[i].ay * data.constants.scale**2);
        if (toPol(particles[i].ax, particles[i].ay).m > 0.00000063) {
            particles[i].ax = Infinity;
            particles[i].ay = Infinity;
        }
        particles[i].x = particles[i].px + particles[i].ax * data.constants.scale;
        particles[i].y = particles[i].py + particles[i].ay * data.constants.scale;
        //console.log(particles[i].x-particles[i].px, particles[i].y-particles[i].py);
    }
    return particles;
};

function handleParticleMotion(particles) {
    let newParticles = [];
    for (let i = 0; i < particles.length; i++) {
        let remove = false;
        particles[i].vx += particles[i].ax*data.constants.timeDilation;
        particles[i].vy += particles[i].ay*data.constants.timeDilation;
        particles[i].x += particles[i].vx*data.constants.timeDilation;
        particles[i].y += particles[i].vy*data.constants.timeDilation;
        if (particles[i].x < -display.x/2 || particles[i].x > display.x/2) {
            switch (data.constants.edgeMode) {
                case 'void':
                    console.log('x', particles[i].x);
                    remove = true;
                    break;
                case 'loop':
                    particles[i].x = particles[i].x < 0 ? display.x/2 : -display.x/2;
                    break;
                case 'wall':
                    particles[i].vx = -particles[i].vx;
                    break;
                case 'none':
                    console.log(`WARNING: object ${particles[i].id} is offscreen! (${particles[i].x}, ${particles[i].y})`);
                    break;
                default:
                    throw `ERROR: unknown edge type: ${data.constants.edgeMode}`;
            }
        }
        if (particles[i].y < -display.y/2 || particles[i].y > display.y/2) {
            switch (data.constants.edgeMode) {
                case 'void':
                    console.log('y', particles[i].y);
                    remove = true;
                    break;
                case 'loop':
                    particles[i].y = particles[i].y < 0 ? display.y/2 : -display.y/2;
                    break;
                case 'wall':
                    particles[i].vy = -particles[i].vy;
                    break;
                case 'none':
                    console.log(`WARNING: object ${particles[i].id} is offscreen! (${particles[i].x}, ${particles[i].y})`);
                    break;
                default:
                    throw `ERROR: unknown edge type: ${data.constants.edgeMode}`;
            }
        }
        if (remove == false) {
            newParticles.push(particles[i]);
        }
    }
    return newParticles;
};

function resetGravityField(particles) {
    for (let i = 0; i < particles.length; i++) {
        particles[i].x = particles[i].px;
        particles[i].y = particles[i].py;
    }
    return particles;
};

function resetAccel(particles) {
    for (let i = 0; i < particles.length; i++) {
        particles[i].ax = 0;
        particles[i].ay = 0;
    }
    return particles;
};

function handleForces(effectParticles, affectedParticles, force, type) {
    // Every particle can exert force on every other type of particle
    //console.log(effectParticles, affectedParticles);
    if (effectParticles==undefined) {
        for (let i = 0; i < affectedParticles.length-1; i++) {
            for (let j = i+1; j < affectedParticles.length; j++) {
                /*
                if (type == 'contact') {
                    console.log(`${affectedParticles[i].id} and ${affectedParticles[j].id}`);
                    console.log(getDist(affectedParticles[i], affectedParticles[j]), (affectedParticles[i].r + affectedParticles[j].r)*data.constants.upSize);
                    if (getDist(affectedParticles[i], affectedParticles[j]) <= (affectedParticles[i].r + affectedParticles[j].r)) {
                        console.log('should apply contact force');
                    }
                }*/
                //console.log(affectedParticles[i].id, affectedParticles[j].id);
                if (type == 'contact'? getDist(affectedParticles[i], affectedParticles[j]) <= (affectedParticles[i].r + affectedParticles[j].r)*data.constants.upSize : getDist(affectedParticles[i], affectedParticles[j]) > 0) {
                    console.log(`Applying ${type} force: between ${affectedParticles[i].id} and between ${affectedParticles[j].id}`);
                    let res = force(affectedParticles[i], affectedParticles[j]);
                    affectedParticles[i] = res[0];
                    affectedParticles[j] = res[1];
                }
            }
        }
    } else {
        for (let i = 0; i < effectParticles.length; i++) {
            for (let j = 0; j < affectedParticles.length; j++) {
                //console.log(effectParticles[i].id, affectedParticles[j].id);
                if (type == 'contact'? getDist(effectParticles[i], affectedParticles[j]) <= (effectParticles[i].r + affectedParticles[j].r)*data.constants.upSize : getDist(effectParticles[i], affectedParticles[j]) > 0) {
                    //console.log(`Applying ${type} force between different arrays: between ${effectParticles[i].id} and between ${affectedParticles[j].id}`);
                    let res = force(effectParticles[i], affectedParticles[j]);
                    affectedParticles[j] = res[1];
                }
            }
        }
    }
    return affectedParticles;
};

function normalForce(p1, p2) {
    // gravity, but reverse
    // f = g * (m1 * m2) / r^2
    let f = data.constants.g * mass(p1) * mass(p2) / (getDist(p1, p2)*data.constants.scale)**2;
    // f = m * a
    let a1 = f / mass(p1);
    let a2 = f / mass(p2);
    let r1 = correctAngle(aim(p1, p2));
    let r2 = correctAngle(r1+Math.PI);
    let va1 = {x: a1*Math.cos(r1), y: a1*Math.sin(r1)};
    let va2 = {x: a2*Math.cos(r2), y: a2*Math.sin(r2)};
    p1.ax -= va1.x;
    p1.ay -= va1.y;
    p2.ax -= va2.x;
    p2.ay -= va2.y;
    return [p1, p2];
};

function collision(p1, p2) {
    let v1 = toPol(p1.vx, p1.vy);
    let v2 = toPol(p1.vx, p1.vy);
    let v1N = toComponent(toPol(p1.vx, p1.vy).m, correctAngle(v1.r-(aim(p1, p2)-Math.PI/2)));
    v1N = vMath(v1N, data.constants.collisionDampening, '*');
    console.log(v1N);
    let v1p1C = toComponent(v1N.x, correctAngle(aim(p1, p2)-Math.PI/2));
    let v1p2C = toComponent(v1N.y, correctAngle(aim(p1, p2)));

    let v2N = toComponent(toPol(p2.vx, p2.vy).m, correctAngle(v2.r-(aim(p2, p1)+Math.PI/2)));
    v2N = vMath(v2N, data.constants.collisionDampening, '*');
    console.log(v2N);
    let v2p2C = toComponent(v2N.x, correctAngle(aim(p2, p1)-Math.PI/2));
    let v2p1C = toComponent(v2N.y, correctAngle(aim(p2, p1)));
    p1.x -= p1.vx + p1.ax;
    p1.y -= p1.vy + p1.ay;
    p2.x -= p2.vx + p2.ax;
    p2.y -= p2.vy + p2.ay;
    p1.vx = v1p1C.x;
    p1.vy = v1p1C.y;
    p2.vx = v1p2C.x;
    p2.vy = v1p2C.y;
    p1.vx += v2p1C.x;
    p1.vy += v2p1C.y;
    p2.vx += v2p2C.x;
    p2.vy += v2p2C.y;
    return [p1, p2];
};

function gravity(p1, p2) {
    // f = g * (m1 * m2) / r^2
    let f = data.constants.g * mass(p1) * mass(p2) / (getDist(p1, p2)*data.constants.scale)**2;
    // f = m * a
    let a1 = f / mass(p1);
    let a2 = f / mass(p2);
    //console.log(f);
    //console.log(f/a1, f/a2);
    let r1 = correctAngle(aim(p1, p2));
    let r2 = correctAngle(r1+Math.PI);
    //console.log(r1,r2);
    let va1 = {x: a1*Math.cos(r1), y: a1*Math.sin(r1)};
    let va2 = {x: a2*Math.cos(r2), y: a2*Math.sin(r2)};
    //console.log(r1/Math.PI*180,r2/Math.PI*180);
    if (va1.x == Infinity || va1.y == Infinity || va2.x == Infinity || va2.y == Infinity) {
        console.log('Sh*t');
        console.log(mass(p1), mass(p2), getDist(p1, p2));
        console.log(f, a1, a2, r1, r2);
    }
    p1.ax += va1.x;
    p1.ay += va1.y;
    p2.ax += va2.x;
    p2.ay += va2.y;
    return [p1, p2];
};

function gravityVisualisation(p2, p1) {
    if (p1.ignoreOtherForces == true) {
        return [p2, p1];
    }
    // f = g * (m1 * m2) / r^2
    let f = data.constants.g * mass(p1) * mass(p2) / (getDist(p1, p2)*data.constants.scale)**2;
    // f = m * a
    let a1 = f / mass(p1);
    //console.log(f);
    //console.log(f/a1, f/a2);
    let r1 = correctAngle(aim(p1, p2));
    //console.log(r1,r2);
    let va1 = {x: a1*Math.cos(r1), y: a1*Math.sin(r1)};
    //console.log(r1/Math.PI*180,r2/Math.PI*180);
    //console.log(nV);
    //console.log(va1.x*data.constants.scale, va1.y*data.constants.scale);
    p1.ax += va1.x;
    p1.ay += va1.y;
    //console.log(toPol(p1.ax, p1.ay).m * data.constants.scale);
    return [p2, p1];
};

function renderParticles(particles) {
    for (let i = 0; i < particles.length; i++) {
        //console.log(t%FPT/FPT);
        drawCircle('main', (particles[i].x-(1-(t%FPT/FPT))*particles[i].vx*data.constants.timeDilation)*(data.constants.zoom), (particles[i].y-(1-(t%FPT/FPT))*particles[i].vy*data.constants.timeDilation)*(data.constants.zoom), (particles[i].r*data.constants.upSize)*(data.constants.zoom), toColour(particles[i].style.fill), toColour(particles[i].style.stroke.colour), particles[i].style.stroke.width, defaultCenter);
        //drawCircle('main', particles[i].x, particles[i].y, particles[i].r*data.constants.upSize, toColour(particles[i].style.fill), toColour(particles[i].style.stroke.colour), particles[i].style.stroke.width, defaultCenter);
    }
};

function physics() {
    //console.log(particles[0]);
    //console.log(particles[1]);
    //console.log(getDist(particles[0], particles[0]));
    particles = resetAccel(particles);
    gravityField = resetAccel(gravityField);
    gravityField = resetGravityField(gravityField);
    particles = handleForces(undefined, JSON.parse(JSON.stringify(particles)), gravity, 'non-contact');
    particles = handleForces(undefined, JSON.parse(JSON.stringify(particles)), normalForce, 'contact');
    particles = handleForces(undefined, JSON.parse(JSON.stringify(particles)), collision, 'contact');
    gravityField = handleForces(JSON.parse(JSON.stringify(particles)), JSON.parse(JSON.stringify(gravityField)), gravityVisualisation, 'non-contact');
    particles = handleParticleMotion(particles);
    gravityField = handleGravityField(gravityField);
};

function graphics() {
    // draw the background
    clearCanvas('main');
    grid('main', 50, defaultCenter, {colour: 'rgba(255,255,255,0.05)', width: 2});
    renderParticles(gravityField);
    //renderPastParticle(gravityField);
    renderParticles(particles);
};

function addSolarSystem() {
    let particle1 = JSON.parse(JSON.stringify(data.particlePhysics));
    particle1.p = 1410;
    particle1.r = 0.0696;
    particle1.x = 0;
    particle1.y = 0;
    particle1.vx = 0;
    particle1.id = 'Sol';
    particle1.style.fill = {r: 255, g: 255, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 200, b: 0, a: 1};
    particle1.style.stroke.width = 5;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 5429;
    particle1.r = 0.0024397;
    particle1.x = 0;
    particle1.y = 69.782;
    particle1.vx = 0.04787;
    particle1.id = 'Mercury';
    particle1.style.fill = {r: 200, g: 200, b: 200, a: 1};
    particle1.style.stroke.colour = {r: 180, g: 180, b: 180, a: 1};
    particle1.style.stroke.width = 2;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 5243;
    particle1.r = 0.006051;
    particle1.x = 0;
    particle1.y = 107.59;
    particle1.vx = 0.03502;
    particle1.id = 'Venus';
    particle1.style.fill = {r: 255, g: 100, b: 255, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 100, b: 255, a: 1};
    particle1.style.stroke.width = 3;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 5514;
    particle1.r = 0.006371;
    particle1.x = 0;
    particle1.y = 150;
    particle1.vx = 0.0297848; //0.0297848
    particle1.id = 'Earth';
    particle1.style.fill = {r: 0, g: 255, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 0, g: 0, b: 255, a: 1};
    particle1.style.stroke.width = 3;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 3344;
    particle1.r = 0.001737;
    particle1.x = 0;
    particle1.y = 153.844;
    particle1.vx = 0.0297848+0.01023;
    particle1.id = 'Moon';
    particle1.style.fill = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.width = 1;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 3934;
    particle1.r = 0.003396;
    particle1.x = 0;
    particle1.y = 228;//228;
    particle1.vx = 0.024077;
    particle1.id = 'Mars';
    particle1.style.fill = {r: 220, g: 0, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 200, g: 0, b: 0, a: 1};
    particle1.style.stroke.width = 3;
    particles.push(JSON.parse(JSON.stringify(particle1)));
};

function addTestingObjects() {
    let particle1 = JSON.parse(JSON.stringify(data.particlePhysics));

    particle1.p = 1500;
    particle1.r = 0.07;
    particle1.x = 100;
    particle1.y = 0;
    particle1.vx = 0;
    particle1.vy = 0.01;
    particle1.id = 'Sol2';
    particle1.style.fill = {r: 255, g: 255, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 200, b: 0, a: 1};
    particle1.style.stroke.width = 5;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 1500;
    particle1.r = 0.07;
    particle1.x = -100;
    particle1.y = 0;
    particle1.vx = 0;
    particle1.vy = -0.01;
    particle1.id = 'Sol1';
    particle1.style.fill = {r: 255, g: 255, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 200, b: 0, a: 1};
    particle1.style.stroke.width = 5;
    particles.push(JSON.parse(JSON.stringify(particle1)));
};

const TPS = 20;
const FPS = 60;
let FPT = FPS/TPS;

let defaultCenter = {x: display.x/2, y: display.y/2};

var t=0;
async function game() {
    let particle2 = JSON.parse(JSON.stringify(data.particlePhysics));
    particle2.p = 0.1;
    particle2.r = 0.25/data.constants.upSize;
    particle2.style.fill = {r: 255, g: 255, b: 255, a: 1};
    particle2.style.stroke.colour = {r: 200, g: 200, b: 200, a: 1};
    particle2.style.stroke.width = 1;
    gravityField = gravityGrid(25, particle2, 20);
    //addSolarSystem();
    addTestingObjects();
    console.log(particles);
    graphics();
    await sleep(1000);
    while (1) {
        if (t%FPT == 0) {
            //console.log(particles[0]);
            physics();
        }
        graphics();
        await sleep(1000/FPS);
        t++;
    }
};


let x = NaN;
console.log(x == NaN);
