import * as THREE from "three";
import React, { useEffect, useState } from "react";
import "./UniverseComponent.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from "urdf-loader";

interface UniverseComponentProps {
    isURDFLoaded: boolean;
    cameraDirection: string;
    selectedLink: string;
    setLinkNames: (linkNames: string[]) => void;
    setJointNames: (jointNames: string[]) => void;
    urdfKey: number;
}

const UniverseComponent: React.FC<UniverseComponentProps> = ({isURDFLoaded, cameraDirection, selectedLink, setLinkNames, setJointNames, urdfKey}) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let control: OrbitControls;
    const [robot, setRobotGroup] = useState<THREE.Group>();

    // 3D 화면 기본 설정
    const viewScene = (container: HTMLElement): void => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75,container.offsetWidth / container.offsetHeight, 0.1, 1000 );
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        control = new OrbitControls(camera, renderer.domElement);
        container.appendChild(renderer.domElement);

        camera.position.set(0, 8, 8);
        camera.lookAt(0, 0, 0);

        control.update();

        scene.add(new THREE.AxesHelper(4));
        scene.add(new THREE.GridHelper(11, 11));

        const animate = (): void => {
            requestAnimationFrame(animate);
            control.update();
            renderer.render(scene, camera);
        };
        animate();
    };

    // 카메라 조정 기능
    const updateCameraPosition = (): void => {
        const cameraPositions: Record<string, [number, number, number]> = {
            Front: [3, 0, 0],
            Top: [0, 3, 0],
            Side: [0, 0, 3],
            Back: [-3, 0, 0],
        };

        const position = cameraPositions[cameraDirection];
        if (position) {
            camera.position.set(...position);
        }
    };

    // URDF Load 기능
    const loadURDF = (): void => {
        if (isURDFLoaded) {
            const manager = new THREE.LoadingManager();
            const loader = new URDFLoader(manager);

            loader.packages = {
                packageName: "/",
            };

            const urdfURL: string = localStorage.getItem("urdf")!.toString();
            console.log(`urdfURL : ${urdfURL}`);

            loader.load(urdfURL, (robot: URDFRobot) => {
                console.log(`robot : ${JSON.stringify(robot)}`);
                const RobotGroup: THREE.Group = new THREE.Group();
                const linkNames: string[] = [];
                const jointNames: string[] = [];
                const geometryTypes: any = "";

                robot.traverse((child: any) => {
                    const childJson: any = JSON.parse(JSON.stringify(child));

                    if (child instanceof THREE.Mesh) {
                        const colorTag: string = childJson.materials[0].name.toLocaleLowerCase();

                        switch (colorTag) {
                            case "black":
                            case "light_black":
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                            case "blue":
                                child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                                break;
                            case "red":
                                child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                                break;
                            default:
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                        }
                        child.material.transparent = true;
                        child.material.opacity = 1.0;
                    }
                    
                    // link와 joint Name 추출 로직
                    if (child.type === "URDFLink") {
                        linkNames.push(child.name);
                    } else if (child.type === "URDFJoint") {
                        jointNames.push(child.name);
                    }

                    child.castShadow = true;
                });

                setLinkNames(linkNames);
                setJointNames(jointNames);

                RobotGroup.add(robot);
                setRobotGroup(RobotGroup);
                RobotGroup.position.set(0, 0, 0);
                RobotGroup.rotateX(-(Math.PI / 2));
                scene.add(RobotGroup);
            });
        }
    };

    useEffect(() => {
        const container: HTMLElement | null = document.getElementById("universe_container");
    
        if (container) {
            viewScene(container);

            if (isURDFLoaded) {
                loadURDF();
            }
        }

        return (): void => {
            if (robot && scene) {
                scene.remove(robot); // URDF 모델을 장면에서 제거
                robot.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        let mesh = child as THREE.Mesh;
                        if (mesh.material) {
                            (mesh.material as THREE.Material).dispose();
                        }
                        if (mesh.geometry) {
                            mesh.geometry.dispose();
                        }
                    }
                });
            }
            container!.removeChild(renderer.domElement);
        };
    }, [isURDFLoaded, urdfKey]);
    
    useEffect(() => {
        updateCameraPosition();
    }, [cameraDirection])

    useEffect(() => {
        if (robot && selectedLink) {
            const selectedObject = robot.getObjectByName(selectedLink);
            if (selectedObject) {
                selectedObject.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        console.log(`${selectedLink}의 Geometry: `, child.geometry.type);
                    }
                });
            }
        }
    }, [selectedLink, robot]);

    return <div id="universe_container" className="universe_container"></div>;
};

export default UniverseComponent;