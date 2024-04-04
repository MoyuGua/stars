import * as THREE from "three"; //导入three.js核心库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; //导入轨道控制器
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 全景图加载器（用于加载全景图）
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// GLTF模型加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 引入压缩模块的解析器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 引入tween.js补间动画库
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
class map3D {
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
    // 鼠标移动
    this.mouse;
    this.gui = new GUI();
    this.init(); // 初始化
    this.animate(); // 循环函数
  }
  init() {
    // 初始化场景
    this.initScene();
    // 初始化辅助轴
    this.initHelper();
    // 初始化平行光
    // this.initDirLight();
    // 初始化聚光灯
    this.initSpotLight();
    // 初始化点光源
    // this.initPointLight()
    // 初始化相机
    this.initCamera();
    // 初始化渲染器
    this.initRender();
    // 初始化轨道控制器
    this.initControls();
    // 阴影与灯光实验模型
    this.getSphereAndPlaneGeometry();

    // 添加压缩后的glb模型
    // this.GetZipedGLTFGeometry();
    // 创建正方体模型
    // this.CreateBoxGeometry();
    // 加载GLTF模型
    // this.GetGLTFGeometry()
    // 法向量实现反射
    // this.vertexGeometry();
    // 包围盒、包围球模型
    // this.GetBox3Geometry();
    // 边缘几何体
    // this.getEdgeGeometry();
    // 线框几何体
    // this.getWireGeometry()
    // 监听场景大小改变，重新渲染尺寸
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }
  initScene() {
    this.scene = new THREE.Scene();
  }
  initHelper() {
    const Helper = new THREE.AxesHelper(10);
    this.scene.add(Helper);
  }
  initDirLight() {
    const hesLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hesLight.intensity = 0.6;
    this.scene.add(hesLight);

    const dirLight = new THREE.DirectionalLight();
    dirLight.position.set(10, 10, 10);
    // 设置光照投射阴影
    dirLight.castShadow = true;
    // 设置阴影模糊度
    dirLight.shadow.radius = 10;
    // 设置阴影分辨率
    dirLight.shadow.mapSize.set(2024, 2024);
    // 设置平行光投射相机属性
    // dirLight.shadow.camera.near = 0.5
    // dirLight.shadow.camera.far = 500
    // dirLight.shadow.camera.top = 5
    // dirLight.shadow.camera.bottom = -5
    // dirLight.shadow.camera.left = -5
    // dirLight.shadow.camera.right = 5
    // this.gui.add(dirLight.shadow.camera,'near')
    // .min(0)
    // .max(100)
    // .step(0.1)
    // .onChange(()=>{
    //   dirLight.shadow.camera.updateProjectionMatrix()
    // })
    this.scene.add(dirLight);
  }
  initSpotLight() {
    const hesLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hesLight.intensity = 0.6;
    // this.scene.add(hesLight);

    const SpotLight = new THREE.SpotLight(0xffffff, 0.5);
    SpotLight.position.set(10, 10, 10);
    // 设置光照投射阴影
    SpotLight.castShadow = true;
    // 设置阴影模糊度
    SpotLight.shadow.radius = 10;
    // 设置阴影分辨率
    SpotLight.shadow.mapSize.set(4048, 4048);
    // 设置聚光灯目标（默认原点）
    // SpotLight.target = sphere //指向Object3D，就是一个模型数据
    SpotLight.target.position.set(0, 0, 0);

    // 设置聚光灯角度（范围0-pi/2）
    SpotLight.angle = Math.PI / 3;
    // this.gui
    //   .add(SpotLight, "angle")
    //   .min(0)
    //   .max(Math.PI / 2)
    //   .step(0.01);

    // 设置聚光灯投射相机属性
    SpotLight.shadow.camera.near = 500;
    SpotLight.shadow.camera.far = 4000;
    SpotLight.shadow.camera.fov = 30

    // 设置聚光灯光强衰减(0表示不衰减，1-无穷表示衰减到0的距离)
    SpotLight.distance = 0 
    this.gui.add(SpotLight, "distance").min(0).max(50).step(1);
    
    // 聚光灯半影衰减效果(0-1),0表示无效果，其他表示中间和边缘亮度的变化，值越大，中间越亮，两边越暗
    SpotLight.penumbra = 0
    this.gui.add(SpotLight,'penumbra').min(0).max(1).step(0.1)
    // 聚光灯沿着光照距离的衰减量（暂时无法使用）
    SpotLight.decay = 0
    this.gui.add(SpotLight,'decay').min(0).max(5).step(0.1)
    this.scene.add(SpotLight);
  }
  initPointLight() {
    const hesLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hesLight.intensity = 0.6;
    // this.scene.add(hesLight);

    const PointLight = new THREE.PointLight(0xff0000,1)
  
    PointLight.position.set(10, 10, 10);
    // 设置光照投射阴影
    PointLight.castShadow = true;
    // 设置阴影模糊度
    PointLight.shadow.radius = 10;
    // 设置阴影分辨率
    PointLight.shadow.mapSize.set(512, 512);
    // 设置最远距离（0表示不衰减，其他表示最远距离）
    PointLight.distance = 0 
    this.gui.add(PointLight,'distance').min(0).max(50).step(1)
    PointLight.decay = 0.0
    this.gui.add(PointLight,'decay').min(0).max(5).step(0.1)
    this.scene.add(PointLight);
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
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
    // 设置渲染器为真实物理渲染(现在已经弃用)
    // this.renderer.useLegacyLights = true
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
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.025;
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix(); // 更新矩阵，将3D内容投射到2d画面中
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  //创建正方体模型+环境贴图
  CreateBoxGeometry() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(1, 1, 1);
    this.scene.add(cube);
    // 环境贴图,这里使用了全景图，需要使用REBELoader来加载全景图，需要引入相关模块
    let rgbeLoader = new RGBELoader();
    // 三种环境贴图的实现方式，三种方式根据不同情况选择一种即可。
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图贴图，将整个场景的背景设置为环境贴图
      // this.scene.background = envMap;
      // 设置环境贴图额，设置整个场景的环境贴图
      // _this.scene.environment = envMap;
      // 设置环境贴图，设置某个模型的环境贴图
      material.envMap = envMap;
    });
  }
  // 创建平面模型，并且进行各种贴图
  CreatePlaneGeometry() {
    // 平面模型
    let planeGeometry = new THREE.PlaneGeometry(1, 1);
    // 纹理加载器
    let textureLoader = new THREE.TextureLoader();
    // 加载纹理贴图
    let texture = textureLoader.load("your/texture/url");
    // 设置贴图色彩空间特性q
    texture.colorSpace = THREE.SRGBColorSpace;
    // 加载AO贴图，环境遮罩贴图
    let AOTexture = textureLoader.load("your/aoTexture/url");
    // 透明度贴图(灰度纹理贴图，黑色表示完全透明，白色表示完全不透明)
    let AlphaTexture = textureLoader.load("your/AlphaTexture/url");
    // 光照贴图（用于表示光的颜色等）
    let LightTexture = textureLoader.load("your/lightTexture/url");
    // 高光贴图，表示方式基本与透明度贴图相同，用灰度表示反射率
    let specularTexture = textureLoader.load("your/specularTexture/url");
    let planeMaterial = new THREE.MeshBasicMaterial({
      // 模型颜色
      color: 0xffffff,
      // 纹理贴图
      map: texture,
      // 允许透明，否则某些部分可能会无法正常显示
      transparent: true,
      // AO贴图，环境遮罩贴图
      aoMap: AOTexture,
      // AO贴图对于模型的影响程度
      aoMapIntensity: 1,
      // 透明度贴图
      // alphaMap:AlphaTexture,
      // 光照贴图
      // lightMap: LightTexture,
      // 高光贴图
      specularMap: specularTexture,
      // 高光贴图影响因子
      reflectivity: 1,
    });
    // 环境贴图,这里使用了全景图，需要使用REBELoader来加载全景图，需要引入相关模块
    let rgbeLoader = new RGBELoader();
    // 三种环境贴图的实现方式，三种方式根据不同情况选择一种即可。
    rgbeLoader.load("your/grbeMap/url", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图贴图，将整个场景的背景设置为环境贴图
      // this.scene.background = envMap;
      // 设置环境贴图额，设置整个场景的环境贴图
      // this.scene.environment = envMap;
      // 设置环境贴图，设置某个模型的环境贴图
      planeMaterial.envMap = envMap;
    });
  }
  // 使用法向量实现反射等
  vertexGeometry() {
    // 平面模型
    let planeGeometry = new THREE.PlaneGeometry(1, 1);
    // 设置法向量方向以及模型的法向量
    // const normals = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
    // planeGeometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    console.log(planeGeometry);
    // 纹理加载器
    let textureLoader = new THREE.TextureLoader();
    // 加载纹理贴图
    let texture = textureLoader.load("./static/texture/UV.jpg");
    // 设置贴图色彩空间特性q
    texture.colorSpace = THREE.SRGBColorSpace;
    let planeMaterial = new THREE.MeshBasicMaterial({
      // 模型颜色
      color: 0xffffff,
      // 纹理贴图
      map: texture,
      // 允许透明，否则某些部分可能会无法正常显示
      transparent: true,
    });
    // 环境贴图,这里使用了全景图，需要使用REBELoader来加载全景图，需要引入相关模块
    let rgbeLoader = new RGBELoader();
    // 三种环境贴图的实现方式，三种方式根据不同情况选择一种即可。
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图贴图，将整个场景的背景设置为环境贴图
      this.scene.background = envMap;
      // 设置环境贴图额，设置整个场景的环境贴图
      // this.scene.environment = envMap;
      // 设置环境贴图，设置某个模型的环境贴图
      planeMaterial.envMap = envMap;
    });
    const cube = new THREE.Mesh(planeGeometry, planeMaterial);
    this.scene.add(cube);
  }
  // 加载gltf模型（未压缩）
  GetGLTFGeometry() {
    // 实例化模型加载器
    const gltfLoader = new GLTFLoader();
    // 加载模型
    let _this = this;
    gltfLoader.load("./static/glb/zhuanshi.glb", (gltf) => {
      console.log(gltf);
      gltf.scene.position.set(2, 2, 2);
      _this.scene.add(gltf.scene);
    });
    // // 如果想要正常显示的话需要使用环境贴图或者灯光，这样才能正常显示。
    // let rgbeLoader = new RGBELoader()
    // // 加载环境贴图
    // rgbeLoader.load('imgurl',(envMap)=>{
    //   // 设置环境贴图
    //   _this.scene.environment = envMap
    // })
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
    gltfLoader.load("./static/glb/city.glb", (gltf) => {
      _this.scene.add(gltf.scene);
    });
    // 环境贴图,这里使用了全景图，需要使用REBELoader来加载全景图，需要引入相关模块
    let rgbeLoader = new RGBELoader();
    // 三种环境贴图的实现方式，三种方式根据不同情况选择一种即可。
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图贴图，将整个场景的背景设置为环境贴图
      this.scene.background = envMap;
      // 设置环境贴图额，设置整个场景的环境贴图
      // _this.scene.environment = envMap;
      // 设置环境贴图，设置某个模型的环境贴图
      // cube.envMap = envMap;
    });
  }
  // 创建射线，实现点击交互功能
  GetRayCaster() {
    // 创建射线
    this.raycaster = new THREE.Raycaster();
    // 创建鼠标销量
    this.mouse = new THREE.Vector2();
    // 添加
    const mouseMove = (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const mouseClick = (event) => {
      let clickMouse = new THREE.Vector2();
      // 这里检测鼠标点击的地方
      clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // 计算射线
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // 计算选中的物体，这里传入一个数组，里面存储着一些可以选中或者进行交互事件的模型。
      let intensity = this.raycaster.intersectObjects(this.canClick);
      let dom = intensity[0];
      // 根据点击的模型带有的信息去进行操作。
      if (dom) {
      }
    };
    window.addEventListener("click", mouseClick);
    window.addEventListener("mousemove", mouseMove);
  }
  // 动画 - 鼠标悬浮动作
  mouseMoveAnimation() {
    // 通过摄像机和鼠标位置更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // 计算物体和射线的焦点，与当场景相交的对象有那些
    const intersects = this.raycaster.intersectObjects(this.canMouseMove);
    // 恢复上一次清空的
    if (this.lastPick) {
      // 清空颜色
      if (this.lastPick.object.material[0].color !== undefined) {
        this.lastPick.object.material[0].color.set("#fff");
      }
    }
    this.lastPick = null;
    // 这里其实也可以写成对比标识查找，这样更加准确
    this.lastPick = intersects[0];
    if (this.lastPick) {
      // 修改颜色
      if (this.lastPick.object.material[0].color !== undefined) {
        this.lastPick.object.material[0].color.set("#99ccff");
      }
    }
  }
  // mesh移动 - tween.js补间动画（可以用于完成视角变化动画等。）
  geometryMoveAnimation(Mesh, to, delayTime) {
    const Tween = new THREE.Tween(Mesh.position);
    Tween.to(to, delayTime);
    Tween.start();
  }
  // 包围盒、包围球 / 几何体居中以及获取几何体中心
  GetBox3Geometry() {
    // 实例化模型加载器
    const gltfLoader = new GLTFLoader();
    // 加载模型
    let _this = this;
    gltfLoader.load("./static/glb/zhuanshi.glb", (gltf) => {
      _this.scene.add(gltf.scene);
      // 查找对应的mesh
      let zhuanshiMesh = gltf.scene.getObjectByName(
        "图层01(A7633658-A981-4B9E-A8F4-4B5AD393FC98)"
      );
      let zhuanshiGeometry = zhuanshiMesh.geometry;
      // 计算包围盒
      zhuanshiGeometry.computeBoundingBox();
      // 设置几何体居中
      // zhuanshiGeometry.center()
      // 获取duck包围盒
      let zhuanshiBox = zhuanshiGeometry.boundingBox;
      // 获取包围盒中心
      let center = zhuanshiBox.getCenter(new THREE.Vector3());
      console.log(center);
      // 更新世界矩阵
      zhuanshiMesh.updateWorldMatrix(true, true);
      // 更新包围盒
      zhuanshiBox.applyMatrix4(zhuanshiMesh.matrixWorld);
      // 创建包围盒辅助器
      let boxHelper = new THREE.Box3Helper(zhuanshiBox, 0xffff00);
      this.scene.add(boxHelper);

      // 获取包围球
      let zhuanshiSphere = zhuanshiGeometry.boundingSphere;
      // 更新包围球
      zhuanshiSphere.applyMatrix4(zhuanshiMesh.matrixWorld);
      // 创建包围球辅助器
      let sphereGeometry = new THREE.SphereGeometry(
        zhuanshiGeometry.radius,
        16,
        16
      );
      let sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      this.scene.add(sphere);
    });
    // 如果想要正常显示的话需要使用环境贴图或者灯光，这样才能正常显示。
    let rgbeLoader = new RGBELoader();
    // 加载环境贴图
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图
      _this.scene.environment = envMap;
      // 设置背景
      _this.scene.background = envMap;
    });
  }
  // 获取多个模型的包围盒（一个同时包围几个模型的包围盒）
  getGeometriesBox3() {
    let box = new THREE.Box3();
    let meshArr = [];
    for (let i = 0; i < meshArr.length; i++) {
      // 获取包围盒的第二种方式
      let box3 = new THREE.Box3().setFromObject(meshArr[i]);
      // 合并包围盒
      box.union(box3);
    }
    // 创建包围盒辅助器
    let boxHelper = new THREE.Box3Helper(box, 0xffff00);
    this.scene.add(boxHelper);
  }
  // 获取边缘几何体
  getEdgeGeometry() {
    let _this = this;
    // 实例化加载器
    const dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("./static/draco/");
    // 设置gltf加载器draco解码器
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("./static/glb/building.glb", (gltf) => {
      let geometry = gltf.scene.children[0].geometry;
      // 获取边缘geometry
      let edgesGeometry = new THREE.EdgesGeometry(geometry);
      // 创建线段材质
      let material = new THREE.LineBasicMaterial({
        color: 0xffff00,
      });
      // 生成线段
      let edges = new THREE.LineSegments(edgesGeometry, material);
      // 更新geometry的世界矩阵
      gltf.scene.children[0].updateMatrixWorld(true, true);
      // 更新边缘对象当前矩阵
      edges.matrix.copy(gltf.scene.children[0].matrixWorld);
      edges.matrix.decompose(edges.position, edges.quaternion, edges.scale);
      // _this.scene.add(gltf.scene);
      _this.scene.add(edges);
    });
    // 如果想要正常显示的话需要使用环境贴图或者灯光，这样才能正常显示。
    let rgbeLoader = new RGBELoader();
    // 加载环境贴图
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图
      _this.scene.environment = envMap;
      // 设置背景
      _this.scene.background = envMap;
    });
  }
  // 获取线框几何体
  getWireGeometry() {
    let _this = this;
    // 实例化加载器
    const dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("./static/draco/");
    // 设置gltf加载器draco解码器
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("./static/glb/building.glb", (gltf) => {
      let geometry = gltf.scene.children[0].geometry;
      // 获取边缘geometry
      let edgesGeometry = new THREE.WireframeGeometry(geometry);
      // 创建线段材质
      let material = new THREE.LineBasicMaterial({
        color: 0xffff00,
      });
      // 生成线段
      let edges = new THREE.LineSegments(edgesGeometry, material);
      // 更新geometry的世界矩阵
      gltf.scene.children[0].updateMatrixWorld(true, true);
      // 更新边缘对象当前矩阵
      edges.matrix.copy(gltf.scene.children[0].matrixWorld);
      edges.matrix.decompose(edges.position, edges.quaternion, edges.scale);
      gltf.scene.position.set(0, 0, 0);
      _this.scene.add(edges);
      // _this.scene.add(gltf.scene);
    });
    // 如果想要正常显示的话需要使用环境贴图或者灯光，这样才能正常显示。
    let rgbeLoader = new RGBELoader();
    // 加载环境贴图
    rgbeLoader.load("./static/texture/arroundImg.hdr", (envMap) => {
      // 设置球形贴图效果
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      // 设置环境贴图
      _this.scene.environment = envMap;
      // 设置背景
      _this.scene.background = envMap;
    });
  }
  // 阴影和灯光实验模型
  getSphereAndPlaneGeometry() {
    // 添加球体
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const material = new THREE.MeshStandardMaterial();
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.set(2, 2, 2);
    //设置物体投射阴影
    sphere.castShadow = true;
    this.scene.add(sphere);
    // 添加平面
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    // 设置物体接收阴影
    plane.receiveShadow = true;
    this.scene.add(plane);
  }
}
export default map3D;
