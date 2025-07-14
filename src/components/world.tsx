import { useEffect } from "react";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Raycaster,
  Vector2,
  Clock,
  TextureLoader,
  ShaderMaterial,
  IcosahedronGeometry,
  MeshBasicMaterial,
  Points,
  Mesh,
  SphereGeometry,
  Vector3
}from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function World() {
  useEffect(() => {
    // Define shaders as strings
    const vertexShader = `
      uniform sampler2D u_map_tex;
      uniform float u_dot_size;
      uniform float u_time_since_click;
      uniform vec3 u_pointer;

      #define PI 3.14159265359

      varying float vOpacity;
      varying vec2 vUv;

      void main() {
          vUv = uv;

          // mask with world map
          float visibility = step(.2, texture2D(u_map_tex, uv).r);
          gl_PointSize = visibility * u_dot_size;

          // make back dots semi-transparent
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vOpacity = (1. / length(mvPosition.xyz) - .7);
          vOpacity = clamp(vOpacity, .03, 1.);

          // add ripple
          float t = u_time_since_click - .1;
          t = max(0., t);
          float max_amp = .15;
          float dist = 1. - .5 * length(position - u_pointer);
          float damping = 1. / (1. + 20. * t);
          float delta = max_amp * damping * sin(5. * t * (1. + 2. * dist) - PI);
          delta *= 1. - smoothstep(.8, 1., dist);
          vec3 pos = position;
          pos *= (1. + delta);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
      }
    `;

    const fragmentShader = `
      uniform sampler2D u_map_tex;

      varying float vOpacity;
      varying vec2 vUv;

      void main() {
          // Create a gradient from purple to blue
          vec3 purpleColor = vec3(0.67, 0.0, 1.0); // Purple
          vec3 blueColor = vec3(0.0, 0.48, 1.0);   // Blue
          vec3 color = mix(purpleColor, blueColor, vUv.x);
          
          // Add some variation based on the texture
          vec3 texColor = texture2D(u_map_tex, vUv).rgb;
          color = mix(color, texColor, 0.3);
          
          // Add dot effect
          color -= .2 * length(gl_PointCoord.xy - vec2(.5));
          float dot = 1. - smoothstep(.38, .4, length(gl_PointCoord.xy - vec2(.5)));
          
          if (dot < 0.5) discard;
          
          // Add glow effect
          float glow = 1.2 - length(gl_PointCoord.xy - vec2(.5));
          color += vec3(0.3, 0.0, 0.5) * glow * 0.5;
          
          gl_FragColor = vec4(color, dot * vOpacity);
      }
    `;

    const containerEl = document.querySelector(".globe-wrapper");
    const canvas3D = containerEl.querySelector("#globe-3d");
    const canvas2D = containerEl.querySelector("#globe-2d-overlay");
    const popupEl = containerEl.querySelector(".globe-popup");

    let renderer, scene, camera, rayCaster, controls, group;
    let overlayCtx = canvas2D.getContext("2d");
    let coordinates2D = [0, 0];
    let pointerPos;
    let clock, mouse, pointer, globe, globeMesh;
    let popupVisible;
    let earthTexture, mapMaterial;
    let popupOpenTl, popupCloseTl;

    let dragged = false;

    initScene();
    window.addEventListener("resize", updateSize);

    function initScene() {
      renderer = new WebGLRenderer({canvas: canvas3D, alpha: true});
      renderer.setPixelRatio(2);

      scene = new Scene();
      camera = new OrthographicCamera(-1.1, 1.1, 1.1, -1.1, 0, 3);
      camera.position.z = 1.1;

      rayCaster = new Raycaster();
      rayCaster.far = 1.15;
      mouse = new Vector2(-1, -1);
      clock = new Clock();

      createOrbitControls();

      popupVisible = false;

      new TextureLoader().load(
        "https://ksenia-k.com/img/earth-map-colored.png",
        (mapTex) => {
          earthTexture = mapTex;
          earthTexture.repeat.set(1, 1);
          createGlobe();
          createPointer();
          createPopupTimelines();
          addCanvasEvents();
          updateSize();
          render();
        });
    }

    function createOrbitControls() {
      controls = new OrbitControls(camera, canvas3D);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = true;
      controls.minPolarAngle = .4 * Math.PI;
      controls.maxPolarAngle = .4 * Math.PI;
      controls.autoRotate = true;

      let timestamp;
      controls.addEventListener("start", () => {
        timestamp = Date.now();
      });
      controls.addEventListener("end", () => {
        dragged = (Date.now() - timestamp) > 600;
      });
    }

    function createGlobe() {
      const globeGeometry = new IcosahedronGeometry(1, 22);
      mapMaterial = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_map_tex: { type: "t", value: earthTexture },
          u_dot_size: { type: "f", value: 0 },
          u_pointer: { type: "v3", value: new Vector3(.0, .0, 1.) },
          u_time_since_click: { value: 0 },
        },
        transparent: true
      });

      globe = new Points(globeGeometry, mapMaterial);
      scene.add(globe);

      globeMesh = new Mesh(globeGeometry, new MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: .05
      }));
      scene.add(globeMesh);
    }

    function createPointer() {
      const geometry = new SphereGeometry(.04, 16, 16);
      const material = new MeshBasicMaterial({
        color: 0xa900ff,
        transparent: true,
        opacity: 0
      });
      pointer = new Mesh(geometry, material);
      scene.add(pointer);
    }

    function updateOverlayGraphic() {
      if (!pointer || !globe) return;

      let activePointPosition = pointer.position.clone();
      activePointPosition.applyMatrix4(globe.matrixWorld);
      const activePointPositionProjected = activePointPosition.clone();
      activePointPositionProjected.project(camera);
      coordinates2D[0] = (activePointPositionProjected.x + 1) * containerEl.offsetWidth * .5;
      coordinates2D[1] = (1 - activePointPositionProjected.y) * containerEl.offsetHeight * .5;

      const matrixWorldInverse = controls.object.matrixWorldInverse;
      activePointPosition.applyMatrix4(matrixWorldInverse);

      if (activePointPosition.z > -1) {
        if (popupVisible === false) {
          popupVisible = true;
          showPopupAnimation(false);
        }

        let popupX = coordinates2D[0];
        popupX -= (activePointPositionProjected.x * containerEl.offsetWidth * .3);

        let popupY = coordinates2D[1];
        const upDown = (activePointPositionProjected.y > .6);
        popupY += (upDown ? 20 : -20);

        gsap.set(popupEl, {
          x: popupX,
          y: popupY,
          xPercent: -35,
          yPercent: upDown ? 0 : -100
        });

        popupY += (upDown ? -5 : 5);
        const curveMidX = popupX + activePointPositionProjected.x * 100;
        const curveMidY = popupY + (upDown ? -.5 : .1) * coordinates2D[1];

        drawPopupConnector(coordinates2D[0], coordinates2D[1], curveMidX, curveMidY, popupX, popupY);
      } else {
        if (popupVisible) {
          popupOpenTl.pause(0);
          popupCloseTl.play(0);
        }
        popupVisible = false;
      }
    }

    function addCanvasEvents() {
      containerEl.addEventListener("mousemove", (e) => {
        updateMousePosition(e.clientX, e.clientY);
      });

      containerEl.addEventListener("click", (e) => {
        if (!dragged) {
          updateMousePosition(
            e.targetTouches ? e.targetTouches[0].pageX : e.clientX,
            e.targetTouches ? e.targetTouches[0].pageY : e.clientY,
          );

          const res = checkIntersects();
          if (res.length) {
            pointerPos = res[0].face.normal.clone();
            pointer.position.set(res[0].face.normal.x, res[0].face.normal.y, res[0].face.normal.z);
            mapMaterial.uniforms.u_pointer.value = res[0].face.normal;
            popupEl.innerHTML = cartesianToLatLong();
            showPopupAnimation(true);
            clock.start()
          }
        }
      });
    }

    function updateMousePosition(eX, eY) {
      mouse.x = (eX - containerEl.offsetLeft) / containerEl.offsetWidth * 2 - 1;
      mouse.y = -((eY - containerEl.offsetTop) / containerEl.offsetHeight) * 2 + 1;
    }

    function checkIntersects() {
      rayCaster.setFromCamera(mouse, camera);
      const intersects = rayCaster.intersectObject(globeMesh);
      if (intersects.length) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "auto";
      }
      return intersects;
    }

    function render() {
      if (!mapMaterial) return;
      
      mapMaterial.uniforms.u_time_since_click.value = clock.getElapsedTime();
      checkIntersects();
      if (pointer) {
        updateOverlayGraphic();
      }
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function updateSize() {
      const minSide = .65 * Math.min(window.innerWidth, window.innerHeight);
      containerEl.style.width = minSide + "px";
      containerEl.style.height = minSide + "px";
      renderer.setSize(minSide, minSide);
      canvas2D.width = canvas2D.height = minSide;
      if (mapMaterial) {
        mapMaterial.uniforms.u_dot_size.value = .04 * minSide;
      }
    }

    function cartesianToLatLong() {
      const pos = pointer.position;
      const lat = 90 - Math.acos(pos.y) * 180 / Math.PI;
      const lng = (270 + Math.atan2(pos.x, pos.z) * 180 / Math.PI) % 360 - 180;
      return formatCoordinate(lat, 'N', 'S') + ",&nbsp;" + formatCoordinate(lng, 'E', 'W');
    }

    function formatCoordinate(coordinate, positiveDirection, negativeDirection) {
      const direction = coordinate >= 0 ? positiveDirection : negativeDirection;
      return `${Math.abs(coordinate).toFixed(4)}°&nbsp${direction}`;
    }

    function createPopupTimelines() {
      popupOpenTl = gsap.timeline({
        paused: true
      })
        .to(pointer.material, {
          duration: .2,
          opacity: 1,
        }, 0)
        .fromTo(canvas2D, {
          opacity: 0
        }, {
          duration: .3,
          opacity: 1
        }, .15)
        .fromTo(popupEl, {
          opacity: 0,
          scale: .9,
          transformOrigin: "center bottom"
        }, {
          duration: .1,
          opacity: 1,
          scale: 1,
        }, .15 + .1);

      popupCloseTl = gsap.timeline({
        paused: true
      })
        .to(pointer.material, {
          duration: .3,
          opacity: .2,
        }, 0)
        .to(canvas2D, {
          duration: .3,
          opacity: 0
        }, 0)
        .to(popupEl, {
          duration: 0.3,
          opacity: 0,
          scale: 0.9,
          transformOrigin: "center bottom"
        }, 0);
    }

    function showPopupAnimation(lifted) {
      if (lifted) {
        let positionLifted = pointer.position.clone();
        positionLifted.multiplyScalar(1.3);
        gsap.from(pointer.position, {
          duration: .25,
          x: positionLifted.x,
          y: positionLifted.y,
          z: positionLifted.z,
          ease: "power3.out"
        });
      }
      popupCloseTl.pause(0);
      popupOpenTl.play(0);
    }

    function drawPopupConnector(startX, startY, midX, midY, endX, endY) {
      overlayCtx.strokeStyle = "#a900ff";
      overlayCtx.lineWidth = 3;
      overlayCtx.lineCap = "round";
      overlayCtx.clearRect(0, 0, containerEl.offsetWidth, containerEl.offsetHeight);
      overlayCtx.beginPath();
      overlayCtx.moveTo(startX, startY);
      overlayCtx.quadraticCurveTo(midX, midY, endX, endY);
      overlayCtx.stroke();
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      if (renderer) {
        renderer.dispose();
      }
      if (controls) {
        controls.dispose();
      }
    };
  }, []);

  return (
    <div className="page">
      <div className="globe-wrapper" style={{ position: "relative" }}>
        <canvas id="globe-3d"></canvas>
        <canvas id="globe-2d-overlay" style={{ position: "absolute", top: 0, left: 0 }}></canvas>
        <div id="globe-popup-overlay" style={{ position: "absolute", top: 0, left: 0 }}>
          <div className="globe-popup"></div>
        </div>
      </div>
    </div>
  );
}