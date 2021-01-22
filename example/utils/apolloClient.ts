import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { concatPagination } from '@apollo/client/utilities'
import { useMemo } from 'react'
import { useApolloCacheController } from '../../dist/with-next-apollo-tree-walker'

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined

interface initializeApolloProps {
  registerCache?: (cache: InMemoryCache) => void
  initialState?: NormalizedCacheObject | undefined
}

function createApolloClient({ registerCache, initialState }: initializeApolloProps) {
  const cacheConfig = {
    typePolicies: {
      Query: {
        fields: {
          allPosts: concatPagination(),
        },
      },
    },
  }

  const cache = new InMemoryCache(cacheConfig).restore(initialState || {})

  if (registerCache) {
    registerCache(cache)
  }

  const link = new HttpLink({
    uri: 'https://nextjs-graphql-with-prisma-simple.vercel.app/api', // Server URL (must be absolute)
    credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache,
  })
}

function initializeApollo({ registerCache, initialState }: initializeApolloProps) {
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

  return useMemo(() => initializeApollo({
    registerCache,
    initialState
  }), [registerCache, initialState])
}
