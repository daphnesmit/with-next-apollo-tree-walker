const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
  [
    withBundleAnalyzer,
  ],
  {
    webpack: (config) => {
      config.module.rules.forEach((rule) => {
        const ruleContainsTs = rule.test && rule.test.toString().includes('ts|tsx');
    
        if (ruleContainsTs && rule.use && rule.use.loader === 'next-babel-loader') {
          rule.include = undefined;
        }
      });
      
      return config;
    },
  },
);
