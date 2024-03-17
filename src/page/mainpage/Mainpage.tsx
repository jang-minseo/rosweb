import { useState } from "react";
import SettingsComponent from "../../component/setting/SettingComponent";
import "./Mainpage.css";

export default function MainPage() {
  const [isURDFLoaded, setIsURDFLoaded] = useState<boolean | null>(null);
    const [isSLAMLoaded, setIsSLAMLoaded] = useState<boolean | null>(null);

    const handleURDFLoad = (isURDFLoaded: boolean): void => {
        setIsURDFLoaded(isURDFLoaded);
    };

    const handleSLAMLoad = (isSLAMLoaded: boolean): void => {
        setIsSLAMLoaded(isSLAMLoaded);
    };

  return (
    <div className="mainpage_container">
      <div className="setting_component_container">
          <SettingsComponent onURDFLoad={handleURDFLoad} onSLAMLoad={handleSLAMLoad} />
      </div>
    </div>
  )
}