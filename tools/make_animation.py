import json, math, copy
src=r'D:\Download\football-studio.json'
d=json.load(open(src,encoding='utf-8'))
S=lambda u:u*u*(3-2*u)
def wp(t,pts):
    """smoothstep through waypoints [(t,value)...]"""
    if t<=pts[0][0]:return pts[0][1]
    if t>=pts[-1][0]:return pts[-1][1]
    for (t0,v0),(t1,v1) in zip(pts,pts[1:]):
        if t0<=t<=t1:
            u=S((t-t0)/(t1-t0));return v0+(v1-v0)*u
def mix(a,b,u):return a+(b-a)*u
yaw=lambda t:wp(t,[(0,0),(3.0,0),(3.6,90),(5.9,90),(6.35,0),(6.9,-90),(8.1,-90),(8.6,0),(10,0)])
hipx=lambda t:wp(t,[(0,300),(3.6,300),(3.6,300)])  # replaced below
def hipxf(t):
    if t<3.6:return 300
    if t<5.9:return 300+160*(t-3.6)/2.3
    if t<6.9:return 460
    if t<8.1:return 460-80*(t-6.9)/1.2
    return 380
# gait amplitude: walking right 3.6-5.9, walking left 6.9-8.1 (ramps 0.3s)
def amp(t):
    a=0
    for (s,e) in [(3.6,5.9),(6.9,8.1)]:
        a=max(a,min(S(min(1,max(0,(t-s)/.3))),S(min(1,max(0,(e-t)/.3)))))
    return a
def hipyf(t,A,phi):
    y=wp(t,[(0,360),(8.6,360),(8.95,402),(9.3,252),(9.72,400),(10,360)])
    return y-5*A*math.cos(phi)**2
def feet(t,A,phi):
    out={}
    for k,x,off in (('fL',-18,0),('fR',18,math.pi)):
        z=55*A*math.sin(phi+off); lift=28*A*max(0,math.cos(phi+off))
        y=228-lift; zz=z
        # jump: tuck legs in the air, extra crouch handled by IK/ground clamp
        j=wp(t,[(0,0),(9.0,0),(9.3,1),(9.65,0),(10,0)])
        y-= 70*j; zz+=22*j
        out[k]=[x,y,zz]
    return out
def arms(t,A,phi):
    sw=math.sin(phi)
    # arms swing like pendulums along the body (forward/back), the elbow bends more on the forward swing
    zR=(60 if sw>0 else 50)*A*sw; yR=math.sqrt(max(0,158**2-23**2-zR**2))-A*max(0,sw)*30
    zL=-(60 if -sw>0 else 50)*A*sw; yL=math.sqrt(max(0,158**2-23**2-zL**2))-A*max(0,-sw)*30
    hL=[-23,yL,zL]; hR=[23,yR,zR]
    # greeting wave with the right hand (0.4 - 3.2)
    w=wp(t,[(0.3,0),(1.3,1),(2.7,1),(3.3,0)])
    if w>0:
        osc=45+30*math.sin(2*math.pi*(t-1.3)/0.6)*min(1,w*1.0) if t>1.3 else 45
        up=[osc,-112,15]
        hR=[mix(hR[0],up[0],S(w)),mix(hR[1],up[1],S(w)),mix(hR[2],up[2],S(w))]
    # jump: wind-up back, swing up, down
    j1=wp(t,[(8.6,0),(8.95,1),(9.3,0),(10,0)])
    j2=wp(t,[(8.9,0),(9.3,1),(9.72,0),(10,0)])
    for side,arr in (('L',hL),('R',hR)):
        sx=-1 if side=='L' else 1
        arr[2]=mix(arr[2],-35,S(j1)) if j1>0 else arr[2]
        if j2>0:
            tgt=[sx*72,-92,10]
            for i in range(3):arr[i]=mix(arr[i],tgt[i],S(j2))
    return hL,hR
def ends(t,A,phi):
    """wrists: waving hand, trailing hands while walking, flared hands in the jump, tiny idle life. [bend, twist, roll]"""
    w=wp(t,[(0.3,0),(1.3,1),(2.7,1),(3.3,0)])
    ph=2*math.pi*(t-1.3)/0.6
    j2=wp(t,[(8.9,0),(9.3,1),(9.72,0),(10,0)])
    idle=3*math.sin(2*math.pi*0.7*t)
    # right hand
    bR=-8+idle+ 14*A*math.sin(phi)*(-1)
    tR=4*A*math.sin(phi+1)
    rR=0.0
    if w>0:
        bR=mix(bR,34*math.sin(ph+1.2),S(w)) if t>=1.3 else mix(bR,0,S(w))
        tR=mix(tR,26*math.sin(ph+0.2),S(w)) if t>=1.3 else tR
        rR=mix(rR,-35,S(w))
    bR+=22*j2;tR+=-18*j2
    # left hand
    bL=-8-idle+14*A*math.sin(phi)
    tL=-4*A*math.sin(phi+1)
    bL+=22*j2;tL+=18*j2
    return {'hL':[round(bL,2),round(tL,2),0],'hR':[round(bR,2),round(tR,2),round(rR,2)],'fL':[0,0,0],'fR':[0,0,0]}
poles={'hL':[-0.6,0,-1],'hR':[0.6,0,-1],'fL':[-0.35,0,1],'fR':[0.35,0,1]}
keys=[]
N=100
for i in range(N+1):
    t=i/10
    A=amp(t)
    # walking phase measured from the start of each walk
    start=3.6 if t<6.5 else 6.9
    phi=2*math.pi*(t-start)/1.2
    hL,hR=arms(t,A,phi);f=feet(t,A,phi)
    w=wp(t,[(0.3,0),(1.3,1),(2.7,1),(3.3,0)])
    keys.append({'t':round(t,2),'hip':[round(hipxf(t),2),round(hipyf(t,A,phi),2)],'type':0,'rotFine':round(4*A,2),'yaw':round(yaw(t),2),
      'limbs':{'hL':[round(v,2) for v in hL],'hR':[round(v,2) for v in hR],'fL':[round(v,2) for v in f['fL']],'fR':[round(v,2) for v in f['fR']]},
      'poles':copy.deepcopy(poles),'ends':ends(t,A,phi),'side':{'hL':'auto','hR':'auto'},
      'hyaw':round(8*w*math.sin(2*math.pi*(t-1.3)/1.2),2),'hrot':round(4*w,2),'expression':d.get('head',{}).get('expression','neutral'),'lin':True})
d['keys']=keys;d['dur']=10;d['loop']=True
k0=keys[0]
d['pose']={'type':0,'rotFine':0,'yaw':0,'hip':k0['hip'],'limbs':k0['limbs'],'poles':k0['poles'],'ends':k0['ends'],'armSide':{'hL':'auto','hR':'auto'}}
out=r'D:\Download\football-studio-haaland-animation.json'
json.dump(d,open(out,'w',encoding='utf-8'),ensure_ascii=False)
print('ok',len(keys),'keys')









