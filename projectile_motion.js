/*
Ethan Wight
March 30, 2025
CMSC 410
Project 2
*/

var gl;
var canvas;
var program;
var bufferId;
var cBuffer;
var vPosition;
var vColor;

// Canvas dimensions in WebGL coordinates (-1 to 1)
var canvasWidth = 2.0;
var canvasHeight = 1.5;  // Adjusted for 800x600 aspect ratio

// Physics constants
var g = 9.8;  // gravity in m/s^2

// Simulation variables
var angle = 45;       // in degrees
var initialSpeed = 50; // in m/s
var projectilePosition = [];
var canonPosition = { x: -0.95, y: -0.95 };  // Even closer to bottom left corner
var projectileRadius = 0.02;
var canonWidth = 0.1;
var canonHeight = 0.05;
var isSimulating = false;
var animationId = null;
var currentStep = 0;
var totalSteps = 100;
var timeStep = 0;
var maxHeight = 0;
var maxDistance = 0;
var totalTime = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0); // Light gray background

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create buffers
    bufferId = gl.createBuffer();
    cBuffer = gl.createBuffer();

    // Get attribute locations
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");

    // Setup event listeners
    document.getElementById('start-btn').addEventListener('click', startSimulation);
    document.getElementById('angle-slider').addEventListener('input', updateAngle);
    document.getElementById('speed-slider').addEventListener('input', updateSpeed);

    // Initial update of parameters
    updateAngle();
    updateSpeed();

    // Initial render
    render();
};

function updateAngle() {
    angle = parseFloat(document.getElementById('angle-slider').value);
    document.getElementById('angle-slider').nextElementSibling.textContent = angle + " deg";
    renderStaticElements();
}

function updateSpeed() {
    initialSpeed = parseFloat(document.getElementById('speed-slider').value);
    document.getElementById('speed-slider').nextElementSibling.textContent = initialSpeed + " m/s";
}

function startSimulation() {
    if (isSimulating) return;
    
    isSimulating = true;
    currentStep = 0;
    
    // Calculate trajectory and time
    var radians = angle * Math.PI / 180;
    var vx = initialSpeed * Math.cos(radians);
    var vy = initialSpeed * Math.sin(radians);
    
    // Calculate total flight time: t = 2*vy/g
    totalTime = 2 * vy / g;
    timeStep = totalTime / totalSteps;
    
    // Calculate max height: h = vy^2 / (2*g)
    maxHeight = (vy * vy) / (2 * g);
    
    // Calculate max distance: d = vx * totalTime
    maxDistance = vx * totalTime;
    
    // Update display without scaling
    document.getElementById('max-height').value = maxHeight.toFixed(2) + " m";
    document.getElementById('max-distance').value = maxDistance.toFixed(2) + " m";
    document.getElementById('flight-time').value = totalTime.toFixed(2) + " s";
    
    // Start animation
    animateProjectile();
}

function animateProjectile() {
    if (currentStep > totalSteps) {
        isSimulating = false;
        renderStaticElements();
        return;
    }
    
    var t = currentStep * timeStep;
    var radians = angle * Math.PI / 180;
    var vx = initialSpeed * Math.cos(radians);
    var vy = initialSpeed * Math.sin(radians);
    
    // Calculate position
    var x = canonPosition.x + (vx * t) * 0.01; // Scale for canvas
    var y = canonPosition.y + (vy * t - 0.5 * g * t * t) * 0.01; // Scale for canvas
    
    // Update projectile position
    projectilePosition = [x, y];
    
    // Render frame
    render();
    
    // Next step
    currentStep++;
    
    // Schedule next frame
    var frameDelay = totalTime * 1000 / totalSteps; // Convert to milliseconds
    animationId = setTimeout(animateProjectile, frameDelay);
}

function renderStaticElements() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Render canon
    renderCanon();
    
    // Render projectile if not animating
    if (!isSimulating) {
        // Place ball in canon
        var radians = angle * Math.PI / 180;
        var offsetX = Math.cos(radians) * canonWidth * 0.5;
        var offsetY = Math.sin(radians) * canonWidth * 0.5;
        projectilePosition = [canonPosition.x + offsetX, canonPosition.y + offsetY];
        renderProjectile();
    }
}

function render() {
    renderStaticElements();
    
    // Render projectile if simulating
    if (isSimulating) {
        renderCanon();
        renderProjectile();
    }
}

function renderCanon() {
    var canonVertices = [];
    var radians = angle * Math.PI / 180;
    
    // Canon base
    canonVertices.push(
        canonPosition.x - canonHeight/2, canonPosition.y - canonHeight/2,
        canonPosition.x + canonHeight/2, canonPosition.y - canonHeight/2,
        canonPosition.x + canonHeight/2, canonPosition.y + canonHeight/2,
        canonPosition.x - canonHeight/2, canonPosition.y + canonHeight/2
    );
    
    // Canon barrel
    var barrelEndX = canonPosition.x + Math.cos(radians) * canonWidth;
    var barrelEndY = canonPosition.y + Math.sin(radians) * canonWidth;
    var perpX = -Math.sin(radians) * canonHeight/3;
    var perpY = Math.cos(radians) * canonHeight/3;
    
    canonVertices.push(
        canonPosition.x + perpX, canonPosition.y + perpY,
        canonPosition.x - perpX, canonPosition.y - perpY,
        barrelEndX - perpX, barrelEndY - perpY,
        barrelEndX + perpX, barrelEndY + perpY
    );
    
    var vertices = new Float32Array(canonVertices);
    
    // Canon color - dark gray
    var colors = [];
    for (var i = 0; i < vertices.length / 2; i++) {
        colors.push(0.3, 0.3, 0.3, 1.0);
    }
    
    // Load vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Load colors
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    // Draw canon base
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    
    // Draw canon barrel
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
}

function renderProjectile() {
    if (!projectilePosition || projectilePosition.length !== 2) return;
    
    var vertices = [];
    var numSegments = 20;
    
    // Add center point
    vertices.push(projectilePosition[0], projectilePosition[1]);
    
    // Add points around the circle
    for (var i = 0; i <= numSegments; i++) {
        var angle = 2 * Math.PI * i / numSegments;
        vertices.push(
            projectilePosition[0] + projectileRadius * Math.cos(angle),
            projectilePosition[1] + projectileRadius * Math.sin(angle)
        );
    }
    
    // Convert to Float32Array
    var vertexArray = new Float32Array(vertices);
    
    // Create colors for circle - red
    var colors = [];
    for (var i = 0; i < vertexArray.length / 2; i++) {
        colors.push(1.0, 0.0, 0.0, 1.0);
    }
    
    // Load vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Load colors
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    // Draw projectile
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 2);
}
