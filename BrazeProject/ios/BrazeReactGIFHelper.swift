import UIKit
import BrazeUI
import SDWebImage

// Braze In-App Message GIF Support
extension GIFViewProvider {
  
  /// A GIF view provider using [SDWebImage](https://github.com/SDWebImage/SDWebImage) as a
  /// rendering library.
  public static let sdWebImage = Self(
    view: { SDAnimatedImageView(image: image(for: $0)) },
    updateView: { ($0 as? SDAnimatedImageView)?.image = image(for: $1) }
  )
  
  private static func image(for url: URL?) -> UIImage? {
    guard let url else { return nil }
    return url.pathExtension == "gif"
      ? SDAnimatedImage(contentsOfFile: url.path)
      : UIImage(contentsOfFile: url.path)
  }
  
}
