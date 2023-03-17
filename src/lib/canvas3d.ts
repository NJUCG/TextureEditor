import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SphereGeometry } from "./geometry/sphere";
import { DataTexture } from "three";

// OrbitControls in typescript: https://stackoverflow.com/questions/19444592/using-threejs-orbitcontols-in-typescript/56338877#56338877
// OrbitControls docs: https://threejs.org/docs/#examples/zh/controls/OrbitControls

/* threejs examples:
 * https://zhuanlan.zhihu.com/p/333615381
 * https://blog.csdn.net/weixin_43854673/article/details/119671467
 */

export class View3D {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls: OrbitControls | null = null;
    private model: THREE.Object3D | null = null;
    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial(
        {
            // color: 0x3F51B5
            color: 0xffffff,
			roughness: 0.5,
			metalness: 0.0,
			transparent: true,
			// alphaTest: 0,
			// depthFunc: THREE.AlwaysDepth,
			side: THREE.FrontSide,
			blending: THREE.NormalBlending
        }
    );

    // private cubuMap: THREE.CubeTexture | null = null;
    private skyPath = "./assets/env/wide_street_01_1k.hdr";
    private envMap: THREE.Texture | null = null;
    private texRepeat = 1;

    // geometry
	private sphereGeom = new SphereGeometry(0.7, 128, 128);
	private cubeGeom = new THREE.BoxGeometry();
	// private planeGeom = new PlaneGeometry(2, 2, 100, 100);
	// private cylinderGeom = new CylinderGeometry(0.5, 0.5, 1, 64, 64, true);

    setSkyPath(path: string) {
        this.skyPath = path;
        this.loadEnvEquirect();
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.setupRenderer(canvas);
        this.setupScene();
        this.setupCamera(45, canvas.width / canvas.height, 0.1, 1000, 1, 1, 2.6);
        this.setupLighting();
        this.loadEnvEquirect();
        this.setupOrbitControls(canvas);
        // this.setupBackground();

        // const modelDirPath = "./assets/models";
        // const modelFileFormat = "obj";
        // const modelName = "paimon";
        // this.loadModel(modelDirPath, modelFileFormat, modelName);
        this.model = new THREE.Mesh(this.sphereGeom, this.material);
        
        this.scene.add(this.model);


        const animate = (() => {
            requestAnimationFrame(animate);
            this.controls?.update();
            this.renderer.render(this.scene, this.camera);
        });

        animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#eee');
        this.scene.add(new THREE.AxesHelper(20));
        // this.scene.fog = new THREE.Fog("#eee", 20, 100);
    }

    /* WebGLRenderer docs
     * https://threejs.org/docs/#api/zh/renderers/WebGLRenderer
     * https://threejs.org/docs/#api/zh/constants/Renderer
     */
    setupRenderer(canvas: HTMLCanvasElement) {
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            canvas: canvas, 
            preserveDrawingBuffer: true,
            antialias: true 
        });
        renderer.setClearColor(0x000000, 0);
        renderer.physicallyCorrectLights = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.renderer = renderer;
    }

    setupCamera(fov: number, aspect: number, near: number, far: number, x: number, y: number, z: number) {
        this.camera = new THREE.PerspectiveCamera(
            fov,
            aspect,
            near,
            far
        );
        this.camera.position.z = z;
        this.camera.position.y = y;
        this.camera.position.x = x;
    }

    setupOrbitControls(canvas: HTMLCanvasElement) {
        const controls = new OrbitControls(this.camera, canvas);
        // settings of orbitcontrols
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = true;
        controls.keyPanSpeed = 7.0;
        controls.target = new THREE.Vector3(0, 0, 0);
        this.controls = controls;
    }

    // 提供一个地面, 测试光照阴影
    setupBackground() {
        const floorGeometry = new THREE.PlaneGeometry(300, 300);
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x857ebb, shininess: 0 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;
        floor.receiveShadow = true;
        floor.position.y = -0.001;
        this.scene.add(floor);
    }

    setupLighting() {
        const container = new THREE.Object3D();

        const brightness = 2;

        let object3d = new THREE.DirectionalLight("white", 0.225 * brightness);
		object3d.position.set(2.6, 1, 3);
		object3d.name = "Back light";
		container.add(object3d);

		object3d = new THREE.DirectionalLight("white", 0.375 * brightness);
		object3d.position.set(-2, -1, 0);
		object3d.name = "Key light";
		container.add(object3d);

		object3d = new THREE.DirectionalLight("white", 0.75 * brightness);
		object3d.position.set(3, 3, 2);
		object3d.name = "Fill light";
		container.add(object3d);

        this.scene.add(container);
        // this.scene.add(directLight);
        // this.addCameraHelper(directLight.shadow.camera);
    }

    resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    addCameraHelper(camera: THREE.Camera) {
        this.scene.add(new THREE.CameraHelper(camera));
    }

    setModel(modelName: string) {
		if (this.model) this.scene.remove(this.model);

		let geometry: THREE.BufferGeometry;
		if (modelName == "sphere") geometry = this.sphereGeom;
		if (modelName == "cube") geometry = this.cubeGeom;
		// if (modelName == "plane") geometry = this.planeGeom;
		// if (modelName == "cylinder") geometry = this.cylinderGeom;
		// crash if none is valid

		this.model = new THREE.Mesh(geometry!, this.material);
		this.scene.add(this.model);
	}

    loadModel(modelDirPath: string, modelFileFormat: string, modelName: string) {
        if (this.model)
            this.scene.remove(this.model);

        let modelPath: string;
        // 字符串拼接: https://blog.csdn.net/sunxiaoju/article/details/98622352
        if (modelFileFormat == "gltf")
            modelPath = `${modelDirPath}/${modelName}/${modelFileFormat}/scene.${modelFileFormat}`;
        else
            modelPath = `${modelDirPath}/${modelName}/${modelFileFormat}/${modelName}.${modelFileFormat}`;
        console.log(modelPath);
        
        let loader = null;
        let mtlLoader = null;
        switch(modelFileFormat) {
            case "obj":
                // 加载obj模型: https://juejin.cn/post/7062516993261305892
                mtlLoader = new MTLLoader();
                mtlLoader.load(`${modelDirPath}/${modelName}/obj/${modelName}.mtl`, (mtl) => {
                    mtl.preload();
                    loader = new OBJLoader();
                    loader.setMaterials(mtl);
                    loader.load(modelPath, (obj) => {
                        // console.log(obj);
                        obj.traverse((mesh) => {
                            if (mesh instanceof THREE.Mesh) {
                                mesh.castShadow = true;
                                mesh.receiveShadow = true;
                                //mesh.material.envMap = this.envMap;
                            }
                        });
                        this.scene.add(obj);
                        this.model = obj;
                        console.log(this.model);
                    });
                });
                break;
            case "gltf":
                loader = new GLTFLoader();
                loader.load(modelPath, (gltf) => {
                    // console.log(gltf);
                    gltf.scene.traverse((mesh) => {
                        if (mesh instanceof THREE.Mesh) {
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;
                            //mesh.material.envMap = this.envMap;
                        }
                        // console.log(mesh);
                    });
                    this.scene.add(gltf.scene);
                    this.model = gltf.scene;
                });
                break;
            case "fbx":
                loader = new FBXLoader();
                loader.load(modelPath, (fbx) => {
                    // console.log(fbx);
                    fbx.traverse((mesh) => {
                        if (mesh instanceof THREE.Mesh) {
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;
                        }
                    });
                    this.scene.add(fbx);
                    this.model = fbx;
                });
                break;
            default:
                if (this.model)
                    this.scene.add(this.model);
                console.error("Unexpected model file format: " + modelFileFormat + "!");
                return;
        }
    }

    loadEnvEquirect() {
        const skyPath = this.skyPath;
        const hdrPath = skyPath;

        new RGBELoader()
            .setDataType(THREE.FloatType)
            .load(hdrPath, (texure: DataTexture) => {
                if (skyPath !== this.skyPath)
                    return;
                const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
                pmremGenerator.compileEquirectangularShader();

                const evtRT = pmremGenerator.fromEquirectangular(texure);
                const tex = evtRT.texture;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;

                this.material.envMap = tex;
                this.material.needsUpdate = true;
                this.scene.background = tex;
                // 在此次更新材质的环境贴图
                this.envMap = new THREE.Texture();
                this.envMap.copy(tex);
            });
    }
}