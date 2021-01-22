import { ApolloProvider } from '@apollo/client'
import { AppProps } from 'next/app'
import { withApolloServerSideRender } from '../../dist/with-next-apollo-tree-walker.module'
import '../styles/globals.css'
import { useApollo } from '../utils/apolloClient'


function MyApp({ Component, pageProps }: AppProps)  {
  const apolloClient = useApollo('cache-name')

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default withApolloServerSideRender(MyApp)
