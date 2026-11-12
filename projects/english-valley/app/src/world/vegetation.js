const TAU = Math.PI * 2

export function gardenPlanting(kit) {
  const { THREE, range, random, instance, beam } = kit
  const greens = [0x5b7840, 0x778b46, 0x929f55, 0x71874d, 0x3a542f, 0x52693a, 0x9fa25a]
  const petals = [0xd0abc3, 0xb0a2d0, 0xe8dac0, 0xe4bead, 0x9a91b8, 0xf0e8d6, 0xbb8da9]
  const choice = array => array[Math.floor(random() * array.length)]
  const leaf = new THREE.BufferGeometry()
  leaf.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, -.32, .31, .03, -.24, .72, .09, 0, 1, -.08,
    .23, .74, .1, .34, .3, .04, 0, .49, .16,
  ], 3))
  leaf.setIndex([0, 1, 6, 1, 2, 6, 2, 3, 6, 3, 4, 6, 4, 5, 6, 5, 0, 6])
  leaf.computeVertexNormals()
  const leafCluster = new THREE.BufferGeometry()
  const clusterPositions = []
  const clusterIndices = []
  const sample = new THREE.Vector3()
  const rotation = new THREE.Euler()
  for (let index = 0; index < 27; index++) {
    const angle = index * 2.39996
    const vertical = 1 - (index + .5) * 2 / 27
    const radial = Math.sqrt(1 - vertical ** 2)
    const spread = .43 + .16 * Math.cos(index * 4.2)
    const leafSize = .49 + .18 * Math.cos(index * 2.1)
    rotation.set(.72 + Math.sin(index * 4.3) * .89, angle, .31 * Math.cos(index * 2.3))
    for (let vertex = 0; vertex < 7; vertex++) {
      sample.fromBufferAttribute(leaf.attributes.position, vertex)
        .multiplyScalar(leafSize)
        .applyEuler(rotation)
      clusterPositions.push(
        sample.x + Math.cos(angle) * radial * spread,
        sample.y + vertical * .54,
        sample.z + Math.sin(angle) * radial * spread,
      )
    }
    for (const vertex of leaf.index.array) clusterIndices.push(vertex + index * 7)
  }
  leafCluster.setAttribute('position', new THREE.Float32BufferAttribute(clusterPositions, 3))
  leafCluster.setIndex(clusterIndices)
  leafCluster.computeVertexNormals()

  function flower(x, y, z, height, palette = petals) {
    const azimuth = range(0, TAU)
    const stemBase = [x, y, z]
    const tip = [x + .08 * height * Math.cos(azimuth), y + height, z + .08 * height * Math.sin(azimuth)]
    const color = choice(palette)
    beam(stemBase, tip, .013, .013, 'green', { color: choice(greens), shadow: false })
    for (let i = 0; i < 4; i++) {
      instance(leaf, 'green', [x, y + height * (.12 + i * .13), z],
        [height * .33, height * .43, height * .37], [range(.55, 1.08), azimuth + i * 2.38, range(-.24, .24)],
        { color: choice(greens), shadow: false })
    }
    const size = range(.065, .118)
    const clusters = height > .68 ? 3 : 1
    for (let i = 0; i < clusters; i++) {
      const stem = [tip[0] + (i ? Math.cos(i * 2.5 + azimuth) * .08 : 0), tip[1] - i * .08, tip[2] + (i ? Math.sin(i * 2.5 + azimuth) * .08 : 0)]
      instance('seedHead', 'petals', stem, [size * .35, size * .23, size * .35], [0, 0, 0], { color: 0xceab55, shadow: false })
      for (let j = 0; j < 5; j++) {
        const angle = azimuth + j * TAU / 5
        instance(leaf, 'petals', stem, [size * .82, size, size], [-1.26, angle, .14], { color, shadow: false })
      }
    }
  }

  function tuft(x, y, z, height, reed = false) {
    const number = reed ? 8 : 4
    for (let index = 0; index < number; index++) {
      const size = range(.48, 1.13) * height
      instance(leaf, 'green', [x + range(-.09, .09), y - .022, z + range(-.09, .09)],
        [size * (reed ? .24 : .42), size, size], [range(.18, .82), range(0, TAU), range(-.37, .37)],
        { color: choice(greens), shadow: false })
    }
  }

  function shrub(x, y, z, radius, flowering = false) {
    for (let index = 0; index < 110; index++) {
      const angle = range(0, TAU)
      const distance = Math.sqrt(random()) * radius
      const leafY = y + radius * (.06 + .65 * Math.sqrt(1 - (distance / radius) ** 2) * range(.65, 1.05))
      const xyz = [x + distance * Math.cos(angle), leafY, z + distance * Math.sin(angle)]
      const size = range(.13, .24) * radius
      instance(leaf, 'green', xyz, [size * 1.45, size, size], [range(.1, 2.3), angle, range(-1, 1)], { color: choice(greens), shadow: false })
      if (flowering && index % 6 === 0) flower(...xyz, range(.08, .18), [0xe6ddcc, 0xe0b9bd, 0xa095bd])
    }
  }

  function tree(x, y, z, height, type = 'oak') {
    const upright = type === 'cypress'
    const blossom = type === 'blossom'
    const size = height / 7
    const near = z > -26 && Math.abs(x) < 41
    const treePalette = upright ? [0x415a3c, 0x607348, 0x526b42, 0x728456, 0x526647] : greens
    const leanX = range(-.6, .6) * size
    const leanZ = range(-.43, .43) * size
    const trunk = (start, end, width) => beam(start, end, width, width, 'bark', { round: true, shadow: near })
    const point = fraction => [x + leanX * fraction, y + height * fraction, z + leanZ * fraction]
    const step = upright ? .153 : .16
    for (let i = 0; i < 5; i++) trunk(point(i * step), point((i + 1) * step + .026), size * (.35 - i * .047))
    for (let i = 0; i < 5 && near; i++) {
      const angle = i * TAU / 5 + range(0, .3)
      const at = [x + Math.cos(angle) * size * .66, y + .026, z + Math.sin(angle) * size * .66]
      trunk(at, point(.064), size * .103)
    }
    const crowns = upright ? 10 : near ? 14 : 6
    for (let i = 0; i < crowns; i++) {
      const fraction = (i + 1) / crowns
      const angle = i * 2.399 + range(-.37, .37)
      const branchStart = point((upright ? .19 : .34) + fraction * (upright ? .53 : .39))
      const extension = upright ? height * .104 * (1 - fraction * .58) : height * range(.21, .38) * (1 - .68 * fraction)
      const branchEnd = [branchStart[0] + extension * Math.cos(angle), branchStart[1] + height * range(.11, .23), branchStart[2] + extension * Math.sin(angle)]
      const middle = branchStart.map((coordinate, index) => coordinate + (branchEnd[index] - coordinate) * .51)
      trunk(branchStart, middle, size * range(.06, .12))
      trunk(middle, branchEnd, size * range(.025, .052))
      if (near && !upright) {
        const fork = [branchEnd[0] + size * Math.cos(angle + 1) * .8, branchEnd[1] - size * .11, branchEnd[2] + size * Math.sin(angle + 1) * .8]
        trunk(middle, fork, size * .026)
      }
      const radius = upright ? extension * 1.18 : size * range(1.26, 1.69)
      const lobes = near ? 4 : 2
      for (let lobe = 0; lobe < lobes; lobe++) {
        const lobeAngle = angle + lobe * 2.4
        const [cx, cy, cz] = branchEnd
        const core = [
          cx + Math.cos(lobeAngle) * radius * (lobe ? .51 : .05),
          cy + radius * range(-.2, .26),
          cz + Math.sin(lobeAngle) * radius * (lobe ? .51 : .05),
        ]
        const crown = new THREE.Color(choice(treePalette)).multiplyScalar(.83)
        instance(leafCluster, 'green', core, [radius * .68, radius * (upright ? 1.09 : .53), radius * .68],
          [range(-.3, .3), lobeAngle, range(-.26, .26)], { color: crown, shadow: near && lobe === 0 })
        const count = near ? (upright ? 41 : 47) : 10
        for (let j = 0; j < count; j++) {
          const azimuth = range(0, TAU)
          const vertical = range(-1, 1)
          const spread = Math.sqrt(1 - vertical ** 2) * radius * range(.38, .7)
          const xyz = [core[0] + Math.cos(azimuth) * spread, core[1] + vertical * radius * (upright ? 1.06 : .42), core[2] + Math.sin(azimuth) * spread]
          const leafSize = range(.136, .31) * size * (upright ? .78 : 1)
          const color = blossom && random() < .45 ? choice([0xe9c3c1, 0xd7a8b7, 0xf0d3c6, 0xc594a6]) : choice(treePalette)
          instance(leaf, 'green', xyz, [leafSize * 1.36, leafSize, leafSize], [range(-2.4, 2.4), azimuth, range(-1.4, 1.4)],
            { color, shadow: false })
        }
      }
    }
  }
  return { flower, shrub, tuft, tree }
}
