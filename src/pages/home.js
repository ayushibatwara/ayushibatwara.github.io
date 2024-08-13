import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { useNavigate, Outlet } from "react-router-dom";
// import logo from '../images/ayushi-avatar.svg';
import logo from '../images/ayushi.jpeg';
import './home.css';
import '../index.css';
import FadeIn from 'react-fade-in/lib/FadeIn';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';

function HomePage() {
    const navigate = useNavigate();
    return (
        <>
        <FontAwesomeIcon icon={faHome} size="xl" style={{cursor: 'pointer', position: 'fixed', top: '15px', left: '15px', zIndex: 999}} onClick={() => window.location.href="/"} className="home" />
            <div className="homePage">
                <FadeIn>
                    <div className="heading">
                        <img src={logo} class="avatar"></img>
                        <h1>Ayushi Batwara</h1>
                        <p className='p'>Electrical Engineering & Computer Science (EECS) and Business @ <a className="link" style={{ cursor: 'pointer' }} onClick={() => window.open("https://met.berkeley.edu")}>UC Berkeley M.E.T.</a></p>
                        <div className="buttons">
                            <Button variant="dark" onClick={() => window.open("https://drive.google.com/file/d/19dAwspG8pqn-x1plljxTln4DXk6kxLUp/view?usp=sharing")}>Resume/CV</Button>
                            <Button variant="dark" onClick={() => {navigate("/projects")}}>Projects</Button>
                        </div>
                        <div className="socialMedia">
                            <FontAwesomeIcon icon={faEnvelope} size="xl" style={{ cursor: 'pointer' }} onClick={() => window.open("mailto:ayushi.batwara@berkeley.edu")} />
                            <FontAwesomeIcon icon={faLinkedin} size="xl" style={{ cursor: 'pointer' }} onClick={() => window.open("https://www.linkedin.com/in/ayushibatwara/")} />
                            <FontAwesomeIcon icon={faGithub} size="xl" style={{ cursor: 'pointer' }} onClick={() => window.open("https://github.com/ayushib4")} />
                            <FontAwesomeIcon icon={faTwitter} size="xl" style={{ cursor: 'pointer' }} onClick={() => window.open("https://twitter.com/iyoushe03")} />

                        </div>
                        
                    </div>

                </FadeIn>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default HomePage