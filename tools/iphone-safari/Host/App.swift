import SwiftUI

// Xcode needs a host target for the UI test. The test itself drives MobileSafari.
@main struct ProbeHost: App {
    var body: some Scene { WindowGroup { Text("Safari crossing test host") } }
}
