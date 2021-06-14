import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { fetchInsureeFamily } from "../actions";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import { formatMessage, Contributions, ProgressOrError, Table, withModulesManager } from "@openimis/fe-core";

const INSUREE_FAMILY_SUMMARY_CONTRIBUTION_KEY = "insuree.InsureeFamilySummary";

const styles = theme => ({});

class InsureeFamilySummary extends Component {

    componentDidMount() {
        if (!!this.props.insuree) {
            this.props.fetchInsureeFamily(this.props.modulesManager, this.props.insuree.chfId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.insuree && !!this.props.insuree
            || !!prevProps.insuree && this.props.insuree && (
                prevProps.insuree.chfId == null
                || prevProps.insuree.chfId !== this.props.insuree.chfId
            )
        ) {
            this.props.fetchInsureeFamily(this.props.modulesManager, this.props.insuree.chfId);
        }
    }

    render() {
        const { intl, classes, insuree, fetchedFamilyMembers, fetchingFamilyMembers, familyMembers, errorFamilyMembers } = this.props;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingFamilyMembers} error={errorFamilyMembers} />
                {!!insuree && !!fetchedFamilyMembers && (
                    <Paper className={classes.paper}>
                        <Table
                            module="insuree"
                            header={formatMessage(intl, "insuree", "familySummary")}
                            headers={[
                                "familySummary.chfId",
                                "familySummary.name",
                                "familySummary.phone",
                            ]}
                            itemFormatters={[
                                i => i.chfId,
                                i => `${i.otherNames} ${i.lastName} ${i.head ? formatMessage(this.props.intl, "insuree", "familySummary.head"):  ""}`,
                                i => i.phone,
                            ]}
                            items={familyMembers}
                        />
                    </Paper>
                )}
                <Contributions contributionKey={INSUREE_FAMILY_SUMMARY_CONTRIBUTION_KEY} />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    insuree: state.insuree.insuree,
    fetchingFamilyMembers: state.insuree.fetchingFamilyMembers,
    fetchedFamilyMembers: state.insuree.fetchedFamilyMembers,
    familyMembers: state.insuree.familyMembers,
    errorFamilyMembers: state.insuree.errorFamilyMembers,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchInsureeFamily }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(
        withStyles(styles)(InsureeFamilySummary)
    )))
);
