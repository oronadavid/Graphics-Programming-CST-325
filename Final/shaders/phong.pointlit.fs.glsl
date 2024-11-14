precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;
uniform float uAlpha;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vTexcoords;

void main(void) {
    vec3 fromHereToLight01 = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal01 = normalize(vWorldNormal);
    float lambert = max(dot(worldNormal01, fromHereToLight01), 0.0);

    vec3 diffuseColor = texture2D(uTexture, vTexcoords).rgb;
    vec3 finalColor = diffuseColor * lambert;

    gl_FragColor = vec4(finalColor, uAlpha);
}
