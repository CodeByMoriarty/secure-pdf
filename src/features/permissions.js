const DEFAULTS = {
  printing: 'highResolution',
  modifying: true,
  copying: true,
  annotating: true,
  fillingForms: true,
  contentAccessibility: true,
  documentAssembly: true,
};

export function buildPermissionFlags(config = {}) {
  return {
    printing: config.printing ?? DEFAULTS.printing,
    modifying: config.modifying ?? DEFAULTS.modifying,
    copying: config.copying ?? DEFAULTS.copying,
    annotating: config.annotating ?? DEFAULTS.annotating,
    fillingForms: config.fillingForms ?? DEFAULTS.fillingForms,
    contentAccessibility: config.contentAccessibility ?? DEFAULTS.contentAccessibility,
    documentAssembly: config.documentAssembly ?? DEFAULTS.documentAssembly,
  };
}
