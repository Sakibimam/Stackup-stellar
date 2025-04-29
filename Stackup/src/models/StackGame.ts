import * as THREE from "three";
import * as CANNON from "cannon";
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
} from "@stellar/freighter-api";

export const connectWalletAndGetPublicKey = async (): Promise<string> => {
  // Step 1: Check if Freighter is installed
  const connectionStatus = await isConnected();
  if (!connectionStatus.isConnected) {
    throw new Error("Freighter is not installed or not accessible.");
  }

  // Step 2: Check if the app is already allowed
  const permissionStatus = await isAllowed();
  if (!permissionStatus.isAllowed) {
    const setPermission = await setAllowed();
    if (!setPermission.isAllowed) {
      throw new Error("User denied permission to connect with Freighter.");
    }
  }

  // Step 3: Request access (this will return the public key)
  const accessResult = await requestAccess();
  if (accessResult.error || !accessResult.address) {
    throw new Error(accessResult.error || "Failed to get public key.");
  }

  return accessResult.address;
};



import {
  AddBlockArgs,
  AddFallBlockArgs,
  Block,
  CreateBlockArgs,
  GameState,
  Sizes,
} from "../entities/entities";

import { getElements } from "../helpers/getElements";

export class StackGame {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private world: CANNON.World;

  private sizes: Sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  private blockSizes: Sizes = {
    height: 1,
    width: 3,
    depth: 3,
  };
  private blockSpeed: number = 0.080;

  private gameState: GameState = {
    gameStarted: false,
    isMovingForward: false,
    blocks: [],
    fallBlocks: [],
  };

  constructor(public canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#FDF1B0");
    this.world = new CANNON.World();

    // Camera
    const cameraAspect = this.sizes.width / this.sizes.height;
    const cameraWidth = 15;
    const cameraHeight = cameraWidth / cameraAspect;

    this.camera = new THREE.OrthographicCamera(
      cameraWidth / -2,
      cameraWidth / 2,
      cameraHeight / 2,
      cameraHeight / -2,
      1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    this.addCamera();
    this.addLights();
    this.addEventListeners();

    this.initialConfigGame();

    this.render();
    this.animate();
  }

  private addCamera(): void {
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.camera);
  }

  private addLights(): void {
    const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.6);
    const directionalLight = new THREE.DirectionalLight("#FFFFFF", 0.6);

    directionalLight.position.set(10, 20, 0);

    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  private addEventListeners(): void {
    const { playButton } = getElements();
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("click", this.onWindowClick.bind(this));

    playButton.addEventListener("click", this.onGameStart.bind(this));
  }

  private addBlock({ coords, sizes, direction }: AddBlockArgs): void {
    const { blocks } = this.gameState;

    const y = coords.y ? coords.y : sizes.height * blocks.length;

    const block = this.createBlock({
      coords: {
        x: coords.x,
        y: y,
        z: coords.z,
      },
      sizes: sizes,
      isBlockFalling: false,
    });

    block.direction = direction;

    blocks.push(block as Block);
  }

  private addFallBlock({ coords, sizes }: AddFallBlockArgs): void {
    const { blocks, fallBlocks } = this.gameState;

    const y = coords.y
      ? coords.y
      : this.blockSizes.height * (blocks.length - 1);

    const fallBlock = this.createBlock({
      coords: {
        x: coords.x,
        y: y,
        z: coords.z,
      },
      sizes: sizes,
      isBlockFalling: true,
    });

    fallBlocks.push(fallBlock as Block);
  }

  private configWorld(): void {
    this.world.gravity.set(0, -10, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 40;
  }

  private initialConfigGame(): void {
    const { blocks, fallBlocks } = this.gameState;

    const allBlocks: Block[] = blocks.concat(fallBlocks);

    for (const block of allBlocks) {
      const mesh = block.mesh;

      mesh.geometry.dispose();
      mesh.material.dispose();
      this.scene.remove(mesh);
    }

    this.gameState.blocks = [];
    this.gameState.fallBlocks = [];
    this.gameState.isMovingForward = false;

    // Base
    this.addBlock({
      coords: { x: 0, z: 0 },
      sizes: { ...this.blockSizes },
      direction: "z",
    });
    // First Block
    this.addBlock({
      coords: { x: -10, z: 0 },
      sizes: { ...this.blockSizes },
      direction: "x",
    });

    this.camera.position.y = 4;
    this.camera.updateProjectionMatrix();

    this.configWorld();
  }

  private render(): void {
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private onWindowClick(e: Event): void {
    const { lastScore, score, menu } = getElements();
    const { blocks, gameStarted } = this.gameState;

    const target = e.target as HTMLElement;
    const id = target.id;

    if (!gameStarted || id === "playbtn") return;

    const topBlock = blocks[blocks.length - 1];
    const bottomBlock = blocks[blocks.length - 2];

    const direction = topBlock.direction!;

    const delta =
      topBlock.mesh.position[direction] - bottomBlock.mesh.position[direction];

    const absDelta = Math.abs(delta);

    const size =
      direction === "x" ? topBlock.sizes.width : topBlock.sizes.depth;

    const overlap = size! - absDelta;

    if (overlap < 0) {
      this.renderer.setAnimationLoop(null);

      lastScore.innerHTML = `Last Score: ${score.innerHTML}`;
      score.innerHTML = "0";
      score.style.display = "none";
      menu.style.display = "flex";

      this.gameState.gameStarted = false;

      return;
    }

    this.gameState.isMovingForward = false;
    score.innerHTML = `${Number(score.innerHTML) + 9}`;

    const newBlockWidth = direction === "x" ? overlap : topBlock.sizes.width;
    const newBlockDepth = direction === "z" ? overlap : topBlock.sizes.depth;

    topBlock.sizes.width = newBlockWidth;
    topBlock.sizes.depth = newBlockDepth;

    topBlock.mesh.scale[direction] = overlap / size!;
    topBlock.mesh.position[direction] -= delta / 2;
    topBlock.body.position[direction] -= delta / 2;

    const shape = new CANNON.Box(
      new CANNON.Vec3(
        newBlockWidth / 2,
        this.blockSizes.height / 2,
        newBlockDepth! / 2
      )
    );

    topBlock.body.shapes = [];
    topBlock.body.addShape(shape);

    // Fall Part

    const fallBlock = (overlap / 2 + absDelta / 2) * Math.sign(delta);
    const fallBlockX =
      direction === "x"
        ? topBlock.mesh.position.x + fallBlock
        : topBlock.mesh.position.x;
    const fallBlockZ =
      direction === "z"
        ? topBlock.mesh.position.z + fallBlock
        : topBlock.mesh.position.z;

    const fallBlockWidth = direction === "x" ? absDelta : newBlockWidth;
    const fallBlockDepth = direction === "z" ? absDelta : newBlockDepth;

    this.addFallBlock({
      coords: { x: fallBlockX, z: fallBlockZ },
      sizes: {
        width: fallBlockWidth,
        height: this.blockSizes.height,
        depth: fallBlockDepth,
      },
    });

    // End Fall Part

    const newBlockX = direction === "x" ? topBlock.mesh.position.x : -10;
    const newBlockZ = direction === "z" ? topBlock.mesh.position.z : -10;

    const newBlockDirection = direction === "x" ? "z" : "x";

    this.addBlock({
      coords: { x: newBlockX, z: newBlockZ },
      sizes: {
        height: this.blockSizes.height,
        width: newBlockWidth,
        depth: newBlockDepth,
      },
      direction: newBlockDirection,
    });
  }

  // private onGameStart(): void { 
    public onGameStart(): void {
    const { score, menu } = getElements();
    const { gameStarted } = this.gameState;

    if (gameStarted) return;

    this.initialConfigGame();

    score.style.display = "block";
    score.style.color = "#ffffff";

    menu.style.display = "none";

    this.renderer.setAnimationLoop(this.animate.bind(this));
    this.gameState.gameStarted = true;
  }

  private createBlock({
    coords,
    sizes,
    isBlockFalling,
  }: CreateBlockArgs): Block {
    const { blocks } = this.gameState;
    const { x, y, z } = coords;

    const geometry = new THREE.BoxGeometry(
      sizes.width,
      sizes.height,
      sizes.depth
    );

    const color = new THREE.Color(`hsl(${30 + blocks.length * 4}, 100%, 50%)`);
    const material = new THREE.MeshLambertMaterial({ color: color });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x!, y!, z!);
    this.scene.add(mesh);

    // Gravity with Cannon
    const shape = new CANNON.Box(
      new CANNON.Vec3(sizes.width / 2, sizes.height / 2, sizes.depth! / 2)
    );
    const mass = isBlockFalling ? 5 : 0;
    const body = new CANNON.Body({ mass: mass, shape: shape });
    body.position.set(x!, y!, z!);
    this.world.addBody(body);

    const block: Block = {
      mesh: mesh,
      body: body,
      sizes: sizes,
    };

    return block;
  }
  private updatePhysics(): void {
    const { fallBlocks } = this.gameState;

    this.world.step(1 / 60);

    fallBlocks.forEach((block) => {
      block.mesh.position.copy(block.body.position);
      block.mesh.quaternion.copy(block.body.quaternion);
    });
  }

  private animate(): void {
    const { blocks, isMovingForward } = this.gameState;

    const topBlock = blocks[blocks.length - 1];
    const bottomBlock = blocks[blocks.length - 2];

    const direction = topBlock.direction!;

    const delta = Math.round(
      topBlock.mesh.position[direction] - bottomBlock.mesh.position[direction]
    );

    if (isMovingForward) {
      topBlock.mesh.position[topBlock.direction!] -= this.blockSpeed;
      topBlock.body.position[topBlock.direction!] -= this.blockSpeed;
      if (delta === -5) this.gameState.isMovingForward = false;
    }

    if (!isMovingForward) {
      topBlock.mesh.position[topBlock.direction!] += this.blockSpeed;
      topBlock.body.position[topBlock.direction!] += this.blockSpeed;
      if (delta === 5) this.gameState.isMovingForward = true;
    }

    if (
      this.camera.position.y <
      this.blockSizes.height * (blocks.length - 2) + 4
    ) {
      this.camera.position.y += this.blockSpeed;
    }

    this.updatePhysics();
    this.render();
  }
}

