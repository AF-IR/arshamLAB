#!/usr/bin/env python3
"""تولید تصویر Open Graph (1200x630) و favicon PNG برای Arsham Lab."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (250, 250, 249)        # #fafaf9
PRIMARY = (13, 148, 136)    # #0d9488
DARK = (35, 42, 48)
MUTED = (95, 106, 112)

VAZIR_BOLD = "/tmp/Vazirmatn-Bold.ttf"
VAZIR_REG = "/tmp/Vazirmatn-Regular.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# نوار تأکیدی بالا
d.rectangle([0, 0, W, 10], fill=PRIMARY)

# پس‌زمینه ملایم: دو مستطیل گرد کم‌رنگ در گوشه‌ها (مینیمال، بدون گرادیان افراطی)
light = (231, 243, 241)
rounded(d, (-90, 400, 240, 730), 120, light)
rounded(d, (1010, -80, 1290, 200), 120, light)

# لوگو
rounded(d, (84, 92, 172, 180), 26, PRIMARY)
# فلاسک ساده در لوگو
white = (255, 255, 255)
d.polygon([(116, 108), (140, 108), (152, 156), (104, 156)], fill=white)
d.rectangle([113, 100, 143, 110], fill=white)
d.ellipse([118, 138, 130, 150], fill=PRIMARY)
d.ellipse([132, 128, 142, 138], fill=PRIMARY)

d.text((196, 108), "Arsham Lab", font=font(VAZIR_BOLD, 64), fill=DARK, anchor="lm")
d.text((198, 168), "ابزارهای کاربردی آرشام", font=font(VAZIR_REG, 30), fill=MUTED, anchor="lm")

# عنوان اصلی (راست‌چین)
d.text((W - 84, 300), "ابزارهای کاربردی و رایگان", font=font(VAZIR_BOLD, 82), fill=DARK,
       anchor="rm", direction="rtl", language="fa")
d.text((W - 84, 405), "آنلاین؛ بدون نیاز به ثبت‌نام", font=font(VAZIR_BOLD, 82), fill=PRIMARY,
       anchor="rm", direction="rtl", language="fa")

# ویژگی‌ها به‌صورت چیپ
chips = ["رایگان", "بدون ثبت‌نام", "پردازش در مرورگر"]
x = W - 84
for label in chips:
    fnt = font(VAZIR_REG, 30)
    bbox = d.textbbox((0, 0), label, font=fnt, direction="rtl", language="fa")
    tw = bbox[2] - bbox[0]
    x1, x2 = x - tw - 44, x
    rounded(d, (x1, 505, x2, 567), 31, (255, 255, 255))
    d.rounded_rectangle((x1, 505, x2, 567), radius=31, outline=(214, 222, 220), width=2)
    d.text((x1 + (tw + 44) / 2, 536), label, font=fnt, fill=DARK, anchor="mm",
           direction="rtl", language="fa")
    x = x1 - 20

img.save("/home/z/my-project/public/og.png", "PNG", optimize=True)
print("og.png saved:", img.size)

# favicon PNG 512 برای سازگاری بیشتر
fav = Image.new("RGB", (512, 512), PRIMARY)
fd = ImageDraw.Draw(fav)
fd.polygon([(216, 110), (296, 110), (352, 300), (160, 300)], fill=white)
fd.rectangle([204, 88, 308, 120], fill=white)
fd.ellipse([224, 250, 268, 294], fill=PRIMARY)
fd.ellipse([282, 210, 320, 248], fill=PRIMARY)
fd.rounded_rectangle((150, 300, 362, 380), radius=40, fill=white)
fd.text((256, 340), "AL", font=font(VAZIR_BOLD, 56), fill=PRIMARY, anchor="mm")
fav.save("/home/z/my-project/public/favicon-512.png", "PNG", optimize=True)
print("favicon-512.png saved")
