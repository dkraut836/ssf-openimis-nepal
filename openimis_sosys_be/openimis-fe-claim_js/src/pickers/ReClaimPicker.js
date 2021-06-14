import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _debounce from "lodash/debounce";
import _ from "lodash";
import { reClaimPicker } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager } from "@openimis/fe-core";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class ReClaimPicker extends Component {
    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-claim", "ReClaimBankNamePicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.fetchedReclaims) {
            setTimeout(
                () => {
                if(this.props.reclaim.insuree && this.props.reclaim.healthFacility)
                    !this.props.fetchingReclaims && this.props.reClaimPicker(this.props.reclaim.insuree.chfId,this.props.reclaim.healthFacility.code,!!this.props.pickerr?this.props.pickerr.code:this.props.reclaim.product.code)
                },
                Math.floor(Math.random() * 300)
            ); 
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { reclaim } = this.props;  
        if (( !!reclaim && !!reclaim.insuree ) &&
            (!prevProps.reclaim || !prevProps.reclaim.insuree ||prevProps.reclaim.insuree.chfId !== reclaim.insuree.chfId)
        ) {
            this.props.reClaimPicker(this.props.reclaim.insuree.chfId,this.props.reclaim.healthFacility.code,!!this.props.pickerr?this.props.pickerr.code:this.props.reclaim.product.code)
        }
        
    }

    formatSuggestion = a => !a ? "" : `${a.code}`;

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const {
            intl, value, reset, reclaims,
            fetchingReclaims, fetchedReclaims, errorReclaims,
            withLabel = true, label, readOnly = false, required = false,
            withNull = false, nullLabel = null, claim
        } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingReclaims} error={errorReclaims} />
                {(fetchedReclaims && reclaims.length>0) ? (
                    <AutoSuggestion
                        module="claim"
                        items={reclaims}
                        label={!!withLabel && (label || formatMessage(intl, "claim", "ReClaimPicker.label"))}
                        getSuggestions={this.reclaims}
                        getSuggestionValue={this.formatSuggestion}
                        onSuggestionSelected={this.onSuggestionSelected}
                        value={value}
                        reset={reset}
                        readOnly={readOnly}
                        required={required}
                        selectThreshold={this.selectThreshold}
                        withNull={withNull}
                        nullLabel={nullLabel || formatMessage(intl, "claim", "claim.ReClaimPicker.null")}
                    />
                ):"No Claim Found"}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    reclaims: state.claim.reclaims,
    fetchingReclaims: state.claim.fetchingReclaims,
    fetchedReclaims: state.claim.fetchedReclaims,
    errorReclaims: state.claim.errorReclaims,
    pickerr:state.claim.pickerr
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ reClaimPicker }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(ReClaimPicker))))
);
