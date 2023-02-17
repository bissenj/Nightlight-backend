import type { LinksFunction } from "@remix-run/node"; 

// Styles
import appStylesUrl from "~/styles/app.css";


export const links: LinksFunction = () => {
    return [        
        { rel: "stylesheet", href: appStylesUrl },      
    ];
};


export default function Header({text}: {text: string}) {
    return (  
        <header className='header'>            
            <h3 className='text'>{text}</h3>            
        </header>      
    );
}