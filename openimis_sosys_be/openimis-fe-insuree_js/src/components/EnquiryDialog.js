import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { Dialog, Button, DialogActions, DialogContent } from "@material-ui/core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Router } from "react-router-dom";
import { fetchInsuree,changeClaimDate } from "../actions";
import {
    formatMessage, formatMessageWithValues, Contributions, Error, ProgressOrError,
    withModulesManager, withHistory,toISODate,PublishedComponent
} from "@openimis/fe-core";
import InsureeSummary from "./InsureeSummary";
import moment from "moment";
import { Grid } from "@material-ui/core";
const INSUREE_ENQUIRY_DIALOG_CONTRIBUTION_KEY = "insuree.EnquiryDialog";

const styles = theme => ({
    width:{
        '& .MuiDialog-paperWidthLg':{
            maxWidth:'750px'
        }
    }
});

class EnquiryDialog extends Component {

    state = { 
        loading: false,
        claimDate:toISODate(moment().toDate())
        // claimDate:"2076.01.02"
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.chfid !== this.props.chfid || prevState.claimDate !== this.state.claimDate) {
            this.props.fetchInsuree(this.props.modulesManager, this.props.chfid);
        }
    }
    escFunction = event => {
        if (event.keyCode === 27) {
            this.props.onClose();
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }
    onEventDateChange =(v)=>{
        this.setState({ claimDate: v});
        this.props.changeClaimDate(v);
    }
    render() {
        const { intl, history, fetching, fetched, insuree, error, onClose , classes} = this.props;
        return (
            <Dialog maxWidth="lg" fullWidth={true} open={this.props.open} className={classes.width}>
                <DialogContent>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent id="core.DatePicker"
                            value={this.state.claimDate}
                            label="Event Date"
                            onChange={(v) => this.onEventDateChange(v)}
                            maxDate={moment().toDate()}
                        />
                    </Grid>
                    <ProgressOrError progress={fetching} error={error} />
                    {!!fetched && !insuree && (
                        <Error error={
                            {
                                code: formatMessage(intl, 'insuree', 'notFound'),
                                detail: formatMessageWithValues(intl, 'insuree', 'chfidNotFound', { chfid: this.props.chfid })
                            }
                        } />
                    )}
                    {!fetching && !!insuree && (
                        <Fragment>
                            <InsureeSummary modulesManager={this.props.modulesManager} insuree={insuree} />
                            <Router history={history}>
                                <Contributions contributionKey={INSUREE_ENQUIRY_DIALOG_CONTRIBUTION_KEY} />
                            </Router>
                        </Fragment>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        {formatMessage(intl, 'insuree', 'close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }  
}

const mapStateToProps = state => ({
    fetching: state.insuree.fetching,
    fetched: state.insuree.fetched,
    insuree: state.insuree.insuree,
    error: state.insuree.error
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchInsuree,changeClaimDate }, dispatch);
};

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(
        withStyles(styles)(EnquiryDialog)
    ))))
);