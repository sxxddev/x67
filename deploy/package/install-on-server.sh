#!/bin/bash
set -e
cd "$(dirname "$0")"
chmod +x setup.sh scripts/fix-hosting-on-server.sh 2>/dev/null || true
exec ./setup.sh
