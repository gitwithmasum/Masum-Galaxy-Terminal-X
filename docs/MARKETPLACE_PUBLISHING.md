# GitHub Actions to VS Code Marketplace — OIDC Trusted Publishing

The workflow at `.github/workflows/publish-marketplace.yml` publishes a validated VSIX on **version tag pushes only**. It does not publish when the regular `main` branch is updated.

## 1. Configure the Marketplace publishing trust

1. Open [Marketplace publisher management](https://marketplace.visualstudio.com/manage/publishers/gitwithmasum) while signed into the authorized publisher account.
2. In the publisher's **Trusted Publishing** settings, register a GitHub Actions policy for:
   - GitHub owner: `gitwithmasum`
   - Repository: `Masum-Galaxy-Terminal-X`
   - Workflow: `.github/workflows/publish-marketplace.yml`
   - If asked for an environment, use `marketplace`.
3. In the GitHub repository, go to **Settings → Environments** and create an environment named `marketplace`.
4. To prevent accidental releases, set up **required reviewers** for this environment (when supported by the repository plan/settings). This approval gate is strongly recommended.

The workflow requests `id-token: write` **only** in the publish job. It does not store a PAT and uses `vsce publish --oidc`. If trust is not configured, the publish step will fail without releasing.

## 2. Release process

Before tagging, wait for the latest `Extension quality` workflow to pass, install the VSIX locally and run the smoke tests in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

To publish v2.0.0, **only after completing the review and smoke tests**, run:

```powershell
cd "D:\OneDrive\Web Development\Masum-Galaxy-Terminal-X"
git pull origin main
git status --short
git tag v2.0.0
git push origin v2.0.0
```

Pushing a matching version tag launches **Publish VS Code Marketplace** automatically. Tags with a version that does not exactly match `package.json` fail before publish. The workflow runs PowerShell parsing, TypeScript typecheck, VSIX packaging and archive-content verification before calling Marketplace.

Never re-use a published version. For the next release, update the version in `package.json`, update CHANGELOG and use the matching new tag.

## 3. Confirm publication

- Review the [GitHub Actions publishing run](https://github.com/gitwithmasum/Masum-Galaxy-Terminal-X/actions/workflows/publish-marketplace.yml).
- Then check the Marketplace page at `https://marketplace.visualstudio.com/items?itemName=gitwithmasum.masum-galaxy-terminal-x`.
- A successful workflow does **not** replace a manual check that the version appears in Marketplace.

## Important

- This workflow has been committed, but no tag was created or publish performed during setup.
- A configured Marketplace trusted publishing policy and GitHub environment are external account settings; they must be completed by a publisher administrator.
- Do not paste publishing tokens into chat or source files.
