import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";
import _ from "lodash";
import { fetchBankPicker } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager } from "@openimis/fe-core";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class BankNamePicker extends Component {
    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "BankNamePicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.fetchedBankName) {
            setTimeout(
                () => {
                    !this.props.fetchingBankName && this.props.fetchBankPicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
        
    }

    formatSuggestion = a => !a ? "" : `${a.BankName}`;

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const {
            intl, value, reset, banks,
            fetchingBankName, fetchedBankName, errorBankName,
            withLabel = true, label, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim
        } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingBankName} error={errorBankName} />
                {fetchedBankName && (
                    <AutoSuggestion
                        module="claim"
                        items={banks}
                        label={!!withLabel && (label || formatMessage(intl, "claim", "BankNamePicker.label"))}
                        getSuggestions={this.banks}
                        getSuggestionValue={this.formatSuggestion}
                        onSuggestionSelected={this.onSuggestionSelected}
                        value={value}
                        reset={reset}
                        readOnly={readOnly}
                        required={required}
                        selectThreshold={this.selectThreshold}
                        withNull={withNull}
                        nullLabel={nullLabel || formatMessage(intl, "claim", "claim.BankNamePicker.null")}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    banks: state.claim.banks,
    fetchingBankName: state.claim.fetchingBankName,
    fetchedBankName: state.claim.fetchedBankName,
    errorBankName: state.claim.errorBankName,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchBankPicker }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(BankNamePicker))))
);