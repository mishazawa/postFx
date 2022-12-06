#define PALETTE_SIZE 5

struct DirectionalLight {
  vec3 direction;
  vec3 color;
};

uniform sampler2D uGradientMap;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform DirectionalLight uDirectionalLight;

varying vec3 vNorm;

const int dither[64] = int[](
 0, 32, 8, 40, 2, 34, 10, 42,   /* 8x8 Bayer ordered dithering */
48, 16, 56, 24, 50, 18, 58, 26, /* pattern. Each input pixel */
12, 44, 4, 36, 14, 46, 6, 38,   /* is scaled to the 0..63 range */
60, 28, 52, 20, 62, 30, 54, 22, /* before looking in this table */
 3, 35, 11, 43, 1, 33, 9, 41,   /* to determine the action. */
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float indexValue(float size) {
    int x = int(mod(gl_FragCoord.x, size));
    int y = int(mod(gl_FragCoord.y, size));
    return float(dither[(x + y * int(size))]) / 64.0;
}

float di(float luminocity) {
  float limit = indexValue(8.);
  return luminocity < limit ? 0. : 1.;
}

float luma(vec3 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

vec3 applyDirectionalLight (DirectionalLight dl) {
  float diffuseFactor = clamp(dot(vNorm, dl.direction), 0., 10.);
  return vec3(1.) * dl.color * diffuseFactor * AMBIENT_INTENSITY;
}

float applyToon (float luminocity) {
  vec4 sampledColor = texture2D(uGradientMap, vec2(luminocity, .5));
  return sampledColor.r;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  vec3 shading     = applyDirectionalLight(uDirectionalLight);

  float luminocity = luma(shading);

  float toon       = applyToon(luminocity);
  vec3 dithering   = vec3(di(toon));
  vec3 color       = uColor.rgb * toon;
  gl_FragColor = vec4(color, 1.);
}
