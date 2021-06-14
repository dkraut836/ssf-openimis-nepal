import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import {
    formatMessage, ControlledField, withModulesManager,
    FormPanel, TextInput, PublishedComponent
} from "@openimis/fe-core";
import { Grid,Paper, Radio, FormLabel, FormGroup, Checkbox,IconButton, FormControl,FormControlLabel,RadioGroup  } from "@material-ui/core";
import _ from "lodash";
import _debounce from "lodash/debounce";
import BankNamePicker from "../pickers/BankNamePicker";
import BankTypePicker from "../pickers/BankTypePicker";
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

class BankDetails extends FormPanel {
    constructor(props){
        super(props);
        this.state={
            hide:true
        }
    }
    updateCatchments = (label, value) => {
        let catchments = !!this.props.edited.bankDetails ? [...this.props.edited.bankDetails] : [];        
        if (catchments.length == 0) {
            let temppush
                if ("bankId" == label) {
                    catchments.push({
                    bankId : value
                    })
                    return catchments;
                    
                }
                if ("branchId" == label) {
                    temppush = {
                    branchId : value
                    }
                }
                if ("id" == label) {
                    temppush = {
                        id : value
                    }
                }
                if ("accountNumber" == label) {
                    temppush = {
                        accountName : value
                    }
                }
                if ("accountName" == label) {
                    temppush = {
                    accountName : value
                }
            }
            catchments.push(temppush)
            return catchments;
        }
        for (let idx in catchments) {
            if ("bankId" === label) {
                catchments[idx].bankId = value;
                return catchments;
            }
            if ("branchId" === label) {
                catchments[idx].branchId = value;
                return catchments;
            }
            if ("id" === label) {
                    catchments[idx].id = value;
                    return catchments;
            }
            if ("accountNumber" === label) {
                    catchments[idx].accountNumber = value;
                    return catchments;
            }
            if ("accountName" === label) {
                catchments[idx].accountName = value;
                return catchments;
            }
        }
        
    }

    onBankDetails = (l, v) => {
        let catchments = this.updateCatchments(l, v)
        console.log("ppp1",catchments)
        let edited = { ...this.props.edited }
        edited.bankDetails = catchments;
        this.props.onEditedChanged(edited);
    }

    // onBankDetails = (l, v) =>{
    //     this.updateAttribute(l,v)
    // }

    render() {
        const { intl, classes, edited,readOnly = false, forReview, roReview = false, forFeedback } = this.props;
    console.log('bankks', edited)
    let header = formatMessage(intl, "location", "Bank Information")
    let ro = readOnly || !!forReview || !!forFeedback;
        return (
            <React.Fragment>
                 <Paper className={classes.paper}>
            <Grid container>
                    <span className={classes.border}>{header}</span>
            {!this.state.hide &&
                <ControlledField module="location" id="Location.BankDetailsId" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="location"
                            label="BankDetailsId"
                            value={edited.bankDetails==undefined?"": edited.bankDetails[0] == undefined?"":edited.bankDetails[0].id}
                            onChange={v => this.onBankDetails("id", v)}
                            readOnly={ro}
                        />
                    </Grid> 
                } />}
                
                <ControlledField module="location" id="Location.hfBank" field={
                    <Grid item xs={3} className={classes.item}>
                        <BankNamePicker
                            location={edited}
                            label="Bank Name"
                            value={edited.bankDetails==undefined?"": edited.bankDetails[0] == undefined?"":edited.bankDetails[0].bankId}
                            onChange={(v, s) => this.onBankDetails("bankId", v)}
                            readOnly={ro}
                            required
                        />
                    </Grid> 
                } />  

                 <ControlledField module="location" id="Location.hfBranch" field={
                    <Grid item xs={3} className={classes.item}>
                        <BankTypePicker
                            label="Branch Name"
                            location={edited}
                            value={edited.bankDetails==undefined?"": edited.bankDetails[0] == undefined?"":edited.bankDetails[0].branchId}
                            onChange={(v, s) => this.onBankDetails("branchId", v)}
                            readOnly={ro}
                            required
                        />
                    </Grid>
                } />              

                <ControlledField module="location" id="Claim.hfAccountName" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location"
                            label="Account Name"
                            value={edited.bankDetails==undefined?"": edited.bankDetails[0] == undefined?"":edited.bankDetails[0].accountName}
                            onChange={v => this.onBankDetails("accountName", v)}
                            readOnly={ro}
                            required={true}
                        />
                    </Grid>
                } />

                <ControlledField module="location" id="Claim.hfAccountNumber" field={
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="location"
                            label="Account No"
                            value={edited.bankDetails==undefined?"": edited.bankDetails[0] == undefined?"":edited.bankDetails[0].accountNumber}
                            onChange={v => this.onBankDetails("accountNumber", v)}
                            readOnly={ro}
                            required={true}
                        />
                    </Grid>
                } />          
            </Grid>
        </Paper>
        </React.Fragment>
        )
    }
}


export default withModulesManager(
    injectIntl((withTheme(withStyles(styles)(BankDetails))
        )
    )
)
