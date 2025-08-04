{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    { flake-utils
    , nixpkgs
    , ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [
        ];
        pkgs = import nixpkgs { inherit system overlays; };
      in
      {
        devShells.default = with pkgs; mkShell rec {
          buildInputs = [
            (python3.withPackages (ps: with ps; [
              rich-cli
            ]))
            dnscontrol
            typescript
            jq
            dig
            bind
            nodejs
            yarn
          ];
          nativeBuildInputs = [
            typescript-language-server
            treefmt
            nixfmt-rfc-style
          ];
          LD_LIBRARY_PATH = (nixpkgs.lib.makeLibraryPath buildInputs);
          shellHook = ''
          '';
        };
      }
    );
}
