export function makeSceneKit(THREE, group) {
  let seed = 932487
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const range = (min, max) => min + (max - min) * random()
  const geometry = {
    box: new THREE.BoxGeometry(1, 1, 1),
    rock: new THREE.IcosahedronGeometry(1, 2),
    sphere: new THREE.SphereGeometry(1, 12, 8),
    seedHead: new THREE.IcosahedronGeometry(1, 0),
    pebble: new THREE.IcosahedronGeometry(1, 1),
    pole: new THREE.CylinderGeometry(.78, 1, 1, 8),
    disc: new THREE.CylinderGeometry(1, 1, 1, 32),
    pot: new THREE.CylinderGeometry(1, .66, 1, 12),
  }
  const rockPoints = geometry.rock.attributes.position
  for (let index = 0; index < rockPoints.count; index++) {
    const x = rockPoints.getX(index)
    const y = rockPoints.getY(index)
    const z = rockPoints.getZ(index)
    const surface = .89 + .14 * Math.cos(x * 6.1 + y * 2.6) + .076 * Math.sin(z * 7.3 - y * 4.7)
    rockPoints.setXYZ(index, x * surface + .18 * y, Math.max(y * surface, -.63), z * surface - .14 * x)
  }
  geometry.rock.computeVertexNormals()

  const texture = (kind, size = 128) => {
    const pixels = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const phase = x + Math.sin(y / size * Math.PI * 2) * 2 + Math.cos(y / size * Math.PI * 4) * .45
        let base = 178 + range(-25, 25)
        if (kind === 'wood') {
          const knot = Math.sin(x * .17 + y * .057) * Math.cos(y * .094)
          base += Math.cos(phase * 1.5 + knot * 1.7) * (6 + 4 * knot) + Math.sin(phase * .31 + knot) * 12
        }
        if (kind === 'stone') base += Math.sin(x * .14 + Math.cos(y * .19) * 1.6) * 16 + Math.cos(y * .19) * 11
        if (kind === 'soil') base += Math.cos(x * .29 + Math.sin(y * .44)) * 19 + range(-30, 30)
        if (kind === 'grass') base = 207 + range(-19, 18) + range(-8, 8)
        const offset = (x + y * size) * 4
        pixels[offset] = base
        pixels[offset + 1] = base
        pixels[offset + 2] = base
        pixels[offset + 3] = 255
      }
    }
    const map = new THREE.DataTexture(pixels, size, size)
    map.colorSpace = THREE.SRGBColorSpace
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.magFilter = THREE.LinearFilter
    map.minFilter = THREE.LinearMipmapLinearFilter
    map.generateMipmaps = true
    map.anisotropy = 4
    map.needsUpdate = true
    return map
  }

  const woodMap = texture('wood')
  const stoneMap = texture('stone')
  const soilMap = texture('soil')
  const grassMap = texture('grass', 256)
  const standard = (color, properties = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...properties })
  const materials = {
    frame: standard(0x535f42, { roughness: .46, metalness: .3 }),
    iron: standard(0x3c4436, { roughness: .46, metalness: .34 }),
    brass: standard(0xb69659, { roughness: .38, metalness: .52 }),
    wood: standard(0xd2a16a, { map: woodMap, bumpMap: woodMap, bumpScale: .011 }),
    endgrain: standard(0x9b714d, { map: stoneMap }),
    darkwood: standard(0x97704d, { map: woodMap, bumpMap: woodMap, bumpScale: .015 }),
    roof: standard(0x9b9283, { map: stoneMap, bumpMap: stoneMap, bumpScale: .08 }),
    stone: standard(0xd2c8b1, { map: stoneMap, bumpMap: stoneMap, bumpScale: .034 }),
    rock: standard(0xb3a58d, { map: stoneMap, bumpMap: stoneMap, bumpScale: .063 }),
    mortar: standard(0x887e6d, { map: soilMap }),
    mulch: standard(0x946c4b, { map: soilMap, bumpMap: soilMap, bumpScale: .08 }),
    clay: standard(0xb87751, { roughness: .84 }),
    bark: standard(0x88745d, { map: woodMap, bumpMap: woodMap, bumpScale: .15 }),
    green: standard(0xffffff, { roughness: .78, side: THREE.DoubleSide }),
    petals: standard(0xffffff, { roughness: .76, side: THREE.DoubleSide }),
    light: standard(0xfbe2a9, { emissive: 0xe6ac63, emissiveIntensity: .32 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xb9d1c8, roughness: .16, metalness: .13, clearcoat: .85,
      opacity: .22, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    }),
    oldGlass: new THREE.MeshPhysicalMaterial({
      color: 0xdbd7a1, roughness: .24, metalness: .16, clearcoat: .8,
      opacity: .34, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    }),
    proxy: new THREE.MeshBasicMaterial({ visible: false }),
  }

  // An angled wash across each pane catches the sky while the ironwork and interior stay legible.
  for (const glass of [materials.glass, materials.oldGlass]) {
    glass.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        'outgoingLight += vec3(0.30, 0.37, 0.42) * pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.0);\n#include <opaque_fragment>',
      )
    }
  }

  const batches = new Map()
  const scratch = new THREE.Object3D()
  const yAxis = new THREE.Vector3(0, 1, 0)
  const direction = new THREE.Vector3()
  const color = new THREE.Color()

  function place(shape, material, xyz, dimensions, rotation = [0, 0, 0], options = {}) {
    const model = new THREE.Mesh(typeof shape === 'string' ? geometry[shape] : shape,
      typeof material === 'string' ? materials[material] : material)
    model.position.fromArray(xyz)
    model.scale.fromArray(dimensions)
    model.rotation.fromArray(rotation)
    model.castShadow = options.shadow ?? !model.material.transparent
    model.receiveShadow = !model.material.transparent
    ;(options.parent ?? group).add(model)
    return model
  }

  function instance(shape, material, xyz, dimensions, rotation = [0, 0, 0], options = {}) {
    const parent = options.parent ?? group
    const modelGeometry = typeof shape === 'string' ? geometry[shape] : shape
    const modelMaterial = typeof material === 'string' ? materials[material] : material
    const shadow = options.shadow ?? true
    const key = [modelGeometry.uuid, modelMaterial.uuid, parent.uuid, shadow].join('|')
    if (!batches.has(key)) batches.set(key, { modelGeometry, modelMaterial, parent, shadow, entries: [] })
    scratch.position.fromArray(xyz)
    scratch.scale.fromArray(dimensions)
    if (rotation.isQuaternion) scratch.quaternion.copy(rotation)
    else scratch.rotation.fromArray(rotation)
    scratch.updateMatrix()
    batches.get(key).entries.push({ matrix: scratch.matrix.clone(), color: options.color })
  }

  function beam(a, b, width, depth, material, options = {}) {
    direction.set(b[0] - a[0], b[1] - a[1], b[2] - a[2])
    const length = direction.length()
    if (length < 1e-5) return
    const rotation = new THREE.Quaternion().setFromUnitVectors(yAxis, direction.normalize())
    const center = a.map((coordinate, index) => (coordinate + b[index]) * .5)
    instance(options.round ? 'pole' : 'box', material, center, [width, length, depth], rotation, options)
  }

  function flush() {
    for (const { modelGeometry, modelMaterial, parent, shadow, entries } of batches.values()) {
      const batch = new THREE.InstancedMesh(modelGeometry, modelMaterial, entries.length)
      batch.castShadow = shadow
      batch.receiveShadow = true
      entries.forEach((entry, index) => {
        batch.setMatrixAt(index, entry.matrix)
        if (entry.color !== undefined) batch.setColorAt(index, color.set(entry.color))
      })
      parent.add(batch)
    }
    batches.clear()
  }

  function faces(quads, material, parent = group) {
    const positions = []
    const uvs = []
    for (const quad of quads) {
      for (const index of [0, 1, 2, 0, 2, 3]) {
        positions.push(...quad[index])
        uvs.push(...[[0, 0], [1, 0], [1, 1], [0, 1]][index])
      }
    }
    const surface = new THREE.BufferGeometry()
    surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    surface.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    surface.computeVertexNormals()
    return place(surface, material, [0, 0, 0], [1, 1, 1], [0, 0, 0], { parent, shadow: false })
  }

  return { THREE, group, random, range, geometry, materials, standard, instance, place, beam, flush, faces, soilMap, grassMap }
}
