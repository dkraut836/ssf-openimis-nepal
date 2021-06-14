import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";
import _ from "lodash";
import { fetchAccidentalPlacePicker } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager } from "@openimis/fe-core";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class AccidentialPlacePicker extends Component {
    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "AccidentialPlacePicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.fetchedAccidentSchemes) {
            setTimeout(
                () => {
                    !this.props.fetchingAccidentSchemes && this.props.fetchAccidentalPlacePicker(this.props.modulesManager, this.props.claim)
                },
                Math.floor(Math.random() * 300)
            );
        }
        
    }

    formatSuggestion = a => !a ? "" : `${a.schName}`;

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const {
            intl, value, reset, accidentSchemes,
            fetchingAccidentSchemes, fetchedAccidentSchemes, errorAccidentSchemes,
            withLabel = true, label, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim
        } = this.props;
        // console.log('bankss', claim.healthFacility!=null?claim.healthFacility.bankDetails[0].bankId.BankName:"")
        return (
            <Fragment>
                <ProgressOrError progress={fetchingAccidentSchemes} error={errorAccidentSchemes} />
                {fetchedAccidentSchemes && (
                    <AutoSuggestion
                        module="claim"
                        items={accidentSchemes}
                        label={!!withLabel && (label || formatMessage(intl, "claim", "AccidentialPlacePicker.label"))}
                        getSuggestions={this.banks}
                        getSuggestionValue={this.formatSuggestion}
                        onSuggestionSelected={this.onSuggestionSelected}
                        value={value}
                        reset={reset}
                        readOnly={readOnly}
                        required={required}
                        selectThreshold={this.selectThreshold}
                        withNull={withNull}
                        nullLabel={nullLabel || formatMessage(intl, "claim", "claim.AccidentialPlacePicker.null")}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    accidentSchemes: state.claim.accidentSchemes,
    fetchingAccidentSchemes: state.claim.fetchingAccidentSchemes,
    fetchedAccidentSchemes: state.claim.fetchedAccidentSchemes,
    errorAccidentSchemes: state.claim.errorAccidentSchemes,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchAccidentalPlacePicker }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(AccidentialPlacePicker))))
);