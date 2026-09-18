"""Render the Connected Fleet overview as a silent, looping motion graphic.

Uses existing site photography with animated connections, vehicle markers, and
status highlights. This is an original animated explainer, not live-action footage.
Run from any directory with Pillow and imageio-ffmpeg installed.
"""

from pathlib import Path
import math
import os
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio_ffmpeg


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT, SCALE = 1280, 600, 2
# Keep the diagram coordinates and trim the removed heading band from each frame.
TOP_TRIM = 120
FPS, DURATION = 24, 15
VIDEO = ROOT / 'videos/connected-fleet-one-platform-v2.mp4'
POSTER = ROOT / 'images/connected-fleet-one-platform-poster-v2.webp'
BLUE = (62, 106, 225)
INK = (23, 32, 47)
MUTED = (100, 112, 131)
GREEN = (43, 161, 121)

NODES = [
    ('Vehicles', 'fleet-tracking-live-vehicles.webp', (44, 148, 284, 186)),
    ('Drivers', 'solution-driver-management-scene.webp', (952, 148, 284, 186)),
    ('Assets', 'asset-management-hero-v6.webp', (44, 414, 284, 186)),
    ('Devices', 'device-ecosystem-hardware-hero-v1.webp', (952, 414, 284, 186)),
    ('Operations', 'connected-fleet-how-it-works-v1.webp', (494, 525, 292, 166)),
]
PATHS = [
    [(328, 241), (353, 241), (350, 280), (376, 280)],
    [(952, 241), (927, 241), (930, 280), (904, 280)],
    [(328, 507), (359, 507), (345, 427), (376, 427)],
    [(952, 507), (921, 507), (935, 427), (904, 427)],
    [(640, 525), (640, 509), (640, 493), (640, 477)],
]
MAP_ROUTE = [(432, 356), (517, 356), (557, 392), (644, 392),
             (644, 433), (503, 433), (467, 402), (432, 402), (432, 356)]


def rect(box):
    return tuple(round(v * SCALE) for v in box)


def point(x, y):
    return round(x * SCALE), round(y * SCALE)


def font(size, bold=False):
    name = 'seguisb.ttf' if bold else 'segoeui.ttf'
    candidates = [Path('C:/Windows/Fonts') / name,
                  Path('/usr/share/fonts/truetype/dejavu') /
                  ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), round(size * SCALE))
    raise FileNotFoundError('Install Segoe UI or DejaVu Sans to render video labels.')


FONTS = {key: font(size, bold) for key, size, bold in [
    ('hub', 27, True), ('card', 23, True),
    ('label', 14, False), ('small', 12, True), ('status', 16, False),
]}


def text(draw, xy, value, key, fill=INK):
    draw.text(point(*xy), value, font=FONTS[key], fill=fill)


def rounded(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(rect(box), round(radius * SCALE), fill,
                           outline, max(1, round(width * SCALE)))


def line(draw, points, fill, width=1):
    draw.line([point(*p) for p in points], fill=fill,
              width=max(1, round(width * SCALE)), joint='curve')


def circle(draw, x, y, radius, fill, outline=None, width=1):
    draw.ellipse(rect((x-radius, y-radius, x+radius, y+radius)),
                 fill=fill, outline=outline, width=round(width*SCALE))


def curve(path, fraction):
    a, b, c, d = path
    f = fraction
    return tuple((1-f)**3*a[i] + 3*(1-f)**2*f*b[i] +
                 3*(1-f)*f*f*c[i] + f**3*d[i] for i in range(2))


def route_position(fraction):
    lengths = [math.dist(a, b) for a, b in zip(MAP_ROUTE, MAP_ROUTE[1:])]
    remaining = (fraction % 1) * sum(lengths)
    for a, b, distance in zip(MAP_ROUTE, MAP_ROUTE[1:], lengths):
        if remaining <= distance:
            f = remaining / distance
            return a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f
        remaining -= distance
    return MAP_ROUTE[0]


def make_background():
    image = Image.new('RGB', (WIDTH*SCALE, (HEIGHT+TOP_TRIM)*SCALE), (245, 248, 252))
    draw = ImageDraw.Draw(image)

    for path in PATHS:
        line(draw, [curve(path, i/80) for i in range(81)], (197, 210, 233), 2)

    for label, filename, (x, y, w, h) in NODES:
        rounded(draw, (x-2, y+5, x+w+2, y+h+7), 15, (229, 235, 244))
        rounded(draw, (x, y, x+w, y+h), 12, 'white')
        photo_height = h - 49
        with Image.open(ROOT / 'images' / filename) as source:
            photo = ImageOps.fit(source.convert('RGB'), (w*SCALE, photo_height*SCALE),
                                 method=Image.Resampling.LANCZOS, centering=(.5, .4))
        mask = Image.new('L', (w*SCALE, photo_height*SCALE), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle((0, 0, w*SCALE, (photo_height+15)*SCALE), 12*SCALE, fill=255)
        image.paste(photo, point(x, y), mask)
        text(draw, (x+17, y+photo_height+8), label, 'card')
        circle(draw, x+w-23, y+photo_height+25, 4, (170, 184, 207))

    rounded(draw, (373, 244, 907, 482), 20, (225, 233, 246))
    rounded(draw, (376, 239, 904, 477), 18, 'white', (208, 219, 237), 1)
    text(draw, (403, 257), 'Connected Fleet', 'hub')
    text(draw, (404, 295), 'One live view', 'label', MUTED)
    rounded(draw, (819, 260, 881, 286), 13, (231, 248, 241))
    text(draw, (841, 265), 'LIVE', 'small', (31, 135, 99))

    # Illustrative map: moving vehicle markers, without invented product statistics.
    rounded(draw, (402, 326, 679, 453), 10, (240, 246, 252))
    for x, y, w, h in [(411,334,44,12),(477,334,48,12),(577,337,83,26),
                       (411,418,32,25),(524,368,22,23),(547,416,70,10)]:
        rounded(draw, (x,y,x+w,y+h), 3, (226,235,245))
    for road in [[(415,373),(490,373),(563,443)],[(565,331),(565,407),(668,439)],
                 [(418,447),(490,385),(672,385)]]:
        line(draw, road, (255,255,255), 5)
    line(draw, MAP_ROUTE, (184,204,242), 3)
    for i, (label, *_rest) in enumerate(NODES):
        y = 329 + i*24
        circle(draw, 708, y+9, 3, (163,182,213))
        text(draw, (720,y-2), label, 'status', MUTED)
    return image


BACKGROUND = make_background()


def render(time):
    overlay = Image.new('RGBA', BACKGROUND.size)
    draw = ImageDraw.Draw(overlay)
    phase = 2*math.pi*time/DURATION
    for i, (_label, _filename, (x, y, w, h)) in enumerate(NODES):
        strength = ((1+math.cos(phase-i*2*math.pi/5))/2)**12
        rounded(draw, (x-2,y-2,x+w+2,y+h+2), 14,
                outline=(*BLUE, round(230*strength)), width=2.5)
        circle(draw, x+w-23, y+h-24, 5, (*BLUE, round(255*strength)))
        path = PATHS[i]
        line(draw, [curve(path,j/60) for j in range(61)], (*BLUE, round(175*strength)), 2)
        for packet in range(2):
            f = (time/3 + i*.17 + packet*.5) % 1
            px, py = curve(path, f)
            alpha = round((.25+.75*strength)*math.sin(math.pi*f)*255)
            circle(draw, px,py,5,(*BLUE,alpha))
            circle(draw, px,py,2,(255,255,255,alpha))
        sy = 329+i*24
        rounded(draw, (698,sy-3,882,sy+21), 6, (*BLUE, round(20*strength)))
        circle(draw, 708, sy+9, 4, (*BLUE,round(255*strength)))

    for i in range(3):
        x,y = route_position(time/DURATION+i/3)
        circle(draw,x,y,11,(255,255,255,255))
        circle(draw,x,y,8,(*BLUE,255))
        rounded(draw,(x-3,y-4,x+3,y+4),1,(255,255,255,255))
    pulse=(1+math.sin(time*2*math.pi/3))/2
    circle(draw,831,273,4,(*GREEN,255))
    circle(draw,831,273,5+pulse*3,None,(*GREEN,round(80*(1-pulse))),1)
    frame = Image.alpha_composite(BACKGROUND.convert('RGBA'),overlay).convert('RGB')
    return frame.crop((0,TOP_TRIM*SCALE,WIDTH*SCALE,(TOP_TRIM+HEIGHT)*SCALE)).resize(
        (WIDTH,HEIGHT),Image.Resampling.LANCZOS)


def main():
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('--preview-only', action='store_true')
    args=parser.parse_args()
    previews=ROOT/'tmp/connected-fleet-video'
    previews.mkdir(parents=True,exist_ok=True)
    for time in (0,3,6,9,12):
        render(time).save(previews/f'overview-{time}.png')
    if args.preview_only:
        print('Rendered five storyboard frames.',flush=True)
        return
    VIDEO.parent.mkdir(exist_ok=True)
    count=FPS*DURATION
    command=[imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y',
             '-f','rawvideo','-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),
             '-i','-','-an','-c:v','libx264','-preset','medium','-crf','22',
             '-pix_fmt','yuv420p','-profile:v','main','-level','3.1',
             '-force_key_frames',f'expr:eq(n,{count-1})','-movflags','+faststart',str(VIDEO)]
    options={'creationflags':subprocess.CREATE_NO_WINDOW} if os.name=='nt' else {}
    with subprocess.Popen(command,stdin=subprocess.PIPE,**options) as encoder:
        for frame in range(count):
            current=render(frame*DURATION/(count-1))
            encoder.stdin.write(current.tobytes())
            if frame==0:
                current.save(POSTER,'WEBP',quality=88,method=6)
                current.resize((640,round(HEIGHT*640/WIDTH)),Image.Resampling.LANCZOS).save(
                    POSTER.with_stem(POSTER.stem+'-640'),'WEBP',quality=86,method=6)
            if frame%72==0:
                print(f'Rendered {frame}/{count} frames',flush=True)
        encoder.stdin.close()
        if encoder.wait():
            raise RuntimeError('Video encoding failed.')
    print(f'Saved {VIDEO.relative_to(ROOT)} ({VIDEO.stat().st_size/1048576:.2f} MB)',flush=True)


if __name__=='__main__':
    main()
