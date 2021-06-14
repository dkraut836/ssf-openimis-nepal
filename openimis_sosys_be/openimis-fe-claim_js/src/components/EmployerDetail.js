import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import {
    formatMessage, ControlledField, withModulesManager,
    FormPanel, TextInput, PublishedComponent, TextAreaInput
} from "@openimis/fe-core";
import { Grid,Paper, Radio, FormLabel, FormGroup, Checkbox,IconButton, FormControl,FormControlLabel,RadioGroup  } from "@material-ui/core";
import _ from "lodash";
import {  validateClaimCode } from "../actions";
import _debounce from "lodash/debounce";
import ClaimEmployerPicker from "../pickers/ClaimEmployerPicker";
import WoundConditionPicker from "../pickers/WoundConditionPicker";
import CapacityPicker from '../pickers/CapacityPicker';
import DischargeTypePicker from '../pickers/DischargeTypePicker';
import HealthFacilityPicker from '../pickers/HealthFacilityPicker';

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
    attachment:{
        marginTop:'10px'
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
        fontSize: "17px",
        marginTop:"15px"
    },
    img:{
        height:'150px',
        width:'150px'
    }
});

class EmployerDetail extends FormPanel {
    constructor(props){
        super(props);
        this.state={
            show:false,
            employerId:'',
            checked:false,
            checkedDeath:false,
            checkCancer:false,
            checkHiv:false,
            checkHighBp:false,
            checkHeartAttack:false,
            checkDiabetes:false,
            isDisable:false,
            capacity:'Permanent partial disability',
            dischargeType:'',
            attachment:''
        }
    }

    componentDidMount(){
        this.setState({
            capacity:'Permanent partial disability'
        })
    }

    onSelected=(v)=>{
        this.setState({
            employerId:v
        })
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

    onSelectDischargeType=(v)=>{
        this.onDischarge(v);
        this.updateAttribute("dischargeType", v);

    }


    fileSelected = (f) => {
        const file = f.target.files[0];
            let attachment =this.state.attachment
        this.setState({ attachment },
            e => {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = loaded => {
                    this.updateAttribute("deadCertificateAttachment", loaded.target.result);
                }

            })
        }

    onDischarge=(v)=>{
        this.setState({
            dischargeType:v
        })
    }

    changeCheck=()=>{
        this.setState({
            checked:!this.state.checked
        })
    }


    changeCancer=()=>{
        this.setState({
            checkCancer:!this.state.checkCancer
        })
    }

    changeHiv=()=>{
        this.setState({
            checkHiv:!this.state.checkHiv
        })
    }

    ChangeDisability=()=>{
        this.setState({
            isDisable:!this.state.isDisable
        })
    }

    changeHeartAttack=()=>{
        this.setState({
            checkHeartAttack:!this.state.checkHeartAttack
        })
    }

    changeHighBp=()=>{
        this.setState({
            checkHighBp:!this.state.checkHighBp
        })
    }

    changeDiabetes=()=>{
        this.setState({
            checkDiabetes:!this.state.checkDiabetes
        })
    }

    checkDeath=()=>{
        this.setState({
            checkedDeath:!this.state.checkedDeath
        })
    }

    onClick=(e)=> {
        this.changeCheck();
       this.updateAttribute([e.target.name], this.state.checked?"false":"true");
    }

    onChangeDeath=(e)=> {
        this.checkDeath();
       this.updateAttribute([e.target.name], this.state.checkedDeath?"false":"true");
    }

    onChangeCancer=(e)=> {
        this.changeCancer();
       this.updateAttribute([e.target.name], this.state.checkCancer?"false":"true");
    }

    onChangeHeartAttack=(e)=> {
        this.changeHeartAttack();
       this.updateAttribute([e.target.name], this.state.checkHeartAttack?"false":"true");
    }

    onChangeHiv=(e)=> {
        this.changeHiv();
       this.updateAttribute([e.target.name], this.state.checkHiv?"false":"true");
    }

    onChangeHighBp=(e)=> {
        this.changeHighBp();
       this.updateAttribute([e.target.name], this.state.checkHighBp?"false":"true");
    }

    onChangeDiabetes=(e)=> {
        this.changeDiabetes();
       this.updateAttribute([e.target.name], this.state.checkDiabetes?"false":"true");
    }

    UpdateCapacity=e=>{
        const value=e.target.value;
        this.setState({
            capacity:value
        })
    }

   onCapacityChange=e=>{
        this.UpdateCapacity(e);
        this.updateAttribute("capacity", this.state.capacity);
    }

    onChangeDisability=(e)=> {
        this.ChangeDisability();
       this.updateAttribute([e.target.name], this.state.isDisable?"false":"true");
    }

    debounceUpdateCode = _debounce(
        this.validateClaimCode,
        this.props.modulesManager.getConf("fe-claim", "debounceTime", 800)
    )

    render() {
        const { intl, classes, reset,edited,employers,readOnly = false, forReview, roReview = false, forFeedback } = this.props;
    
    let header = formatMessage(intl, "claim", "claim.edit.employer.title")
    let ro = readOnly || !!forReview || !!forFeedback;
let abc="bh"
    let emp=(!!employers && employers.length==1)?employers[0]:edited.employer
        return (
            <React.Fragment>
                 <Paper className={classes.paper}>
            <Grid container>


                <ControlledField module="claim" id="Claim.employer" field={
                    <Grid item xs={3} className={classes.item}>
                        <ClaimEmployerPicker
                            claim={edited}
                            status={true}
                            value={emp}                            
                            readOnly={ro}
                            onChange={(v, s) => (this.updateAttribute("employer", v), this.onSelected)}
                            required={true}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.EmployerNo" field={
                    <Grid item xs={2} className={classes.item}>
                       <ClaimEmployerPicker
                            label="Employer No"
                            claim={edited}
                            status={false}
                            value={edited.employer}
                            readOnly={true}
                        />
                    </Grid>
                } />


                <ControlledField module="claim" id="Claim.isAdmitted" field={
                    <Grid item xs={2} className={classes.item}>
                        <FormGroup className={classes.checked}  row  readOnly={ro}>
                            <FormControlLabel className={classes.checked}
                                control={<Checkbox
                                    className={classes.checked}
                                    name="isAdmitted"
                                    checked={edited.isAdmitted==="true"}
                                    onChange={this.onClick}
                                    disabled={ro}
                                    />}
                                label="Admit To Hospital"
                                />

                        </FormGroup>
                    </Grid>
                } />

                 <ControlledField module="claim" id="Claim.reasonOfSickness" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Reason Of Sickness"
                            value={edited.reasonOfSickness}
                            onChange={v => this.updateAttribute("reasonOfSickness", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.conditionOfWound" field={
                    <Grid item xs={2} className={classes.item}>
                        <WoundConditionPicker
                        value={edited.conditionOfWound}
                        onChange={(v, s) => this.updateAttribute("conditionOfWound", v)}
                        readOnly={ro}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.injuredBodyPart" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Injured Body Part"
                            value={edited.injuredBodyPart}
                            onChange={v => this.updateAttribute("injuredBodyPart", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.isDead" field={
                    <Grid item xs={2} className={classes.item}>
                        <FormGroup className={classes.checked}  row>
                            <FormControlLabel className={classes.checked}
                                control={<Checkbox
                                    className={classes.checked}
                                    name="isDead"
                                    checked={edited.isDead==="true"}
                                    onChange={this.onChangeDeath}
                                    disabled={ro}
                                    />}
                                label="Is Dead" />
                        </FormGroup>
                    </Grid>
                } />
            {(this.state.checkedDeath || edited.isDead==="true") &&
            <React.Fragment>
                <ControlledField module="claim" id="Claim.deadDate" field={
                    <Grid xs={2} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={edited.deadDate}
                        module="claim"
                        label="Death Date"
                        onChange={v => this.updateAttribute("deadDate", v)}
                        readOnly={ro}
                    />
                </Grid>
                } />

                <ControlledField module="claim" id="Claim.deadTime" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Death Time"
                            value={edited.deadTime}
                            onChange={v => this.updateAttribute("deadTime", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.deadReason" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Reason Of Death"
                            value={edited.deadReason}
                            onChange={v => this.updateAttribute("deadReason", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />
            </React.Fragment>}

                {/* <ControlledField module="claim" id="Claim.capability" field={
                    <Grid item xs={2} className={classes.item}>
                        <CapacityPicker
                        value={edited.capability}
                        onChange={(v, s) => this.updateAttribute("capability", v)}
                        readOnly={ro}
                        />
                    </Grid>
                } /> */}

                <ControlledField module="claim" id="Claim.isDisable" field={
                    <Grid item xs={2} className={classes.item}>
                        <FormGroup row>
                            <FormControlLabel className={classes.checked}
                            control={<Checkbox
                                name="isDisable"
                                className={classes.checked}
                                checked={edited.isDisable==="true"}
                                onChange={this.onChangeDisability}
                                disabled={ro}/>}
                            label="isDisable"
                            />
                            </FormGroup>
                            </Grid>
                }/>

                <ControlledField module="claim" id="Claim.accidentDescription" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Reason Of Accident Or Disease"
                            value={edited.accidentDescription}
                            onChange={v => this.updateAttribute("accidentDescription", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.family" field={
                    <Grid item xs={12} className={classes.item}>
                        <FormLabel>Family Disease</FormLabel>
                        <FormGroup row>
                            <FormControlLabel className={classes.checked}
                            control={<Checkbox
                                name="cancer"
                                className={classes.checked}
                                checked={edited.cancer==="true"}
                                onChange={this.onChangeCancer}
                                disabled={ro}/>}
                            label="Cancer"
                            />
                             <FormControlLabel
                             className={classes.checked}
                            control={<Checkbox
                                name="heartAttack"
                                className={classes.checked}
                                onChange={this.onChangeHeartAttack}
                                checked={edited.heartAttack==="true"}
                                disabled={ro}/>}
                            label="Heart Attack"
                            />

                        <FormControlLabel className={classes.checked}
                            control={<Checkbox
                                name="hiv"
                                className={classes.checked}
                                 onChange={this.onChangeHiv}
                                 checked={edited.hiv==="true"}
                                 disabled={ro}/>}
                            label="HIV"
                            />

                        <FormControlLabel className={classes.checked}
                            control={<Checkbox
                                name="highBp"
                                className={classes.checked}
                                onChange={this.onChangeHighBp}
                                checked={edited.highBp==="true"}
                                disabled={ro}/>}
                            label="High Blood Pressure"
                            />

                        <FormControlLabel className={classes.checked}
                            control={<Checkbox
                                name="diabetes"
                                className={classes.checked}
                                onChange={this.onChangeDiabetes}
                                checked={edited.diabetes==="true"}
                                disabled={ro}/>}
                            label="Diabetes"
                            />
                        </FormGroup>
                    </Grid>
                } />

                <span className={classes.border}>Discharge Summary</span>
                <ControlledField module="claim" id="Claim.referToDate" field={
                    <Grid xs={3} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={edited.referToDate}
                        module="claim"
                        label="Discharge Date"
                        onChange={v => this.updateAttribute("referToDate", v)}
                        readOnly={ro}
                    />
                </Grid>
                } />

                <ControlledField module="claim" id="Claim.dischargeType" field={
                    <Grid item xs={3} className={classes.item}>
                        <DischargeTypePicker
                        value={edited.dischargeType}
                        readOnly={ro}
                        onChange={((v, s) => this.onSelectDischargeType(v))}
                        />
                    </Grid>
                } />

                 {(this.state.dischargeType==='R' || edited.dischargeType==='R') &&
                <React.Fragment>

                <ControlledField module="claim" id="Claim.referFromHealthFacility" field={
                    <Grid item xs={3} className={classes.item}>
                       <HealthFacilityPicker
                            claim={edited}
                            value={edited.referFromHealthFacility}
                            withNull={true}
                            readOnly={ro}
                            onChange={(v, s) => (this.updateAttribute("referFromHealthFacility", v))}
                            required
                        />
                    </Grid>
                } />
                {(edited.referFromHealthFacility!=null && edited.referFromHealthFacility.id==="SGVhbHRoRmFjaWxpdHlHUUxUeXBlOjMw") &&
                
                <ControlledField module="claim" id="Claim.referFromHfOther" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Hospital"
                            value={edited.referFromHfOther}
                            onChange={v => this.updateAttribute("referFromHfOther", v)}
                            readOnly={ro}
                        />
                    </Grid>
                } />
                }</React.Fragment>}


            {(this.state.dischargeType==='F' || edited.dischargeType==='F') &&
                <React.Fragment>
                    <ControlledField module="claim" id="Claim.followUpDate" field={
                    <Grid xs={3} item className={classes.item}>
                    <PublishedComponent id="core.DatePicker"
                        value={edited.followUpDate}
                        module="claim"
                        label="Follow Up Date"
                        onChange={v => this.updateAttribute("followUpDate", v)}
                        readOnly={ro}
                    />
                </Grid>
                } />
                </React.Fragment>}

                {((this.state.dischargeType==='F' || edited.dischargeType==='F') || (this.state.dischargeType==='N' || edited.dischargeType==='N'))&&
                <React.Fragment>
                <ControlledField module="claim" id="Claim.restPeriod" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Rest Period"
                            value={edited.restPeriod}
                            onChange={v => this.updateAttribute("restPeriod", v)}
                            readOnly={ro}
                        />
                        <span>Note: No.of days</span>
                    </Grid>
                } />
                </React.Fragment>}


                <ControlledField module="claim" id="Claim.dischargeSummary" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextAreaInput
                            module="claim"
                            label="Discharge Notes"
                            value={edited.dischargeSummary}
                            onChange={v => this.updateAttribute("dischargeSummary", v)}
                            readOnly={ro}
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
    employers: state.claim.employers
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ validateClaimCode }, dispatch);
};

export default withModulesManager(
    injectIntl(
        connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(EmployerDetail))
        )
    )
)
