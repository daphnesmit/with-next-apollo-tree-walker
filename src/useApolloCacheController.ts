import React from 'react';
import { ApolloCacheController } from './ApolloCacheController';

const useApolloCacheController = (): ApolloCacheController => {
  const context = React.useContext(ApolloCacheController.getContext());
  if (context === null) {
    throw new Error('Cannot use useApolloCacheController without context provider');
  }

  return context;
};

export { useApolloCacheController };
