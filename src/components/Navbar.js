import React, {useState, useEffect} from 'react'
import {Link} from 'wouter';
import { Button } from './Button';
import './Navbar.css'; 

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click); 
  const closeMobileMenu = () => setClick(false);
  const showButton = () => {
      if(window.innerWidth <= 960) {
          setButton(false);
      } else {
          setButton(true);
      }
  };
  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
        <nav className="navbar">
            <div className="navbar-container">
               <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                PEDRO FLYNN<i className='fa-brands fa-github'/>
               </Link>
               <div className="menu-icon" onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
               </div>
               <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                   <li className="nav-item">
                       <Link 
                       to="/" 
                       className="nav-links" 
                       onClick={closeMobileMenu}
                       >
                           Home
                       </Link>
                   </li>
                   <li className="nav-item">
                       <Link 
                       to="/portfolio" 
                       className="nav-links"
                       onClick={closeMobileMenu}
                       >
                           Portfolio
                       </Link>
                   </li>
                   <li className="nav-item">
                       <Link 
                       to="/resume" 
                       className="nav-links"
                       onClick={closeMobileMenu}
                       >
                           Resume
                       </Link>
                   </li>
                   <li className="nav-item">
                       <Link 
                       to="/email" 
                       className="nav-links-mobile"
                       onClick={closeMobileMenu}
                       >
                           Email me
                       </Link>
                   </li>
                </ul>    
                {button && <Button buttonStyle='btn--outline'>Email me</Button>}
            </div>
        </nav>  
    </>
  )
}

export default Navbar