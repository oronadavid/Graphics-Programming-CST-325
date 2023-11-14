precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // diffuse contribution
    // todo #1 normalize the light direction and store in a separate variable
    // vec3 normalizedLightDirection = normalize(uLightPosition);
    vec3 normalizedLightDirection = normalize(uLightPosition - vWorldPosition);
    // todo #2 normalize the world normal and store in a separate variable
    vec3 normalizedWorldNormal = normalize(vWorldNormal);
    // todo #3 calculate the lambert term
    float lambert = max(dot(normalizedWorldNormal, normalizedLightDirection), 0.0);

    // specular contribution
    // todo #4 in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 surfaceToEye = normalize(uCameraPosition - vWorldPosition);

    // todo #5 in world space, calculate the reflection vector (normalized)
    float surfaceNormalMagnitude = dot(uLightPosition, normalizedWorldNormal);
    vec3 surfaceNormalScaled = surfaceNormalMagnitude * normalizedWorldNormal;

    vec3 surfaceToLight = uLightPosition - vWorldNormal;

    vec3 reflectionVector = normalize(-surfaceToLight + 2.0 * surfaceNormalScaled);
    // todo #6 calculate the phong term
    float phong = pow(max(dot(reflectionVector, surfaceToEye), 0.0), 64.0);


    // combine
    // todo #7 apply light and material interaction for diffuse value by using the texture color as the material
    float diffuse = lambert;

    // todo #8 apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    float specular = phong * .3;

    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    vec3 diffuseColor = diffuse * albedo;
    vec3 specularColor = specular * albedo;

    // todo #9
    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(albedo * phong, 1.0);
    gl_FragColor = vec4(finalColor, 1.0);
}

// EOF 00100001-10