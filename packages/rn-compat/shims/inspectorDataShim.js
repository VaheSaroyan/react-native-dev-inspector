/**
 * Adaptation shim for getInspectorDataForViewAtPoint (works on both Fabric and Paper).
 *
 * Adaptation point 2: the inspector hierarchy on RN 0.8x/0.86 Fabric has two problems:
 * 1. Hierarchy items carry only {props, measure} and no fiber, and _debugSource was
 *    removed in React 19, so the library has to rely on the babel-injected
 *    __callerSource — without the fiber there is no source info at all;
 * 2. The owner chain RN provides may skip levels (intermediate composite components
 *    are omitted by RN's implementation), so the panel breadcrumb jumps from Text
 *    straight to an ancestor, missing intermediate levels.
 *
 * Adaptation point 3 (Paper, RN <= 0.72): RN Paper's createHierarchy only provides
 * the props of the "nearest host descendant" (getHostProps) for each owner-chain
 * fiber, never the fiber itself. Wrapper components such as RN's Button/Touchable
 * that do not forward props have the babel-injected __callerSource on their
 * composite fiber, but their inner host elements (rendered from node_modules) do
 * not — so the nearest item with codeInfo on the tapped chain jumps straight to the
 * business screen component. Fix: use the container view's
 * _internalFiberInstanceHandleDEV (fiber) plus viewData.touchedViewTag (native tag)
 * to find the tapped host fiber, then rebuild the hierarchy along the owner chain
 * (composite components included), with each item reading fiber.memoizedProps
 * directly, so __callerSource on <Button> becomes visible.
 *
 * Implementation (both architectures share one rebuild path):
 *   - Fabric: start from viewData.closestInstance (the real fiber); pickSourceFiber
 *     finds the target fiber carrying __callerSource;
 *   - Paper: walk up from inspectedView._internalFiberInstanceHandleDEV to the root,
 *     find the host fiber whose stateNode._nativeTag === touchedViewTag, then walk
 *     up .return for the nearest fiber carrying __callerSource (subtree DFS fallback);
 *   - then collect the full composite chain via _debugOwner and rebuild the
 *     hierarchy (host components included);
 *   - each item's getInspectorData returns {props: fiber.memoizedProps, measure,
 *     fiber}, with measure taken from the first host node (stateNode) in that
 *     fiber's subtree.
 */
const mod = require('__rn_dev_inspector_original_impl__');
const original = mod.default || mod;

function nameOfFiber(fiber) {
  try {
    const t = fiber.type;
    if (typeof t === 'string') return t;
    if (typeof t === 'function') return t.displayName || t.name || null;
    if (t && typeof t === 'object') {
      return t.displayName || (t.render && (t.render.displayName || t.render.name)) || null;
    }
  } catch (e) {}
  return null;
}

function pickSourceFiber(fiber) {
  try {
    if (fiber && fiber.memoizedProps && fiber.memoizedProps.__callerSource) {
      return fiber;
    }
    let found = null;
    let visited = 0;
    (function dfs(node, depth) {
      if (found || !node || depth > 12 || visited > 300) return;
      if (node !== fiber) {
        visited++;
        const p = node.memoizedProps;
        if (p && p.__callerSource) {
          found = node;
          return;
        }
      }
      dfs(node.child, depth + 1);
      if (!found) dfs(node.sibling, depth + 1);
    })(fiber.child, 1);
    return found || fiber;
  } catch (e) {
    return fiber;
  }
}

// Paper: on the parent chain (.return) of the tapped host fiber, find the
// nearest fiber carrying __callerSource. Wrapper component elements written in
// business JSX, like <Button>, get __callerSource injected by babel, which
// lands on the wrapper's composite fiber memoizedProps, while its inner host
// elements (rendered from node_modules) have none — so the first hop up from
// the host hits it.
function pickSourceUpChain(fiber) {
  try {
    let f = fiber;
    let n = 0;
    while (f && typeof f.tag === 'number' && n < 40) {
      if (parseCallerSourceRaw(f.memoizedProps)) return f;
      f = f.return;
      n++;
    }
  } catch (e) {}
  return null;
}

// Paper: find the tapped host fiber in the subtree of the container fiber
// (walked up to the root). On Paper a host fiber's stateNode is a
// ReactNativeFiberHostComponent whose _nativeTag is the native view tag,
// matching viewData.touchedViewTag.
function findTouchedHostFiber(containerFiber, nativeTag) {
  try {
    // Walk up to the root, covering nodes rendered outside the container's
    // subtree (Modal/Portal and friends)
    let root = containerFiber;
    let up = 0;
    while (root && root.return && up < 200) {
      root = root.return;
      up++;
    }
    let found = null;
    let visited = 0;
    (function dfs(node) {
      if (found || !node || visited > 5000) return;
      visited++;
      if (node.tag === 5 && node.stateNode) {
        const sn = node.stateNode;
        const tag =
          sn._nativeTag != null ? sn._nativeTag : typeof sn.getTag === 'function' ? sn.getTag() : null;
        if (tag === nativeTag) {
          found = node;
          return;
        }
      }
      dfs(node.child);
      if (!found) dfs(node.sibling);
    })(root);
    return found;
  } catch (e) {
    return null;
  }
}

// First host node (tag 5 = HostComponent) within this fiber's subtree.
// A host fiber's stateNode carries measure(cb) itself (Fabric wraps it on the
// ShadowNode side, Paper uses ReactNativeFiberHostComponent — both go through
// UIManager.measure), so require('react-native') is not needed here (the shim
// lives outside the project directory and Metro would fail to resolve it).
function findHostStateNode(fiber) {
  try {
    let found = null;
    let visited = 0;
    (function dfs(node) {
      if (found || !node || visited > 300) return;
      visited++;
      if (node.tag === 5 && node.stateNode) {
        found = node.stateNode;
        return;
      }
      dfs(node.child);
      if (!found) dfs(node.sibling);
    })(fiber);
    return found;
  } catch (e) {
    return null;
  }
}

function measureFor(stateNode) {
  return function measure(callback) {
    if (!stateNode || typeof stateNode.measure !== 'function') return;
    try {
      stateNode.measure((x, y, width, height, pageX, pageY) => {
        callback(x, y, width, height, pageX, pageY);
      });
    } catch (e) {
      // Node may already be unmounted; ignore
    }
  };
}

// Composite components named like RN native components (e.g. a business
// ui/Text wrapper) must be renamed, otherwise core's isUserComponentName
// filters them out as native and the hierarchy loses a level
const NATIVE_NAMES = new Set([
  'View',
  'Text',
  'TouchableOpacity',
  'ScrollView',
  'Image',
  'TextInput',
  'Animated',
]);

// __callerSource may be an object {fileName,lineNumber,columnNumber} or a JSON string
function parseCallerSourceRaw(props) {
  try {
    const cs = props && props.__callerSource;
    if (!cs) return null;
    return typeof cs === 'string' ? JSON.parse(cs) : cs;
  } catch (e) {
    return null;
  }
}

function baseNameToComponentName(fileName) {
  if (!fileName) return null;
  const base = String(fileName).replace(/\\/g, '/').split('/').pop() || '';
  let stem = base.replace(/\.(tsx?|jsx?)$/, '');
  if (stem === 'index') {
    // index.tsx: use the parent directory name
    const dir = String(fileName).replace(/\\/g, '/').split('/');
    stem = dir[dir.length - 2] || stem;
  }
  if (!stem) return null;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

// Anonymous composite components (typically React.forwardRef((props)=>...)
// with no function name, common in business code): derive the component name
// from the file name of the first child carrying __callerSource inside its
// render, e.g. <AnimatedBaseButton> at button.tsx:161 -> "Button"
function deriveAnonymousName(fiber) {
  try {
    let found = null;
    let visited = 0;
    (function dfs(node) {
      if (found || !node || visited > 60) return;
      visited++;
      const parsed = parseCallerSourceRaw(node.memoizedProps);
      if (parsed && parsed.fileName) {
        found = parsed.fileName;
        return;
      }
      dfs(node.child);
      if (!found) dfs(node.sibling);
    })(fiber.child, 1);
    return found ? baseNameToComponentName(found) : null;
  } catch (e) {
    return null;
  }
}

function displayNameForFiber(fiber, name) {
  const t = fiber.type;
  const isComposite = typeof t === 'function' || (t && typeof t === 'object');
  if (isComposite && NATIVE_NAMES.has(name)) {
    return `${name} (custom)`;
  }
  return name;
}

// ---- Source filtering (breadcrumb shows only business-source levels) ----
// The babel plugin does not inject __callerSource into node_modules, so "the
// fiber's own props carry __callerSource" implies the element was written in
// business-source JSX. Wrapper components instantiated inside third-party
// libraries (e.g. ViewHolderCollection / ViewHolderInternal) lack the marker
// and are hidden from the breadcrumb; the deepest tapped element is always
// kept, so picking itself is unaffected.
const PROJECT_SOURCE_ONLY = true;

function isProjectSourceFiber(fiber) {
  const parsed = parseCallerSourceRaw(fiber.memoizedProps);
  if (!parsed || !parsed.fileName) return false;
  return !String(parsed.fileName).includes('node_modules');
}

// Library/wrapper component names (mirrors BUSINESS_SKIP_NAMES from
// patch-core.js patch 7). Some wrappers still get instantiated in business
// JSX (e.g. nativewind's styled(Pressable), written on a button.tsx render
// line, so the fiber carries __callerSource) and a path check would mistake
// them for business source — filter them out by name as a fallback;
// 'Xxx (custom)' is a business marker and is never filtered.
// Note the prefix is "AnimatedComponent", not "Animated" — business
// components may legitimately be named AnimatedXxx.
const LIB_WRAPPER_NAMES = new Set([
  'Pressable', 'TouchableHighlight', 'TouchableNativeFeedback',
  'TouchableWithoutFeedback', 'FlatList', 'SectionList',
  'KeyboardAvoidingView', 'Switch', 'StatusBar', 'MaskedView',
  'RefreshControl', 'ActivityIndicator', 'ProgressBar',
  'GestureHandlerButton',
]);

function isLibraryWrapperName(name) {
  if (!name) return false;
  if (name.endsWith(' (custom)')) return false;
  if (name.includes('(')) return true; // wrapper levels like AnimatedComponent(Pressable)
  if (name.startsWith('AnimatedComponent')) return true;
  return LIB_WRAPPER_NAMES.has(name);
}

// Collect the full owner chain up from the source fiber via _debugOwner and
// rebuild the hierarchy (shared by Fabric and Paper; on Paper the composite
// fibers of wrappers like Button join the chain so core can read the
// __callerSource on their memoizedProps)
function rebuildHierarchyFromSource(sourceFiber) {
  const chain = [];
  let f = sourceFiber;
  while (f && typeof f.tag === 'number' && chain.length < 40) {
    chain.push(f);
    f = f._debugOwner;
  }
  chain.reverse(); // [0] = closest to root, last = deepest (the tapped element)
  return chain
    .map((fiber, idx) => {
      let raw = nameOfFiber(fiber);
      const t = fiber.type;
      const isComposite = typeof t === 'function' || (t && typeof t === 'object');
      if (!raw && isComposite) {
        raw = deriveAnonymousName(fiber);
      }
      if (!raw) return null;
      // Hide intermediate levels that are not business source or are library
      // wrappers (last item = tapped element, always kept)
      if (
        PROJECT_SOURCE_ONLY &&
        idx < chain.length - 1 &&
        (!isProjectSourceFiber(fiber) || isLibraryWrapperName(raw))
      ) {
        return null;
      }
      // nativewind's CssInterop wrapper is pure forwarding, and its
      // __callerSource points inside the wrapper implementation (e.g. a
      // ui/Text/index.tsx render line) — meaningless to users, skip it
      if (raw.startsWith('CssInterop')) return null;
      return {
        name: displayNameForFiber(fiber, raw),
        getInspectorData: () => ({
          props: fiber.memoizedProps,
          measure: measureFor(findHostStateNode(fiber)),
          fiber,
        }),
      };
    })
    .filter(Boolean);
}

function getInspectorDataForViewAtPoint(inspectedView, locationX, locationY, callback) {
  original(inspectedView, locationX, locationY, viewData => {
    try {
      if (viewData && viewData.closestInstance && typeof viewData.closestInstance.tag === 'number') {
        // Fabric (RN 0.73+): closestInstance is the real fiber
        const sourceFiber = pickSourceFiber(viewData.closestInstance);
        viewData.hierarchy = rebuildHierarchyFromSource(sourceFiber);
      } else if (
        viewData &&
        typeof viewData.touchedViewTag === 'number' &&
        inspectedView &&
        inspectedView._internalFiberInstanceHandleDEV &&
        typeof inspectedView._internalFiberInstanceHandleDEV.tag === 'number'
      ) {
        // Paper (RN <= 0.72): RN provides only host-descendant props, not the
        // fiber. Look the host fiber up via touchedViewTag, then walk the
        // parent chain for the nearest business element fiber
        const touched = findTouchedHostFiber(
          inspectedView._internalFiberInstanceHandleDEV,
          viewData.touchedViewTag
        );
        if (touched) {
          const sourceFiber = pickSourceUpChain(touched) || pickSourceFiber(touched);
          viewData.hierarchy = rebuildHierarchyFromSource(sourceFiber);
        }
      }
      if (__DEV__) {
        try {
          console.log(
            '[rn-inspector-adapter] chain:',
            (viewData && viewData.hierarchy ? viewData.hierarchy : []).map(h => h.name).join(' > ')
          );
        } catch (e) {}
      }
    } catch (e) {
      if (__DEV__) console.log('[rn-inspector-adapter] augment error', e && e.message);
    }
    callback(viewData);
  });
}

module.exports = getInspectorDataForViewAtPoint;
module.exports.default = getInspectorDataForViewAtPoint;
