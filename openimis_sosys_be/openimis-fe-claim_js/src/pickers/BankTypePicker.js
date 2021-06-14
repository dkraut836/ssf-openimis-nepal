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
        this.cache = props.modulesManager.getConf("fe-claim", "cacheEmployers", true);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "BankTypePicker.selectThreshold", 10);
    }

    componentDidMount() {       
         const { claim } = this.props;    
         if (!!claim && !!claim.hfBank) {
            this.props.fetchBankTypePicker(this.props.modulesManager,claim);
        }
        

        if (this.cache) {
            if (!this.props.employers) {
                setTimeout(
                    () => {
                    },
                    Math.floor(Math.random() * 300)
                );
            } else {
                this.setState({ employers: this.props.employers })
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { claim } = this.props;  
        if (( !!claim && !!claim.hfBank ) &&
            (!prevProps.claim || !prevProps.claim.hfBank ||prevProps.claim.hfBank.BankId !== claim.hfBank.BankId)
        ) {
            this.props.fetchBankTypePicker(this.props.modulesManager, claim);
        }
        if (!_.isEqual(prevProps.employers, this.props.employers)) {
            this.setState({ employers: this.props.employers })
            
        }
    }
  
    
    formatSuggestion = a => !a ? "" : `${a.BranchName}`;

    getSuggestions = () =>{ this.props.modulesManager.getConf("fe-claim", "employersMinCharLookup", 2) &&
        this.props.fetchBankTypePicker(this.props.modulesManager)
    };
    

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-claim", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, hfBranch, withLabel = true, label, value, reset, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim } = this.props;
            
        return <AutoSuggestion
            module="claim"
            items={hfBranch}
            label={!!withLabel && (label || formatMessage(intl, "claim", "hfBranch"))}
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
            nullLabel={nullLabel || formatMessage(intl, "claim", "claim.BankTypePicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    hfBranch: state.claim.bankType,
    fetching: state.claim.fetchingBankType
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchBankTypePicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
withModulesManager(BankTypePicker)));