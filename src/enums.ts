export enum VersionPreference {
  Stable = 'stable',
  Beta = 'beta',
}

export enum VersionExeName {
  Stable = 'devproxy',
  Beta = 'devproxy-beta',
}

export enum WingetPackageIdentifier {
  Stable = 'DevProxy.DevProxy',
  Beta = 'DevProxy.DevProxy.Beta',
}

export enum HomebrewPackageIdentifier {
  Stable = 'devproxy',
  Beta = 'devproxy-beta',
}

export enum PackageManager {
  Winget,
  Homebrew,
}
