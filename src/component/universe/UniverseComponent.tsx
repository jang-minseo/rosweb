import * as THREE from "three";
import React, { Children, useEffect, useState } from "react";
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
    selectedGeometry: string;
}

const UniverseComponent: React.FC<UniverseComponentProps> = ({isURDFLoaded, selectedGeometry, cameraDirection, selectedLink, setLinkNames, setJointNames, urdfKey}) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let control: OrbitControls;
    const [robot, setRobotGroup] = useState<THREE.Group>();
    const [robotJSON, setRobotJSON] = useState<{geometries: any, materials: any, metadata: any, object: any}>();

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

            loader.load(urdfURL, (robot: URDFRobot) => {
                
                
                const RobotGroup: THREE.Group = new THREE.Group();
                const linkNames: string[] = [];
                const jointNames: string[] = [];
                robot.traverse((child: any) => {
                    const childJson: any = JSON.parse(JSON.stringify(child));
                    
                    setRobotJSON(childJson);

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
                     if (child.type === "URDFJoint") {
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

    // // gemetry 변경하기
    // const updateGeometry = (): void => {
    //     if (robotJSON && selectedLink && selectedGeometry) {
    //         let updatedGeometry = robotJSON.geometries[0]; // 첫 번째 geometry를 가져옴
            
    //         // selectedGeometry 값에 따라 geometry type 변경
    //         switch (selectedGeometry) {
    //             case "BoxGeometry":
    //                 updatedGeometry.type = selectedGeometry;
    //                 break;
    //             case "CylinderGeometry":
    //                 updatedGeometry.type = selectedGeometry;
    //                 updatedGeometry.radiusBottom = 1;
    //                 updatedGeometry.radialSegments = 30;
    //                 updatedGeometry.radiusTop = 1;
    //                 updatedGeometry.openEnded = false;
    //                 break;
    //             case "SphereGeometry":
    //                 updatedGeometry.type = selectedGeometry;
    //                 break;
    //         }
    
    //         // 변경된 geometry를 robotJSON에 다시 저장
    //         robotJSON.geometries[0] = updatedGeometry;
    //         setRobotJSON(robotJSON);         
            
    //     }
    // };

    const onCanvasClick = (event: MouseEvent) => {
        event.preventDefault();
    
        // 마우스 위치를 계산합니다.
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        // Raycaster 객체를 생성합니다.
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    
        // GridHelper와 AxesHelper를 제외한 객체만 필터링합니다.
        const objectsToCheck = scene.children.filter(child => 
            !(child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper));
    
        // 필터링된 객체 배열을 사용하여 교차 검사를 수행합니다.
        const intersects = raycaster.intersectObjects(objectsToCheck, true);
    
        if (intersects.length > 0) {
            let targetObject = intersects[0].object;
            const selectedObject = intersects[0].object;
            console.log(selectedObject);
            
            // 부모 오브젝트를 탐색하며 URDFLink 찾기
            while (targetObject !== null && targetObject !== null) {
                if (targetObject.parent?.parent?.type) {
                    console.log(`URDFLink name: ${targetObject.parent?.parent?.name}`);
                    break;
                }
                targetObject = targetObject.parent as THREE.Object3D;
            }
        }
    };
    
    useEffect(() => {
        const container: HTMLElement | null = document.getElementById("universe_container");
    
        if (!container) return;

        viewScene(container);

        if (isURDFLoaded) {
            loadURDF();
        }

        if(cameraDirection) {
            updateCameraPosition();
        }

        container.addEventListener('click', onCanvasClick, false);

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
            container.removeEventListener('click', onCanvasClick, false);
            container!.removeChild(renderer.domElement);
        };
    }, [isURDFLoaded, urdfKey, cameraDirection, selectedLink, selectedGeometry]);

    return <div id="universe_container" className="universe_container"></div>;
};

export default UniverseComponent;