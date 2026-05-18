'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

// ─── Experiment Definitions ───

export interface Experiment {
  id: string
  variants: string[]
}

export const EXPERIMENTS: Experiment[] = [
  { id: 'cta-button-color', variants: ['violet', 'fuchsia', 'emerald'] },
  { id: 'hero-text', variants: ['classic', 'modern', 'playful'] },
  { id: 'feature-layout', variants: ['grid', 'list'] },
]

const STORAGE_KEY = 'cc_ab_assignments'
const USER_ID_KEY = 'cc_ab_user_id'

// ─── Hash-Based Assignment ───

function getUserId(): string {
  try {
    let uid = localStorage.getItem(USER_ID_KEY)
    if (!uid) {
      uid = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, uid)
    }
    return uid
  } catch {
    return 'anonymous'
  }
}

async function hashAssign(experimentId: string, userId: string, variants: string[]): Promise<string> {
  const input = `${experimentId}:${userId}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  const hashNum = hashArray[0] // use first byte for 0-255
  const index = hashNum % variants.length
  return variants[index]
}

// ─── Storage Helpers ───

function loadAssignments(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function saveAssignments(assignments: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
  } catch {}
}

// ─── Context ───

interface ABTestingContextValue {
  assignments: Record<string, string>
  getVariant: (experimentId: string) => string | null
  getAllExperiments: () => { experiment: Experiment; assigned: string | null }[]
  resetAssignments: () => void
}

const ABTestingContext = createContext<ABTestingContextValue | undefined>(undefined)

export function ABTestingProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const existing = loadAssignments()
    const userId = getUserId()

    // Check if any experiments are missing assignments
    const missing = EXPERIMENTS.filter(e => !existing[e.id])

    if (missing.length > 0) {
      // Assign all missing experiments
      const assignAll = async () => {
        const updated = { ...existing }
        for (const exp of missing) {
          updated[exp.id] = await hashAssign(exp.id, userId, exp.variants)
        }
        saveAssignments(updated)
        setAssignments(updated)
      }
      assignAll()
    } else {
      setAssignments(existing)
    }
    setReady(true)
  }, [])

  const getVariant = useCallback(
    (experimentId: string) => assignments[experimentId] ?? null,
    [assignments],
  )

  const getAllExperiments = useCallback(() => {
    return EXPERIMENTS.map(exp => ({
      experiment: exp,
      assigned: assignments[exp.id] ?? null,
    }))
  }, [assignments])

  const resetAssignments = useCallback(() => {
    saveAssignments({})
    setAssignments({})
  }, [])

  return (
    <ABTestingContext.Provider
      value={{ assignments, getVariant, getAllExperiments, resetAssignments }}
    >
      {children}
    </ABTestingContext.Provider>
  )
}

// ─── Public Hook ───

export function useExperiment(experimentId: string) {
  const ctx = useContext(ABTestingContext)
  const experiment = EXPERIMENTS.find(e => e.id === experimentId)

  if (!ctx || !experiment) {
    return { variant: experiment?.variants[0] ?? null, experiment, isReady: false }
  }

  return {
    variant: ctx.getVariant(experimentId),
    experiment,
    isReady: true,
  }
}

export function useABTesting() {
  const ctx = useContext(ABTestingContext)
  if (!ctx) {
    return {
      assignments: {} as Record<string, string>,
      getVariant: () => null,
      getAllExperiments: () => [],
      resetAssignments: () => {},
    }
  }
  return ctx
}
