# with-next-apollo-tree-walker
Apollo SSR data fetching on a per component basis with getDataFromTree without having to (pre)fetch in getInitialProps


## What is it?
This package consists of a `withApolloTreeWalker` HOC and a `useApolloCacheController` hook.
With this package you can achieve SSR data fetching on a per component basis without having to (pre)fetch in getInitialProps.

We integrate Apollo with Apollo's [getDataFromTree](https://www.apollographql.com/docs/react/performance/server-side-rendering/#executing-queries-with-getdatafromtree) to fetch queries on the server from inside any component and hydrate them in the client with a custom Cache Controller.

Because our app uses Apollo Client, some of the components in the React tree probably execute a GraphQL query with the useQuery hook. We can instruct Apollo Client to execute all of the queries required by the tree's components with the getDataFromTree function.

This function walks down the entire tree and executes every required query it encounters (including nested queries). It returns a Promise that resolves when all result data is ready in the Apollo Client cache.

When the Promise resolves, you're ready to render your React tree and return it, along with the current state of the Apollo Client cache.

We use a class instance called ApolloCacheControl to manage all registered caches. So we can have multiple caches in case we have multiple Apollo clients.
After getDataFromTree has resolved all promises, we get a snapshot of the cache and hydrate that to the client where we use is as an initial state for our Apollo client.

*Sidenote!*
Apollo's getDataFromTree walks down the entire React tree.
It'll run renderToStaticMarkup from ReactDOMServer. Note that this is the React SSR API and means that it does a full server-render of the whole React tree.

Note that renderToStaticMarkup is a synchronous run to completion method, meaning that it can't await promises as of right now (Suspense might solve this).

In practice though you have useQuery and <Query> components deeply nested in the React tree. React can't await those as said, so this is worked around by throwing a promise every time a query is found.

When the promise is thrown that is awaited and then the rendering starts again, from the beginning of the tree.

This means that if you have nested queries you cause a lot of full server-renders.

This solution might cause you a performance overhead (and general bundle size when using Apollo is quite heavy currently). 

But try and and see if its a bottleneck for you!

## Usage
See the `example` folder for a full fletched example on how to use this.

In your Custom _app.tsx add the HOC:

```typescript
import { withApolloServerSideRender } from 'with-next-apollo-tree-walker'
import { useApollo } from '../utils/apolloClient'

function MyApp({ Component, pageProps }: AppProps)  {
  const apolloClient = useApollo('your-cache-name')

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default withApolloServerSideRender(MyApp)
```

In your custom hook useApollo you need to register and extract your cache.

```typescript
import { useApolloCacheController } from  'with-next-apollo-tree-walker'

import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { useMemo } from 'react'

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined

function createApolloClient({ registerCache, initialState }) {

  const link = new HttpLink({
    uri: 'YOUR_URI',
  })
  
  const cache = new InMemoryCache({}).restore(initialState || {})

  if (registerCache) {
    registerCache(cache)
  }

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache,
  })
}

function initializeApollo({ registerCache, initialState }) {
  const _apolloClient = apolloClient ?? createApolloClient({ registerCache, initialState })

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function useApollo(cacheId: string) {
  const { register, extract } = useApolloCacheController()

  const registerCache = (cache: InMemoryCache) => register(cacheId, cache)
  const initialState = extract(cacheId)

  return useMemo(() => initializeApollo({ registerCache, initialState }), [registerCache, initialState])
}
```

## Production Build

Run `npm run build` to build a file for production and emit the types

## Development Build
Run `npm run dev` to build a file for development
## Contributing
You are free to contribute to this project!
Please use a conventional commit and make pull requests to the develop branch (pre-release branch).