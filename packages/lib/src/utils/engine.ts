export function injectNamespacePragmasWorkaround(
  currentDefinition: string,
  tableVersions: { definition: string; tableIdentifier: string }[],
) {
  if (!tableVersions.length) {
    return currentDefinition;
  }

  const modifiedDependencyDefinitions = tableVersions
    .map(({ definition, tableIdentifier }) => {
      const pragma = `@@PRAGMA namespace=${tableIdentifier}\n`;
      const tables = definition.trim().split("\n\n");

      return `${pragma}${tables.join(`\n\n${pragma}`)}`;
    })
    .join("\n\n");

  return [currentDefinition.trim(), modifiedDependencyDefinitions].join("\n\n");
}
