#version 300 es

#define DITHER_SIZE 8.0

precision highp float;
uniform sampler2D uScene;
uniform sampler2D uGradientMap;
uniform vec2 uResolution;
uniform float uMultiplier;


out vec4 fragColor;

// Ordered dithering aka Bayer matrix dithering
// http://devlog-martinsh.blogspot.com/2011/03/glsl-8x8-bayer-matrix-dithering.html

const int orders[64] = int[](
 0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
 3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);


float indexValue(float size) {
    int x = int(mod(gl_FragCoord.x, size));
    int y = int(mod(gl_FragCoord.y, size));
    return float(orders[(x + y * int(size))]) / 64.;
}

float dither(float luminocity) {
  float limit = indexValue(DITHER_SIZE);
  return luminocity < limit ? 0. : 1.;
}

float luma(vec3 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

float toon(float luminocity) {
  vec4 sampledColor = texture(uGradientMap, vec2(luminocity, .5));
  return sampledColor.r;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 color = texture(uScene, uv).rgb;

  float lum = luma(color);
  float tone = toon(lum);

  color *= dither(tone);

  fragColor = vec4(color, 1.0);
}
