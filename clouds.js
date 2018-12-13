$(document).ready(function() {
  console.log("START");
  initClouds();
  initCanvas();
});

function initClouds() {
  if (!window.Detector && !window.Detector.webgl) Detector.addGetWebGLMessage();

  var container;
  var camera, scene, renderer;
  var mesh, geometry, material;

  var mouseX = 0,
    mouseY = 0;
  var start_time = Date.now();

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  init();

  function init() {
    container = document.getElementById("clouds");

    var canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = window.innerHeight;

    /* 
		Początkowo płótno jest puste, pozbawione tła. 
		Aby coś na nim wyświetlić, skrypt musi posiadać dostęp do 
		kontekstu renderowania a następnie musi coś w nim narysować. 
	*/
    var context = canvas.getContext("2d");

	// Stworzenie gradientu liniowego
    var gradient = context.createLinearGradient(0, 0, 0, canvas.height);

	// Wypelnij kontekst renderowania gradientem
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

	// Stylizacja tła
    container.style.backgroundColor = "0x4584b4";
    container.style.backgroundSize = "32px 100%";

	// Umiejscowienie kamery
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 6000;

	// Stworzenie sceny
    scene = new THREE.Scene();

	// Stworzenie geometrii
    geometry = new THREE.Geometry();

	// Załadowanie tekstury
    var texture = THREE.ImageUtils.loadTexture(
      "https://i.ibb.co/L6hRx8h/cloud1.png",
      null,
      animate
    );
    texture.magFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	
	var texture2 = THREE.ImageUtils.loadTexture(
		"http://www.rocketmans.net/Voxelspace/APACHE/cockpit.png",
		null,
		animate
	  );
	  texture2.magFilter = THREE.LinearMipMapLinearFilter;
	  texture2.minFilter = THREE.LinearMipMapLinearFilter;

    var fog = new THREE.Fog(0x4584b4, -100, 3000);

    material = new THREE.ShaderMaterial({
      uniforms: {
        map: { type: "t", value: texture },
        fogColor: { type: "c", value: fog.color },
        fogNear: { type: "f", value: fog.near },
        fogFar: { type: "f", value: fog.far }
      },
      vertexShader: document.getElementById("vs").textContent,
      fragmentShader: document.getElementById("fs").textContent,
      depthWrite: false,
      depthTest: false,
      transparent: true
	});
	
	var cockpit = new THREE.TextureLoader().load('http://www.rocketmans.net/Voxelspace/APACHE/cockpit.png');
	var material2 = new THREE.MeshBasicMaterial( { map: cockpit } );

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));

    for (var i = 0; i < 8000; i++) {
      plane.position.x = Math.random() * 1000 - 500;
      //plane.position.y = - Math.random() * Math.random() * 200 - 15;
      plane.position.y = -(Math.floor(Math.random() * (90 - 15)) - 15);
      plane.position.z = i;
      plane.rotation.z = Math.random() * Math.PI;
      plane.scale.x = plane.scale.y =
        Math.floor(Math.random() * (1.4 - 1.0)) + 1.0;

      THREE.GeometryUtils.merge(geometry, plane);
    }

	mesh = new THREE.Mesh(geometry, material);
	mesh2 = new THREE.Mesh(geometry, material2);
    scene.add(mesh);

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -8000;
    scene.add(mesh);

    // var loader = new THREE.TextureLoader();

    // 	// Load an image file into a custom material
    // var materialCockpit = new THREE.MeshLambertMaterial({
    // 	map: loader.load('http://www.rocketmans.net/Voxelspace/APACHE/cockpit.png')
    //   });

    //   // create a plane geometry for the image with a width of 10
    //   // and a height that preserves the image's aspect ratio
    //   var geometryCockpit = new THREE.PlaneGeometry(1000, 1000);

    //   // combine our image geometry and material into a mesh
    //   var meshCockpit = new THREE.Mesh(geometryCockpit, materialCockpit);

    //   // set the position of the image mesh in the x,y,z dimensions
    //   meshCockpit.position.set(0,0,)

    //   // add the image to the scene
    //   scene.add(meshCockpit);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener("mousemove", onDocumentMouseMove, false);
    window.addEventListener("resize", onWindowResize, false);
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.25;
    mouseY = Math.min((event.clientY - windowHalfY) * 0.15, -12);
  }

  function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    position = ((Date.now() - start_time) * 0.03) % 8000;

    camera.position.x += (mouseX - camera.position.x) * 0.01;
    camera.position.y += (-mouseY - camera.position.y) * 0.01;
    camera.position.z = -position + 8000;

    renderer.render(scene, camera);
  }
}

function initCanvas() {
  var win = jQuery(window);

  jQuery("#canvas").each(function() {
    var canvas = this;
    var ctx = canvas.getContext("2d");
    var fps = 30;
    var winWidth, winHeight;
    var mp; //max particles
    var particles = [];

    resizeHandler();

    function draw() {
      ctx.clearRect(0, 0, winWidth, winHeight);

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      for (var i = 0; i < mp; i++) {
        var p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
    }

    function update() {
      for (var i = 0; i < mp; i++) {
        var p = particles[i];
        p.y += Math.cos(p.d) + 1 + p.r / 2;
        if (p.y > winHeight) {
          if (i % 3 > 0) {
            //66.67% of the flakes
            particles[i] = {
              x: Math.random() * winWidth,
              y: -10,
              r: p.r,
              d: p.d
            };
          }
        }
      }
    }

    function resizeHandler() {
      //canvas dimensions
      winWidth = window.innerWidth;
      winHeight = window.innerHeight;

      canvas.width = winWidth;
      canvas.height = winHeight;

      mp = 0.35 * winWidth;

      particles = [];

      for (var i = 0; i < mp; i++) {
        particles.push({
          x: Math.random() * winWidth, //x-coordinate
          y: Math.random() * winHeight, //y-coordinate
          r: Math.random() * 1.5, //radius
          d: Math.random() * mp //density
        });
      }
    }

    win.on("resize", resizeHandler);

    function step() {
      setTimeout(function() {
        draw();
        requestAnimationFrame(step);
      }, 1200 / fps);
    }
    step();
  });
}
