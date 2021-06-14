import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import {
    formatMessage, ControlledField, withModulesManager,
    FormPanel, Table, TextInput, PublishedComponent
} from "@openimis/fe-core";
import { Grid,Paper, FormLabel, FormGroup, Checkbox,IconButton, FormControl,FormControlLabel,RadioGroup  } from "@material-ui/core";
import _ from "lodash";
import {  validateClaimCode } from "../actions";
import _debounce from "lodash/debounce";
import CapabilityRecPicker from "../pickers/CapabilityRecPicker";

import AttachIcon from "@material-ui/icons/AttachFile";
import AttachmentDialog from "./AttachmentsDialog";
import CapacityPicker from '../pickers/CapacityPicker';
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

class ClaimApprove extends FormPanel {
    constructor(props){        
        super(props);
        this.claimAttachments = props.modulesManager.getConf("fe-claim", "claimAttachments", true);
        this.state={
            checked:false,
            attachment:'',
            checkstatus:'',
            attachmentsClaim: null,
            forcedDirty: false,
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

    fileSelected = (f) => {
        
        const file = f.target.files[0];
            let attachment =this.state.attachment
        this.setState({ attachment },
            e => {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = loaded => {
                    
                    this.updateAttribute("checkAttachment", loaded.target.result);
                }
                
            })
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

    onChangeClaimStatus=(e)=> {
        
        this.changeForward();
       this.updateAttribute([e.target.name], this.state.checkStatus?"6":"9");
    }

    onClick=(e)=> {    
        this.changeCheck();
       this.updateAttribute([e.target.name], this.state.checked?"false":"true");
    }

    render() {
        const { intl, classes, edited,readOnly = false, forReview, roReview = false, forFeedback,claim } = this.props;       
    
        
        let ro;
    if (this.props.edited.reviewStatus===8){
        ro = readOnly || !!forReview || !!forFeedback 
    }
    var actions = [{
        doIt: e => this.reload(edited.uuid),
        icon: <AttachIcon />
    }]

    if (!!this.claimAttachments) {
        actions.push({
            doIt: e => this.setState({ attachmentsClaim: edited }),
            icon: <AttachIcon />
        })
    }
        
        return (
            <React.Fragment>
                <br/>   
                 <Paper className={classes.paper}>
                    <Grid container>
                    <span className={classes.border}>Approver </span>
                    <Grid container>
                    <ControlledField module="claim" id="Claim.checkRemarks" field={ 
                        <Grid item xs={4} className={classes.item}>                            
                            <TextInput
                                module="claim"
                                label="Check Remarks" 
                                value={edited.checkRemarks}
                                onChange={v => this.updateAttribute("checkRemarks", v)}
                                readOnly={ro}
                            /> 
                        </Grid>
                    } />

                {/* <ControlledField module="claim" id="Claim.attachment" field={
                    <Grid item xs={3} className={classes.item}>
                        <FormLabel readOnly={ro}>Check Attachment</FormLabel>                      
                        <IconButton onClick={e => this.setState({ attachmentsClaim: edited })} > <AttachIcon /></IconButton >
                          <PublishedComponent id="claim.CheckAttachment"
                            claim={this.state.attachmentsClaim}
                            close={e => this.setState({ attachmentsClaim: null })} 
                            readOnly={ro}
                            disabled={ro}
                        />
                    </Grid>
                } />   */}

                   
                {this.props.edited.product.code==="SSF0002" &&
                <ControlledField module="claim" id="Claim.capability" field={
                    <Grid item xs={2} className={classes.item}>
                        <CapacityPicker
                        value={edited.capability}
                        onChange={(v, s) => this.updateAttribute("capability", v)}
                        readOnly={ro}
                        />
                    </Grid>
                } />}
                    {/* <ControlledField module="claim" id="Claim.schemeAppId" field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="claim"
                                label="scheme App" 
                                value="2"
                                onChange={v => this.updateAttribute("schemeAppId", "2")}
                            /> 
                        </Grid>
                    } />  */}
                </Grid>
                </Grid>   
                </Paper>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
   
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ validateClaimCode }, dispatch);
};

export default withModulesManager(
    injectIntl(
        connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(ClaimApprove))
        )
    )
)
