# Copyright (c) 2024 Hendrik Wolff <hendrik.wolff@agdsn.me>
# SPDX-License-Identifier: MIT OR Apache-2.0

# To install `just`, see
# https://github.com/casey/just#packages

export PATH := "./node_modules/.bin:" + env_var('PATH')

[private]
default:
    @just -l

_provider_credkey   := env_var_or_default("DNS_CREDKEY", "inwx-env")
#   enter your dns provider credkey at this position ---> ^^^^^^^^


_check-zones-dir    := "zone-cache"
_ctl                := "dnscontrol"

_log_level          := "-v log_level=" + env_var_or_default("DNS_LOG", "info")
_conf-js            := "output/esbuild/dnsconfig.js"
_creds-json         := "src/creds.json"
_creds              := " --creds " + _creds-json
_conf               := " --config " + _conf-js
_cc                 := _conf + _creds

_check              := "check" + _conf
_push               := "push --full" + _cc
_ppush              := "ppush --full" + _cc
_preview            := "preview --full" + _cc
_ppreview           := "ppreview --full" + _cc

_env-prod           := _log_level + " -v environment=prod " + "--providers " + _provider_credkey
_env-dev-provider   := _log_level + " -v environment=test " + "--providers none,zone-check "
_env-dev-noprovider := "-v log_level=" + env_var_or_default("DNS_LOG", "off") + " -v environment=test "

_check_setup:
    @bash -c 'f=$(type dnscontrol)'
    @bash -c 'f=$(type named-checkzone jq python3)'
    @bash -c 'f=$(type tsc esbuild pretty-quick prettier)'

# run everything. you should commit afterwards
full-run: fmt build check dns-deploy

# deploy changes to DNS provider with preview
[group('dns')]
dns-deploy: check dns-preview _dns-push

# preview changes to DNS provider
[group('dns')]
dns-preview: build
    {{_ctl}} {{_ppreview}} {{_env-prod}}

# get zones from the DNS provider in $fmt format
[group('dns')]
dns-get-zones fmt *zones='all': check-creds
    {{_ctl}} get-zones {{_creds}} --format={{fmt}} {{_provider_credkey}} - {{zones}}

# get zones from the DNS provider in js format
[group('dns')]
dns-get-zones-js *zones='all':
    @just dns-get-zones js {{zones}}

# import your existing DNS setup into this project
[group('dns')]
dns-import-zones credkey=_provider_credkey *args='': _check_setup
    python3 scripts/import-zones.py {{credkey}} {{args}}

# push changes to DNS provider (you should use dns-deploy)
[confirm("Do you want to push the changes?")]
[group('dns')]
_dns-push: # no dependencies here in case of manual intervention
    {{_ctl}} {{_ppush}} {{_env-prod}}


# run all checks
[group('tests')]
check: _check_setup check-creds check-js check-zones
alias test := check

# try to parse creds.json
[group('tests')]
check-creds: _check_setup
    @jq . <{{_creds-json}} >/dev/null
    @python3 -m json.tool {{_creds-json}} /dev/null
    @echo PASS {{_creds-json}}

# validate built dnsconfig.js file
[group('tests')]
check-js: _check_setup build
    {{_ctl}} {{_check}} {{_env-dev-noprovider}}

# validate zone file compliance
[group('tests')]
check-zones: _check_setup check-push
    @bash scripts/check-zones.sh {{ _check-zones-dir }}

# preview changes to local zone files
[group('tests')]
check-preview: _check_setup build
    @mkdir -p {{ _check-zones-dir }}
    {{_ctl}} {{_preview}} {{_env-dev-provider}}

# push changes to local zone files without preview
[group('tests')]
check-push: _check_setup build
    @mkdir -p {{ _check-zones-dir }}
    {{_ctl}} {{_push}} {{_env-dev-provider}}


# delete <artifacts> and <caches>
[group('house-keeping')]
clean: clean-web clean-zone-cache

# delete <artifacts>, <caches> and <node_modules>
[group('house-keeping')]
clean-full: clean
    rm -rf node_modules/

# delete ts/js build <artifacts>
[group('house-keeping')]
clean-web:
    rm -rf output/

# delete <cached zone files>
[confirm]
[group('house-keeping')]
clean-zone-cache:
    rm -rf {{ _check-zones-dir }}

# format all files
[group('house-keeping')]
fmt *args: _check_setup
    pretty-quick {{args}}

# install all dependencies
[group('house-keeping')]
setup:
    yarn install
    husky
    @echo -e '\n#####'
    @echo '## You need to install `named-checkzone`, `jq` and `python` yourself.'
    @echo -e '#####\n'


# run all typescript build steps
[group('typescript')]
build: _check_setup tsc
    node build.mjs

# compile typescript
[group('typescript')]
tsc *args='': _check_setup
    tsc {{args}}
