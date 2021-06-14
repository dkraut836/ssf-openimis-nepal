import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchEmployerPicker } from "../actions";
import _debounce from "lodash/debounce";

class ClaimEmployerPicker extends Component {

    state = {
        diagnoses: [],
        employers:null
    }

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-claim", "cacheEmployers", true);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "ClaimEmployerPicker.selectThreshold", 10);
    }
 
    componentDidMount() {       
         const { claim } = this.props;    
        if (!!claim && !!claim.insuree) {
            this.props.fetchEmployerPicker(claim);
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
        if (( !!claim && !!claim.insuree ) &&
            (!prevProps.claim || !prevProps.claim.insuree ||prevProps.claim.insuree.chfId !== claim.insuree.chfId)
        ) {
            this.props.fetchEmployerPicker(claim);
        }
        if (!_.isEqual(prevProps.employers, this.props.employers)) {
            this.setState({ employers: this.props.employers })
            
        }
    }
  
    
    formatSuggestion = s => !!s ?  (!!s.employer ?`${s.employer.EmployerNameNep}`:`${s.EmployerNameNep}` ) : "";

    bindData = s => !!s ?  (!!s.employer ?`${s.employer.ESsid}`:`${s.ESsid}` ) : "";
    getSuggestions = () =>{ this.props.modulesManager.getConf("fe-claim", "employersMinCharLookup", 2) &&
        this.props.fetchEmployerPicker(this.props.claim)
    };
    

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-claim", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, employers, withLabel = true, label, value, reset, readOnly = false, required = false,
            withNull = false, nullLabel = null, status } = this.props;
if(!!employers && employers.length==1){
}

        return (
            <React.Fragment>
                {status && 
                <AutoSuggestion
                module="claim"
                items={employers}
                label={!!withLabel && (label || formatMessage(intl, "claim", "employers"))}
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
                nullLabel={nullLabel || formatMessage(intl, "claim", "claim.ClaimEmployerPicker.null")}
            />}
            {!status  &&
            <AutoSuggestion
            module="claim"
            items={employers}
            label={!!withLabel && (label || formatMessage(intl, "claim", "employers"))}
            lookup={this.bindData}
            getSuggestionValue={this.bindData}
            renderSuggestion={a => <span>{this.bindData(a)}</span>}
            onSuggestionSelected={this.onSuggestionSelected}            
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            id={this.props.id}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "claim", "claim.ClaimEmployerPicker.null")}
        />}
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    employers: state.claim.employers,
    fetching: state.claim.fetchingEmployers
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchEmployerPicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
withModulesManager(ClaimEmployerPicker)));