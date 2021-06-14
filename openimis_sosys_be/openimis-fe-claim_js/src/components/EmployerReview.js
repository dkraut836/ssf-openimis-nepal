import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { ControlledField, withModulesManager,
    FormPanel, TextInput, PublishedComponent
} from "@openimis/fe-core";
import { Grid,Paper, FormGroup, Checkbox,FormControlLabel  } from "@material-ui/core";
import _ from "lodash";
import {  validateClaimCode, fetchRecommender } from "../actions";
import _debounce from "lodash/debounce";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    item: theme.paper.item,
    formControl: {
        margin: theme.spacing(1),
        width: '100%',
        marginTop:'0px'
      },
      checked: {
        color: 'inherit',
        marginTop:'6px',
        '& .MuiCheckbox-colorSecondary.Mui-checked':{
            color: 'inherit',
            marginTop:'6px'
        },
        '& .MuiIconButton-root.Mui-disabled':{
            color:'#ccc'
        }
    },
    formlabel:{
        marginTop: '4px',
        padding: '6px',
        maxWidth: '18%'
    },
    cont:{
        marginTop:'30px',
        marginLeft:'15px'
    },
    radio: {
        color: 'inherit',
        '& .MuiRadio-colorSecondary.Mui-checked':{
            color: 'inherit',
        }
    },
    border:{
        borderBottom:"solid 1px #ccc",
        width: "100%",
        marginLeft: "10px",
        fontSize: "17px"
    },
    img:{
        height:'150px',
        width:'150px'
    }
});

class EmployerReview extends FormPanel {
    constructor(props){
        super(props);
        this.state={
            checked:false,
        }
    }
    validateClaimCode = (v) => {
        this.setState(
            {
                claimCodeError: null,
                claimCode: v
            },
            e => this.props.validateClaimCode(v)
        )
    }

    debounceUpdateCode = _debounce(
        this.validateClaimCode,
        this.props.modulesManager.getConf("fe-claim", "debounceTime", 800)
    )

    changeCheck=()=>{
        this.setState({
            checked:!this.state.checked
        })
    }

    onClick=(e)=> {
        this.changeCheck();
       this.updateAttribute([e.target.name], this.state.checked?"false":"true");
    }

    componentDidMount(){
        const { claim }=this.props;
        if(!!claim && !!claim.code){
            this.props.fetchRecommender(claim)
        }
    }

    previewimage=()=>{

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { claim } = this.props;
        // if(!!claim && !!claim.code) {
        //     this.props.fetchRecommender(claim);
        // }

    }
    render() {
        const { intl, classes, edited,readOnly = false, forReview, roReview = false, forFeedback, recommenders } = this.props;
    
    let ro = readOnly || !!forReview || !!forFeedback;
        return (
            <React.Fragment>
                <br/>
                 <Paper className={classes.paper}>
                    <Grid container>
                    <span className={classes.border}>Employer Recommendation Details </span>
                    <ControlledField module="claim" id="Claim.WitnessName" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Witness Name"
                                value={recommenders===null?"not load":recommenders[0].witnessName}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                     <ControlledField module="claim" id="Claim.capacity" field={
                        <Grid item xs={3} className={classes.item}>
                            {/* <CapabilityRecPicker
                            value={recommenders===null?"not load":recommenders[0].capacity}
                            readOnly={true}
                            /> */}
                            <TextInput
                                module="claim"
                                label="Capacity"
                                value={recommenders===null?"not load":recommenders[0].capacity}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                <ControlledField module="claim" id="Claim.presentAfterCase" field={
                    <Grid item xs={3} className={classes.item}>
                        <FormGroup className={classes.checked}  row  readOnly={ro}>
                            <FormControlLabel className={classes.checked}
                                control={<Checkbox
                                    className={classes.checked}
                                    checked={recommenders===null?"not load":recommenders[0].presentAfterCase===true}
                                    readOnly={true}
                                    disabled
                                    />}
                                label="Present After Accident"
                                />

                        </FormGroup>
                    </Grid>
                } />

                 <ControlledField module="claim" id="Claim.presentBeforeApp" field={
                    <Grid item xs={3} className={classes.item}>
                        <FormGroup className={classes.checked}  row  readOnly={ro}>
                            <FormControlLabel className={classes.checked}
                                control={<Checkbox
                                    className={classes.checked}
                                    checked={recommenders===null?"not load":recommenders[0].presentBeforeApp===true}
                                    readOnly={true}
                                    disabled
                                    />}
                                label="Present Before Appication"
                                />

                        </FormGroup>
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.lastPresentDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={recommenders===null?"not load":recommenders[0].lastPresentDate}
                        module="claim"
                        label="Last Present Date"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                <ControlledField module="claim" id="Claim.presentAfterAccDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={recommenders===null?"not load":recommenders[0].presentAfterAccDate}
                        module="claim"
                        label="Present After Accident"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                <ControlledField module="claim" id="Claim.accDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                         value={recommenders===null?"not load":recommenders[0].accDate}
                        module="claim"
                        label="Accident or Sickness Date"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                    <ControlledField module="claim" id="Claim.accTime" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Accident Or sickness Time"
                                value={recommenders===null?"not load":recommenders[0].accTime}
                                onChange={v => this.updateAttribute("accTime", v)}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.workShift" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Work Shift/Time"
                                value={recommenders===null?"not load":recommenders[0].workShift}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                <ControlledField module="claim" id="Claim.informDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                       value={recommenders===null?"not load":recommenders[0].informDate}
                        module="claim"
                        label="Inform Employer Date"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                    <ControlledField module="claim" id="Claim.healTime" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Heal Time"
                                value={recommenders===null?"not load":recommenders[0].healTime}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                <ControlledField module="claim" id="Claim.leaveFromDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={recommenders===null?"not load":recommenders[0].leaveFromDate}
                        module="claim"
                        label="Leave From"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                <ControlledField module="claim" id="Claim.leaveToDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={recommenders===null?"not load":recommenders[0].leaveToDate}
                        module="claim"
                        label="Leave To"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                    <ControlledField module="claim" id="Claim.paymentType" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Calculated Days For Salary"
                                value={recommenders===null?"not load":recommenders[0].paymentType}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                <ControlledField module="claim" id="Claim.joinDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={recommenders===null?"not load":recommenders[0].joinDate}
                        module="claim"
                        label="Join Date"
                        readOnly={true}
                    />
                    </Grid>
                }/>

                    <ControlledField module="claim" id="Claim.accidentPlace" field={
                        <Grid item xs={3} className={classes.item}>
                            {/* <AccidentialPlacePicker
                            value={recommenders===null?"not load":recommenders[0].accidentPlace}
                            readOnly={true}
                            /> */}

                            <TextInput
                                module="claim"
                                label="accidentPlace"
                                value={recommenders===null?"not load":recommenders[0].accidentPlace}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                
                    <ControlledField module="claim" id="Claim.toolDescription" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Tool Description"
                                value={recommenders===null?"not load":recommenders[0].toolDescription}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.workDuringAcc" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Work Description"
                                value={recommenders===null?"not load":recommenders[0].workDuringAcc}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.recommenderSsid" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Recommender's SSNo"
                                value={recommenders===null?"not load":recommenders[0].recommenderSsid}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.recommenderName" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Recommender's Name"
                                value={recommenders===null?"not load":recommenders[0].recommenderName}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.recommenderPost" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Recommender's Post"
                                value={recommenders===null?"not load":recommenders[0].recommenderPost}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.recommenderContact" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Recommender's Mobile No."
                                value={recommenders===null?"not load":recommenders[0].recommenderContact}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                    <ControlledField module="claim" id="Claim.recommendRemarks" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="Recommendation Remarks"
                                value={recommenders===null?"not load":recommenders[0].recommendRemarks}
                                readOnly={true}
                            />
                        </Grid>
                    } />

                
                </Grid>
            </Paper>
        </React.Fragment>
        )
                }

}

const mapStateToProps = (state, props) => ({
    claim:state.claim.claim,
    recommenders:state.claim.recommenders
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ validateClaimCode, fetchRecommender }, dispatch);
};

export default withModulesManager(
    injectIntl(
        connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(EmployerReview))
        )
    )
)
