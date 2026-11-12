#!/usr/bin/env python3
"""Isolated five-second portrait-to-neural-brain V3 motion renderer.

Run:
  python scripts/render_neural_intro.py --portrait photo.png --reference holographic_brain.png --out neural.mp4
Dependencies: python -m pip install numpy opencv-python scipy
Requires FFmpeg (libx264 + AAC) on PATH. Changes no existing V1/V2/V3 engine files.

The photograph is never generatively reconstructed: the exact facial pixels
are resampled uniformly from the user's input and all brain animation sits
above the head. The natural/tech brain uses the provided reference image.
"""
import argparse
import math
import os
import subprocess
import tempfile
import wave
import cv2
import numpy as np
from scipy.signal import butter, sosfilt

FPS = 30
SIZE = 900
DURATION = 5
LABELS = ("Ps", "Ai", "Ae", "Pr", "CapCut", "Figma", "AI", "Blender", "Resolve")
COLORS = ((255,158,40),(47,170,255),(235,170,151),(245,115,183),
          (220,240,255),(130,255,166),(255,197,119),(45,170,255),(128,216,253))

def ease(a, b, t):
    p = min(1.0, max(0.0, (t-a)/(b-a)))
    return p*p*(3-2*p)

def place(frame, image, x, y, alpha):
    h,w = image.shape[:2]
    xa,ya,xb,yb = max(x,0),max(y,0),min(x+w,SIZE),min(y+h,SIZE)
    if xa >= xb or ya >= yb: return
    src = image[ya-y:yb-y,xa-x:xb-x].astype(np.float32)
    dst = frame[ya:yb,xa:xb].astype(np.float32)
    a = alpha[ya-y:yb-y,xa-x:xb-x,None].astype(np.float32)
    frame[ya:yb,xa:xb] = np.clip(dst*(1-a)+src*a,0,255).astype(np.uint8)

def sound_effects(out):
    sample_rate = 48000
    t = np.arange(sample_rate*DURATION)/sample_rate
    rng = np.random.default_rng(20261112)
    n = rng.normal(0,1,len(t))
    high = sosfilt(butter(3,1400,fs=sample_rate,btype="high",output="sos"),n)
    low = sosfilt(butter(3,270,fs=sample_rate,btype="low",output="sos"),n)
    def gate(start,end):
        return np.clip((t-start)/.15,0,1)*np.clip((end-t)/.22,0,1)
    audio = .020*high*gate(.8,2.7)+.028*low*gate(1.6,3.5)
    for start,freq in ((.65,520),(1.30,700),(2.05,910),(2.85,1400),(3.6,1750),(4.62,98)):
        v = t-start
        env = np.where(v>=0,np.exp(-np.maximum(v,0)*(10 if freq>200 else 6)),0)
        audio += env*.08*np.sin(2*np.pi*(freq*v-120*v*v))
    with wave.open(out,"wb") as audio_file:
        audio_file.setnchannels(1);audio_file.setsampwidth(2)
        audio_file.setframerate(sample_rate)
        audio_file.writeframes((np.clip(audio,-.95,.95)*32767).astype("<i2").tobytes())

def render(portrait, reference, destination):
    photo = cv2.imread(portrait,cv2.IMREAD_COLOR)
    ref = cv2.imread(reference,cv2.IMREAD_COLOR)
    if photo is None or ref is None:
        raise ValueError("A fotografia e a referência devem ser imagens válidas.")
    canvas = np.full((SIZE,SIZE,3),(21,13,10),np.uint8)
    scale = 742
    photo = cv2.resize(photo,(scale,scale),interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(photo,cv2.COLOR_BGR2HSV)
    background = np.full_like(photo,(24,12,8))
    green = ((hsv[:,:,0]>32)&(hsv[:,:,0]<101)&(hsv[:,:,1]>35)&(hsv[:,:,2]<165)).astype(np.float32)
    fade = cv2.GaussianBlur(green,(0,0),3)
    fg = photo.astype(np.float32)*(1-fade[:,:,None])+background.astype(np.float32)*fade[:,:,None]
    edge = np.minimum.reduce(np.broadcast_arrays(
      np.arange(scale)[:,None], np.arange(scale)[::-1][:,None],
      np.arange(scale)[None,:], np.arange(scale)[::-1][None,:])).astype(np.float32)
    edge = np.clip(edge/32,0,1)[:,:,None]
    left,top = (SIZE-scale)//2,145
    canvas[top:top+scale,left:left+scale] = np.clip(fg*edge+background*(1-edge),0,255).astype(np.uint8)
    crown = top+int(90*scale/1024)

    # Reference crop is designed for the user's accompanying visual.
    # Coordinates are proportional so any same-composition resolution works.
    h,w = ref.shape[:2]
    brain = ref[int(h*.025):int(h*.247),int(w*.339):int(w*.689)]
    brain = cv2.resize(brain,(390,250),interpolation=cv2.INTER_AREA)
    mask = np.zeros((250,390),np.uint8)
    cv2.ellipse(mask,(194,132),(182,115),0,0,360,255,-1)
    mask = cv2.GaussianBlur(mask,(31,31),8).astype(np.float32)/255
    luminance = cv2.cvtColor(brain,cv2.COLOR_BGR2GRAY)/255
    natural = np.stack((72+80*luminance,105+80*luminance,140+105*luminance),axis=2).astype(np.uint8)
    particles = []
    rng = np.random.default_rng(4512)
    for _ in range(230):
        particles.append((rng.uniform(0,2*math.pi),rng.uniform(20,185),
                          rng.uniform(-1,1),rng.uniform(1,3)))

    with tempfile.TemporaryDirectory() as temp:
        soundtrack = os.path.join(temp,"effects.wav")
        sound_effects(soundtrack)
        command = ["ffmpeg","-hide_banner","-loglevel","error","-y",
            "-f","rawvideo","-pix_fmt","bgr24","-s",f"{SIZE}x{SIZE}",
            "-r",str(FPS),"-i","-","-i",soundtrack,
            "-t",str(DURATION),"-c:v","libx264","-preset","veryfast",
            "-crf","18","-pix_fmt","yuv420p","-movflags","+faststart",
            "-c:a","aac","-b:a","192k",destination]
        proc = subprocess.Popen(command,stdin=subprocess.PIPE)
        yy,xx = np.ogrid[:SIZE,:SIZE]
        side_light = np.maximum(np.exp(-(((xx+55)/225)**2+((yy-480)/640)**2)*2),
                                np.exp(-(((xx-955)/225)**2+((yy-480)/640)**2)*2))
        for index in range(FPS*DURATION):
            t=index/FPS
            frame=canvas.copy()
            flicker=.58+.42*math.sin(2*math.pi*.9*t)**2
            blue=(side_light*66*flicker).astype(np.uint8)
            light=np.zeros_like(frame)
            light[:,:,0]=blue;light[:,:,1]=(blue*.40).astype(np.uint8)
            frame=cv2.add(frame,light)
            for j in range(11):
                cy=int(38+j*84+math.sin(t*.8+j)*4)
                cv2.line(frame,(0,cy),(SIZE,cy),(31,20,14),1,cv2.LINE_AA)
            for j in range(16):
                px=int((j*117+t*34)%1050)-80
                cv2.line(frame,(px,12),(px-75,170),(54,33,15),1,cv2.LINE_AA)
            opened=ease(.55,1.32,t)
            if opened:
                cy=crown-5
                cv2.ellipse(frame,(450,cy),(int(85+75*opened),int(8+14*opened)),
                            0,0,360,(int(150*opened),int(85*opened),int(35*opened)),2,cv2.LINE_AA)
                for side in (-1,1):
                    bx=int(450+side*(32+100*opened))
                    cv2.line(frame,(bx,cy-4),(bx+side*int(65*opened),
                       cy-int(70*opened)),(230,156,74),2,cv2.LINE_AA)
            organic=ease(.75,1.34,t)*(1-ease(1.7,2.65,t))
            tech=ease(2.65,3.92,t)
            if organic:
                place(frame,natural,255,int(40+42*(1-ease(1,1.8,t))),mask*organic*.92)
            if tech:
                halo=cv2.GaussianBlur(mask,(0,0),18)*tech*.5
                halo_image=np.full_like(brain,(247,112,20))
                place(frame,halo_image,255,40,halo)
                place(frame,brain,255,40,mask*tech)
            intensity=ease(1.65,2,t)*(1-ease(3.85,4.45,t))
            if intensity>.02:
                expansion=math.sin(math.pi*ease(1.6,4.1,t))
                for a,r,z,size in particles:
                    px=int(450+math.cos(a+t*(.9+z))*(34+r*expansion))
                    py=int(165+math.sin(a+t*(1.2-z))*(17+r*.62*expansion))
                    radius=max(1,int(size*(.8+.8*expansion)))
                    value=int(110+120*intensity)
                    cv2.circle(frame,(px,py),radius,(value,int(value*.65),
                        int(value*.13)),-1,cv2.LINE_AA)
            appear=ease(2.45,3.65,t)
            if appear:
                for i,title in enumerate(LABELS):
                    phase=2*math.pi*i/len(LABELS)+t*.28
                    px=int(450+math.cos(phase)*(255+24*math.sin(t*.55+i)))
                    py=min(250,int(156+math.sin(phase)*84+math.cos(t*1.3+i)*7))
                    size=.65+.35*(math.sin(phase)+1)/2
                    bw=int((65 if len(title)<=5 else 86)*size);bh=int(35*size)
                    x,y=px-bw//2,py-bh//2
                    overlay=frame.copy()
                    cv2.rectangle(overlay,(x,y),(x+bw,y+bh),(36,23,14),-1)
                    cv2.addWeighted(overlay,1-appear*.72,frame,appear*.72,0,frame)
                    col=COLORS[i]
                    cv2.rectangle(frame,(x,y),(x+bw,y+bh),col,1,cv2.LINE_AA)
                    font=.48 if len(title)<=3 else .29
                    (tw,th),_=cv2.getTextSize(title,cv2.FONT_HERSHEY_SIMPLEX,font,1)
                    cv2.putText(frame,title,(px-tw//2,py+th//2),
                                cv2.FONT_HERSHEY_SIMPLEX,font,col,1,cv2.LINE_AA)
            orbital=ease(.35,1.1,t)
            if orbital:
                for i in range(3):
                    cv2.ellipse(frame,(450,int(179+7*math.sin(t+i))),
                        (185+i*23,37+i*13),int((t*(15+i*6)+i*47)%360),
                        int(t*96+i*50),int(t*96+i*50+190),
                        (int(160*orbital),int(112*orbital),int(42*orbital)),1,cv2.LINE_AA)
            if t>3:
                amplitude=ease(3,3.85,t)
                for i in range(4):
                    rad=int(9+(i+1)*5+3*math.sin(t*3+i))
                    cv2.circle(frame,(450,159),rad,(int(215*amplitude),
                        int(150*amplitude),int(65*amplitude)),1,cv2.LINE_AA)
                cv2.rectangle(frame,(431,140),(469,178),(210,145,68),2,cv2.LINE_AA)
            cv2.line(frame,(65,837),(835,837),(56,39,28),2,cv2.LINE_AA)
            cv2.line(frame,(65,837),(65+int(770*t/5),837),(224,158,65),3,cv2.LINE_AA)
            if t>4.55:
                pulse=ease(4.55,4.95,t)
                cv2.circle(frame,(450,159),int(110+120*pulse),
                           (255,175,95),3,cv2.LINE_AA)
            proc.stdin.write(frame.tobytes())
        proc.stdin.close()
        if proc.wait()!=0: raise RuntimeError("FFmpeg failed to encode MP4.")
    print(f"Created: {destination} (5 seconds, 900x900, 30fps, H.264/AAC)")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--portrait",required=True)
    parser.add_argument("--reference",required=True)
    parser.add_argument("--out",default="neural-intro.mp4")
    opts=parser.parse_args()
    render(opts.portrait,opts.reference,opts.out)
