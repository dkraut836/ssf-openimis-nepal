import Chart from "react-google-charts";
import React, {Component} from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid} from "@material-ui/core";
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

class TestChart extends Component{
    componentDidMount(){
        this.props.dashboard();
    }

    BarChart = () =>{
        return <div>
            {!!this.props.claimApp &&
            <Chart
            width={'600px'}
            height={'400px'}
            chartType="BarChart"
            loader={<div>Loading Chart</div>}
            data={[
              ['City', 'Accident', 'Medical'],
              ['Settled', this.props.claimApp.AccidentSettled,this.props.claimApp.MedicalSettled],
              ['Rejected', this.props.claimApp.AccidentRejected,this.props.claimApp.MedicalRejected],
              ['Forwarded', this.props.claimApp.AccidentForwarded,this.props.claimApp.MedicalForwarded],
              ['Entered', this.props.claimApp.AccidentEntered,this.props.claimApp.MedicalEntered],
              ['In Progress', this.props.claimApp.AccidentInProgress,this.props.claimApp.MedicalInProgress],
              ['Recommended By Employer', this.props.claimApp.AccidentRecommendedByEmployer,0],
              ['Claim Application', this.props.claimApp.AccidentClaimApplication,this.props.claimApp.MedicalClaimApplication],
            ]}
            options={{
              title: 'Claim Application',
              chartArea: { width: '50%' },
              hAxis: {
                title: 'No Of Claim',
                minValue: 0,
              },   
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        }
      </div>
    }

    PieChart= () =>{
        return <div>
             {!!this.props.claimApp &&
            <Chart
              width={'600px'}
              height={'400px'}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={[
                ['Claim Type', 'Number'],
                ['workPlaceAccident', this.props.claimApp.workPlaceAccident],
                ['accident', this.props.claimApp.accident],
                ['occupationalDisease', this.props.claimApp.occupationalDisease],
                ['other', this.props.claimApp.other],
              ]}
              options={{
                title: 'Claim Type Wise',
                is3D: true,
              }}
              rootProps={{ 'data-testid': '2' }}
            />
          } 
        </div>
      }

    PieChartAmount= () =>{
        return <div>
             {!!this.props.claimApp &&
            <Chart
                width={'600px'}
                height={'400px'}
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={[
                  ['Claim Amount Wise', 'Amount'],
                  ['1-100000', this.props.claimApp.range1],
                  ['100001-200000', this.props.claimApp.range2],
                  ['200001-300000', this.props.claimApp.range3],
                  ['300001-400000', this.props.claimApp.range4],
                  ['400000 above', this.props.claimApp.range5],
                ]}
                options={{
                  title: 'Claim Amount Wise',
                  is3D: true,
                }}
                rootProps={{ 'data-testid': '2' }}
              />
            } 
          </div>
        }

    render(){
      console.log('ooooooooooooooooo', this.props.claimApp)
        const {classes}=this.props;
        return(
                <Grid container className={classes.page}>
                    <Grid item xs={6}>
                        <br />
                        {this.BarChart()}
                        <br />                 
                    </Grid>
                    <br />
                    <Grid item xs={6}>
                        <br />
                        {this.PieChart()}
                        <br />
                    </Grid>

                    <Grid item xs={6}>
                        <br />
                        {this.PieChartAmount()}
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


export default connect(mapStateToProps, mapDispatchToProps) (withTheme(withStyles(styles)(TestChart))); 