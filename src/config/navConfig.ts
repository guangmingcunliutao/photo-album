export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

export const navConfig: NavItem[] = [
  {
    id: 'album',
    label: '相册',
    icon: '📷',
    path: '/album',
  },
  {
    id: 'upload',
    label: '上传',
    icon: '📤',
    path: '/upload',
  },
  {
    id: 'settings',
    label: '我的',
    icon: '👤',
    path: '/settings',
  },
]

