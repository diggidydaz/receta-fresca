"use client";
// Demo state lives in this browser only (localStorage). No real patient data, no server database.
import { useSyncExternalStore } from "react";
import type { AppState } from "./types";

const KEY = "receta-fresca-v1";

export const initialState: AppState = {
  lang: "es",
  bigText: false,
  patientId: "p1",
  intake: {},
  intakeDone: false,
  intakeSummary: null,
  rx: null,
  visitSummary: null,
  plan: null,
  log: [],
  order: null,
};

let state: AppState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initialState, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: keep in-memory state */
  }
}

function emit() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  load();
  return state;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  load();
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
}

/** Clears the demo but keeps language and text size. */
export function resetDemo() {
  load();
  state = { ...initialState, lang: state.lang, bigText: state.bigText };
  emit();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = { ...initialState, ...JSON.parse(e.newValue) };
        cb();
      } catch {
        /* ignore */
      }
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => initialState);
}

/** True after the browser state has been read; use to avoid flashing default content. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
