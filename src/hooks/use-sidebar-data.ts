import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Github,
  FolderGit2,
  GitCommit
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { repositoriesService } from '@/services/repositories-service'
import { useAuth } from '@/contexts/auth-context'
import type { SidebarData } from '@/components/layout/types'

export function useSidebarData(): SidebarData {
  const { user } = useAuth()

  // Buscar repositórios salvos
  const { data: repositories } = useQuery({
    queryKey: ['saved-repositories'],
    queryFn: () => repositoriesService.getRepositories(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Get user display name from various possible fields
  const getUserName = () => {
    if (!user) return 'User'
    return user.user_metadata?.full_name ||
           user.user_metadata?.name ||
           user.user_metadata?.user_name ||
           user.email?.split('@')[0] ||
           'User'
  }

  // Get initials from name
  const getInitials = () => {
    const name = getUserName()
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get avatar URL from various possible fields
  const getAvatarUrl = () => {
    if (!user) return '/avatars/default-avatar.jpg'
    return user.user_metadata?.avatar_url ||
           user.user_metadata?.picture ||
           '/avatars/default-avatar.jpg'
  }

  const sidebarData: SidebarData = useMemo(() => ({
    user: {
      name: getUserName(),
      email: user?.email || '',
      avatar: getAvatarUrl(),
    },
    teams: [
      {
        name: 'Shadcn Admin',
        logo: Command,
        plan: 'Vite + ShadcnUI',
      },
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: 'Tasks',
            url: '/tasks',
            icon: ListTodo,
          },
          {
            title: 'GitHub',
            url: '/github',
            icon: Github,
          },
          // Repositórios com submenus dinâmicos
          {
            title: 'Repositórios',
            icon: FolderGit2,
            items: [
              {
                title: 'Gerenciar',
                url: '/repositories',
                icon: FolderGit2,
              },
              ...(repositories?.map(repo => ({
                title: repo.name,
                url: `/repositories/${encodeURIComponent(repo.full_name)}` as any,
                icon: GitCommit,
              })) || []),
            ],
          },
        ],
      },
      {
        title: 'Other',
        items: [
          {
            title: 'Settings',
            icon: Settings,
            items: [
              {
                title: 'Profile',
                url: '/settings',
                icon: UserCog,
              },
              {
                title: 'Account',
                url: '/settings/account',
                icon: Wrench,
              },
              {
                title: 'Appearance',
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: 'Notifications',
                url: '/settings/notifications',
                icon: Bell,
              },
              {
                title: 'Display',
                url: '/settings/display',
                icon: Monitor,
              },
            ],
          },
          {
            title: 'Help Center',
            url: '/help-center',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }), [repositories, user])

  return sidebarData
}