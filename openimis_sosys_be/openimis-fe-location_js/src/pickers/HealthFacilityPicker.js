import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { fetchHealthFacilities } from "../actions";
import { formatMessage, AutoSuggestion, SelectInput, withModulesManager } from "@openimis/fe-core";
import { healthFacilityLabel } from "../utils";
import _ from "lodash";
import { TextField } from "@material-ui/core";

const styles = theme => ({
    textField: {
        width: "100%",
    },
});

class HealthFacilityPicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "HealthFacilityPicker.selectThreshold", 10);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.userHealthFacilityFullPath) {
            if (!_.isEqual(prevProps.region, this.props.region)) {
                this.props.fetchHealthFacilities(this.props.modulesManager, this.props.region, this.props.district, this.props.value);
            }
            if (!_.isEqual(prevProps.district, this.props.district)) {
                this.props.fetchHealthFacilities(this.props.modulesManager, this.props.region, this.props.district, this.props.value);
            }
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-location", "healthFacilitiesMinCharLookup", 2) &&
        this.props.fetchHealthFacilities(this.props.modulesManager, this.props.region, this.props.district, str);

    debouncedGetSuggestion = _.debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, healthFacilityLabel(v));

    render() {
        const { intl, classes, value, reset, userHealthFacilityFullPath, healthFacilities, withLabel = true, label,
            readOnly = false, required = false, withNull = true, nullLabel = null } = this.props;

        if (!!userHealthFacilityFullPath) {
            return <TextField
                label={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
                className={classes.textField}
                disabled
                value={healthFacilityLabel(userHealthFacilityFullPath)}
            />
        }
        return <AutoSuggestion
            module="location"
            items={healthFacilities}
            label={!!withLabel && (label || formatMessage(intl, "location", "HealthFacilityPicker.label"))}
            lookup={healthFacilityLabel}
            getSuggestions={this.debouncedGetSuggestion}
            renderSuggestion={a => <span>{healthFacilityLabel(a)}</span>}
            getSuggestionValue={healthFacilityLabel}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "location", "location.HealthFacilityPicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    userHealthFacilityFullPath: state.loc.userHealthFacilityFullPath,
    healthFacilities: state.loc.healthFacilities,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchHealthFacilities }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(HealthFacilityPicker)))));
