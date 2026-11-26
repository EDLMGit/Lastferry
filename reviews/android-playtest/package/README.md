# Android package verification

The machine-readable [archive receipt](verified.json) identifies the APKs, the unsigned test bundle, the Android application identity and the independent web build. Each artifact contains all the files in the release website, including the two portrait families. Game audio is synthesized by the JavaScript bundle. Its code travels with the APK.

The audit opens and CRC-checks each ZIP, compares each web asset’s bytes with the separate Vite output, and compares the Android dex across both APKs and the test bundle. It reads the packaged manifests with Android’s own tools, verifies the two APK signatures and their common certificate, and checks ZIP alignment. The AAB’s compiled manifest declares its SDK levels and permissions. Its unsigned status is checked explicitly. The project’s local bundletool validation and APK generation are recorded in the main review.

The [offline browser smoke](browser-smoke.json) opened the APK’s own HTML and script in touch-emulated desktop Chromium. Every fulfilled request came from bundled bytes. The player chose each of the thirteen Practice entries through Home, and the nine numeric targets matched the package’s Practice help. Twelve separately prepared, previously earned chapter checkpoints exercised the Home Continue path for each Journey cove. The installed Android playthrough and update are recorded separately.

Run the following command from a clean checkout of the tested source, using Python 3, JDK 17, Android Build Tools 36.0.0 and bundletool. Supply the actual artifact and tool paths.

```sh
python reviews/android-playtest/package/verify.py --commit HEAD --apk1 last-ferry-v1.apk --apk2 last-ferry-v2.apk --bundle last-ferry-v2.aab --dist dist --build-tools /path/to/sdk/build-tools/36.0.0 --jdk /path/to/jdk-17 --bundletool /path/to/bundletool.jar --out package-receipt.json
```

The first audit script expected the old `sdkVersion` line from aapt. Build Tools 36 aapt2 reports `minSdkVersion`. An early assertion also assumed the debug AAB carried a JAR signature. Inspection with jarsigner and the archive directory showed that the Gradle test bundle is unsigned. The final receipt records the actual state of each artifact.
