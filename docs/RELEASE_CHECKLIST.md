# v2.0 Marketplace Release Checklist

## Automated gates
- [ ] GitHub Actions **typecheck** job passes for the v2.0 commit.
- [ ] GitHub Actions **powershell-parse** passes on Windows PowerShell 5.1.
- [ ] `npm run package` creates `masum-galaxy-terminal-x-2.0.0.vsix`.
- [ ] `npm run verify:vsix` confirms compiled JS, prompt script, icon, README, changelog, license, theme assets and Showcase PNG are inside the VSIX.
- [ ] Check README hero image on GitHub and the VS Code extension details pane (no broken images or unsupported SVG).

## Human smoke tests required before publishing
- [ ] Install the v2.0 VSIX in a clean VS Code profile.
- [ ] Open the dashboard from Command Palette and verify all four themes.
- [ ] Create Galaxy PowerShell Classic and Compact terminals; run `pwd`, `git status`, and a failing command.
- [ ] Confirm Git branch/time toggles and prompt arrows (glyph rendering depends on font).
- [ ] Stage saved and recent commands; verify they do NOT run until Enter.
- [ ] Pin/unpin favorites and clear recent history.
- [ ] Apply Blue Circuit palette to a test workspace and restore previous colors.
- [ ] Confirm dashboard image (Original Photo) is included and appears; the native terminal intentionally has no wallpaper.
- [ ] Verify installation and startup on another supported VS Code version where feasible.

## Publishing (requires publisher access)
- [ ] Verify publisher `gitwithmasum` owns the extension name and icon is valid PNG.
- [ ] Review Marketplace display name, permissions, README, theme category and logo.
- [ ] Publish only after human smoke tests; either upload the validated VSIX in the Marketplace publisher management UI or run `npx vsce publish --packagePath masum-galaxy-terminal-x-2.0.0.vsix` using an authorized publisher token.
- [ ] Confirm live Marketplace item/version 2.0.0, screenshot, install count and install link; no success should be claimed before verification.

## Note
Passing CI is not equivalent to installed-extension GUI verification or a Marketplace publication. An extension ID is only live when confirmed by the Marketplace.
