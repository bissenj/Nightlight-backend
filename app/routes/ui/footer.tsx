import type { LinksFunction } from "@remix-run/node"; 

// Styles
import appStylesUrl from "~/styles/app.css";


export const links: LinksFunction = () => {
    return [        
        { rel: "stylesheet", href: appStylesUrl },      
    ];
};


export default function Footer() {
    return (  
        <footer className='footer'>
            <a href='/'>            
                <div className='mountains'>Mountains</div>
                <div className='andcode'>and code</div>            
            </a>         
        </footer>      
    );
}