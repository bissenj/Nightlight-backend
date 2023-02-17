/*
    This is the entry point (home screen) for the app.
*/

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
  title: "Home | Nightlight API",
  description:
    "Home Page for the Nightlight API",  
});


export default function Index() {
  
  return (
    <div className='app'>
      <Header text={'Nightlight API'}></Header>      

      <div className='content'>
        {/* NIGHTLIGHT LINKS */}      
        <fieldset className='mb-12'>
          <legend>Nightlight Links</legend>      
          <ul className='links-list'>          
            <li>
              <a href="/ui/map" rel="noreferrer">
                Map Screen
              </a>
            </li>  
            <li>
              <a href="/login"  rel="noreferrer">
                Login Screen
              </a>
            </li>
            <li>
              <a target="_blank" href="/passwordReset" rel="noreferrer">
                Request Password Reset
              </a>
            </li>                        
          </ul>
        </fieldset>

        {/* OTHER LINKS */}      
        <fieldset>
          <legend>Other</legend>      
          <ul className='links-list'>
            <li>
              <a href="/strava"  rel="noreferrer">
                Uphill Tracker
              </a>
            </li>             
          </ul>
        </fieldset>
      </div>
      <Footer></Footer>
    </div>
  );
}
