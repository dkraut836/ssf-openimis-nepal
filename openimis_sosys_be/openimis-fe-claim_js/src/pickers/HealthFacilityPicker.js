import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchHealthFacilityPicker } from "../actions";
import _debounce from "lodash/debounce";

class HealthFacilityPicker extends Component {

    state = {
        diagnoses: [],
        hospitals:null
    }

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-claim", "cacheHospitals", true);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "HealthFacilityPicker.selectThreshold", 10);
    }

    componentDidMount() {            
        if (!this.props.fetchedHospitals) {
            // prevent loading multiple times the cache when component is
            // several times on tha page
            setTimeout(
                () => {
                    !this.props.fetchingHospitals && this.props.fetchHealthFacilityPicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
    }

   
    
    formatSuggestion = a => !a ? "" : `${a.name}`;
    getSuggestions = () =>{ this.props.modulesManager.getConf("fe-claim", "hospitalsMinCharLookup", 2) &&
        this.props.fetchHealthFacilityPicker(this.props.modulesManager)
    };
    

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-claim", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, hospitals, withLabel = true, label, value, reset, readOnly = false, required = false,
            withNull = false, nullLabel = null } = this.props;
        return (
            <React.Fragment>
                <AutoSuggestion
                module="claim"
                items={hospitals}
                label={!!withLabel && (label || formatMessage(intl, "claim", "Hospital Name"))}
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
                nullLabel={nullLabel || formatMessage(intl, "claim", "claim.HealthFacilityPicker.null")}
            />
            
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    hospitals: state.claim.hospitals,
    fetchingHospitals: state.claim.fetchingHospitals,
    fetchedHospitals: state.claim.fetchedHospitals,
    errorHospitals: state.claim.errorHospitals,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacilityPicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
withModulesManager(HealthFacilityPicker)));