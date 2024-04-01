import React, { useState } from 'react';
import "./MainComponent.css";
import UniverseComponent from "../universe/UniverseComponent";
import TopComponent from "../top/TopComponent";
import SettingComponent from "../setting/SettingComponent";

const MainComponent = () => {
    const [urdfKey, setUrdfKey] = useState<number>(Date.now());
    const [isURDFLoaded, setIsURDFLoaded] = useState(false);
    const [cameraDirection, setCameraDirection] = useState("");
    const [linkName, setLinkName] = useState<string>("");
    const [jointNames, setJointNames] = useState<string[]>([]);
    const [selectedGeometry, setSelectedGeometry] = useState<string>("BoxGeometry"); // 기본값 설정

    const selectURDF = (isURDFLoaded: boolean): void => {
        setIsURDFLoaded(isURDFLoaded);
        setUrdfKey(Date.now());
    };

    const handleCamera = (direction: string) => {
        setCameraDirection(direction);
    };

    const handleGeometry = (geometryType: string): void => {
        setSelectedGeometry(geometryType);
    }

    return (
        <div className="mainpage_container">
            <div className="top_component_container">
                <TopComponent />
            </div>
            <div className="main_container">
                <div className="setting_component_container">
                    <SettingComponent
                        onURDFLoad={selectURDF}
                        onChangeCameraDirection={handleCamera}
                        jointNames={jointNames}
                        linkName={linkName}
                        onChangeGeometry={handleGeometry}
                        selectedGeometry={selectedGeometry} // 선택한 지오메트리 상태 전달
                    />
                </div>
                <div className="universe_component_container">
                    <UniverseComponent
                        selectedGeometry={selectedGeometry}
                        isURDFLoaded={isURDFLoaded}
                        cameraDirection={cameraDirection}
                        setJointNames={setJointNames}
                        setLinkName={setLinkName}
                        urdfKey={urdfKey}
                    />
                </div>
            </div>
        </div>
    );
}

export default MainComponent;
