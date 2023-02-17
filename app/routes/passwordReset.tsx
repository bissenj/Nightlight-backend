import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

import { useActionData, Form, useTransition, useSearchParams } from "@remix-run/react";
import { resetPassword } from "~/data/database";

import type { LinksFunction, MetaFunction } from "@remix-run/node"; 

// Styles
import appStylesUrl from "~/styles/app.css";

// Custom UI
import Header from "./ui/header";
import Footer from "./ui/footer";

// STYLES
export const links: LinksFunction = () => {
  return [      
      { rel: "icon", href: "/coding.png", type: "image/png", },
      { rel: "stylesheet", href: appStylesUrl },           
  ];
};

// SEO
export const meta: MetaFunction = () => ({
  title: "Password Reset | Nightlight API",
  description:
    "Password Reset Page for the Nightlight API",  
});


function validatePassword(password:unknown) {
  // Check Type  
  if (typeof password !== "string") {    
    return "Password is invalid";
  }

  // Check Rules
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
}


type ActionData = { 
  message?: string;
  formError?: string;
  fieldErrors?: {
    password1: string | undefined;
    password2: string | undefined;
  };
  fields?: {
    password1: string;
    password2: string;
  };
};

const badRequest = (data: ActionData) => json(data, {status: 400});
const okRequest = (data: ActionData) => json(data, {status: 200});


// Server POST
export const action: ActionFunction = async({ request }) => {
  const form = await request.formData();
  const password1 = form.get("password1");
  const password2 = form.get("password2");
  const token = form.get("hash");  

  console.log("Password1: ", password1, password2, token);

  // Check for expected types
  if (typeof password1 !== "string" || typeof password2 !== "string" || typeof token !== "string") { 
    return badRequest({ formError: 'Form not submitted correctly'})
  }
  
  // Check for field errors
  const fields = { password1, password2 }
  const fieldErrors = {
    password1: validatePassword(password1),
    password2: validatePassword(password2),
  };    
  if (Object.values(fieldErrors).some(Boolean)) 
    return badRequest({ fieldErrors, fields });

  // Verify passwords match
  if (password1 !== password2) {
    return badRequest({formError: 'Passwords must match'});
  }

  // Call function to update password
  const result = await resetPassword(token, password1);  
  
  if (!result.success) {
    return badRequest({ formError: 'Error while updating database'})
  }  
  
  return okRequest({message: "Password has been changed.", fields})
}


export default function ResetPasswordPage() {
    const actionData = useActionData<ActionData>();
    const [searchParams] = useSearchParams();    
    const transition = useTransition();

    const isLoading = transition.submission ? true : false;    

    let isComplete = false;
    if (actionData && actionData.message && actionData.message.length > 0) {
      isComplete = true;
    }
       
    if (isComplete) {
      return <div><p>{actionData?.message}</p></div>
    }

    return (
      <div className='app'>
        <Header text='Reset Password'></Header>
        
        <div className='content'>
          <Form method="post">
            <fieldset disabled={isLoading}>
              <input
                type="hidden"
                name="hash"
                value={
                  searchParams.get("token") ?? undefined
                }
              />

              {/* PASSWORD 1 */}
              <div className='input-control'>
                <label>Password 1</label>
                <input
                  id="password1-input"
                  name="password1"
                  type="password"
                  defaultValue={actionData?.fields?.password1}            
                />
                {actionData?.fieldErrors?.password1 ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id="password-error"
                  style={{color:'red'}}
                >
                  {actionData.fieldErrors.password1}
                </p>
                ) : null}
              </div>

              {/* PASSWORD 2 */}
              <div className='input-control'>
                <label>Password 2</label>
                <input
                  id="password2-input"
                  name="password2"
                  type="password"
                  defaultValue={actionData?.fields?.password2}                     
                />
                {actionData?.fieldErrors?.password2 ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id="password-error"
                  style={{color:'red'}}
                >
                  {actionData.fieldErrors.password2}
                </p>
                ) : null}
              </div>

              <div id="form-error-message">
                {actionData?.formError ? (
                  <p role="alert" style={{color:'red'}}>
                    {actionData.formError}
                  </p>
                ) : null}
              </div>

              <div id="form-success-message">
                {actionData?.message ? (
                  <p role="alert" style={{color:'green'}}>
                    {actionData.message}
                  </p>
                ) : null}
              </div>    

              <hr></hr>        

              {/* SUBMIT BUTTON */}
              <div className='input-control'>
                <button type="submit">
                  Submit
                </button>
              </div>
            </fieldset>
          </Form>
        </div>

        <Footer></Footer>
      </div>
    );
  }
  