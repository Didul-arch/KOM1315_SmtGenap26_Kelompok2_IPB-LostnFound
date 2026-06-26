export function resolveAssetUrl(assetPath) {
  if (!assetPath) return "";

  let normalizedAssetPath = assetPath
    .trim()
    .replace(/^(https?)\/\//i, "$1://");

  if (
    normalizedAssetPath.startsWith("http://") ||
    normalizedAssetPath.startsWith("https://") ||
    normalizedAssetPath.startsWith("data:") ||
    normalizedAssetPath.startsWith("blob:")
  ) {
    return normalizedAssetPath;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const storageBase = (import.meta.env.VITE_STORAGE_BASE_URL || "").replace(
    /\/$/,
    "",
  );

  // Ensure known upload directories hit the /storage endpoint
  if (
    !normalizedAssetPath.startsWith("/") &&
    (normalizedAssetPath.startsWith("identity-documents/") ||
      normalizedAssetPath.startsWith("items/") ||
      normalizedAssetPath.startsWith("claims/"))
  ) {
    normalizedAssetPath = `/storage/${normalizedAssetPath}`;
  }

  if (normalizedAssetPath.startsWith("/storage/")) {
    return apiBase ? `${apiBase}${normalizedAssetPath}` : normalizedAssetPath;
  }

  const baseUrl = storageBase || apiBase;
  if (!baseUrl) return assetPath;

  if (normalizedAssetPath.startsWith("/")) {
    return `${baseUrl}${normalizedAssetPath}`;
  }

  return `${baseUrl}/${normalizedAssetPath}`;
}

export function getAssetFileName(assetPath) {
  if (!assetPath) return "";

  return (
    assetPath
      .split("?")[0]
      .split("#")[0]
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean)
      .pop() || ""
  );
}

export function isPreviewableImage(assetPath) {
  const fileName = getAssetFileName(assetPath).toLowerCase();
  return /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(fileName);
}
