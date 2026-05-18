import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Playlist',
  description: 'Curated music playlists generated from your consciousness emotional state.',
  openGraph: {
    title: 'Soul Playlist | Consciousness Clone',
    description: 'Curated music playlists generated from your consciousness emotional state.',
    type: 'website',
  },
}

export default function SoulPlaylistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
