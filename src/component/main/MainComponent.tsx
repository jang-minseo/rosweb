import React, { useState } from 'react';
import "./MainComponent.css";
import UniverseComponent from "../universe/UniverseComponent";
import TopComponent from "../top/TopComponent";
import SettingComponent from "../setting/SettingComponent";

const MainComponent = () => {
    const [urdfKey, setUrdfKey] = useState<number>(Date.now());
    const [isURDFLoaded, setIsURDFLoaded] = useState(false);
    const [cameraDirection, setCameraDirection] = useState("");
    const [linkNames, setLinkNames] = useState<string[]>([]);
    const [jointNames, setJointNames] = useState<string[]>([]);
    const [selectedLink, setSelectedLink] = useState<string>("");

    const selectURDF = (isURDFLoaded: boolean): void => {
        setIsURDFLoaded(isURDFLoaded);
        setUrdfKey(Date.now());
    };

    const handleCamera = (direction: string) => {
        setCameraDirection(direction);
    };

    const handleLinkSelect = (linkName: string): void => {
        setSelectedLink(linkName);
        console.log(`${linkName}이 선택됨`);
    };

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
                        linkNames={linkNames}
                        jointNames={jointNames}
                        onSelectLink={handleLinkSelect}
                    />
                </div>
                <div className="universe_component_container">
                    <UniverseComponent
                        isURDFLoaded={isURDFLoaded}
                        cameraDirection={cameraDirection}
                        selectedLink={selectedLink}
                        setLinkNames={setLinkNames}
                        setJointNames={setJointNames}
                        urdfKey={urdfKey}
                    />
                </div>
            </div>
        </div>
    );
}

export default MainComponent;
