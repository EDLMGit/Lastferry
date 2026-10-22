export const waterVertexShader = `varying vec3 world;
void main(){
world=(modelMatrix*vec4(position,1.)).xyz;
gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
}`;

export const waterFragmentShader = `varying vec3 world;
uniform float time;
uniform float waterY;
uniform sampler2D coast;
uniform sampler2D substrate;
uniform vec4 field;
uniform vec2 heightRange;
uniform vec3 viewDirection;
uniform vec3 sunDirection;
uniform vec3 skyColor;
uniform vec3 sunColor;
uniform vec3 deepColor;
uniform vec3 shallowColor;
uniform vec3 pearlColor;
uniform vec3 amberColor;
uniform vec3 lampPosition;
uniform float arrival;
uniform float normalScale;
uniform float normalSpeed;
uniform float normalStrength;
uniform float sheenWidth;
uniform float sheenStrength;
uniform float depthStrength;
uniform float absorption;
uniform float shallowContrast;
uniform float distortion;
uniform float warmStrength;
uniform float warmWidth;
uniform float warmTail;
uniform vec2 sheenCenter;

vec4 bedAt(vec2 p){return texture2D(substrate,clamp((p-field.xy)/field.zw,0.,1.));}
float bedHeight(vec4 bed){return mix(heightRange.x,heightRange.y,bed.a);}
vec3 waveNormal(vec2 p){
p*=normalScale;
float t=time*normalSpeed;
float a=dot(p,vec2(1.23,.48))-t*.53;
float b=dot(p,vec2(-.66,2.18))+t*.37;
float c=dot(p,vec2(.95,5.2))-t*.23;
vec2 slope=cos(a)*vec2(1.23,.48)*.58+cos(b)*vec2(-.66,2.18)*.23+cos(c)*vec2(.95,5.2)*.045;
return normalize(vec3(-slope.x*normalStrength,1.,-slope.y*normalStrength));
}
void main(){
vec2 p=world.xz;
vec4 coastData=texture2D(coast,clamp((p-field.xy)/field.zw,0.,1.));
vec3 n=waveNormal(p);
vec3 v=normalize(viewDirection);
vec4 firstBed=bedAt(p);
float initialDepth=clamp(waterY-bedHeight(firstBed),0.,3.);
vec2 rayOffset=-v.xz/max(v.y,.25)*initialDepth*.68;
float contactFade=smoothstep(.025,.24,initialDepth);
vec2 bedPoint=p+rayOffset+n.xz*distortion*contactFade*min(initialDepth,.9);
vec4 bed=bedAt(bedPoint);
float depth=clamp(waterY-bedHeight(bed),0.,3.);
float thickness=depth/max(v.y,.3);
vec3 transmission=exp(-vec3(2.3,1.08,.72)*thickness*absorption);
float shallow=exp(-thickness*1.5);
vec3 waterBody=mix(deepColor,shallowColor,shallow*.62);
vec3 bedLight=bed.rgb*(.86+.16*max(dot(n,normalize(sunDirection)),0.));
float detail=(sin(bedPoint.x*4.1+sin(bedPoint.y*2.2))*.5+.5)*(sin(bedPoint.y*3.6-bedPoint.x*.7)*.5+.5);
bedLight*=1.+(detail-.4)*shallowContrast*.22;
float caustic=pow(max(0.,sin(dot(bedPoint,vec2(3.2,1.4))+time*.29)*sin(dot(bedPoint,vec2(-1.6,2.6))-time*.21)),7.);
bedLight+=sunColor*caustic*.025*exp(-thickness*3.)*smoothstep(.05,.3,depth);
vec3 color=waterBody*(1.-transmission*.68)+bedLight*transmission*depthStrength*.66;

vec3 reflected=reflect(-v,n);
vec3 brightSky=normalize(vec3(-.16,.79,-.59));
float cloudAngle=(1.-clamp(dot(reflected,brightSky),-1.,1.))*28.;
float cloud=exp(-cloudAngle*cloudAngle);
float horizon=pow(1.-max(reflected.y,0.),2.);
vec3 environment=mix(skyColor*.17,pearlColor*1.35,cloud);
environment+=sunColor*horizon*.075;
vec2 composed=p-sheenCenter;
composed.x+=composed.y*.36;
vec2 lightAxis=composed/vec2(sheenWidth*1.1,sheenWidth*.58);
float lightField=exp(-dot(lightAxis,lightAxis));
float fresnel=.023+.977*pow(1.-max(dot(n,v),0.),5.);
float connected=pow(clamp(dot(n,normalize(vec3(-.11,1.,-.12))),0.,1.),17.);
float sheen=lightField*cloud*(.22+connected*.78)*sheenStrength;
color=mix(color,environment,fresnel*.8);
float streak=.38+.62*smoothstep(-.025,.065,n.z);
color+=environment*sheen*streak*.2;

float lampHeight=max(.2,lampPosition.y-waterY);
vec2 lampCenter=lampPosition.xz+v.xz/max(v.y,.25)*lampHeight;
vec2 lightPoint=p-lampCenter+n.xz*lampHeight*.32;
vec2 lampAxis=normalize(v.xz+vec2(0.,.0001));
float lampAlong=dot(lightPoint,lampAxis);
float lampAcross=dot(lightPoint,vec2(lampAxis.y,-lampAxis.x));
float lampLength=mix(1.2,warmTail,smoothstep(-.3,.9,lampAlong));
float amber=exp(-lampAcross*lampAcross/warmWidth-lampAlong*lampAlong/lampLength);
float broken=.23+.77*smoothstep(-.48,.8,sin(p.y*7.4+p.x*.9-time*.37+sin(p.x*2.-time*.18)*.7));
color+=amberColor*amber*broken*warmStrength*(1.+arrival*.6);

float edge=coastData.g*smoothstep(.018,.11,initialDepth)*(1.-smoothstep(.11,.28,initialDepth));
float lap=.5+.5*sin(p.x*1.9+p.y*.8-time*.42);
color+=pearlColor*edge*lap*.012;
gl_FragColor=vec4(max(color,vec3(0.)),1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
