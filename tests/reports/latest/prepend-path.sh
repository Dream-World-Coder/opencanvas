#!/bin/bash

PREFIX=$1

if [ -z "$PREFIX" ]; then
  echo "Usage: ./prepend_path.sh <prefix>"
  exit 1
fi

find . -type f -name "*.txt" | while read -r file; do
  REL_PATH="${file#./}"
  TMP_FILE=$(mktemp)

  echo "path: ${PREFIX}${REL_PATH}" > "$TMP_FILE"
  echo "" >> "$TMP_FILE"
  cat "$file" >> "$TMP_FILE"
  mv "$TMP_FILE" "$file"

  echo "Processed: $REL_PATH"
done
