# Cove readability · director review and private playtest

**Ready for an uncoached retest.** At Holding Pier the ferry sign now names Moss, Harbor and the rescue goal, and separates the hull’s required depth from the water below. The tide sign names Pip and Rue and the number of actions until Rabbit Pier floods. In portrait the rabbits begin offscreen. A free Find landing control brings them into view. In short landscape they share the frame with the ferry and lighthouse. The open question for the friend is whether someone seeing these signs for the first time notices they can be inspected. [Observer sheet](PLAYTEST.md)

At Far Shore, refilling an already-arrived ferry tests a different reading. The exact same turn-seven berth has depth 3 in both runs. With Thistle, boarding Rowan needs 4 and is blocked. With Button it needs 3 and is allowed. Both previews now place the projected hull reading beside the available water. The short-landscape action-four chooser in Holding Pier also shows the selected group, the flood after boarding and the commit button together. [Native frame review and limits](independent/PHONE_REVIEW.md)

## Independent verification

- TypeScript and the production build passed for `29ed5dfb32f976b5de97ddfab0b701b3b3df0989`. The fresh JS and CSS digests match the release capture. The hosting checkout has 565 exact non-review Git blobs and its existing local preview hostname in vite.config.ts.
- All **743 unit checks** passed across 64 files. This includes 737 tests in the prepared checkout and the six catalog tests in a separate verified checkout. The asset validator passed all 83 families, with the original source and evidence files available.
- The portable HTML reproduced the handoff’s 1,620,712 bytes and SHA-256. It embeds the production game, stylesheet and all ten passenger PNGs. The contributor’s offline Chromium run verified Home, the opening, sailing and the boarding chooser with both portraits, zero HTTP requests and zero page errors. An independent local browser run was blocked at startup. The file and its assets were independently verified. [Offline audit and reproduction](independent/OFFLINE_REVIEW.md)
- The contributor’s separate served phone runs completed Holding and Far Shore in both orientations. The 32.009-second recording shows the Holding rescue and has a maximum frame gap of 0.733 seconds. Phone evidence used Chromium touch emulation. Human comprehension, on-device frame rate, spoken screen-reader use and fresh listening remain open.

[Version 27 publication](deployment-confirmation.json) · [Private playtest from Home](https://last-ferry-playtest.abumech.chatgpt.site/)
