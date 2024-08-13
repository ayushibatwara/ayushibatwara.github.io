import '../index.css';
import './projects.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Project from '../components/project';
import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';
import origin from '../images/origin.png';
import nexpert from '../images/nexpert.png';
import smartfin from '../images/smartfin.png'
import bitebuddy from '../images/bitebuddy.png'
import ephemeral from '../images/ephemeral.png'
import cs182_project from '../images/182-project.jpg'

function ProjectPage() {
    const projects = [
        {
            id: "1",
            name: "Origin",
            description: "Origin is a browser history organizer that offers context-aware workspaces with a semantic search, an AI-generated summary, recommendation systems, etc.",
            awards: "Awarded Best Hack Using Frontier Tech by Pear VC at Stanford's TreeHacks 2023.",
            imageUrl: origin,
            url: "https://devpost.com/software/pathfinder-em2qjb",
            github: "https://github.com/pgasawa/origin"
        },
        {
            id: "2",
            name: "Ephemeral",
            description: "Ephemeral is an autonomous agent that learns from your interactions and proactively takes actions, provides answers, and offers advice.",
            awards: "Awarded Best Use of Together API at Stanford's TreeHacks 2024.",
            imageUrl: ephemeral,
            url: "https://devpost.com/software/invisible-me",
            github: "https://github.com/JasonDing9/ephemeral"
        },
        {
            id: "3",
            name: "Stylized Text Generation",
            description: "Fine-tuning a large language model for style-specific text generation using a novel custom loss function and parameter-efficient fine-tuning methods.",
            awards: "Research paper for EECS 182/282A: Deep Neural Networks at UC Berkeley",
            imageUrl: cs182_project,
            url: "https://docs.google.com/document/d/1PoNFB9MClst81M_IbMub1_TmPynF3B4V6rozobU8ocY/edit?usp=sharing",
            github: "https://github.com/pgasawa/cs182-project"
        },
        {
            id: "3",
            name: "Nexpert",
            description: "An open-source research tool that fast-tracks the concept discovery process, making you the next expert on any topic based on the literature.",
            awards: "Developed at Anthropic's Claude 2 Hackathon.",
            imageUrl: nexpert,
            url: "https://devpost.com/software/nexpert",
            github: "https://github.com/ayushib4/nexpert"
        },
        {
            id: "4",
            name: "BiteBuddy",
            description: "An all-in-one meal planner and personal CRM powered by graph machine learning and large language models.",
            awards: "Awarded Most Creative Use of Reflex at UC Berkeley's CalHacks 2023.",
            imageUrl: bitebuddy,
            url: "https://devpost.com/software/bonapp",
            github: "https://github.com/pgasawa/friendly-food-finder-dev"
        },
        {
            id: "5",
            name: "smartFin",
            description: "smartFin brings smart financial advice catered to your banking data and financial goals through our version of Mr. Wonderful, a generative AI agent that takes on the personality of the real Mr. Wonderful to give you personalized advice.            ",
            awards: "Developed at UC Berkeley's AI Hackathon.",
            imageUrl: smartfin,
            url: "https://devpost.com/software/smartfin",
            github: "https://github.com/ayushib4/smartFin"
        }
    ]
    return (
        <>
        <FontAwesomeIcon icon={faHome} size="xl" style={{cursor: 'pointer', position: 'fixed', top: '15px', left: '15px', zIndex: 999}} onClick={() => window.location.href="/"} className="home" />
            <FadeIn>
                <div className='projectPage'>
                    {projects.map((project) => (
                        <Project
                            key={project.id}
                            name={project.name}
                            description={project.description}
                            awards={project.awards ?? ""}
                            imageUrl={project.imageUrl}
                            url={project.url}
                            github={project.github}
                        />
                    )
                    )}
                </div>
            </FadeIn>
        </>
    )
}

export default ProjectPage;