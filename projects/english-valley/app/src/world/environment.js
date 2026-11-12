import { makeSceneKit } from './materials.js'
import { gardenPlanting } from './vegetation.js'
import { createStoryBoards } from './story-boards.js'

const TAU = Math.PI * 2
const between = (a, b, t) => a + (b - a) * t
const smooth = t => {
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u)
}
const tent = (x, z, cx, cz, rx, rz) => Math.exp(-(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2))
const streamShape = [
  [-90, 46, 3.1], [-38, 32, 2.8], [-14, 28, 2.2], [2, 23, 2.2],
  [10, 24, 1.9], [18, 22.7, 2.5], [25, 21, 2.8], [32, 17.1, 5.7],
  [40, 18, 3.7], [50, 20.8, 2.5], [90, 40, 3],
]
function streamAt(z) {
  const index = streamShape.findIndex(([end]) => z < end)
  if (index < 0) return streamShape.at(-1).slice(1)
  const a = streamShape[Math.max(0, index - 1)] ?? streamShape[0]
  const b = streamShape[index] ?? streamShape.at(-1)
  const t = a === b ? 0 : smooth((z - a[0]) / (b[0] - a[0]))
  return [between(a[1], b[1], t) + .17 * Math.sin(z * .58), between(a[2], b[2], t) + .17 * Math.sin(z * 1.28)]
}
const waterHeight = z => .19 - z * .012
const bridgeHeight = x => .54 + .63 * Math.sin(Math.PI * (x - 17) / 8)
const channelX = z => between(28, 22.7, smooth((z - 12) / 6))

function groundHeight(x, z) {
  const [center, width] = streamAt(z)
  const distance = Math.abs(x - center)
  let land = .55 + .25 * Math.sin(x * .15 - z * .11) + .17 * Math.sin(z * .19) +
    .09 * Math.cos(x * .46 + z * .29) + .05 * Math.sin(x * 1.1 - z * .61)
  land += 2.8 * tent(x, z, -30, -16, 14, 19)
  land += 1.1 * tent(x, z, 32, 2, 8, 11)
  land += 5 * tent(x, z, 56, -19, 14, 40) + 4 * tent(x, z, -55, -9, 18, 24)
  land += 16 * tent(x, z, -50, -65, 24, 21) + 10 * tent(x, z, -16, -76, 15, 16)
  land += 19 * tent(x, z, 12, -80, 34, 16) + 16 * tent(x, z, 52, -64, 30, 17)
  land += 2.7 * tent(x, z, -12, -19, 13, 10)
  const greenhouse = 1 - smooth(Math.max(Math.abs(x) - 12.7, Math.abs(z - 1) - 11) / 3.8)
  land = between(land, .24, greenhouse)
  land = between(land, .42, tent(x, z, -18, 9, 5.4, 4.2))
  land = between(land, .47, tent(x, z, 21, 25, 5, 1.5))
  if (z >= 11.8 && z <= 18.2) {
    const groove = Math.exp(-(((x - channelX(z)) / .57) ** 2))
    land = between(land, between(.41, waterHeight(z) - .04, smooth((z - 12) / 6)), groove * .92)
  }
  return between(waterHeight(z) - .92, land, smooth((distance - width + .53) / 1.18))
}

function buildGround(kit) {
  const { THREE, place, standard, grassMap } = kit
  const palette = [0x5c7238, 0x8c9854, 0xa9aa6d, 0x76654c].map(hex => new THREE.Color(hex))
  const color = new THREE.Color()
  const distantGreen = new THREE.Color(0x607255)
  grassMap.repeat.set(37, 39)
  const groundMat = standard(0xffffff, { vertexColors: true, map: grassMap })
  const surface = new THREE.PlaneGeometry(156, 179, 240, 264)
  surface.rotateX(-Math.PI / 2)
  surface.translate(0, 0, -12)
  const vertices = surface.attributes.position
  const colors = []
  for (let index = 0; index < vertices.count; index++) {
    const x = vertices.getX(index)
    const z = vertices.getZ(index)
    const y = groundHeight(x, z)
    vertices.setY(index, y)
    const [center, width] = streamAt(z)
    const hue = .48 + .19 * Math.cos(x * .44 + z * .29 + Math.sin(z * .18) * 1.9) +
      .15 * Math.sin(z * .75 - x * .31 + Math.sin(x * .53) * 1.8) + .1 * Math.cos(x * 2.15 - z * 1.92)
    color.copy(palette[0]).lerp(palette[1], hue).lerp(palette[2], smooth((z - 19) / 30) * .27)
    color.lerp(palette[3], 1 - smooth((Math.abs(x - center) - width + .04) / 1.42))
    if (z < -38) color.lerp(distantGreen, smooth((-z - 38) / 40) * .66)
    colors.push(color.r, color.g, color.b)
  }
  surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  surface.computeVertexNormals()
  place(surface, groundMat, [0, 0, 0], [1, 1, 1], [0, 0, 0], { shadow: false })

  // Additional ridge profiles overlap beyond the near terrain and dissolve into the distance fog.
  for (let row = 0; row < 3; row++) {
    const ridge = new THREE.PlaneGeometry(300, 85, 81, 15)
    ridge.rotateX(-Math.PI / 2)
    const points = ridge.attributes.position
    for (let index = 0; index < points.count; index++) {
      const x = points.getX(index)
      const z = points.getZ(index)
      const outline = 12 + row * 6 + 8 * Math.sin(x * .028 + row * 1.5) + 4 * Math.cos(x * .059 - row)
      points.setY(index, -2 + outline * Math.exp(-(((z + 3) / 19) ** 2)) + 1.5 * Math.sin(x * .18 + z * .12))
    }
    ridge.computeVertexNormals()
    place(ridge, standard([0x697c61, 0x7b8b7a, 0x82928b][row]), [0, 0, -102 - 31 * row], [1, 1, 1], [0, 0, 0], { shadow: false })
  }
}

function buildConservatory(kit, planting) {
  const { THREE, group, range, instance, place, beam, faces } = kit
  const hall = new THREE.Group()
  hall.name = 'obj.greenhouse.main'
  group.add(hall)
  const body = (shape, material, xyz, size, rotation, options) => instance(shape, material, xyz, size, rotation, { ...options, parent: hall })
  const iron = (a, b, width = .088) => beam(a, b, width, width, 'frame', { parent: hall })
  const glass = []
  const olderGlass = []
  const masonry = [0x9c8f73, 0xe3d8bf, 0xc2b395, 0xd5c6a7, 0xa99f8a]
  const stone = (xyz, size, index) => body('box', 'stone', xyz, size, [0, 0, 0], { color: masonry[index % masonry.length] })
  const y = .24
  const eaves = y + 3.62
  const arch = (t, z) => [7.05 * Math.cos(t), eaves + 5.02 * Math.sin(t), z]
  const bays = Array.from({ length: 11 }, (_, index) => -8 + index * 1.6)
  const roofSteps = 20
  for (let bay = 0; bay < bays.length; bay++) {
    for (let index = 0; index < roofSteps; index++) {
      const a = Math.PI * index / roofSteps
      const b = Math.PI * (index + 1) / roofSteps
      const p = arch(a, bays[bay])
      const q = arch(b, bays[bay])
      iron(p, q, bay % 2 === 0 ? .115 : .062)
      if (bay > 0) {
        const previous = arch(a, bays[bay - 1])
        const previousB = arch(b, bays[bay - 1])
        iron(p, previous, index % 4 === 0 ? .085 : .045)
        const panes = (bay * 11 + index * 17) % 29 === 0 ? olderGlass : glass
        panes.push([previous, previousB, q, p])
      }
    }
    for (const x of [-7.05, 7.05]) {
      iron([x, y + .43, bays[bay]], [x, eaves, bays[bay]], .12)
      if (bay === 0) continue
      const heights = [y + .46, y + 1.32, y + 2.6, eaves]
      for (let row = 1; row < heights.length; row++) {
        const top = heights[row]
        const bottom = heights[row - 1]
        iron([x, bottom, bays[bay - 1]], [x, bottom, bays[bay]], .064)
        glass.push([[x, bottom, bays[bay - 1]], [x, bottom, bays[bay]], [x, top, bays[bay]], [x, top, bays[bay - 1]]])
      }
    }
  }
  for (const z of [-8, 8]) {
    for (let i = 0; i < roofSteps; i++) {
      const a = arch(Math.PI * i / roofSteps, z)
      const b = arch(Math.PI * (i + 1) / roofSteps, z)
      const base = z === 8 && Math.abs(a[0]) < 1.6 ? y + 2.52 : y + .45
      const footA = [a[0], base, z]
      const footB = [b[0], base, z]
      iron(footA, a, i % 2 ? .048 : .086)
      for (const barY of [y + 1.35, y + 2.57, eaves]) {
        if (base < barY) iron([a[0], barY, z], [b[0], barY, z], .052)
      }
      glass.push([footA, footB, b, a])
    }
  }
  for (const x of [-7.05, 7.05]) {
    for (const row of [0, 1, 2]) for (let i = 0; i < 29; i++) {
      stone([x, y + .08 + row * .16, -7.85 + i * .56 + (row % 2 ? .13 : 0)], [.25, .152, .545], i + row)
    }
    beam([x, eaves + .008, -8.13], [x, eaves + .008, 8.13], .16, .15, 'iron', { parent: hall })
    beam([x, y + .39, 7.73], [x, eaves, 7.73], .086, .086, 'iron', { round: true, parent: hall })
  }
  for (const z of [-8, 8]) {
    for (let i = -12; i <= 12; i++) for (const row of [0, 1, 2]) {
      if (z > 0 && Math.abs(i) <= 2) continue
      stone([i * .55 + (row % 2 ? .11 : 0), y + .08 + row * .16, z], [.534, .152, .26], i + 13 + row)
    }
  }
  body('box', 'mortar', [0, y - .033, 0], [14.23, .12, 16.2])
  for (let ix = -9; ix <= 9; ix++) for (let iz = -10; iz <= 10; iz++) {
    stone([ix * .714, y + .028 + range(-.01, .008), iz * .728], [.697, .065, .704], Math.abs(ix * 3 + iz * 7))
  }

  for (const sign of [-1, 1]) {
    const inner = 7 * sign
    const edge = 12.85 * sign
    const ridge = (inner + edge) / 2
    const lower = y + 2.84
    const higher = y + 4.46
    for (const z of [-6.9, -5.3, -3.7, -2.1, -.5, 1.1, 2.7, 4.3, 5.9]) {
      iron([inner, lower, z], [ridge, higher, z])
      iron([ridge, higher, z], [edge, lower, z])
      iron([edge, y + .37, z], [edge, lower, z])
      if (z <= -6.8) continue
      const prev = z - 1.6
      for (const [a, ah, b, bh] of [[inner, lower, ridge, higher], [ridge, higher, edge, lower]]) {
        glass.push([[a, ah, prev], [b, bh, prev], [b, bh, z], [a, ah, z]])
        const middleX = (a + b) / 2
        const middleY = (ah + bh) / 2
        iron([middleX, middleY, prev], [middleX, middleY, z], .047)
      }
      iron([ridge, higher, prev], [ridge, higher, z])
      iron([edge, lower, prev], [edge, lower, z])
      iron([edge, y + 1.25, prev], [edge, y + 1.25, z], .047)
      glass.push([[edge, y + .37, prev], [edge, lower, prev], [edge, lower, z], [edge, y + .37, z]])
    }
    for (const z of [-6.9, 5.9]) {
      for (let i = 0; i < 8; i++) {
        const p = i / 8
        const q = (i + 1) / 8
        const a = [between(inner, edge, p), lower + (higher - lower) * (1 - Math.abs(p * 2 - 1)), z]
        const b = [between(inner, edge, q), lower + (higher - lower) * (1 - Math.abs(q * 2 - 1)), z]
        const baseA = [a[0], y + .39, z]
        const baseB = [b[0], y + .39, z]
        iron(baseA, a, .064)
        iron([a[0], y + 1.23, z], [b[0], y + 1.23, z], .05)
        glass.push([baseA, baseB, b, a])
      }
      for (let i = 0; i < 12; i++) stone([between(inner, edge, (i + .5) / 12), y + .22, z], [.48, .44, .24], i)
    }
    for (let i = 0; i < 23; i++) stone([edge, y + .22, -6.64 + i * .56], [.26, .44, .54], i)
    body('box', 'mortar', [(edge + inner) / 2, y - .026, -.5], [5.84, .12, 12.9])
  }

  const radius = 2.35
  const centerZ = 9.55
  const domeBase = y + 3.15
  const dome = (theta, lift) => [Math.cos(theta) * radius * Math.cos(lift),
    domeBase + Math.sin(lift) * 2.06, centerZ + Math.sin(theta) * radius * Math.cos(lift)]
  const vestibuleSides = 20
  for (let i = 0; i < vestibuleSides; i++) {
    const a = TAU * i / vestibuleSides
    const b = TAU * (i + 1) / vestibuleSides
    const p = dome(a, 0)
    const q = dome(b, 0)
    const footA = [p[0], y + .30, p[2]]
    const footB = [q[0], y + .30, q[2]]
    const isDoor = i === 4 || i === 5
    iron(footA, p, isDoor ? .128 : .086)
    iron(p, q, .123)
    if (!isDoor && !(p[2] < 8.12 && q[2] < 8.12)) {
      beam(footA, footB, .24, .22, 'stone', { parent: hall })
      glass.push([footA, footB, q, p])
      iron([p[0], y + 1.31, p[2]], [q[0], y + 1.31, q[2]], .064)
    }
    for (let row = 0; row < 6; row++) {
      const lower = Math.PI / 2 * row / 6
      const upper = Math.PI / 2 * (row + 1) / 6
      const u = dome(a, lower)
      const v = dome(a, upper)
      const w = dome(b, upper)
      const s = dome(b, lower)
      iron(u, v, .069)
      iron(v, w, .047)
      glass.push([u, s, w, v])
    }
  }
  for (const sign of [-1, 1]) {
    const x = sign * .36
    iron([sign * .72, y + .27, 11.77], [sign * .72, y + 2.59, 11.77], .12)
    iron([x - .31, y + 2.55, 11.79], [x + .31, y + 2.55, 11.79], .075)
    body('box', 'brass', [sign * .12, y + 1.18, 11.84], [.045, .19, .045])
  }
  for (let step = 0; step < 3; step++) {
    body('disc', 'stone', [0, y + .027 + step * .088, centerZ], [2.65 - step * .13, .09, 2.65 - step * .13])
  }
  body('sphere', 'brass', [0, domeBase + 2.17, centerZ], [.15, .18, .15])
  body('sphere', 'frame', [0, domeBase + 2.32, centerZ], [.077, .15, .077])
  faces(glass, 'glass', hall)
  faces(olderGlass, 'oldGlass', hall)

  for (const x of [-10.45, -4.85, -2.6, 2.6, 4.85, 10.45]) {
    for (const z of [-5.2, -1.58, 2.04, 5.22]) {
      body('box', 'darkwood', [x, y + .38, z], [1.24, .69, 2.46])
      body('box', 'mulch', [x, y + .733, z], [1.15, .067, 2.34])
      for (const sign of [-1, 1]) body('box', 'wood', [x + sign * .62, y + .74, z], [.09, .12, 2.52])
      for (let n = 0; n < 24; n++) planting.flower(x + range(-.52, .52), y + .78, z + range(-1.12, 1.12), range(.28, .73))
    }
  }
  for (const x of [-2.44, 2.44, -6.73, 6.73]) {
    const z = Math.abs(x) < 3 ? 11.43 : 8.45
    body('pot', 'clay', [x, y + .31, z], [.54, .58, .54])
    body('disc', 'mulch', [x, y + .608, z], [.48, .031, .48])
    for (let i = 0; i < 21; i++) planting.flower(x + range(-.31, .31), y + .63, z + range(-.31, .31), range(.25, .63))
  }
  for (const z of [-5.5, -.5, 4.5]) for (const x of [-3.5, 3.5]) {
    beam([x, y + 5.5, z], [x, y + 2.98, z], .024, .024, 'iron', { parent: hall })
    body('disc', 'iron', [x, y + 2.98, z], [.26, .06, .26])
    body('sphere', 'light', [x, y + 2.91, z], [.142, .11, .142], [0, 0, 0], { shadow: false })
  }
  return hall
}

function buildBridge(kit) {
  const { THREE, group, range, instance, beam } = kit
  const bridge = new THREE.Group()
  bridge.name = 'obj.bridge.main'
  group.add(bridge)
  const plank = (shape, material, xyz, size, rotation, color) => instance(shape, material, xyz, size, rotation, { parent: bridge, color })
  const timber = (a, b, width, depth, material = 'wood') => beam(a, b, width, depth, material, { parent: bridge })
  const woodTints = [0xf3e3c2, 0xbfa27d, 0xe7cfa9, 0xdbc19a, 0xe4d8b9]
  for (let i = 0; i < 38; i++) {
    const x = 17.02 + i * .216
    const y = bridgeHeight(x)
    const angle = Math.atan2(bridgeHeight(x + .02) - y, .02)
    plank('box', 'wood', [x, y - .064, 25], [.204, .128, 2.33], [0, 0, angle], woodTints[i % woodTints.length])
    for (const z of [24.06, 25.94]) plank('pole', 'iron', [x + range(-.015, .015), y + .007, z], [.019, .014, .019], [0, 0, 0])
    if (i > 0) {
      const previousX = x - .216
      const previousY = bridgeHeight(previousX)
      for (const z of [24.03, 25.97]) {
        timber([previousX, previousY - .22, z], [x, y - .22, z], .24, .26, 'darkwood')
        timber([previousX, previousY + .99, z], [x, y + .99, z], .138, .17)
        timber([previousX, previousY + .45, z], [x, y + .45, z], .065, .09, 'darkwood')
      }
    }
  }
  for (const z of [24.03, 25.97]) {
    for (let i = 0; i <= 8; i++) {
      const x = 17 + i
      const y = bridgeHeight(x)
      const width = i === 0 || i === 8 ? .21 : .13
      plank('box', 'wood', [x, y + .47, z], [width, 1.09, width], [0, 0, 0])
      plank('disc', 'iron', [x, y + .09, z], [width * .72, .041, width * .72], [0, 0, 0])
      plank('sphere', 'brass', [x, y + 1.047, z], [width * .55, .074, width * .55], [0, 0, 0])
      if (i < 8) timber([x + .08, y + .18, z], [x + .94, bridgeHeight(x + 1) + .89, z], .075, .075)
    }
  }
  for (const x of [17.08, 24.92]) for (let i = 0; i < 7; i++) {
    const z = 24 + i * .335
    plank('box', 'stone', [x, .29, z], [.69, .43, .315], [0, range(-.05, .05), 0], woodTints[i % woodTints.length])
  }
  return bridge
}

function buildGarden(kit, planting) {
  const { THREE, instance, beam, range, random } = kit
  const pathPalette = [0xd7c6a2, 0xbdb098, 0xafa68d, 0xc8b597, 0xe1cbb0, 0xc7c0ab, 0x9c947f]
  const stoneTint = () => pathPalette[Math.floor(range(0, pathPalette.length))]
  const trailRoutes = [
    [[[0, 11.9], [-.3, 12.8], [.1, 14.2]], 2.6],
    [[[-6, 18.5], [-9.5, 16.2], [-12.7, 13.9], [-17.7, 12], [-21.5, 10.2], [-20.8, 1.4], [-18, -6], [-15.2, -9.9]], 2.15],
    [[[6, 19.6], [9.1, 20.2], [12.1, 22.3], [15, 24.8], [17, 25]], 2.2],
    [[[25, 25], [26.8, 23.9], [27.8, 20.4], [29.2, 17.5], [30.4, 13.2], [28.7, 9], [26.7, 5], [25.7, 2.4]], 1.3],
    [[[2, 25.5], [4.6, 28.5], [6.8, 32.8], [7.2, 37.4], [7, 41], [7.3, 50]], 2.42],
    [[[-5, 23.2], [-10, 25.8], [-12.5, 29.1], [-12.9, 33.3], [-10, 36.2], [-3, 36.8], [6.9, 37]], 1.78],
    [[[3.3, 15.1], [7.2, 13.2], [11.1, 13.5], [12.9, 17.3], [10.7, 20.6]], 1.65],
  ]
  const walks = trailRoutes.map(([points, width]) => ({
    curve: new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z))),
    width,
  }))
  const ring = new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, index) => {
    const angle = index * TAU / 24
    return new THREE.Vector3(5.95 * Math.cos(angle), 0, 20 + 5.95 * Math.sin(angle))
  }), true)
  walks.unshift({ curve: ring, width: 2.34 })
  const pathSamples = []
  for (const { curve, width } of walks) {
    const rows = Math.ceil(curve.getLength() / .41)
    const columns = Math.ceil(width / .47)
    const tileWidth = width / columns
    for (let i = 0; i <= rows; i++) {
      const p = curve.getPointAt(i / rows)
      const tangent = curve.getTangentAt(i / rows)
      pathSamples.push([p.x, p.z, width * .51])
      const angle = Math.atan2(tangent.x, tangent.z)
      for (let column = 0; column < columns; column++) {
        const displacement = (column + .5) * tileWidth - width / 2 + range(-.023, .023)
        const x = p.x + tangent.z * displacement + tangent.x * ((column % 2) * .124 - .06)
        const z = p.z - tangent.x * displacement + tangent.z * ((column % 2) * .124 - .06)
        const y = groundHeight(x, z)
        const pitch = (groundHeight(x, z - .15) - groundHeight(x, z + .15)) / .3
        const roll = (groundHeight(x + .15, z) - groundHeight(x - .15, z)) / .3
        instance('box', 'stone', [x, y + range(.009, .027), z], [tileWidth - range(.018, .04), .088, range(.368, .402)],
          [pitch, angle + range(-.06, .06), roll], { color: stoneTint(), shadow: false })
      }
    }
  }

  function circularBed(x, z, radius, flowers, shrubCount) {
    const tiles = Math.ceil(radius * TAU / .42)
    for (let i = 0; i < tiles; i++) {
      const angle = i * TAU / tiles
      const px = x + radius * Math.cos(angle)
      const pz = z + radius * Math.sin(angle)
      instance('box', 'stone', [px, groundHeight(px, pz) + .105, pz],
        [.264, .25, radius * TAU / tiles * .972], [0, -angle, range(-.05, .05)], { color: stoneTint() })
    }
    instance('disc', 'mulch', [x, groundHeight(x, z) + .039, z], [radius - .115, .135, radius - .115], [0, 0, 0], { shadow: false })
    for (let i = 0; i < shrubCount; i++) {
      const angle = range(0, TAU)
      const r = radius * range(.19, .82)
      const px = x + r * Math.cos(angle)
      const pz = z + r * Math.sin(angle)
      planting.shrub(px, Math.max(groundHeight(px, pz), groundHeight(x, z)) + .07, pz, range(.34, .83), true)
    }
    for (let i = 0; i < flowers; i++) {
      const angle = range(0, TAU)
      const r = (radius - .25) * Math.sqrt(random())
      const px = x + r * Math.cos(angle)
      const pz = z + r * Math.sin(angle)
      planting.flower(px, Math.max(groundHeight(x, z) + .11, groundHeight(px, pz)), pz, range(.25, .86))
    }
  }
  circularBed(0, 20, 4.78, 375, 27)
  circularBed(9.75, 16.02, 2.55, 123, 7)
  circularBed(-7.52, 12.57, 1.6, 74, 6)
  for (const [x, z, length, width, palette] of [
    [-5.6, 10.65, 2.8, .73, [0xd4afc3, 0xe7d2c9]], [5.9, 10.42, 2.8, .68, [0xc2b2d4, 0xe5d9c5]],
    [-10.4, 8.3, 2.1, 1.2, [0xd9baa2, 0xe4dccc]], [12.65, 7.96, 2.1, 1.15, [0xdcb8bd, 0xada1c3]],
    [-4.52, 26.8, 2.25, .82, [0xaaa1cd, 0xc7b8d6]], [7.73, 25.9, 1.85, 1.1, [0xdab5c3, 0xe3d6bb]],
    [-17.14, 14.0, 1.53, .75, [0xd9b4be, 0xe5d6c0]], [-15.9, 9.75, 1.15, .68, [0xc0a3c7, 0xe8dac1]],
    [10.64, 33.1, 2.15, 1.4, [0xb3a5ce, 0xf0dfcb]], [24.97, 28.86, 1.76, 1.2, [0xd4b1c5, 0xddc7ac]],
  ]) {
    for (let i = 0; i < 9; i++) {
      const px = x + range(-length, length)
      const pz = z + range(-width, width)
      planting.shrub(px, groundHeight(px, pz), pz, range(.39, .67), true)
    }
    for (let i = 0; i < 42; i++) {
      const a = range(0, TAU)
      const r = Math.sqrt(random())
      const px = x + Math.cos(a) * length * r
      const pz = z + Math.sin(a) * width * r
      planting.flower(px, groundHeight(px, pz), pz, range(.26, .56), palette)
    }
  }

  const fx = 9.75
  const fz = 16.02
  const fy = groundHeight(fx, fz) + .1
  for (const [height, radius, depth] of [[.05,.61,.2], [.23,.46,.22], [.45,.23,.3], [.72,.32,.26], [.97,.69,.22], [1.12,.84,.13], [1.22,.72,.083], [1.4,.12,.43], [1.64,.18,.15]]) {
    instance('pot', 'stone', [fx, fy + height, fz], [radius, depth, radius])
  }
  instance('disc', 'iron', [fx, fy + 1.26, fz], [.61, .018, .61])
  instance('disc', 'stone', [fx, fy + 1.51, fz], [.29, .12, .29])

  function bench(x, z, angle) {
    const y = groundHeight(x, z)
    const local = (px, py, pz) => [x + Math.cos(angle) * px + Math.sin(angle) * pz, y + py, z - Math.sin(angle) * px + Math.cos(angle) * pz]
    for (let i = 0; i < 5; i++) instance('box', 'wood', local(0, .47, -.224 + i * .097), [1.73, .045, .086], [0, angle, 0])
    for (let i = 0; i < 4; i++) instance('box', 'wood', local(0, .61 + i * .094, -.278 - i * .022), [1.73, .072, .039], [0, angle, 0])
    for (const p of [-.73, .73]) {
      for (const q of [-.22, .19]) beam(local(p, .04, q), local(p, .44, q), .065, .073, 'iron')
      beam(local(p, .44, -.23), local(p, .94, -.38), .06, .07, 'iron')
      beam(local(p, .68, -.31), local(p, .65, .19), .054, .054, 'iron')
      beam(local(p, .65, .19), local(p, .45, .21), .047, .047, 'iron')
    }
  }
  for (const [x, z, angle] of [[-7.1, 25.1, .48], [-11.7, 31.1, 1.66], [-10.5, 35.7, 2.9], [4.7, 14.45, -.67], [10.6, 23.1, -.8]]) bench(x, z, angle)
  for (const [x, z] of [[-5.9, 15.1], [-8.2, 22.5], [6.5, 23], [1.9, 26.1], [13.6, 22.1], [2.3, 31], [8.7, 38.8], [-12.3, 16.8], [-16, 11.8], [5.7, 13.5], [26.5, 23.2], [-2.75, 12.34]]) {
    const y = groundHeight(x, z)
    instance('disc', 'stone', [x, y + .093, z], [.25, .19, .25])
    instance('pole', 'iron', [x, y + .62, z], [.083, 1.15, .083])
    instance('box', 'light', [x, y + 1.32, z], [.215, .27, .215], [0, 0, 0], { shadow: false })
    instance('disc', 'iron', [x, y + 1.17, z], [.15, .055, .15])
    instance('pot', 'iron', [x, y + 1.52, z], [.178, .13, .178], [Math.PI, 0, 0])
    for (const sign of [-1, 1]) for (const side of [-1, 1]) {
      instance('box', 'iron', [x + sign * .101, y + 1.32, z + side * .101], [.029, .306, .029])
    }
  }
  const noPlant = (x, z) => {
    if (z < 12.4 && z > -8.3 && Math.abs(x) < 13.1) return true
    if (Math.abs(x + 18) < 4.35 && Math.abs(z - 9) < 3.9) return true
    if (Math.abs(x - 28) < 3.6 && Math.abs(z - 13.2) < 4.2) return true
    if (Math.hypot(x, z - 20) < 6.95) return true
    return pathSamples.some(([px, pz, width]) => (x - px) ** 2 + (z - pz) ** 2 < width ** 2)
  }
  for (let i = 0; i < 3500; i++) {
    const x = range(-40, 42)
    const z = range(-27, 53)
    const y = groundHeight(x, z)
    if (y < waterHeight(z) + .05 || noPlant(x, z)) continue
    const clustered = Math.cos(x * .83 + z * .71) + Math.sin(z * .47 - x * .38)
    planting.tuft(x, y, z, clustered > 1 ? range(.19, .47) : range(.1, .26))
    if (clustered > 1.34 && i % 2 === 0) planting.flower(x, y, z, range(.2, .46))
  }
  for (let i = 0; i < 135; i++) {
    const x = range(-36, 38)
    const z = range(-21, 42)
    if (noPlant(x, z) || groundHeight(x, z) < waterHeight(z) + .34) continue
    planting.shrub(x, groundHeight(x, z), z, range(.38, 1.13), i % 3 !== 0)
  }

  const trees = [
    [-12.9, -13.3, 13.9], [-17, -7.4, 9.3], [-24, 3.7, 9.8],
    [-28, 14.7, 9.7], [-23, 25, 8.1, 'blossom'], [-20, 36, 9.5],
    [-19, -21, 10.4], [-5.8, -14, 10.4, 'cypress'], [5.1, -15.5, 9.3, 'cypress'],
    [10.8, -12.9, 13.2, 'cypress'], [17, -8, 11.5, 'cypress'], [17, 1.2, 7.8],
    [35.2, 5.7, 9.6], [37.5, 19, 7.1, 'blossom'], [32.8, 28.6, 8.6, 'blossom'],
    [33.5, 40, 9.8], [-12, 48, 7.4, 'blossom'], [-28, -5, 9.6, 'cypress'],
    [9.4, 39.8, 4.1, 'blossom'], [36.4, -14, 10.9, 'cypress'], [43, 15, 8.3],
  ]
  for (const [x, z, h, type] of trees) planting.tree(x, groundHeight(x, z), z, h, type)
  const groves = [[-42, -43], [-21, -42], [15, -40], [32, -63], [55, -40], [-44, -76], [-15, -76], [6, -63], [47, -21]]
  for (let i = 0; i < 128; i++) {
    const [groveX, groveZ] = groves[i % groves.length]
    const x = groveX + range(-13, 13)
    const z = groveZ + range(-12, 12)
    if (groundHeight(x, z) < waterHeight(z) + .34) continue
    planting.tree(x, groundHeight(x, z), z, range(2.8, 7.1), i % 3 ? 'oak' : 'cypress')
  }
}
function buildTimberPlaces(kit) {
  const { THREE, group, instance, beam, range } = kit
  function lodge(name, x, y, z, width, length, wall, rise, openFront) {
    const building = new THREE.Group()
    building.name = name
    building.position.set(x, y, z)
    group.add(building)
    const options = { parent: building }
    const box = (material, xyz, dimensions, rotation = [0, 0, 0], color) =>
      instance('box', material, xyz, dimensions, rotation, { ...options, color })
    const timber = (a, b, size, material = 'wood') => beam(a, b, size, size, material, options)
    const eave = width * .5 + .44
    const slope = Math.atan2(rise, eave)
    for (const sign of [-1, 1]) {
      box('darkwood', [sign * eave / 2, wall + rise / 2, 0],
        [Math.hypot(eave, rise), .16, length + .83], [0, 0, -sign * slope])
      const shingles = [0xc8b59c, 0xbcb2a5, 0xa09888, 0xb8a792, 0xe3d1b8]
      const rows = Math.ceil(eave / .27)
      const columns = Math.ceil((length + .71) / .32)
      for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
        const t = (row + .5) / rows
        const span = (length + .73) / columns
        const pz = -length / 2 - .34 + (column + .5) * span + (row % 2 ? .046 : -.045)
        box('roof', [sign * t * eave, wall + rise * (1 - t) + .124, pz],
          [.36, .071, span - .012], [0, range(-.03, .03), -sign * slope], shingles[(row * 17 + column * 11) % shingles.length])
      }
      for (const end of [-1, 1]) {
        const edgeZ = end * (length * .5 + .4)
        timber([0, wall + rise + .1, edgeZ], [sign * eave, wall + .08, edgeZ], .17)
      }
      const sideX = sign * width / 2
      for (let i = 0; i < Math.ceil(length / .24); i++) {
        const pz = -length / 2 + .12 + .24 * i
        box('darkwood', [sideX, wall / 2, pz], [.12, wall, .231], [0, 0, 0], i % 4 ? 0xe7d1b4 : 0xbda78a)
      }
      for (const end of [-1, 1]) {
        const endZ = length * .5 * end
        timber([sideX, .02, endZ], [sideX, wall + .06, endZ], .21)
        timber([sideX, wall - .52, endZ], [sideX - sign * .52, wall - .06, endZ], .14)
      }
    }
    for (const sign of [-1, 1]) {
      const edgeZ = sign * length / 2
      timber([-width / 2, wall, edgeZ], [width / 2, wall, edgeZ], .19)
      timber([0, wall, edgeZ], [0, wall + rise, edgeZ], .15)
      for (let i = 0; i < Math.ceil(width / .23); i++) {
        const px = -width / 2 + .115 + i * .23
        const height = rise * (1 - Math.abs(px) / eave)
        box('darkwood', [px, wall + height / 2, edgeZ - sign * .037], [.22, height, .09])
        if (sign === 1 && openFront) continue
        if (sign === 1 && Math.abs(px) < .53) continue
        box('darkwood', [px, wall / 2, edgeZ - sign * .038], [.22, wall, .1], [0, 0, 0], i % 3 ? 0xe7d4b5 : 0xbba385)
      }
    }
    for (let i = 0; i < Math.ceil(length / .21); i++) {
      box('wood', [0, .02, -length / 2 + i * .21 + .1], [width + .04, .105, .198],
        [0, 0, 0], i % 5 ? 0xe3ccb0 : 0xb89e7d)
    }
    if (!openFront) {
      box('wood', [0, .94, length * .5], [1.03, 1.85, .12])
      for (const x of [-width * .3, width * .3]) {
        box('light', [x, 1.63, length * .5 + .022], [.68, .76, .031])
        for (const dx of [-.36, 0, .36]) box('wood', [x + dx, 1.63, length * .5 + .05], [.062, .86, .068])
        for (const dy of [-.405, 0, .405]) box('wood', [x, 1.63 + dy, length * .5 + .05], [.78, .062, .065])
      }
    }
    return { building, box, timber }
  }

  const wy = groundHeight(-18, 9) + .08
  const workshop = lodge('obj.workshop.main', -18, wy, 9, 6.1, 4.55, 2.82, 1.42, true)
  const wb = workshop.box
  wb('wood', [0, .95, .89], [4.75, .128, 1.03])
  wb('wood', [0, .34, .89], [4.63, .067, .91])
  for (const x of [-2.21, 2.21, 0]) for (const z of [.52, 1.29]) wb('darkwood', [x, .48, z], [.14, .91, .14])
  for (const y of [.65, 1.42, 2.18]) wb('wood', [0, y, -1.95], [5.45, .075, .46])
  for (let i = 0; i < 48; i++) {
    const row = i % 3
    const x = -2.52 + (i % 16) * .326
    const z = i % 5 ? -1.91 : .88
    const y = z > 0 ? 1.04 : [.7, 1.48, 2.24][row]
    const height = range(.08, .29)
    instance(i % 3 ? 'pot' : 'box', i % 5 ? 'clay' : 'iron', [x, y + height / 2, z],
      [range(.08, .15), height, range(.075, .14)], [0, range(-.35, .35), 0], { parent: workshop.building })
  }
  for (const [x, z] of [[-2.43, 1.93], [2.58, 1.97], [2.8, -1.55]]) {
    wb('darkwood', [x, .29, z], [.65, .57, .58])
    for (let i = 0; i < 5; i++) wb('wood', [x, .11 + .105 * i, z + .306], [.67, .093, .039])
  }
  instance('disc', 'iron', [-3.53, .57, -.73], [.39, 1.14, .39], [0, 0, 0], { parent: workshop.building })
  for (const y of [.15, .58, 1.05]) instance('disc', 'wood', [-3.53, y, -.73], [.407, .053, .407], [0, 0, 0], { parent: workshop.building })
  workshop.timber([0, 2.82, .7], [0, 2.24, .7], .038, 'iron')
  instance('pot', 'iron', [0, 2.21, .7], [.31, .18, .31], [0, 0, 0], { parent: workshop.building })
  instance('sphere', 'light', [0, 2.12, .7], [.137, .087, .137], [0, 0, 0], { parent: workshop.building, shadow: false })

  const ty = groundHeight(-11, -12) + 5.03
  const treehouse = lodge('obj.treehouse.main', -11, ty, -12, 3.8, 3.14, 2.43, 1.27, false)
  const tb = treehouse.box
  for (let i = 0; i < 25; i++) tb('wood', [-.51, -.14, -1.76 + .208 * i], [5.93, .14, .199])
  for (const x of [-3.4, 2.36]) {
    for (const z of [-1.56, -.43, .72, 1.82, 2.94, 3.32]) tb('wood', [x, .42, z], [.109, 1.08, .109])
    treehouse.timber([x, .93, -1.67], [x, .93, 3.31], .113)
    treehouse.timber([x, .41, -1.67], [x, .41, 3.31], .073)
  }
  treehouse.timber([-1.79, .93, 3.31], [2.42, .93, 3.31], .113)
  treehouse.timber([-1.79, .41, 3.31], [2.42, .41, 3.31], .073)
  for (const px of [-3.11, 2.06]) for (const pz of [-1.45, 2.98]) {
    const height = ty - groundHeight(-11 + px, -12 + pz)
    treehouse.timber([px, -height, pz], [px, -.08, pz], .26, 'darkwood')
    treehouse.timber([px, -1.34, pz], [px + (px > 0 ? -.98 : .98), -.17, pz], .16, 'darkwood')
  }
  const stairTop = -8.65
  const stairFoot = -3.17
  const sy = groundHeight(-13.48, stairFoot)
  for (let index = 0; index < 25; index++) {
    const t = index / 24
    const z = between(stairTop, stairFoot, t)
    const y = between(ty - .11, sy + .11, t)
    instance('box', 'wood', [-13.48, y, z], [1.54, .14, .255])
    if (index % 4 === 0) for (const x of [-14.18, -12.78]) instance('box', 'wood', [x, y + .44, z], [.09, .98, .09])
  }
  for (const x of [-14.18, -12.78]) {
    beam([x, ty + .82, stairTop], [x, sy + 1.04, stairFoot], .105, .113, 'wood')
    beam([x, ty - .24, stairTop], [x, sy - .02, stairFoot], .19, .24, 'darkwood')
  }
}

function buildStream(kit, planting) {
  const { THREE, place, instance, range, random, standard } = kit
  const uniform = { time: { value: 0 }, history: { value: 0 } }
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    roughness: .39, metalness: .1, clearcoat: .25, clearcoatRoughness: .32, side: THREE.DoubleSide,
  })
  waterMaterial.onBeforeCompile = shader => {
    shader.uniforms.valleyTime = uniform.time
    shader.uniforms.valleyHistory = uniform.history
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vStream;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStream = position.xz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vStream;\nuniform float valleyTime;\nuniform float valleyHistory;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float dirty = smoothstep(16.4, 22.2, vStream.y) * (1.0 - valleyHistory);
        vec2 p = vStream;
        p.y -= valleyTime * .31;
        vec2 warp = p + vec2(sin(p.y * .83 + p.x * .27), cos(p.x * 1.9 + p.y * .37)) * .53;
        float seams = sin(warp.y * 8.8 + warp.x * 2.7) * sin(warp.x * 6.4 - warp.y * 3.3);
        float smallRipples = sin(warp.x * 14.1 + warp.y * 10.6) * sin(warp.x * 5.6 - warp.y * 16.8);
        float wave = .005 * seams + .003 * smallRipples;
        float siltCloud = sin(warp.y * 1.9 + sin(warp.x * 2.9) * 1.8) * .012;
        diffuseColor.rgb = mix(vec3(.054, .125, .108), vec3(.198, .125, .067), dirty) + wave + siltCloud;
      `)
      .replace('#include <opaque_fragment>', `
        float sheen = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 3.0);
        float flash = smoothstep(.82, .99, seams) * smoothstep(.23, .94, sin(warp.x * 5.1 - p.y * 1.2));
        outgoingLight += vec3(.18, .24, .25) * (sheen * (.37 + wave * 2.0) + flash * .07);
        #include <opaque_fragment>
      `)
  }
  const positions = []
  const indices = []
  const columns = 14
  const rows = 374
  for (let row = 0; row <= rows; row++) {
    const z = between(-90, 75, row / rows)
    const [center, width] = streamAt(z)
    for (let column = 0; column <= columns; column++) {
      const x = center + width * 1.17 * (2 * column / columns - 1)
      positions.push(x, waterHeight(z), z)
      if (row && column) {
        const index = row * (columns + 1) + column
        const previous = index - columns - 1
        indices.push(index, previous, index - 1, previous, previous - 1, index - 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const water = place(geometry, waterMaterial, [0, 0, 0], [1, 1, 1], [0, 0, 0], { shadow: false })
  water.name = 'obj.stream.continuous'

  const rockTints = [0x8a8b76, 0xbcb095, 0xc4bba8, 0x8b8574, 0xa49c84, 0xd0c3ab]
  for (let i = 0; i < 430; i++) {
    const z = range(-24, 57)
    const [center, width] = streamAt(z)
    const bank = i % 2 ? 1 : -1
    const x = center + bank * (width + range(-.34, .75))
    if (Math.abs(z - 25) < 1.22 || (bank > 0 && Math.abs(z - 17.9) < 1.19)) continue
    const y = groundHeight(x, z)
    const size = i % 9 ? range(.15, .54) : range(.54, .91)
    instance('rock', 'rock', [x, y + size * .07, z], [size, size * range(.56, .86), size * range(.71, 1.09)],
      [range(-.6, .6), range(0, TAU), range(-.46, .46)], { color: rockTints[i % rockTints.length], shadow: i % 3 === 0 })
    if (y > waterHeight(z) + .015 && i % 3 !== 0) planting.tuft(x + bank * size * .77, y + .01, z + range(-.37, .37), range(.35, .93), true)
    if (i % 6 === 0 && y > waterHeight(z) + .03) planting.flower(x + bank * .44, y + .045, z, range(.28, .55), [0xd8b761, 0xe9dfc4, 0xb1a5c7])
  }
  const lily = new THREE.CircleGeometry(1, 13, .17, TAU - .41)
  lily.rotateX(-Math.PI / 2)
  for (let i = 0; i < 43; i++) {
    const z = range(29.5, 35.9)
    const [center, width] = streamAt(z)
    const x = center - width * range(.51, .88)
    const size = range(.12, .31)
    instance(lily, 'green', [x, waterHeight(z) + .026, z], [size, 1, size], [0, range(0, TAU), 0],
      { color: i % 2 ? 0x86924d : 0xa5a663, shadow: false })
    if (random() < .16) planting.flower(x, waterHeight(z) + .035, z, range(.07, .12), [0xead7bc, 0xe9c8c5])
  }

  for (let i = 0; i < 33; i++) {
    const z = 11.8 + i * .193
    const x = channelX(z)
    const width = .32 + i * .008
    const color = [0x9d7350, 0xac815c, 0xb38e66][i % 3]
    instance('rock', 'mulch', [x, groundHeight(x, z) + .066, z], [width, .076, .44],
      [0, .73 + range(-.1, .1), 0], { color, shadow: false })
    for (const side of [-1, 1]) {
      const xx = x + side * (width + range(.17, .36))
      const yy = groundHeight(xx, z)
      const pebble = range(.058, .16)
      if (i % 2) instance('pebble', 'rock', [xx, yy + .02, z], [pebble, pebble * .57, pebble],
        [0, range(0, TAU), 0], { color: rockTints[i % rockTints.length], shadow: false })
    }
  }
  const soilQuads = []
  const bedCenter = [28.75, 11.46]
  for (let row = 0; row < 8; row++) for (let column = 0; column < 12; column++) {
    const x = bedCenter[0] - 1.8 + column * .3
    const z = bedCenter[1] - 1.42 + row * .35
    if (((x + .15 - bedCenter[0]) / 1.86) ** 2 + ((z + .175 - bedCenter[1]) / 1.42) ** 2 > 1) continue
    soilQuads.push([[x, z], [x, z + .35], [x + .3, z + .35], [x + .3, z]].map(([xx, zz]) => [xx, groundHeight(xx, zz) + .038, zz]))
  }
  kit.faces(soilQuads, standard(0xa27b5a, { map: kit.soilMap, bumpMap: kit.soilMap, bumpScale: .095 }))
  for (let i = 0; i < 155; i++) {
    const a = range(0, TAU)
    const r = Math.sqrt(random())
    const x = bedCenter[0] + 1.73 * r * Math.cos(a)
    const z = bedCenter[1] + 1.33 * r * Math.sin(a)
    const size = range(.03, .104)
    instance('pebble', 'mulch', [x, groundHeight(x, z) + .058, z], [size, size * .37, size * .82],
      [0, a, range(-.25, .25)], { color: rockTints[i % rockTints.length], shadow: false })
  }
  return uniform
}

const coverWidth = 2.03
const coverDepth = 1.43
const placementCenters = { source_cover_zone: [28.75, 11.46], unrelated_zone: [32.33, 11.8], outside_allowed_zones: [30.46, 12.86] }

export function createEnvironment(THREE) {
  const group = new THREE.Group()
  group.name = 'English Valley'
  const kit = makeSceneKit(THREE, group)
  const { place, instance, beam, range, standard } = kit
  const planting = gardenPlanting(kit)
  const interactables = []
  const anchorXZ = {
    'loc.greenhouse': [0, 0], 'loc.treehouse': [-11, -12], 'loc.workshop': [-18, 9],
    'loc.flower_ring': [0, 20], 'loc.upper_stream': [23, 2], 'loc.bare_bed': [28, 12],
    'loc.stream_bridge': [21, 25], 'loc.exit_path': [7, 41],
  }
  const anchors = Object.fromEntries(Object.entries(anchorXZ).map(([name, [x, z]]) =>
    [name, new THREE.Vector3(x, groundHeight(x, z), z)]))
  buildGround(kit)
  buildConservatory(kit, planting)
  buildTimberPlaces(kit)
  buildBridge(kit)
  buildGarden(kit, planting)
  const water = buildStream(kit, planting)

  function register(object, action, locationId) {
    object.userData.action = action
    object.userData.locationId = locationId
    interactables.push(object)
    return object
  }
  const proxy = (action, location, xyz, size) => register(
    place('box', 'proxy', xyz, size, [0, 0, 0], { shadow: false }), action, location,
  )

  const bottleRoot = new THREE.Group()
  bottleRoot.name = 'obj.bridge.bottle'
  const bx = 16.95
  const bz = 26.57
  const by = Math.max(waterHeight(bz) + .15, groundHeight(bx, bz) + .245)
  bottleRoot.position.set(bx, by, bz)
  bottleRoot.rotation.set(.4, -.67, 1.18)
  group.add(bottleRoot)
  const bottleBody = new THREE.LatheGeometry([
    [0, -.194], [.057, -.196], [.078, -.18], [.084, -.158], [.081, -.138], [.087, -.112],
    [.084, -.082], [.085, .045], [.083, .078], [.075, .11], [.054, .145], [.026, .157],
    [.025, .187], [.034, .192], [.034, .202], [0, .202],
  ].map(([x, y]) => new THREE.Vector2(x, y)), 20)
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb9ccbf, metalness: .06, roughness: .34, clearcoat: .7, opacity: .82, transparent: true,
  })
  const bottle = register(place(bottleBody, bodyMaterial, [0, 0, 0], [1, 1, 1], [0, 0, 0], { parent: bottleRoot, shadow: false }), 'bottle', 'loc.stream_bridge')
  const bottleLabel = standard(0xcf8369, { roughness: .72 })
  const bottleLabelText = standard(0xf0e6cd)
  place('disc', bottleLabel, [0, -.021, 0], [.087, .115, .087], [0, 0, 0], { parent: bottleRoot, shadow: false })
  for (const y of [-.063, .026]) place('disc', bottleLabelText, [0, y, 0], [.088, .01, .088], [0, 0, 0], { parent: bottleRoot, shadow: false })
  place('disc', standard(0x779d98), [0, .198, 0], [.036, .046, .036], [0, 0, 0], { parent: bottleRoot })
  instance('rock', 'rock', [bx - .21, by - .24, bz - .08], [.27, .23, .38], [.43, .21, .17], { color: 0xd2c2a4 })
  instance('rock', 'rock', [bx + .27, by - .25, bz + .19], [.24, .22, .29], [.2, -.3, .44], { color: 0xa19c85 })

  proxy('evidence_bridge', 'loc.stream_bridge', [20.5, waterHeight(27.25) + .02, 27.25], [2.45, .08, 1.72])
  proxy('evidence_upper', 'loc.upper_stream', [23.25, waterHeight(2.1) + .02, 2.1], [2.18, .085, 2.08])
  proxy('evidence_path', 'loc.bare_bed', [27.14, groundHeight(27.14, 13.04) + .11, 13.04], [1.16, .3, 1.4])
  proxy('mei', 'loc.greenhouse', [3.3, groundHeight(3.3, 11.9) + .84, 11.9], [.74, 1.55, .75])

  const tx = 30.7
  const tz = 14.9
  const ty = groundHeight(tx, tz)
  const table = place('box', 'wood', [tx, ty + .857, tz], [2.9, .126, 1.2])
  register(table, 'model', 'loc.bare_bed')
  for (const x of [-1.26, 1.26]) for (const z of [-.47, .47]) {
    beam([tx + x, groundHeight(tx + x, tz + z), tz + z], [tx + x, ty + .822, tz + z], .111, .111, 'darkwood')
  }
  for (const z of [-.47, .47]) beam([tx - 1.29, ty + .695, tz + z], [tx + 1.29, ty + .695, tz + z], .117, .078, 'darkwood')
  for (let i = 0; i < 8; i++) instance('box', 'wood', [tx, ty + .919, tz - .52 + i * .149],
    [2.92, .022, .141], [0, 0, 0], { color: i % 3 ? 0xe8cfaa : 0xb49f7a })
  proxy('cover', 'loc.bare_bed', [28.75, groundHeight(28.75, 11.46) + .12, 11.46], [coverWidth, .17, coverDepth])

  const cover = new THREE.Group()
  cover.name = 'obj.runoff.cover'
  group.add(cover)
  const textile = standard(0xae9060, { map: kit.soilMap, bumpMap: kit.soilMap, bumpScale: .073, side: THREE.DoubleSide })
  const fabric = new THREE.PlaneGeometry(coverWidth, coverDepth, 21, 13)
  fabric.rotateX(-Math.PI / 2)
  const points = fabric.attributes.position
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i)
    const z = points.getZ(i)
    points.setY(i, .023 * Math.sin(x * 13 + z * 4) + .025 * Math.cos(z * 8 - x * 2))
  }
  fabric.computeVertexNormals()
  place(fabric, textile, [0, 0, 0], [1, 1, 1], [0, 0, 0], { parent: cover })
  for (let i = 0; i < 32; i++) {
    const x = range(-coverWidth / 2, coverWidth / 2)
    const z = range(-coverDepth / 2, coverDepth / 2)
    instance('box', 'wood', [x, .025, z], [range(.057, .142), .025, .02], [0, range(-1.7, 1.7), 0],
      { parent: cover, color: 0xd6b581 })
  }
  for (const x of [-.93, .93]) for (const z of [-.64, .64]) {
    instance('rock', 'stone', [x, .076, z], [.14, .09, .12], [0, range(0, TAU), 0], { parent: cover, color: 0xb1a08b })
  }
  const storyBoards = createStoryBoards(THREE, group, groundHeight, register)
  kit.flush()

  const up = new THREE.Vector3(0, 1, 0)
  const surfaceNormal = (x, z) => new THREE.Vector3(
    groundHeight(x - .17, z) - groundHeight(x + .17, z), .34,
    groundHeight(x, z - .17) - groundHeight(x, z + .17),
  ).normalize()
  function getPlacementTransform(zone) {
    const [x, z] = placementCenters[zone] ?? placementCenters.outside_allowed_zones
    return {
      position: [x, groundHeight(x, z) + .09, z],
      rotation: new THREE.Quaternion().setFromUnitVectors(up, surfaceNormal(x, z)).toArray(),
      scale: [1, 1, 1],
    }
  }

  function validatePlacement(transform) {
    const position = transform?.position
    const rotation = transform?.rotation
    const scale = transform?.scale
    const finite = (array, length) => Array.isArray(array) && array.length === length && array.every(Number.isFinite)
    if (!finite(position, 3) || !finite(rotation, 4) || !finite(scale, 3) || scale.some(value => value <= 0)) {
      return {
        zone: 'outside_allowed_zones', valid: false, targetSurfaceAcceptsCover: false, placementBlocksRoute: true,
        coverOrientationValid: false, placementOnSourceZone: false, placementAligned: false,
      }
    }
    const [x, y, z] = position
    const orientation = new THREE.Quaternion().fromArray(rotation)
    const corners = []
    for (const xx of [-coverWidth * scale[0] / 2, 0, coverWidth * scale[0] / 2]) {
      for (const zz of [-coverDepth * scale[2] / 2, 0, coverDepth * scale[2] / 2]) {
        corners.push(new THREE.Vector3(xx, 0, zz).applyQuaternion(orientation).add(new THREE.Vector3(x, y, z)))
      }
    }
    const fitsSource = corners.every(point => ((point.x - 28.75) / 1.81) ** 2 + ((point.z - 11.46) / 1.44) ** 2 < 1)
    const unrelated = corners.every(point => Math.abs(point.x - 32.33) < 1.49 && Math.abs(point.z - 11.8) < 1.12)
    const zone = fitsSource ? 'source_cover_zone' : unrelated ? 'unrelated_zone' : 'outside_allowed_zones'
    const placementBlocksRoute = corners.some(point => {
      const [center, width] = streamAt(point.z)
      const eastWalk = point.z > 9 && point.z < 17.5 &&
        Math.abs(point.x - between(28.7, 30.4, smooth((point.z - 9) / 4.2))) < .56
      return Math.abs(point.x - center) < width + .3 || (eastWalk && !fitsSource) ||
        (point.z > 12.43 && point.z < 18.4 && Math.abs(point.x - channelX(point.z)) < .32)
    })
    const coverOrientationValid = Math.abs(orientation.lengthSq() - 1) < .02 &&
      up.clone().applyQuaternion(orientation).dot(surfaceNormal(x, z)) > .97 &&
      Math.abs(y - groundHeight(x, z) - .09) < .21 &&
      scale.every(value => value > .85 && value < 1.17)
    const targetSurfaceAcceptsCover = fitsSource && coverOrientationValid
    return {
      zone, valid: targetSurfaceAcceptsCover && !placementBlocksRoute, targetSurfaceAcceptsCover, placementBlocksRoute,
      coverOrientationValid, placementOnSourceZone: fitsSource, placementAligned: coverOrientationValid,
    }
  }

  let fields = {}
  let observation = 'current'
  function applyPresentation() {
    const history = observation === 'before_rain'
    const installed = fields['world.coverInstalled'] === true
    const draft = fields['implementation.materialState'] === 'draft_placed'
    const coverTransform = installed ? fields['world.coverTransform'] ?? fields['implementation.draftTransform'] : fields['implementation.draftTransform']
    cover.visible = !history && (installed || draft)
    if (cover.visible) {
      const transform = coverTransform ?? getPlacementTransform('source_cover_zone')
      cover.position.fromArray(transform.position)
      cover.quaternion.fromArray(transform.rotation)
      cover.scale.fromArray(transform.scale)
    }
    bottle.visible = history || fields['world.litterRemoved'] !== true
    bottleRoot.visible = bottle.visible
    water.history.value = history ? 1 : 0
  }
  function setWorldState(nextFields = {}) {
    fields = nextFields
    applyPresentation()
  }
  function setObservation(mode) {
    observation = mode === 'before_rain' || mode === 'upper' ? mode : 'current'
    applyPresentation()
  }
  function update(_dt, time) {
    water.time.value = Number.isFinite(time) ? time : 0
  }
  function dispose() {
    storyBoards.dispose()
    const geometries = new Set(Object.values(kit.geometry))
    const materials = new Set(Object.values(kit.materials))
    group.traverse(object => {
      if (!object.isMesh) return
      if (object.isInstancedMesh) object.dispose()
      geometries.add(object.geometry)
      materials.add(object.material)
    })
    const textures = new Set()
    for (const material of materials) {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value)
      material.dispose()
    }
    for (const geometry of geometries) geometry.dispose()
    for (const texture of textures) texture.dispose()
    group.clear()
  }

  applyPresentation()
  return { group, anchors, interactables, groundHeight, getPlacementTransform, validatePlacement, setWorldState, setObservation, setStoryImages: storyBoards.setImages, update, dispose }
}
