#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

EXIT_CODE=0

echo "==> Running backend tests"
(
  cd "$ROOT_DIR/backend" && npm test
) || EXIT_CODE=$?

echo "==> Running frontend tests"
(
  cd "$ROOT_DIR/frontend" && npm test
) || EXIT_CODE=$?

echo "==> Running mobile tests"
(
  cd "$ROOT_DIR/mobile" && npm test
) || EXIT_CODE=$?

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "\nAll test suites passed."
else
  echo "\nOne or more test suites failed. Exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
