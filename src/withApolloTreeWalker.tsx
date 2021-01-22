import { NextPage, NextPageContext } from 'next';
import App, { AppContext } from 'next/app';
import Head from 'next/head';
import React from 'react';

import { ApolloCacheController, ApolloCacheControllerCacheSnapshot } from './ApolloCacheController';
import { getDisplayName } from './utils/getDisplayName';

type WithApolloContext = AppContext & NextPageContext;

interface IWithApolloProps {
  apolloCacheControlSnapshot: ApolloCacheControllerCacheSnapshot
  apolloCacheControl?: ApolloCacheController
}

export default function withApolloTreeWalker(
  PageComponent: NextPage<any> | typeof App,
) {
  const ApolloCacheControllerContext = ApolloCacheController.getContext();

  function WithApollo({ apolloCacheControlSnapshot, apolloCacheControl, ...props }: IWithApolloProps) {
    const _apolloCacheController = React.useMemo<ApolloCacheController>(
      () => apolloCacheControl || new ApolloCacheController(), [apolloCacheControl],
    );

    if (apolloCacheControlSnapshot && Object.keys(apolloCacheControlSnapshot).length) {
      _apolloCacheController.restoreSnapshot(apolloCacheControlSnapshot);
    }
    return (
      <ApolloCacheControllerContext.Provider value={_apolloCacheController}>
        <PageComponent {...props} />
      </ApolloCacheControllerContext.Provider>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    WithApollo.displayName = `WithApollo(${getDisplayName(PageComponent)})`;
  }

  WithApollo.getInitialProps = async (ctx: WithApolloContext) => {
    const { AppTree } = ctx;
    const isInAppContext = Boolean(ctx.ctx);

    // Run wrapped getInitialProps methods
    let pageProps = {};
    if (PageComponent.getInitialProps) {
      pageProps = { ...pageProps, ...(await PageComponent.getInitialProps(ctx)) };
    } 
    if (typeof window !== 'undefined') {
      return pageProps;
    }

    if (ctx.res && (ctx.res.headersSent || ctx.res.writableEnded)) {
      return pageProps;
    }

    const apolloCacheControl = new ApolloCacheController();

    try {
      const { getDataFromTree } = await import('@apollo/client/react/ssr');
      // Since AppComponents and PageComponents have different context types
      // we need to modify their props a little.
      let props;
      if (isInAppContext) {
        props = { ...pageProps, apolloCacheControl };
      } else {
        props = { pageProps: { ...pageProps, apolloCacheControl } };
      }
      // @ts-ignore
      await getDataFromTree(<AppTree {...props} />);
    } catch (error) {
      // Prevent Apollo Client GraphQL errors from crashing SSR.
      // Handle them in components via the data.error prop:
      // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
      apolloCacheControl.seal();
      console.error('Error while running `getDataFromTree`', error);
    }
    // getDataFromTree does not call componentWillUnmount
    // head side effect therefore need to be cleared manually
    Head.rewind();
    return {
      ...pageProps,
      apolloCacheControlSnapshot: apolloCacheControl.getSnapshot(),
    };
  };

  return WithApollo;
}
