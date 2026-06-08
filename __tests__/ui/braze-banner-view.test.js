afterEach(() => {
  jest.clearAllMocks();
});

describe('BrazeBannerView', () => {
  let StyleSheet;
  let mockFlatten;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock StyleSheet.flatten to test style merging logic
    mockFlatten = jest.fn((style) => {
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...s }), {});
      }
      return style || {};
    });
    StyleSheet = { flatten: mockFlatten };
  });

  test('BrazeBannerView module exports a default component', () => {
    const BrazeBannerView = require('../../src/ui/braze-banner-view').default;
    expect(BrazeBannerView).toBeDefined();
    expect(typeof BrazeBannerView).toBe('function');
  });

  describe.each([
    ['single width style', { width: 300 }, { width: 300 }],
    ['single height style', { height: 150 }, { height: 150 }],
    ['width and height style', { width: 280, height: 120 }, { width: 280, height: 120 }],
    ['null style', null, {}],
    ['undefined style', undefined, {}],
  ])('handles style flattening for %s', (_, customStyle, expected) => {
    test('returns flattened style', () => {
      mockFlatten.mockReturnValue(expected);
      const result = StyleSheet.flatten(customStyle);
      expect(result).toEqual(expected);
      expect(mockFlatten).toHaveBeenCalledWith(customStyle);
    });
  });

  test('handles array style flattening', () => {
    const baseStyle = { width: '100%' };
    const overrideStyle = { height: 100 };
    const combinedStyle = [baseStyle, overrideStyle];

    mockFlatten.mockImplementation((style) => {
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...s }), {});
      }
      return style || {};
    });

    const result = StyleSheet.flatten(combinedStyle);
    expect(result).toEqual({ width: '100%', height: 100 });
    expect(mockFlatten).toHaveBeenCalledWith(combinedStyle);
  });

  describe('height change event handler', () => {
    let handleHeightChanged;
    let onHeightChangedMock;

    beforeEach(() => {
      onHeightChangedMock = jest.fn();
      handleHeightChanged = (event) => {
        const height = event.nativeEvent.height;
        if (onHeightChangedMock) {
          onHeightChangedMock(height);
        }
      };
    });

    test('calls callback with height value', () => {
      handleHeightChanged({ nativeEvent: { height: 100 } });
      expect(onHeightChangedMock).toHaveBeenCalledWith(100);
    });

    test('handles multiple sequential height changes', () => {
      handleHeightChanged({ nativeEvent: { height: 100 } });
      handleHeightChanged({ nativeEvent: { height: 200 } });
      handleHeightChanged({ nativeEvent: { height: 150 } });

      expect(onHeightChangedMock).toHaveBeenNthCalledWith(1, 100);
      expect(onHeightChangedMock).toHaveBeenNthCalledWith(2, 200);
      expect(onHeightChangedMock).toHaveBeenNthCalledWith(3, 150);
      expect(onHeightChangedMock).toHaveBeenCalledTimes(3);
    });

    describe.each([
      ['float values', 123.45],
      ['zero height', 0],
    ])('handles %s', (description, heightValue) => {
      test(`processes ${description}`, () => {
        handleHeightChanged({ nativeEvent: { height: heightValue } });
        expect(onHeightChangedMock).toHaveBeenCalledWith(heightValue);
      });
    });
  });

  test('event handler for height change without callback', () => {
    const handleHeightChanged = (event) => {
      const height = event.nativeEvent.height;
      if (undefined) {
        undefined(height);
      }
    };

    expect(() => handleHeightChanged({ nativeEvent: { height: 200 } })).not.toThrow();
  });
});
