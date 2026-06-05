"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { SOCIAL_LINKS } from "./lib/config";

interface SkillData {
  name: string;
  shape: string;
  color: string;
  desc: string;
  shapeIdx: number;
}

const skillsMetadata: Record<string, SkillData> = {
  React: {
    name: "React",
    shape: "React Atom",
    color: "#61DAFB",
    desc: "Interactive user interfaces built with React's component-driven architecture, virtual DOM rendering, state managers, and React Server Components.",
    shapeIdx: 1.0,
  },
  "Next.js": {
    name: "Next.js",
    shape: "Stylized N Circle",
    color: "#FFFFFF",
    desc: "High-performance full-stack web applications utilizing Next.js Server Components, App Router, incremental static regeneration (ISR), and optimized asset preloading.",
    shapeIdx: 3.0,
  },
  TypeScript: {
    name: "TypeScript",
    shape: "3D Wireframe Cube",
    color: "#3178C6",
    desc: "Robust, enterprise-grade application logic written in TypeScript. Strict static typing, advanced type algebra, and deep compile-time safety guards.",
    shapeIdx: 5.0,
  },
  "Three.js": {
    name: "Three.js",
    shape: "3D Tetrahedron",
    color: "#FF4B4B",
    desc: "Immersive 3D graphics, procedural particle structures, mathematical morphing, custom GLSL shaders, and real-time WebGL rendering pipelines.",
    shapeIdx: 2.0,
  },
  "Node.js": {
    name: "Node.js",
    shape: "3D Hexagonal Prism",
    color: "#339933",
    desc: "Scalable server architectures and developer tooling built on Node.js. Multi-threaded worker pools, streaming I/O, and asynchronous event loops.",
    shapeIdx: 4.0,
  },
  Python: {
    name: "Python",
    shape: "3D Double Helix",
    color: "#3776AB",
    desc: "Scripting, automation, and mathematical models developed in Python. Data analysis pipelines, NumPy matrix manipulation, and clean procedural structures.",
    shapeIdx: 6.0,
  },
  "Gen-AI": {
    name: "Generative AI",
    shape: "3D Sparkle Network",
    color: "#8A2BE2",
    desc: "Advanced Generative AI pipelines, model finetuning, RAG search architectures, agentic flow orchestration, and prompt engineering optimizations.",
    shapeIdx: 7.0,
  },
  "Claude Code": {
    name: "Claude Code",
    shape: "Claude Logo",
    color: "#D97757",
    desc: "State-of-the-art developer agent orchestration and task execution powered by Anthropic's Claude. Autonomous planning, editing, and execution loops.",
    shapeIdx: 8.0,
  },
  Redux: {
    name: "Redux",
    shape: "Redux Triquetra",
    color: "#764ABC",
    desc: "Predictable state container for JavaScript apps. Centralized state management, middleware integration, Redux Toolkit, and robust data flow synchronization.",
    shapeIdx: 9.0,
  },
};

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [focusedSkill, setFocusedSkill] = useState<SkillData | null>(null);
  const [activeMetadata, setActiveMetadata] = useState<SkillData | null>(null);

  useEffect(() => {
    if (focusedSkill) {
      setActiveMetadata(focusedSkill);
    }
  }, [focusedSkill]);

  useEffect(() => {
    // 1. Define global window configurations for WebGL resources
    (window as any).template_url = "";
    (window as any).assets = [
      {
        name: "base",
        data: {},
        items: [
          { name: "scene", source: "/static/model/scene.glb", type: "glb" },
          {
            name: "p1",
            source: "/static/images/particles.png",
            type: "texture",
          },
          {
            name: "p2",
            source: "/static/images/particles-2.png",
            type: "texture",
          },
          {
            name: "p3",
            source: "/static/images/particles-3.png",
            type: "texture",
          },
          {
            name: "fogTexture",
            source: "/static/images/cloud.png",
            type: "texture",
          },
          {
            name: "visionSound",
            source: "/static/audio/combo-3/1-vision.mp3",
            type: "audio",
          },
          {
            name: "craftSound",
            source: "/static/audio/combo-3/2-craft.mp3",
            type: "audio",
          },
          {
            name: "experienceSound",
            source: "/static/audio/combo-3/3-experience.mp3",
            type: "audio",
          },
          {
            name: "hoverSound",
            source: "/static/audio/sfx/hover-beep-select.mp3",
            type: "audio",
          },
        ],
      },
    ];

    // 2. Load the bundle.js script dynamically inside client side after DOM mounts
    const script = document.createElement("script");
    script.src = "/dist/bundle.js";
    script.async = true;
    script.onload = () => {
      setLoaded(true);
    };
    script.onerror = (err) => {
      console.error("Error loading portfolio bundle:", err);
    };
    document.body.appendChild(script);

    let cleanupInteractivity: (() => void) | null = null;

    // 3. Poll for WebGL instance and initialize interactivity
    const checkTimer = setInterval(() => {
      const app = (window as any).portfolioApp;
      if (app && app.clientsR && app.clientsR.length >= 9) {
        clearInterval(checkTimer);
        cleanupInteractivity = setupWebGLInteractivity(app);
      }
    }, 100);

    const setupWebGLInteractivity = (app: any) => {
      let hoveredSkill: any = null;
      let focusedSkillInstance: any = null;
      let originalCamPos: THREE.Vector3 | null = null;
      let originalCamTarget: THREE.Vector3 | null = null;
      let startScrollTop = 0;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(-999, -999);

      const onMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      const onClick = (event: MouseEvent) => {
        const loader = document.querySelector(".loader");
        if (loader) {
          const computedStyle = window.getComputedStyle(loader);
          if (
            computedStyle.opacity !== "0" &&
            computedStyle.display !== "none"
          ) {
            return;
          }
        }

        const card = document.getElementById("skill-desc-overlay");
        if (card && card.contains(event.target as Node)) {
          return;
        }

        if (app.clientsR && app.clientsR.length >= 9) {
          raycaster.setFromCamera(mouse, app.camera);

          let clickedSkill: any = null;
          app.camera.updateMatrixWorld(true);
          for (const skill of app.clientsR) {
            if (!skill.ready || !skill.group) continue;
            skill.group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(skill.group);
            box.expandByScalar(0.08);
            const intersectionPoint = new THREE.Vector3();
            const intersects = raycaster.ray.intersectBox(
              box,
              intersectionPoint,
            );
            if (intersects !== null) {
              clickedSkill = skill;
              break;
            }
          }

          if (clickedSkill) {
            focusOnSkill(clickedSkill);
          } else {
            if (focusedSkillInstance) {
              resetFocus();
            }
          }
        }
      };

      const focusOnSkill = (skill: any) => {
        const meta = skillsMetadata[skill.text];
        if (!meta) return;

        setFocusedSkill(meta);
        focusedSkillInstance = skill;

        const scroller = document.querySelector("#scroller");
        startScrollTop = scroller ? scroller.scrollTop : window.scrollY;

        if (!originalCamPos) {
          originalCamPos = app.cameraYaw.position.clone();
          originalCamTarget = app.cameraTarget.position.clone();
        }

        // Focus scale highlight (1.35x) and opacity (1.0), dim others
        app.clientsR.forEach((c: any) => {
          if (c === skill) {
            gsap.to(c, {
              scaleValue: 0.0025 * 1.35,
              opacity: 1.0,
              duration: 0.45,
              overwrite: "auto",
              onUpdate: () => {
                c.setScale(c.scaleValue);
                c.setOpacity(c.opacity);
              },
            });
          } else {
            gsap.to(c, {
              scaleValue: 0.0025 * 0.4,
              opacity: 0.05,
              duration: 0.45,
              overwrite: "auto",
              onUpdate: () => {
                c.setScale(c.scaleValue);
                c.setOpacity(c.opacity);
              },
            });
          }
        });

        const nodePos = skill.group.position;
        const targetCamPos = new THREE.Vector3(
          nodePos.x + 0.8,
          nodePos.y + 0.4,
          nodePos.z + 1.5,
        );

        gsap.killTweensOf(app.cameraYaw.position);
        gsap.killTweensOf(app.cameraTarget.position);

        gsap.to(app.cameraYaw.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: 1.5,
          ease: "power3.out",
        });

        gsap.to(app.cameraTarget.position, {
          x: nodePos.x,
          y: nodePos.y,
          z: nodePos.z,
          duration: 1.5,
          ease: "power3.out",
        });

        if (
          app.desert &&
          app.desert.particles &&
          app.desert.particles.material
        ) {
          const u = app.desert.particles.material.uniforms;
          if (
            u &&
            u.uFocusedSkillPos &&
            u.uSkillMorphShape &&
            u.uSkillMorphProgress
          ) {
            u.uFocusedSkillPos.value.copy(nodePos);
            u.uSkillMorphShape.value = meta.shapeIdx;

            gsap.killTweensOf(u.uSkillMorphProgress);
            gsap.to(u.uSkillMorphProgress, {
              value: 1.0,
              duration: 1.6,
              ease: "power3.out",
            });
          }
        }

        if (app.cameraMouseStrength) {
          gsap.killTweensOf(app.cameraMouseStrength);
          gsap.to(app.cameraMouseStrength, {
            x: 0.002,
            y: 0.002,
            duration: 1.5,
            ease: "power3.out",
          });
        }
      };

      const resetFocus = () => {
        if (!focusedSkillInstance) return;

        setFocusedSkill(null);
        focusedSkillInstance = null;

        app.clientsR.forEach((c: any) => {
          gsap.to(c, {
            scaleValue: 0.0025,
            opacity: 0.3,
            duration: 0.6,
            overwrite: "auto",
            onUpdate: () => {
              c.setScale(c.scaleValue);
              c.setOpacity(c.opacity);
            },
          });
        });

        if (originalCamPos && originalCamTarget) {
          gsap.killTweensOf(app.cameraYaw.position);
          gsap.killTweensOf(app.cameraTarget.position);

          gsap.to(app.cameraYaw.position, {
            x: originalCamPos.x,
            y: originalCamPos.y,
            z: originalCamPos.z,
            duration: 1.2,
            ease: "power3.out",
            onComplete: () => {
              originalCamPos = null;
            },
          });

          gsap.to(app.cameraTarget.position, {
            x: originalCamTarget.x,
            y: originalCamTarget.y,
            z: originalCamTarget.z,
            duration: 1.2,
            ease: "power3.out",
            onComplete: () => {
              originalCamTarget = null;
            },
          });
        }

        if (
          app.desert &&
          app.desert.particles &&
          app.desert.particles.material
        ) {
          const u = app.desert.particles.material.uniforms;
          if (u && u.uSkillMorphProgress) {
            gsap.killTweensOf(u.uSkillMorphProgress);
            gsap.to(u.uSkillMorphProgress, {
              value: 0.0,
              duration: 1.0,
              ease: "power2.out",
            });
          }
        }

        if (app.cameraMouseStrength) {
          gsap.killTweensOf(app.cameraMouseStrength);
          gsap.to(app.cameraMouseStrength, {
            x: 0.08,
            y: 0.12,
            duration: 1.2,
            ease: "power3.out",
          });
        }
      };

      const onScroll = () => {
        if (!focusedSkillInstance) return;
        const scroller = document.querySelector("#scroller");
        const currentScrollTop = scroller ? scroller.scrollTop : window.scrollY;
        if (Math.abs(currentScrollTop - startScrollTop) > 10) {
          resetFocus();
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("click", onClick);

      const scroller = document.querySelector("#scroller");
      if (scroller) {
        scroller.addEventListener("scroll", onScroll);
      } else {
        window.addEventListener("scroll", onScroll);
      }

      let lastMouseX = mouse.x;
      let lastMouseY = mouse.y;
      let mouseSpeed = 0.0;

      let rafId: number;
      const tick = () => {
        // Calculate mouse velocity in NDC space
        let instantSpeed = 0.0;
        if (lastMouseX > -900 && mouse.x > -900) {
          const dx = mouse.x - lastMouseX;
          const dy = mouse.y - lastMouseY;
          instantSpeed = Math.sqrt(dx * dx + dy * dy);
        }
        // Smoothly low-pass filter (lerp) the speed
        mouseSpeed += (instantSpeed - mouseSpeed) * 0.1;

        lastMouseX = mouse.x;
        lastMouseY = mouse.y;

        // Feed uMouseSpeed to the particles shader uniform
        if (
          app &&
          app.desert &&
          app.desert.particles &&
          app.desert.particles.material
        ) {
          const u = app.desert.particles.material.uniforms;
          if (u) {
            if (!u.uMouseSpeed) {
              u.uMouseSpeed = { value: 0.0 };
            }
            u.uMouseSpeed.value = mouseSpeed;
          }
        }

        if (app.clientsR && app.clientsR.length >= 9) {
          raycaster.setFromCamera(mouse, app.camera);

          let foundSkill: any = null;
          app.camera.updateMatrixWorld(true);
          for (const skill of app.clientsR) {
            if (!skill.ready || !skill.group) continue;
            skill.group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(skill.group);
            box.expandByScalar(0.08);
            const intersectionPoint = new THREE.Vector3();
            const intersects = raycaster.ray.intersectBox(
              box,
              intersectionPoint,
            );
            if (intersects !== null) {
              foundSkill = skill;
              break;
            }
          }

          if (foundSkill !== hoveredSkill) {
            if (foundSkill && foundSkill !== focusedSkillInstance) {
              if ((window as any).portfolioAudio) {
                (window as any).portfolioAudio.playHover();
              }
              const targetFound = foundSkill;
              gsap.to(targetFound, {
                scaleValue: 0.0025 * 1.35,
                opacity: 1.0,
                duration: 0.35,
                overwrite: "auto",
                onUpdate: () => {
                  targetFound.setScale(targetFound.scaleValue);
                  targetFound.setOpacity(targetFound.opacity);
                },
              });
            }

            if (hoveredSkill && hoveredSkill !== focusedSkillInstance) {
              const targetHovered = hoveredSkill;
              gsap.to(targetHovered, {
                scaleValue: 0.0025,
                opacity: 0.3,
                duration: 0.35,
                overwrite: "auto",
                onUpdate: () => {
                  targetHovered.setScale(targetHovered.scaleValue);
                  targetHovered.setOpacity(targetHovered.opacity);
                },
              });
            }

            hoveredSkill = foundSkill;
          }

          if (foundSkill) {
            document.body.style.cursor = "pointer";
          } else {
            document.body.style.cursor = "auto";
          }
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("click", onClick);
        if (scroller) {
          scroller.removeEventListener("scroll", onScroll);
        } else {
          window.removeEventListener("scroll", onScroll);
        }
        cancelAnimationFrame(rafId);
        document.body.style.cursor = "auto";
      };
    };

    return () => {
      clearInterval(checkTimer);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (cleanupInteractivity) {
        cleanupInteractivity();
      }
    };
  }, []);

  return (
    <>
      {/* SEO content — visually hidden, readable by crawlers and screen readers */}
      <section className="sr-only" aria-label="About Pariwesh Tamrakar">
        <h1>Pariwesh Tamrakar — AI Engineer &amp; Developer</h1>
        <p>
          I build immersive full-stack web applications and AI-powered systems
          using React, Next.js, TypeScript, Three.js, Node.js, Python, and
          Generative AI. Specializing in agentic AI pipelines, real-time 3D
          WebGL experiences, and enterprise-grade developer tooling.
        </p>
        <ul>
          {Object.values(skillsMetadata).map((skill) => (
            <li key={skill.name}>
              <strong>{skill.name}</strong>: {skill.desc}
            </li>
          ))}
        </ul>
      </section>

      {/* Immersive Loader overlay */}
      <div className="loader">
        <div className="wrap">
          <i>loading</i>
          <a href="#" onClick={(e) => e.preventDefault()}>
            enter
          </a>
        </div>
        <span></span>
      </div>

      {/* WebGL Canvas container */}
      <div className="canvas"></div>

      {/* Cinematic Header overlay */}
      <header className="header">
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row">
              <div className="col-6">
                <a
                  className="header__lnk"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  AI Engineer / Developer
                </a>
              </div>
              <div className="col-6 d-flex align-items-center justify-content-end">
                <a
                  className="header__lnk--2 top-menu-lnk--3"
                  href="mailto:hello@developer.ai"
                >
                  Let&apos;s talk
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Scroll-based 3D scene camera scroller */}
      <div id="scroller">
        <div id="content">
          <main data-barba="container" data-barba-namespace="home">
            {/* Steps coordinate camera keyframe triggers along scroll progress */}
            <div className="steps">
              {Array.from({ length: 24 }, (_, i) => (
                <div className="step" key={i}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Awards gallery elements (queried by bundle.js to render 3D floating panels) */}
            <div className="d-none" id="awards">
              <img
                src="/static/images/awards/ui.png"
                alt="UI Award"
                className="img-fluid"
                data-title="1"
              />
              <img
                src="/static/images/awards/ux.png"
                alt="UX Award"
                className="img-fluid"
                data-title="2"
              />
              <img
                src="/static/images/awards/innovation.png"
                alt="Innovation Award"
                className="img-fluid"
                data-title="3"
              />
              <img
                src="/static/images/awards/hm.png"
                alt="Honorable Mention"
                className="img-fluid"
                data-title="4"
              />
              <img
                src="/static/images/awards/wod.png"
                alt="Site of the Day"
                className="img-fluid"
                data-title="5"
              />
              <img
                src="/static/images/awards/jury.png"
                alt="Jury Badge"
                className="img-fluid"
                data-title="6"
              />
            </div>
          </main>
        </div>
      </div>

      {/* Immersive Footer overlay */}
      <footer className="footer">
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row align-items-center justify-content-between">
              <div className="col-8">
                <ul className="footer__social">
                  <li>
                    <a
                      className="footer__social-lnk"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={SOCIAL_LINKS.linkedin}
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      className="footer__social-lnk"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={SOCIAL_LINKS.github}
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-4 text-end">
                {/* Audio toggle control with interactive wave SVG */}
                <button
                  className="footer__audio-toggle js-audio-toggle"
                  type="button"
                  aria-label="Disable sound"
                  aria-pressed="false"
                >
                  <svg
                    className="footer__audio-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                  >
                    <polyline
                      className="js-audio-wave"
                      points="1,5 2.14,4.08 3.29,3.55 4.43,3.82 5.57,4.8 6.71,5.9 7.86,6.45 9,6.08"
                    ></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Frosted glass skill description overlay */}
      <div id="skill-desc-overlay" className={focusedSkill ? "visible" : ""}>
        {activeMetadata && (
          <>
            <div className="skill-title-wrap">
              <span
                className="skill-title"
                style={{ color: activeMetadata.color }}
              >
                {activeMetadata.name}
              </span>
              <span className="skill-shape-name">{activeMetadata.shape}</span>
            </div>
            <p className="skill-desc">{activeMetadata.desc}</p>
          </>
        )}
      </div>
    </>
  );
}
