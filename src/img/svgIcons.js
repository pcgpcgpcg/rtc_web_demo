import React, { Component } from 'react';
import Icon from '@material-ui/core/Icon';
import SvgIcon from '@material-ui/core/SvgIcon';

const wrapSvgPath = (path, viewBox='0 0 1024 1024') => (props) => (
    <SvgIcon {...props} viewBox={viewBox}>{path}</SvgIcon>
)

const facebookPath = (<path
        d="M17,2V2H17V6H15C14.31,6 14,6.81 14,7.5V10H14L17,10V14H14V22H10V14H7V10H10V6A4,4 0 0,1 14,2H17Z" />
)

const videoIconPath = (<path
        d="M563.2 866.304V921.6l102.4 102.4H358.4l102.4-102.4v-55.296C287.4112 841.3184 153.6 692.1984 153.6 512h102.4c0 141.1584 114.8416 256 256 256s256-114.8416 256-256h102.4c0 180.1984-133.8112 329.3184-307.2 354.304zM512 665.6c-84.48 0-153.6-69.12-153.6-153.6V153.6c0-84.48 69.12-153.6 153.6-153.6s153.6 69.12 153.6 153.6v358.4c0 84.48-69.12 153.6-153.6 153.6z" />
)

export const FacebookIcon = wrapSvgPath(facebookPath)
export const VideoIcon = wrapSvgPath(videoIconPath)
