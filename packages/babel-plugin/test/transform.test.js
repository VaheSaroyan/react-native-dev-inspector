/**
 * Regression tests for the source-injection transform.
 *
 * Run with: pnpm --filter @rn-dev-inspector/babel-plugin test
 *
 * Uses node:test so no extra test runner dependency is needed.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const babel = require('@babel/core');

const plugin = require('../dist/index.js');

const CWD = '/proj';
const FILE = '/proj/components/Test.tsx';

function transform(code, options = {}) {
  const result = babel.transformSync(code, {
    filename: FILE,
    cwd: CWD,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[plugin.default || plugin, { cwd: CWD, ...options }]],
  });
  return result.code;
}

/** Transform, then re-parse the output to prove it is valid JavaScript. */
function transformAndReparse(code, options) {
  const out = transform(code, options);
  babel.parseSync(out, {
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
  });
  return out;
}

test('injects dataInspectorSource and a static testID on non-root elements', () => {
  // The root <View> forwards the call site; the nested <Text> gets a static ID.
  const out = transform('const A = () => <View><Text>hi</Text></View>;');
  assert.match(out, /<Text dataInspectorSource="Text@components\/Test\.tsx:1:23"/);
  assert.match(out, /testID="Text@components\/Test\.tsx:1:23"/);
});

test('root element of a component forwards the call site', () => {
  const out = transform('const A = () => <View><Text>hi</Text></View>;');
  assert.match(out, /testID=\{__callerSource \|\| "View@components\/Test\.tsx:1:17"\}/);
});

test('injects __callerSource on user components', () => {
  const out = transform('const A = () => <CustomButton title="x" />;');
  assert.match(out, /__callerSource="CustomButton@components\/Test\.tsx:1:17"/);
});

test('preserves a user-defined testID', () => {
  const out = transform('const A = () => <Text testID="login-button">hi</Text>;');
  assert.match(out, /testID="login-button"/);
  // source info still available via the dedicated prop
  assert.match(out, /dataInspectorSource="Text@components\/Test\.tsx/);
  assert.equal(out.match(/testID=/g).length, 1);
});

test('injectTestId: false leaves testID alone but still records the source', () => {
  const out = transform('const A = () => <Text>hi</Text>;', { injectTestId: false });
  assert.doesNotMatch(out, /testID/);
  assert.match(out, /dataInspectorSource="Text@components\/Test\.tsx/);
});

// --- production safety ----------------------------------------------------

function transformWithEnv(code, envName, options = {}) {
  return babel.transformSync(code, {
    filename: FILE,
    cwd: CWD,
    envName,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[plugin.default || plugin, { cwd: CWD, ...options }]],
  }).code;
}

test('does not inject source paths in production builds', () => {
  const out = transformWithEnv('const A = () => <View><Text>x</Text></View>;', 'production');
  assert.doesNotMatch(out, /dataInspectorSource/);
  assert.doesNotMatch(out, /__callerSource/);
  assert.doesNotMatch(out, /Test\.tsx/, 'source paths must not reach a release bundle');
});

test('injects in development', () => {
  const out = transformWithEnv('const A = () => <View><Text>x</Text></View>;', 'development');
  assert.match(out, /dataInspectorSource/);
});

test('enabled: true overrides the production default', () => {
  const out = transformWithEnv(
    'const A = () => <View><Text>x</Text></View>;',
    'production',
    { enabled: true }
  );
  assert.match(out, /dataInspectorSource/);
});

test('enabled: false turns the plugin off everywhere', () => {
  const out = transformWithEnv(
    'const A = () => <View><Text>x</Text></View>;',
    'development',
    { enabled: false }
  );
  assert.doesNotMatch(out, /dataInspectorSource/);
});

test('skips excluded files', () => {
  const result = babel.transformSync('const A = () => <Text>hi</Text>;', {
    filename: '/proj/node_modules/pkg/index.tsx',
    cwd: CWD,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[plugin.default || plugin, { cwd: CWD }]],
  });
  assert.doesNotMatch(result.code, /dataInspectorSource/);
});

test('skips Fragment and other prop-less components', () => {
  const out = transform('const A = () => <Fragment><Text>hi</Text></Fragment>;');
  assert.doesNotMatch(out, /<Fragment dataInspectorSource/);
});

// --- __callerSource forwarding -------------------------------------------
// The root native element of a user component forwards the parent's call site.
// Every shape below must produce code where `__callerSource` is actually bound;
// emitting a bare reference would throw a ReferenceError in the running app.

const COMPONENT_SHAPES = {
  'concise arrow body': 'const Foo = (props) => <View><Text>hi</Text></View>;',
  'destructuring with rest': 'const Foo = ({ title, ...rest }) => { return <View {...rest}><Text>{title}</Text></View>; };',
  'defaulted destructuring': 'const Foo = ({ a } = {}) => { return <View><Text>{a}</Text></View>; };',
  'props identifier + block': 'function Foo(props) { return <View><Text>{props.t}</Text></View>; }',
  'no params': 'function Foo() { return <View><Text>hi</Text></View>; }',
  'defaulted props identifier': 'const Foo = (props = {}) => { return <View><Text>x</Text></View>; };',
  'forwardRef': 'const Foo = forwardRef(({ title }, ref) => { return <View ref={ref}><Text>{title}</Text></View>; });',
  'memo(forwardRef())': 'const Foo = memo(forwardRef((props, ref) => <View><Text>x</Text></View>));',
  'React.memo': 'const Foo = React.memo(function Foo(props) { return <View><Text>x</Text></View>; });',
};

for (const [name, source] of Object.entries(COMPONENT_SHAPES)) {
  test(`forwarding produces valid, bound code: ${name}`, () => {
    const out = transformAndReparse(source);

    if (out.includes('__callerSource ||')) {
      const bound =
        /const __callerSource =/.test(out) ||
        /__callerSource[,\s}]/.test(out.slice(0, out.indexOf('=>') + 1)) ||
        /\{[^}]*__callerSource[^}]*\}/.test(out);
      assert.ok(bound, `__callerSource referenced but never bound in:\n${out}`);
    }
  });
}

test('rest element stays last in a destructuring pattern', () => {
  const out = transformAndReparse(
    'const Foo = ({ title, ...rest }) => { return <View {...rest} />; };'
  );
  const params = out.slice(out.indexOf('({'), out.indexOf('=>'));
  assert.ok(
    params.indexOf('__callerSource') < params.indexOf('...rest'),
    `__callerSource must be inserted before the rest element, got:\n${params}`
  );
});

test('forwardRef components forward the call site', () => {
  const out = transformAndReparse(
    'const Foo = forwardRef(({ title }, ref) => { return <View ref={ref}><Text>{title}</Text></View>; });'
  );
  assert.match(
    out,
    /testID=\{__callerSource \|\| "View@/,
    'the root element of a forwardRef component should forward __callerSource'
  );
  assert.match(out, /__callerSource\s*\n?\s*\}, ref\)/, '__callerSource must be destructured from props');
});

test('memo(forwardRef(...)) is recognised as a component', () => {
  const out = transformAndReparse(
    'const Foo = memo(forwardRef((props, ref) => <View><Text>x</Text></View>));'
  );
  assert.match(out, /testID=\{__callerSource \|\| "View@/);
  assert.match(out, /const __callerSource = props\.__callerSource;/);
});

test('an unrecognised wrapper call is not treated as a component', () => {
  // styled(...) does not pass props through in a way we can rely on, so the
  // root element must fall back to a static testID rather than emit an
  // unbound __callerSource reference.
  const out = transformAndReparse(
    'const Foo = styled((props) => <View><Text>x</Text></View>);'
  );
  assert.doesNotMatch(out, /__callerSource \|\|/);
});

test('concise arrow body is expanded into a block when needed', () => {
  const out = transformAndReparse('const Foo = (props) => <View />;');
  assert.match(out, /const __callerSource = props\.__callerSource;/);
  assert.match(out, /return <View/);
});

test('does not rebind __callerSource when the author already declared it', () => {
  const out = transformAndReparse(
    'function Foo({ __callerSource }) { return <View><Text>hi</Text></View>; }'
  );
  assert.equal(out.match(/__callerSource/g).filter((m) => m).length >= 1, true);
  assert.doesNotMatch(out, /const __callerSource = .*\.__callerSource/);
});

test('output is valid for every shape, repeatedly applied', () => {
  for (const source of Object.values(COMPONENT_SHAPES)) {
    const once = transformAndReparse(source);
    // Running the plugin again must not corrupt the output.
    babel.transformSync(once, {
      filename: FILE,
      cwd: CWD,
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: ['jsx', 'typescript'] },
      plugins: [[plugin.default || plugin, { cwd: CWD }]],
    });
  }
});
