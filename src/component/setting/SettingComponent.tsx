import React from 'react';
import "./SettingComponent.css";

function SettingsComponent() {

    return (
        <div className="setting_container">
            <div className="urdf_container">
                <h3>URDF</h3>
                <input
                    type='file'
                    name='urdf'
                    accept='.urdf, .URDF'
                />
            </div>
            <div className="camera_container">
                <h3>Camera</h3>
                <input
                    type='button'
                    name='camera_front'
                    value="Front"
                />
                <input
                    type='button'
                    name='camera_side'
                    value="Top"
                />
                <input
                    type='button'
                    name='camera_top'
                    value="Side"
                />
            </div>
            <div className="link_container">
                <h3>Link</h3>
                <select name="link_select">
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                    <option value="link1">link1</option>
                </select>
                <h3>Geometry</h3>
                <button>box</button>
                <button>cylinder</button>
                <button>sphere</button>
            </div>
        </div>
    );
}

export default SettingsComponent;