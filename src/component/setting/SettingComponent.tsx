import React, { useState } from 'react';
import "./SettingComponent.css";

interface SettingComponentProps {
    onURDFLoad: (isURDFLoaded: boolean) => void;
    onChangeCameraDirection: (direction: string) => void;
    onSelectedGeometry: (geometry: string) => void;
    onSelectLink: (linkName: string) => void;
    linkNames: string[];
    jointNames: string[];
}

const SettingsComponent: React.FC<SettingComponentProps> = ({onURDFLoad, onChangeCameraDirection, onSelectedGeometry, onSelectLink, linkNames, jointNames}) => {
    const [selectedLink, setSelectedLink] = useState<string>('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    // URDF 파일이 선택될 때 호출되는 이벤트 - 해당 파일의 Blob URL을 생성하여 로컬 스토리지에 저장하고 파일 이름을 화면에 표출
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

    // 카메라 시점 변경을 처리하는 함수
    const handleCamera = (direction: string) => {
        onChangeCameraDirection(direction);
    };

    // 링크 선택 함수
    const selectLink = (linkName: string): void => {
        setSelectedLink(linkName);
        onSelectLink(linkName);
    };

    const geometryChangeButton = (geomteryType: string): void => {
        onSelectedGeometry(geomteryType);
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
                <select name="link_name" value={selectedLink} onChange={(e) => selectLink(e.target.value)}>
                    <option value="">Select a link</option>
                    {linkNames.map((linkName, index) => (
                        <option key={index} value={linkName}>{linkName}</option>
                    ))}
                </select>
                <h3>Geometry</h3>
                <button onClick={() => geometryChangeButton("BoxGeometry")}>box</button>
                <button onClick={() => geometryChangeButton("CylinderGeometry")}>cylinder</button>
                <button onClick={() => geometryChangeButton("SphereGeometry")}>sphere</button>
            </div>
            <div className="joint_container">
                <h3>Joint <span>&#40;범위:&#41;</span></h3>
                {jointNames.length > 0 && jointNames.map((jointName, index) => (
                    <div key={index} className="joint_progress_container">
                        <div className='joint_name'>{jointName}</div>
                        <input
                            type="range"
                            id={`progress_${index}`}
                            defaultValue={50}
                            min={0}
                            max={100}
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