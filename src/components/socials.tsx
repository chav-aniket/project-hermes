import React from 'react';

const Icon = (props: { cls: string; url: string }) => (
  <div className={`icon ${props.cls}`} onClick={() => window.open(props.url, '_blank')}></div>
);

const Socials = () => (
  <div className="icons-container">
    <Icon cls='github' url='https://github.com/chav-aniket' />
    <Icon cls='linkedin' url='https://www.linkedin.com/in/chavaniket' />
    <Icon cls='resume' url='/resume.pdf' />
  </div>
);

export default Socials;
