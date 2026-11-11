import * as THREE from "three";
/** Actual EK monogram from kutuzovportfolio333/src/components/logo-paths.ts */
export const EK_POLYGONS = [
  [[0,145],[145,0],[925,0],[743,182],[235,182],[235,318],[715,318],[538,497],[235,497],[235,632],[743,632],[925,815],[145,815],[0,670],[0,548],[143,408],[0,265]],
  [[1192,0],[1715,0],[1497,220],[1278,220],[1115,382],[1548,815],[1225,815],[812,382]],
  [[1713,608],[1920,608],[1920,815],[1713,815]]
];
export function makeOfficialMark() {
  const group = new THREE.Group();
  const shapes = EK_POLYGONS.map(poly => {
    const s = new THREE.Shape();
    poly.forEach(([x,y],i) => i===0 ? s.moveTo((x-960)/400,-(y-407.5)/400) : s.lineTo((x-960)/400,-(y-407.5)/400));
    s.closePath(); return s;
  });
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth:.48, bevelEnabled:true, bevelThickness:.04, bevelSize:.023,
    bevelSegments:3, curveSegments:2, steps:1
  });
  geo.center();
  const metal = new THREE.MeshStandardMaterial({
    color:0xcbdcf0, metalness:.68, roughness:.19,
    emissive:0x07152d, emissiveIntensity:.14
  });
  group.add(new THREE.Mesh(geo,metal));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo,29),
    new THREE.LineBasicMaterial({color:0x8cc8ff,transparent:true,opacity:.26}));
  edges.scale.setScalar(1.005); group.add(edges);
  group.add(new THREE.AmbientLight(0x94add0,1.9));
  const key=new THREE.PointLight(0xffffff,46,18);key.position.set(-2.9,3.5,4.5);
  const rim=new THREE.PointLight(0x2465ff,46,18);rim.position.set(3.7,-1.2,2);
  group.add(key,rim);group.userData={key,rim};
  return group;
}

