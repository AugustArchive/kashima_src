/** Represents a Operating System */
enum Platform {
  Windows = 'windows',
  MacOS = 'macos',
  Linux = 'linux'
}

export function isAvaliable(platform: Platform) {
  const platforms: { [x in Platform]: string; } = {
    [Platform.Windows]: 'win32',
    [Platform.MacOS]: 'darwin',
    [Platform.Linux]: 'linux'
  };

  if (!platforms.hasOwnProperty(platform)) return false;
  if (process.platform !== platforms[platform]) return false;
  return true;
}

// You can't add "enum Platform" to the default export?
export default Platform;