'use client'
import { ReactNode } from 'react'
import { useExperiment } from '@/lib/ab-testing'

interface ABTestProps {
  experimentId: string
  variants: Record<string, ReactNode>
  fallback?: ReactNode
}

export default function ABTest({ experimentId, variants, fallback = null }: ABTestProps) {
  const { variant } = useExperiment(experimentId)

  if (!variant || !(variant in variants)) {
    return <>{fallback}</>
  }

  return <>{variants[variant]}</>
}
