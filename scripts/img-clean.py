"""Checks or strips non-rendering metadata in JPEG, PNG, WebP and SVG files (stdlib only).

Removes: EXIF (incl. GPS, camera, dates), XMP, IPTC/Photoshop, C2PA/JUMBF Content
Credentials, comments, text chunks, timestamps, and SVG <metadata>/comments/editor data.
Keeps what affects rendering: ICC colour profiles, PNG sRGB/gAMA/cHRM/pHYs, image data.
JPEG EXIF orientation is NOT applied: if a photo relies on it, rotate it first
(--check prints 'orientation=N' when it isn't 1).

Usage:
  python3 -I scripts/img-clean.py --check FILE...   exit 1 if any file has metadata
  python3 -I scripts/img-clean.py --strip FILE...   rewrite in place, then re-check

Files written to the claude.ai project files folder get a C2PA manifest added on
write, so clean in a scratch folder and hand images over inside a .zip.
"""

import re
import struct
import sys

JPEG_DROP = {0xE1: 'EXIF/XMP', 0xED: 'IPTC/Photoshop', 0xEB: 'C2PA/JUMBF', 0xFE: 'comment'}
# APP2 (ICC profile) and APP14 (Adobe colour transform) affect rendering, so they stay
JPEG_DROP.update({m: f'APP{m - 0xE0}' for m in range(0xE3, 0xF0) if m not in JPEG_DROP and m != 0xEE})
PNG_DROP = {b'tEXt', b'zTXt', b'iTXt', b'eXIf', b'tIME', b'caBX'}
WEBP_DROP = {b'EXIF', b'XMP ', b'C2PA'}


def orientation(seg):
	"""EXIF Orientation (tag 0x0112) from an APP1 segment, 1 (normal) if absent."""
	if seg[4:10] != b'Exif\x00\x00':
		return 1
	t = seg[10:]
	e = '<' if t[:2] == b'II' else '>'
	try:
		ifd = struct.unpack(e + 'I', t[4:8])[0]
		for k in range(struct.unpack(e + 'H', t[ifd : ifd + 2])[0]):
			o = ifd + 2 + 12 * k
			if struct.unpack(e + 'H', t[o : o + 2])[0] == 0x0112:
				return struct.unpack(e + 'H', t[o + 8 : o + 10])[0]
	except struct.error:
		pass
	return 1


def jpeg(d):
	out, found, i = bytearray(d[:2]), [], 2
	while i < len(d):
		if d[i] != 0xFF:
			raise ValueError('bad JPEG marker')
		m = d[i + 1]
		if m == 0xDA:
			return bytes(out + d[i:]), found
		n = struct.unpack('>H', d[i + 2 : i + 4])[0]
		seg = d[i : i + 2 + n]
		if m in JPEG_DROP:
			found.append(JPEG_DROP[m])
			o = orientation(seg) if m == 0xE1 else 1
			if o != 1:
				found.append(f'orientation={o}')
		else:
			out += seg
		i += 2 + n
	return bytes(out), found


def png(d):
	out, found, i = bytearray(d[:8]), [], 8
	while i < len(d):
		n = struct.unpack('>I', d[i : i + 4])[0]
		t = d[i + 4 : i + 8]
		if t in PNG_DROP:
			found.append(t.decode())
		else:
			out += d[i : i + 12 + n]
		i += 12 + n
	return bytes(out), found


def webp(d):
	body, found, i = bytearray(), [], 12
	while i < len(d):
		t = d[i : i + 4]
		n = struct.unpack('<I', d[i + 4 : i + 8])[0]
		end = i + 8 + n + (n & 1)
		if t in WEBP_DROP:
			found.append(t.decode().strip())
		else:
			c = bytearray(d[i:end])
			if t == b'VP8X':
				c[8] &= ~0x0C  # clear the EXIF and XMP flags
			body += c
		i = end
	return b'RIFF' + struct.pack('<I', 4 + len(body)) + b'WEBP' + bytes(body), found


SVG_RES = [
	(re.compile(rb'<metadata\b.*?</metadata>', re.S), 'metadata'),
	(re.compile(rb'<!--.*?-->', re.S), 'comment'),
	(re.compile(rb'<(sodipodi|inkscape):[^>]*?(/>|>.*?</\1:[^>]*>)', re.S), 'editor'),
]


def svg(d):
	found = []
	for rx, name in SVG_RES:
		d, n = rx.subn(b'', d)
		found += [name] * n
	return d, found


def handle(d):
	if d[:3] == b'\xff\xd8\xff':
		return jpeg(d)
	if d[:8] == b'\x89PNG\r\n\x1a\n':
		return png(d)
	if d[:4] == b'RIFF' and d[8:12] == b'WEBP':
		return webp(d)
	if b'<svg' in d[:2000]:
		return svg(d)
	return d, ['unknown format']


mode, files = sys.argv[1], sys.argv[2:]
dirty = 0
for path in files:
	with open(path, 'rb') as f:
		d = f.read()
	new, found = handle(d)
	if mode == '--strip' and new != d:
		with open(path, 'wb') as f:
			f.write(new)
		new, found2 = handle(new)
		print(f'stripped {sorted(set(found))}: {path}')
		found = found2
	if found:
		dirty = 1
		print(f'DIRTY {sorted(set(found))}: {path}')
	elif mode == '--check':
		print(f'clean: {path}')
sys.exit(dirty)
