/**
 * Minimal ZIP writer (stored / no compression). Enough for .xlsx, which
 * is just a zip of XML parts. Avoids pulling in a dependency.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;

    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c >>> 0;
  }

  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipEntry = { name: string; content: string | Uint8Array };

function dosDateTime(date: Date): { time: number; day: number } {
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    day:
      (Math.max(date.getFullYear() - 1980, 0) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

export function createZip(entries: ZipEntry[], now = new Date()): Uint8Array {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(now);

  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = encoder.encode(entry.name);
    const data =
      typeof entry.content === "string"
        ? encoder.encode(entry.content)
        : entry.content;
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));

    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);

    parts.push(new Uint8Array(local.buffer), name, data);

    const dir = new DataView(new ArrayBuffer(46));

    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint16(10, 0, true);
    dir.setUint16(12, time, true);
    dir.setUint16(14, day, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, data.length, true);
    dir.setUint32(24, data.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);

    central.push(new Uint8Array(dir.buffer), name);

    offset += 30 + name.length + data.length;
  });

  const centralSize = central.reduce((total, part) => total + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));

  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const total = all.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);

  let cursor = 0;

  all.forEach((part) => {
    output.set(part, cursor);
    cursor += part.length;
  });

  return output;
}
