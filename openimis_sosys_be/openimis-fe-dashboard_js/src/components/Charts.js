import React, {Component} from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {Bar, Chart, Pie} from 'react-chartjs-2';
import { Grid,Paper, Radio, FormLabel, FormGroup, Checkbox,IconButton, FormControl,FormControlLabel,RadioGroup  } from "@material-ui/core";
import {dashboard} from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
const styles = theme => ({
    page:theme.page,
    paper: theme.paper.paper,
    box:{
        boxShadow:"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
        marginTop:"15px",
        marginRight:"53px",
        marginLeft:"52px"
    }
});

 
class Charts extends Component{
    componentDidMount(){
        this.props.dashboard();
    }

    BarChart = () =>{
        return <div>
            {!!this.props.claimApp &&
            <Bar data={{
                labels: ['Claim App', 'Recommended by Emp', 'In Progress', 'Settled'],
                datasets: [{  
                    label:"Claim Status",                 
                    data: [this.props.claimApp.claimApplication, this.props.claimApp.recommendedByEmployer, this.props.claimApp.inProgress, this.props.claimApp.settled],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            }}
            options= {{
                maintainAspectRatio:false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }}
            height={300}
            width={200} />}
        </div>
    }
    render(){
        console.log('oops', this.props.claimApp)
        const {classes}=this.props;
        console.log('props data', this.props)
        return(
                <Grid container className={classes.page}>
                    <Grid item xs={3} className={classes.box}>
                        <br />
                        {this.BarChart()}
                        <br />
                    </Grid>

                    <Grid item xs={3} className={classes.box}>
                        <br />
                        {this.BarChart()}
                        <br />
                    </Grid>

                    <Grid item xs={3} className={classes.box}>
                        <br />
                        {this.BarChart()}
                        <br />
                    </Grid>
                </Grid>
        )
    }
}

const mapStateToProps = (state, props) => ({
    claimApp:state.dashboard.claimApp
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ dashboard }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps) (withTheme(withStyles(styles)(Charts))); 