"""Render the platform CTA's original fleet animation (Pillow + imageio-ffmpeg).

Vehicles move independently around a depot; data packets travel between devices.
The camera is fixed. Four identical, evenly spaced vans advance one quarter of
the circuit in four seconds, so the composition loops without reversing traffic.
"""

from pathlib import Path
import math
import subprocess

from PIL import Image, ImageDraw
import imageio_ffmpeg


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT, SCALE = 1280, 720, 2
FPS, DURATION = 24, 4
VIDEO = ROOT / 'videos/platform-connected-operations-loop-v2.mp4'
POSTER = ROOT / 'images/platform-cta-connected-operations-poster-v2.webp'
BLUE = (65, 105, 220)
NAVY = (35, 56, 92)


def project(x, y, z=0):
    return ((640 + (x - y) * 1.02) * SCALE,
            (407 + (x + y) * .50 - z) * SCALE)


def polygon(draw, points, fill, outline=None, width=1):
    draw.polygon([project(*p) for p in points], fill=fill)
    if outline:
        line(draw, points + [points[0]], outline, width)


def line(draw, points, fill, width=1):
    draw.line([project(*p) for p in points], fill=fill,
              width=max(1, round(width * SCALE)), joint='curve')


def disc(draw, x, y, z, radius, fill, outline=None, width=1):
    px, py = project(x, y, z)
    radius *= SCALE
    draw.ellipse((px-radius, py-radius, px+radius, py+radius),
                 fill=fill, outline=outline, width=max(1, round(width*SCALE)))


def block(draw, x, y, length, width, height, base=0, direction=(1, 0),
          roof=(255, 255, 255), side=(216, 228, 240), front=(191, 208, 225)):
    dx, dy = direction
    vx, vy = -dy, dx
    corners = [(x + a*dx + b*vx, y + a*dy + b*vy)
               for a, b in [(-length/2, -width/2), (length/2, -width/2),
                            (length/2, width/2), (-length/2, width/2)]]
    faces = [(corners[i], corners[(i+1) % 4]) for i in range(4)]
    for a, b in sorted(faces, key=lambda edge: sum(sum(p) for p in edge)):
        color = side if abs(a[0]-b[0]) > abs(a[1]-b[1]) else front
        polygon(draw, [(a[0], a[1], base), (b[0], b[1], base),
                       (b[0], b[1], base+height), (a[0], a[1], base+height)], color)
    polygon(draw, [(a, b, base+height) for a, b in corners], roof)


def rounded_route():
    points = []
    # Clockwise rounded square, centred on the logistics campus.
    for cx, cy, start in [(158, -158, -90), (158, 158, 0),
                          (-158, 158, 90), (-158, -158, 180)]:
        for i in range(25):
            angle = math.radians(start + i*90/24)
            points.append((cx+46*math.cos(angle), cy+46*math.sin(angle), 1))
    points.append(points[0])
    lengths = [0]
    for a, b in zip(points, points[1:]):
        lengths.append(lengths[-1] + math.hypot(b[0]-a[0], b[1]-a[1]))
    return points, lengths


ROUTE, LENGTHS = rounded_route()


def route_position(fraction):
    target = (fraction % 1) * LENGTHS[-1]
    for i in range(len(LENGTHS)-1):
        if target <= LENGTHS[i+1]:
            a, b = ROUTE[i], ROUTE[i+1]
            part = (target-LENGTHS[i])/(LENGTHS[i+1]-LENGTHS[i])
            dx, dy = b[0]-a[0], b[1]-a[1]
            distance = math.hypot(dx, dy)
            return (a[0]+part*dx, a[1]+part*dy, (dx/distance, dy/distance))
    raise AssertionError('Route position is outside the circuit')


def warehouse(draw):
    block(draw, -70, -69, 150, 124, 69)
    # Raised seam roof and solar arrays make this a recognisable depot.
    for offset in range(-125, 1, 15):
        line(draw, [(offset, -130, 69.5), (offset, -8, 69.5)], (226, 234, 241), .8)
    for x in [-113, -78, -43]:
        for y in [-100, -69]:
            block(draw, x, y, 26, 21, 2, 70,
                  roof=(83, 120, 163), side=(118, 145, 175), front=(118, 145, 175))
            line(draw, [(x-12, y, 72.2), (x+12, y, 72.2)], (160, 189, 214), .6)
    # Three roller doors face the near side of the road.
    for x in [-118, -75, -32]:
        polygon(draw, [(x-13,-6.5,1),(x+13,-6.5,1),(x+13,-6.5,37),(x-13,-6.5,37)], NAVY)
        for z in range(6, 37, 6):
            line(draw, [(x-11,-6.2,z),(x+11,-6.2,z)], (104, 128, 157), .7)
        line(draw, [(x-15,-4,0),(x-15,-4,11)], BLUE, 2)
        line(draw, [(x+15,-4,0),(x+15,-4,11)], BLUE, 2)
    line(draw, [(-145,-6,54),(5,-6,54)], BLUE, 5)


def operations_hub(draw):
    block(draw, 70, 53, 68, 76, 92, roof=(246,250,255),
          side=(127,164,193), front=(92,131,165))
    # Glass facade, white mullions, and a compact antenna.
    for z in [20, 40, 60, 80]:
        line(draw, [(36,91,z),(104,91,z),(104,15,z)], (219,235,246), 1.4)
    for x in [51, 69, 87]:
        line(draw, [(x,91,2),(x,91,89)], (209,229,242), 1)
    for y in [32, 51, 70]:
        line(draw, [(104,y,2),(104,y,89)], (198,219,237), 1)
    block(draw, 70, 53, 48, 55, 3, 92, roof=(225,237,249))
    line(draw, [(70,53,95),(70,53,119)], NAVY, 2)
    disc(draw, 70,53,119, 3, BLUE)


def tree(draw, x, y):
    line(draw, [(x,y,0),(x,y,23)], (140,155,151), 3)
    disc(draw, x,y,32, 14, (185,214,202))
    disc(draw, x-4,y-3,37, 10, (207,229,216))


def sensor(draw, x, y):
    block(draw,x,y,18,18,4,roof=(217,229,243))
    line(draw,[(x,y,4),(x,y,39)],(134,155,183),3)
    block(draw,x,y,15,11,14,34,roof=(255,255,255),side=(222,234,246),front=(181,203,228))
    disc(draw,x+5,y+6,40,2.5,BLUE)


def van(draw, x, y, direction):
    dx, dy = direction
    vx, vy = -dy, dx
    def local(a,b,z):
        return (x+a*dx+b*vx, y+a*dy+b*vy, z)
    # Visible tyre positions and a blue load body travel with each van.
    for a in [-14, 13]:
        for b in [-10, 10]:
            disc(draw,*local(a,b,4),4,(46,65,88))
    block(draw,x,y,43,21,14,5,direction,roof=(255,255,255),
          side=(226,236,247),front=(197,215,235))
    block(draw,x-5*dx,y-5*dy,31,21,9,19,direction,roof=BLUE,
          side=(63,98,193),front=(45,77,167))
    # Sloped-looking dark windshield is visible even at thumbnail size.
    polygon(draw,[local(11,-8,20),local(20,-8,15),local(20,8,15),local(11,8,20)],NAVY)
    line(draw,[local(-19,10.8,12),local(8,10.8,12)],BLUE,2.4)
    for b in [-7,7]:
        disc(draw,*local(21.8,b,10),1.5,(246,248,224))


def make_background():
    image=Image.new('RGB',(WIDTH*SCALE,HEIGHT*SCALE),(244,248,253))
    draw=ImageDraw.Draw(image)
    # A restrained, light canvas with a shallow extruded campus base.
    for y in range(HEIGHT*SCALE):
        ratio=y/(HEIGHT*SCALE)
        draw.line([(0,y),(WIDTH*SCALE,y)],fill=(round(247-11*ratio),round(250-9*ratio),round(254-6*ratio)))
    polygon(draw,[(-278,-264,-15),(278,-264,-15),(278,264,-15),(-278,264,-15)],(218,230,242))
    polygon(draw,[(-278,-264,0),(278,-264,0),(278,264,0),(-278,264,0)],(254,255,255))
    polygon(draw,[(278,-264,0),(278,264,0),(278,264,-15),(278,-264,-15)],(204,219,235))
    polygon(draw,[(-278,264,0),(278,264,0),(278,264,-15),(-278,264,-15)],(219,230,242))
    # Road and centre dashes are fixed; moving traffic provides real scene motion.
    line(draw,ROUTE,(225,234,244),36)
    line(draw,ROUTE,(236,242,249),29)
    for i in range(56):
        a=route_position(i/56)
        b=route_position((i+.42)/56)
        line(draw,[(a[0],a[1],1.2),(b[0],b[1],1.2)],(187,204,225),1.3)
    # Short loading lanes, landscaping and stationary building shadows.
    for x in [-118,-75,-32]:
        polygon(draw,[(x-14,5,0),(x+14,5,0),(x+14,75,0),(x-14,75,0)],(242,246,250))
        line(draw,[(x-14,75,.2),(x-14,5,.2),(x+14,5,.2),(x+14,75,.2)],(203,219,235),1)
    for x,y,w,h in [(-70,-69,157,130),(70,53,76,84)]:
        polygon(draw,[(x-w/2+15,y-h/2+15,.1),(x+w/2+28,y-h/2+15,.1),
                      (x+w/2+28,y+h/2+30,.1),(x-w/2+15,y+h/2+30,.1)],(229,237,246))
    for x,y in [(-154,102),(130,-134),(149,151)]:
        polygon(draw,[(x-18,y-17,.2),(x+18,y-17,.2),(x+18,y+17,.2),(x-18,y+17,.2)],(233,242,234))
    return image


BACKGROUND=make_background()
LINKS=[[(134,-98,51),(147,-20,127),(70,53,120)],
       [(-103,130,51),(-26,118,139),(70,53,120)],
       [(-70,-69,81),(-2,-25,149),(70,53,120)]]


def curve(path, fraction):
    a,b,c=path
    return tuple((1-fraction)**2*a[i]+2*(1-fraction)*fraction*b[i]+fraction*fraction*c[i] for i in range(3))


def render(time):
    image=BACKGROUND.copy()
    draw=ImageDraw.Draw(image)
    objects=[(-139,lambda:warehouse(draw)),(123,lambda:operations_hub(draw))]
    for x,y in [(-154,102),(130,-134),(149,151)]:
        objects.append((x+y,lambda x=x,y=y:tree(draw,x,y)))
    for x,y in [(134,-98),(-103,130)]:
        objects.append((x+y,lambda x=x,y=y:sensor(draw,x,y)))
    for i in range(4):
        x,y,direction=route_position(.06+i/4+time/(DURATION*4))
        objects.append((x+y+18,lambda x=x,y=y,direction=direction:van(draw,x,y,direction)))
    for _,paint in sorted(objects,key=lambda obj:obj[0]):
        paint()
    # Deliberate moving packets and expanding connection rings, drawn in blue.
    overlay=Image.new('RGBA',image.size,(0,0,0,0))
    signals=ImageDraw.Draw(overlay)
    for i,path in enumerate(LINKS):
        samples=[curve(path,k/48) for k in range(49)]
        line(signals,samples,(*BLUE,70),1.4)
        for packet in range(2):
            fraction=(time/2+packet/2+i*.17)%1
            point=curve(path,fraction)
            disc(signals,*point,6,(*BLUE,32))
            disc(signals,*point,3.2,(*BLUE,235))
            # A short tail makes packet travel legible at normal page size.
            trail=[curve(path,max(0,fraction-k*.008)) for k in range(6)]
            line(signals,trail,(*BLUE,130),2)
    pulse=(time/2)%1
    disc(signals,70,53,120,8+pulse*25,None,(*BLUE,round(100*(1-pulse))),1.7)
    disc(signals,70,53,120,7,(255,255,255,250),(*BLUE,240),2)
    disc(signals,70,53,120,2.5,(*BLUE,255))
    return Image.alpha_composite(image.convert('RGBA'),overlay).convert('RGB').resize((WIDTH,HEIGHT),Image.Resampling.LANCZOS)


def main():
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    command=[ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo',
             '-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),'-i','-',
             '-an','-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p',
             '-profile:v','main','-level','3.1','-movflags','+faststart',str(VIDEO)]
    with subprocess.Popen(command,stdin=subprocess.PIPE) as process:
        for frame in range(FPS*DURATION):
            image=render(frame/FPS)
            process.stdin.write(image.tobytes())
            if frame==0:
                image.save(POSTER,quality=85)
                image.resize((640,360),Image.Resampling.LANCZOS).save(
                    POSTER.with_name(POSTER.stem+'-640.webp'),quality=85)
        process.stdin.close()
        if process.wait():
            raise RuntimeError('Video encoding failed')
    print(f'{VIDEO.relative_to(ROOT)}: {VIDEO.stat().st_size:,} bytes')


if __name__=='__main__':
    main()
