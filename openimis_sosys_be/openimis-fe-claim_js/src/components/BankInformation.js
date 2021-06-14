import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import {
    formatMessage, ControlledField, withModulesManager,
    FormPanel, TextInput
} from "@openimis/fe-core";
import { Grid,Paper} from "@material-ui/core";
import _ from "lodash";
import {  validateClaimCode } from "../actions";
import _debounce from "lodash/debounce";
import BankNamePicker from "../pickers/BankNamePicker";
import BankTypePicker from "../pickers/BankTypePicker";
import PayToPicker from "../pickers/PayToPicker";
import { RIGHT_CHANGE_PAYTO} from "../constants";
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

class BankInformation extends FormPanel {
    state={
        payTo_Id:2,
        continue_flag:true
    }

    onChangePayTo = (v) => {
        this.setState({
            payTo_Id:v,
            continue_flag:!this.state.stop_flag
        })
        this.updateAttribute("payTo", v)
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

    render() {
        const { intl, classes, edited,readOnly = false, forReview, roReview = false, forFeedback,rights } = this.props;   
    let bankValue;
    let branchValue;
    let accName;
    let accNum;
   if(!!edited.healthFacility && !!edited.healthFacility.bankDetails && 
        this.state.payTo_Id===2   && this.state.continue_flag){
        if(edited.healthFacility.bankDetails.length != 0){
            bankValue=edited.healthFacility.bankDetails[0].bankId;
            branchValue=edited.healthFacility.bankDetails[0].branchId;
            accName=edited.healthFacility.bankDetails[0].accountName;
            accNum=edited.healthFacility.bankDetails[0].accountNumber;
            edited.hfBank = bankValue;
            edited.hfBranch = branchValue;
            edited.hfAccountNumber = accNum;
            edited.hfAccountName = accName;        
            edited.payTo = this.state.payTo_Id;
            this.props.onEditedChanged(edited);
        }
        this.setState({
            continue_flag:!this.state.continue_flag
        })
   }
   else if(this.state.payTo_Id===1 && this.state.continue_flag){
        edited.hfBank=null;
        edited.hfBranch =null;
        edited.hfAccountNumber = null;
        edited.hfAccountName = null;        
        edited.payTo = this.state.payTo_Id;
        this.props.onEditedChanged(edited);


        this.setState({
            // payTo_Id:this.state.payTo_Id,
            continue_flag:!this.state.continue_flag
        })
   }
   else{
    bankValue=edited.hfBank;
    branchValue=edited.hfBranch;
    accName=edited.hfAccountName;
    accNum=edited.hfAccountNumber;
   }

   
    let header = formatMessage(intl, "claim", "claim.edit.employer.title")
    let ro = readOnly || !!forReview || !!forFeedback;
    // console.log(rights,"rightssss")
        return (
            <React.Fragment>
                
                
                
                 <Paper className={classes.paper}>
            <Grid container>
                    <span className={classes.border}>{header}</span>
                    <Grid item xs={12} className={classes.item}>
                    <span>Note: If bank detail is not correct, Please contact SSF</span>
                    </Grid>
                    <ControlledField module="claim" id="Claim.payToation" field={
                        <Grid item xs={2} className={classes.item}>
                            <PayToPicker
                            value={!!edited.payTo?edited.payTo:2}
                            onChange={(v, s) => this.onChangePayTo(v)}
                            nullLabel="empty"
                            // label="Pay To"
                            readOnly={!rights.includes(RIGHT_CHANGE_PAYTO) || ro}
                            />
                        </Grid>
                    } />
                    <ControlledField module="claim" id="Claim.hfBank" field={
                    <Grid item xs={3} className={classes.item}>
                        <BankNamePicker
                            claim={edited}
                            label="Bank Name"
                            value={bankValue}
                            onChange={(v, s) => this.updateAttribute("hfBank", v)}
                            readOnly={(!!edited.payTo && edited.payTo==1 && !ro)?false:true}
                            required
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.hfBranch" field={
                    <Grid item xs={3} className={classes.item}>
                        <BankTypePicker
                            label="Branch Name"
                            claim={edited}
                            value={this.state.payTo_Id==1?edited.hfBranch:branchValue}
                            onChange={(v, s) => this.updateAttribute("hfBranch", v)}
                            readOnly={(!!edited.payTo && edited.payTo==1 && !ro)?false:true}
                            required
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.hfAccountName" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Account Name"
                            value={this.state.payTo_Id==1?edited.hfAccountName:accName}
                            onChange={v => this.updateAttribute("hfAccountName", v)}
                            readOnly={(!!edited.payTo && edited.payTo==1 && !ro)?false:true}
                        />
                    </Grid>
                } />

                <ControlledField module="claim" id="Claim.hfAccountNumber" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="claim"
                            label="Account No"
                            value={this.state.payTo_Id==1?edited.hfAccountNumber:accNum}
                            onChange={v => this.updateAttribute("hfAccountNumber", v)}
                            readOnly={(!!edited.payTo && edited.payTo==1 && !ro)?false:true}
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
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : []
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ validateClaimCode }, dispatch);
};

export default withModulesManager(
    injectIntl(
        connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(BankInformation))
        )
    )
)
