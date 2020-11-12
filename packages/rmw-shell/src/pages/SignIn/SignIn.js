import * as firebaseui from 'firebaseui'
import AuthUI from 'rmw-shell/lib/containers/AuthUI/AuthUI'
import Page from 'material-ui-shell/lib/containers/Page/Page'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useConfig } from 'base-shell/lib/providers/Config'
import { useFirebase } from 'rmw-shell/lib/providers/Firebase'
import { useIntl } from 'react-intl'
import { useMenu } from 'material-ui-shell/lib/providers/Menu'

const SignIn = () => {
  const intl = useIntl()
  const { appConfig } = useConfig()
  const { firebaseApp } = useFirebase()
  const { firebase = {} } = appConfig || {}
  const { firebaseuiProps = {} } = firebase
  const { setAuthMenuOpen } = useMenu()

  const uiConfig = {
    signInSuccessUrl: '/',
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: () => {
        setAuthMenuOpen(false)
        // To avoid page reload on single page applications
        return false
      },
    },
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    ...firebaseuiProps,
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'sign_in' })}>
      <Helmet>
        <link
          type="text/css"
          rel="stylesheet"
          href="https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.css"
        />
      </Helmet>
      <AuthUI firebaseApp={firebaseApp} uiConfig={uiConfig} />
    </Page>
  )
}

export default SignIn
