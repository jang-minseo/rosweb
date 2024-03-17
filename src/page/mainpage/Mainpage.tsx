import SettingsComponent from "../../component/setting/SettingComponent";
import { useEffect } from "react";
import "./Mainpage.css";

export default function MainPage() {

  useEffect(() => {
    document.title = "URDF Loader";
  })

  return (
    <div className="mainpage_container">
      <div className="setting_component_container">
          <SettingsComponent />
      </div>
    </div>
  )
}