#!/bin/sh
set -eu

if [ -z "${GLOBETREK_API_BASE_URL:-}" ]; then
    echo "GLOBETREK_API_BASE_URL is required for the Render static build" >&2
    exit 1
fi

if ! printf '%s' "$GLOBETREK_API_BASE_URL" | grep -Eq '^https://[A-Za-z0-9.-]+/api$'; then
    echo "GLOBETREK_API_BASE_URL must be an HTTPS origin ending in /api" >&2
    exit 1
fi

printf 'const API_BASE_URL = "%s";\n' "$GLOBETREK_API_BASE_URL" > frontend/js/config.js
