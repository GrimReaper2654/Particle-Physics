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

let data = {
    mousepos: {x: 0, y: 0},
    display: {x:window.innerWidth, y:window.innerHeight},
    keyboard: {},
    noinput: false,
    constants: {
        mass: 'kg',
        length: 'm',
        edgeMode: 'none',
        scale: 1000000000,     // 1 px = x m
        upSize: 400,           // data.display particles as x times larger to make them more visible
        timeDilation: 100,     // 1 second irl = x seconds ig
        zoom: 200,             // zoom factor
        g: 0.00000000006674,   // gravitation constant, source: https://en.wikipedia.org/wiki/Gravitational_constant
        collisionDampening: 1, // remove energy from collision (does not conserve energy or momentum)
        camSpeed: 5,           // pan speed of camera (px/t)
        origin: {x: 0, y: 0},  // duplicate this instead of typing it out
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
    interact: {
        summon: {
            pos: {x: 0, y: 0},
            radius: 600000,
            direcion: 0,
            velocity: 1,
            density: 1000000,
            style: {
                fill: {r: 255, g: 255, b: 255, a: 1},
                stroke: {colour: {r: 255, g: 255, b: 255, a: 1}, width: 5},
            },
            active: false,
        },
        limits: { // min, max, dp
            densityValueInput: [1, 99999, 3],
            densityExponentInput: [-5, 10, 0],
            radiusValueInput: [0, 99999, 3],
            radiusExponentInput: [1, 10, 0],
            scaleValueInput: [1, 99999, 3],
            scaleExponentInput: [0, 20, 0],
            upSizeValueInput: [1, 1000, 0],
            upSizeExponentInput: [0, 0, 0],
            timeDilationValueInput: [0.001, 1000, 3],
            timeDilationExponentInput: [0, 1, 0],
            zoomValueInput: [1, 100, 0],
            zoomExponentInput: [2, 2, 0],
            collisionDampeningValueInput: [1, 1, 0],
            collisionDampeningExponentInput: [2, 2, 0],
            camSpeedValueInput: [1, 10, 0],
            camSpeedExponentInput: [0, 0, 0],
        }
    },
    storage: {
        red: {
            colour: {r: 255, g: 0, b: 0, a: 1},
            fill: {r: 255, g: 0, b: 0, a: 1},
            stroke: {colour: {r: 255, g: 0, b: 0, a: 1}, width: 3},
        },
        densityInput: [
            {type: 'label', txt: 'Density: '}, 
            {type: 'input', id: 'densityValueInput', min: 1, length: 8, placeholder: "1.000", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'densityExponentInput', min: -5, length: 1, placeholder: "3", disabled: ''}, 
            {type: 'label', txt: 'kg m³'}, 
        ],
        radiusInput: [
            {type: 'label', txt: 'Radius: '}, 
            {type: 'input', id: 'radiusValueInput', min: 1, length: 8, placeholder: "6.000", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'radiusExponentInput', min: 0, length: 1, placeholder: "5", disabled: ''}, 
            {type: 'label', txt: 'm'}, 
        ],
        spacer: [
            {type: 'label', txt: '<strong>Constant Inputs</strong>'}, 
        ],
        scaleInput: [
            {type: 'label', txt: 'Scale Factor: '}, 
            {type: 'input', id: 'scaleValueInput', min: 1, length: 8, placeholder: "1.000", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'scaleExponentInput', min: 0, length: 2, placeholder: "9", disabled: ''}, 
            {type: 'label', txt: ' times larger'}, 
        ],
        upSizeInput: [
            {type: 'label', txt: 'Up Size: '}, 
            {type: 'input', id: 'upSizeValueInput', min: 1, length: 3, placeholder: "400", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'upSizeExponentInput', min: 0, length: 1, placeholder: "0", disabled: 'disable'}, 
            {type: 'label', txt: 'times larger'}, 
        ],
        timeDilationInput: [
            {type: 'label', txt: 'Time Dilation: '}, 
            {type: 'input', id: 'timeDilationValueInput', min: 0.001, length: 4, placeholder: "100", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'timeDilationExponentInput', min: 0, length: 1, placeholder: "0", disabled: 'disable'}, 
            {type: 'label', txt: 'times faster'}, 
        ],
        zoomInput: [
            {type: 'label', txt: 'Zoom: '}, 
            {type: 'input', id: 'zoomValueInput', min: 1, length: 3, placeholder: "2", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'zoomExponentInput', min: 0, length: 1, placeholder: "2", disabled: 'disable'}, 
            {type: 'label', txt: '%'}, 
        ],
        collisionDampeningInput: [
            {type: 'label', txt: 'Energy Conservation: '}, 
            {type: 'input', id: 'collisionDampeningValueInput', min: 1, length: 2, placeholder: "1", disabled: 'disable'}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'collisionDampeningExponentInput', min: 0, length: 1, placeholder: "2", disabled: 'disable'}, 
            {type: 'label', txt: '%'}, 
        ],
        camSpeedInput: [
            {type: 'label', txt: 'Pan Speed: '}, 
            {type: 'input', id: 'camSpeedValueInput', min: 1, length: 2, placeholder: "5", disabled: ''}, 
            {type: 'label', txt: '×10^'}, 
            {type: 'input', id: 'camSpeedExponentInput', min: 0, length: 1, placeholder: "0", disabled: 'disable'}, 
            {type: 'label', txt: 'px/tick'}, 
        ],
        interactInputs: [
            'density',
            'radius',
        ],
        constantInputs: [
            'scale',
            'upSize',
            'timeDilation',
            'zoom',
            'collisionDampening',
            'camSpeed'
        ],
    },
};

window.onkeyup = function(e) {
    data.keyboard[e.key.toLowerCase()] = false; 
};
window.onkeydown = function(e) {
    data.keyboard[e.key.toLowerCase()] = true; 
    if (data.noinput == false) {
        e.preventDefault();
    }
};
document.addEventListener('mousedown', function(event) {
    if (event.button === 0) { // Check if left mouse button was clicked
        data.keyboard.click = true;
    }
});
document.addEventListener('mouseup', function(event) {
    if (event.button === 0) { // Check if left mouse button was released
        data.keyboard.click = false;
    }
});
window.addEventListener("resize", function () {
    if (t > 0) {
        data.display = {x:window.innerWidth,y:window.innerHeight};
        replacehtml(`<canvas id="main" width="${data.display.x}" height="${data.display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas><canvas id="canvasOverlay" width="${data.display.x}" height="${data.display.y}" style="position: absolute; top: 0; left: 0; z-index: 2;"></canvas>`);
    }
});
function tellPos(p){
    data.mousepos = {x: p.pageX, y:p.pageY};
};
window.addEventListener('mousemove', tellPos, false);

async function load() {
    console.log('Startin the game...');
    replacehtml(`<canvas id="main" width="${data.display.x}" height="${data.display.y}" style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas>`);
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
    ctx.clearRect(0, 0, data.display.x, data.display.y);
    ctx.restore();
};

function checkInput() {
    allElements = document.querySelectorAll('input');
    allElements.forEach((inputElement) => {
        if (inputElement.value) {
            inputElement.value = Math.max(parseFloat(inputElement.value), data.interact.limits[inputElement.id][0]);
            inputElement.value = Math.min(inputElement.value, data.interact.limits[inputElement.id][1]);
            inputElement.value = Math.round(inputElement.value * 10**data.interact.limits[inputElement.id][2]) / 10**data.interact.limits[inputElement.id][2];
        }
    });
}

function stack(element) {
    if (element.type == 'input') {
        return `<input type="number" id="${element.id}" min="${element.min}" max="${10**element.length}" placeholder="${element.placeholder}" ${element.disabled}></input>`;
    } else {
        return `<label>${element.txt}</label>`;
    }
};

function createInput(elements) {
    var overlay = document.getElementById("overlay");
    let content = `<form>`;
    for (let i=0; i < elements.length; i++) {
        content += stack(elements[i]);
    }
    content += `</form>`;
    overlay.innerHTML += content;
    for (let i=0; i < elements.length; i++) {
        if (elements[i].type == 'input') {
            var inputElement = document.getElementById(elements[i].id);
            inputElement.addEventListener("blur", function() {
                console.log('lost focus');
                checkInput();
            });
        }
    }
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
    if (typeof colour === 'string' || colour instanceof String) {
        return colour;
    }
    return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
};

function drawLine(canvas, pos, r, length, relative, style) {
    var c = document.getElementById(canvas);
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (style) {
        ctx.strokeStyle = toColour(style.colour);
        ctx.lineWidth = style.width;
    }
    ctx.beginPath();
    ctx.moveTo(pos.x-relative.x+data.display.x/2, -pos.y+relative.y+data.display.y/2);
    ctx.lineTo(pos.x-relative.x - length * Math.cos(r) + data.display.x/2, -pos.y+relative.y + length * Math.sin(r) + data.display.y/2);
    ctx.stroke();
    ctx.restore();
};

function drawCircle(canvas, x, y, radius, fill, stroke, strokeWidth, relative) { // draw a circle
    var canvas = document.getElementById(canvas);
    var ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.beginPath();
    ctx.arc(x-relative.x+data.display.x/2, -y+relative.y+data.display.y/2, radius, 0, 2 * Math.PI, false);
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
    ctx.font = "10px Verdana";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    // data.display the points on the canvas
    ctx.fillText(txt, pos.x-relative.x+data.display.x/2, -pos.y+relative.y+data.display.y/2);
    ctx.stroke();
    ctx.restore();
};

function grid(canvas, spacing, pos, lineStyle) {
    for (let i = 0; i >= pos.x - data.display.x/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: i, y: pos.y + data.display.y/2 + spacing}, Math.PI/2, (data.display.y + spacing*2), pos, lineStyle);
    }
    for (let i = 0; i <= pos.x + data.display.x/2 + spacing ; i += spacing) {
        drawLine(canvas, {x: i, y: pos.y + data.display.y/2 + spacing}, Math.PI/2, (data.display.y + spacing*2), pos, lineStyle);
    }
    for (let i = 0; i >= pos.y - data.display.y/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: pos.x+data.display.x/2 + spacing, y: i}, 0, (data.display.x + spacing*2), pos, lineStyle);
    }
    for (let i = 0; i <= pos.y + data.display.y/2 + spacing; i += spacing) {
        drawLine(canvas, {x: pos.x+data.display.x/2 + spacing, y: i}, 0, (data.display.x + spacing*2), pos, lineStyle);
    }
    /*
    for (let i = 0; i >= -data.display.x/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: i, y: data.display.y/2 + spacing}, Math.PI/2, (data.display.y + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i <= data.display.x/2 + spacing ; i += spacing) {
        drawLine(canvas, {x: i, y: data.display.y/2 + spacing}, Math.PI/2, (data.display.y + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i >= -data.display.y/2 - spacing; i -= spacing) {
        drawLine(canvas, {x: -data.display.x/2 - spacing, y: i}, 0, (data.display.x + spacing*2), relative, lineStyle);
    }
    for (let i = 0; i <= data.display.y/2 + spacing; i += spacing) {
        drawLine(canvas, {x: -data.display.x/2 - spacing, y: i}, 0, (data.display.x + spacing*2), relative, lineStyle);
    }*/
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

var particles = [];
var gravityField = [];

function gravityGrid(spacing, particle, offScreen) {
    let gravityField = [];
    for (let i = 0; i >= -data.display.x/2 - spacing*offScreen; i -= spacing) {
        for (let j = 0; j >= -data.display.y/2 - spacing*offScreen; j -= spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
        for (let j = 0+spacing; j <= data.display.y/2 + spacing*(offScreen-1); j += spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
    }
    for (let i = 0+spacing; i <= data.display.x/2 + spacing*(offScreen-1) ; i += spacing) {
        for (let j = 0; j >= -data.display.y/2 - spacing*offScreen; j -= spacing) {
            particle.x = i;
            particle.y = j;
            particle.px = JSON.parse(JSON.stringify(i));
            particle.py = JSON.parse(JSON.stringify(j));
            gravityField.push(JSON.parse(JSON.stringify(particle)));
        }
        for (let j = 0+spacing; j <= data.display.y/2 + spacing*(offScreen-1); j += spacing) {
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
        if (particles[i].x < -data.display.x/2 || particles[i].x > data.display.x/2) {
            switch (data.constants.edgeMode) {
                case 'void':
                    console.log('x', particles[i].x);
                    remove = true;
                    break;
                case 'loop':
                    particles[i].x = particles[i].x < 0 ? data.display.x/2 : -data.display.x/2;
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
        if (particles[i].y < -data.display.y/2 || particles[i].y > data.display.y/2) {
            switch (data.constants.edgeMode) {
                case 'void':
                    console.log('y', particles[i].y);
                    remove = true;
                    break;
                case 'loop':
                    particles[i].y = particles[i].y < 0 ? data.display.y/2 : -data.display.y/2;
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
                    //console.log(`Applying ${type} force: between ${affectedParticles[i].id} and between ${affectedParticles[j].id}`);
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
    /*
    let v1 = toPol(p1.vx, p1.vy);
    let v2 = toPol(p1.vx, p1.vy);
    // F = m * a
    let v1N = toComponent(toPol(p1.vx, p1.vy).m * mass(p1), correctAngle(v1.r-(aim(p1, p2)-Math.PI/2)));
    v1N = vMath(v1N, data.constants.collisionDampening, '*');
    console.log(v1N);
    let v1p1C = toComponent(v1N.x / mass(p1), correctAngle(aim(p1, p2)-Math.PI/2));
    let v1p2C = toComponent(v1N.y / mass(p2), correctAngle(aim(p1, p2)));
    let v2N = toComponent(toPol(p2.vx, p2.vy).m * mass(p2), correctAngle(v2.r-(aim(p2, p1)+Math.PI/2)));
    v2N = vMath(v2N, data.constants.collisionDampening, '*');
    console.log(v2N);
    let v2p2C = toComponent(v2N.x / mass(p2), correctAngle(aim(p2, p1)-Math.PI/2));
    let v2p1C = toComponent(v2N.y / mass(p1), correctAngle(aim(p2, p1)));
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
    p2.vy += v2p2C.y;*/

    

    //      v1* cos(d1-p) * (m1 - m2) + 2 * m2 * v2 * cos(d2- p)
    // vx = ----------------------------------------------------- * cos(p) + v1 * sin(d1-p) * cos(p + PI/2)
    //                    m1 + m2
    //
    //      v1* cos(d1-p) * (m1 - m2) + 2 * m2 * v2 * cos(d2- p)
    // vy = ----------------------------------------------------- * sin(p) + v1 * sin(d1-p) * sin(p + PI/2)
    //                     m1 + m2

    let v1 = toPol(p1.vx, p1.vy);
    let v2 = toPol(p2.vx, p2.vy);
    let r1 = aim(p1, p2);
    let r2 = correctAngle(r1 + Math.PI);
    let m1 = mass(p1);
    let m2 = mass(p2);
    p1.vx = ((v1.m * Math.cos(v1.r-r1) * (m1-m2) + 2 * m2 * v2.m * Math.cos(v2.r - r1)) / (m1 + m2)) * Math.cos(r1) + v1.m * Math.sin(v1.r - r1) * Math.cos(r1 + Math.PI/2);
    p1.vy = ((v1.m * Math.cos(v1.r-r1) * (m1-m2) + 2 * m2 * v2.m * Math.cos(v2.r - r1)) / (m1 + m2)) * Math.sin(r1) + v1.m * Math.sin(v1.r - r1) * Math.sin(r1 + Math.PI/2);
    p2.vx = ((v2.m * Math.cos(v2.r-r2) * (m2-m1) + 2 * m1 * v1.m * Math.cos(v1.r - r2)) / (m1 + m2)) * Math.cos(r2) + v2.m * Math.sin(v2.r - r2) * Math.cos(r2 + Math.PI/2);
    p2.vy = ((v2.m * Math.cos(v2.r-r2) * (m2-m1) + 2 * m1 * v1.m * Math.cos(v1.r - r2)) / (m1 + m2)) * Math.sin(r2) + v2.m * Math.sin(v2.r - r2) * Math.sin(r2 + Math.PI/2);
    
    let normalise = {x: (p2.x - p1.x) / getDist(p1, p2), y: (p2.y - p1.y) / getDist(p1, p2)};
    let contactDist = getDist(p1, p2) * (p1.r / (p1.r + p2.r));
    //let contact = {x: p1.x + normalise.x * contactDist, y: p1.y + normalise.y * contactDist};
    //console.log(normalise);
    //console.log(contact);
    p1.x -= normalise.x * p1.vx;
    p1.y -= normalise.y * p1.vy;
    p2.x -= normalise.x * p2.vx;
    p2.y -= normalise.y * p2.vy;
    //console.log(p1.x, p1.y);
    //console.log(p2.x, p2.y);
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
        drawCircle('main', (particles[i].x-(1-(t%FPT/FPT))*particles[i].vx*data.constants.timeDilation)*(data.constants.zoom/100), (particles[i].y-(1-(t%FPT/FPT))*particles[i].vy*data.constants.timeDilation)*(data.constants.zoom/100), (particles[i].r*data.constants.upSize)*(data.constants.zoom/100), toColour(particles[i].style.fill), toColour(particles[i].style.stroke.colour), particles[i].style.stroke.width, camPos);
        //data.displaytxt('main', `(${Math.round((particles[i].x-(1-(t%FPT/FPT))*particles[i].vx*data.constants.timeDilation)*(data.constants.zoom)*100)/100}, ${Math.round((particles[i].y-(1-(t%FPT/FPT))*particles[i].vy*data.constants.timeDilation)*(data.constants.zoom)*100)/100})`, {x: (particles[i].x-(1-(t%FPT/FPT))*particles[i].vx*data.constants.timeDilation)*(data.constants.zoom), y: (particles[i].y-(1-(t%FPT/FPT))*particles[i].vy*data.constants.timeDilation)*(data.constants.zoom)}, camPos);
    }
};

function addParticle(vx, vy) {
    let particle1 = JSON.parse(JSON.stringify(data.particlePhysics));
    particle1.p = data.interact.summon.density;
    particle1.r = data.interact.summon.radius/data.constants.scale;
    particle1.x = data.interact.summon.pos.x/data.constants.zoom*100;
    particle1.y = data.interact.summon.pos.y/data.constants.zoom*100;
    particle1.vx = vx;
    particle1.vy = vy;
    particle1.id = 'Summoned Particle';
    particle1.style= JSON.parse(JSON.stringify(data.interact.summon.style));
    console.log(particle1);
    particles.push(JSON.parse(JSON.stringify(particle1)));
};

function handleInputs() {
    if (data.keyboard.w && data.noinput == false) {
        camPos.y += data.constants.camSpeed;
    } 
    if (data.keyboard.s && data.noinput == false) {
        camPos.y -= data.constants.camSpeed;
    } 
    if (data.keyboard.d && data.noinput == false) {
        camPos.x += data.constants.camSpeed;
    } 
    if (data.keyboard.a && data.noinput == false) {
        camPos.x -= data.constants.camSpeed;
    } 
    if (data.keyboard.click && data.noinput == false) {
        let absMousepos = vMath(data.mousepos, vMath(data.display, 0.5, '*'), '-');
        absMousepos.y = -absMousepos.y;
        //drawLine('main', {x: 0, y: 0}, aim({x: 0, y: 0}, absMousepos), getDist({x: 0, y: 0}, absMousepos), {x: 0, y: 0}, data.particlePhysics.style);
        if (data.interact.summon.active == false) {
            data.interact.summon.pos = absMousepos;
            console.log(data.interact.summon.pos);
            data.interact.summon.active = true;
        }
        //console.log(data.interact.summon.pos, absMousepos, aim(data.interact.summon.pos, absMousepos));
        drawLine('main', data.interact.summon.pos, aim(absMousepos, data.interact.summon.pos), getDist(data.interact.summon.pos, absMousepos), {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', data.interact.summon.pos, (Math.PI*2/(5*FPS))*(t%(FPS*5)), 30, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', data.interact.summon.pos, (Math.PI*2/(5*FPS))*(t%(FPS*5))+Math.PI/2, 30, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', data.interact.summon.pos, (Math.PI*2/(5*FPS))*(t%(FPS*5))+Math.PI, 30, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', data.interact.summon.pos, (Math.PI*2/(5*FPS))*(t%(FPS*5))+3*Math.PI/2, 30, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', absMousepos, aim(data.interact.summon.pos, absMousepos)+Math.PI/6, 20, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawLine('main', absMousepos, aim(data.interact.summon.pos, absMousepos)-Math.PI/6, 20, {x: 0, y: 0}, JSON.parse(JSON.stringify(data.storage.red)));
        drawCircle('main', data.interact.summon.pos.x, data.interact.summon.pos.y, 5, `rgba(255, 0, 0, 0.75)`, `rgba(255, 0, 0, 0.75)`, 1,  {x: 0, y: 0});
        drawCircle('main', data.interact.summon.pos.x, data.interact.summon.pos.y, 20, `rgba(0, 0, 0, 0)`, `rgba(255, 0, 0, 0.75)`, 5,  {x: 0, y: 0});
    } else {
        if (data.interact.summon.active == true) {
            let absMousepos = vMath(data.mousepos, vMath(data.display, 0.5, '*'), '-');
            absMousepos.y = -absMousepos.y;
            let v = vMath(vMath(absMousepos, data.interact.summon.pos, '-'), 1/(data.constants.timeDilation*TPS),'*');
            console.log(v);
            addParticle(v.x, v.y);
            data.interact.summon.active = false;
        }
    }
    if (data.keyboard.q) {
        data.keyboard.q = false;
        var overlay = document.getElementById('overlay');
        if (overlay.style.display == 'block') {
            overlay.style.display = 'none';
            data.noinput = false;
        } else {
            overlay.style.display = 'block';
            data.noinput = true;
        }
    }
    
};

function updateConstants() {
    checkInput();
    for (let i=0; i < data.storage.interactInputs.length; i++) {
        if (document.getElementById(`${data.storage.interactInputs[i]}ValueInput`).value) {
            data.interact.summon[data.storage.interactInputs[i]] = parseFloat(document.getElementById(`${data.storage.interactInputs[i]}ValueInput`).value);
        } else {
            document.getElementById(`${data.storage.interactInputs[i]}ValueInput`).value = document.getElementById(`${data.storage.interactInputs[i]}ValueInput`).placeholder;
            data.interact.summon[data.storage.interactInputs[i]] = parseFloat(document.getElementById(`${data.storage.interactInputs[i]}ValueInput`).placeholder);
        }
        if (document.getElementById(`${data.storage.interactInputs[i]}ExponentInput`).value) {
            data.interact.summon[data.storage.interactInputs[i]] *= 10**parseFloat(document.getElementById(`${data.storage.interactInputs[i]}ExponentInput`).value);
        } else {
            document.getElementById(`${data.storage.interactInputs[i]}ExponentInput`).value = document.getElementById(`${data.storage.interactInputs[i]}ExponentInput`).placeholder;
            data.interact.summon[data.storage.interactInputs[i]] *= 10**parseFloat(document.getElementById(`${data.storage.interactInputs[i]}ExponentInput`).placeholder);
        }
    }
    for (let i=0; i < data.storage.constantInputs.length; i++) {
        if (document.getElementById(`${data.storage.constantInputs[i]}ValueInput`).value) {
            data.constants[data.storage.constantInputs[i]] = parseFloat(document.getElementById(`${data.storage.constantInputs[i]}ValueInput`).value);
        } else {
            document.getElementById(`${data.storage.constantInputs[i]}ValueInput`).value = document.getElementById(`${data.storage.constantInputs[i]}ValueInput`).placeholder;
            data.constants[data.storage.constantInputs[i]] = parseFloat(document.getElementById(`${data.storage.constantInputs[i]}ValueInput`).placeholder);
        }
        if (document.getElementById(`${data.storage.constantInputs[i]}ExponentInput`).value) {
            data.constants[data.storage.constantInputs[i]] *= 10**parseFloat(document.getElementById(`${data.storage.constantInputs[i]}ExponentInput`).value);
        } else {
            document.getElementById(`${data.storage.constantInputs[i]}ExponentInput`).value = document.getElementById(`${data.storage.constantInputs[i]}ExponentInput`).placeholder;
            data.constants[data.storage.constantInputs[i]] *= 10**parseFloat(document.getElementById(`${data.storage.constantInputs[i]}ExponentInput`).placeholder);
        }
    }
}

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
    grid('main', 50, camPos, {colour: 'rgba(255,255,255,0.05)', width: 2});
    renderParticles(gravityField);
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
    particle1.y = 153.85;
    particle1.vx = 0.0297848+0.01026;
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
    /*
    particle1.p = 19450;
    particle1.r = 0.042;
    particle1.x = 0;
    particle1.y = -200;
    particle1.vy = 2.9979;
    particle1.id = 'Projectile';
    particle1.style.fill = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.width = 1;
    particles.push(JSON.parse(JSON.stringify(particle1)));*/
};

function addExtraPlanets() {
    let particle1 = JSON.parse(JSON.stringify(data.particlePhysics));

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
    particle1.y = 153.85;
    particle1.vx = 0.0297848+0.01026;
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
    /*
    particle1.p = 19450;
    particle1.r = 0.042;
    particle1.x = 0;
    particle1.y = -200;
    particle1.vy = 2.9979;
    particle1.id = 'Projectile';
    particle1.style.fill = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 255, b: 255, a: 1};
    particle1.style.stroke.width = 1;
    particles.push(JSON.parse(JSON.stringify(particle1)));*/
};

function addTestingObjects() {
    let particle1 = JSON.parse(JSON.stringify(data.particlePhysics));

    particle1.p = 1500;
    particle1.r = 0.07;
    particle1.x = 200;
    particle1.y = -50;
    particle1.vx = 0;
    particle1.vy = 0.01;
    particle1.id = 'Sol2';
    particle1.style.fill = {r: 255, g: 255, b: 0, a: 1};
    particle1.style.stroke.colour = {r: 255, g: 200, b: 0, a: 1};
    particle1.style.stroke.width = 5;
    particles.push(JSON.parse(JSON.stringify(particle1)));

    particle1.p = 1500;
    particle1.r = 0.07;
    particle1.x = -200;
    particle1.y = 50;
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

let camPos = {x: 0, y: 0};

var t=0;
async function game() {
    for (let i=0; i < data.storage.interactInputs.length; i++) {
        createInput(data.storage[`${data.storage.interactInputs[i]}Input`]);
    }
    createInput(data.storage.spacer);
    for (let i=0; i < data.storage.constantInputs.length; i++) {
        createInput(data.storage[`${data.storage.constantInputs[i]}Input`]);
    }
    let particle2 = JSON.parse(JSON.stringify(data.particlePhysics));
    particle2.p = 0.1;
    particle2.r = 0.25/data.constants.upSize;
    particle2.style.fill = {r: 255, g: 255, b: 255, a: 1};
    particle2.style.stroke.colour = {r: 200, g: 200, b: 200, a: 1};
    particle2.style.stroke.width = 1;
    gravityField = gravityGrid(50, particle2, 10);
    addSolarSystem();
    //addTestingObjects();
    console.log(particles);
    graphics();
    await sleep(1000);
    while (1) {
        if (t%FPT == 0) {
            physics();
        }
        graphics();
        handleInputs();
        await sleep(1000/FPS);
        t++;
    }
};
