import zlib
import struct
import math

def create_png(width, height, output_path, is_maskable=False):
    # RGBA image buffer
    raw_data = bytearray()
    
    cx, cy = width / 2.0, height / 2.0
    r_max = min(width, height) / 2.0
    
    # Indigo gradient colors: #4F46E5 -> #7C3AED
    # Mascot center: Warm Amber/Orange #FF7A18
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        ny = (y - cy) / r_max
        for x in range(width):
            nx = (x - cx) / r_max
            dist = math.sqrt(nx*nx + ny*ny)
            
            # Background Gradient
            t = (x + y) / (width + height)
            r = int(79 + (124 - 79) * t)
            g = int(70 + (58 - 70) * t)
            b = int(229 + (237 - 229) * t)
            a = 255
            
            # Mascot body blob in center
            # Head/torso center at (0, 0.05)
            dy = ny - 0.05
            mascot_dist = math.sqrt(nx*nx*1.2 + dy*dy*0.9)
            if mascot_dist < 0.55:
                # Orange/Amber mascot
                r = int(255 * (1 - mascot_dist*0.3))
                g = int(122 * (1 - mascot_dist*0.2))
                b = 24
                
                # Eyes
                eye1 = math.sqrt((nx + 0.18)**2 + (ny + 0.05)**2)
                eye2 = math.sqrt((nx - 0.18)**2 + (ny + 0.05)**2)
                if eye1 < 0.08 or eye2 < 0.08:
                    if eye1 < 0.035 or eye2 < 0.035: # eye shine
                        r, g, b = 255, 255, 255
                    else:
                        r, g, b = 30, 41, 59
                
                # Smile
                mouth_d = math.sqrt(nx*nx + (ny - 0.18)**2)
                if mouth_d < 0.12 and ny > 0.15:
                    r, g, b = 153, 27, 27
            
            raw_data.extend([r, g, b, a])
            
    # PNG Header
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR Chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr))
    png.extend(struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + ihdr_crc)
    
    # IDAT Chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed))
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc)
    
    # IEND Chunk
    iend_crc = struct.pack('>I', zlib.crc32(b'IEND'))
    png.extend(struct.pack('>I', 0) + b'IEND' + iend_crc)
    
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"Generated {output_path} ({width}x{height})")

create_png(192, 192, 'public/pwa-192x192.png')
create_png(512, 512, 'public/pwa-512x512.png')
create_png(512, 512, 'public/pwa-maskable-512x512.png', is_maskable=True)
create_png(180, 180, 'public/apple-touch-icon.png')
