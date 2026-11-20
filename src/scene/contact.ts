import * as T from 'three';

export function contactMaterial(
  source: T.MeshStandardMaterial,
  water: { value: number },
  kind: 'hull' | 'pile',
) {
  const material = source.clone();
  material.onBeforeCompile = (shader) => {
    shader.uniforms.contactWaterY = water;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float contactHeight;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\ncontactHeight=(modelMatrix*vec4(transformed,1.)).y;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float contactWaterY;varying float contactHeight;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
          float contactWet=1.-smoothstep(contactWaterY+.008,contactWaterY+.065,contactHeight);
          diffuseColor.rgb*=mix(vec3(1.),vec3(${kind === 'hull' ? '.75,.79,.75' : '.62,.69,.65'}),contactWet);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.62,contactWet*.55);',
      );
  };
  material.customProgramCacheKey = () => `water-contact-${kind}-1`;
  return material;
}
