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

const int xorders[16] = int[](0,  8,  2,  10,
                                     12, 4,  14, 6,
                                     3,  11, 1,  9,
                                     15, 7,  13, 5);

const float lightnessSteps = 4.0;

float indexValue(float size) {
    int x = int(mod(gl_FragCoord.x, size));
    int y = int(mod(gl_FragCoord.y, size));
    return float(orders[x + y * int(size)]+1) / 64.;
}


float lightnessStep(float l) {
    /* Quantize the lightness to one of `lightnessSteps` values */
    return floor((0.5 + l * lightnessSteps)) / lightnessSteps;
}

vec3 hsl2rgb(vec3 c){
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

float dither(float luminocity) {
  float step = lightnessStep(luminocity);
  float limit = indexValue(DITHER_SIZE);
  return luminocity < limit ? step : 1.;
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

  float lum       = luma(color);
  float dithering = dither(lum);

  color *= dithering;
  color *= toon(lum);

  fragColor = vec4(color, 1.0);
}
