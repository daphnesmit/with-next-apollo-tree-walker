# With Next Apollo Tree Walker  Example
In this example you can see how you can achieve SSR data fetching on a per component basis without having to (pre)fetch in getInitialProps.

In this simple example we integrate Apollo with Apollo's [getDataFromTree](https://www.apollographql.com/docs/react/performance/server-side-rendering/#executing-queries-with-getdatafromtree) to fetch queries on the server from inside any component and hydrate them in the client with a custom Cache Controller.

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

---
This example relies on [Prisma + Nexus](https://github.com/prisma-labs/nextjs-graphql-api-examples) for it

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
