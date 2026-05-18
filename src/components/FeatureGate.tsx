'use client'
import { ReactNode } from 'react'
import { useFeatureFlag, FeatureFlag } from '@/lib/feature-flags'

interface FeatureGateProps {
  flag: FeatureFlag
  children: ReactNode
  fallback?: ReactNode
}

export default function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag)
  if (!enabled) return <>{fallback}</>
  return <>{children}</>
}
