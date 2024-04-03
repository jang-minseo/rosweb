import * as THREE from "three";
import React, { useEffect, useState } from "react";
import "./UniverseComponent.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from "urdf-loader";

interface UniverseComponentProps {
    isURDFLoaded: boolean;
    cameraDirection: string;
    selectedGeometry: string;
    setJointNames: (jointNames: string[]) => void;
    setJointValues: (jointValues: number[]) => void;
    setLinkName: (linkName: string) => void;
    urdfKey: number;
}

const UniverseComponent: React.FC<UniverseComponentProps> = ({
    isURDFLoaded, 
    selectedGeometry, 
    cameraDirection, 
    setJointNames,
    setJointValues,
    urdfKey, 
    setLinkName
}) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let control: OrbitControls;
    const [robot, setRobotGroup] = useState<THREE.Group>();
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
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
                const jointNames: string[] = [];
                const jointValues: number[] = [];
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
                    if (child.type === "URDFJoint") {
                        jointNames.push(child.name);
                        jointValues[child.name] = child.jointValue[0];
                    }
                    child.castShadow = true;          
                });
                setJointNames(jointNames);
                setJointValues(jointValues);
                console.log(jointValues);
                
                RobotGroup.add(robot);
                setRobotGroup(RobotGroup);
                RobotGroup.position.set(0, 0, 0);
                RobotGroup.rotateX(-(Math.PI / 2));
                scene.add(RobotGroup);
            });
        } 
    };

    const onCanvasClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        // 마우스 위치 계산
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        let linkName = null;
    
        // Raycaster 객체 생성
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    
        // GridHelper와 AxesHelper를 제외
        const objectsToCheck = scene.children.filter(
            child =>
                !(child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper)
        );
    
        // 필터링된 객체 배열을 사용하여 교차 검사를 수행합니다.
        const intersects = raycaster.intersectObjects(objectsToCheck, true);
    
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            setSelectedObject(selectedObject);
            console.log(selectedObject);
    
            // 부모 오브젝트를 탐색하며 URDFLink 찾기
            let targetObject = selectedObject;
            while (targetObject !== null) {
                if (targetObject.parent?.parent?.type) {
                    linkName = targetObject.parent.parent.name;
                    setLinkName(linkName);
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
                scene.remove(robot);
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
    }, [isURDFLoaded, urdfKey, cameraDirection]);

    useEffect(() => {
        if (selectedObject && selectedObject instanceof THREE.Mesh && selectedGeometry) {
            let newGeometry: THREE.BufferGeometry | THREE.BufferGeometry;

            switch (selectedGeometry) {
                case "BoxGeometry":
                    newGeometry = new THREE.BoxGeometry();
                    break;
                case "CylinderGeometry":
                    newGeometry = new THREE.CylinderGeometry();
                    break;
                case "SphereGeometry":
                    newGeometry = new THREE.SphereGeometry();
                    break;
                default:
                    newGeometry = selectedObject.geometry.clone(); 
                    break;
            }

            if (newGeometry) {
                selectedObject.geometry.dispose();
                selectedObject.geometry = newGeometry;
                selectedObject.material.transparent = true;
                selectedObject.material.opacity = 1.0;
            }
        }
    }, [selectedObject, selectedGeometry]);
    

    return <div id="universe_container" className="universe_container"></div>;
};

export default UniverseComponent;
