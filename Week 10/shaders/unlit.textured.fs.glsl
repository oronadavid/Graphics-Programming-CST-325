precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;

// todo #3 - receive texture coordinates and verify correctness by 
// using them to set the pixel color 
varying highp vec2 vTextureCoords;

void main(void) {
    // todo #5
    gl_FragColor = texture2D(uTexture, vTextureCoords);
    gl_FragColor.a = uAlpha;

    // todo #3
    // gl_FragColor = vec4(vTextureCoords.x, vTextureCoords.y, 0.0, uAlpha);
}

// EOF 00100001-10
