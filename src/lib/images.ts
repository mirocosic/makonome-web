import type { ImageMetadata } from 'astro';

/**
 * Pixel size of an imported image, read without making Astro ship the original file.
 *
 * In a build, Astro wraps every imported image in a Proxy. Reading any property on it
 * (`src`, `width`, `height`) marks the image as "used directly", and Astro then keeps the
 * full-size original in dist/assets/ next to the resized WebP files, even though no page
 * links it (node_modules/astro/dist/assets/utils/proxy.js, assets/build/generate.js).
 * `clone` is the one property the Proxy returns without marking: Astro's own getImage()
 * reads the size through it (assets/internal.js). Outside a build there is no Proxy and
 * `clone` is undefined, so the image itself is read.
 *
 * Use this instead of `image.width` / `image.height` in components; pass the image itself
 * only to <Image> or getImage().
 */
export function imageSize(image: ImageMetadata): { width: number; height: number } {
  const plain = (image as ImageMetadata & { clone?: ImageMetadata }).clone ?? image;
  return { width: plain.width, height: plain.height };
}
