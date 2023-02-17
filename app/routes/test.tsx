/*
    This isn't used anymore but leaving it in for future in case there is a need
    to test our settings or other api features.
*/


import { useState, useRef } from 'react';
import type { userSettingsDefinitions } from '../types/globalTypes';


// RENDER
export default function TestRoute() {
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);    
        
   
    async function handleSaveSettingsSubmit(e) {
        e.preventDefault;
        setLoading(true);

        // FORM
        const form = new FormData();
        form.append("actionType", "save-settings");
        const data: userSettingsDefinitions = {updateSpeed: 15, updateDistance: 30, avatarColor: "#777", avatorImage: "mountains.jpg"};
        form.append("userSettings", JSON.stringify(data));

        await fetch('/api/settings', {
            method: 'POST',
            body: form,
        })
        .then(res=> res.json())
        .then(json => {
            console.log("Returned from Save Settings: ", json);
            if (json.success) {
                console.log("Success");
                // redirect to home                
                //navigate("/admin", { replace: true });
            } else {
                setErrorMessage(json.message);
            }
            setLoading(false);
        });
    }

    async function handleSaveSettingSubmit(e) {
        e.preventDefault;
        setLoading(true);

        // FORM
        const form = new FormData();
        form.append("actionType", "save-setting");
        //const data: userSettingsDefinitions = {updateSpeed: 15, updateDistance: 30, avatarColor: "#777", avatorImage: "mountains.jpg"};
        const data = {updateSpeed: 45};
        form.append("userSettings", JSON.stringify(data));

        await fetch('/api/settings', {
            method: 'POST',
            body: form,
        })
        .then(res=> res.json())
        .then(json => {
            console.log("Returned from Save Setting: ", json);
            if (json.success) {
                console.log("Success");
                // redirect to home                
                //navigate("/admin", { replace: true });
            } else {
                setErrorMessage(json.message);
            }
            setLoading(false);
        });
    }

    async function handleGetSettingsSubmit(e) {
        e.preventDefault;
        setLoading(true);

        // FORM
        const form = new FormData();
        form.append("actionType", "get-settings");
        //const data: userSettingsDefinitions = {updateSpeed: 15, updateDistance: 30, avatarColor: "#777", avatorImage: "mountains.jpg"};
        //form.append("userSettings", JSON.stringify(data));

        await fetch('/api/settings', {
            method: 'POST',
            body: form,
        })
        .then(res=> res.json())
        .then(json => {
            console.log("Returned from Get Settings: ", json);
            if (json.success) {
                console.log("Success");
                // redirect to home                
                //navigate("/admin", { replace: true });
            } else {
                setErrorMessage(json.message);
            }
            setLoading(false);
        });
    }

    console.log("Loading: ", loading);

    return (
        <div className='flex-center login-background'>            
            <fieldset disabled={loading}>
                <form method="post" onSubmit={handleSaveSettingsSubmit} className="form-container login-form">                 
                    {/* Heading */}
                    <h2 className="heading">Save Settings</h2>

                    { errorMessage && <div className='form-validation-error'>{errorMessage}</div> }

                    {/* Save Settings */}
                    <button type="submit">Save Settings</button>                   
                </form>
                <form method="post" onSubmit={handleGetSettingsSubmit} className="form-container login-form">                 
                    {/* Heading */}
                    <h2 className="heading">Get Settings</h2>

                    { errorMessage && <div className='form-validation-error'>{errorMessage}</div> }

                    {/* Get Settings */}
                    <button type="submit">Get Settings</button>
                </form>
                <form method="post" onSubmit={handleSaveSettingSubmit} className="form-container login-form">                 
                    {/* Heading */}
                    <h2 className="heading">Save Setting</h2>

                    { errorMessage && <div className='form-validation-error'>{errorMessage}</div> }

                    {/* Get Settings */}
                    <button type="submit">Save Setting</button>
                </form>
            </fieldset>
        </div>
    );
}