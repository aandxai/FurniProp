export type SceneSelection = { packageId: string; previewImage: string | null; previewLabel: string | null };
export interface VisualizerProvider {
  getCapabilities(): { modes: string[]; selectableAttributes: string[] };
  applySelection(packageId: string): SceneSelection | null;
}

export class ImageVariantProvider implements VisualizerProvider {
  constructor(private readonly approvedScenes: SceneSelection[]) {}
  getCapabilities() { return { modes: ['image-variant'], selectableAttributes: ['furnishing-package'] }; }
  applySelection(packageId: string) { return this.approvedScenes.find(item => item.packageId === packageId) ?? null; }
}
