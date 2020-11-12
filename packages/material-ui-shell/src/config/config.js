import { lazy } from 'react'
import Loading from '../components/Loading/Loading'

const config = {
  containers: {
    AppContainer: lazy(() => import('../containers/AppContainer/AppContainer')),
    LayoutContainer: lazy(() =>
      import('../containers/LayoutContainer/LayoutContainer')
    ),
  },
  components: {
    Loading,
    Menu: lazy(() => import('../containers/Menu/Menu')),
  },
  pwa: {
    useiOSPWAPrompt: true,
    iOSPWAPromptProps: {},
  },
  menu: {
    width: 240,
    offlineIndicatorHeight: 12,
    useMini: true,
    MenuHeader: lazy(() => import('../components/MenuHeader/MenuHeader')),
  },
  pages: {
    LandingPage: lazy(() => import('../pages/LandingPage/LandingPage')),
    PageNotFound: lazy(() => import('../pages/PageNotFound/PageNotFound')),
  },
  update: {
    checkInterval: 3000,
    repeatInterval: 300000,
  },
}

export default config
