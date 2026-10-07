<script setup>
/**
 * PlaceholderArt.vue — the single artwork slot used across the prototype.
 * ---------------------------------------------------------------------------
 * THIS IS WHERE REAL IMAGES PLUG IN.
 *
 *   • If `imageUrl` is provided it renders <img :src="imageUrl" :alt="alt">.
 *   • Otherwise it renders a decorative CSS gradient with an optional glyph.
 *
 * Local WebP artwork is embedded in the built HTML; gradients remain a safe
 * fallback for content that does not have a matching image.
 * See the "IMAGE SLOTS" header comment in `src/shared/data/mockData.js` for
 * copy-paste instructions on supplying your own artwork.
 */

import AppIcon from './AppIcon.vue'

const props = defineProps({
  /** Real artwork URL/import. Empty string = use the gradient placeholder. */
  imageUrl: { type: String, default: '' },
  /** CSS gradient used as the placeholder background. */
  gradient: { type: String, default: 'linear-gradient(135deg, #4d57e0 0%, #8b5cf6 100%)' },
  /** Optional emoji glyph shown on the placeholder. */
  glyph: { type: String, default: '' },
  /** Alternative text — ALWAYS required, for both the img and the placeholder. */
  alt: { type: String, required: true },
  /** Border-radius utility class, so callers control the shape. */
  rounded: { type: String, default: 'rounded-2xl' },
  /** When true, an animated shimmer overlay signals "generating". */
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="relative overflow-hidden bg-brand-soft" :class="props.rounded">
    <!-- Real artwork -->
    <img
      v-if="props.imageUrl"
      :src="props.imageUrl"
      :alt="props.alt"
      class="size-full object-cover"
      loading="lazy"
      decoding="async"
    />

    <!-- Gradient placeholder. `role="img"` + aria-label means screen-reader
         users get the same description they would from a real image. -->
    <div
      v-else
      class="grid size-full place-items-center"
      :style="{ backgroundImage: props.gradient }"
      role="img"
      :aria-label="props.alt"
    >
      <span v-if="props.glyph" class="text-4xl drop-shadow" aria-hidden="true">{{ props.glyph }}</span>
      <span v-else class="text-white/80" aria-hidden="true">
        <AppIcon name="image" :size="30" />
      </span>
    </div>

    <!-- Generating shimmer (decorative). -->
    <span v-if="props.loading" class="animate-shimmer absolute inset-0" aria-hidden="true" />
  </div>
</template>
