precision mediump float;

attribute vec3 aPosition;

varying vec4 fragPosition;

void main()
{
    vec3 lightPosition = aPosition;

    fragPosition = vec4(lightPosition, 1.0);

    gl_Position = vec4(aPosition, 1.0);
}
