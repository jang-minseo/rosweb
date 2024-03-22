import * as THREE from "three";
import React, { useEffect, useState } from "react";
import "./UniverseComponent.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from "urdf-loader";
// import { cameraDirection } from "../page/mainpage/MainComponent"; 

interface UniverseComponentProps {
    isURDFLoaded: boolean;
    cameraDirection: string;
}

const UniverseComponent:  React.FC<UniverseComponentProps> = ({isURDFLoaded, cameraDirection}) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let control: OrbitControls;

    const [robot, setRobot] = useState<THREE.Group>();
    
    
    const viewScene = (container: HTMLElement): void => {
        scene = new THREE.Scene(); // 장면 생성
        camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000); // 카메라 설정
        renderer = new THREE.WebGLRenderer({antialias:true}); // 랜더러 설정
        renderer.setSize(container.offsetWidth, container.offsetHeight); // 화면 사이즈 설정
        control = new OrbitControls(camera, renderer.domElement);
        container.appendChild(renderer.domElement);

        camera.position.set(0,2,2);
        camera.lookAt(0,0,0);

        control.update();

        container.addEventListener('resize', () => {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
        });

        setAxesHelper();
        setGridHelper();
    }; 

    const animate = (): void => {
        requestAnimationFrame(animate);
        control.update();
        renderer.render(scene, camera);
    };

    const setAxesHelper = (): void => {
        const axesHelper: THREE.AxesHelper = new THREE.AxesHelper(1);
        axesHelper.position.set(0, 0, 0);
        scene.add(axesHelper);
    };

    const setGridHelper = (): void => {
        const size: number = 3;
        const divisions: number = 3;

        const gridHelper: THREE.GridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);
    }; 



    const loadURDF = (): void => {
        if (isURDFLoaded) {
            const manager = new THREE.LoadingManager();
            const loader = new URDFLoader(manager);

            loader.packages = {
                packageName: '/',
            };

            const urdfURL: string = localStorage.getItem('urdf')!.toString();
            console.log(`urdfURL : ${urdfURL}`);

            loader.load(urdfURL, (robot: URDFRobot) => {
                console.log(`robot : ${JSON.stringify(robot)}`);

                const robotGroup: THREE.Group = new THREE.Group();
                robot.traverse((child: any) => {
                    const childJson: any = JSON.parse(JSON.stringify(child));

                    if (child instanceof THREE.Mesh) {
                        const colorTag: string = childJson.materials[0].name.toLocaleLowerCase();

                        switch (colorTag) {
                            case 'black':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                            case 'light_black':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                            case 'blue':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                                break;
                            case 'red':
                                child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                                break;
                            default:
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                        }
                        child.material.transparent = true;
                        child.material.opacity = 1.0;
                    }
                    child.castShadow = true;
                });

                robot.scale.set(0.1, 0.1, 0.1);

                robotGroup.add(robot);
                setRobot(robotGroup);
                robotGroup.position.set(0, 0, 0);
                robotGroup.rotateX(-(Math.PI / 2));

                scene.add(robotGroup);
            });
        }
    };

    const updateCameraDirection = (): void => {
        switch (cameraDirection) {
            case "Front":
                camera.position.set(3, 0, 0);
                break;
            case "Top":
                camera.position.set(0, 3, 0);
                break;
            case "Side":
                camera.position.set(0, 0, 3);
                break;
            case "Back":
                camera.position.set(-3, 0, 0);
                break;
            default:
                break;
        }
    };


    useEffect(() => {
        const container: HTMLElement | null = document.getElementById('universe_container');

        if(container) {
            viewScene(container);
            animate();
            
            
        }

       updateCameraDirection();

        if (isURDFLoaded) {
            loadURDF();
        }


        return (): void => {
            container!.removeChild(renderer.domElement);
            loadURDF();
        }
    }, [isURDFLoaded, cameraDirection]);

    

    return (
        <div id='universe_container' className='universe_container'></div>
    )
}

export default UniverseComponent;

