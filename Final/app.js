'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sun = null; // this will be created after loading from a file
var planets = [];
var pointLightGeometry = null;
var groundGeometry = null;
var barrelGeometry = null;

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var basicColorProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    vertexColorVS: null, vertexColorFS: null,
    sphereJSON: null,
    marbleImage: null,
    crackedMudImage: null,
    barrelJSON: null,
    barrelImage: null,
    planets: []
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/marble.jpg'),
        loadImage('./data/crackedMud.png'),
        fetch('./data/barrel.json').then((response) => { return response.json(); }),
        loadImage('./data/barrel.png'),
        loadImage('./data/sun.jpg'),
        loadImage('./data/Additional-Planets/mercury.jpg'),
        loadImage('./data/Additional-Planets/venusAt.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/Additional-Planets/mars.jpg'),
        loadImage('./data/Additional-Planets/jupiter.jpg'),
        loadImage('./data/Additional-Planets/saturn.jpg'),
        loadImage('./data/Additional-Planets/uranus.jpg'),
        loadImage('./data/Additional-Planets/neptune.jpg')
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.marbleImage = values[5];
        loadedAssets.crackedMudImage = values[6];
        loadedAssets.barrelJSON = values[7];
        loadedAssets.barrelImage = values[8];
        loadedAssets.planets[0] = values[9];
        loadedAssets.planets[1] = values[10];
        loadedAssets.planets[2] = values[11];
        loadedAssets.planets[3] = values[12];
        loadedAssets.planets[4] = values[13];
        loadedAssets.planets[5] = values[14];
        loadedAssets.planets[6] = values[15];
        loadedAssets.planets[7] = values[16];
        loadedAssets.planets[8] = values[17];

    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);
    gl.useProgram(basicColorProgram);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(basicColorProgram, "uColor")
    };
}

// -------------------------------------------------------------------------
function createScene() {
    // sun = new WebGLGeometryJSON(gl, phongShaderProgram);
    // sun.create(loadedAssets.sphereJSON, loadedAssets.sun);

    // // Scaled it down so that the diameter is 3
    // var scale = new Matrix4().makeScale(1.090780809, 1.090780809, 1.090780809);

    // sun.worldMatrix.makeIdentity();
    // sun.worldMatrix.multiply(scale);

    const scales = [109.0780809 , 0.3824867, 0.9488868, 1, 0.5324553, 11.2091565, 9.4493572, 4.0073691, 3.8827219];
    // Create planets
    for (let i = 0; i < 9; i++) {
        const scale = new Matrix4().makeScale(scales[i] * .01, scales[i] * .01, scales[i] * .01);
        let planet = new WebGLGeometryJSON(gl, phongShaderProgram);
        planet.create(loadedAssets.sphereJSON, loadedAssets.planets[i]);
        // var planetTranslation = new Matrix4().makeIdentity().makeTranslation(20, 0, 0);
        // planet.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(scale);
        planet.worldMatrix.makeIdentity().multiply(scale);
        planets.push(planet);
    }
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);
    
    // Planet rotation
    const orbitSpeeds = [0, 4.1520560, 1.6255290, 1, 0.5317228, 0.0843170, 0.0339905, 0.0119403, 0.0061080, 0.0040336];
    const distances = [0, 0.39, 0.72, 1, 1.52, 5.2, 9.54, 19.2, 30.06];
    const axisRotationSpeeds = [14.9267007, 0.0169981, 0.0041035, 1, 0.9728997, 2.4134454, 2.2685624, 1.3887814, 1.4958333];
    for (let i = 0; i < planets.length; i++) {
        let rotation = new Matrix4().makeRotationY(axisRotationSpeeds[i] * (1 / 23.9333333));
        planets[i].worldMatrix.multiply(rotation);

        // Don't transform the sun
        if (i != 0) {
            var cosTime = Math.cos(time.secondsElapsedSinceStart * orbitSpeeds[i] * (1 / 365.26));
            var sinTime = Math.sin(time.secondsElapsedSinceStart * orbitSpeeds[i] * (1 / 365.26));
            planets[i].worldMatrix.elements[3] = cosTime * 20 * (distances[i] + 2.6);
            planets[i].worldMatrix.elements[11] = sinTime * 20 * (distances[i] + 2.6);
        }
    }

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    // sun.render(camera, projectionMatrix, phongShaderProgram);

    // Render each planet
    planets.forEach(planet => {
        planet.render(camera, projectionMatrix, phongShaderProgram);
    });

    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);
}
