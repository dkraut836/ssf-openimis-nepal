import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";
import _ from "lodash";
import { checkAttachmentPicker } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager } from "@openimis/fe-core";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class CheckAttachmentPicker extends Component {
    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "CheckAttachmentPicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.fetchedCheckAttachment) {
            setTimeout(
                () => {
                    if(this.props.claim.status>5){
                        !this.props.fetchingCheckAttachment && this.props.checkAttachmentPicker(this.props.modulesManager, "R")
                    }
                    else{
                        !this.props.fetchingCheckAttachment && this.props.checkAttachmentPicker(this.props.modulesManager, "A")
                    }
                    
                },
                Math.floor(Math.random() * 300)
            );
        }
        
    }

    formatSuggestion = a => {
        return !a ? "" : `${a.DocName}`;
    }

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const {
            intl, value, reset, checkAttachments,
            fetchingCheckAttachment, fetchedCheckAttachment, errorCheckAttachment,
            withLabel = true, label, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim
        } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingCheckAttachment} error={errorCheckAttachment} />
                {fetchedCheckAttachment && (
                    <AutoSuggestion
                        module="claim"
                        items={checkAttachments}
                        getSuggestions={this.checkAttachments}
                        getSuggestionValue={this.formatSuggestion}
                        onSuggestionSelected={this.onSuggestionSelected}
                        value={value}
                        reset={reset}
                        readOnly={readOnly}
                        required={required}
                        selectThreshold={this.selectThreshold}
                        withNull={withNull}
                        nullLabel={nullLabel || formatMessage(intl, "claim", "claim.CheckAttachmentPicker.null")}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    checkAttachments: state.claim.checkAttachments,
    fetchingCheckAttachment: state.claim.fetchingCheckAttachment,
    fetchedCheckAttachment: state.claim.fetchedCheckAttachment,
    errorCheckAttachment: state.claim.errorCheckAttachment,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ checkAttachmentPicker }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CheckAttachmentPicker))))
);