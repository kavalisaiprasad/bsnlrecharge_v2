import React from "react";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import './Menu.css';

const Menu = () => {
   
    var url = window.location.origin + "/";

  

    

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary m-3 main_img">
                <Container className="d-block text-center">
                    <Navbar.Brand href={url} >
                        <img src={`${url}logo.webp`} alt="logo" width="100" height="100" aria-label="Home" />
                    </Navbar.Brand>

                </Container>
            </Navbar>
        </>
    )
}
export default Menu;