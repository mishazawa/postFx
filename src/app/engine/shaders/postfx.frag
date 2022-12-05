precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uMultiplier;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 color = texture2D(uScene, uv).rgb;
  gl_FragColor = vec4(color, 1.0);
}
