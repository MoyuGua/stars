import * as THREE from "three"; //导入three.js核心库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; //导入轨道控制器
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 引入gsap做补间动画
import gsap from "gsap";
// 全景图加载器（用于加载全景图）
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// GLTF模型加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 引入压缩模块的解析器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 引入tween.js补间动画库
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
// 引入水面库实现水面效果
import { Water } from "three/examples/jsm/objects/Water2.js";
import { ref } from "vue";
class card3D {
  constructor(selector) {
    this.container = document.querySelector(selector); // 获取容器，id选择器
    this.scene;
    this.camera;
    // 渲染器
    this.renderer;
    // 控制器
    this.controls;
    // 射线
    this.raycaster;
    // 可以点击的模型对象数组
    this.canClick = [];
    // 鼠标移入会发生变化的对象。
    this.canMouseMove = [];
    // 鼠标移动上次选中的模块
    this.lastPick;
    // 切换镜头位置以及目标点的位置信息
    this.scenes = [
      {
        text: "圣诞快乐",
        callback: () => {
          // 执行函数切换位置
          this.translateCameraAnimation(
            new THREE.Vector3(-3.23, 3, 4.06),
            new THREE.Vector3(-8, 2, 0)
          );
        },
      },
      {
        text: "感谢在这么大的世界遇见了你",
        callback: () => {
          // 执行函数切换位置
          this.translateCameraAnimation(
            new THREE.Vector3(7, 0, 23),
            new THREE.Vector3(0, 0, 0)
          );
        },
      },
      {
        text: "愿与你探寻世界的每一个角落",
        callback: () => {
          // 执行函数切换位置
          this.translateCameraAnimation(
            new THREE.Vector3(10, 3, 0),
            new THREE.Vector3(5, 2, 0)
          );
        },
      },
      {
        text: "愿将天上的星星送给你",
        callback: () => {
          // 执行函数切换位置
          this.translateCameraAnimation(
            new THREE.Vector3(7, 0, 23),
            new THREE.Vector3(0, 0, 0)
          );
          this.translateToHeartAnimation();
        },
      },
      {
        text: "愿大家考研上岸，工作顺利",
        callback: () => {
          // 执行函数切换位置
          this.translateCameraAnimation(
            new THREE.Vector3(-20, 1.3, 6.6),
            new THREE.Vector3(5, 2, 0)
          );
          this.translateToStarAnimation();
        },
      },
    ];
    // 是否正在动画中（用于动画防抖效果）
    this.isAnimation = false;
    // 用于记录这是第几个场景
    this.index = ref(0);
    // 鼠标移动
    this.mouse;
    this.gui = new GUI();
    // 漫天星辰的数据信息
    this.starsInstance = [];
    // 漫天星辰开始时的位置信息
    this.startArr = [];
    // 漫天星辰结束时的位置信息
    this.endArr = [];
    this.init(); // 初始化
    this.animate(); // 循环函数
  }
  init() {
    // 初始化场景
    this.initScene();
    // 初始化平行光
    // this.initDirLight();
    // 初始化相机
    this.initCamera();
    // 初始化渲染器
    this.initRender();
    // 初始化轨道控制器
    this.initControls();
    // 解压压缩模型
    this.GetZipedGLTFGeometry();
    // 添加点光源
    this.initPointLight();
    // 添加萤火虫效果
    this.initPointLightGroup();
    // 添加水面效果
    this.CreateWaterSurface();
    // 创建漫天星辰
    this.createStars();
    // 监听场景大小改变，重新渲染尺寸
    window.addEventListener("resize", this.onWindowResize.bind(this));
    // 监听鼠标滚动事件
    window.addEventListener(
      "wheel",
      (e) => {
        if (this.isAnimation) return;
        this.isAnimation = true;
        if (e.deltaY > 0) {
          this.index.value++;
          if (this.index.value > this.scenes.length - 1) {
            this.index.value = 0;
          }
        }
        this.scenes[this.index.value].callback();
        setTimeout(() => {
          this.isAnimation = false;
        }, 1000);
      },
      false
    );
  }
  initScene() {
    this.scene = new THREE.Scene();
  }
  initDirLight() {
    // const hesLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    // hesLight.intensity = 0.6;
    // this.scene.add(hesLight);

    const dirLight = new THREE.DirectionalLight();
    dirLight.position.set(0, 50, 0);
    // 设置光照投射阴影
    // dirLight.castShadow = true;
    // 设置阴影模糊度
    // dirLight.shadow.radius = 10;
    // 设置阴影分辨率
    // dirLight.shadow.mapSize.set(2024, 2024);
    this.scene.add(dirLight);
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(-3.23, 3, 4.06);
  }
  initRender() {
    //设置抗锯齿
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // 设置屏幕像素比
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 渲染尺寸大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // 设置渲染器开启阴影计算
    this.renderer.shadowMap.enabled = true;
    // 颜色输出编码
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // 设置渲染器色调映射
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 色调映射曝光程度
    this.renderer.toneMappingExposure = 0.5;
    // 添加到容器
    this.container.appendChild(this.renderer.domElement);
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  animate() {
    this.controls.update();
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    TWEEN.update();
  }
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // 阻尼效果
    // this.controls.enableDamping = true;
    this.controls.target.set(-8, 2, 0);
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix(); // 更新矩阵，将3D内容投射到2d画面中
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // 加载gltf模型（压缩)
  GetZipedGLTFGeometry() {
    let _this = this;
    // 实例化加载器
    const dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("./static/draco/");
    // 设置gltf加载器draco解码器
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("./static/glb/card3D.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.name === "Plane") {
          child.visible = false;
        }
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      _this.scene.add(gltf.scene);
    });
    // 环境贴图,这里使用了全景图，需要使用REBELoader来加载全景图，需要引入相关模块
    let rgbeLoader = new RGBELoader();
    // 三种环境贴图的实现方式，三种方式根据不同情况选择一种即可。
    rgbeLoader.load("./static/texture/3dCard/sky/sky.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图贴图，将整个场景的背景设置为环境贴图
      this.scene.background = envMap;
      // 设置环境贴图额，设置整个场景的环境贴图
      _this.scene.environment = envMap;
      // 设置环境贴图，设置某个模型的环境贴图
      // cube.envMap = envMap;
    });
  }
  // 创建水面
  CreateWaterSurface() {
    const waterGeometry = new THREE.CircleGeometry(300, 32);
    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      color: 0xeeeeff,
      flowDirection: new THREE.Vector2(1, -1),
      scale: 10,
      // 自己的项目一定要添加如下两个随眠贴图，否则水面不会出现波纹效果
      normalMap0: new THREE.TextureLoader().load(
        "./static/texture/3dCard/water/WaterNormal.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      normalMap1: new THREE.TextureLoader().load(
        "./static/texture/3dCard/water/WaterNormal2.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.4;
    this.scene.add(water);
  }
  // 添加点光源
  initPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 10);
    pointLight.position.set(0.1, 2.4, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
  }
  // 创建点光源组(用于实现萤火虫效果)
  initPointLightGroup() {
    let radius = 2.6;
    // 萤火虫效果灯光组
    let pointLightArr = [];
    const pointLightGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      let pointLight = new THREE.PointLight(0xffffff, 2.5);
      pointLight.distance = 10;
      pointLight.decay = 1.2;
      // 创建球体当灯泡
      const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 10,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        radius * Math.cos((i * 2 * Math.PI) / 3),
        Math.cos((i * 2 * Math.PI) / 3),
        radius * Math.sin((i * 2 * Math.PI) / 3)
      );
      sphere.add(pointLight);
      pointLightArr.push(sphere);
      pointLightGroup.add(sphere);
    }
    pointLightGroup.position.set(-8, 2.5, -1.5);
    this.scene.add(pointLightGroup);
    // 使用补间函数gsap，实现动画效果
    const option = { angle: 0 };
    gsap.to(option, {
      angle: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: "linear",
      onUpdate: () => {
        pointLightGroup.rotation.y = option.angle;
        pointLightArr.forEach((item, index) => {
          item.position.set(
            radius * Math.cos((index * 2 * Math.PI) / 3),
            Math.cos((index * 2 * Math.PI) / 3 + option.angle * 5),
            radius * Math.sin((index * 2 * Math.PI) / 3)
          );
        });
      },
    });
  }
  // 相机的移动函数
  translateCameraAnimation(position, target) {
    let timeLine1 = gsap.timeline();
    let timeLine2 = gsap.timeline();
    timeLine1.to(this.camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 1,
      ease: "power2.inOut",
    });
    timeLine2.to(this.controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1,
      ease: "power2.inOut",
    });
  }
  // 实例化漫天星辰以及位置信息
  createStars() {
    this.starsInstance = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 10,
      }),
      100
    );
    for (let i = 0; i < 100; i++) {
      let x = Math.random() * 100 - 50;
      let y = Math.random() * 100;
      let z = Math.random() * 100 - 50;
      this.startArr.push(new THREE.Vector3(x, y, z));
      // 创建一个矩阵
      let matrix = new THREE.Matrix4();
      // 设置矩阵的信息
      matrix.setPosition(x, y, z);
      //
      this.starsInstance.setMatrixAt(i, matrix);
    }
    this.scene.add(this.starsInstance);
    // 创建爱心路径（使用贝塞尔曲线）
    let heartShape = new THREE.Shape();
    heartShape.moveTo(25, 25);
    heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
    heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
    heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
    heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

    // 根据爱心路径获取100个点位置信息
    let center = new THREE.Vector3(0, 10, 10);
    for (let i = 0; i < 100; i++) {
      let point = heartShape.getPoint(i / 100);
      this.endArr.push(
        new THREE.Vector3(
          center.x - point.x * 0.1,
          center.y - point.y * 0.1,
          center.z
        )
      );
    }
  }
  // 创建爱心出现动画
  translateToHeartAnimation() {
    let params = {
      time: 0,
    };
    gsap.to(params, {
      time: 1,
      duration: 1,
      onUpdate: () => {
        for (let i = 0; i < 100; i++) {
          let x =
            this.startArr[i].x +
            (this.endArr[i].x - this.startArr[i].x) * params.time;
          let y =
            this.startArr[i].y +
            (this.endArr[i].y - this.startArr[i].y) * params.time;
          let z =
            this.startArr[i].z +
            (this.endArr[i].z - this.startArr[i].z) * params.time;
          let matrix = new THREE.Matrix4();
          matrix.setPosition(x, y, z);
          this.starsInstance.setMatrixAt(i, matrix);
        }
        this.starsInstance.instanceMatrix.needsUpdate = true;
      },
    });
  }
  // 创建爱心结束动画
  translateToStarAnimation() {
    let params = {
      time: 0,
    };
    gsap.to(params, {
      time: 1,
      duration: 1,
      onUpdate: () => {
        for (let i = 0; i < 100; i++) {
          let x =
            this.endArr[i].x +
            (this.startArr[i].x - this.endArr[i].x) * params.time;
          let y =
            this.endArr[i].y +
            (this.startArr[i].y - this.endArr[i].y) * params.time;
          let z =
            this.endArr[i].z +
            (this.startArr[i].z - this.endArr[i].z) * params.time;
          let matrix = new THREE.Matrix4();
          matrix.setPosition(x, y, z);
          this.starsInstance.setMatrixAt(i, matrix);
        }
        this.starsInstance.instanceMatrix.needsUpdate = true;
      },
    });
  }
}
export default card3D;
