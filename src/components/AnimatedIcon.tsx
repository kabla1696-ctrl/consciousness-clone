'use client'

type Animation = 'bounce' | 'spin' | 'pulse' | 'wiggle' | 'float' | 'none'

interface AnimatedIconProps {
  icon: string
  animation?: Animation
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  continuous?: boolean
}

const sizeClass: Record<string, string> = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }

export default function AnimatedIcon({ icon, animation = 'none', size = 'md', className = '', continuous = false }: AnimatedIconProps) {
  const animMap: Record<Animation, string> = {
    bounce: 'animate-bounce', spin: 'animate-spin', pulse: 'animate-pulse',
    wiggle: 'hover:animate-[wiggle_0.5s_ease-in-out]', float: 'animate-[float_3s_ease-in-out_infinite]', none: ''
  }
  const anim = animMap[animation]
  return (
    <span className={`inline-block transition-transform ${continuous ? anim : (animation === 'wiggle' ? anim : '')} ${sizeClass[size]} ${className}`}>
      {icon}
    </span>
  )
}
