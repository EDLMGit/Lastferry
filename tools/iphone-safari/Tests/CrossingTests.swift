import XCTest
import UIKit

final class CrossingTests: XCTestCase {
    let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
    let address = URL(string: "http://127.0.0.1:4173/")!
    var web: XCUIElement { safari.webViews.firstMatch }
    var observations = [[String: Any]]()

    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
    }

    override func tearDownWithError() throws {
        attach(XCTAttachment(screenshot: XCUIScreen.main.screenshot()), "last-screen")
        attach(XCTAttachment(string: safari.debugDescription), "accessibility-tree")
        let json = try JSONSerialization.data(withJSONObject: observations, options: [.prettyPrinted, .sortedKeys])
        attach(XCTAttachment(data: json, uniformTypeIdentifier: "public.json"), "observations.json")
    }

    func attach(_ attachment: XCTAttachment, _ name: String) {
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    func button(_ name: String, prefix: Bool = false) -> XCUIElement {
        let test = prefix ? "label BEGINSWITH[c] %@" : "label ==[c] %@"
        return web.buttons.matching(NSPredicate(format: test, name)).firstMatch
    }

    func tap(_ name: String, prefix: Bool = false) {
        let target = button(name, prefix: prefix)
        XCTAssertTrue(target.waitForExistence(timeout: 12), "Missing button: " + name)
        XCTAssertTrue(target.isEnabled, "Disabled button: " + name)
        target.tap()
    }

    func screenshot(_ name: String) {
        attach(XCTAttachment(screenshot: XCUIScreen.main.screenshot()), name)
    }

    // Measure pixels after OS composition, including the actual WebGL layer.
    // Exclude the browser chrome and the game's persistent top and bottom controls.
    func measureScene(_ name: String, landscape: Bool) {
        let screen = XCUIScreen.main.screenshot()
        attach(XCTAttachment(screenshot: screen), name)
        let image = screen.image
        XCTAssertEqual(image.size.width > image.size.height, landscape)
        let rect = CGRect(x: image.size.width * 0.18, y: image.size.height * 0.38,
                          width: image.size.width * 0.64, height: image.size.height * 0.23)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let side = 96
        let sample = UIGraphicsImageRenderer(size: CGSize(width: CGFloat(side), height: CGFloat(side)), format: format).image { _ in
            image.draw(in: CGRect(x: -rect.minX * CGFloat(side) / rect.width,
                                  y: -rect.minY * CGFloat(side) / rect.height,
                                  width: image.size.width * CGFloat(side) / rect.width,
                                  height: image.size.height * CGFloat(side) / rect.height))
        }
        var pixels = [UInt8](repeating: 0, count: side * side * 4)
        pixels.withUnsafeMutableBytes { memory in
            let context = CGContext(data: memory.baseAddress, width: side, height: side, bitsPerComponent: 8,
                                    bytesPerRow: side * 4, space: CGColorSpaceCreateDeviceRGB(),
                                    bitmapInfo: CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.noneSkipLast.rawValue)!
            context.draw(sample.cgImage!, in: CGRect(x: 0, y: 0, width: CGFloat(side), height: CGFloat(side)))
        }
        var colors = [Int: Int]()
        for i in stride(from: 0, to: pixels.count, by: 4) {
            let rgb = Int(pixels[i]) << 16 | Int(pixels[i + 1]) << 8 | Int(pixels[i + 2])
            colors[rgb, default: 0] += 1
        }
        let fraction = Double(colors.values.max() ?? 0) / Double(side * side)
        observations.append(["frame": name, "widthPoints": image.size.width, "heightPoints": image.size.height,
                             "sampledColors": colors.count, "dominantFraction": fraction])
        print("SCENE", name, image.size, "colors", colors.count, "dominant", fraction)
    }

    func turn(_ n: Int) {
        let name = String(n) + (n == 1 ? " action taken" : " actions taken")
        XCTAssertTrue(button(name, prefix: true).waitForExistence(timeout: 16), "Turn " + String(n))
        observations.append(["turn": n])
    }

    func sail(_ name: String, turn number: Int) {
        // The crossing details expose every stop even when a map label overlaps the HUD.
        tap("Bring everyone to ", prefix: true)
        if name == "Harbor" {
            tap("Find Harbor")
        } else {
            if !button(name).exists {
                let summary = web.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Inspect a place")).firstMatch
                XCTAssertTrue(summary.waitForExistence(timeout: 6))
                summary.tap()
            }
            tap(name)
        }
        tap("Sail to " + name, prefix: true)
        turn(number)
    }

    func testRealSafariCrossing() {
        safari.open(address)
        if !button("Play").waitForExistence(timeout: 6) {
            for name in ["Continue", "Start Browsing", "Done"] {
                let intro = safari.buttons[name].firstMatch
                if intro.exists && intro.isHittable { intro.tap() }
            }
            safari.open(address)
        }
        XCTAssertTrue(button("Play").waitForExistence(timeout: 35), "MobileSafari must render the production Home")
        screenshot("01-home")
        if button("Enable sound").exists { tap("Enable sound") }
        if button("Retry sound").exists { tap("Retry sound") }
        let soundRunning = button("Mute sound").waitForExistence(timeout: 6)
        observations.append(["audioContextRunningAfterTap": soundRunning])
        tap("Play")
        // The opening holds its final handoff until the player taps it.
        XCTAssertTrue(button("Take the helm").waitForExistence(timeout: 35))
        tap("Take the helm")
        turn(0)
        measureScene("02-holding-portrait", landscape: false)
        XCUIDevice.shared.orientation = .landscapeLeft
        Thread.sleep(forTimeInterval: 2)
        turn(0)
        measureScene("03-holding-landscape", landscape: true)
        XCUIDevice.shared.orientation = .portrait
        Thread.sleep(forTimeInterval: 2)
        turn(0)
        measureScene("04-holding-returned-portrait", landscape: false)

        tap("Let Moss ashore")
        turn(1)
        sail("Shallows", turn: 2)
        sail("Rabbit Pier", turn: 3)
        tap("Board")
        tap("Board Pip and Rue", prefix: true)
        turn(4)
        sail("Shallows", turn: 5)
        sail("Stone Pier", turn: 6)
        tap("Board Moss", prefix: true)
        turn(7)
        sail("Harbor", turn: 8)
        tap("Bring home")
        let delivery = web.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Bring ' AND label CONTAINS '1 action'")).firstMatch
        XCTAssertTrue(delivery.waitForExistence(timeout: 8))
        delivery.tap()
        let onward = button("Continue to Bellwater")
        XCTAssertTrue(onward.waitForExistence(timeout: 18))
        XCTAssertTrue(web.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", "Rue’s Lantern")).firstMatch.exists)
        screenshot("05-rues-lantern")
        observations.append(["turn": 9, "reward": "Rue’s Lantern"])
        tap("Continue to Bellwater")
        tap("Continue to Bellwater")
        turn(0)

        safari.terminate()
        safari.open(URL(string: "?return=1", relativeTo: address)!.absoluteURL)
        tap("Continue")
        turn(0)
        XCTAssertTrue(button("Select Bell ", prefix: true).exists ||
                      web.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS[c] 'Bellwater'")).firstMatch.exists,
                      "Cold Safari should resume Bellwater Cove")
        screenshot("06-restored-bellwater")
        observations.append(["restored": "Bellwater Cove"])
        for frame in observations where frame["sampledColors"] != nil {
            XCTAssertGreaterThan(frame["sampledColors"] as! Int, 80, String(describing: frame))
            XCTAssertLessThan(frame["dominantFraction"] as! Double, 0.75, String(describing: frame))
        }
        XCTAssertTrue(soundRunning, "The sound control should report a running AudioContext after a trusted touch")
    }
}
