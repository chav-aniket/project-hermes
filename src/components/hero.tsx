import React, { useState, useEffect, ReactElement } from 'react';
import { Container } from 'react-bootstrap';
import { useStaticQuery, graphql } from "gatsby";
import Fade from 'react-reveal/Fade';
import Socials from './socials';

type DataProps = {
  site: {
    siteMetadata: {
      heroTitle: String,
      heroName: String,
      heroSubtitle: String
    }
  }
}

const Hero = (): ReactElement => {
  const data = useStaticQuery<DataProps>(graphql`
    query {
      site {
        siteMetadata {
          heroTitle
          heroName
          heroSubtitle
        }
      }
    }
  `)

  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth > 769) {
      setIsDesktop(true);
      setIsMobile(false);
    } else {
      setIsMobile(true);
      setIsDesktop(false);
    }
  }, []);

  return (
    <section id="hero" className="jumbotron">
      <Container>
        <Fade left={isDesktop} bottom={isMobile} duration={1000} delay={500} distance="30px">
          <h1 className="hero-title">
            {data.site.siteMetadata?.heroTitle}
            <span className="text-color-main">{data.site.siteMetadata?.heroName}</span>
            <br />
            {data.site.siteMetadata?.heroSubtitle}
          </h1>
        </Fade>
        <Fade left={isDesktop} bottom={isMobile} duration={1000} delay={1000} distance="30px">
          <Socials />
        </Fade>
      </Container>
    </section>
  );
};

export default Hero;
