#version 300 es

precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 color = texture(uScene, uv).rgb;

  fragColor = vec4(color, 1.0);
}
