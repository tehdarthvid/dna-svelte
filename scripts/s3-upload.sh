#!/usr/bin/env bash
# Uploads staged dna card images to the S3 bucket, new keys only.
#
# Files go in .s3-upload/ at the repo root, at their S3 key:
#   .s3-upload/ditim/full/<YYYY.MM.DD> <name>.<ext>
#   .s3-upload/ditim/thumbs/<slug>-<hex6>.webp
# Only the s3-upload workflow (.github/workflows/s3-upload.yml) runs this for real;
# a thread runs `bash scripts/s3-upload.sh --dry-run` before pushing a staging branch.
#
#   --dry-run  validate only (no AWS calls, no live check)
#
# Each file is written with `put-object --if-none-match '*'`, so an existing key is
# never overwritten (the IAM role also denies writes without that header). If a key
# already exists with the same bytes (a re-run), it counts as done; different bytes fail.
set -euo pipefail

BUCKET=sk2q169cx9pfoawet3et
HOST=https://$BUCKET.s3-ap-northeast-1.amazonaws.com
REFERER=https://dna.darthvid.com/
CC='public, max-age=31536000, immutable'
ROOT=.s3-upload
MAX_BYTES=$((20 * 1024 * 1024))

dry=0
[[ ${1:-} == --dry-run ]] && dry=1

cd "$(git rev-parse --show-toplevel)"
[[ -d $ROOT ]] || { echo "::error::no $ROOT/ folder"; exit 1; }
if [[ -n $(find "$ROOT" ! -type f ! -type d) ]]; then
	echo "::error::$ROOT/ may hold only regular files (no symlinks)"; exit 1
fi
mapfile -d '' files < <(find "$ROOT" -type f -print0 | sort -z)
((${#files[@]})) || { echo "::error::$ROOT/ is empty"; exit 1; }

urlencode() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe="/"))' "$1"; }

ok=1
declare -A mime_of
for f in "${files[@]}"; do
	key=${f#"$ROOT"/}
	name=${key##*/}
	mime=$(file --mime-type -b "$f")
	ext=${name##*.}
	ext=${ext,,}
	err=''
	if [[ ! $key =~ ^ditim/(full|thumbs)/[^/]+$ || $name == .* ]]; then
		err='key must be ditim/full/<name> or ditim/thumbs/<name>'
	elif (($(stat -c %s "$f") > MAX_BYTES)); then
		err='larger than 20 MB'
	else
		case "$mime:$ext" in
			image/jpeg:jpg | image/jpeg:jpeg | image/png:png | image/webp:webp | image/gif:gif | \
				image/avif:avif | image/svg+xml:svg) ;;
			*) err="content is $mime but the extension is .$ext (keep the original format and a matching extension)" ;;
		esac
	fi
	if [[ -z $err && $key == ditim/thumbs/* && ! $name =~ ^[a-z0-9-]+-[0-9a-f]{6}\.webp$ ]]; then
		err='thumbnail must be <slug>-<hex6>.webp'
	fi
	if [[ -n $err ]]; then
		echo "::error file=$f::$err"
		ok=0
		continue
	fi
	mime_of[$f]=$mime
	# a card's URLs must match the key exactly; only warn, the card may come later
	grep -qF "/$(urlencode "$key")\"" src/lib/data/deck.json ||
		echo "::warning file=$f::no deck.json URL ends in /$(urlencode "$key")"
	echo "ok  $mime  $key"
done
((ok)) || exit 1
((dry)) && { echo "dry run: ${#files[@]} file(s) valid"; exit 0; }

for f in "${files[@]}"; do
	key=${f#"$ROOT"/}
	url="$HOST/$(urlencode "$key")"
	if out=$(aws s3api put-object --bucket "$BUCKET" --key "$key" --body "$f" \
		--content-type "${mime_of[$f]}" --cache-control "$CC" --if-none-match '*' 2>&1); then
		echo "put $key"
	elif [[ $out == *PreconditionFailed* ]]; then
		# key exists: fine only if it holds the same bytes
		if curl -sSf -H "Referer: $REFERER" "$url" | cmp -s - "$f"; then
			echo "same $key (already uploaded)"
		else
			echo "::error file=$f::$key already exists with different content; use a new key"
			ok=0
		fi
	else
		echo "::error file=$f::$out"
		ok=0
	fi
done
((ok)) || exit 1

# the live check the site depends on: 200 and the right Content-Type with the site's Referer
for f in "${files[@]}"; do
	key=${f#"$ROOT"/}
	url="$HOST/$(urlencode "$key")"
	got=$(curl -sS -o /dev/null -w '%{http_code} %{content_type}' -H "Referer: $REFERER" "$url")
	echo "$got  $url"
	[[ $got == "200 ${mime_of[$f]}" ]] || { echo "::error::expected 200 ${mime_of[$f]}"; ok=0; }
	echo "- \`$got\` $url" >>"${GITHUB_STEP_SUMMARY:-/dev/null}"
done
((ok))
