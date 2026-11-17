"""Strips C2PA (Content Credentials) manifests from JPEG, PNG and WebP files, in place.

Files written to the project's shared folder get one embedded on write, which changes
their bytes and SHA-256. Card images should be the original bytes (the thumbnail name
uses the original's hash), so scripts/s3-upload.sh runs this before validating.
Removes JPEG APP11 (0xFFEB, JUMBF) segments, PNG caBX chunks and WebP C2PA chunks;
other files are left alone. Prints each file it changed.

Usage: python3 -I scripts/strip-c2pa.py FILE...
"""

import struct
import sys


def jpeg(d):
	out, i = bytearray(d[:2]), 2
	while i < len(d):
		if d[i] != 0xFF:
			raise ValueError('bad JPEG marker')
		m = d[i + 1]
		if m == 0xDA:  # start of scan: the rest is image data
			return bytes(out + d[i:])
		n = struct.unpack('>H', d[i + 2 : i + 4])[0]
		if m != 0xEB:
			out += d[i : i + 2 + n]
		i += 2 + n
	return bytes(out)


def png(d):
	out, i = bytearray(d[:8]), 8
	while i < len(d):
		n = struct.unpack('>I', d[i : i + 4])[0]
		if d[i + 4 : i + 8] != b'caBX':
			out += d[i : i + 12 + n]
		i += 12 + n
	return bytes(out)


def webp(d):
	body, i = bytearray(), 12
	while i < len(d):
		n = struct.unpack('<I', d[i + 4 : i + 8])[0]
		end = i + 8 + n + (n & 1)
		if d[i : i + 4] != b'C2PA':
			body += d[i:end]
		i = end
	return b'RIFF' + struct.pack('<I', 4 + len(body)) + b'WEBP' + bytes(body)


for path in sys.argv[1:]:
	with open(path, 'rb') as f:
		d = f.read()
	if d[:3] == b'\xff\xd8\xff':
		new = jpeg(d)
	elif d[:8] == b'\x89PNG\r\n\x1a\n':
		new = png(d)
	elif d[:4] == b'RIFF' and d[8:12] == b'WEBP':
		new = webp(d)
	else:
		continue
	if new != d:
		with open(path, 'wb') as f:
			f.write(new)
		print(f'stripped C2PA ({len(d) - len(new)} bytes): {path}')
