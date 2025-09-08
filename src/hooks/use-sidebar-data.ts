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
import type { SidebarData } from '@/components/layout/types'

export function useSidebarData(): SidebarData {
  // Buscar repositórios salvos
  const { data: repositories } = useQuery({
    queryKey: ['saved-repositories'],
    queryFn: () => repositoriesService.getRepositories(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const sidebarData: SidebarData = useMemo(() => ({
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
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
            title: 'Apps',
            url: '/apps',
            icon: Package,
          },
          {
            title: 'Chats',
            url: '/chats',
            badge: '3',
            icon: MessagesSquare,
          },
          {
            title: 'Users',
            url: '/users',
            icon: Users,
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
          {
            title: 'Secured by Clerk',
            icon: ClerkLogo,
            items: [
              {
                title: 'Sign In',
                url: '/clerk/sign-in',
              },
              {
                title: 'Sign Up',
                url: '/clerk/sign-up',
              },
              {
                title: 'User Management',
                url: '/clerk/user-management',
              },
            ],
          },
        ],
      },
      {
        title: 'Pages',
        items: [
          {
            title: 'Auth',
            icon: ShieldCheck,
            items: [
              {
                title: 'Sign In',
                url: '/sign-in',
              },
              {
                title: 'Sign In (2 Col)',
                url: '/sign-in-2',
              },
              {
                title: 'Sign Up',
                url: '/sign-up',
              },
              {
                title: 'Forgot Password',
                url: '/forgot-password',
              },
              {
                title: 'OTP',
                url: '/otp',
              },
            ],
          },
          {
            title: 'Errors',
            icon: Bug,
            items: [
              {
                title: 'Unauthorized',
                url: '/errors/unauthorized',
                icon: Lock,
              },
              {
                title: 'Forbidden',
                url: '/errors/forbidden',
                icon: UserX,
              },
              {
                title: 'Not Found',
                url: '/errors/not-found',
                icon: FileX,
              },
              {
                title: 'Internal Server Error',
                url: '/errors/internal-server-error',
                icon: ServerOff,
              },
              {
                title: 'Maintenance Error',
                url: '/errors/maintenance-error',
                icon: Construction,
              },
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
  }), [repositories])

  return sidebarData
}