precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexcoords;

void main(void) {
    vec3 finalColor = texture2D(uTexture, vTexcoords).rgb;
    gl_FragColor = vec4(finalColor, 1.0);
}
