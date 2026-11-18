#!/usr/bin/env bash
# Uploads dna card images to the S3 bucket from a machine with the `dna-s3` AWS profile.
#
#   scripts/s3-upload.sh full   <file>...        -> ditim/full/<basename>
#   scripts/s3-upload.sh thumbs <file>...        -> ditim/thumbs/<basename>
#   add --yes (first argument) to really upload; without it this is a dry run.
#
# The file's basename is the S3 key, so name files exactly as the card skill says.
# Per file: img-clean --check, Content-Type from the extension (cross-checked with `file`),
# a create-only PutObject (`If-None-Match: *`, so an existing key is never overwritten; a
# replaced image gets a new key), then a Referer-checked GET of the public URL.
# Needs: aws CLI v2, python3, curl, file. Credentials: the `dna-s3` profile (see
# docs in the project files, dna-s3-uzuki/README.md); none are read from this repo.
set -euo pipefail

BUCKET=sk2q169cx9pfoawet3et
REGION=ap-northeast-1
HOST="https://$BUCKET.s3-$REGION.amazonaws.com"
CC='public, max-age=31536000, immutable'
export AWS_PROFILE="${AWS_PROFILE:-dna-s3}" AWS_PAGER=""

yes=0
if [[ "${1:-}" == "--yes" ]]; then yes=1; shift; fi
kind="${1:-}"
[[ "$kind" == full || "$kind" == thumbs ]] || { sed -n '2,8p' "$0"; exit 2; }
shift
(($# > 0)) || { echo "no files given" >&2; exit 2; }

here="$(cd "$(dirname "$0")" && pwd)"
python3 -I "$here/img-clean.py" --check "$@" || { echo "metadata found: run img-clean.py --strip first" >&2; exit 1; }

ctype() {
	case "${1,,}" in
		*.jpg | *.jpeg) echo image/jpeg ;;
		*.png) echo image/png ;;
		*.webp) echo image/webp ;;
		*.gif) echo image/gif ;;
		*.avif) echo image/avif ;;
		*.svg) echo image/svg+xml ;;
		*) echo "unknown extension: $1" >&2; return 1 ;;
	esac
}

urlenc() { python3 -I -c 'import sys,urllib.parse as u; print(u.quote(sys.argv[1]))' "$1"; }

for f in "$@"; do
	name="$(basename "$f")"
	ct="$(ctype "$name")"
	real="$(file -b --mime-type "$f")"
	if [[ "$ct" != image/svg+xml && "$real" != "$ct" ]]; then
		echo "$name: extension says $ct but the bytes are $real; rename it (keep the real format)" >&2
		exit 1
	fi
	key="ditim/$kind/$name"
	if ((yes == 0)); then
		echo "DRY RUN  $f -> s3://$BUCKET/$key ($ct)"
		continue
	fi
	aws s3api put-object --bucket "$BUCKET" --key "$key" --body "$f" \
		--content-type "$ct" --cache-control "$CC" --if-none-match '*' >/dev/null
	printf '%s -> ' "$key"
	# the bucket only serves the site's Referer; expect "200 image/..."
	curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' \
		-H 'Referer: https://dna.darthvid.com/' "$HOST/ditim/$kind/$(urlenc "$name")"
done
((yes == 1)) || echo "Dry run only. Re-run with --yes as the first argument to upload."
