import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CheckIcon from "@material-ui/icons/Check"
import ReplayIcon from "@material-ui/icons/Replay"
import PrintIcon from "@material-ui/icons/ListAlt";
import AttachIcon from "@material-ui/icons/AttachFile";
import {
    Contributions, ProgressOrError, Form, PublishedComponent,
    withModulesManager, withHistory, journalize, toISODate,
    formatMessage, formatMessageWithValues,
} from "@openimis/fe-core";
import { fetchClaim, claimHealthFacilitySet, print, generate } from "../actions";
import moment from "moment";
import _ from "lodash";

import ClaimMasterPanel from "./ClaimMasterPanel";
import ClaimChildPanel from "./ClaimChildPanel";
import ClaimFeedbackPanel from "./ClaimFeedbackPanel";
import ClaimMasterPanelMedical from "./ClaimMasterPanelMedical";
import EmployerReview from './EmployerReview';
import EmployerDetail from './EmployerDetail';

import Master from "./Master";
import ClaimApprove from "./ClaimApprove";
import { RIGHT_ADD, RIGHT_LOAD, RIGHT_PRINT } from "../constants";
import BankInformation from "./BankInformation";


const CLAIM_FORM_CONTRIBUTION_KEY = "claim.ClaimForm";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    item: theme.paper.item,
});


class ClaimServicesPanel extends Component {
    render() {
        return <ClaimChildPanel {...this.props} type="service" picker="medical.ServicePicker" />
    }
}

class ClaimItemsPanel extends Component {
    render() {
        return <ClaimChildPanel {...this.props} type="item" picker="medical.ItemPicker" />
    }
}

class BankInformationPanel extends Component{
    render(){
        return <BankInformation {...this.props} edited={this.props.edited} onEditedChanged={this.props.onEditedChanged} />
    }
}


class EmployerReviewPanel extends Component {
    render() {
        return (
        <React.Fragment>
            {this.props.forReview && this.props.edited.status>4 &&
                <EmployerReview {...this.props} recommenders={this.props.recommenders} edited={this.props.edited} onEditedChanged={this.props.onEditedChanged} />
            }
        </React.Fragment>)
    }
}

class ClaimApprovePanel extends Component {
    render() {
        return (
        <React.Fragment>
            {(this.props.forReview && this.props.edited.status>=6) &&
                <ClaimApprove {...this.props} edited={this.props.edited} claim={this.props.claim} onEditedChanged={this.props.onEditedChanged} />
            }
        </React.Fragment>)
    }
}


class ClaimForm extends Component {
    state = {
        lockNew: false,
        reset: 0,
        update: 0,
        claim_uuid: null,
        claim: this._newClaim(),
        newClaim: true,
        printParam: null,
        attachmentsClaim: null,
        forcedDirty: false,
        openAcc:false
    }

    constructor(props) {
        super(props);
        this.canSaveClaimWithoutServiceNorItem = props.modulesManager.getConf("fe-claim", "canSaveClaimWithoutServiceNorItem", true);
        this.claimAttachments = props.modulesManager.getConf("fe-claim", "claimAttachments", true);
    }

    _newClaim() {
        let claim = {};
        claim.healthFacility = this.state && this.state.claim ? this.state.claim.healthFacility : this.props.claimHealthFacility;
        claim.hfBank = this.state && this.state.claim ? this.state.claim.hfBank : this.props.hfBank;
        claim.hfBranch = this.state && this.state.claim ? this.state.claim.hfBranch : this.props.hfBranch;
        claim.hfAccountName = this.state && this.state.claim ? this.state.claim.hfAccountName : this.props.hfAccountName;
        claim.hfAccountNumber = this.state && this.state.claim ? this.state.claim.hfAccountNumber : this.props.hfAccountNumber;
        claim.code = this.state && this.state.claim ? this.state.claim.code : this.props.code;
        claim.admin = this.state && this.state.claim ? this.state.claim.admin : this.props.claimAdmin;
        claim.status = this.props.modulesManager.getConf("fe-claim", "newClaim.status", 2);
        claim.dateClaimed = toISODate(moment().toDate());
        claim.dateFrom = toISODate(moment().toDate());
        claim.visitType = this.props.modulesManager.getConf("fe-claim", "newClaim.visitType", 'O');
        claim.jsonExt = {};
        return claim;
    }

    componentDidMount() {
        document.title = formatMessageWithValues(this.props.intl, "claim", "claim.edit.page.title", { code: "" })
        if (!!this.props.claimHealthFacility) {
            this.props.claimHealthFacilitySet(this.props.claimHealthFacility)
        }
        if (this.props.claim_uuid) {
            this.setState(
                { claim_uuid: this.props.claim_uuid },
                e => this.props.fetchClaim(
                    this.props.modulesManager,
                    this.props.claim_uuid,
                    null,
                    this.props.forFeedback,
                    this.props.claim
                )
            )
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.claim.code !== this.state.claim.code) {
            document.title = formatMessageWithValues(this.props.intl, "claim", "claim.edit.page.title", { code: this.state.claim.code })
        }
        if (prevProps.fetchedClaim !== this.props.fetchedClaim && !!this.props.fetchedClaim) {
            var claim = this.props.claim;
            claim.jsonExt = !!claim.jsonExt ? JSON.parse(claim.jsonExt) : {};
            this.setState(
                { claim, claim_uuid: this.props.claim.uuid, lockNew: false, newClaim: false },
                this.props.claimHealthFacilitySet(this.props.claim.healthFacility)
            );
        } else if (prevProps.claim_uuid && !this.props.claim_uuid) {
            document.title = formatMessageWithValues(this.props.intl, "claim", "claim.edit.page.title", { code: "" })
            this.setState({ claim: this._newClaim(), newClaim: true, lockNew: false, claim_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        } else if (!prevProps.generating && !!this.props.generating) {
            this.props.generate(this.state.printParam)
        }
    }

    _add = () => {
        this.setState(
            {
                claim: this._newClaim(),
                newClaim: true,
                lockNew: false,
                reset: this.state.reset + 1,
            },
            e => {
                this.props.add();
                this.forceUpdate();
            }
        )
    }

    canSaveDetail = (d, type) => {
        if (!d[type]) return false;
        if (d.qtyProvided === null || d.qtyProvided === undefined || d.qtyProvided === "") return false;
        if (d.priceAsked === null || d.priceAsked === undefined || d.priceAsked === "") return false;
        return true;
    }

    canSave = (forFeedback) => {

        if (!this.state.claim.healthFacility) return false;
        if (!this.state.claim.insuree) return false;
        if (!this.state.claim.admin) return false;
        if((!!this.state.claim.product && this.state.claim.product.code==="SSF0002") || (!!this.props.pickerr && this.props.pickerr.code)==="SSF0002"){
            if (!this.state.claim.employer) return false;
        }
        if (!this.state.claim.dateClaimed) return false;
        if (!this.state.claim.hfBank) return false;
        if (!this.state.claim.dateFrom) return false;
        if (this.state.claim.dateClaimed < this.state.claim.dateFrom) return false;
        if (!!this.state.claim.dateTo && this.state.claim.dateFrom > this.state.claim.dateTo) return false;
        if (!this.state.claim.icd) return false;
        if (!forFeedback) {
            if (!this.state.claim.items && !this.state.claim.services) return !!this.canSaveClaimWithoutServiceNorItem
            //if there are items or services, they have to be complete
            let items = [];
            if (!!this.state.claim.items) {
                items = [...this.state.claim.items];
                if (!this.props.forReview) items.pop();
                if (items.length && items.filter(i => !this.canSaveDetail(i, 'item')).length) {
                    return false;
                }
            }
            let services = [];
            if (!!this.state.claim.services) {
                services = [...this.state.claim.services];
                if (!this.props.forReview) services.pop();
                if (services.length && services.filter(s => !this.canSaveDetail(s, 'service')).length) {
                    return false;
                }
            }
            if (!items.length && !services.length) return !!this.canSaveClaimWithoutServiceNorItem;
        }
        return true;
    }

    reload = () => {
        this.props.fetchClaim(
            this.props.modulesManager,
            this.state.claim_uuid,
            this.state.claim.code,
            this.props.forFeedback,
            this.props.claim
        );
    }

    onEditedChanged = claim => {
        this.setState({ claim, newClaim: false })
    }

    _save = (claim) => {
        this.setState(
            { lockNew: !claim.uuid }, // avoid duplicates
            e => this.props.save(claim))
    }

    print = (claimUuid) => {
        this.setState(
            { printParam: claimUuid },
            e => this.props.print()
        )
    }

    _deliverReview = (claim) => {
        this.setState(
            { lockNew: !claim.uuid }, // avoid duplicates submissions
            e => this.props.deliverReview(claim))
    }

    render() {
        console.log('hereeee', ((!!this.props.pickerr && this.props.pickerr.code=="SSF0002")
        || (!!this.state.claim.product && this.state.claim.product.code=="SSF0002"))?
        "true":"false")
        let openAcc=(
            ((!!this.props.pickerr && this.props.pickerr.code=="SSF0002")
            || (!!this.state.claim.product && this.state.claim.product.code=="SSF0002"))?
            "true":"false")

        const { rights, fetchingClaim, fetchedClaim, errorClaim, add, save, back,
            forReview = false, forFeedback = false, } = this.props;
        const { claim, claim_uuid, lockNew } = this.state;
        // let readOnly = lockNew ||
        //     (!forReview && !forFeedback && claim.status !== 2) ||
        //     (forReview && (claim.reviewStatus >= 8 || claim.status > 3)) ||
        //     (forFeedback && claim.status >3) ||
        //     !rights.filter(r => r === RIGHT_LOAD).length

        let readOnly = lockNew ||
        (!forReview && !forFeedback && (claim.status !== 2 )) ||
        (forReview && (claim.reviewStatus >= 8 || (claim.status !== 6 && claim.status !== 9))) ||
        (forFeedback && (claim.status !== 6)) ||
        !rights.filter(r => r === RIGHT_LOAD).length
        var actions = [{
            doIt: e => this.reload(claim_uuid),
            icon: <ReplayIcon />,
            onlyIfDirty: !readOnly
        }]
        if (!!claim_uuid && rights.includes(RIGHT_PRINT)) {
            actions.push({
                doIt: e => this.print(claim_uuid),
                icon: <PrintIcon />,
                onlyIfNotDirty: true
            })
        }
        if (!!this.claimAttachments && (!readOnly || claim.attachmentsCount > 0)) {
            actions.push({
                doIt: e => this.setState({ attachmentsClaim: claim }),
                icon: <AttachIcon />
            })
        }
        return (
            <Fragment>
                <ProgressOrError progress={fetchingClaim} error={errorClaim} />
                {(!!fetchedClaim || !claim_uuid) && (
                    <Fragment>
                        <PublishedComponent id="claim.AttachmentsDialog"
                            readOnly={!rights.includes(RIGHT_ADD) || readOnly}
                            //readOnly={claim.status!=2?true:false}
                            claim={this.state.attachmentsClaim}
                            edited={this.state.claim}
                            close={e => this.setState({ attachmentsClaim: null })}
                            onUpdated={() => this.setState({ forcedDirty: true })}
                        />
                        {openAcc==="true"?
                        <Form
                        module="claim"
                        edited_id={claim_uuid}
                        edited={this.state.claim}
                        reset={this.state.reset}
                        update={this.state.update}
                        title="edit.title"
                        titleParams={{ code: this.state.claim.code }}
                        back={back}
                        forcedDirty={this.state.forcedDirty}
                        add={!!add && !this.state.newClaim ? this._add : null}
                        save={!!save ? this._save : null}
                        fab={forReview && !readOnly && this.state.claim.reviewStatus < 8 && (<CheckIcon />)}
                        fabAction={this._deliverReview}
                        fabTooltip={formatMessage(this.props.intl, "claim", "claim.Review.deliverReview.fab.tooltip")}
                        canSave={e => this.canSave(forFeedback)}
                        reload={(claim_uuid || readOnly) && this.reload}
                        actions={actions}
                        readOnly={readOnly}
                        forReview={forReview}
                        roReview={forReview && this.state.claim.reviewStatus >= 8}
                        forFeedback={forFeedback}
                        HeadPanel={ClaimMasterPanel}
                        Panels={!!forFeedback ?
                            [ClaimFeedbackPanel] :
                            [
                                BankInformationPanel,
                                Master,
                                ClaimServicesPanel,
                                ClaimItemsPanel,
                                EmployerReviewPanel,
                                ClaimApprovePanel


                            ]}
                        onEditedChanged={this.onEditedChanged}
                    /> : <Form
                    module="claim"
                    edited_id={claim_uuid}
                    edited={this.state.claim}
                    reset={this.state.reset}
                    update={this.state.update}
                    title="edit.title"
                    titleParams={{ code: this.state.claim.code }}
                    back={back}
                    forcedDirty={this.state.forcedDirty}
                    add={!!add && !this.state.newClaim ? this._add : null}
                    save={!!save ? this._save : null}
                    fab={forReview && !readOnly && this.state.claim.reviewStatus < 8 && (<CheckIcon />)}
                    fabAction={this._deliverReview}
                    fabTooltip={formatMessage(this.props.intl, "claim", "claim.Review.deliverReview.fab.tooltip")}
                    canSave={e => this.canSave(forFeedback)}
                    reload={(claim_uuid || readOnly) && this.reload}
                    actions={actions}
                    readOnly={readOnly}
                    forReview={forReview}
                    roReview={forReview && this.state.claim.reviewStatus >= 8}
                    forFeedback={forFeedback}
                    HeadPanel={ClaimMasterPanelMedical}
                    Panels={!!forFeedback ?
                        [ClaimFeedbackPanel] :
                        [
                            BankInformationPanel,
                            ClaimServicesPanel,
                            ClaimItemsPanel,
                            ClaimApprovePanel

                        ]}
                    onEditedChanged={this.onEditedChanged}
                />
                    }

                        {/* <Contributions contributionKey={CLAIM_FORM_CONTRIBUTION_KEY} /> */}
                        </Fragment>
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
    claim: state.claim.claim,
    fetchingClaim: state.claim.fetchingClaim,
    fetchedClaim: state.claim.fetchedClaim,
    errorClaim: state.claim.errorClaim,
    submittingMutation: state.claim.submittingMutation,
    mutation: state.claim.mutation,
    claimAdmin: state.claim.claimAdmin,
    claimHealthFacility: state.claim.claimHealthFacility,
    generating: state.claim.generating,
    recommenders:state.claim.recommenders,
    pickerr:state.claim.pickerr
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchClaim, claimHealthFacilitySet, journalize, print, generate }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(
        withStyles(styles)(ClaimForm)
    ))))
);
