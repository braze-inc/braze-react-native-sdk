/**
 * Paper-architecture path: minimal react-native shim + mock native view;
 * assert onDismiss / onHeightChanged forwarding.
 */
const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const mockLastNativeProps = { current: null };

function mockFlattenStyle (style) {
  if (style == null) {
    return {};
  }
  if (Array.isArray(style)) {
    return style.reduce((acc, item) => Object.assign(acc, mockFlattenStyle(item)), {});
  }
  return { ...style };
}

jest.mock('react-native', () => ({
  __esModule: true,
  StyleSheet: {
    flatten: mockFlattenStyle,
  },
  requireNativeComponent: jest.fn(() => function MockBrazeBannerView (props) {
    mockLastNativeProps.current = props;
    return null;
  }),
}));

delete global.nativeFabricUIManager;

const BannerView = require('../../src/ui/braze-banner-view').default;

describe('BrazeBannerView (Paper path)', () => {
  let renderer;

  beforeEach(() => {
    mockLastNativeProps.current = null;
    delete global.nativeFabricUIManager;
  });

  afterEach(() => {
    if (renderer) {
      renderer.unmount();
      renderer = null;
    }
  });

  test('forwards onDismiss to native view and passes nativeEvent to callback', () => {
    const onDismiss = jest.fn();
    renderer = TestRenderer.create(
      React.createElement(BannerView, {
        placementId: 'placement-a',
        onDismiss,
      }),
    );

    expect(mockLastNativeProps.current).toBeTruthy();
    expect(typeof mockLastNativeProps.current.onBannerDismiss).toBe('function');

    const payload = { placementId: 'placement-a', stableKey: 'sk-1', trackingId: 'track-1' };
    act(() => {
      mockLastNativeProps.current.onBannerDismiss({ nativeEvent: payload });
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(payload);
  });

  test('forwards onHeightChanged and passes numeric height to callback', () => {
    const onHeightChanged = jest.fn();
    renderer = TestRenderer.create(
      React.createElement(BannerView, {
        placementId: 'placement-b',
        onHeightChanged,
      }),
    );

    expect(typeof mockLastNativeProps.current.onHeightChanged).toBe('function');
    act(() => {
      mockLastNativeProps.current.onHeightChanged({ nativeEvent: { height: 120.5 } });
    });

    expect(onHeightChanged).toHaveBeenCalledWith(120.5);
  });

  test('does not throw when onDismiss is omitted', () => {
    expect(() => {
      renderer = TestRenderer.create(
        React.createElement(BannerView, { placementId: 'placement-c' }),
      );
    }).not.toThrow();
    expect(typeof mockLastNativeProps.current.onBannerDismiss).toBe('function');
    expect(() => {
      act(() => {
        mockLastNativeProps.current.onBannerDismiss({
          nativeEvent: { placementId: 'placement-c', stableKey: '', trackingId: '' },
        });
      });
    }).not.toThrow();
  });
});
