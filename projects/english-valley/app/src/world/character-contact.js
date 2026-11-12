import * as THREE from 'three';
const down=new THREE.Vector3(0,-1,0);
// Solve in torso space, so the same authored target works after scale/rotation.
// Bone lengths are never modified; unreachable targets are explicitly reported.
export function reachArm(actor,index,worldTarget){
  if(!worldTarget.toArray().every(Number.isFinite))throw Error('A contact target must be finite.');
  const arm=actor.arms[index],elbow=actor.elbows[index],palm=actor.palms[index];
  actor.group.updateWorldMatrix(true,true);
  const target=actor.torso.worldToLocal(worldTarget.clone()),shoulder=arm.position.clone(),delta=target.clone().sub(shoulder);
  const l1=elbow.position.length(),l2=palm.position.length(),distance=delta.length(),d=THREE.MathUtils.clamp(distance,Math.abs(l1-l2)+.0001,l1+l2-.0001),axis=distance>.00001?delta.divideScalar(distance):new THREE.Vector3(0,0,1);
  const pole=new THREE.Vector3(index===0?-.65:.65,.80,.18).sub(shoulder);pole.addScaledVector(axis,-pole.dot(axis));if(pole.lengthSq()<1e-8)pole.set(0,0,1).addScaledVector(axis,-axis.z);pole.normalize();
  const along=(l1*l1-l2*l2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,l1*l1-along*along));
  const joint=shoulder.clone().addScaledVector(axis,along).addScaledVector(pole,bend),end=shoulder.clone().addScaledVector(axis,d);
  arm.quaternion.setFromUnitVectors(down,joint.clone().sub(shoulder).normalize());
  const lowerDirection=end.clone().sub(joint).normalize().applyQuaternion(arm.quaternion.clone().invert());
  elbow.quaternion.setFromUnitVectors(palm.position.clone().normalize(),lowerDirection);
  actor.group.updateWorldMatrix(true,true);const error=palm.getWorldPosition(new THREE.Vector3()).distanceTo(worldTarget);
  return {reached:error<.005,error,distance,reach:l1+l2};
}
