import React, { ReactElement } from 'react';
// import {
//   FontAwesomeIcon,
//   FontAwesomeIconProps,
// } from '@fortawesome/react-fontawesome'
// import { IconProp, IconDefinition } from '@fortawesome/fontawesome-svg-core'
// import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
// import { faFilePdf } from '@fortawesome/free-solid-svg-icons'

// interface IconProps extends FontAwesomeIconProps {
//   cls: String,
//   icon: IconProp,
//   onClick: React.MouseEventHandler<SVGSVGElement>
// }

// const Icon: FunctionComponent<IconProps> = (cls: string, icon: IconProp, url: string) => (
//   <FontAwesomeIcon
//     className={`icons ${cls}`}
//     icon={icon}
//     onClick={() => window.open(url, '_blank')} />
// );

const Icon = (props: { cls: string; url: string }) => (
  <div className={`icon ${props.cls}`} onClick={() => window.open(props.url, '_blank')}></div>
);

const Socials = () => (
  <React.Fragment>
    <Icon cls='github' url='https://github.com/chav-aniket' />
    <Icon cls='linkedin' url='https://www.linkedin.com/in/chavaniket' />
    <Icon cls='resume' url='/resume.pdf' />
  </React.Fragment>
);

export default Socials;
