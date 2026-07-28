import { syncTemplateEnv } from '#/cli/sync-create-rntwsc-app-templates/env'
import { syncTemplateIgnores } from '#/cli/sync-create-rntwsc-app-templates/ignores'
import { syncTemplatePackageVersions } from '#/cli/sync-create-rntwsc-app-templates/package-versions'
import { syncPlayground } from '#/cli/sync-create-rntwsc-app-templates/playground'
import { syncTemplatePnpmWorkspace } from '#/cli/sync-create-rntwsc-app-templates/pnpm-workspace'
import { syncTemplateRootConfigs } from '#/cli/sync-create-rntwsc-app-templates/root-configs'
import { syncTemplateRootPackageJson } from '#/cli/sync-create-rntwsc-app-templates/root-package-json'
import { syncTemplateTsconfigBase } from '#/cli/sync-create-rntwsc-app-templates/tsconfig-base'

export { syncTemplateEnv } from '#/cli/sync-create-rntwsc-app-templates/env'
export { syncTemplateIgnores } from '#/cli/sync-create-rntwsc-app-templates/ignores'
export { syncTemplatePackageVersions } from '#/cli/sync-create-rntwsc-app-templates/package-versions'
export { syncPlayground } from '#/cli/sync-create-rntwsc-app-templates/playground'
export { syncTemplatePnpmWorkspace } from '#/cli/sync-create-rntwsc-app-templates/pnpm-workspace'
export { syncTemplateRootConfigs } from '#/cli/sync-create-rntwsc-app-templates/root-configs'
export { syncTemplateRootPackageJson } from '#/cli/sync-create-rntwsc-app-templates/root-package-json'
export { syncTemplateTsconfigBase } from '#/cli/sync-create-rntwsc-app-templates/tsconfig-base'

export const syncCreateRntwscAppTemplates = async (repoRoot: string) => {
  // tsconfig-base reads the .gitignore.template ignores writes, so it must
  // run after - everything else is independent and can run in parallel.
  await syncTemplateIgnores(repoRoot)
  await Promise.all([
    syncTemplateTsconfigBase(repoRoot),
    syncPlayground(repoRoot),
    syncTemplatePnpmWorkspace(repoRoot),
    syncTemplateEnv(repoRoot),
    syncTemplatePackageVersions(repoRoot),
    syncTemplateRootConfigs(repoRoot),
    syncTemplateRootPackageJson(repoRoot),
  ])
}
