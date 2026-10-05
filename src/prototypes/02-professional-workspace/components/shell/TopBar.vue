<script setup>
/**
 * TopBar.vue — brief section 4.
 * ---------------------------------------------------------------------------
 * Prototype 02 does NOT use Prototype 01's Home/Projects/Create/Profile tabs.
 * The top bar carries, left to right:
 *
 *   brand + project name | contextual quick switches (Scenes/Assets/Characters)
 *                        | undo/redo | AI Copilot | Preview | Export
 *
 * On narrow screens the left nav and inspector collapse into slide-overs, so
 * the bar also exposes their toggles; once both panes are docked (>=1440px)
 * those toggles disappear rather than becoming dead controls.
 *
 * The project switcher is intentionally just the project NAME here: a real
 * switcher would need a second project's worth of state, which the brief does
 * not ask for ("project name / project switcher" — the name is enough).
 */

import { computed } from 'vue'
import { useRouter, useStore } from '../../composables.js'
import { TOP_NAV_IDS } from '../../navigation.js'
import Icon from '../ui/Icon.vue'
import Btn from '../ui/Btn.vue'

const props = defineProps({
  navDocked: { type: Boolean, default: false },
  inspectorDocked: { type: Boolean, default: false },
})

const emit = defineEmits(['open-nav', 'open-inspector'])

const router = useRouter()
const store = useStore()

const route = computed(() => router.route.value)
const quickSwitches = TOP_NAV_IDS.map((id) => id)

const projectName = computed(() => store.state.project.title || 'Untitled project')
const playing = computed(() => store.state.playback.playing)
const canUndo = computed(() => store.canUndo.value)
const canRedo = computed(() => store.canRedo.value)

/** Tooltips name the specific change, e.g. "Undo: Move scene" (brief 17). */
const undoLabel = computed(() => store.state.history.past.at(-1)?.label || 'change')
const redoLabel = computed(() => store.state.history.future.at(-1)?.label || 'change')
const undoTip = computed(() => `Undo ${undoLabel.value}`)
const redoTip = computed(() => `Redo ${redoLabel.value}`)

const copilotOpen = computed(() => store.state.copilot.open)

/** Reach the quick switch by hash so browser back/forward keeps working. */
function go(path) {
  router.navigate(path)
}
</script>

<template>
  <header
    class="flex items-center gap-2 border-b border-line bg-surface px-3"
    role="banner"
  >
    <!-- Slide-over toggles (only while a pane is not docked) -->
    <button
      v-if="!props.navDocked"
      type="button"
      class="grid size-8 place-items-center rounded text-ink2 hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      aria-label="Open project navigation"
      @click="emit('open-nav')"
    >
      <Icon name="menu" :size="16" />
    </button>

    <!-- Brand -->
    <div class="flex shrink-0 items-center gap-2">
      <span class="grid size-6 place-items-center rounded bg-accent text-canvas" aria-hidden="true">
        <Icon name="play" :size="13" />
      </span>
      <span class="text-[13px] font-semibold tracking-tight text-ink">Code Flow Pro</span>
    </div>

    <span class="h-5 w-px bg-line" aria-hidden="true" />

    <!-- Project name -->
    <p class="min-w-0 truncate text-[13px] text-ink2" title="Project name">
      {{ projectName }}
    </p>

    <!-- Contextual workspace navigation (brief section 4) -->
    <nav class="ml-4 hidden items-center gap-1 md:flex" aria-label="Workspace sections">
      <a
        v-for="id in quickSwitches"
        :key="id"
        :href="`#/${id}`"
        class="rounded px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        :class="
          route?.name === id
            ? 'bg-elevated font-medium text-ink'
            : 'text-ink2 hover:bg-elevated hover:text-ink'
        "
        :aria-current="route?.name === id ? 'page' : undefined"
      >
        {{ id === 'scenes' ? 'Scenes' : id === 'assets' ? 'Assets' : 'Characters' }}
      </a>
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      <!-- Undo / redo (brief section 17) -->
      <div class="flex items-center" role="group" aria-label="History">
        <Btn
          variant="quiet"
          size="md"
          icon="undo"
          :disabled="!canUndo"
          :title="undoTip"
          aria-label="Undo"
          @click="store.undo()"
        />
        <Btn
          variant="quiet"
          size="md"
          icon="redo"
          :disabled="!canRedo"
          :title="redoTip"
          aria-label="Redo"
          @click="store.redo()"
        />
      </div>

      <span class="h-5 w-px bg-line" aria-hidden="true" />

      <!-- AI Copilot (brief section 10) -->
      <Btn
        variant="ghost"
        icon="spark"
        :aria-expanded="copilotOpen"
        aria-label="Toggle AI Copilot"
        @click="copilotOpen ? store.closeCopilot() : store.openCopilot()"
      >
        AI Copilot
      </Btn>

      <!-- Preview (brief section 6) -->
      <Btn variant="ghost" :icon="playing ? 'pause' : 'play'" @click="store.togglePlay()">
        Preview
      </Btn>

      <!-- Export (assignment module 4) -->
      <Btn variant="primary" icon="download" @click="store.openExport()">Export</Btn>

      <!-- Inspector toggle while it is not docked -->
      <Btn
        v-if="!props.inspectorDocked"
        variant="quiet"
        icon="sliders"
        aria-label="Toggle inspector"
        @click="emit('open-inspector')"
      />
    </div>
  </header>
</template>
