import SettingsComponent from "../../component/setting/SettingComponent";
import "./MainComponent.css";
import UniverseComponent from "../../component/universe/UniverseComponent";
import TopComponent from "../../component/top/TopComponent";
import { useState } from "react";

export default function MainPage() {
  const [isURDFLoaded, setIsURDFLoaded] = useState<boolean | null>(null);
  const [cameraDirection, setCameraDirection] = useState("");

  const selectURDF = (isURDFLoaded: boolean): void => {
    setIsURDFLoaded(isURDFLoaded);
  };
  const handleCamera = (direction: string) => {
    // UniverseComponent에 방향 정보 전달
    console.log(`Changing camera direction to ${direction}`);
    setCameraDirection(direction);
  };
  
  return (
    <div className="mainpage_container">
      <div className="top_component_container">
        <TopComponent />
      </div>
      <div className="main_container">
        <div className="setting_component_container">
          <SettingsComponent onURDFLoad={selectURDF} onChangeCameraDirection={handleCamera}/>
        </div>
        <div className="universe_component_container">
          <UniverseComponent isURDFLoaded={isURDFLoaded!} cameraDirection={cameraDirection} />
        </div>
      </div>
    </div>
  )
}