const NativeBrazeReactModule = require('../src/specs/NativeBrazeReactModule').default;
const Braze = require('../src/index').default;
const { Banner } = jest.requireActual('../src/models/banner');

describe('Braze.getBanner and stableKey', () => {
  beforeEach(() => {
    NativeBrazeReactModule.getBanner.mockReset();
  });

  test('returns a real Banner instance including stableKey from native payload', async () => {
    NativeBrazeReactModule.getBanner.mockResolvedValue({
      trackingId: 'track-1',
      placementId: 'placement-1',
      stableKey: 'sk-from-native',
      isTestSend: true,
      isControl: false,
      expiresAt: 12345,
      html: '<p>hi</p>',
      properties: {},
    });

    const banner = await Braze.getBanner('placement-1');

    expect(NativeBrazeReactModule.getBanner).toHaveBeenCalledWith('placement-1');
    expect(banner).toBeInstanceOf(Banner);
    expect(banner.stableKey).toBe('sk-from-native');
    expect(banner.placementId).toBe('placement-1');
  });
});
