import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";
import _ from "lodash";
import { fetchClaimPicker } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager } from "@openimis/fe-core";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class ClaimPicker extends Component {
    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "claimPicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.fetchedClaimPickers) {
            setTimeout(
                () => {
                    !this.props.fetchingClaimPickers && this.props.fetchClaimPicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
        
    }

    formatSuggestion = a => !a ? "" : `${a.name}`;

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const {
            intl, value, reset, claimPickers,
            fetchingClaimPickers, fetchedClaimPickers, errorClaimPickers,
            withLabel = true, label, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim
        } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingClaimPickers} error={errorClaimPickers} />
                {fetchedClaimPickers && (
                    <AutoSuggestion
                        module="claim"
                        items={claimPickers}
                        label={!!withLabel && (label || formatMessage(intl, "claim", "claimPicker.label"))}
                        getSuggestions={this.claimPickers}
                        getSuggestionValue={this.formatSuggestion}
                        onSuggestionSelected={this.onSuggestionSelected}
                        value={value}
                        reset={reset}
                        readOnly={readOnly}
                        required={required}
                        selectThreshold={this.selectThreshold}
                        withNull={withNull}
                        nullLabel={nullLabel || formatMessage(intl, "claim", "claim.claimPicker.null")}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    claimPickers: state.claim.claimPickers,
    fetchingClaimPickers: state.claim.fetchingClaimPickers,
    fetchedClaimPickers: state.claim.fetchedClaimPickers,
    errorClaimPickers: state.claim.errorClaimPickers,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchClaimPicker }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(ClaimPicker))))
);