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
 * the bar opens them. Once a pane is docked the same buttons show/hide it -
 * the workspace layout readjust control - and labels collapse to icons so the
 * bar always fits (375px and below included).
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
  navVisible: { type: Boolean, default: true },
  inspectorVisible: { type: Boolean, default: true },
  focusMode: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-nav', 'toggle-inspector', 'toggle-focus'])

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
    <!-- Persistent toggle: collapses docked navigation or opens its slide-over. -->
    <button
      type="button"
      class="grid size-8 place-items-center rounded text-ink2 hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      :aria-label="
        props.navDocked
          ? props.navVisible ? 'Collapse project navigation' : 'Expand project navigation'
          : 'Open project navigation'
      "
      aria-controls="project-navigation"
      :aria-expanded="props.navDocked ? String(props.navVisible) : undefined"
      :title="
        props.navDocked
          ? props.navVisible ? 'Collapse project navigation' : 'Expand project navigation'
          : 'Open project navigation'
      "
      @click="emit('toggle-nav')"
    >
      <Icon name="menu" :size="16" />
    </button>

    <!-- Brand -->
    <div class="flex shrink-0 items-center gap-2">
      <span class="grid size-6 place-items-center rounded bg-accent text-canvas" aria-hidden="true">
        <Icon name="play" :size="13" />
      </span>
      <span class="hidden text-[13px] font-semibold tracking-tight text-ink sm:inline">Code Flow Pro</span>
    </div>

    <span class="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

    <!-- Project name: rename in place (one undoable step in the store). -->
    <input
      class="w-28 min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-[13px] text-ink2 outline-none hover:border-line focus:border-accent sm:w-44"
      :value="projectName"
      aria-label="Project name"
      maxlength="60"
      @change="store.setProjectTitle($event.target.value)"
      @keydown.enter="$event.target.blur()"
    />

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
      <!-- One-step distraction-free canvas mode on wide desktop layouts. -->
      <Btn
        v-if="props.navDocked && props.inspectorDocked"
        variant="ghost"
        :icon="props.focusMode ? 'layout' : 'eye'"
        :aria-pressed="String(props.focusMode)"
        :aria-label="props.focusMode ? 'Show sidebars' : 'Focus canvas and collapse sidebars'"
        :title="props.focusMode ? 'Show sidebars' : 'Focus canvas and collapse sidebars'"
        @click="emit('toggle-focus')"
      >
        <span>{{ props.focusMode ? 'Show sidebars' : 'Focus canvas' }}</span>
      </Btn>

      <!-- Undo / redo (brief section 17) -->
      <div class="hidden items-center sm:flex" role="group" aria-label="History">
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

      <span class="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

      <!-- AI Copilot (brief section 10) -->
      <Btn
        variant="ghost"
        icon="spark"
        :aria-expanded="copilotOpen"
        aria-label="Toggle AI Copilot"
        @click="copilotOpen ? store.closeCopilot() : store.openCopilot()"
      >
        <span class="hidden lg:inline">AI Copilot</span>
      </Btn>

      <!-- Preview (brief section 6) -->
      <Btn
        variant="ghost"
        :icon="playing ? 'pause' : 'play'"
        aria-label="Preview"
        @click="store.togglePlay()"
      >
        <span class="hidden lg:inline">Preview</span>
      </Btn>

      <!-- Export (assignment module 4) -->
      <Btn
        variant="primary"
        icon="download"
        aria-label="Export"
        @click="store.openExport()"
      >
        <span class="hidden lg:inline">Export</span>
      </Btn>

      <!-- Persistent toggle: collapses the docked inspector or opens its slide-over. -->
      <Btn
        variant="quiet"
        icon="sliders"
        :aria-label="
          props.inspectorDocked
            ? props.inspectorVisible ? 'Collapse inspector' : 'Expand inspector'
            : 'Open inspector'
        "
        aria-controls="workspace-inspector"
        :aria-pressed="props.inspectorDocked ? String(props.inspectorVisible) : undefined"
        :title="
          props.inspectorDocked
            ? props.inspectorVisible ? 'Collapse inspector' : 'Expand inspector'
            : 'Open inspector'
        "
        @click="emit('toggle-inspector')"
      />
    </div>
  </header>
</template>
