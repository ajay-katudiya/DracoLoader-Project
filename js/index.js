import {
    Box3,
    Box3Helper,
    BoxGeometry,
    BoxHelper,
    CameraHelper,
    DirectionalLight,
    Group,
    LoadingManager,
    Mesh,
    MeshNormalMaterial,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    Vector3,
    WebGLRenderer
    // } from "three";
} from '../build/three.module.js';
import Stats from "./jsm/libs/stats.module.js";
import { ArcballControls } from "./jsm/ArcballControls.js";
import { DRACOLoader } from "./jsm/DRACOLoader.js";
import { GLTFLoader } from './jsm/GLTFLoader.js';

var scene = new Scene();
var domElement;
var animate = false;
var sceneComponent = setSceneComponent("canvas", scene);
initial();
animation();

/**
 * set component in targeted DomElement or set renderer, camera, controls, status.
 * @param {string} anyTagToSetScene html element who the set canvas
 * @param {scene} scene three js scene class.
 * @returns renderer, camera, controls, status.
 */
function setSceneComponent(anyTagToSetScene, scene) {
    if (anyTagToSetScene === undefined || scene === undefined) return;
    anyTagToSetScene = document.getElementById(anyTagToSetScene);

    let renderer;
    let camera;
    let controls;

    renderer = new WebGLRenderer({ alpha: true });
    renderer.localClippingEnabled = true;
    renderer.setSize(anyTagToSetScene.clientWidth, anyTagToSetScene.clientHeight, true);
    renderer.setPixelRatio(window.devicePixelRatio);
    anyTagToSetScene.appendChild(renderer.domElement);

    const status = new Stats();
    status.dom.children[0].style.display = "block";
    status.dom.children[1].style.display = "block";
    status.dom.children[2].style.display = "block";
    anyTagToSetScene.appendChild(status.dom);

    camera = new PerspectiveCamera(
        75, anyTagToSetScene.clientWidth / anyTagToSetScene.clientHeight,
        0.01,
        1000);
    camera.position.set(0, 0, 1000);
    scene.add(camera);

    controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2.5;
    controls.panSpeed = 1.5;
    controls.dynamicDampingFactor = 0.2;
    controls.setGizmosVisible(false);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;

    return {
        renderer,
        camera,
        controls,
        status,
    }
}

/**
 * set light and start program
 */
function initial() {
    const lightGroup = new Group();
    lightGroup.name = "LIGHTGRUOP";

    const XYLight = new DirectionalLight(0xffffff, 0.5);
    XYLight.position.set(100, 100, sceneComponent.camera.position.z);
    lightGroup.add(XYLight);
    const negetXnegetYLight = new DirectionalLight(0xffffff, 0.5);
    negetXnegetYLight.position.set(-100, -100, sceneComponent.camera.position.z);
    lightGroup.add(negetXnegetYLight);
    const negetXYLight = new DirectionalLight(0xffffff, 0.5);
    negetXYLight.position.set(-100, 100, sceneComponent.camera.position.z);
    lightGroup.add(negetXYLight);
    const xnegetYLight = new DirectionalLight(0xffffff, 0.5);
    xnegetYLight.position.set(100, -100, sceneComponent.camera.position.z);
    lightGroup.add(xnegetYLight);

    sceneComponent.camera.add(lightGroup);

    loadGLBFile();
}

/**
 * load Objects like GLTF/GLB/FBX
 */
function loadGLBFile() {
    const loaderManeger = new LoadingManager();
    loaderManeger.onLoad = () => {
        const gltfObj = scene.getObjectByName("GLTFFiles");
        const box = new Box3();
        box.setFromObject(gltfObj);
        const center = box.getCenter(new Vector3());

        sceneComponent.controls.target.copy(center);
        sceneComponent.camera.position.copy(new Vector3(0, 0.5, 0));
        sceneComponent.controls.update();
        sceneComponent.camera.updateMatrix();
        animate = true;
        document.querySelector('.PageLoader').style.display = "none";
    }
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./jsm/libs/DRACO/');
    dracoLoader.setDecoderConfig({ type: "js" });
    const gltfLoader = new GLTFLoader(loaderManeger);
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load('../model/beast.gltf', (obj) => {
        const box = new Box3();
        box.setFromObject(obj.scene);
        scene.add(new Box3Helper(box));
        obj.scene.name = "GLTFFiles";
        scene.add(obj.scene);
    }, (xhr) => {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100;
            document.getElementById("progresbar").textContent = "Prograss... " + percentComplete;
            console.log(percentComplete);
        }
    }, (error) => {
        console.log(error);
    });

}

/**
 * for responsive
 */
window.addEventListener('resize', () => {
    const div = document.getElementById("canvas");

    sceneComponent.renderer.setSize(div.clientWidth, div.clientHeight);
    sceneComponent.camera.aspect = div.clientWidth / div.clientHeight;
    sceneComponent.camera.updateProjectionMatrix();
});

/**
 * keydown event
 */
window.addEventListener('keydown', (e) => {

    switch (e.key) {
        case 'Escape':
            controlsMode = controlsModeOption.NONE;
            animate = false;
            handleControlsMode();
            break;

        default:
            break;
    }

});

// set controls options
var controlsModeOption = Object.freeze({ NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 });
var controlsMode = controlsModeOption.NONE;

// add event listener to click on Rotation button to active Rotation controls
domElement = document.getElementById("Rotation");
if (domElement) {
    domElement.addEventListener('click', () => {
        controlsMode = controlsModeOption.ROTATE;
        handleControlsMode();
    });
}

// add event listener to click on Zoom button to active Zoom controls
domElement = document.getElementById("Zoom");
if (domElement) {
    domElement.addEventListener('click', () => {
        controlsMode = controlsModeOption.ZOOM;
        handleControlsMode();
    });
}

// add event listener to click on Pan button to active Pan controls
domElement = document.getElementById("Pan");
if (domElement) {
    domElement.addEventListener('click', () => {
        controlsMode = controlsModeOption.PAN;
        handleControlsMode();
    });
}

// handle controls mode using mouse like rotate, zoom, pan.
function handleControlsMode() {
    const Rotation = document.getElementById("Rotation");
    const Zoom = document.getElementById("Zoom");
    const Pan = document.getElementById("Pan");

    switch (controlsMode) {
        case controlsModeOption.NONE:
            Rotation.classList.remove("active");
            Zoom.classList.remove("active");
            Pan.classList.remove("active");
            sceneComponent.controls.enableRotate = false;
            sceneComponent.controls.enableZoom = false;
            sceneComponent.controls.enablePan = false;
            break;
        case controlsModeOption.ROTATE:
            Rotation.classList.add("active");
            Zoom.classList.remove("active");
            Pan.classList.remove("active");
            sceneComponent.controls.enableRotate = true;
            sceneComponent.controls.enableZoom = false;
            sceneComponent.controls.enablePan = false;
            sceneComponent.controls.setMouseAction('ROTATE', 0);
            break;
        case controlsModeOption.ZOOM:
            Zoom.classList.add("active");
            Rotation.classList.remove("active");
            Pan.classList.remove("active");
            sceneComponent.controls.enableRotate = false;
            sceneComponent.controls.enableZoom = true;
            sceneComponent.controls.enablePan = false;
            sceneComponent.controls.setMouseAction('ZOOM', 0);
            break;
        case controlsModeOption.PAN:
            Pan.classList.add("active");
            Zoom.classList.remove("active");
            Rotation.classList.remove("active");
            sceneComponent.controls.enableRotate = false;
            sceneComponent.controls.enableZoom = false;
            sceneComponent.controls.enablePan = true;
            sceneComponent.controls.setMouseAction('PAN', 0);
            break;
    }
}

// set auto rotation stop
sceneComponent.renderer.domElement.addEventListener('mousedown', () => {
    animate = false;
});

/**
 * helper point for get idia to vector point is ther.
 * @param {Vector3()} position set Position of point
 * @param {Number} radius set radius of point
 */
function helpertPoint(position = new Vector3(), radius = 2) {
    const point = new Mesh(
        new SphereGeometry(radius, 20, 20),
        new MeshNormalMaterial()
    );
    point.name = "HELPERTPOINT";
    point.position.copy(position);
    scene.add(point);
}

// Animation Frame
function animation() {
    requestAnimationFrame(animation);
    sceneComponent.status.update();
    sceneComponent.renderer.render(scene, sceneComponent.camera);
    if (animate) {
        const timer = Date.now() * 0.0003;

        sceneComponent.camera.position.x = Math.sin(timer) * 5;
        sceneComponent.camera.position.z = Math.cos(timer) * 5;
        sceneComponent.camera.lookAt(0, 0.5, 0);
    }
}