# Last Ferry · director review and private playtest

**Ready for private Practice play.** Rabbits-first is the seven-action route across Ribbon Cut. Taking Mallow and Osier first sends the loaded boat around the buoy and costs one extra action. After everyone boards, the player has time to steer toward the lighthouse, pause at the buoy and choose Bring home at the dock.

The independent production proof reproduced the submitted output byte for byte. Every one of the 1,057 reachable equivalent configurations has a path to rescue, across 5,072 legal transitions. The short-landscape opening shows all four passengers and the Harbor marker, although the ferry sign covers the tower itself. The homeward approach and both docked frames bring the passengers and the lit tower together. The phone captures are Chromium emulation. [Play review, proof and limits](independent/PLAY_REVIEW.md)

## Release checks

The reviewed runtime is `a5e1eff68ee93eb2d4cf9814863a3b104fc6a889`. TypeScript and the production build passed. The rebuilt JavaScript and CSS match the submitted release. We verified 569 non-review source blobs against GitHub and retained the existing hostname allowance for the hosting preview. All 762 unit checks in 65 files passed in two independent runs, including the six catalog tests. The asset validator passed all 83 families.

The standalone HTML opens Home. Choose Practice → Last Ferry. It reproduced the submitted hash and size of 1,625,910 bytes with the game, stylesheet and ten PNGs embedded. The contributor’s offline browser test reached the passenger chooser with both portraits and zero HTTP requests or page errors. The complete seven- and eight-action phone runs used the served game. Local browser startup was restricted during the independent offline review. [Offline audit](independent/OFFLINE_REVIEW.md)

## Remaining campaign work

Journey currently has eight connected coves. [Journey Home](../../NEXT_TASK_JOURNEY_HOME.md) commissions a private build through all twelve rescues, the final supper and credits, with deliberate continuation for older saves. The four late coves are unscored while player feedback informs their targets. Physical Android, phone speaker and spoken screen-reader checks, the friend’s first-control retest and a complete beginning-to-credits playthrough remain to be done. The campaign ending belongs to every player who completes the rescues.

[Play the final crossing](https://last-ferry-playtest.abumech.chatgpt.site/?cove=last-ferry) · [Version 28 receipt](deployment-confirmation.json)
