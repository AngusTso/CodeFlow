<script setup>
/**
 * ProjectNav.vue — brief section 5: the compact production-oriented nav.
 * ---------------------------------------------------------------------------
 * Two groups exactly as specified: PROJECT (Storyboard, Scenes, Assets,
 * Characters) and LIBRARY (Media, Styles, Audio). Deliberately NOT a file
 * manager — its purpose is to preserve production context, so each entry is a
 * single row with a label and a one-line note.
 *
 * Every row is a real <a href="#/...">, so browser back/forward and
 * bookmarking work the way a professional tool should (this is why routes are
 * hash-based at all). `aria-current="page"` marks the active section.
 *
 * The close button is hidden from 768px up, because that is where the nav
 * docks into the grid and can no longer be dismissed.
 */

import { PROJECT_NAV } from '../../navigation.js'
import Icon from '../ui/Icon.vue'

const props = defineProps({
  /** Active section id (see sectionFromRoute()). */
  section: { type: String, default: 'storyboard' },
})

const emit = defineEmits(['close'])

/** One icon per destination; data-driven so a new nav row needs one line. */
const ICON_BY_ID = {
  storyboard: 'layout',
  scenes: 'eye',
  assets: 'grid',
  characters: 'person',
  media: 'film',
  styles: 'sliders',
  audio: 'wave',
}
</script>

<template>
  <nav class="flex h-full flex-col overflow-y-auto scroll" aria-label="Project navigation">
    <!-- Header: brand slot + dismiss (mobile only) -->
    <div class="flex items-center gap-2 px-4 pb-1 pt-4">
      <p class="eyebrow flex-1">Workspace</p>
      <button
        type="button"
        class="grid size-7 place-items-center rounded text-ink2 hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent md:hidden"
        aria-label="Close project navigation"
        @click="emit('close')"
      >
        <Icon name="close" :size="15" />
      </button>
    </div>

    <!-- Groups -->
    <template v-for="group in PROJECT_NAV" :key="group.group">
      <p class="eyebrow px-4 pb-1 pt-4">{{ group.group }}</p>

      <ul class="px-2">
        <li v-for="item in group.items" :key="item.id">
          <a
            :href="`#${item.path}`"
            class="group flex items-center gap-2.5 rounded px-2 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            :class="
              props.section === item.id
                ? 'bg-elevated text-ink'
                : 'text-ink2 hover:bg-elevated hover:text-ink'
            "
            :aria-current="props.section === item.id ? 'page' : undefined"
            :title="item.note"
          >
            <!-- Active marker makes the state visible without relying on colour. -->
            <span
              class="h-4 w-0.5 rounded-full bg-accent transition-all"
              :class="props.section === item.id ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            />
            <span
              class="grid size-5 place-items-center"
              :class="props.section === item.id ? 'text-accent' : 'text-ink3 group-hover:text-ink2'"
              aria-hidden="true"
            >
              <Icon :name="ICON_BY_ID[item.id] || 'film'" :size="15" />
            </span>
            <span class="flex-1 text-[13px] font-medium">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </template>

    <!-- Keeps production context visible without turning into a file manager. -->
    <div class="mt-auto border-t border-line px-4 py-3">
      <p class="text-[11px] leading-relaxed text-ink3">
        Prototype 02 — professional workspace. AI output is simulated and every
        change is reversible with undo.
      </p>
    </div>
  </nav>
</template>
