import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createEnvironment } from './environment.js'
import { createCast, animateCharacter } from './characters.js'
import { createWorkshop } from './workshop.js'
import { createNightInquiry } from './night-inquiry.js'
import { reachArm } from './character-contact.js'

const BRIDGE = 'loc.stream_bridge'
const BED = 'loc.bare_bed'
const HOUSE = 'loc.greenhouse'
const EXIT = 'loc.exit_path'
const UPPER = 'loc.upper_stream'
const V = (x, y, z) => new THREE.Vector3(x, y, z)

const heroShot = [[34, 26, 47], [-1, 0.5, 12.5], 45]
const overviewShot = [[51, 44, 61], [0, 1, 10], 48]
const shots = {
  [BRIDGE]: [[24.5, 4.7, 32], [19.05, 0.8, 25.2], 48],
  [BED]: [[32.1, 4.9, 18.3], [27.5, 0.7, 13.2], 48],
  [HOUSE]: [[4.8, 2.5, 16.6], [1.7, 1.35, 12.1], 46],
  [UPPER]: [[27.8, 3.5, 6.0], [23.7, 0.2, 1.6], 48],
  [EXIT]: [[10, 4.0, 44], [6, 1, 37], 48],
  'loc.treehouse': [[-4, 4.7, -5], [-11, 4.0, -12], 50],
  'loc.workshop': [[-12, 3.8, 15], [-18, 2.0, 9], 50],
  'loc.flower_ring': [[7, 4.3, 25.5], [0, 1.0, 20], 48],
  model: [[30.05, 3.95, 17.85], [30.05, 1.0, 14.9], 46],
}
const evidenceShots = {
  bridge_before: [[23.9, 3.65, 29.5], [19.7, 0.65, 25.2], 49],
  bridge_now: [[23.9, 3.65, 29.5], [19.7, 0.65, 25.2], 49],
  upper: [[26.8, 2.8, 5.25], [23.4, 0.0, 1.4], 48],
  path: [[30.7, 6.65, 16.2], [26.25, 0.2, 13.8], 50],
  trial: [[30.7, 3.25, 17.05], [30.7, 1.0, 14.9], 44],
  installed: [[31.5, 4.4, 13.55], [28.25, 0.35, 11.6], 49],
}

const routePoints = {
  [BRIDGE]: [21, 25], [BED]: [29.85, 15.4], [HOUSE]: [0, 13.9],
  [UPPER]: [26, 2.6], [EXIT]: [7, 40],
  'loc.treehouse': [-15.2, -9.9], 'loc.workshop': [-17.7, 12],
  'loc.flower_ring': [2, 25.5], westBridge: [16.5, 25], eastBridge: [25.4, 25],
  eastBend: [27.8, 20.4], eastNorth: [29.4, 10.7], upperBend: [27.5, 6.5],
  eastGarden: [12.7, 16.9], gardenDoor: [6.4, 13.5], gardenFork: [9.2, 20.2],
  southGarden: [12.1, 22.3], southFork: [6.8, 32.8], exitBend: [4.6, 28.5],
  westGarden: [-9.5, 16.2], westLane: [-21.5, 10.2], westWood: [-19.9, -1.2],
}

const routeLinks = [
  [BRIDGE, 'westBridge'], [BRIDGE, 'eastBridge'], ['eastBridge', 'eastBend'],
  ['eastBend', BED], [BED, 'eastNorth'], ['eastNorth', 'upperBend'], ['upperBend', UPPER],
  ['westBridge', 'southGarden'], ['southGarden', 'gardenFork'], ['gardenFork', 'eastGarden'],
  ['eastGarden', 'gardenDoor'], ['gardenDoor', HOUSE], ['gardenFork', 'loc.flower_ring'],
  ['loc.flower_ring', 'exitBend'], ['exitBend', 'southFork'], ['southFork', EXIT],
  ['loc.flower_ring', 'westGarden'], ['westGarden', 'loc.workshop'], ['loc.workshop', 'westLane'],
  ['westLane', 'westWood'], ['westWood', 'loc.treehouse'],
]

function routeBetween(from, to) {
  const queue = [[from]]
  const visited = new Set([from])
  for (const path of queue) {
    const last = path.at(-1)
    if (last === to) return path
    for (const [a, b] of routeLinks) {
      const next = a === last ? b : b === last ? a : null
      if (next && !visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  return [to]
}

function routeCurve(points) {
  const path = new THREE.CurvePath()
  for (let i = 1; i < points.length; i++) {
    if (points[i].distanceToSquared(points[i - 1]) > 0.00001) {
      path.add(new THREE.LineCurve3(points[i - 1], points[i]))
    }
  }
  return path
}

function createBuilder() {
  const resources = new Set()
  const cube = new THREE.BoxGeometry()
  const sphere = new THREE.SphereGeometry(1, 12, 8)
  resources.add(cube).add(sphere)
  const material = (color, parameters = {}) => {
    const result = new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...parameters })
    resources.add(result)
    return result
  }
  const mesh = (group, geometry, material, size, position) => {
    const object = new THREE.Mesh(geometry, material)
    object.position.set(...position)
    object.scale.set(...size)
    object.castShadow = true
    object.receiveShadow = true
    group.add(object)
    return object
  }
  return {
    cube, sphere, material, mesh, resources,
    box: (group, mat, size, pos) => mesh(group, cube, mat, size, pos),
    oval: (group, mat, size, pos) => mesh(group, sphere, mat, size, pos),
    dispose() {
      for (const resource of resources) resource.dispose()
      resources.clear()
    },
  }
}

const castNames = ['Noor', 'Rowan', 'Mei', 'Sam']
const noCast = () => Object.fromEntries(castNames.map(name => [`activeCast${name}`, false]))

function makeCast(scene, builder) { return createCast(scene, builder.resources) }
function animateCast(actor, stride = 0, time = 0) { animateCharacter(actor, stride, time) }

function createTrayModel(scene, builder, position) {
  const { box, material, cube, sphere, resources } = builder
  const model = new THREE.Group()
  model.name = 'model.runoff-comparison'
  model.position.copy(position)
  scene.add(model)

  const clay = material(0x9a856a)
  const trim = material(0x5b4c38)
  const soil = material(0x76533b)
  const grass = material(0x758b62)
  const water = material(0x7195a0, { roughness: 0.35 })
  const flowMaterial = material(0xb4ccd0, { roughness: 0.48 })
  const runoff = material(0x80604a)
  const rain = material(0xbdd1cd, { transparent: true, opacity: 0.65, depthWrite: false })
  const coverMat = material(0xae9060)
  const targets = []
  const dropletCount = 36
  const flowCount = 10
  const particleCount = 30
  const transform = new THREE.Object3D()

  function plaque(group, text) {
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 82
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ebdfc2'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#263a32'
    ctx.font = 'bold 42px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, 42, 348)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const surface = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    const rectangle = new THREE.PlaneGeometry(0.99, 0.205)
    resources.add(texture).add(surface).add(rectangle)
    const label = new THREE.Mesh(rectangle, surface)
    label.rotation.x = -Math.PI / 2
    label.position.set(0, 0.106, 0.405)
    group.add(label)
  }

  const trays = ['NO COVER', 'YOUR PLACEMENT'].map((label, index) => {
    const tray = new THREE.Group()
    tray.position.x = (index - 0.5) * 1.41
    model.add(tray)
    box(tray, clay, [1.28, 0.095, 1.08], [0, 0.048, 0])
    for (const edge of [-1, 1]) {
      box(tray, trim, [0.025, 0.1, 1.08], [edge * 0.627, 0.092, 0])
      box(tray, trim, [1.28, 0.1, 0.025], [0, 0.092, edge * 0.527])
    }

    const source = box(tray, soil, [0.54, 0.16, 0.37], [-0.255, 0.15, -0.305])
    source.rotation.x = -0.10
    const unrelated = box(tray, grass, [0.43, 0.09, 0.56], [0.32, 0.131, -0.217])
    box(tray, clay, [0.52, 0.047, 0.55], [-0.267, 0.115, 0.072])
    box(tray, water, [0.113, 0.011, 0.48], [-0.214, 0.144, 0.041])
    box(tray, water, [0.90, 0.012, 0.16], [0.005, 0.145, 0.213])
    const plate = box(tray, coverMat, [0.46, 0.046, 0.31], [-0.255, 0.247, -0.305])
    plaque(tray, label)

    if (index) {
      for (const [object, action] of [[source, 'model_source'], [unrelated, 'model_unrelated']]) {
        object.userData = { action, locationId: BED }
        targets.push(object)
      }
    }

    const drops = new THREE.InstancedMesh(cube, rain, dropletCount)
    const flow = new THREE.InstancedMesh(cube, flowMaterial, flowCount)
    const particles = new THREE.InstancedMesh(sphere, runoff, particleCount)
    drops.frustumCulled = false
    flow.frustumCulled = false
    particles.frustumCulled = false
    tray.add(drops, flow, particles)
    resources.add(drops).add(flow).add(particles)
    return { plate, drops, flow, particles }
  })

  function draw({ active, position: placement, running, progress }) {
    model.visible = active
    if (!active) return
    for (const [index, { plate, drops, flow, particles }] of trays.entries()) {
      const sourceCovered = index === 1 && placement === 'source_cover_zone'
      plate.visible = index === 1 && placement !== 'no_cover'
      if (plate.visible) {
        plate.position.set(sourceCovered ? -0.255 : 0.32, sourceCovered ? 0.247 : 0.200,
          sourceCovered ? -0.305 : -0.217)
        plate.rotation.x = sourceCovered ? -0.10 : 0
      }
      drops.visible = running
      flow.visible = running
      if (running) {
        for (let i = 0; i < dropletCount; i++) {
          const fall = (progress * 5.7 + i * 0.38197) % 1
          transform.position.set(-0.54 + ((i * 13) % 37) / 34, 0.27 + (1 - fall) * 0.78,
            -0.44 + ((i * 7) % 41) / 62)
          transform.scale.set(0.008, 0.063 + (i % 3) * 0.021, 0.008)
          transform.updateMatrix()
          drops.setMatrixAt(i, transform.matrix)
        }
        drops.instanceMatrix.needsUpdate = true
        for (let i = 0; i < flowCount; i++) {
          const along = (progress * 3.7 + i / flowCount) % 1
          const inBasin = along > 0.62
          transform.position.set(
            inBasin ? -0.21 + (along - 0.62) * 1.65 : -0.214 + (i % 3 - 1) * 0.021,
            0.151,
            inBasin ? 0.213 + (i % 3 - 1) * 0.035 : -0.175 + along * 0.626,
          )
          transform.scale.set(inBasin ? 0.041 : 0.012, 0.003, inBasin ? 0.010 : 0.046)
          transform.updateMatrix()
          flow.setMatrixAt(i, transform.matrix)
        }
        flow.instanceMatrix.needsUpdate = true
      }
      particles.count = Math.floor(Math.min(1, progress * 2.8) * (sourceCovered ? 8 : particleCount))
      for (let i = 0; i < particles.count; i++) {
        const travel = THREE.MathUtils.clamp((progress - i * 0.011) * 1.45, 0, 1)
        const inBasin = travel > 0.75
        const x = inBasin ? -0.214 + Math.min(1, (travel - 0.75) * 4) * ((i % 13) * 0.034) :
          -0.214 + Math.sin(i * 2.4) * 0.038
        const z = -0.26 + Math.min(1, travel / 0.75) * (0.459 + (i % 5) * 0.009)
        transform.position.set(x, 0.155, z)
        transform.scale.setScalar(0.010 + (i % 4) * 0.003)
        transform.updateMatrix()
        particles.setMatrixAt(i, transform.matrix)
      }
      particles.instanceMatrix.needsUpdate = true
    }
  }

  model.visible = false
  return { model, targets, draw }
}

const idle = () => {}
const modelInitial = { active: false, position: 'no_cover', running: false, progress: 0 }

function unavailableAdapter() {
  return {
    goTo: async () => false, overview: idle, cancelNavigation: idle, setWorldState: idle,
    captureEvidence: () => null, setModel: idle, setReducedMotion: idle, setQuality: idle,
    setStoryImages: idle, setSpeaking: idle, setWorkshop: idle, setArtwork: idle, workshopView: idle, captureArtwork: () => null, getStats: () => ({ available: false }), getCastStatus: noCast, getCurrentLocation: () => null,
    getPlacementTransform: () => null, validatePlacement: () => null,
    collectBottle: async () => false, dispose: idle,
    setNightInquiry: async()=>false, captureNightView:()=>null, playNightSequence:async()=>false,stopNightSequence:idle,
  }
}

function makeRoomMap(renderer) {
  const room = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  try {
    return pmrem.fromScene(room, 0.04)
  } finally {
    room.dispose()
    pmrem.dispose()
  }
}

export function createValley(canvas, { onPick = idle, onArrive = idle, onError = idle, onReady = idle } = {}) {
  let renderer
  let environment
  let environmentMap
  const builder = createBuilder()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, 1, 0.06, 230)
  const target = new THREE.Vector3()
  const sun = new THREE.DirectionalLight(0xffe6cd, 2.25)

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.99
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.shadowMap.autoUpdate = false
    scene.background = new THREE.Color(0xcbd9d7)
    scene.fog = new THREE.Fog(0xcbd9d7, 40, 141)
    scene.add(new THREE.HemisphereLight(0xf0f4e9, 0x827264, 0.98))
    sun.position.set(-34, 49, 27)
    sun.target.position.set(2, 0, 12)
    sun.castShadow = true
    sun.shadow.camera.left = -45
    sun.shadow.camera.right = 47
    sun.shadow.camera.top = 42
    sun.shadow.camera.bottom = -44
    sun.shadow.camera.far = 130
    sun.shadow.normalBias = 0.052
    sun.shadow.bias = -0.00012
    sun.shadow.radius = 2.2
    scene.add(sun, sun.target)
    environmentMap = makeRoomMap(renderer)
    scene.environment = environmentMap.texture
    scene.environmentIntensity = 0.29
    environment = createEnvironment(THREE)
    scene.add(environment.group)
  } catch (error) {
    environmentMap?.dispose()
    renderer?.dispose()
    environment?.dispose()
    builder.dispose()
    onError(error)
    return unavailableAdapter()
  }

  const ground = environment.groundHeight ?? (() => 0)
  const tableY = ground(30.7, 14.9) + 0.92
  const trays = createTrayModel(scene, builder, V(30.7, tableY, 14.9))
  const cast = makeCast(scene, builder)
  cast.Iris.group.visible = false
  const workshop = createWorkshop(scene, ground)
  let workshopState = null
  let workshopShot = null
  const night = createNightInquiry(scene, ground)
  let nightState = null
  let nightShot = null
  const hemisphere = scene.children.find(o=>o.isHemisphereLight)
  const bottle = environment.group.getObjectByName('obj.bridge.bottle')
  const bottleStart = bottle?.position.clone()
  const bottleRotation = bottle?.quaternion.clone()
  const bottleEnd = environment.group.getObjectByName('obj.litter.container')
  const pickTargets = [...environment.interactables, ...trays.targets, ...workshop.targets]
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const bridgeSpeaking = { Noor: [23.45, 25.42], Rowan: [23.19, 24.58], Mei: [24.35, 24.57] }
  const bedSpeaking = { Noor: [28.2, 16.0], Rowan: [29.2, 16.65], Mei: [29.65, 13.95], Sam: [32.22, 14.28] }
  const activeStages = {
    [BRIDGE]: bridgeSpeaking, [BED]: bedSpeaking, [HOUSE]: { Noor: [1.43, 14.25], Rowan: [-1.43, 14.22], Mei: [3.3, 12.0] },
  }
  let modelState = { ...modelInitial }
  let navigation
  let pickup
  let currentLocation = null
  let cameraRoute = null
  let quality = 'standard'
  let reducedMotion = false
  let disposed = false
  let lost = false
  let notified = false
  let meiVisitedBed = false
  let frameId = 0
  let lastTime = 0
  let elapsed = 0
  let frameMilliseconds = 0
  let down = null
  let atOverview = true
  let activeOverviewShot = heroShot
  let dirty = true
  let lastShadowUpdate = -Infinity

  function floorAt(x, z) {
    if (x >= 17 && x <= 25 && Math.abs(z - 25) <= 1.14) {
      return 0.54 + Math.sin((x - 17) / 8 * Math.PI) * 0.63
    }
    return ground(x, z)
  }

  function walkingPoint(x, z, lift = 0) {
    return V(x, floorAt(x, z) + lift, z)
  }

  function waypoint(id, lift = 0) {
    return walkingPoint(...routePoints[id], lift)
  }

  function nearestRoute(position) {
    let closest
    let distance = Infinity
    for (const id of Object.keys(routePoints)) {
      const point = waypoint(id)
      const distanceSquared = (point.x - position.x) ** 2 + (point.z - position.z) ** 2
      if (distanceSquared < distance) {
        closest = id
        distance = distanceSquared
      }
    }
    return closest
  }

  function castMark(name, location) {
    if (nightState) {
      const place=nightState.location||'stairs'
      if(name==='Sam') {
        if(night.sequenceConfig?.board||nightState.boardTest)return walkingPoint(-13.48,-3.17,.22)
        if(place==='workshop')return walkingPoint(-18.8,11.1)
        if(nightState.held)return walkingPoint(-15.03,-6.60)
        return walkingPoint(-14.45,-6.65)
      }
      if(name==='Mei')return walkingPoint(-15.1,-4.35)
      if(place==='stairs')return walkingPoint(-17.1,-5.35)
      if(place==='other')return walkingPoint(-18.2,-7.4)
      if(place==='doorway')return walkingPoint(-16.65,-4.7)
      return walkingPoint(-16.0,12.0)
    }
    if (workshopState && ['Sam', 'Iris'].includes(name)) {
      const [x, , z] = workshop.locations[workshopState.artwork?.location || 'workshop'] || workshop.locations.workshop
      if (workshopState.artwork?.location === 'flower') {
        if (name === 'Sam') return walkingPoint(-6.35, z - 1.25)
        return workshopState.view === 'side' ? walkingPoint(-6.65,z+.65) : walkingPoint(-6.0,z+1.25)
      }
      if (name === 'Iris' && workshopState.view === 'side') return walkingPoint(x-.6,z+.94)
      if (name === 'Iris' && workshopState.artwork?.location === 'workshop') return walkingPoint(x+.95,z+1.05)
      return walkingPoint(x + (name === 'Sam' ? -1.43 : 1.43), z + (name === 'Sam' ? -.15 : -.3))
    }
    const authored = activeStages[location]?.[name]
    if (authored) return walkingPoint(...authored)
    const [x, z] = routePoints[location]
    return walkingPoint(x + (name === 'Noor' ? 0.55 : -0.66), z + 0.74)
  }

  function castLook(name, location) {
    if(nightState)return nightState.location==='workshop'?V(-17.45,ground(-17.45,11.4)+1.5,11.4):V(...night.center)
    if (workshopState && ['Sam', 'Iris'].includes(name)) return workshop.focusPoint()
    if (location === HOUSE && name === 'Mei') return V(3.0, 0, 16.8)
    if (location === BED) return trays.model.position
    return V(...shots[location][0])
  }

  function turnTo(actor, point) {
    const { x, z } = actor.group.position
    actor.group.rotation.y = Math.atan2(point.x - x, point.z - z)
  }

  function standAt(actor, name, location) {
    actor.group.position.copy(castMark(name, location))
    actor.location = location
    actor.stage = null
    animateCast(actor)
    turnTo(actor, castLook(name, location))
  }

  standAt(cast.Noor, 'Noor', BRIDGE)
  standAt(cast.Rowan, 'Rowan', BRIDGE)
  standAt(cast.Mei, 'Mei', HOUSE)
  standAt(cast.Sam, 'Sam', BED)

  function makeCastPlans(destination) {
    const presence = nightState ? {Rowan:destination,Sam:nightState.location==='workshop'?'loc.workshop':'loc.treehouse',Mei:HOUSE} : workshopState ? { Sam: destination, Iris: destination } : { Noor: destination, Rowan: destination, Sam: BED }
    if (!workshopState && !nightState && destination === BED) presence.Mei = BED
    if (!workshopState && !nightState && destination === HOUSE) presence.Mei = HOUSE
    if (!workshopState && !nightState && destination === BRIDGE && meiVisitedBed) presence.Mei = BRIDGE
    return Object.entries(presence).map(([name, location]) => {
      const actor = cast[name]
      if (actor.location === location && !actor.stage && (!(workshopState||nightState) || actor.group.position.distanceToSquared(castMark(name, location)) < .001)) return null
      const from = actor.location ?? nearestRoute(actor.group.position)
      const points = (workshopState||nightState) && actor.location === location ? [] : routeBetween(from, location).map(id => waypoint(id))
      const path = routeCurve([actor.group.position.clone(), ...points, castMark(name, location)])
      const entry = { actor, name, location, path }
      actor.stage = entry
      actor.location = null
      return entry
    }).filter(Boolean)
  }

  function shotData(shot, aspect = camera.aspect) {
    const [position, aim, fov] = shot
    const point = V(...position)
    const focus = V(...aim)
    if (shot === shots.model || shot === evidenceShots.trial) {
      point.y += tableY - 0.92
      focus.y += tableY - 0.92
    }
    if (shot === shots.model && aspect < 1.17) {
      const center = 0.65 * (1 - Math.max(0, aspect - 0.68) / 0.49)
      point.x += center
      focus.x += center
    }
    const baseAspect = shot.night ? 1.08 : shot.workshop ? .95 : shot === overviewShot || shot === heroShot ? 1.33 : 1.17
    const portraitScale = Math.max(1, Math.min(2.2, baseAspect / Math.max(0.3, aspect)))
    point.sub(focus).multiplyScalar(portraitScale).add(focus)
    return { point, focus, fov }
  }

  function applyShot(shot) {
    const { point, focus, fov } = shotData(shot)
    camera.position.copy(point)
    target.copy(focus)
    camera.fov = fov
    camera.updateProjectionMatrix()
    camera.lookAt(target)
  }

  function resize() {
    if (disposed) return
    const { width, height } = canvas.getBoundingClientRect()
    const oldAspect = camera.aspect
    camera.aspect = Math.max(1, width) / Math.max(1, height)
    renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    if (oldAspect !== camera.aspect && !navigation && (atOverview || currentLocation)) {
      applyShot(nightState&&nightShot?makeNightShot():workshopState && workshopShot && !atOverview ? makeWorkshopShot(workshopState.view) : atOverview ? activeOverviewShot : shots[cameraRoute])
    }
    camera.updateProjectionMatrix()
    dirty = true
  }

  function setQuality(next) {
    if (disposed) return
    quality = next === 'high' ? 'high' : 'standard'
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, quality === 'high' ? 2 : 1.5))
    const shadowResolution = quality === 'high' ? 2048 : 1024
    if (sun.shadow.mapSize.width !== shadowResolution) {
      sun.shadow.map?.dispose()
      sun.shadow.map = null
      sun.shadow.mapSize.set(shadowResolution, shadowResolution)
      renderer.shadowMap.needsUpdate = true
    }
    resize()
  }

  applyShot(heroShot)
  setQuality('standard')
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)

  function cancelNavigation() {
    if (!navigation) return
    const pending = navigation
    for (const { actor } of pending.castPlans) {
      actor.stage = null
      animateCast(actor)
    }
    navigation = null
    pending.resolve(false)
  }

  function travel(shot, destination, routeId, resolve) {
    const goingOverview = destination === null
    const end = shotData(shot)
    const castPlans = goingOverview ? [] : makeCastPlans(destination)
    const lastRoute = cameraRoute === 'model' ? BED : cameraRoute
    const actual = currentLocation === destination ? destination : nearestRoute(camera.position)
    const via = []
    if (!goingOverview && atOverview) {
      const [x, z] = routePoints[destination]
      via.push(V(x + 7, Math.max(end.point.y + 9, 13), z + 9))
    } else if (!goingOverview && lastRoute !== destination) {
      const from = atOverview ? lastRoute : actual
      for (const id of routeBetween(from, destination)) via.push(waypoint(id, id === BRIDGE ? 2.1 : 3.4))
    }
    const path = routeCurve([camera.position.clone(), ...via, end.point])
    const castDistance = Math.max(0, ...castPlans.map(plan => plan.path.getLength()))
    const duration = THREE.MathUtils.clamp(1.8 + Math.max(path.getLength(), castDistance) * 0.04, 2.1, 3.8)
    navigation = { path, end, shot, destination, routeId, resolve, castPlans, duration, time: 0,
      originFocus: target.clone(), startFov: camera.fov }
  }

  function goTo(locationId) {
    const destination = locationId === 'model' ? BED : locationId
    if (disposed || lost || !environment.anchors[destination] || !shots[locationId]) return Promise.resolve(false)
    cancelNavigation()
    return new Promise(resolve => travel(shots[locationId], destination, locationId, resolve))
  }

  function overview() {
    if (disposed || lost) return
    cancelNavigation()
    if (!atOverview || activeOverviewShot !== overviewShot) travel(overviewShot, null, null, idle)
  }

  function advanceNavigation(dt) {
    if (!navigation) return null
    const transition = navigation
    transition.time += dt
    const progress = reducedMotion ? 1 : Math.min(1, transition.time / transition.duration)
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1)
    if (transition.path.curves.length) transition.path.getPoint(eased, camera.position)
    target.lerpVectors(transition.originFocus, transition.end.focus, eased)
    camera.fov = THREE.MathUtils.lerp(transition.startFov, transition.end.fov, eased)
    camera.updateProjectionMatrix()
    camera.lookAt(target)
    for (const plan of transition.castPlans) {
      const { actor, name, location, path } = plan
      if (progress === 1) {
        standAt(actor, name, location)
      } else if (path.curves.length) {
        path.getPoint(eased, actor.group.position)
        actor.group.position.y = floorAt(actor.group.position.x, actor.group.position.z)
        turnTo(actor, path.getPoint(Math.min(1, eased + 0.012)))
        animateCast(actor, Math.sin(progress * Math.PI) * 0.55, elapsed)
      }
    }
    if (progress < 1) return null
    navigation = null
    applyShot(transition.shot)
    atOverview = transition.destination === null
    if (atOverview) {
      activeOverviewShot = transition.shot
    } else {
      currentLocation = transition.destination
      cameraRoute = transition.routeId
      if (currentLocation === BED && cast.Mei.location === BED) meiVisitedBed = true
    }
    return transition
  }

  function visible(object) {
    for (let ancestor = object; ancestor; ancestor = ancestor.parent) {
      if (!ancestor.visible) return false
    }
    return true
  }

  function pointerDown(event) {
    if (event.isPrimary && event.button === 0) down = { x: event.clientX, y: event.clientY }
  }

  function pointerUp(event) {
    const start = down
    down = null
    if (!start || navigation || lost || disposed ||
        Math.hypot(start.x - event.clientX, start.y - event.clientY) > 8) return
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2)
    raycaster.setFromCamera(pointer, camera)
    for (const intersection of raycaster.intersectObjects(pickTargets, true)) {
      if (!visible(intersection.object)) continue
      let object = intersection.object
      while (object && !object.userData.action) object = object.parent
      if (!object) continue
      const { action, locationId } = object.userData
      onPick({ action, locationId })
      break
    }
  }

  function pointerCancel() {
    down = null
  }

  function resetPickup() {
    if (pickup) {
      pickup.resolve(false)
      pickup = null
    }
    if (bottle) {
      bottle.position.copy(bottleStart)
      bottle.quaternion.copy(bottleRotation)
    }
  }

  function collectBottle() {
    if (disposed || lost || navigation || !bottle || !visible(bottle) || pickup) return Promise.resolve(false)
    bottle.parent.updateWorldMatrix(true, false)
    const end = bottleEnd
      ? bottleEnd.getWorldPosition(new THREE.Vector3()).add(V(0, 0.09, 0))
      : V(16.4, floorAt(16.4, 26.4) + 0.75, 26.4)
    bottle.parent.worldToLocal(end)
    return new Promise(resolve => {
      pickup = { start: bottle.position.clone(), end, time: 0, resolve }
    })
  }

  function advancePickup(dt) {
    if (!pickup) return null
    pickup.time += dt
    const progress = reducedMotion ? 1 : Math.min(1, pickup.time / 0.68)
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1)
    bottle.position.lerpVectors(pickup.start, pickup.end, eased)
    bottle.position.y += Math.sin(eased * Math.PI) * 0.92
    bottle.rotateZ(dt * 2.3)
    if (progress < 1) return null
    const finish = pickup.resolve
    pickup = null
    return finish
  }

  function setWorldState(fields) {
    if (disposed) return
    resetPickup()
    environment.setWorldState(fields)
    if (fields['session.layoutVersion'] === 'unbound') {
      cancelNavigation()
      currentLocation = null
      cameraRoute = null
      atOverview = true
      activeOverviewShot = heroShot
      applyShot(heroShot)
      meiVisitedBed = false
      standAt(cast.Noor, 'Noor', BRIDGE)
      standAt(cast.Rowan, 'Rowan', BRIDGE)
      standAt(cast.Mei, 'Mei', HOUSE)
      standAt(cast.Sam, 'Sam', BED)
    }
    if (fields['model.trials']?.length) meiVisitedBed = true
    dirty = true
    renderer.shadowMap.needsUpdate = true
  }

  function setModel(options) {
    if (disposed) return
    const previous = modelState
    modelState = { ...modelState, ...options }
    if (!['no_cover', 'source_cover_zone', 'unrelated_zone'].includes(modelState.position)) modelState.position = 'no_cover'
    modelState.progress = THREE.MathUtils.clamp(Number(modelState.progress) || 0, 0, 1)
    trays.draw(modelState)
    dirty = true
    if (previous.active !== modelState.active || previous.position !== modelState.position) {
      renderer.shadowMap.needsUpdate = true
    }
  }

  function makeWorkshopShot(view = 'front', centered = false) {
    const p = workshop.focusPoint()
    const wide = workshopState?.stage === 'entry' || ['share', 'label', 'place', 'visit', 'end'].includes(workshopState?.stage)
    const immersive=typeof document!=='undefined'&&document.body.classList.contains('immersive')
    const dist = wide ? 5.1 : immersive ? (camera.aspect<1.3?4.6:3.9) : 2.9
    const side = view === 'side'
    const byFlowers = workshopState?.artwork?.location === 'flower'
    const direction = byFlowers ? (side ? V(.39,.32,.92) : V(1,.27,.22)) : side ? V(.92, .32, .39) : V(.22, .27, 1)
    const eye = p.clone().add(direction.multiplyScalar(dist))
    // Leave the actual work in the clear right-hand area of the desktop UI.
    // On portrait screens the story is below the viewport, so recenter it.
    const shift = !immersive && !centered && camera.aspect >= 1.17 ? (wide ? -.94 : -.51) : 0
    const right = V(direction.z, 0, -direction.x).normalize()
    const aim = p.clone().addScaledVector(right, shift)
    eye.addScaledVector(right, shift)
    if (!immersive && !centered && camera.aspect < 1.17) {aim.y -= .36;eye.y -= .36}
    const shot = [eye.toArray(), aim.toArray(), wide ? 43 : 40]
    shot.workshop = true
    return shot
  }

  function workshopView(view = 'front') {
    if (!workshopState || disposed || lost) return Promise.resolve(false)
    workshopState = { ...workshopState, view: view === 'side' ? 'side' : 'front' }
    workshopShot = makeWorkshopShot(workshopState.view)
    const destination = workshopState.artwork?.location === 'workshop' ? 'loc.workshop' : 'loc.flower_ring'
    cancelNavigation()
    dirty = true
    return new Promise(resolve => travel(workshopShot, destination, destination, resolve))
  }

  function setWorkshop(value) {
    if (disposed) return Promise.resolve(false)
    const old = workshopState
    workshopState = value ? { ...value, view: value.view || 'front' } : null
    workshop.setActive(!!value)
    cast.Iris.group.visible = !!value
    if (!value) {workshopShot = null; return Promise.resolve(true)}
    workshop.setArtwork(value.artwork)
    trays.draw({ ...modelState, active: false })
    if (!old) {
      standAt(cast.Sam, 'Sam', 'loc.workshop')
      standAt(cast.Iris, 'Iris', 'loc.workshop')
    }
    dirty = true
    renderer.shadowMap.needsUpdate = true
    if (!old || old.stage !== value.stage || old.view !== workshopState.view || old.artwork?.location !== value.artwork?.location) return workshopView(workshopState.view)
    return Promise.resolve(true)
  }

  function makeNightShot(){
    const loc=nightState?.location||'stairs',g=ground
    let shot
    if(loc==='other')shot=[[-21.4,g(-21.4,-5.5)+2.0,-5.5],[-15.5,night.groundY+1.65,-7.4],49]
    else if(loc==='doorway')shot=[[-13.0,g(-13.0,1.2)+2.2,1.2],[-15.05,night.groundY+1.35,-6.9],48]
    else if(loc==='workshop')shot=[[-17.4,g(-17.4,16)+2.0,16],[-17.5,g(-17.5,11.3)+1.25,11.3],52]
    else shot=[[-17.2,g(-17.2,-.7)+1.8,-.7],[-14.8,night.groundY+1.35,-6.4],52]
    shot.night=true;return shot
  }
  function nightLighting(active){
    scene.background.set(active?0x3b546b:0xcbd9d7);scene.fog.color.copy(scene.background);scene.fog.far=active?105:141
    sun.color.set(active?0xb7c8e0:0xffe6cd);sun.intensity=active?.36:2.25
    hemisphere.color.set(active?0xb7cbe4:0xf0f4e9);hemisphere.groundColor.set(active?0x576254:0x827264);hemisphere.intensity=active?.52:.98
    scene.environmentIntensity=active?.14:.29;renderer.toneMappingExposure=active?1.1:.99
  }
  function stopNightSequence(){night.stop();dirty=true;renderer.shadowMap.needsUpdate=true;return false}
  function setNightInquiry(value){
    if(disposed||lost)return Promise.resolve(false)
    const old=nightState;nightState=value?{...value}:null
    night.setState(nightState);nightLighting(!!value)
    if(!value){nightShot=null;cast.Noor.group.visible=true;cast.Mei.group.visible=true;return Promise.resolve(true)}
    workshopState=null;workshopShot=null;workshop.setActive(false);cast.Iris.group.visible=false;cast.Noor.group.visible=false
    cast.Mei.group.visible=value.location==='doorway';cast.Rowan.group.visible=true;cast.Sam.group.visible=true
    trays.draw({...modelState,active:false})
    if(!old){standAt(cast.Rowan,'Rowan','loc.treehouse');standAt(cast.Sam,'Sam','loc.treehouse');standAt(cast.Mei,'Mei',HOUSE)}
    dirty=true;renderer.shadowMap.needsUpdate=true
    if(!old||old.location!==value.location||old.stage!==value.stage||old.boardTest!==value.boardTest||old.held!==value.held){
      cancelNavigation();nightShot=makeNightShot();const destination=value.location==='workshop'?'loc.workshop':'loc.treehouse'
      return new Promise(resolve=>travel(nightShot,destination,destination,resolve))
    }
    return Promise.resolve(true)
  }
  function playNightSequence(options,onEvent){
    if(!nightState||lost||disposed)return Promise.resolve(false)
    if(options?.board)standAt(cast.Sam,'Sam','loc.treehouse')
    dirty=true;return night.start(options,event=>{
      const observer=V(...(night.grounds[nightState?.location]||night.grounds.stairs)).add(V(0,1.6,0))
      const delta=V(...event.position).sub(observer),right=V(1,0,0).applyQuaternion(camera.quaternion)
      const pan=THREE.MathUtils.clamp(delta.dot(right)/Math.max(.1,delta.length()),-.85,.85)
      const gain=THREE.MathUtils.clamp(4/(delta.length()+1),.36,1)*(nightState?.location==='other'?.86:1)
      onEvent?.({...event,pan,gain})
    })
  }
  function captureNightView(){
    if(!nightState||lost||disposed)return null
    renderer.render(scene,camera)
    try{return canvas.toDataURL('image/jpeg',.86)}catch{return null}
  }

  function captureArtwork() {
    if (disposed || lost || !workshop.getState()) return null
    const size=renderer.getSize(new THREE.Vector2()), ratio=renderer.getPixelRatio()
    const aspect=camera.aspect, fov=camera.fov, position=camera.position.clone(), quaternion=camera.quaternion.clone(), aim=target.clone()
    let image=null
    try {
      renderer.setPixelRatio(1);renderer.setSize(900,600,false);camera.aspect=1.5
      applyShot(makeWorkshopShot(workshopState?.view || 'front', true))
      renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera)
      image=canvas.toDataURL('image/jpeg',.86)
    } catch { image=null }
    finally {
      camera.aspect=aspect;camera.fov=fov;camera.position.copy(position);camera.quaternion.copy(quaternion);target.copy(aim);camera.updateProjectionMatrix()
      renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);renderer.shadowMap.needsUpdate=true;dirty=true
    }
    return image
  }

  function captureEvidence(kind, trialState = {}) {
    if (disposed || lost || !evidenceShots[kind]) return null
    const priorSize = renderer.getSize(new THREE.Vector2())
    const priorPixelRatio = renderer.getPixelRatio()
    const priorAspect = camera.aspect
    const priorFov = camera.fov
    const priorPosition = camera.position.clone()
    const priorQuaternion = camera.quaternion.clone()
    const priorTarget = target.clone()
    const priorCastVisibility = Object.values(cast).map(actor => actor.group.visible)
    let image = null
    try {
      renderer.setPixelRatio(1)
      renderer.setSize(800, 480, false)
      camera.aspect = 800 / 480
      applyShot(evidenceShots[kind])
      for (const actor of Object.values(cast)) actor.group.visible = false
      trays.draw({ ...modelState, ...trialState, active: kind === 'trial', running: false })
      environment.setObservation(kind === 'bridge_before' ? 'before_rain' : kind === 'upper' ? 'upper' : 'current')
      renderer.shadowMap.needsUpdate = true
      renderer.render(scene, camera)
      const data = canvas.toDataURL('image/jpeg', 0.78)
      if (data.startsWith('data:image/jpeg;base64,')) image = data
    } catch {
      image = null
    } finally {
      camera.aspect = priorAspect
      camera.fov = priorFov
      camera.position.copy(priorPosition)
      camera.quaternion.copy(priorQuaternion)
      target.copy(priorTarget)
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(priorPixelRatio)
      renderer.setSize(priorSize.x, priorSize.y, false)
      Object.values(cast).forEach((actor, index) => { actor.group.visible = priorCastVisibility[index] })
      environment.setObservation('current')
      trays.draw(modelState)
      renderer.shadowMap.needsUpdate = true
      dirty = true
    }
    return image
  }

  function getCastStatus() {
    if (disposed || lost || navigation) return noCast()
    const location = currentLocation ?? BRIDGE
    return Object.fromEntries(castNames.map(name =>
      [`activeCast${name}`, cast[name].location === location && cast[name].stage === null]))
  }

  function contextLost(event) {
    event.preventDefault()
    lost = true
    notified = false
    cancelAnimationFrame(frameId)
    cancelNavigation()
    resetPickup()
    onError(new Error('The valley lost its graphics context. It can resume if the browser restores WebGL.'))
  }

  function contextRestored() {
    if (disposed) return
    try {
      const restoredMap = makeRoomMap(renderer)
      environmentMap.dispose()
      environmentMap = restoredMap
      scene.environment = restoredMap.texture
    } catch (error) {
      onError(error)
      return
    }
    lost = false
    lastTime = 0
    renderer.shadowMap.needsUpdate = true
    resize()
    frameId = requestAnimationFrame(frame)
  }

  function frame(time) {
    if (disposed || lost) return
    const actualFrameTime = lastTime ? time - lastTime : 16.67
    const dt = actualFrameTime / 1000
    frameMilliseconds = frameMilliseconds * 0.92 + actualFrameTime * 0.08
    lastTime = time
    elapsed += Math.min(0.05, dt)
    const moving = navigation || pickup
    const completed = advanceNavigation(dt)
    const collected = advancePickup(dt)
    try {
      if (dirty || moving || night.running || workshopState?.moving || !reducedMotion || !notified) {
        if ((moving && time - lastShadowUpdate >= 150) || completed || collected || !notified) {
          renderer.shadowMap.needsUpdate = true
          lastShadowUpdate = time
        }
        for (const actor of Object.values(cast)) if (!actor.stage) animateCast(actor, 0, reducedMotion ? 0 : elapsed)
        environment.update(reducedMotion ? 0 : Math.min(0.05, dt), reducedMotion ? 0 : elapsed)
        if (workshop.update(Math.min(.05, dt), workshopState?.moving)) renderer.shadowMap.needsUpdate = true
        if(night.update(Math.min(.1,dt))){renderer.shadowMap.needsUpdate=true;if(night.sequenceConfig?.board){cast.Sam.group.position.y=floorAt(-13.48,-3.17)+.22-night.boardPulse*.022;cast.Sam.torso.rotation.x=.045*night.boardPulse}}
        if(nightState?.held&&!cast.Sam.stage){
          const grip=night.gripTarget.getWorldPosition(new THREE.Vector3());
          cast.Sam.contact=reachArm(cast.Sam,1,grip);renderer.shadowMap.needsUpdate=true;
        }else cast.Sam.contact=null
        renderer.render(scene, camera)
        dirty = false
      }
    } catch (error) {
      lost = true
      cancelNavigation()
      completed?.resolve(false)
      collected?.(false)
      resetPickup()
      onError(error)
      return
    }
    frameId = requestAnimationFrame(frame)
    if (!notified) {
      notified = true
      onReady()
    }
    if (completed) {
      if (completed.destination) onArrive(completed.destination)
      completed.resolve(true)
    }
    collected?.(true)
  }

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frameId)
    cancelNavigation()
    resetPickup()
    resizeObserver.disconnect()
    canvas.removeEventListener('pointerdown', pointerDown)
    canvas.removeEventListener('pointerup', pointerUp)
    canvas.removeEventListener('pointercancel', pointerCancel)
    canvas.removeEventListener('webglcontextlost', contextLost)
    canvas.removeEventListener('webglcontextrestored', contextRestored)
    environment.dispose()
    workshop.dispose()
    night.dispose()
    sun.shadow.dispose()
    environmentMap.dispose()
    builder.dispose()
    renderer.dispose()
  }

  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  canvas.addEventListener('webglcontextlost', contextLost)
  canvas.addEventListener('webglcontextrestored', contextRestored)
  frameId = requestAnimationFrame(frame)

  return {
    goTo, overview, cancelNavigation, setWorldState, captureEvidence, setModel, setQuality, dispose, collectBottle,
    setWorkshop, workshopView, captureArtwork,
    setNightInquiry,captureNightView,playNightSequence,stopNightSequence,
    setArtwork(value) {workshop.setArtwork(value);dirty=true;renderer.shadowMap.needsUpdate=true},
    async setStoryImages(images) { await environment.setStoryImages?.(images); dirty = true },
    setReducedMotion(value) { reducedMotion = Boolean(value); dirty = true },
    setSpeaking(name, active = true) { for (const [id, actor] of Object.entries(cast)) actor.speaking = active && id.toLowerCase() === String(name).toLowerCase(); dirty = true },
    getCurrentLocation: () => currentLocation,
    getCastStatus,
    getPlacementTransform: zone => environment.getPlacementTransform?.(zone) ?? null,
    validatePlacement: transform => environment.validatePlacement?.(transform) ?? null,
    getStats() {
      return { available: !lost && !disposed, quality, frameMilliseconds, nightContact:cast.Sam.contact?{...cast.Sam.contact}:null,
        pixelRatio: renderer.getPixelRatio(), ...renderer.info.render }
    },
  }
}
