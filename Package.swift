// swift-tools-version: 6.2
import PackageDescription
import Foundation

// Target topology mirrors the rest of the native app family (see ARCHITECTURE.md):
//   • OpenFocusCore / OpenFocusCLIKit / OpenFocusCoreTests are SwiftData-free and build +
//     unit-test on a Command Line Tools–only host. This is the fast local TDD loop.
//   • OpenFocusData / the `openfocus` CLI pull in SwiftData (@Model macros), which require a
//     full Xcode toolchain (the SwiftData macro plugin ships with Xcode, not CLT).
//     Set OPENFOCUS_SKIP_SWIFTDATA=1 to drop them so bare `swift test` stays green on a
//     CLT-only host.
//
// The SwiftUI GUI (Sources/{App,Features,SharedUI,Platform}) is NOT a SwiftPM
// target: the xcodegen app targets in project.yml compile those sources directly
// and link OpenFocusCore + OpenFocusData as products.
let includeSwiftData = ProcessInfo.processInfo.environment["OPENFOCUS_SKIP_SWIFTDATA"] == nil

var products: [Product] = [
    .library(name: "OpenFocusCore", targets: ["OpenFocusCore"]),
]

var targets: [Target] = [
    // Pure engine — value-type models, AI client seam + live client, natural-language
    // date parsing, config. NO SwiftData. CLT-buildable.
    .target(
        name: "OpenFocusCore",
        dependencies: [
            .product(name: "KeychainAccess", package: "KeychainAccess"),
        ],
        path: "Sources/Core"
    ),
    // CLI command parser + help. Pure, no persistence. CLT-buildable.
    .target(
        name: "OpenFocusCLIKit",
        dependencies: ["OpenFocusCore"],
        path: "Sources/CLIKit"
    ),
    // Unit tests for the pure engine + CLI parser. swift-testing, CLT-safe.
    .testTarget(
        name: "OpenFocusCoreTests",
        dependencies: ["OpenFocusCore", "OpenFocusCLIKit"],
        path: "Tests/UnitTests"
    ),
]

if includeSwiftData {
    products += [
        .library(name: "OpenFocusData", targets: ["OpenFocusData"]),
        .executable(name: "openfocus", targets: ["OpenFocusCLI"]),
    ]
    targets += [
        // Persistence + stateful services — SwiftData @Model types and the
        // ModelContext-bound services (Task/Project/AI). Xcode/CI only.
        .target(name: "OpenFocusData", dependencies: ["OpenFocusCore"], path: "Sources/Data"),
        // `openfocus` executable — @main entry + command executor (touches OpenFocusData).
        .executableTarget(name: "OpenFocusCLI", dependencies: ["OpenFocusCLIKit", "OpenFocusData"], path: "Sources/CLI"),
        // Persistence + service tests for the SwiftData-backed engine.
        .testTarget(name: "OpenFocusDataTests", dependencies: ["OpenFocusData", "OpenFocusCore"], path: "Tests/DataTests"),
    ]
}

let package = Package(
    name: "OpenFocus",
    platforms: [
        .macOS(.v26),
        .iOS(.v26),
    ],
    products: products,
    dependencies: [
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.2"),
    ],
    targets: targets,
    // Sources stay Swift-5 mode; tools require 6.2 for the `.macOS(.v26)` / `.iOS(.v26)`
    // platform cases (the app adopts Liquid Glass, which is macOS 26 / iOS 26 only).
    swiftLanguageModes: [.v5]
)
