# HornPub photography

27 original images generated with the built-in `image_gen` tool (not the CLI fallback).

Final serving assets: `../src-site/public/menu/*.webp`.
Public welcome-page hero: `../gate/brand/pub-spread.webp`. Phones receive the 768px rendition beside it.

The catalog also uses WebP renditions of the 12 original PNG dishes. The original image URLs remain available to existing authenticated tabs. The individual dish photos are served at up to 1024px on their longest edge. Compact menu rows and cart entries use the matching 320px renditions in `menu/thumbs/`.
Exact final prompts and generation sources: [image-prompts.json](image-prompts.json).

Style: original American neighborhood bar-and-grill food photography, dark walnut, cream plates, green booths and warm brass lighting. No copied restaurant photos or logos. WebP conversion preserves the generated composition. Related menu variants share illustrative photography, disclosed in the site footer and product pages.

## Typography

Poppins (400, 600, 700, 800, 900) is self-hosted in `gate/brand/` and shared by the entry page and authenticated site. Downloaded from Google Fonts and converted to WOFF2; licensed under the SIL Open Font License in `Poppins-OFL.txt`. No runtime font requests go to third parties.

The HornPub wordmark pairs an original generated ivory trumpet seal with a self-hosted [Fraunces](https://github.com/undercasetype/Fraunces) subset for the seven letters. The lettering uses weight 820, optical size 48, softness 60, and the wonky alternates. See [Fraunces-OFL.txt](Fraunces-OFL.txt).
