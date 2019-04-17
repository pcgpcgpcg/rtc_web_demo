import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {VideoIcon,VideoOffIcon,AudioIcon,AudioOffIcon} from '../img/svgIcons'
import NativeSelect from '@material-ui/core/NativeSelect';

class TestMaterialButton extends Component {

    constructor(props){
        super(props);
        this.state={

        }
    }

    componentDidMount() {

    }

    componentWillUnmount(){

    }


    render() {
        return (
            <div style={{ padding: 20 }}>

            </div>
        );
    }
}


//style={styles.selectEmpty}
const styles = {
    root: {
        flexGrow: 1,
        textAlign: 'center',
    },
    card: {
        maxWidth: 640,
    },
    video: {
        paddingTop: 5, // 16:9
        width:480,
        height:480,
    },

    button: {
        paddingBottom: 5, // 16:9
    },

    selectEmpty: {
        marginTop:  2,
    },
};

export default EchoTest;
