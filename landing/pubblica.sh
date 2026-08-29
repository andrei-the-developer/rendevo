#!/usr/bin/env bash
# Pubblica la landing, mettendoci il dominio giusto.
#
# `og:image` e `og:url` devono essere indirizzi assoluti — i crawler di
# WhatsApp e Facebook non seguono i relativi — quindi il dominio nel file
# statico non si puo' evitare. Ma non deve stare scritto nel sorgente: qui
# c'e' il segnaposto __DOMINIO__, e lo sostituisce questo script leggendo il
# DOMINIO dal .env. Cosi' cambiare dominio resta una riga sola.
set -euo pipefail

QUI=$(cd "$(dirname "$0")" && pwd)
PROGETTO=$(dirname "$QUI")
DEST=${1:-/var/www/rendevo}

DOMINIO=$(grep -E '^DOMINIO=' "$PROGETTO/.env" | cut -d= -f2-)
[ -n "$DOMINIO" ] || { echo "manca DOMINIO nel .env" >&2; exit 1; }

LAVORO=$(mktemp -d); trap 'rm -rf "$LAVORO"' EXIT
rsync -a --exclude LEGGIMI.md --exclude 'social/' --exclude 'pubblica.sh' \
      "$QUI/" "$LAVORO/"
sed -i "s|__DOMINIO__|$DOMINIO|g" "$LAVORO/index.html"

rsync -a --delete "$LAVORO/" "$DEST/"
echo "landing pubblicata su $DEST con dominio $DOMINIO"
grep -o 'content="https://[^"]*"' "$DEST/index.html" | sed 's/^/  /'
