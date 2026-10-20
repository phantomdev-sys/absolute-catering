// eslint-config-next v16 ships native flat config, so it is spread directly.
// The FlatCompat shim that older Next projects use throws a circular-structure
// error against this version — if you copy a config from an older project,
// this is why it breaks.
import next from 'eslint-config-next';
import coreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', '.verify/**', 'next-env.d.ts'] },
  ...next,
  ...coreWebVitals,
  {
    rules: {
      // Colours come from tokens so a rebrand is one edit. This catches the
      // habit of reaching for a raw hex in a component.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$/]',
          message: 'Hard-coded colour. Use a token from @theme in app/globals.css.',
        },
      ],
    },
  },
];

export default eslintConfig;
