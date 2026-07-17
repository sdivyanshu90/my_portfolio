# Animation validation

## Automated checks

Run from the repository root:

```bash
npx tsc --noEmit
npm run build
git diff --check
```

## Normal-motion walkthrough

1. Start the site with `npm run dev` and open the local URL in a desktop browser.
2. Switch to **Founder** mode and run **What is he doing at Uniiq?**
   - The trace steps should arrive with a small signal moving between them.
   - Result rules should draw downward as the Uniiq case study appears.
   - `40+`, `73 → 93`, `1,199`, and `21` should animate to their final values.
   - The performance comparison should include a short accent bar expansion.
   - Sources should stamp into the footer individually when the run finishes.
3. Scroll the answer card.
   - A thin progress ruler should appear on its right edge only when the card is scrollable.
   - It should begin at the top, track scrolling, and reach the bottom without changing layout.
4. If the response has multiple artifact tabs, open **Experience**.
   - The timeline should draw from top to bottom.
   - Each release marker should activate as its entry appears.
5. Switch to **Engineer** mode and run **What has he built from scratch?**
   - Change between several layer filters and **All**.
   - Removed rows should fade out, remaining rows should move smoothly, and new rows should fade in.
   - Repository links and table alignment must remain usable throughout the transition.
6. After any completed run, select **share**.
   - The label should morph briefly to `✓ link copied` and return to `share ↗`.
   - Paste the clipboard value and confirm that it contains the question and selected mode.
7. Run **How do I contact him?**, then select **copy** in the citation card.
   - The label should morph to `✓ copied` and the clipboard should contain the BibTeX citation.
8. Toggle light and dark themes during and after a run.
   - The existing theme flood and constellation animations should remain intact.
   - New progress lines, metric bars, timeline marks, and source stamps should use theme tokens.

## Reduced-motion walkthrough

1. Enable **Emulate CSS media feature `prefers-reduced-motion: reduce`** in browser developer tools, or enable reduced motion in the operating system.
2. Reload the page and repeat the Uniiq, Experience, index-filter, share, and citation checks above.
3. Confirm that content and state changes remain functional but appear immediately: no number rolling, line drawing, row movement, signal travel, stamping, or confirmation morphing.
4. Confirm that the constellation remains in its existing reduced-motion static state.

## Responsive and performance checks

1. Repeat the Uniiq and index walkthroughs around 375 px, 768 px, and 1440 px viewport widths.
2. Confirm that the trace wraps cleanly, source stamps wrap without overflow, and the progress ruler stays attached to the answer card.
3. In the browser Performance panel, record an index-filter change and a long-card scroll.
4. Confirm there are no unexpected layout shifts or long tasks; the new effects should primarily animate transforms and opacity.
