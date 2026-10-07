/**
 * 02-professional-workspace/workspaceStore.js - Prototype 02's workspace state.
 * ---------------------------------------------------------------------------
 * WHY A SEPARATE STORE FROM PROTOTYPE 01
 *   Prototype 01 uses `shared/store/creationStore.js`, which is a five-step
 *   guided WIZARD (idea -> storyboard -> scenes -> character -> video).
 *   Prototype 02 deliberately avoids a wizard-first workflow: the project IS
 *   the workspace and the user moves freely between inspect, direct, generate,
 *   compare and undo.
 *
 *   So both the presentation and the interaction state differ. What stays
 *   shared is the domain model, the mock AI and the utilities - exactly what
 *   AGENTS.md and brief section 28 ask for.
 *
 * THE CORE LOOP (brief section 30) is what this file encodes:
 *   SELECT -> INSPECT -> DIRECT -> GENERATE -> COMPARE -> REFINE -> ACCEPT/UNDO -> CONTINUE
 *
 * DESIGN RULES
 *   * Views never mutate state directly; they call actions defined here.
 *   * Undo is a stack of project snapshots (brief section 17: "AI
 *     experimentation must feel reversible").
 *   * Generation feedback is stage-based, never a fake percentage (section 11).
 *   * Nothing here is specific to a prototype's look - that all lives in the
 *     components, so this file stays readable on its own.
 */
import { computed, reactive } from "vue";

import { delay } from "../../shared/utils/async.js";
import { createRng, intBetween, pick, uid } from "../../shared/utils/random.js";
import {
  TRACK_KINDS,
  createCharacter,
  createExportSettings,
  createProject,
  createTimelineClip,
  createTimelineTrack,
  reorderScenes,
} from "../../shared/domain/models.js";
import {
  AUDIO_TRACKS,
  CHARACTER_TEMPLATES,
  EXPORT_PLATFORMS,
  FRAMINGS,
  LENSES,
  LIGHTING_CONTRAST,
  MOVEMENTS,
} from "../../shared/data/mockData.js";
import {
  buildScene,
  generateScene,
  generateStoryboard,
  generateVariation as generateVariationAI,
  proposeChanges,
  simulateExport,
} from "../../shared/ai/mockAi.js";
import { actionsFor, stagesFor } from "./navigation.js";

/** Undo keeps a lightweight stack, not a full production history (sec. 17). */
const HISTORY_LIMIT = 20;

/** Rapid successive changes to the SAME control collapse into one entry. */
const COALESCE_WINDOW_MS = 400;

/** Wall-clock budget for one generation sequence. The brief allows <= 3s. */
const STAGE_DURATION_MS = 620;

/** Initial brief text, so the workspace opens with a populated storyboard. */
const SEED_PROMPT =
  "A tense 1980s sci-fi thriller: a detective chases a signal through a rain-soaked neon city.";

/**
 * Build the four timeline lanes from whatever scenes currently exist.
 *
 * Rebuilding the whole timeline keeps every track consistent with the video
 * (no lane can drift out of alignment after a reorder or a deletion) and stays
 * fully deterministic.
 *
 * @param {import('../../shared/domain/models.js').Scene[]} scenes
 * @returns {import('../../shared/domain/models.js').TimelineTrack[]}
 */
function buildTracks(scenes, previousTracks = []) {
  const tracks = TRACK_KINDS.map((def) => {
    // Reuse the existing track id when one exists: Vue keys and any clip
    // selection survive a rebuild.
    const previous = previousTracks.find((track) => track.kind === def.kind);
    return createTimelineTrack(def, previous ? { id: previous.id } : {});
  });
  const byKind = Object.fromEntries(tracks.map((track) => [track.kind, track]));

  // --- VIDEO: one clip per scene -------------------------------------------
  let cursor = 0;
  const starts = [];
  scenes.forEach((scene, index) => {
    starts.push(cursor);
    byKind.video.clips.push(
      createTimelineClip({
        trackId: byKind.video.id,
        label: "Scene " + String(index + 1).padStart(2, "0"),
        start: cursor,
        duration: scene.duration,
        origin: scene.origin,
        sceneId: scene.id,
        gradient: scene.gradient,
        imageUrl: scene.imageUrl,
        alt: scene.alt,
      }),
    );
    cursor += scene.duration;
  });

  const total = Math.max(cursor, 1);

  // --- DIALOGUE: lines fall on the odd-numbered beats -----------------------
  if (scenes.length >= 2) {
    const start = starts[1];
    const endIndex = Math.min(3, scenes.length - 1);
    const duration = starts[endIndex] + scenes[endIndex].duration - start;
    byKind.dialogue.clips.push(
      createTimelineClip({
        trackId: byKind.dialogue.id,
        label: "Dialogue - INT. market",
        start,
        duration,
        origin: "ai-generated",
      }),
    );
  }

  // --- AUDIO: one music bed across the whole sequence ----------------------
  byKind.audio.clips.push(
    createTimelineClip({
      trackId: byKind.audio.id,
      label: AUDIO_TRACKS[0],
      start: 0,
      duration: total,
      origin: "human-edited",
    }),
  );

  // --- EFFECTS: an ambience bed and a closing accent -----------------------
  byKind.effects.clips.push(
    createTimelineClip({
      trackId: byKind.effects.id,
      label: "Rain layer",
      start: 0,
      duration: Math.min(8, total),
      origin: "ai-generated",
    }),
    createTimelineClip({
      trackId: byKind.effects.id,
      label: "Impact",
      start: Math.max(0, total - 5),
      duration: 4,
      origin: "human-edited",
    }),
  );

  return tracks;
}
/**
 * Seed the workspace with a POPULATED project.
 *
 * The workspace opens already working: a reviewer should land inside a
 * professional studio, not on an empty dashboard they must fill first. Content
 * is built deterministically from the shared mock data with a fixed seed, so
 * every reload shows the same project.
 *
 * The first and last scenes carry marketing roles (hook / cta) per brief
 * section 19, so the filmmaker AND marketer contextual action sets can both be
 * demonstrated inside one workspace. There is deliberately no separate
 * "Marketing Mode".
 *
 * @returns {import('../../shared/domain/models.js').Project}
 */
function seedProject() {
  const rng = createRng("pro::seed::" + SEED_PROMPT);
  const types = ["urban", "sci-fi", "urban", "abstract", "sci-fi"];
  const roles = ["hook", null, null, null, "cta"];

  const scenes = types.map((type, index) => {
    const scene = buildScene(rng, index, { type });
    scene.role = roles[index];
    scene.origin = "ai-generated";
    // Give the professional parameter set real, varied values so the Inspector
    // is meaningful from the very first frame.
    scene.lens = pick(rng, LENSES);
    scene.movement = pick(rng, MOVEMENTS);
    scene.framing = pick(rng, FRAMINGS);
    scene.lightingIntensity = intBetween(rng, 55, 88);
    scene.lightingContrast = pick(rng, LIGHTING_CONTRAST);
    return scene;
  });

  // Two AI-suggested characters, built synchronously from the shared templates
  // so the Characters section has content without an async first load.
  const characters = ["futuristic-mechanic", "casual-vlogger"].map(
    (templateId) => {
      const template = CHARACTER_TEMPLATES.find(
        (entry) => entry.id === templateId,
      );
      return createCharacter({
        name: template.name,
        templateId: template.id,
        archetype: template.archetype,
        description: template.description,
        outfit: template.outfit,
        expression: template.expression,
        pose: template.pose,
        gradient:
          "linear-gradient(135deg, " +
          template.palette[0] +
          " 0%, " +
          template.palette[1] +
          " 100%)",
        imageUrl: template.imageUrl,
        alt:
          template.alt +
          " Character: " +
          template.archetype +
          ", " +
          template.name +
          ".",
      });
    },
  );

  const project = createProject({
    title: "Signal Chase - teaser",
    idea: SEED_PROMPT,
    source: "idea",
    storyboard: { scenes: reorderScenes(scenes), logline: SEED_PROMPT },
    characters,
    aspectRatio: "16:9",
    variations: [],
  });

  project.tracks = buildTracks(project.storyboard.scenes);
  return project;
}

export function createWorkspaceStore() {
  /* Local mutable handles used by the closures below. Declared here, at the
     top of the factory, so the file reads top-to-bottom without surprises. */
  let lastCommitLabel = null;
  let lastCommitAt = 0;
  let streamTimer = null;
  let playbackTimer = null;
  /** Bumped on every "Add scene" so each addition differs deterministically. */
  let addSceneVariant = 0;
  /* -------------------------------------------------------------------- */
  /* STATE                                                                 */
  /* -------------------------------------------------------------------- */
  const state = reactive({
    /** Falls back to a collapsed timeline below 768px so the stage stays usable on narrow viewports. */
    ready: false,

    /** The project itself (shared model, extended additively for P02). */
    project: seedProject(),

    /** The brief: natural-language direction that drives generation. */
    prompt: SEED_PROMPT,

    /** What the Inspector is currently inspecting (brief section 7). */
    selection: { kind: "scene", id: null, role: null },

    /** Which timeline clip is selected, if any. */
    selectedClip: null,

    playback: { playing: false, time: 0 },

    timeline: { collapsed: true },

    /** Stage-based generation feedback (brief section 11 - never a %). */
    ai: {
      running: false,
      task: null,
      stages: [],
      stageIndex: 0,
      skip: false,
      cancel: false,
      error: "",
    },

    /** AI Copilot (brief section 10): proposal in, review, apply / undo. */
    copilot: {
      open: false,
      instruction: "",
      thinking: false,
      streaming: false,
      streamText: "",
      proposal: null,
    },

    /** Variations of the selected scene (brief section 15). */
    variations: { list: [], variant: 0, activeId: null },

    inspector: { open: true, group: "camera" },
    exportPanel: { open: false, result: null },
    /** Undo stack (brief section 17). */
    history: { past: [], future: [] },
  });

  // Open on the first scene so the Inspector is never blank on load.
  state.selection.id = state.project.storyboard.scenes[0]?.id || null;

  /* -------------------------------------------------------------------- */
  /* DERIVED STATE                                                         */
  /* -------------------------------------------------------------------- */
  const scenes = computed(() => state.project.storyboard.scenes);

  const videoTrack = computed(
    () =>
      state.project.tracks.find((track) => track.kind === "video") || {
        clips: [],
      },
  );

  /** Total playable duration in seconds (end of the last VIDEO clip). */
  const duration = computed(() => {
    const clips = videoTrack.value.clips;
    if (!clips.length) return 0;
    const last = clips[clips.length - 1];
    return last.start + last.duration;
  });

  /** The VIDEO clip under the playhead (falls back to the last clip). */
  const currentClip = computed(() => {
    const clips = videoTrack.value.clips;
    if (!clips.length) return null;
    const t = state.playback.time;
    return (
      clips.find((clip) => t >= clip.start && t < clip.start + clip.duration) ||
      clips[clips.length - 1]
    );
  });

  const currentScene = computed(() => {
    const clip = currentClip.value;
    if (!clip) return null;
    return scenes.value.find((scene) => scene.id === clip.sceneId) || null;
  });

  const selectedScene = computed(() => {
    if (state.selection.kind !== "scene") return null;
    return (
      scenes.value.find((scene) => scene.id === state.selection.id) || null
    );
  });

  const activeVariation = computed(
    () =>
      state.variations.list.find(
        (entry) => entry.id === state.variations.activeId,
      ) || null,
  );

  /**
   * What the preview shows. An active variation always wins so COMPARE and
   * "Use Variation" have something to act on.
   */
  const previewScene = computed(() => {
    if (activeVariation.value) return activeVariation.value.value;
    if (state.playback.playing) return currentScene.value;
    return selectedScene.value || currentScene.value;
  });

  const selectedClipObj = computed(() => {
    if (!state.selectedClip) return null;
    const track = state.project.tracks.find(
      (t) => t.id === state.selectedClip.trackId,
    );
    return track
      ? track.clips.find((clip) => clip.id === state.selectedClip.clipId) ||
          null
      : null;
  });

  /** Contextual AI actions for the current selection (brief section 18). */
  const contextActions = computed(() => actionsFor(state.selection));

  const canUndo = computed(() => state.history.past.length > 0);
  const canRedo = computed(() => state.history.future.length > 0);
  /* -------------------------------------------------------------------- */
  /* UNDO / REDO - brief section 17                                        */
  /* -------------------------------------------------------------------- */
  /** Take a deep copy of the reversible slice of state. */
  function takeSnapshot() {
    return {
      project: JSON.parse(JSON.stringify(state.project)),
      selection: JSON.parse(JSON.stringify(state.selection)),
    };
  }

  function restore(snapshot) {
    state.project = snapshot.project;
    state.selection = snapshot.selection;
  }

  /**
   * Perform a change that must be undoable.
   *
   * Consecutive changes to the SAME control inside COALESCE_WINDOW_MS collapse
   * into one history entry, so dragging the intensity slider once is a single
   * Ctrl+Z rather than eighty.
   *
   * @param {string} label  Human-readable label shown in tooltips/menus.
   * @param {() => void} mutate
   */
  function commit(label, mutate) {
    const now = Date.now();
    const coalesce =
      label === lastCommitLabel && now - lastCommitAt < COALESCE_WINDOW_MS;

    if (!coalesce) {
      state.history.past.push({ label, snapshot: takeSnapshot() });
      if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
      state.history.future = [];
    }

    lastCommitLabel = label;
    lastCommitAt = now;
    mutate();
  }

  function undo() {
    const entry = state.history.past.pop();
    if (!entry) return false;
    state.history.future.push({ label: entry.label, snapshot: takeSnapshot() });
    restore(entry.snapshot);
    lastCommitLabel = null;
    return true;
  }

  function redo() {
    const entry = state.history.future.pop();
    if (!entry) return false;
    state.history.past.push({ label: entry.label, snapshot: takeSnapshot() });
    restore(entry.snapshot);
    lastCommitLabel = null;
    return true;
  }

  /* -------------------------------------------------------------------- */
  /* SELECTION - brief section 30 (SELECT first)                           */
  /* -------------------------------------------------------------------- */

  /** Select a scene: the Inspector switches to it and the preview follows. */
  function selectScene(sceneId) {
    const scene = scenes.value.find((entry) => entry.id === sceneId);
    if (!scene) return;

    const active = activeVariation.value;
    if (active && active.sceneId !== sceneId) state.variations.activeId = null;

    state.selection = { kind: "scene", id: sceneId, role: scene.role || null };
    state.selectedClip = null;

    // Selecting a scene moves the playhead onto it, so timeline, preview and
    // Inspector all agree about what we are looking at.
    const clip = videoTrack.value.clips.find(
      (entry) => entry.sceneId === sceneId,
    );
    if (clip) state.playback.time = clip.start;
  }

  /** Selecting a timeline clip drives the Inspector (brief section 7). */
  function selectClip(trackId, clipId) {
    state.selectedClip = { trackId, clipId };

    const track = state.project.tracks.find((entry) => entry.id === trackId);
    const clip = track
      ? track.clips.find((entry) => entry.id === clipId)
      : null;
    if (!clip) return;

    state.playback.time = clip.start;

    if (clip.sceneId) {
      selectScene(clip.sceneId);
      state.selectedClip = { trackId, clipId };
      return;
    }

    // A non-VIDEO clip (dialogue / audio / effects) has no scene behind it.
    state.selection = { kind: "clip", id: clipId, role: null };
  }

  /** Inspect a character from the Characters section. */
  function selectCharacter(characterId) {
    state.selection = { kind: "character", id: characterId, role: null };
    state.variations.activeId = null;
  }

  function selectAsset(assetId) {
    state.selection = { kind: "asset", id: assetId, role: null };
    state.variations.activeId = null;
  }

  function setInspectorGroup(group) {
    state.inspector.group = group;
  }

  function toggleInspector() {
    state.inspector.open = !state.inspector.open;
  }

  function toggleTimeline() {
    state.timeline.collapsed = !state.timeline.collapsed;
  }

  /* -------------------------------------------------------------------- */
  /* GENERATION - brief sections 11 and 29                                 */
  /* -------------------------------------------------------------------- */

  function resetAI() {
    state.ai.running = false;
    state.ai.task = null;
    state.ai.stages = [];
    state.ai.stageIndex = 0;
    state.ai.skip = false;
    state.ai.cancel = false;
  }

  /** "Skip animation": stop the staged display but still run the work. */
  function skipAI() {
    state.ai.skip = true;
  }

  /** Cancel: abandon the sequence entirely and discard its result. */
  function cancelAI() {
    state.ai.cancel = true;
  }

  /**
   * Run a staged generation sequence.
   *
   * Stages are UX states only - there is deliberately NO percentage, because a
   * fake percentage would be fictional progress (brief section 11). The whole
   * sequence stays within STAGE_DURATION_MS per stage, well inside the 3s the
   * brief allows.
   *
   * @param {string} task  Key used to look up the stage list.
   * @param {() => Promise<T>} work - The actual (mock) generation.
   * @returns {Promise<T|null>} The result, or null when cancelled.
   * @template T
   */
  async function runAI(task, work) {
    if (state.ai.running) return null;

    state.ai.running = true;
    state.ai.task = task;
    state.ai.stages = stagesFor(task);
    state.ai.stageIndex = 0;
    state.ai.skip = false;
    state.ai.cancel = false;
    state.ai.error = "";

    try {
      for (let index = 0; index < state.ai.stages.length; index += 1) {
        state.ai.stageIndex = index;
        await delay(STAGE_DURATION_MS);
        if (state.ai.cancel) {
          resetAI();
          return null;
        }
        if (state.ai.skip) break;
      }

      const result = await work();
      resetAI();
      return result;
    } catch (error) {
      resetAI();
      state.ai.error =
        "Something went wrong while generating. Please try again.";
      console.error("[mockAi] generation failed:", error);
      return null;
    }
  }
  /* -------------------------------------------------------------------- */
  /* INSPECTOR CHANGES - brief sections 7, 9 and 17                        */
  /* -------------------------------------------------------------------- */

  /**
   * Apply one inspector parameter to the selected scene.
   *
   * Human edits are marked `human-edited` so the AI-aware origin badge (brief
   * section 13) tells the truth about who changed this value: AI participates,
   * the human remains in control.
   *
   * The matching VIDEO clip is patched in place rather than rebuilt, so Vue
   * keys and the current selection stay stable while dragging a control.
   *
   * @param {string} key   Scene field name.
   * @param {*} value
   */
  function setSceneParam(key, value) {
    const scene = selectedScene.value;
    if (!scene) return;

    commit("Inspector change", () => {
      const target = state.project.storyboard.scenes.find(
        (entry) => entry.id === scene.id,
      );
      if (!target) return;

      target[key] = value;
      if (target.origin !== "human-edited") target.origin = "human-edited";

      const clip = videoTrack.value.clips.find(
        (entry) => entry.sceneId === target.id,
      );
      if (clip) {
        clip.origin = target.origin;
        clip.gradient = target.gradient;
        clip.imageUrl = target.imageUrl;
        clip.alt = target.alt;
      }
    });
  }

  /** Update the free-text brief (prompt + parameters, brief section 9). */
  function setPrompt(text) {
    state.prompt = text;
  }

  /* -------------------------------------------------------------------- */
  /* STORYBOARD - assignment module 1                                      */
  /* -------------------------------------------------------------------- */
  /**
   * Re-generate the storyboard from the current brief.
   * The scene set changes, so the timeline lanes are rebuilt from scratch.
   */
  async function regenerateStoryboard() {
    const previousTracks = state.project.tracks;
    const result = await runAI("storyboard", () =>
      generateStoryboard(state.prompt, { count: 5 }),
    );
    if (!result) return null;

    commit("Regenerate storyboard", () => {
      state.project.storyboard = result;
      state.project.tracks = buildTracks(result.scenes, previousTracks);
      state.selectedClip = null;
      state.variations.list = [];
      state.variations.variant = 0;
      state.variations.activeId = null;
      state.selection = {
        kind: "scene",
        id: result.scenes[0]?.id || null,
        role: null,
      };
      state.playback.time = 0;
    });

    return result;
  }

  /* -------------------------------------------------------------------- */
  /* SCENE OPERATIONS                                                      */
  /* -------------------------------------------------------------------- */

  /** Remove a scene, then re-flow the lanes. */
  function deleteScene(sceneId) {
    const index = state.project.storyboard.scenes.findIndex(
      (entry) => entry.id === sceneId,
    );
    if (index < 0) return false;

    commit("Delete scene", () => {
      state.project.storyboard = {
        ...state.project.storyboard,
        scenes: reorderScenes(
          state.project.storyboard.scenes.filter(
            (entry) => entry.id !== sceneId,
          ),
        ),
      };
      state.project.tracks = buildTracks(
        state.project.storyboard.scenes,
        state.project.tracks,
      );
      state.selectedClip = null;
      state.variations.list = state.variations.list.filter(
        (entry) => entry.sceneId !== sceneId,
      );
      state.variations.activeId = null;

      const next =
        state.project.storyboard.scenes[index] ||
        state.project.storyboard.scenes[index - 1];
      state.selection = {
        kind: "scene",
        id: next ? next.id : null,
        role: null,
      };
    });

    return true;
  }

  /** Move a scene earlier or later and re-flow the lanes. */
  function moveScene(sceneId, delta) {
    const list = state.project.storyboard.scenes;
    const index = list.findIndex((entry) => entry.id === sceneId);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= list.length) return false;

    commit("Move scene", () => {
      const next = [...list];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      state.project.storyboard.scenes = reorderScenes(next);
      state.project.tracks = buildTracks(
        state.project.storyboard.scenes,
        state.project.tracks,
      );
      state.selectedClip = null;
    });

    return true;
  }

  /**
   * Add a scene to the sequence - the "Add scene" action.
   *
   * The shot comes from the shared deterministic mock AI, seeded from the
   * current brief so the addition stays on theme. It lands directly after the
   * selected scene (or at the end), the lanes are rebuilt, and the whole thing
   * is ONE undoable step.
   *
   * @returns {Promise<Scene|null>} The new scene, or null when cancelled.
   */
  async function addScene() {
    if (state.ai.running) return null;

    const list = state.project.storyboard.scenes;
    const selectedIndex = list.findIndex(
      (entry) => entry.id === state.selection.id,
    );
    const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : list.length;

    addSceneVariant += 1;
    const scene = await runAI("scene", () =>
      generateScene(state.prompt, {
        variant: addSceneVariant,
        order: insertAt,
      }),
    );
    if (!scene) return null;

    commit("Add scene", () => {
      const next = [...state.project.storyboard.scenes];
      next.splice(insertAt, 0, scene);
      state.project.storyboard = {
        ...state.project.storyboard,
        scenes: reorderScenes(next),
      };
      state.project.tracks = buildTracks(
        state.project.storyboard.scenes,
        state.project.tracks,
      );
      state.selectedClip = null;
      state.selection = { kind: "scene", id: scene.id, role: null };
    });

    return scene;
  }

  /**
   * Rename the project (editable title in the top bar). One undoable step.
   * @param {string} title
   * @returns {boolean} True when the name actually changed.
   */
  function setProjectTitle(title) {
    const next = String(title || "").trim();
    if (!next || next === state.project.title) return false;

    commit("Rename project", () => {
      state.project.title = next;
    });
    return true;
  }

  /**
   * Rename a scene from the Inspector's "Scene name" field. One undoable step.
   * @param {string} sceneId
   * @param {string} title
   * @returns {boolean} True when the name actually changed.
   */
  function setSceneName(sceneId, title) {
    const scene = state.project.storyboard.scenes.find(
      (entry) => entry.id === sceneId,
    );
    if (!scene) return false;

    const next = String(title || "").trim();
    if (!next || next === scene.title) return false;

    commit("Rename scene", () => {
      const target = state.project.storyboard.scenes.find(
        (entry) => entry.id === sceneId,
      );
      if (target) target.title = next;
    });
    return true;
  }

  /** Duplicate a scene - a cheap way to try a variation on a variant track. */
  function duplicateScene(sceneId) {
    const index = state.project.storyboard.scenes.findIndex(
      (entry) => entry.id === sceneId,
    );
    if (index < 0) return null;

    let created = null;

    commit("Duplicate scene", () => {
      const source = state.project.storyboard.scenes[index];
      created = { ...source, id: uid("scene"), origin: "human-edited" };
      const next = [...state.project.storyboard.scenes];
      next.splice(index + 1, 0, created);
      state.project.storyboard.scenes = reorderScenes(next);
      state.project.tracks = buildTracks(
        state.project.storyboard.scenes,
        state.project.tracks,
      );
      state.selection = {
        kind: "scene",
        id: created.id,
        role: created.role || null,
      };
      state.selectedClip = null;
    });

    return created;
  }
  /* -------------------------------------------------------------------- */
  /* VARIATIONS - brief section 15 (the original is never overwritten)     */
  /* -------------------------------------------------------------------- */

  /**
   * Generate a new variation of the selected scene and open it in COMPARE.
   * The baseline scene is untouched until `useVariation` commits it.
   */
  async function requestVariation() {
    const scene = selectedScene.value || previewScene.value;
    if (!scene) return null;

    const variant = state.variations.variant + 1;
    const variation = await runAI("variation", () =>
      generateVariationAI(scene, variant),
    );
    if (!variation) return null;

    state.variations.list.push(variation);
    state.variations.variant = variant;
    state.variations.activeId = variation.id;
    return variation;
  }

  /** Show a variation in the preview without applying it. */
  function previewVariation(variationId) {
    state.variations.activeId = variationId;
  }

  /** Fall back to the untouched original ("Keep Original"). */
  function keepOriginal() {
    state.variations.activeId = null;
  }

  /**
   * Accept a variation ("Use Variation"). Committed as one undoable step, so
   * Experimentation stays reversible exactly as brief section 17 requires.
   */
  function useVariation(variationId) {
    const variation = state.variations.list.find(
      (entry) => entry.id === variationId,
    );
    if (!variation) return;
    const sceneId = variation.sceneId;

    commit("Use variation", () => {
      const index = state.project.storyboard.scenes.findIndex(
        (entry) => entry.id === sceneId,
      );
      if (index < 0) return;

      const next = [...state.project.storyboard.scenes];
      next[index] = { ...variation.value, id: sceneId };
      state.project.storyboard.scenes = next;

      const clip = videoTrack.value.clips.find(
        (entry) => entry.sceneId === sceneId,
      );
      if (clip) {
        clip.origin = variation.value.origin;
        clip.gradient = variation.value.gradient;
        clip.imageUrl = variation.value.imageUrl;
        clip.alt = variation.value.alt;
      }

      state.variations.activeId = null;
      state.selection = {
        kind: "scene",
        id: sceneId,
        role: variation.value.role || null,
      };
    });
  }

  /* -------------------------------------------------------------------- */
  /* AI COPILOT - brief section 10                                         */
  /* -------------------------------------------------------------------- */

  function openCopilot() {
    state.copilot.open = true;
  }

  function closeCopilot() {
    state.copilot.open = false;
  }

  function stopStream() {
    if (streamTimer !== null) {
      clearInterval(streamTimer);
      streamTimer = null;
    }
    state.copilot.streaming = false;
  }

  /**
   * Send an instruction to the Copilot.
   *
   * The reply streams in character by character (~18ms) as brief section 10
   * specifies, then becomes a proposal the user can review. Nothing is applied
   * without approval - "AI assists; humans direct".
   *
   * @param {string} [text] - Defaults to the text still in the input box.
   */
  async function submitCopilotInstruction(text) {
    const instruction = String(text || state.copilot.instruction).trim();
    const scene = selectedScene.value || previewScene.value;
    if (!instruction || !scene) return;
    if (state.copilot.thinking || state.copilot.streaming) return;

    state.copilot.instruction = "";
    state.copilot.proposal = null;
    state.copilot.streamText = "";
    state.copilot.thinking = true;

    const proposal = await proposeChanges(instruction, scene);
    state.copilot.thinking = false;
    if (!proposal) return;

    state.copilot.proposal = proposal;
    // stopStream() clears the streaming flag, so it must run BEFORE the flag is
    // set — otherwise the UI never sees a stream in progress.
    stopStream();
    state.copilot.streaming = true;

    streamTimer = setInterval(() => {
      const next = proposal.summary.slice(
        0,
        state.copilot.streamText.length + 1,
      );
      state.copilot.streamText = next;
      if (next.length >= proposal.summary.length) stopStream();
    }, 18);
  }

  /** Cancel streaming but keep the proposal that is already there. */
  function cancelStream() {
    stopStream();
  }

  /** Put the instruction back in the box so the user can reword it. */
  function editInstruction() {
    const current = state.copilot.proposal;
    if (current) state.copilot.instruction = current.instruction;
    state.copilot.proposal = null;
    state.copilot.streamText = "";
  }

  /** Approve the proposal: apply its patch as one undoable change. */
  function applyProposal() {
    const proposal = state.copilot.proposal;
    const scene = selectedScene.value || previewScene.value;
    if (!proposal || !scene) return;

    commit("Apply AI changes", () => {
      const index = state.project.storyboard.scenes.findIndex(
        (entry) => entry.id === scene.id,
      );
      if (index < 0) return;

      const target = {
        ...state.project.storyboard.scenes[index],
        ...proposal.patch,
      };
      // A person approved it, so the badge correctly reads "Human Edited".
      target.origin = "human-edited";

      const next = [...state.project.storyboard.scenes];
      next[index] = target;
      state.project.storyboard.scenes = next;

      const clip = videoTrack.value.clips.find(
        (entry) => entry.sceneId === target.id,
      );
      if (clip) {
        clip.origin = target.origin;
        clip.gradient = target.gradient;
        clip.imageUrl = target.imageUrl;
        clip.alt = target.alt;
      }

      state.selection = {
        kind: "scene",
        id: target.id,
        role: target.role || null,
      };
      state.copilot.proposal = null;
      state.copilot.streamText = "";
    });
  }

  /** Decline the proposal. Nothing changed, so there is nothing to undo. */
  function rejectProposal() {
    state.copilot.proposal = null;
    state.copilot.streamText = "";
  }
  /* -------------------------------------------------------------------- */
  /* TIMELINE - brief sections 12 and 14                                   */
  /* -------------------------------------------------------------------- */

  /** Recompute VIDEO clip starts so lanes never overlap after a resize. */
  function reflowStarts() {
    const video = state.project.tracks.find((track) => track.kind === "video");
    if (!video) return;

    let cursor = 0;
    video.clips.forEach((clip) => {
      clip.start = cursor;
      cursor += clip.duration;
    });

    const total = Math.max(cursor, 1);
    const audio = state.project.tracks.find((track) => track.kind === "audio");
    if (audio && audio.clips[0]) audio.clips[0].duration = total;

    // Keep tail clips inside the sequence rather than off the end of it.
    state.project.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (clip.start >= total)
          clip.start = Math.max(0, total - clip.duration);
      });
    });

    if (state.playback.time > total) state.playback.time = total;
  }

  /**
   * Resize a clip by a number of seconds (clamped to 1-60).
   * A VIDEO clip also updates the scene behind it and marks it `human-edited`,
   * so the origin badge stays truthful.
   */
  function resizeClip(trackId, clipId, delta) {
    const track = state.project.tracks.find((entry) => entry.id === trackId);
    const clip = track
      ? track.clips.find((entry) => entry.id === clipId)
      : null;
    if (!clip) return;

    const next = Math.min(60, Math.max(1, clip.duration + delta));
    if (next === clip.duration) return;

    commit("Resize clip", () => {
      const liveTrack = state.project.tracks.find(
        (entry) => entry.id === trackId,
      );
      const live = liveTrack
        ? liveTrack.clips.find((entry) => entry.id === clipId)
        : null;
      if (!live) return;

      live.duration = next;

      if (live.sceneId) {
        const scene = state.project.storyboard.scenes.find(
          (entry) => entry.id === live.sceneId,
        );
        if (scene) {
          scene.duration = next;
          if (scene.origin !== "human-edited") scene.origin = "human-edited";
          live.origin = scene.origin;
        }
      }

      reflowStarts();
    });
  }

  /**
   * Move a clip. A VIDEO clip delegates to scene reordering - the timeline and
   * the storyboard are two views of the same sequence, so moving one moves the
   * other (brief section 14). Other lanes shift along the time axis.
   */

  /**
   * Move a clip by a TIME delta, which is what a timeline drag produces.
   *
   * A VIDEO clip cannot slide along the axis: it represents a scene and scenes
   * are ordered (brief section 14). The dragged distance in seconds is therefore
   * converted into the position the clip would land on (the nearest scene start)
   * and the reorder happens from there - so dragging actually changes the order
   * instead of silently doing nothing. Other lanes keep the raw time delta.
   *
   * @returns {boolean} True when something moved.
   */
  function moveClipBySeconds(trackId, clipId, deltaSeconds) {
    const track = state.project.tracks.find((entry) => entry.id === trackId);
    const clip = track
      ? track.clips.find((entry) => entry.id === clipId)
      : null;
    if (!clip) return false;
    if (!clip.sceneId) return moveClip(trackId, clipId, deltaSeconds);

    const list = state.project.storyboard.scenes;
    const from = list.findIndex((entry) => entry.id === clip.sceneId);
    if (from < 0) return false;

    const destination = Math.max(0, clip.start + deltaSeconds);

    // Snap to the nearest scene START: half a clip width either way is the
    // natural threshold for moving exactly one position.
    let target = 0;
    let nearest = Infinity;
    let cursor = 0;
    list.forEach((scene, index) => {
      const distance = Math.abs(cursor - destination);
      if (distance < nearest) {
        nearest = distance;
        target = index;
      }
      cursor += scene.duration;
    });

    if (target === from) return false;
    return moveScene(clip.sceneId, target - from);
  }

  function moveClip(trackId, clipId, delta) {
    const track = state.project.tracks.find((entry) => entry.id === trackId);
    const clip = track
      ? track.clips.find((entry) => entry.id === clipId)
      : null;
    if (!clip) return false;

    if (clip.sceneId) return moveScene(clip.sceneId, delta);

    commit("Move clip", () => {
      const liveTrack = state.project.tracks.find(
        (entry) => entry.id === trackId,
      );
      const live = liveTrack
        ? liveTrack.clips.find((entry) => entry.id === clipId)
        : null;
      if (live) live.start = Math.max(0, live.start + delta);
    });

    return true;
  }

  /* -------------------------------------------------------------------- */
  /* PLAYBACK - brief section 6                                            */
  /* -------------------------------------------------------------------- */

  function stopPlayback() {
    state.playback.playing = false;
    if (playbackTimer !== null) {
      clearInterval(playbackTimer);
      playbackTimer = null;
    }
  }

  function seek(seconds) {
    state.playback.time = Math.min(Math.max(0, seconds), duration.value);
  }

  function togglePlay() {
    if (state.playback.playing) {
      stopPlayback();
      return;
    }
    if (duration.value <= 0) return;

    // Comparing a variation is a deliberate, paused act - playing stops it.
    state.variations.activeId = null;
    if (state.playback.time >= duration.value) state.playback.time = 0;
    state.playback.playing = true;

    playbackTimer = setInterval(() => {
      const next = state.playback.time + 0.1;
      if (next >= duration.value) {
        state.playback.time = duration.value;
        stopPlayback();
      } else {
        state.playback.time = next;
      }
    }, 100);
  }

  /* -------------------------------------------------------------------- */
  /* EXPORT - assignment module 4                                          */
  /* -------------------------------------------------------------------- */

  function openExport() {
    state.exportPanel.open = true;
    state.exportPanel.result = null;
  }

  function closeExport() {
    state.exportPanel.open = false;
  }

  /** Platform presets also carry the right resolution / format / fps. */
  function setExportPlatform(platformId) {
    const platform = EXPORT_PLATFORMS.find((entry) => entry.id === platformId);
    if (!platform) return;

    commit("Change export platform", () => {
      state.project.export = createExportSettings({
        platform: platform.id,
        resolution: platform.resolution,
        format: platform.format,
        fps: platform.fps,
      });
    });
  }

  async function runExport() {
    const result = await runAI("compose", () =>
      simulateExport(state.project.export),
    );
    if (!result) return null;
    state.exportPanel.result = result;
    return result;
  }

  /** Release every timer. Called when the app unmounts. */
  function dispose() {
    stopPlayback();
    stopStream();
    resetAI();
  }
  /** The workspace now has content from the first frame. */
  state.ready = true;

  /* -------------------------------------------------------------------- */
  /* PUBLIC API                                                            */
  /* -------------------------------------------------------------------- */
  return {
    // -- state
    state,

    // -- derived (read-only)
    scenes,
    videoTrack,
    duration,
    currentClip,
    currentScene,
    selectedScene,
    activeVariation,
    previewScene,
    selectedClipObj,
    contextActions,
    canUndo,
    canRedo,

    // -- history (brief section 17)
    undo,
    redo,

    // -- selection (brief section 30)
    selectScene,
    selectClip,
    selectCharacter,
    selectAsset,
    setInspectorGroup,
    toggleInspector,
    toggleTimeline,

    // -- brief + inspector
    setPrompt,
    setProjectTitle,
    setSceneName,
    setSceneParam,

    // -- generation
    skipAI,
    cancelAI,
    regenerateStoryboard,

    // -- scenes
    deleteScene,
    addScene,
    moveScene,
    duplicateScene,

    // -- variations (brief section 15)
    requestVariation,
    previewVariation,
    keepOriginal,
    useVariation,

    // -- AI Copilot (brief section 10)
    openCopilot,
    closeCopilot,
    submitCopilotInstruction,
    cancelStream,
    editInstruction,
    applyProposal,
    rejectProposal,

    // -- timeline (brief sections 12 and 14)
    resizeClip,
    moveClipBySeconds,
    moveClip,

    // -- playback (brief section 6)
    seek,
    togglePlay,
    stopPlayback,

    // -- export (assignment module 4)
    openExport,
    closeExport,
    setExportPlatform,
    runExport,

    // -- lifecycle
    dispose,
  };
}
