<script setup>
/**
 * CharacterCard.vue — one generated character (AGENTS.md "CharacterCard").
 * ---------------------------------------------------------------------------
 * Assignment module 3 ("Character Generator"): show AI-suggested character
 * templates, let the user customise them, and show how they fit the scenes.
 * This card is the read-only presentation of a character; editing happens in
 * <CharacterEditor> inside a bottom sheet.
 */

import AppIcon from '../ui/AppIcon.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** A Character model (see shared/domain/models.js). */
  character: { type: Object, required: true },
  /** Disables actions while a generation is running. */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <article class="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-sm">
    <PlaceholderArt
      :image-url="props.character.imageUrl || ''"
      :gradient="props.character.gradient"
      :alt="props.character.alt"
      rounded="rounded-2xl"
      class="aspect-square w-full"
    />

    <div class="mt-3 px-1">
      <h3 class="text-base font-semibold leading-snug text-ink">{{ props.character.name }}</h3>
      <p class="text-xs font-medium uppercase tracking-wide text-brand">
        {{ props.character.archetype }}
      </p>
      <p class="mt-1.5 line-clamp-2 text-sm text-muted">{{ props.character.description }}</p>

      <dl class="mt-2.5 space-y-1 text-xs text-muted">
        <div class="flex gap-1.5">
          <dt class="font-medium text-ink/70">Outfit</dt>
          <dd class="truncate">{{ props.character.outfit }}</dd>
        </div>
        <div class="flex gap-1.5">
          <dt class="font-medium text-ink/70">Expression</dt>
          <dd class="truncate">{{ props.character.expression }}</dd>
        </div>
        <div class="flex gap-1.5">
          <dt class="font-medium text-ink/70">Pose</dt>
          <dd class="truncate">{{ props.character.pose }}</dd>
        </div>
      </dl>
    </div>

    <div class="mt-3 flex items-center gap-1.5 px-1">
      <button
        type="button"
        class="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-soft px-3 text-sm font-medium text-brand-ink transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
        :disabled="props.busy"
        :aria-label="`Customise ${props.character.name}`"
        @click="emit('edit')"
      >
        <AppIcon name="sliders" :size="16" />
        Customise
      </button>

      <button
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-40"
        :disabled="props.busy"
        :aria-label="`Remove ${props.character.name}`"
        @click="emit('delete')"
      >
        <AppIcon name="trash" :size="18" />
      </button>
    </div>
  </article>
</template>
