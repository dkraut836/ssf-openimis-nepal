import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchBankTypePicker } from "../actions";
import _debounce from "lodash/debounce";

class BankTypePicker extends Component {

    state = {
        diagnoses: [],
        employers:null
    }

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-location", "cacheEmployers", true);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "BankTypePicker.selectThreshold", 10);
    }

    componentDidMount() {       
         const { location } = this.props;    
         console.log("loks",this.props.location)
        if (!!location && !!location.hfBank) {
            this.props.fetchBankTypePicker(this.props.modulesManager,location);
        }        
   }
           

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { location } = this.props;  
        console.log("loks",(( !!location && !!location.bankDetails ) &&
        (!prevProps.location || !prevProps.location.bankDetails ||prevProps.location.bankDetails.BankId !== location.bankDetails.BankId)
    ))
        if (( !!location && !!location.bankDetails ) &&
            (!prevProps.location || !prevProps.location.bankDetails ||prevProps.location.bankDetails.BankId !== location.bankDetails.BankId)
        ) {
            this.props.fetchBankTypePicker(this.props.modulesManager, location);
        }
       
    }
  
    
    formatSuggestion = a => !a ? "" : `${a.BranchName}`;

    getSuggestions = () =>{ this.props.modulesManager.getConf("fe-location", "employersMinCharLookup", 2) &&
        this.props.fetchBankTypePicker(this.props.modulesManager)
    };
    

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, hfBranch, withLabel = true, label, value, reset, readOnly = false, required = false,
            withNull = false, nullLabel = null, location } = this.props;
            console.log("mmm",this.props.location)
        return <AutoSuggestion
            module="location"
            items={hfBranch}
            label={!!withLabel && (label || formatMessage(intl, "location", "hfBranch"))}
            lookup={this.formatSuggestion}
            getSuggestionValue={this.formatSuggestion}
            renderSuggestion={a => <span>{this.formatSuggestion(a)}</span>}
            onSuggestionSelected={this.onSuggestionSelected}            
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            id={this.props.id}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "location", "location.BankTypePicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    hfBranch: state.loc.bankType,
    fetching: state.loc.fetchingBankType
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchBankTypePicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
withModulesManager(BankTypePicker)));