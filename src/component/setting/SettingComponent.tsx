import React, { useState } from 'react';
import "./SettingComponent.css";

interface SettingComponentProps {
    onURDFLoad: (isURDFLoaded: boolean) => void;
    onChangeCameraDirection: (direction: string) => void;
    onChangeGeometry: (geometryType: string) => void;
    linkName : string;
    jointNames: string[];
    jointValues: number[];
    selectedGeometry: string;
    onChangeJointValue: (index: number, value: number) => void;
    updateJointValue: (value: number[]) => void;
    saveURDF: (urefString: string) => void;
}

const SettingsComponent: React.FC<SettingComponentProps> = ({
    onURDFLoad,
    onChangeCameraDirection,
    onChangeGeometry,
    onChangeJointValue,
    updateJointValue,
    saveURDF,
    jointNames,
    jointValues,
    linkName,
    selectedGeometry
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

    const handleJointValue = (index: number, value: number): void => {
        const updatedJointValues = [...jointValues];
        updatedJointValues[index] = value;
        onChangeJointValue(index, value); 
        updateJointValue(updatedJointValues);
        console.log("Updated jointValues:", [...jointValues]);
    };

    const handleSaveURDF = (): void => {
        const urdfString = localStorage.getItem("urdf");
        if (urdfString) {
            saveURDF(urdfString);
        }
    };

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
            <div className="geometry_container">
            <h3>Geometry</h3>
                <button onClick={() => handleGeometry("BoxGeometry")} className={selectedGeometry === "BoxGeometry" ? "selected" : ""}>box</button>
                <button onClick={() => handleGeometry("CylinderGeometry")} className={selectedGeometry === "CylinderGeometry" ? "selected" : ""}>cylinder</button>
                <button onClick={() => handleGeometry("SphereGeometry")} className={selectedGeometry === "SphereGeometry" ? "selected" : ""}>sphere</button>
            </div>
            </div>
            <div className="joint_container">
                <h3>Joint <span>&#40;범위: -3 ~ 3&#41;</span></h3>
                {jointNames.length > 0 && jointNames.map((jointName, index) => (
                    <div key={index} className="joint_input_container">
                        <div className='joint_name'>{jointName}</div>
                        <input
                            type="number"
                            id={`number_${index}`}
                            value={jointValues[index] || 0}
                            min={-3}
                            max={3}
                            step={0.01}
                            onChange={(e) => handleJointValue(index, parseFloat(e.target.value))}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                const value = parseFloat(e.currentTarget.value);
                                if (value < -3) {
                                    e.currentTarget.value = '-3';
                                } else if (value > 3) {
                                    e.currentTarget.value = '3';
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="export_container">
                <h3>Export</h3>
                <button onClick={handleSaveURDF}>저장하기</button>
            </div>
        </div>
    );
}

export default SettingsComponent;