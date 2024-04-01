import React, { useState } from 'react';
import "./SettingComponent.css";

interface SettingComponentProps {
    onURDFLoad: (isURDFLoaded: boolean) => void;
    onChangeCameraDirection: (direction: string) => void;
    onChangeGeometry: (geometryType: string) => void;
    linkName : string;
    jointNames: string[];
    selectedGeometry: string; // 새로운 props 추가: 선택한 지오메트리 상태
}

const SettingsComponent: React.FC<SettingComponentProps> = ({
    onURDFLoad, 
    onChangeCameraDirection, 
    onChangeGeometry, 
    jointNames, 
    linkName,
    selectedGeometry // 새로운 props로부터 선택한 지오메트리 상태 가져오기
}) => {
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const selectURDF = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        e.preventDefault();
        const choiceFile = e.target.files && e.target.files[0];
        if (choiceFile) {
            const fileName = choiceFile.name;
            setSelectedFileName(fileName);
            const blob: Blob = new Blob([choiceFile], { type: "application/xml" });
            const urdfString: string = URL.createObjectURL(blob);
            localStorage.setItem("urdf", urdfString);
            onURDFLoad(true);
        }
    };

    const handleCamera = (direction: string) => {
        onChangeCameraDirection(direction);
    };

    const handleGeometry = (geometryType: string): void => {
        onChangeGeometry(geometryType);
    }

    return (
        <div className="setting_container">
            <div className="urdf_container">
                <h3>URDF</h3>
                <input
                    className='upload' 
                    value={selectedFileName}
                    readOnly
                />
                <label htmlFor="file">파일찾기</label>
                <input
                    id='file'
                    type='file'
                    name='urdf'
                    onChange={selectURDF}
                    accept='.urdf, .URDF'
                />
            </div>
            <div className="camera_container">
                <h3>Camera</h3>
                <button onClick={() => handleCamera("Front")}>Front</button>
                <button onClick={() => handleCamera("Top")}>Top</button>
                <button onClick={() => handleCamera("Side")}>Side</button>
                <button onClick={() => handleCamera("Back")}>Back</button>
            </div>
            <div className="link_container">
                <h3>Link</h3>
                <h2>선택된 link : {linkName}</h2>
                <h3>Geometry</h3>
                <button onClick={() => handleGeometry("BoxGeometry")} className={selectedGeometry === "BoxGeometry" ? "selected" : ""}>box</button>
                <button onClick={() => handleGeometry("CylinderGeometry")} className={selectedGeometry === "CylinderGeometry" ? "selected" : ""}>cylinder</button>
                <button onClick={() => handleGeometry("SphereGeometry")} className={selectedGeometry === "SphereGeometry" ? "selected" : ""}>sphere</button>
            </div>
            <div className="joint_container">
                <h3>Joint <span>&#40;범위: -3 ~ 3&#41;</span></h3>
                {jointNames.length > 0 && jointNames.map((jointName, index) => (
                    <div key={index} className="joint_input_container">
                        <div className='joint_name'>{jointName}</div>
                        <input
                            type="number"
                            id={`number_${index}`}
                            defaultValue={0}
                            min={-3}
                            max={3}
                            step={0.01}
                        />
                    </div>
                ))}
            </div>
            <div className="export_container">
                <h3>Export</h3>
                <button>내보내기</button>
            </div>
        </div>
    );
}

export default SettingsComponent;
