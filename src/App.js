import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Janus} from 'janusjs-sdk'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

class App extends Component {

    constructor(props){
        super(props);
        this.state={

        }
        this.handleStart=this.handleStart.bind(this);
    }

    componentDidMount() {
        Janus.init({debug: "all", callback: function() {

            }});
    }

    handleStart(){
      alert("handleStart!");
    }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Janus Echo Test</h1>
        </header>
          <Button color="primary" variant="contained" onClick={this.handleStart}>
              Start
          </Button>

          <Card>
              <CardMedia
                  image="favicon.ico"
                  title="Contemplative Reptile"
              />
              <CardActions>
                  <Button size="small" color="primary" variant="contained">
                      Mute
                  </Button>
                  <Button size="small" color="secondary" variant="contained">
                      Audio Only
                  </Button>
              </CardActions>
          </Card>

          <Card>
              <CardMedia
                  image="favicon.ico"
                  title="Contemplative Reptile"
              />
              <CardActions>
                  <Button size="small" color="primary" variant="contained">
                      Mute
                  </Button>
                  <Button size="small" color="secondary" variant="contained">
                      Audio Only
                  </Button>
              </CardActions>
          </Card>
      </div>
    );
  }
}

export default App;
