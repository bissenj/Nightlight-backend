import { useState, useRef } from 'react';
import formStylesUrl from "../styles/forms.css";
import { useNavigate } from "react-router-dom";
import type { LinksFunction, MetaFunction } from '@remix-run/node';

// STYLES
export const links: LinksFunction = () => {
    return [
        { rel: "icon", href: "/coding.png", type: "image/png", },
        { rel: "stylesheet", href: formStylesUrl }       
    ];
};


// SEO
export const meta: MetaFunction = () => ({
    title: "Login | Nightlight API",
    description:
      "Login page for the Nightlight API",  
  });


// RENDER
export default function LoginRoute() {    
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonText, setButtonText] = useState('Login');    
    const form = useRef<HTMLFormElement>(null);

    let navigate = useNavigate();

    async function handleSubmit(e: any) {
        e.preventDefault();
        
        if (form.current != null) {
            setLoading(true);
            
            const data = new FormData(form.current);
            await fetch('/api/auth', {
                method: 'POST',
                body: data,
            })
            .then(res=> res.json())
            .then(json => {
                console.log("Returned from Login: ", json);
                if (json.success) {                
                    // store web token
                    localStorage.setItem("jwt", json.data.jwt);
                    localStorage.setItem("email", json.data.email);

                    // go to map screen 
                    navigate("/ui/map", { replace: true });
                } else {
                    setErrorMessage(json.message);
                }
                setLoading(false);
            })
            .catch((ex) => {
                console.log('Caught exception: ', ex);
                setErrorMessage(ex.message);
                setLoading(false);
            });
        }
    }

    console.log("Loading: ", loading);

    // RENDER
    return (        
        <div className='container'>        
            <div className='login-container'>
                <fieldset disabled={loading}>
                    <form ref={form} method="post" onSubmit={handleSubmit} className="form-container login-form">                 
                        {/* Heading */}
                        <div className="heading">Welcome</div>
                        
                        {/* Action */}
                        <input type='hidden' name='loginType' value='login'/>
                    
                        <div className='field-container'>
                            {/* Email */}
                            <div>
                                <label htmlFor='email'>Email</label>
                                <input 
                                    type='text' 
                                    name='email'                                    
                                ></input>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor='password'>Password</label>
                                <input 
                                    type='password' 
                                    name='password'                                    
                                ></input>
                            </div>
                        </div>

                        { errorMessage && <div className='form-validation-error'>That didn't work.  Please try again.</div> }

                        {/* Submit */}
                        <button className='submit-button' type="submit">{buttonText}</button>                        
                    </form>
                </fieldset>
            </div>    
        </div>  
    );
}