{
  description = "A breathing exercise with uniform polyhedra and their spherical geometries.";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (sys:
    let
      pkgs = nixpkgs.legacyPackages.${sys};
      env = pkgs.buildNpmPackage {
        name = "breathing-geometry";
        src = ./.;
        buildInputs = [ pkgs.nodejs ];
        # Get hashes from lockfile
        npmDeps = pkgs.importNpmLock {
            npmRoot = ./.;
        };
        # Ensures that the generated lockfile is in the same format as package-lock.json
        npmConfigHook = pkgs.importNpmLock.npmConfigHook;
      };
    in {
      packages.default = env;

      devShells.default = pkgs.mkShell {
        name = "breathing-geometry";
        buildInputs = [pkgs.nodejs pkgs.python3];
        packages = [
          # Make sure to npm install first! :)
          (pkgs.writeScriptBin "watch" ''
            npm run watch &
            npm run local
          '')
        ];
      };
    }
  );
}