"""Create a deterministic Web Store upload ZIP from the built extension."""
import hashlib
import json
import pathlib
import zipfile

root = pathlib.Path(__file__).resolve().parent.parent
source = root / 'dist' / 'extension'
version = json.loads((source / 'manifest.json').read_text())['version']
archive = root / 'releases' / f'NOOG-Chrome-Web-Store-{version}.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    for file in sorted(source.rglob('*')):
        if file.is_file():
            entry = zipfile.ZipInfo(file.relative_to(source).as_posix(), (1980, 1, 1, 0, 0, 0))
            entry.external_attr = 0o100644 << 16
            entry.compress_type = zipfile.ZIP_DEFLATED
            output.writestr(entry, file.read_bytes(), compresslevel=9)
print(f'{archive.name} · {archive.stat().st_size:,} bytes · SHA-256 {hashlib.sha256(archive.read_bytes()).hexdigest()}')
