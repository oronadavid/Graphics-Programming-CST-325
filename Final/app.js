'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var skyboxFaces =[];
var planets = [];
var moon = null;

var projectionMatrix = new Matrix4();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var emissiveColorProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    emissiveShaderVS: null, emissiveShaderFS: null,
    sphereJSON: null,
    planets: [],
    skyboxTextures: []
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
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/sun.jpg'),
        loadImage('./data/Additional Planets/mercury.jpg'),
        loadImage('./data/Additional Planets/venusAt.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/Additional Planets/mars.jpg'),
        loadImage('./data/Additional Planets/jupiter.jpg'),
        loadImage('./data/Additional Planets/saturn.jpg'),
        loadImage('./data/Additional Planets/uranus.jpg'),
        loadImage('./data/Additional Planets/neptune.jpg'),
        loadImage('./data/moon.png'),
        fetch('./shaders/emissive.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/emissive.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/Skybox Faces/GalaxyTex_NegativeX.png'),
        loadImage('./data/Skybox Faces/GalaxyTex_PositiveX.png'),
        loadImage('./data/Skybox Faces/GalaxyTex_NegativeZ.png'),
        loadImage('./data/Skybox Faces/GalaxyTex_PositiveZ.png'),
        loadImage('./data/Skybox Faces/GalaxyTex_NegativeY.png'),
        loadImage('./data/Skybox Faces/GalaxyTex_PositiveY.png'),
        loadImage('./data/Earth Day-Night-Clouds/2k_earth_clouds.jpg')
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.sphereJSON = values[2];
        loadedAssets.planets[0] = values[3];
        loadedAssets.planets[1] = values[4];
        loadedAssets.planets[2] = values[5];
        loadedAssets.planets[3] = values[6];
        loadedAssets.planets[4] = values[7];
        loadedAssets.planets[5] = values[8];
        loadedAssets.planets[6] = values[9];
        loadedAssets.planets[7] = values[10];
        loadedAssets.planets[8] = values[11];
        loadedAssets.moon = values[12];
        loadedAssets.emissiveShaderVS = values[13];
        loadedAssets.emissiveShaderFS = values[14];
        loadedAssets.skyboxTextures[0] = values[15];
        loadedAssets.skyboxTextures[1] = values[16];
        loadedAssets.skyboxTextures[2] = values[17];
        loadedAssets.skyboxTextures[3] = values[18];
        loadedAssets.skyboxTextures[4] = values[19];
        loadedAssets.skyboxTextures[5] = values[20];
        loadedAssets.planets[9] = values[21];
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
        alphaUniform: gl.getUniformLocation(phongShaderProgram, "uAlpha")
    };

    emissiveColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.emissiveShaderVS, loadedAssets.emissiveShaderFS);
    gl.useProgram(emissiveColorProgram);

    emissiveColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(emissiveColorProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(emissiveColorProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(emissiveColorProgram, "aTexcoords")
    };

    emissiveColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(emissiveColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(emissiveColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(emissiveColorProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(emissiveColorProgram, "uTexture")
    };
}

// -------------------------------------------------------------------------
function createScene() {
    // Create skybox
    const boxScale = 1000;
    const boxDistance = .53;
    // NegativeX
    let square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[0]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(0, 0, -boxDistance))
        .multiply(new Matrix4().makeRotationY(180));
    skyboxFaces.push(square);

    // PositiveX
    square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[1]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(0, 0, boxDistance))
        .multiply(new Matrix4().makeRotationY(0));
    skyboxFaces.push(square);

    // NegativeZ
    square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[2]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(boxDistance, 0, 0))
        .multiply(new Matrix4().makeRotationY(90));
    skyboxFaces.push(square);

    // PositiveZ
    square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[3]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(-boxDistance, 0, 0))
        .multiply(new Matrix4().makeRotationY(-90));
    skyboxFaces.push(square);

    // NegativeY
    square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[4]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(0, -boxDistance, 0))
        .multiply(new Matrix4().makeRotationX(90));
    skyboxFaces.push(square);

    // PositiveY
    square = new WebGLGeometryQuad(gl, emissiveColorProgram);
    square.create(loadedAssets.skyboxTextures[5]);
    square.worldMatrix.makeIdentity()
        .multiply(new Matrix4().makeScale(boxScale, boxScale, boxScale))
        .multiply(new Matrix4().makeTranslation(0, boxDistance, 0))
        .multiply(new Matrix4().makeRotationX(90));
    skyboxFaces.push(square);
    
    // Create planets
    // Units for the Sun, planets, and Earth clouds
    const scales = [109.0780809 * .2 , 0.3824867, 0.9488868, 1, 0.5324553, 11.2091565, 9.4493572, 4.0073691, 3.8827219, 1.01];
    for (let i = 0; i < loadedAssets.planets.length; i++) {
        const scale = new Matrix4().makeScale(scales[i] * .01, scales[i] * .01, scales[i] * .01);
        const planet = new WebGLGeometryJSON(gl, phongShaderProgram);
        planet.create(loadedAssets.sphereJSON, loadedAssets.planets[i]);
        planet.worldMatrix.makeIdentity().multiply(scale);
        if (i == 9) {
            planet.alpha = 0.5;
        } else {
            planet.alpha = 1.0;
        }
        planets.push(planet);
    }

    // Create moon
    moon = new WebGLGeometryJSON(gl, phongShaderProgram);
    moon.create(loadedAssets.sphereJSON, loadedAssets.moon);
    const moonScale = 0.2726997 * .01;
    const scale = new Matrix4().makeScale(moonScale, moonScale, moonScale);
    moon.worldMatrix.makeIdentity().multiply(scale);
    moon.alpha = 1.0;
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    const earthPosition = new Vector4(planets[3].worldMatrix.elements[3], planets[3].worldMatrix.elements[7], planets[3].worldMatrix.elements[11]);
    camera.update(time.deltaTime, earthPosition);
    
    // Planet rotation
    // Units (relative to earth)
    // Units for the Sun, planets, and Earth clouds
    const orbitSpeeds = [0, 4.1520560, 1.6255290, 1, 0.5317228, 0.0843170, 0.0339905, 0.0119403, 0.0061080, 1];
    const distances = [0, 0.39, 0.72, 1, 1.52, 5.2, 9.54, 19.2, 30.06, 1];
    const axisRotationSpeeds = [14.9267007, 0.0169981, 0.0041035, 1, 0.9728997, 2.4134454, 2.2685624, 1.3887814, 1.4958333, 2];
    for (let i = 0; i < planets.length; i++) {
        const rotation = new Matrix4().makeRotationY(axisRotationSpeeds[i] * (1 / 23.9333333)); // 1/23.9333333 = length of Earth day
        planets[i].worldMatrix.multiply(rotation);

        // Don't transform the sun
        if (i != 0) {
            const cosTime = Math.cos(time.secondsElapsedSinceStart * orbitSpeeds[i] * (1 / 10)); //  1/365.26 = lemgth of Earth year
            const sinTime = Math.sin(time.secondsElapsedSinceStart * orbitSpeeds[i] * (1 / 10));
            planets[i].worldMatrix.elements[3] = cosTime * 20 * (distances[i] * .5 + 2.6 * .2);
            planets[i].worldMatrix.elements[11] = sinTime * 20 * (distances[i] * .5 + 2.6 * .2);
        }
    }

    // Moon rotation
    const moonAxisRotationSpeed = 0.0370370;
    const rotation = new Matrix4().makeRotationY(moonAxisRotationSpeed);
    moon.worldMatrix.multiply(rotation);
    const moonOrbitSpeed = 13.36834785
    const cosTime = Math.cos(time.secondsElapsedSinceStart * moonOrbitSpeed * (1 / 10));
    const sinTime = Math.sin(time.secondsElapsedSinceStart * moonOrbitSpeed * (1 / 10));
    moon.worldMatrix.elements[3] = cosTime * 20 * (0.0025695 * .5 + .05) + planets[3].worldMatrix.elements[3];
    moon.worldMatrix.elements[11] = sinTime * 20 * (0.0025695 * .5 + .05) + planets[3].worldMatrix.elements[11];

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);

    // Render skybox
    skyboxFaces.forEach(face => {
        face.render(camera, projectionMatrix, emissiveColorProgram);
    });
    
    // Render each planet
    for (let i = 0; i < planets.length; i++) {
        // Sun is rendered with only emissive lighting
        if (i == 0) {
            planets[i].render(camera, projectionMatrix, emissiveColorProgram);
        } else {
            gl.useProgram(phongShaderProgram);
            gl.uniform1f(phongShaderProgram.uniforms.alphaUniform, planets[i].alpha);
            planets[i].render(camera, projectionMatrix, phongShaderProgram);
        }
    }
    
    // Render moon
    gl.uniform1f(phongShaderProgram.uniforms.alphaUniform, moon.alpha);
    moon.render(camera, projectionMatrix, phongShaderProgram);
}
