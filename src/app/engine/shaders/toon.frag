struct DirectionalLight {
  vec3 direction;
  vec3 color;
};

uniform sampler2D uGradientMap;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform DirectionalLight uDirectionalLight;

varying vec3 vNorm;

float luma(vec3 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

vec3 applyDirectionalLight (vec3 c, DirectionalLight dl) {
  float diffuseFactor = clamp(dot(vNorm, dl.direction), 0., 10.);
  return c * dl.color * diffuseFactor * AMBIENT_INTENSITY;
}

vec3 applyToon (vec3 c) {
  vec4 sampledColor = texture2D(uGradientMap, vec2(luma(c), .5));
  return vec3(sampledColor.r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 color = vec3(1.);
  color = applyDirectionalLight(color, uDirectionalLight);
  color = applyToon(color);
  color *= uColor.rgb;
  gl_FragColor = vec4(color, 1.);
}
